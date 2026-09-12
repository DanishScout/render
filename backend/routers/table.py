# ==========================================================================
# PER 90 - TABLE.PY (FEJLSIKRET SERVERLØS API ROUTER TIL VERCEL)
# ==========================================================================
from fastapi import APIRouter, HTTPException, Query
import pandas as pd
import os
from typing import List, Dict, Any

router = APIRouter(prefix="/api", tags=["table"])

# 🔥 VERCEL FIX: Tvinger Python til at kigge i den reelle server-rod (/var/task)
# hvor alle dine .csv-filer fra din backend-mappe bliver bagt ind under deployment.
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)  # Går op i 'backend/' mappen

def get_serverless_dataset() -> pd.DataFrame:
    """Indlæser og samler alle tilgængelige liga-filer fra serverens harddisk"""
    files = ['aut1.csv', 'tur1.csv', 'sco1.csv', 'cze1.csv', 'gre1.csv', 'swi1.csv', 'ger2.csv',
             'cro1.csv', 'pol1.csv', 'ser1.csv', 'swe1.csv', 'nor1.csv', 'svk1.csv', 'fin1.csv',
             'eng1.csv', 'eng2.csv', 'ger1.csv', 'ita1.csv', 'spa1.csv', 'fra1.csv', 'por1.csv', 
             'hol1.csv', 'bel1.csv', 'den1.csv', 'den2.csv']
    
    combined_df = []
    
    for f in files:
        # Vi leder efter filen direkte i backend-mappen på Vercel
        path = os.path.join(BASE_DIR, f)
        
        # Hvis Vercel mod forventning har flyttet stien under kompilering, tjekker vi lokal-mappen som fallback
        if not os.path.exists(path):
            path = os.path.join(os.getcwd(), "backend", f)
        if not os.path.exists(path):
            path = os.path.join(os.getcwd(), f)

        if os.path.exists(path):
            try:
                df = pd.read_csv(path)
                combined_df.append(df)
            except Exception:
                continue
                
    if not combined_df:
        # Hvis den fejler, spytter vi en klar tekst ud i din konsol i stedet for en kryptisk 500-fejl
        raise HTTPException(
            status_code=404, 
            detail=f"Kritiske datafiler mangler på Vercel-serveren. Tjekkede sti: {BASE_DIR}"
        )
        
    return pd.concat(combined_df, ignore_index=True)


@router.get("/table-data")
def get_scouting_table_data(
    stat_type: str = Query("Per 90", description="Vælg mellem 'Per 90' eller 'Total'")
):
    try:
        df = get_serverless_dataset()
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Kunne ikke indlæse fildriver: {str(e)}")

    if df is None or df.empty:
        raise HTTPException(status_code=500, detail="Datasættet er tomt.")

    # 1. SUFFIX LOGIK
    suffix = "_p90" if stat_type == "Per 90" else "_Total"

    try:
        # 2. MATCHING AF DINE 15 APPMETRIKKER
        custom_titles = {
            f"total goals{suffix}": "Goals",
            f"xG{suffix}": "npxG",
            f"total ontarget attempt{suffix}": "Shots On Target",
            f"attempt_success_pct{suffix}": "On Target %",
            
            f"total assists{suffix}": "Assists",
            f"xA{suffix}": "xA",
            f"total att assist{suffix}": "Key Passes",
            f"pass_success_pct{suffix}": "Pass Accuracy %",
            f"long_balls_success_pct{suffix}": "Long Ball Accuracy %",
            f"cross_success_pct{suffix}": "Cross Accuracy %",
            
            f"total won contest{suffix}": "Successful Dribbles",
            f"total contest{suffix}": "Dribble Attempts",
            f"dribble_success_pct{suffix}": "Dribble Success %",
            
            f"tackle_success_pct{suffix}": "Tackles Won %",
            f"aerial_success_pct{suffix}": "Aerials Won %",
            f"duel_success_pct{suffix}": "Duels Won %"
        }

        pos_col = 'Pos.' if 'Pos.' in df.columns else ('Position' if 'Position' in df.columns else 'Position')

        # 3. LOOP IGENNEM SCORINGSDATA OG GENERER ROW-DATA
        rows_list = []
        for _, row in df.iterrows():
            if pd.isna(row.get('Player Name')):
                continue

            player_metrics = {}
            for csv_col, pretty_name in custom_titles.items():
                if csv_col in df.columns:
                    val = row[csv_col]
                    # 🔥 SIKKER TALKONVERTERING: Erstatter NaN eller strenge med 0.0 for at undgå JSON-crash
                    try:
                        player_metrics[pretty_name] = float(val) if (not pd.isna(val) and str(val).lower() != 'nan') else 0.0
                    except:
                        player_metrics[pretty_name] = 0.0
                else:
                    player_metrics[pretty_name] = 0.0

            # Rensning af minutter og talværdier
            extracted_mins = row.get('total mins played', row.get('Mins', 0))
            try: mins_played = int(float(extracted_mins)) if not pd.isna(extracted_mins) else 0
            except: mins_played = 0

            nationality = str(row.get('Nationality', 'N/A')) if not pd.isna(row.get('Nationality')) else 'N/A'
            
            try: age_val = int(float(row.get('Age', 0))) if not pd.isna(row.get('Age')) else 0
            except: age_val = 0

            rows_list.append({
                "player_name": str(row['Player Name']),
                "team": str(row.get('Team', 'Ukendt Klub')),
                "league": str(row.get('League', 'Ukendt Liga')),
                "position": str(row.get(pos_col, 'N/A')),
                "nationality": nationality,
                "age": age_val,
                "mins_played": mins_played,
                "team_id": str(row.get('contestantId', 'nan')),
                "metrics": player_metrics
            })

        return {
            "stat_type": stat_type,
            "suffix_used": suffix,
            "table_headers": ["Player Name", "Team", "League", "Pos.", "Nationality", "Age", "Mins"] + list(custom_titles.values()),
            "players": rows_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fejl under generering af tabel-feed: {str(e)}")
