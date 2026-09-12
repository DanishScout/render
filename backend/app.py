from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import os
from backend.eventdata import router as eventdata_router

app = FastAPI(title="PER 90 - Analytics API Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(eventdata_router)

# Data-mappestien på Vercel-serveren
DATA_DIR = os.path.abspath(os.path.dirname(__file__))

def load_single_league(league_code: str) -> pd.DataFrame:
    """Indlæser udelukkende én enkelt CSV-fil ad gangen for at spare 95% RAM"""
    valid_leagues = ['aut1', 'tur1', 'sco1', 'cze1', 'gre1', 'swi1', 'ger2',
                     'cro1', 'pol1', 'ser1', 'swe1', 'nor1', 'svk1', 'fin1',
                     'eng1', 'eng2', 'ger1', 'ita1', 'spa1', 'fra1', 'por1', 
                     'hol1', 'bel1', 'den1', 'den2']
    
    if league_code not in valid_leagues:
        raise HTTPException(status_code=400, detail="Ugyldig ligakode")
        
    file_path = os.path.join(DATA_DIR, f"{league_code}.csv")
    
    if os.path.exists(file_path):
        try:
            return pd.read_csv(file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        raise HTTPException(status_code=404, detail=f"Filen {league_code}.csv mangler.")

@app.get("/api/players/{league}")
def get_players_by_league(league: str):
    df = load_single_league(league)
    return df.to_dict(orient="records")

@app.get("/api")
def read_root():
    return {"status": "ONLINE", "engine": "Vercel Serverless File Router"}
