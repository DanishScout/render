from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers.pizza import router as pizza_router
from routers.radar import router as radar_router
from routers.scatter import router as scatter_router
import pandas as pd
import os

app = FastAPI(title="PER 90 - Analytics API Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BACKEND_DIR = os.path.abspath(os.path.dirname(__file__))

@app.on_event("startup")
def startup_load_data():
    files = ["den1.csv", "den2.csv", "ger.csv", "ger2.csv"]
    combined_df = []
    for f in files:
        path = os.path.join(BACKEND_DIR, f)
        if os.path.exists(path):
            try:
                combined_df.append(pd.read_csv(path))
            except Exception:
                continue
    if combined_df:
        app.state.global_dataset = pd.concat(combined_df, ignore_index=True)
        print(f"LOG: Datamotor klar! {len(app.state.global_dataset)} spillere indlæst.")
    else:
        app.state.global_dataset = pd.DataFrame()

# API-ENDPOINTS TIL DINE NYE DROPDOWNS
@app.get("/api/init-pizza-meta")
def get_pizza_meta():
    if not hasattr(app.state, "global_dataset") or app.state.global_dataset.empty:
        return {"players": [], "positions": []}
    df = app.state.global_dataset
    name_col = 'Player Name' if 'Player Name' in df.columns else 'Player'
    pos_col = 'Pos.' if 'Pos.' in df.columns else ('Position' if 'Position' in df.columns else None)
    
    players = sorted(df[name_col].dropna().unique().tolist())
    positions = sorted(df[pos_col].dropna().unique().tolist()) if pos_col else []
    return {"players": players, "positions": positions}

app.include_router(pizza_router)
app.include_router(radar_router)
app.include_router(scatter_router)

FRONTEND_DIR = os.path.abspath(os.path.join(BACKEND_DIR, "..", "frontend"))
if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
