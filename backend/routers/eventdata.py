from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException
from selenium_stealth import stealth
import json
import re

@router.get("/fetch-events")
def get_whoscored_event_data(url: str = Query(...)):
    if not url.strip() or "whoscored.com" not in url:
        raise HTTPException(status_code=400, detail="Ugyldig URL. Indtast venligst en gyldig WhoScored URL.")

    # 🔧 OPTIMERET CHROMEDRIVER CONFIG TIL RENDER LINUX-MILJØ
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--start-maximized")
    
    # Fortæller Selenium hvor den installerede Chrome-browser ligger på Linux-serveren
    options.binary_location = "/app/.apt/usr/bin/google-chrome"

    # Automatisk installation/lokalisering af den matchende ChromeDriver i skyen
    service = ChromeService(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    # 🥷 SELENIUM STEALTH (Mod Cloudflare)
    stealth(driver,
            languages=["en-US", "en"],
            vendor="Google Inc.",
            platform="Win32",
            webgl_vendor="Intel Inc.",
            renderer="Intel Iris OpenGL Engine")

    try:
        driver.get(url)

        # Vent på at kampdata er tilgængelig i sidens kildekode
        WebDriverWait(driver, 20).until(
            lambda d: "matchCentreData" in d.page_source
        )
        html = driver.page_source

        # Regex mønster
        pattern = r'matchCentreData:\s*(\{.*?\})\s*,\s*matchCentreEventTypeJson:'
        match = re.search(pattern, html, re.DOTALL)
        
        if not match:
            match = re.search(r'matchCentreData\s*:\s*({.+?})\s*,\s*\n', html)
        if not match:
            match = re.search(r'var\s+matchCentreData\s*=\s*({.+?});', html)
            
        if not match:
            raise HTTPException(status_code=404, detail="Kunne ikke lokalisere kampdata (matchCentreData) på WhoScored.")

        match_centre_data = json.loads(match.group(1))

        # Metadata extraction
        home = match_centre_data.get("home", {})
        away = match_centre_data.get("away", {})
        home_id = home.get("teamId")
        away_id = away.get("teamId")

        home_logo_data = get_team_logo_base64(home_id)
        away_logo_data = get_team_logo_base64(away_id)

        match_info = {
            "homeId": home_id,
            "awayId": away_id,
            "homeName": home.get("name"),
            "awayName": away.get("name"),
            "homeColor": "#00F0FF",
            "awayColor": "#FF0055",
            "homeLogo": home_logo_data,
            "awayLogo": away_logo_data,
            "scoreStr": f"{home.get('scores', {}).get('fullTime', 0)} - {away.get('scores', {}).get('fullTime', 0)}"
        }

        raw_events = match_centre_data.get("events", [])
        sub_home_min = 90
        sub_away_min = 90

        for ev in raw_events:
            if ev.get("type", {}).get("displayName") == "SubstitutionOff":
                m = ev.get("minute", 90)
                if ev.get("teamId") == home_id:
                    sub_home_min = min(sub_home_min, m)
                else:
                    sub_away_min = min(sub_away_min, m)

        match_info["homeFirstSubMin"] = sub_home_min
        match_info["awayFirstSubMin"] = sub_away_min

        players_map = {}
        for team in ["home", "away"]:
            for p in match_centre_data.get(team, {}).get("players", []):
                players_map[str(p.get("playerId"))] = {
                    "name": p.get("name"),
                    "shirtNo": p.get("shirtNo"),
                    "position": p.get("position", "Sub"),
                    "isFirstEleven": bool(p.get("isFirstEleven", False))
                }

        processed_events = []
        for ev in raw_events:
            if "x" not in ev or "y" not in ev:
                continue

            ev_type = ev.get("type", {}).get("displayName", "Unknown")
            is_success = bool(ev.get("outcomeType", {}).get("value", 1) == 1)
            is_touch = bool(ev.get("isTouch", False))

            end_x, end_y = None, None
            is_set_piece = False
            
            for q in ev.get("qualifiers", []):
                q_name = q.get("type", {}).get("displayName")
                if q_name == "PassEndX": end_x = float(q.get("value", 0.0))
                elif q_name == "PassEndY": end_y = float(q.get("value", 0.0))
                elif q_name in ['CornerTaken', 'FreekickTaken', 'ThrowIn', 'GoalKick']:
                    is_set_piece = True

            xt_diff = 0.0
            if ev_type == "Pass" and is_success and not is_set_piece and end_x is not None and end_y is not None:
                start_xt = lookup_xt(ev.get("x"), ev.get("y"))
                end_xt = lookup_xt(end_x, end_y)
                xt_diff = max(0.0, end_xt - start_xt)

            processed_events.append({
                "minute": ev.get("minute", 0),
                "teamId": ev.get("teamId"),
                "playerId": str(ev.get("playerId", "")),
                "type": ev_type,
                "success": is_success,
                "isTouch": is_touch,
                "x": float(ev.get("x", 0.0)),
                "y": float(ev.get("y", 0.0)),
                "endX": end_x,
                "endY": end_y,
                "isSetPiece": is_set_piece,
                "xtDiff": xt_diff
            })

        return {
            "status": "SUCCESS",
            "match_info": match_info,
            "players_map": players_map,
            "events": processed_events
        }

    except TimeoutException:
        raise HTTPException(status_code=408, detail="Timeout: Det tog for lang tid at hente data fra WhoScored via Selenium.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fejl under indlæsning: {str(e)}")
    finally:
        driver.quit()
