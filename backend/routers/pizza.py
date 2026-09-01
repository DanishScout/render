from fastapi import APIRouter, HTTPException, Query, Request
import pandas as pd
import requests
import base64

router = APIRouter()

@router.get("/api/pizza-chart")
def get_pizza_chart_data(
    request: Request, 
    player_name: str = Query(..., alias="player_name"),
    position: str = Query(..., alias="position"),
    metrics: list[str] = Query(..., alias="metrics")
):
    if not hasattr(request.app.state, "global_dataset") or request.app.state.global_dataset.empty:
        raise HTTPException(status_code=500, detail="Datamotoren er ikke klar.")
        
    df = request.app.state.global_dataset
    name_col = 'Player Name' if 'Player Name' in df.columns else 'Player'
    player_row = df[df[name_col].str.lower() == player_name.lower().strip()]
    
    if player_row.empty:
        raise HTTPException(status_code=404, detail="Spilleren blev ikke fundet.")
        
    p_data = player_row.iloc[0]
    player_league = p_data.get('League', None)
    pos_column = 'Pos.' if 'Pos.' in df.columns else ('Position' if 'Position' in df.columns else None)
    
    # FILTER-LOGIK: Samme liga og den VALGTE position fra dropdown'en
    if player_league and pos_column:
        filter_mask = (df['League'] == player_league) & (df[pos_column] == position)
        comparison_df = df[filter_mask].copy()
    else:
        comparison_df = df.copy()

    if p_data[name_col] not in comparison_df[name_col].values:
        comparison_df = pd.concat([comparison_df, player_row], ignore_index=True)
        
    chart_slices = []
    
    # Din fulde 18-metrik ordbog til display navne
    available_metrics_display = {
        "total goals_p90": "Goals", "xG_p90": "npxG", "total ontarget attempt_p90": "Shots On Target",
        "attempt_success_pct_p90": "On Target %", "CreatedOwnShot_p90": "Created Own Shot",
        "total assists_p90": "Assists", "xA_p90": "xA", "total att assist_p90": "Key Passes",
        "xT_pass_p90": "xT via Live Passes", "progressive_passes_p90": "Progressive Passes",
        "total won contest_p90": "Successful Dribbles", "total contest_p90": "Dribble Attempts",
        "dribble_success_pct_p90": "Dribble Success %", "Total Carries_p90": "Progressive Carries",
        "tackle_success_pct_p90": "Tackles Won %", "aerial_success_pct_p90": "Aerials Won %",
        "duel_success_pct_p90": "Duels Won %", "total won tackle_p90": "Tackles Won", "total aerial won_p90": "Aerials Won"
    }

    # Beregn percentil rang for de METRIKKER som brugeren har krydset af i frontend
    for k in metrics:
        if k in df.columns:
            all_values = pd.to_numeric(comparison_df[k], errors='coerce').dropna().sort_values()
            val = pd.to_numeric(p_data[k], errors='coerce')
            
            if pd.isna(val) or len(all_values) == 0:
                percentile = 0.0
            else:
                better_than = (all_values < val).sum()
                percentile = (better_than / len(all_values)) * 100.0
                
            display_name = available_metrics_display.get(k, k)
            chart_slices.append({
                "metric_key": k,
                "label": display_name,
                "percentile": round(percentile, 1)
            })

    # Opta logo træk
    logo_base64 = ""
    team_id = p_data.get('contestantId', None)
    if pd.notna(team_id):
        try:
            url = f'https://opta.net{team_id}'
            res = requests.get(url, timeout=2.0)
            if res.status_code == 200:
                logo_base64 = f"data:image/png;base64,{base64.b64encode(res.content).decode()}"
        except Exception:
            pass
            
    return {
        "playerName": p_data[name_col],
        "playerDefaultPos": str(p_data.get(pos_column, "N/A")),
        "slices": chart_slices,
        "logo": logo_base64
    }
