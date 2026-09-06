// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 1 AF 10 (MASTER STATES & ISOLERET SELEKTOR)
// ==========================================================================

let MATCH_GLOBAL_DATA = null;       // Indeholder den komplette JSON-datapakke fra matchreport.py
let MATCH_ACTIVE_TAB = "stats";     // Aktiv visningsfane: 'stats', 'xg', 'momentum', 'performers', 'player'
let MATCH_SELECTED_PLAYER = null;   // Den nuværende valgte spiller i Fig 5 (Player Stats)

// 🎯 ISOLERET SELEKTOR-FUNKTION: Forhindrer 'already been declared' fejl permanent på tværs af appen!
const getMatchReportEl = id => document.getElementById(id);
// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 2 AF 10 (CENTRAL DASHBOARD CSS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('match-report-core-styles')) return;
    const style = document.createElement('style');
    style.id = 'match-report-core-styles';
    style.innerHTML = `
        .mr-main-container { width: 100%; max-width: 820px; margin: 0 auto; padding: 0 15px; box-sizing: border-box; }
        .mr-search-box { background: linear-gradient(180deg, #0f172a 0%, #020617 100%); border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; padding: 20px; margin-bottom: 20px; display: flex; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); box-sizing: border-box; }
        .mr-input-field { flex-grow: 1; background: #07030c; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px 16px; color: #fff; font-size: 14px; outline: none; }
        .mr-input-field:focus { border-color: var(--accent-purple); }
        .mr-btn { background: var(--accent-purple); color: #06140c; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        .mr-tabs-nav { display: flex; overflow-x: auto; gap: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 10px; padding: 4px; margin-bottom: 25px; }
        .mr-tab-item { padding: 10px 18px; font-size: 12.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; border-radius: 7px; cursor: pointer; border: none; background: transparent; transition: all 0.15s; }
        .mr-tab-item.active { color: #fff; background: #1e293b; }
        .mr-capture-card { position: relative; width: 100%; padding: 35px 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); background: radial-gradient(circle at top, #111A2E 0%, #070A13 100%); display: flex; flex-direction: column; align-items: center; box-shadow: 0 25px 60px rgba(0,0,0,0.4); box-sizing: border-box; }
        .mr-pitch-wrapper { width: 100%; max-width: 660px; aspect-ratio: 105 / 68; position: relative; overflow: visible; background: transparent; margin-bottom: 10px; }
        .mr-pitch-line { stroke: rgba(255, 255, 255, 0.12); stroke-width: 0.6; fill: none; }
        .mr-markers-layer { position: absolute; inset: 0; pointer-events: none; z-index: 10; }
        .mr-shot-dot { position: absolute; transform: translate(-50%, -50%); border-radius: 50%; border: 1px solid #040812; box-shadow: 0 3px 8px rgba(0,0,0,0.5); text-align: center; font-weight: 900; }
        .mr-shot-dot.own-goal { border: none; box-shadow: none; background: transparent !important; }
        .mr-stats-overlay { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 185px; padding: 18px 14px; background: rgba(11, 18, 32, 0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; display: flex; flex-direction: column; gap: 14px; z-index: 15; backdrop-filter: blur(2px); box-sizing: border-box; }
        .mr-stat-row { display: flex; flex-direction: column; gap: 5px; }
        .mr-stat-meta { display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .mr-stat-v { font-weight: 950; font-size: 13px; }
        .mr-stat-lbl { color: rgba(255,255,255,0.6); font-size: 9px; letter-spacing: 0.6px; font-weight: 800; text-align: center; flex-grow: 1; }
        .mr-bar-track { width: 100%; height: 3px; background: rgba(255,255,255,0.05); border-radius: 1.5px; display: flex; overflow: hidden; }
        .mr-graph-frame { display: flex; width: 100%; height: 340px; position: relative; }
        .mr-y-axis { position: relative; width: 90px; height: 100%; color: #475569; text-align: right; box-sizing: border-box; }
        .mr-y-axis span { position: absolute; right: 14px; transform: translateY(-50%); font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .mr-svg-canvas { flex-grow: 1; height: 100%; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); position: relative; }
        .mr-svg-canvas svg { width: 100%; height: 100%; overflow: visible; display: block; }
        .mr-x-row { display: flex; width: 100%; }
        .mr-x-axis { flex-grow: 1; display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569; padding-top: 14px; }
        .mr-x-axis span { width: 0; display: flex; justify-content: center; white-space: nowrap; }
        .mr-perf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%; box-sizing: border-box; }
        @media (max-width: 680px) { .mr-perf-grid { grid-template-columns: 1fr; gap: 25px; } }
        .mr-perf-col { display: flex; flex-direction: column; gap: 22px; min-width: 0; }
        .mr-column-headline { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #ffffff; background: rgba(255, 255, 255, 0.04); padding: 6px 12px; clip-path: polygon(0 0, 90% 0, 100% 100%, 0% 100%); border-left: 3px solid #ff4d4d; margin-bottom: -6px; width: fit-content; }
        .mr-player-record-box { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.02); min-width: 0; }
        .mr-player-record-box.rank-1 { background: linear-gradient(135deg, rgba(255, 77, 77, 0.15) 0%, rgba(255, 77, 77, 0.03) 100%); border: 1px solid rgba(255, 77, 77, 0.3); transform: scale(1.01); }
        .mr-rank-num { font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.2); width: 10px; text-align: center; }
        .mr-rank-num.rank-1 { color: #ff4d4d; font-size: 12px; }
        .mr-mini-logo { width: 16px; height: 16px; object-fit: contain; }
        .mr-mini-name { flex-grow: 1; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mr-player-record-box.rank-1 .mr-mini-name { color: #ffffff; font-weight: 700; }
        .mr-mini-value { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.5); text-variant-numeric: tabular-nums; }
        .mr-mini-value.rank-1 { color: #ff4d4d; font-weight: 900; text-shadow: 0 0 15px rgba(255, 77, 77, 0.4); }
        .mr-player-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; width: 100%; margin-top: 20px; box-sizing: border-box; }
        @media (max-width: 768px) { .mr-player-grid { grid-template-columns: repeat(2, 1fr); } }
        .mr-player-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; padding: 12px; min-width: 0; display: flex; flex-direction: column; }
        .mr-card-headline { font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin-bottom: 20px; text-align: center; }
        .mr-metric-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 32px; min-height: 76px; }
        .mr-metric-row:last-child { margin-bottom: 0; }
        .mr-wave-box { width: 100%; height: 16px; margin-top: auto; }
        .mr-wave-box svg { width: 100%; height: 100%; }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 3 AF 10 (HTML-SKAL & FANE-NAVIGATION)
// ==========================================================================

function initMatchReportView(container) {
    container.innerHTML = `
        <div class="mr-main-container">
            <!-- URL SØGEBJÆLKE -->
            <div class="mr-search-box">
                <input type="text" id="mr-url-input" class="mr-input-field" placeholder="Indsæt FotMob kamp-URL (f.eks. https://fotmob.com...)" value="https://www.fotmob.com/en-GB/matches/bournemouth-vs-newcastle/2ysbu8#5795443">
                <button class="mr-btn" onclick="fetchMatchReportFeed()">Hent Analyse <i class="fa-solid fa-circle-notch fa-spin" id="mr-spinner" style="display:none;"></i></button>
            </div>

            <!-- FANE NAVIGATION -->
            <div class="mr-tabs-nav" id="mr-tabs-bar" style="display:none;">
                <button class="mr-tab-item active" id="tab-btn-stats" onclick="switchMatchTab('stats')">Match Stats</button>
                <button class="mr-tab-item" id="tab-btn-xg" onclick="switchMatchTab('xg')">Accumulated xG</button>
                <button class="mr-tab-item" id="tab-btn-momentum" onclick="switchMatchTab('momentum')">Game State</button>
                <button class="mr-tab-item" id="tab-btn-performers" onclick="switchMatchTab('performers')">Top Performers</button>
                <button class="mr-tab-item" id="tab-btn-player" onclick="switchMatchTab('player')">Player Stats</button>
            </div>

            <!-- CENTRAL INFOGRAFIK VISNING -->
            <div id="mr-display-target-area"></div>
        </div>
    `;
}

function switchMatchTab(tabId) {
    MATCH_ACTIVE_TAB = tabId;
    document.querySelectorAll('.mr-tab-item').forEach(b => b.classList.remove('active'));
    const activeBtn = getMatchReportEl(`tab-btn-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    renderActiveMatchVisualization();
}
// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 4 AF 10 (API SYNKRONISERING)
// ==========================================================================

// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 4 AF 10 (RETTET: .STRIP TIL .TRIM)
// ==========================================================================

async function fetchMatchReportFeed() {
    const urlInput = getMatchReportEl("mr-url-input");
    const spinner = getMatchReportEl("mr-spinner");
    
    // 🎯 RETTELSE: Vi bruger .trim() i stedet for .strip() for at fjerne mellemrum fejlfrit
    if (!urlInput || !urlInput.value.trim()) return;

    spinner.style.display = "inline-block";
    try {
        const res = await fetch(`${API_BASE_URL}/api/fetch-match?url=${encodeURIComponent(urlInput.value.trim())}`);
        if (res.ok) {
            MATCH_GLOBAL_DATA = await res.json();
            getMatchReportEl("mr-tabs-bar").style.display = "flex";
            
            // Sørg for at vælge den første spiller som default til Fig 5, hvis listen ikke er tom
            if (MATCH_GLOBAL_DATA.players && MATCH_GLOBAL_DATA.players.length > 0) {
                MATCH_SELECTED_PLAYER = MATCH_GLOBAL_DATA.players[0].playerId;
            } else {
                MATCH_SELECTED_PLAYER = null;
            }
            
            renderActiveMatchVisualization();
        } else {
            const err = await res.json();
            alert(`Fejl fra server: ${err.detail}`);
        }
    } catch (e) {
        console.error("MatchReport API fejl:", e);
        alert("Kunne ikke kontakte kampscraper-motoren på din backend.");
    } finally {
        spinner.style.display = "none";
    }
}

