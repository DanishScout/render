# ==========================================================================
# PER 90 - RADAR.PY (RETTET PERCENTILE-UDTRÆK VIA _p90PR)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from typing import List

router = APIRouter(prefix="/api", tags=["radar"])

# Vi bruger præcis samme struktur som i pizza, men tilføjer _p90PR til CSV-kolonnerne
AVAILABLE_RADAR_METRICS = {
    "Shooting": {
        "total goals_p90PR": "Goals", "xG_p90PR": "npxG",
        "total ontarget attempt_p90PR": "Shots On Target", "attempt_success_pct_p90PR": "On Target %"
    },
    "Passing": {
        "total assists_p90PR": "Assists", "xA_p90PR": "xA",
        "total att assist_p90PR": "Key Passes", "xT_pass_p90PR": "xT via Live Passes"
    },
    "Possession": {
        "total won contest_p90PR": "Successful Dribbles", "total contest_p90PR": "Dribble Attempts",
        "dribble_success_pct_p90PR": "Dribble Success %"
    },
    "Defending": {
        "tackle_success_pct_p90PR": "Tackles Won %", "aerial_success_pct_p90PR": "Aerials Won %",
        "duel_success_pct_p90PR": "Duels Won %", "total won tackle_p90PR": "Tackles Won"
    }
}

# Flader mappet ud, så det er nemt at slå op i under filtrering
FLAT_RADAR_METRICS = {k: v for cat in AVAILABLE_RADAR_METRICS.values() for k, v in cat.items()}

@router.get("/radar")
def get_radar_data(
    player: str = Query(..., description="Navnet på målspilleren"),
    compare_pos: str = Query(..., description="Positionen der skal sammenlignes imod"),
    metrics: List[str] = Query(None, description="De valgte visningsnavne fra tjekboksene")
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom.")

    pos_column = 'Pos.' if 'Pos.' in GLOBAL_DATASET.columns else ('Position' if 'Position' in GLOBAL_DATASET.columns else None)
    if not pos_column:
        raise HTTPException(status_code=500, detail="Positionskolonne mangler i CSV.")

    player_row = GLOBAL_DATASET[GLOBAL_DATASET['Player Name'].str.lower() == player.lower()]
    if player_row.empty:
        raise HTTPException(status_code=404, detail=f"Spilleren '{player}' blev ikke fundet.")
    
    target_player_data = player_row.iloc[0]

    labels = []
    percentiles = []

    # Vi looper igennem vores metrics og trækker de præ-udregnede _p90PR værdier direkte ud 🎯
    for csv_column, display_name in FLAT_RADAR_METRICS.items():
        if metrics is not None and display_name not in metrics:
            continue

        if csv_column in GLOBAL_DATASET.columns:
            # Værdien er allerede en percentile rank (PR), så vi hiver den bare ud og runder let
            val = target_player_data.get(csv_column, 0.0)
            if pd.isna(val): 
                val = 0.0
            labels.append(display_name)
            percentiles.append(round(max(0.0, min(float(val), 100.0)), 1))
        else:
            labels.append(f"{display_name} (Mangler)")
            percentiles.append(0.0)

    extracted_mins = target_player_data.get('total mins played', target_player_data.get('Mins', 0))
    if pd.isna(extracted_mins): 
        extracted_mins = 0
    else:
        extracted_mins = int(extracted_mins)

    return {
        "player_name": target_player_data['Player Name'],
        "team": target_player_data.get('Team', 'Ukendt Klub'),
        "league": target_player_data.get('League', 'Ukendt Liga'), 
        "player_pos": target_player_data.get(pos_column, 'Ukendt'),
        "mins_played": extracted_mins, 
        "metrics": labels,
        "percentiles": percentiles,
        "team_id": str(target_player_data.get('contestantId', 'nan'))
    }
