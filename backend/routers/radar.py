# ==========================================================================
# PER 90 - RADAR.PY - DEL 1 AF 2
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from typing import List

router = APIRouter(prefix="/api", tags=["radar"])

# Vi bruger de samme metrics, men de mapper til kolonnenavne med _p90PR i din CSV
AVAILABLE_METRICS_MAP = {
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

FLAT_METRICS = {k: v for cat in AVAILABLE_METRICS_MAP.values() for k, v in cat.items()}

@router.get("/radar/players")
def get_all_radar_players():
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty: return []
    return sorted(GLOBAL_DATASET['Player Name'].dropna().unique().tolist())

@router.get("/radar/positions")
def get_all_radar_positions():
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty: return []
    pos_column = 'Pos.' if 'Pos.' in GLOBAL_DATASET.columns else ('Position' if 'Position' in GLOBAL_DATASET.columns else None)
    if not pos_column: return []
    return sorted(GLOBAL_DATASET[pos_column].dropna().unique().tolist())
# ==========================================================================
# PER 90 - RADAR.PY - DEL 2 AF 2
# ==========================================================================

@router.get("/radar")
def get_radar_data(
    player1: str = Query(..., description="Navnet på spiller 1"),
    player2: str = Query(..., description="Navnet på spiller 2"),
    metrics: List[str] = Query(None, description="De valgte visningsnavne fra tjekboksene")
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom.")

    pos_column = 'Pos.' if 'Pos.' in GLOBAL_DATASET.columns else ('Position' if 'Position' in GLOBAL_DATASET.columns else None)
    if not pos_column:
        raise HTTPException(status_code=500, detail="Positionskolonne mangler i CSV.")

    # 1. HENT SPILLER 1 DATA
    row1 = GLOBAL_DATASET[GLOBAL_DATASET['Player Name'].str.lower() == player1.lower()]
    if row1.empty:
        raise HTTPException(status_code=404, detail=f"Spiller 1 '{player1}' blev ikke fundet.")
    p1_data = row1.iloc[0]

    # 2. HENT SPILLER 2 DATA
    row2 = GLOBAL_DATASET[GLOBAL_DATASET['Player Name'].str.lower() == player2.lower()]
    if row2.empty:
        raise HTTPException(status_code=404, detail=f"Spiller 2 '{player2}' blev ikke fundet.")
    p2_data = row2.iloc[0]

    labels = []
    p1_percentiles = []
    p2_percentiles = []

    # Træk værdierne direkte ud af de præ-beregnede _p90PR kolonner (Ingen .rank() påkrævet!) 🎯
    for csv_column, display_name in FLAT_METRICS.items():
        if metrics is not None and display_name not in metrics:
            continue

        labels.append(display_name)

        # Spiller 1 værdi
        if csv_column in GLOBAL_DATASET.columns:
            v1 = p1_data.get(csv_column, 0.0)
            if pd.isna(v1): v1 = 0.0
            p1_percentiles.append(round(max(0.0, min(float(v1), 100.0)), 1))
        else:
            p1_percentiles.append(0.0)

        # Spiller 2 værdi
        if csv_column in GLOBAL_DATASET.columns:
            v2 = p2_data.get(csv_column, 0.0)
            if pd.isna(v2): v2 = 0.0
            p2_percentiles.append(round(max(0.0, min(float(v2), 100.0)), 1))
        else:
            p2_percentiles.append(0.0)

    return {
        "player1": {
            "player_name": p1_data['Player Name'],
            "team": p1_data.get('Team', 'Ukendt Klub'),
            "league": p1_data.get('League', 'Ukendt'),
            "player_pos": p1_data.get(pos_column, 'Ukendt'),
            "mins_played": int(p1_data.get('total mins played', p1_data.get('Mins', 0))) if not pd.isna(p1_data.get('total mins played', p1_data.get('Mins', 0))) else 0,
            "percentiles": p1_percentiles
        },
        "player2": {
            "player_name": p2_data['Player Name'],
            "team": p2_data.get('Team', 'Ukendt Klub'),
            "league": p2_data.get('League', 'Ukendt'),
            "player_pos": p2_data.get(pos_column, 'Ukendt'),
            "mins_played": int(p2_data.get('total mins played', p2_data.get('Mins', 0))) if not pd.isna(p2_data.get('total mins played', p2_data.get('Mins', 0))) else 0,
            "percentiles": p2_percentiles
        },
        "metrics": labels
    }
