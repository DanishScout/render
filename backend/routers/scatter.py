from fastapi import APIRouter, HTTPException
import pandas as pd
import os

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

@router.get("/api/scatter-plot")
def get_scatter_plot_data(player_name: str):
    df = load_combined_dataset()
    
    # Standard-scoutingmetrikker (X-akse = Volumen, Y-akse = Effektivitet)
    x_metric = "Successful Dribbles"
    y_metric = "Goals"
    
    if x_metric not in df.columns or y_metric not in df.columns:
        raise HTTPException(status_code=500, detail="Standardmetrikker mangler i CSV.")
        
    df["x_clean"] = pd.to_numeric(df[x_metric], errors='coerce')
    df["y_clean"] = pd.to_numeric(df[y_metric], errors='coerce')
    clean_df = df.dropna(subset=["x_clean", "y_clean"])
    
    scatter_data = []
    for _, row in clean_df.iterrows():
        scatter_data.append({
            "name": row["Player"],
            "x": float(row["x_clean"]),
            "y": float(row["y_clean"])
        })
        
    return scatter_data