function renderActiveMatchVisualization() {
    if (!MATCH_GLOBAL_DATA) return;
    
    if (MATCH_ACTIVE_TAB === "stats") buildFig1MatchStats();
    else if (MATCH_ACTIVE_TAB === "xg") buildFig2AccumulatedXG();
    else if (MATCH_ACTIVE_TAB === "momentum") buildFig3GameState();
    else if (MATCH_ACTIVE_TAB === "performers") buildFig4TopPerformers();
    else if (MATCH_ACTIVE_TAB === "player") buildFig5PlayerStats();
}

// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 5 AF 10 (FÆLLES SCOREBOARD & DOWNLOAD)
// ==========================================================================

function generateSharedHeaderHTML(subtitle) {
    const info = MATCH_GLOBAL_DATA.match_info;
    const scores = info.scoreStr.split('-');
    const homeGoals = scores[0] ? scores[0].trim() : "0";
    const awayGoals = scores[1] ? scores[1].trim() : "0";

    return `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; padding:0 24px 15px 24px; margin-bottom:25px; text-align:center;">
            <div style="display:flex; align-items:center; justify-content:center; gap:14px; width:100%;">
                <div style="display:flex; align-items:center; gap:12px; font-size:22px; font-weight:900; text-transform:uppercase; justify-content:flex-end; flex:1;">
                    <span style="color:${info.homeColor};">${info.homeName}</span>
                    <div style="width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; padding:5px;">
                        <img src="https://fotmob.com{info.homeId}.png" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                </div>
                <div style="font-size:26px; font-weight:900; color:#fff; letter-spacing:1px; padding:0 10px;">${homeGoals} - ${awayGoals}</div>
                <div style="display:flex; align-items:center; gap:12px; font-size:22px; font-weight:900; text-transform:uppercase; justify-content:flex-start; flex:1;">
                    <div style="width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; padding:5px;">
                        <img src="https://fotmob.com{info.awayId}.png" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    <span style="color:${info.awayColor};">${info.awayName}</span>
                </div>
            </div>
            <div style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.3); letter-spacing:1.2px; text-transform:uppercase; margin-top:8px;">${subtitle} via per-90.streamlit.app</div>
        </div>
    `;
}

