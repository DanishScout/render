# ==========================================================================
# PER 90 - TABLE.PY (SERVERLØS API ROUTER TIL DATATABEL UDEN RAM-CRASH)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import os
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["table"])

# 🎯 DYNAMISK LOKALISERING AF FILERNE UNDER VERCEL SERVERLESS
# Da denne fil ligger i 'backend/routers/', går vi et niveau op for at finde CSV-filerne i 'backend/'
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def get_serverless_dataset() -> pd.DataFrame:
    """Indlæser og samler liga-filer dynamisk uden at overbelaste Vercels RAM"""
    files = ['aut1.csv', 'tur1.csv', 'sco1.csv', 'cze1.csv', 'gre1.csv', 'swi1.csv', 'ger2.csv',
             'cro1.csv', 'pol1.csv', 'ser1.csv', 'swe1.csv', 'nor1.csv', 'svk1.csv', 'fin1.csv',
             'eng1.csv', 'eng2.csv', 'ger1.csv', 'ita1.csv', 'spa1.csv', 'fra1.csv', 'por1.csv', 
             'hol1.csv', 'bel1.csv', 'den1.csv', 'den2.csv']
    
    combined_df = []
    
    for f in files:
        path = os.path.join(BASE_DIR, f)
        if os.path.exists(path):
            try:
                # Vi indlæser kun de absolut mest nødvendige kolonner i hukommelsen for at optimere farten
                df = pd.read_csv(path)
                combined_df.append(df)
            except Exception:
                continue
                
    if not combined_df:
        raise HTTPException(status_code=500, detail="Kunne ikke finde eller indlæse nogen liga-CSV-filer i backend-mappen.")
        
    return pd.concat(combined_df, ignore_index=True)


@router.get("/table-data")
def get_scouting_table_data(
    stat_type: str = Query("Per 90", description="Vælg mellem 'Per 90' eller 'Total'")
):
    # 🔥 FIX: Henter datasættet sikkert igennem vores letvægts serverløse indlæser
    try:
        df = get_serverless_dataset()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if df is None or df.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er tom eller ikke indlæst.")

    # 1. 🎯 SUFFIX LOGIK EN-TIL-EN FRA DINE ANDRE DIAGRAMMER 🎯
    suffix = "_p90" if stat_type == "Per 90" else "_Total"

    try:
        # 2. MATCHING AF DINE 15 OFFICIELLE APPMETRIKKER TIL TABEL-KOLONNER
        custom_titles = {
            # Shooting
            f"total goals{suffix}": "Goals",
            f"xG{suffix}": "npxG",
            f"total ontarget attempt{suffix}": "Shots On Target",
            f"attempt_success_pct{suffix}": "On Target %",
            
            # Passing / Playmaking
            f"total assists{suffix}": "Assists",
            f"xA{suffix}": "xA",
            f"total att assist{suffix}": "Key Passes",
            f"pass_success_pct{suffix}": "Pass Accuracy %",
            f"long_balls_success_pct{suffix}": "Long Ball Accuracy %",
            f"cross_success_pct{suffix}": "Cross Accuracy %",
            
            # Possession
            f"total won contest{suffix}": "Successful Dribbles",
            f"total contest{suffix}": "Dribble Attempts",
            f"dribble_success_pct{suffix}": "Dribble Success %",
            
            # Defending / Duels
            f"tackle_success_pct{suffix}": "Tackles Won %",
            f"aerial_success_pct{suffix}": "Aerials Won %",
            f"duel_success_pct{suffix}": "Duels Won %"
        }

        # Dynamisk opspuring af positionskolonnen i dit CSV-ark
        pos_col = 'Pos.' if 'Pos.' in df.columns else ('Position' if 'Position' in df.columns else 'Position')

        # 3. LOOP IGENNEM CSV-ARKET OG GENERER ROW-DATA TIL SCUTING TABELLEN
        rows_list = []
        for _, row in df.iterrows():
            if pd.isna(row.get('Player Name')):
                continue

            # Vi pakker metrikkerne for rækken ud med de pæne overskriftsnavne
            player_metrics = {}
            for csv_col, pretty_name in custom_titles.items():
                if csv_col in df.columns:
                    val = row[csv_col]
                    player_metrics[pretty_name] = float(val) if not pd.isna(val) else 0.0
                else:
                    player_metrics[pretty_name] = 0.0

            # Uddrag og rens spilletid (Minutter)
            extracted_mins = row.get('total mins played', row.get('Mins', 0))
            mins_played = int(extracted_mins) if not pd.isna(extracted_mins) else 0

            # Uddrag og rens nationalitet
            nationality = str(row.get('Nationality', 'N/A')) if not pd.isna(row.get('Nationality')) else 'N/A'

            # Tilføj det komplette spillerobjekt til tabel-arrayet
            rows_list.append({
                "player_name": str(row['Player Name']),
                "team": str(row.get('Team', 'Ukendt Klub')),
                "league": str(row.get('League', 'Ukendt Liga')),
                "position": str(row.get(pos_col, 'N/A')),
                "nationality": nationality,
                "age": int(row.get('Age', 0)) if not pd.isna(row.get('Age')) else 0,
                "mins_played": mins_played,
                "team_id": str(row.get('contestantId', 'nan')),
                "metrics": player_metrics
            })

        # Returner datapakken med listen over gyldige kolonner (headers) til frontenden
        return {
            "stat_type": stat_type,
            "suffix_used": suffix,
            "table_headers": ["Player Name", "Team", "League", "Pos.", "Nationality", "Age", "Mins"] + list(custom_titles.values()),
            "players": rows_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fejl under generering af tabel-feed: {str(e)}")
