from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from typing import List

router = APIRouter(prefix="/api", tags=["pizza"])

# Det avancerede, kategoriserede metrik-katalog fra din Streamlit app
AVAILABLE_METRICS_MAP = {
    "Shooting": {
        "total goals_p90": "Goals",
        "xG_p90": "npxG",
        "total ontarget attempt_p90": "Shots On Target",
        "attempt_success_pct_p90": "On Target %"
    },
    "Passing": {
        "total assists_p90": "Assists",
        "xA_p90": "xA",
        "total att assist_p90": "Key Passes",
        "xT_pass_p90": "xT via Live Passes"
    },
    "Possession": {
        "total won contest_p90": "Successful Dribbles",
        "total contest_p90": "Dribble Attempts",
        "dribble_success_pct_p90": "Dribble Success %"
    },
    "Defending": {
        "tackle_success_pct_p90": "Tackles Won %",
        "aerial_success_pct_p90": "Aerials Won %",
        "duel_success_pct_p90": "Duels Won %",
        "total won tackle_p90": "Tackles Won"
    }
}

# Flad tilgængelig ordbog til hurtigt opslag på tværs af kategorier
FLAT_METRICS = {k: v for cat in AVAILABLE_METRICS_MAP.values() for k, v in cat.items()}

@router.get("/pizza/players")
def get_all_players():
    """Henter alle spillere sorteret alfabetisk"""
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        return []
    players = sorted(GLOBAL_DATASET['Player Name'].dropna().unique().tolist())
    return players

@router.get("/pizza/positions")
def get_all_positions():
    """Henter alle unikke positioner til sammenlignings-dropdownen"""
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        return []
    
    pos_column = 'Pos.' if 'Pos.' in GLOBAL_DATASET.columns else ('Position' if 'Position' in GLOBAL_DATASET.columns else None)
    if not pos_column:
        return []
        
    positions = sorted(GLOBAL_DATASET[pos_column].dropna().unique().tolist())
    return positions

@router.get("/pizza")
def get_pizza_data(
    player: str = Query(..., description="Navnet på målspilleren"),
    compare_pos: str = Query(..., description="Positionen der skal sammenlignes imod"),
    metrics: List[str] = Query(None, description="De valgte visningsnavne fra tjekboksene")
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom.")

    # Find den rigtige positionskolonne i dit CSV-ark
    pos_column = 'Pos.' if 'Pos.' in GLOBAL_DATASET.columns else ('Position' if 'Position' in GLOBAL_DATASET.columns else None)
    if not pos_column:
        raise HTTPException(status_code=500, detail="Positionskolonne ('Pos.' eller 'Position') mangler i CSV.")

    # Find spillerens række
    player_row = GLOBAL_DATASET[GLOBAL_DATASET['Player Name'].str.lower() == player.lower()]
    if player_row.empty:
        raise HTTPException(status_code=404, detail=f"Spilleren '{player}' blev ikke fundet.")
    
    target_player_data = player_row.iloc[0]
    player_league = target_player_data.get('League', None)

    # Streamlit logik: Filtrer efter SAMME liga OG den VALGTE sammenlignings-position
    filter_mask = (GLOBAL_DATASET[pos_column] == compare_pos)
    if player_league is not None:
        filter_mask = filter_mask & (GLOBAL_DATASET['League'] == player_league)
        
    comparison_df = GLOBAL_DATASET[filter_mask].copy()

    # Hvis spilleren falder uden for gruppen (pga. positionsskift), tilføjes han midlertidigt til beregningen
    if player not in comparison_df['Player Name'].values:
        comparison_df = pd.concat([comparison_df, player_row], ignore_index=True)

    labels = []
    percentiles = []

    # Gennemgå de metrikker, frontenden efterspørger
    for csv_column, display_name in FLAT_METRICS.items():
        if metrics is not None and display_name not in metrics:
            continue

        if csv_column in comparison_df.columns:
            # Dynamisk percentil-beregning (method='max' svarer til din Streamlits weak rank * 100)
            comparison_df[f'{csv_column}_pct'] = comparison_df[csv_column].rank(pct=True, method='max') * 100.0
            
            player_pct_row = comparison_df[comparison_df['Player Name'].str.lower() == player.lower()]
            pct_val = player_pct_row[f'{csv_column}_pct'].iloc[0] if not player_pct_row.empty else 0.0
            
            if pd.isna(pct_val):
                pct_val = 0.0

            labels.append(display_name)
            percentiles.append(round(max(0.0, min(float(pct_val), 100.0)), 1))
        else:
            labels.append(f"{display_name} (Mangler)")
            percentiles.append(0.0)

    return {
        "player_name": target_player_data['Player Name'],
        "team": target_player_data.get('Team', 'Ukendt Klub'),
        "player_pos": target_player_data.get(pos_column, 'Ukendt'),
        "metrics": labels,
        "percentiles": percentiles
    }
