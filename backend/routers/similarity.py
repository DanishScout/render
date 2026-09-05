# ==========================================================================
# PER 90 - SIMILARITY.PY (API ROUTER TIL MATHEMATICAL PLAYER COMPARISON)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import numpy as np
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["similarity"])

@router.get("/similarity-data")
def get_player_similarity_data(
    target_player: str = Query(..., description="Navnet på den spiller, der skal findes kopier af")
):
    from app import GLOBAL_DATASET
    if GLOBAL_DATASET is None or GLOBAL_DATASET.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom eller ikke indlæst.")

    # 1. 🎯 FASTE STRØMLINEDE _p90 METRIKKER DIREKTE FRA DINE DATAFILER
    metric_cols = [
        "total goals_p90", "xG_p90", "total ontarget attempt_p90", "attempt_success_pct_p90",
        "total assists_p90", "xA_p90", "total att assist_p90", "pass_success_pct_p90",
        "long_balls_success_pct_p90", "cross_success_pct_p90", "total won contest_p90",
        "total contest_p90", "dribble_success_pct_p90", "tackle_success_pct_p90",
        "aerial_success_pct_p90", "duel_success_pct_p90"
    ]

    df = GLOBAL_DATASET.copy()

    # Tjek om metrik-kolonnerne eksisterer i datasættet
    existing_cols = [c for c in metric_cols if c in df.columns]
    if not existing_cols:
         raise HTTPException(status_code=500, detail="Kritiske _p90 metrik-kolonner blev ikke fundet i datasættet.")

    # Find referencespilleren (Case-insensitive)
    target_row = df[df['Player Name'].str.lower() == target_player.lower()]
    if target_row.empty:
        raise HTTPException(status_code=404, detail=f"Referencespilleren '{target_player}' blev ikke fundet.")
    
    target_player_real_name = str(target_row.iloc[0]['Player Name'])
    
    try:
        # 2. MIN-MAX SKALERING (NORMALISERING) AF PRESTATIONSDATAEN
        matrix = df[existing_cols].fillna(0.0).to_numpy()
        target_vector = target_row[existing_cols].fillna(0.0).to_numpy()
        
        min_vals = matrix.min(axis=0)
        max_vals = matrix.max(axis=0)
        
        # Undgå division med 0
        range_vals = np.where((max_vals - min_vals) == 0, 1.0, max_vals - min_vals)
        
        # Skaler datasæt og target-spiller mellem 0 og 1
        normalized_matrix = (matrix - min_vals) / range_vals
        normalized_target = (target_vector - min_vals) / range_vals

        # 3. MATHEMATICAL EUCLIDEAN DISTANCE & SIMILARITY PCT (0-100%)
        distances = np.linalg.norm(normalized_matrix - normalized_target, axis=1)
        similarity_scores = (1.0 / (1.0 + distances)) * 100.0
        df['similarity_pct'] = similarity_scores

        # Rens positionskolonnen
        pos_col = 'Pos.' if 'Pos.' in df.columns else ('Position' if 'Position' in df.columns else 'Position')

        # 4. LOOP OG GENERER RESULTAT-LISTE
        results_list = []
        for idx, row in df.iterrows():
            player_metrics = {}
            for c in existing_cols:
                # Omdan f.eks. "total goals_p90" til det rene navn "total goals" i JSON-pakken
                pretty_key = c.replace("_p90", "")
                val = row[c]
                player_metrics[pretty_key] = float(val) if not pd.isna(val) else 0.0

            extracted_mins = row.get('total mins played', row.get('Mins', 0))
            
            results_list.append({
                "player_name": str(row['Player Name']),
                "team": str(row.get('Team', 'Ukendt Klub')),
                "league": str(row.get('League', 'Ukendt Liga')),
                "position": str(row.get(pos_col, 'N/A')),
                "nationality": str(row.get('Nationality', 'N/A')),
                "age": int(row.get('Age', 0)) if not pd.isna(row.get('Age')) else 0,
                "mins_played": int(extracted_mins) if not pd.isna(extracted_mins) else 0,
                "team_id": str(row.get('contestantId', 'nan')),
                "similarity_percentage": float(row['similarity_pct']),
                "metrics": player_metrics
            })

        # Sorter så de mest identiske spillere ligger øverst
        results_list.sort(key=lambda x: x['similarity_percentage'], reverse=True)

        return {
            "target_player_verified": target_player_real_name,
            "metrics_analyzed": [c.replace("_p90", "") for c in existing_cols],
            "similarity_leaderboard": results_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fejl i similarity-motor: {str(e)}")
