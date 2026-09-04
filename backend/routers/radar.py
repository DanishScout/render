# ==========================================================================
# PER 90 - RADAR.PY (RENT DATA-UDTRÆK UDEN BEREGNINGER) - DEL 1 AF 2
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from typing import List

router = APIRouter(prefix="/api", tags=["radar"])

# RETTET: Alle kolonnenavne slutter nu på _p90PR for at ramme de præ-beregnede percentiler
AVAILABLE_METRICS_MAP = {
    "Shooting": {
        "total goals_p90PR": "Goals", 
        "xG_p90PR": "npxG",
        "total ontarget attempt_p90PR": "Shots On Target", 
        "attempt_success_pct_p90PR": "On Target %"
    },
    "Passing": {
        "total assists_p90PR": "Assists", 
        "xA_p90PR": "xA",
        "total att assist_p90PR": "Key Passes", 
        "xT_pass_p90PR": "xT via Live Passes"
    },
    "Possession": {
        "total won contest_p90PR": "Successful Dribbles", 
        "total contest_p90PR": "Dribble Attempts",
        "dribble_success_pct_p90PR": "Dribble Success %"
    },
    "Defending": {
        "tackle_success_pct_p90PR": "Tackles Won %", 
        "aerial_success_pct_p90PR": "Aerials Won %",
        "duel_success_pct_p90PR": "Duels Won %", 
        "total won tackle_p90PR": "Tackles Won"
    }
}

FLAT_METRICS = {k: v for cat in AVAILABLE_METRICS_MAP.values() for k, v in cat.items()}

@router.get("/radar/players")
def get_all_players():
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty: return []
    return sorted(GLOBAL_DATASET['Player Name'].dropna().unique().tolist())
# ==========================================================================
# PER 90 - RADAR.PY (RENT DATA-UDTRÆK UDEN BEREGNINGER) - DEL 2 AF 2
# ==========================================================================

def extract_player_radar_profile(player_name: str, metrics_list: List[str]):
    """Hjælpefunktion der trækker de rå percentiler direkte ud fra CSV-arket"""
    from app import GLOBAL_DATASET
    
    row = GLOBAL_DATASET[GLOBAL_DATASET['Player Name'].str.lower() == player_name.lower()]
    if row.empty:
        return None
        
    player_data = row.iloc[0]
    pos_column = 'Pos.' if 'Pos.' in GLOBAL_DATASET.columns else ('Position' if 'Position' in GLOBAL_DATASET.columns else 'Ukendt')
    
    labels = []
    values = []

    for csv_column, display_name in FLAT_METRICS.items():
        if metrics_list is not None and display_name not in metrics_list:
            continue

        if csv_column in GLOBAL_DATASET.columns:
            # Tallene ER allerede percentiler, så vi napper bare den rå værdi direkte! 🚀
            val = player_data.get(csv_column, 0.0)
            if pd.isna(val): val = 0.0
            
            labels.append(display_name)
            values.append(round(max(0.0, min(float(val), 100.0)), 1))
        else:
            labels.append(f"{display_name} (Mangler)")
            values.append(0.0)
            
    extracted_mins = player_data.get('total mins played', player_data.get('Mins', 0))
    if pd.isna(extracted_mins): extracted_mins = 0

    return {
        "player_name": player_data['Player Name'],
        "team": player_data.get('Team', 'Ukendt Klub'),
        "league": player_data.get('League', 'Ukendt Liga'),
        "player_pos": player_data.get(pos_column, 'Ukendt'),
        "mins_played": int(extracted_mins),
        "team_id": str(player_data.get('contestantId', 'nan')),
        "metrics": labels,
        "values": values
    }

@router.get("/radar")
def get_radar_data(
    player1: str = Query(..., description="Navnet på hovedspilleren"),
    player2: str = Query(None, description="Navnet på spilleren der skal sammenlignes med (valgfri)"),
    metrics: List[str] = Query(None, description="De valgte visningsnavne fra tjekboksene")
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom.")

    # Hent profil for spiller 1
    p1_data = extract_player_radar_profile(player1, metrics)
    if not p1_data:
        raise HTTPException(status_code=404, detail=f"Spiller 1 '{player1}' blev ikke fundet.")

    # Hent profil for spiller 2 hvis den er sendt med fra frontenden
    p2_data = None
    if player2:
        p2_data = extract_player_radar_profile(player2, metrics)

    return {
        "player1": p1_data,
        "player2": p2_data
    }
