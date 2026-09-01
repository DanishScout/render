from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import os
from typing import List

router = APIRouter()
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

def load_combined_dataset():
    files = ["den1.csv", "den2.csv", "ger.csv", "ger2.csv"]
    combined_df = []
    for f in files:
        path = os.path.join(DATA_DIR, f)
        if os.path.exists(path):
            try:
                combined_df.append(pd.read_csv(path))
            except Exception:
                continue
    if not combined_df:
        raise HTTPException(status_code=500, detail="Ingen datafiler fundet.")
    return pd.concat(combined_df, ignore_index=True)

@router.get("/api/radar-comparison")
def get_radar_comparison(
    player1: str,
    player2: str,
    metrics: List[str] = Query(..., description="Metrikker til sammenligning")
):
    df = load_combined_dataset()
    p1_row = df[df["Player"].str.lower() == player1.lower().strip()]
    p2_row = df[df["Player"].str.lower() == player2.lower().strip()]
    
    if p1_row.empty:
        raise HTTPException(status_code=404, detail=f"'{player1}' ikke fundet.")
    if p2_row.empty:
        raise HTTPException(status_code=404, detail=f"'{player2}' ikke fundet.")
        
    missing = [m for m in metrics if m not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Mangler metrikker: {missing}")
        
    res = {
        "metrics": metrics,
        "player1": {"name": player1, "stats": []},
        "player2": {"name": player2, "stats": []}
    }
    
    for m in metrics:
        all_vals = pd.to_numeric(df[m], errors='coerce').dropna().sort_values()
        v1 = pd.to_numeric(p1_row.iloc[0][m], errors='coerce')
        v2 = pd.to_numeric(p2_row.iloc[0][m], errors='coerce')
        
        pct1 = (all_vals < v1).sum() / len(all_vals) * 100 if not pd.isna(v1) else 0
        pct2 = (all_vals < v2).sum() / len(all_vals) * 100 if not pd.isna(v2) else 0
        
        res["player1"]["stats"].append(round(pct1, 1))
        res["player2"]["stats"].append(round(pct2, 1))
        
    return res