function triggerMatchReportDownload(filename, elementId) {
    const el = getMatchReportEl(elementId);
    if (!el) return;
    html2canvas(el, { scale: 3, backgroundColor: "#0B1220", useCORS: true }).then(canvas => {
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
}
// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 6 AF 10 (FIG 1 – MATCH STATS PITCH)
// ==========================================================================

function buildFig1MatchStats() {
    const container = getMatchReportEl("mr-display-target-area");
    const info = MATCH_GLOBAL_DATA.match_info;

    // Byg skudmarkører absolut
    let shotsHTML = "";
    MATCH_GLOBAL_DATA.shotmap.forEach(shot => {
        let is_og = !!shot.isOwnGoal;
        let effectiveTeam = is_og ? (shot.teamId == info.homeId ? info.awayId : info.homeId) : shot.teamId;
        
        let pctLeft = effectiveTeam == info.homeId ? (shot.x / 105) * 100 : 100 - ((shot.x / 105) * 100);
        let pctTop = effectiveTeam == info.homeId ? 100 - ((shot.y / 68) * 100) : (shot.y / 68) * 100;

        let color = "#C82929"; let shotContent = "";
        if (is_og) { color = "#D1257E"; shotContent = "&times;"; }
        else if (shot.eventType === "Goal") color = "#47B745";
        else if (shot.expectedGoalsOnTarget > 0) color = "#C8C329";

        let size = is_og ? 15 : Math.max(10, min(48, Math.sqrt(shot.expectedGoals) * 30));

        shotsHTML += `<div class="mr-shot-dot" style="left:${pctLeft.toFixed(2)}%; top:${pctTop.toFixed(2)}%; width:${size}px; height:${size}px; background:${is_og ? 'transparent' : color}; color:${color}; line-height:${size-2}px; font-size:${parseInt(size*1.6)}px;">${shotContent}</div>`;
    });

    // Byg de 8 midter-statistikrækker
    let statsOverlayRows = "";
    MATCH_GLOBAL_DATA.team_stats.forEach(s => {
        let hNum = parseFloat(s.home.replace('%','').split('/')[0]) || 0;
        let aNum = parseFloat(s.away.replace('%','').split('/')[0]) || 0;
        let tot = hNum + aNum;
        let hPct = tot > 0 ? (hNum / tot) * 100 : 50;

        statsOverlayRows += `
            <div class="mr-stat-row">
                <div class="mr-stat-meta"><span style="color:${info.homeColor};">${s.home}</span><span class="mr-stat-lbl">${s.title}</span><span style="color:${info.awayColor};">${s.away}</span></div>
                <div class="mr-bar-track">
                    <div class="mr-bar-fill" style="width:${hPct}%; background:${info.homeColor};"></div>
                    <div class="mr-bar-fill" style="width:${100-hPct}%; background:${info.awayColor};"></div>
                </div>
            </div>`;
    });

    container.innerHTML = `
        <div class="mr-capture-card" id="fig1-capture">
            ${generateSharedHeaderHTML("Match Report")}
            <div class="mr-pitch-wrapper">
                <svg viewBox="0 0 105 68"><rect x="0" y="0" width="105" height="68" class="mr-pitch-line" /><line x1="52.5" y1="0" x2="52.5" y2="68" class="mr-pitch-line" /><circle cx="52.5" cy="34" r="9.15" class="mr-pitch-line" /><rect x="0" y="13.85" width="16.5" height="40.3" class="mr-pitch-line" /><rect x="0" y="24.85" width="5.5" height="18.3" class="mr-pitch-line" /><rect x="88.5" y="13.85" width="16.5" height="40.3" class="mr-pitch-line" /><rect x="99.5" y="24.85" width="5.5" height="18.3" class="mr-pitch-line" /></svg>
                <div class="mr-markers-layer">${shotsHTML}</div>
                <div class="mr-stats-overlay">${statsOverlayRows}</div>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('match_report', 'fig1-capture')">Download as PNG</button></div>
    `;
}
// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 7 AF 10 (FIG 2 – ACCUMULATED xG TIMELINE)
// ==========================================================================

function buildFig2AccumulatedXG() {
    const container = getMatchReportEl("mr-display-target-area");
    const info = MATCH_GLOBAL_DATA.match_info;

    let hShots = MATCH_GLOBAL_DATA.shotmap.filter(s => s.teamId == info.homeId && !s.isOwnGoal).sort((a,b)=>a.min-b.min);
    let aShots = MATCH_GLOBAL_DATA.shotmap.filter(s => s.teamId == info.awayId && !s.isOwnGoal).sort((a,b)=>a.min-b.min);

    let maxMin = Math.max(90, Math.max(...MATCH_GLOBAL_DATA.shotmap.map(s=>s.min)));
    let totXGHome = hShots.reduce((sum,s)=>sum+s.expectedGoals, 0);
    let totXGAway = aShots.reduce((sum,s)=>sum+s.expectedGoals, 0);
    let maxY = Math.max(1.0, Math.ceil(Math.max(totXGHome, totXGAway) * 2) / 2);

    const getPathData = (shots) => {
        let cur = 0; let pts = ["M 0,100"];
        shots.forEach(s => {
            pts.append(`L ${(s.min/maxMin)*100},${100-(cur/maxY)*100}`);
            cur += s.expectedGoals;
            pts.append(`L ${(s.min/maxMin)*100},${100-(cur/maxY)*100}`);
        });
        pts.append(`L 100,${100-(cur/maxY)*100}`);
        return { line: pts.join(" "), area: pts.join(" ") + " L 100,100 L 0,100 Z" };
    };

    let hPaths = getPathData(hShots); let aPaths = getPathData(aShots);

    // Tegn mål-markører på kurverne
    let goalMarkersHTML = "";
    MATCH_GLOBAL_DATA.shotmap.filter(s => s.eventType === "Goal").forEach(g => {
        let tId = !!g.isOwnGoal ? (g.teamId == info.homeId ? info.awayId : info.homeId) : g.teamId;
        let shotsRef = tId == info.homeId ? hShots : aShots;
        let cumulative = shotsRef.filter(s => s.min <= g.min).reduce((sum,s)=>sum+s.expectedGoals, 0);

        let left = (g.min / maxMin) * 100;
        let top = 100 - (cumulative / maxY) * 100;

        goalMarkersHTML += `
            <div style="position:absolute; left:${left}%; top:${top}%; transform:translate(-50%, -50%); z-index:10; width:18px; height:18px; background:#fff; border-radius:50%; border:1px solid #000; box-shadow:0 2px 4px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
                <svg viewBox="0 0 24 24" style="width:12px; height:12px;"><circle cx="12" cy="12" r="11" fill="none" stroke="#000" stroke-width="2"/><path d="M12 7l4.76 3.45-1.76 5.55h-6l-1.76-5.55z" fill="#000"/></svg>
            </div>`;
    });

    container.innerHTML = `
        <div class="mr-capture-card" id="fig2-capture">
            ${generateSharedHeaderHTML(`Accumulated xG (Home: ${totXGHome.toFixed(2)} | Away: ${totXGAway.toFixed(2)})`)}
            <div class="mr-graph-frame">
                <div class="mr-y-axis"><span>${maxY.toFixed(1)}</span><span>${(maxY*0.5).toFixed(1)}</span><span>0.0</span></div>
                <div class="mr-svg-canvas">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="${hPaths.area}" fill="${info.homeColor}" fill-opacity="0.12"/>
                        <path d="${aPaths.area}" fill="${info.awayColor}" fill-opacity="0.12"/>
                        <path d="${hPaths.line}" fill="none" stroke="${info.homeColor}" stroke-width="1.2"/>
                        <path d="${aPaths.line}" fill="none" stroke="${info.awayColor}" stroke-width="1.2"/>
                    </svg>
                    <div class="mr-markers-layer" style="left:0;">${goalMarkersHTML}</div>
                </div>
            </div>
            <div class="mr-x-row"><div class="mr-y-spacer"></div><div class="mr-x-axis"><span>0'</span><span>45'</span><span>90'</span></div></div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('xg_timeline', 'fig2-capture')">Download as PNG</button></div>
    `;
}
// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 8 AF 10 (FIG 3 – GAME STATE / MOMENTUM)
// ==========================================================================

function buildFig3GameState() {
    const container = getMatchReportEl("mr-display-target-area");
    const info = MATCH_GLOBAL_DATA.match_info;
    const mData = MATCH_GLOBAL_DATA.momentum;

    if (mData.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px;">Ingen momentumdata tilgængelig.</div>`;
        return;
    }

    let maxMin = Math.max(90, Math.max(...mData.map(m=>m.minute)));

    // Simpelt rullende gennemsnit (window=6) til smoothing af bølgen
    let smoothedPoints = mData.map((m, idx) => {
        let start = Math.max(0, idx - 3); let end = Math.min(mData.length, idx + 4);
        let slice = mData.slice(start, end);
        let avg = slice.reduce((sum, item) => sum + item.value, 0) / slice.length;
        return { minute: m.minute, value: avg };
    });

    let hPoints = ["M 0,50"]; let aPoints = ["M 0,50"];
    smoothedPoints.forEach(p => {
        let x = (p.minute / maxMin) * 100;
        let y = 50 - (p.value / 100) * 42;
        hPoints.append(`L ${x.toFixed(2)},${y <= 50 ? y.toFixed(2) : 50}`);
        aPoints.append(`L ${x.toFixed(2)},${y >= 50 ? y.toFixed(2) : 50}`);
    });
    hPoints.append("L 100,50 Z"); aPoints.append("L 100,50 Z");

    container.innerHTML = `
        <div class="mr-capture-card" id="fig3-capture">
            ${generateSharedHeaderHTML("Game State & Momentum")}
            <div class="mr-graph-frame">
                <div class="mr-y-axis"><span style="color:${info.homeColor}; top:0%;">Dominans (H)</span><span style="top:50%; color:#475569;">Balanceret</span><span style="color:${info.awayColor}; top:100%;">Dominans (A)</span></div>
                <div class="mr-svg-canvas">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>
                        <path d="${hPoints.join(' ')}" fill="${info.homeColor}" fill-opacity="0.3"/>
                        <path d="${aPoints.join(' ')}" fill="${info.awayColor}" fill-opacity="0.3"/>
                    </svg>
                </div>
            </div>
            <div class="mr-x-row"><div class="mr-y-spacer"></div><div class="mr-x-axis"><span>0'</span><span>45'</span><span>90'</span></div></div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('game_momentum', 'fig3-capture')">Download as PNG</button></div>
    `;
}
// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 9 AF 10 (FIG 4 – TOP PERFORMERS GRID)
// ==========================================================================

function buildFig4TopPerformers() {
    const container = getMatchReportEl("mr-display-target-area");
    const pList = MATCH_GLOBAL_DATA.players;

    const columnsConfig = [
        { label: "Attacking", metrics: ["Expected goals (xG)", "Shots on target", "Successful dribbles", "Touches in opposition box"] },
        { label: "Passing", metrics: ["Expected assists (xA)", "Chances created", "Passes into final third", "Accurate long balls"] },
        { label: "Defending", metrics: ["Defensive actions", "Tackles", "Ground duels won", "Aerial duels won"] }
    ];

    let gridHTML = '<div class="mr-perf-grid">';
    columnsConfig.forEach(col => {
        let colContent = `<div class="mr-perf-col"><div class="mr-column-headline">${col.label}</div>`;
        
        col.metrics.forEach(metric => {
            let sorted = [...pList]
                .map(p => ({ name: p.playerName, tId: p.teamId, val: parseFloat(p.stats[metric]) || 0 }))
                .filter(p => p.val > 0)
                .sort((a,b) => b.val - a.val)
                .slice(0, 3);

            if (sorted.length > 0) {
                colContent += `<div class="mr-mc" style="display:flex; flex-direction:column; margin-top:12px;"><div class="mr-mt">${metric.toUpperCase()}</div>`;
                sorted.forEach((player, rank) => {
                    let displayVal = Number.isInteger(player.val) ? player.val : player.val.toFixed(2);
                    colContent += `
                        <div class="mr-player-record-box ${rank === 0 ? 'rank-1' : ''}">
                            <div class="mr-rank-num ${rank === 0 ? 'rank-1' : ''}">${rank + 1}</div>
                            <img class="mr-mini-logo" src="https://fotmob.com{player.tId}.png">
                            <span class="mr-mini-name">${player.name}</span>
                            <span class="mr-mini-value ${rank === 0 ? 'rank-1' : ''}">${displayVal}</span>
                        </div>`;
                });
                colContent += '</div>';
            }
        });
        colContent += '</div>';
        gridHTML += colContent;
    });
    gridHTML += '</div>';

    container.innerHTML = `
        <div class="mr-capture-card" id="fig4-capture" style="padding:44px 32px;">
            <div style="width:100%; display:flex; flex-direction:column; margin-bottom:40px;"><h1 style="font-size:30px; font-weight:900; text-transform:uppercase; margin:0; color:#fff;">Top <strong>Performers</strong></h1></div>
            ${gridHTML}
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('top_performers', 'fig4-capture')">Download as PNG</button></div>
    `;
}
// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 10 AF 10 (FIG 5 – PLAYER STATS WAVES)
// ==========================================================================

function buildFig5PlayerStats() {
    const container = getMatchReportEl("mr-display-target-area");
    const pList = MATCH_GLOBAL_DATA.players;

    let selectOptions = pList.map(p => `<option value="${p.playerId}" ${p.playerId == MATCH_SELECTED_PLAYER ? 'selected' : ''}>${p.playerName}</option>`).join('');
    let player = pList.find(p => p.playerId == MATCH_SELECTED_PLAYER) || pList[0];

    const groups = {
        "Expected": ['Expected goals (xG)', 'Expected assists (xA)', 'Expected goals on target (xGOT)'],
        "Passing": ['Chances created', 'Passes into final third', 'Accurate passes'],
        "Possession": ['Successful dribbles', 'Touches in opposition box', 'Touches'],
        "Defending": ['Defensive actions', 'Recoveries', 'Ground duels won']
    };

    let cardsHTML = '<div class="mr-player-grid">';
    for (const [gName, metrics] of Object.entries(groups)) {
        let inner = `<div class="mr-player-card"><div class="mr-card-headline">${gName.toUpperCase()}</div>`;
        metrics.forEach(m => {
            let pVal = player.stats[m] || 0;
            let displayVal = Number.isInteger(pVal) ? pVal : pVal.toFixed(2);
            
            // Simuleret harmonisk distributions-bølge (KDE approximation i SVG)
            let simWave = "M 0,25 Q 25,5 50,20 T 100,15 L 100,30 L 0,30 Z";
            let pctRank = pVal > 0 ? 75 : 15; // Percentil-klipning baseret på om metrikken er tom

            inner += `
                <div class="mr-metric-row">
                    <div style="display:flex; flex-direction:column;"><span style="font-size:20px; font-weight:900; color:#33c771;">${displayVal}</span><span style="font-size:10px; color:rgba(255,255,255,0.6); font-weight:700;">${m}</span></div>
                    <div class="mr-wave-box">
                        <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                            <clipPath id="clip-${m.replace(/\s+/g,'')}"><rect x="0" y="0" width="${pctRank}" height="30" /></clipPath>
                            <path d="${simWave}" fill="rgba(255,255,255,0.06)" />
                            <path d="${simWave}" fill="#33c771" clip-path="url(#clip-${m.replace(/\s+/g,'')})" />
                        </svg>
                    </div>
                </div>`;
        });
        inner += '</div>';
        cardsHTML += inner;
    }
    cardsHTML += '</div>';

    container.innerHTML = `
        <div style="margin-bottom:20px; display:flex; justify-content:center;"><select class="table-drawer-select" style="max-width:300px;" onchange="MATCH_SELECTED_PLAYER=this.value; buildFig5PlayerStats();">${selectOptions}</select></div>
        <div class="mr-capture-card" id="fig5-capture">
            <div style="width:100%; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:20px; display:flex; gap:28px; align-items:center;">
                <div style="width:80px; height:80px; background:#1e293b; border-radius:50%; border:3px solid #33c771; overflow:hidden;"><img src="https://fotmob.com{player.playerId}.png" style="width:100%; height:100%; object-fit:cover;"></div>
                <div><h2 style="font-size:28px; font-weight:900; text-transform:uppercase; margin:0; color:#fff;">${player.playerName}</h2><div style="font-size:12px; font-weight:500; color:#94a3b8; text-transform:uppercase; margin-top:4px;">${player.teamName.toUpperCase()}</div></div>
            </div>
            ${cardsHTML}
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('${player.playerName.replace(/\s+/g,'_')}_report', 'fig5-capture')">Download as PNG</button></div>
    `;
}
