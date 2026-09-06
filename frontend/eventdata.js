// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 1 AF 10 (MASTER STATES & SELEKTOR-LOGIK)
// ==========================================================================

let EV_GLOBAL_DATA = null;       // Indeholder det rå JSON-objekt fra eventdata.py
let EV_ACTIVE_TAB = "passmap";   // Aktive diagramfane: 'passmap', 'player', 'team', 'xt', 'zonal'
let EV_SELECTED_PLAYER = "";     // Den valgte spiller under Player Events
let EV_SELECTED_TEAM = "";       // Det valgte hold under Team/xT/Zonal visninger

// Mappings-ordbog til filter-tjekbokse i dine hændelsestabs
const EV_METRIC_CONFIG = ["Touch", "Opp. Box Touch", "Goal", "Shot", "Assist", "Shot Assist", "Regular Pass", "Pass into Final ⅓", "Cross", "Long Pass", "Won Take-on", "Defensive Action"];
let EV_SELECTED_METRICS = ["Touch"]; // Standardvalg

// 🎯 UNIK ISOLERET SELEKTOR: Forhindrer sammenstød i det globale navnerum
const getEvEl = id => document.getElementById(id);
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 2 AF 10 (WHOSCORED DASHBOARD CSS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('ev-core-styles')) return;
    const style = document.createElement('style');
    style.id = 'ev-core-styles';
    style.innerHTML = `
        .ev-main-container { width: 100%; max-width: 820px; margin: 0 auto; padding: 0 15px; box-sizing: border-box; font-family: 'Gabarito', sans-serif; color: #e5e7eb; }
        .ev-pitch-box { width: 100%; max-width: 660px; aspect-ratio: 105 / 68; position: relative; overflow: visible; background: transparent; margin: 0 auto 10px auto; }
        .ev-pitch-box svg { width: 100%; height: 100%; overflow: visible; display: block; }
        .ev-pitch-line { stroke: rgba(255, 255, 255, 0.22); stroke-width: 1.5; fill: none; }
        .ev-markers-layer { position: absolute; inset: 0; pointer-events: none; z-index: 10; }
        
        /* Comet lines og pile til afleveringsmapping */
        .ev-pass-arrow { stroke-dasharray: 0; stroke-linecap: round; }
        
        /* Legend styling nederst på banen */
        .ev-legend-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 20px; width: 100%; margin-top: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #fff; }
        .ev-legend-item { display: flex; align-items: center; gap: 6px; }
        .ev-legend-marker { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 3 AF 10 (HTML-SKAL & TJEKBOKS-SKUFFE)
// ==========================================================================

function initEventDataView(container) {
    container.innerHTML = `
        <div class="ev-main-container">
            <!-- URL INPUT -->
            <div class="mr-search-box">
                <input type="text" id="ev-url-input" class="mr-input-field" placeholder="Indsæt WhoScored kamp-URL (f.srv. https://whoscored.com...)" value="https://www.whoscored.com/matches/1983584/live/england-premier-league-2026-2027-newcastle-bournemouth">
                <button class="mr-btn" onclick="fetchWhoScoredEventFeed()">Hent Telemetri <i class="fa-solid fa-circle-notch fa-spin" id="ev-spinner" style="display:none;"></i></button>
            </div>

            <!-- FANE BJÆLKE -->
            <div class="mr-tabs-nav" id="ev-tabs-bar" style="display:none;">
                <button class="mr-tab-item active" id="ev-tab-passmap" onclick="switchEventTab('passmap')">Passmap</button>
                <button class="mr-tab-item" id="ev-tab-player" onclick="switchEventTab('player')">Player Events</button>
                <button class="mr-tab-item" id="ev-tab-team" onclick="switchEventTab('team')">Team Events</button>
                <button class="mr-tab-item" id="ev-tab-xt" onclick="switchEventTab('xt')">xT via Passes</button>
                <button class="mr-tab-item" id="ev-tab-zonal" onclick="switchEventTab('zonal')">Zonal Control</button>
            </div>

            <!-- FILTER PANEL TIL METRIKKER -->
            <div id="ev-metric-filter-panel" style="display:none; flex-wrap:wrap; gap:10px; margin-bottom:20px; justify-content:center;"></div>

            <!-- CENTRAL TEGNE-FLADE -->
            <div class="mr-capture-card" id="ev-capture-target-area" style="display:none;"></div>
        </div>
    `;
    buildWhoScoredMetricFiltersHTML();
}

function buildWhoScoredMetricFiltersHTML() {
    const p = getEvEl("ev-metric-filter-panel"); if (!p) return;
    p.innerHTML = EV_METRIC_CONFIG.map(m => {
        const checked = EV_SELECTED_METRICS.includes(m);
        return `<label class="table-drawer-checkbox-label" style="opacity:${checked?1:0.4}; background:#0f172a; padding:6px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);"><input type="checkbox" value="${m}" ${checked?"checked":""} onchange="handleEvMetricToggle(this)" style="accent-color:#00F0FF; margin-right:6px;">${m}</label>`;
    }).join('');
}
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 4 AF 10 (API-SYNKRONISERING & MENU-TOGGLING)
// ==========================================================================

async function fetchWhoScoredEventFeed() {
    const urlInput = getEvEl("ev-url-input"); const spinner = getEvEl("ev-spinner");
    if (!urlInput || !urlInput.value.trim()) return;

    spinner.style.display = "inline-block";
    try {
        const res = await fetch(`${API_BASE_URL}/api/fetch-events?url=${encodeURIComponent(urlInput.value.trim())}`);
        if (res.ok) {
            EV_GLOBAL_DATA = await res.json();
            EV_SELECTED_TEAM = EV_GLOBAL_DATA.match_info.homeId;
            
            // Sæt den første spiller i rækken som standardvalg til Player Events
            const firstPId = Object.keys(EV_GLOBAL_DATA.players_map)[0];
            EV_SELECTED_PLAYER = firstPId || "";

            getEvEl("ev-tabs-bar").style.display = "flex";
            getEvEl("ev-capture-target-area").style.display = "flex";
            switchEventTab(EV_ACTIVE_TAB);
        } else {
            const err = await res.json(); alert(`Fejl: ${err.detail}`);
        }
    } catch (e) { console.error(e); alert("Fejl under indlæsning af WhoScored hændelser."); }
    finally { spinner.style.display = "none"; }
}

function switchEventTab(tabId) {
    EV_ACTIVE_TAB = tabId;
    document.querySelectorAll('.mr-tab-item').forEach(b => b.classList.remove('active'));
    getEvEl(`ev-tab-${tabId}`).classList.add('active');

    // Vis kun tjekbokse til valg af metrics på de faner, der understøtter det (Player/Team Events)
    getEvEl("ev-metric-filter-panel").style.display = (tabId === "player" || tabId === "team") ? "flex" : "none";
    renderActiveEventVisualization();
}

function handleEvMetricToggle(cb) {
    if (cb.checked) { if (!EV_SELECTED_METRICS.includes(cb.value)) EV_SELECTED_METRICS.push(cb.value); }
    else { EV_SELECTED_METRICS = EV_SELECTED_METRICS.filter(m => m !== cb.value); }
    buildWhoScoredMetricFiltersHTML();
    renderActiveEventVisualization();
}
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 5 AF 10 (RENDERTRANSFORMATION & FÆLLES HEADER)
// ==========================================================================

function renderActiveEventVisualization() {
    if (!EV_GLOBAL_DATA) return;
    if (EV_ACTIVE_TAB === "passmap") buildWhoScoredFig1Passmap();
    else if (EV_ACTIVE_TAB === "player") buildWhoScoredFig2PlayerEvents();
    else if (EV_ACTIVE_TAB === "team") buildWhoScoredFig3TeamEvents();
    else if (EV_ACTIVE_TAB === "xt") buildWhoScoredFig4XTHeatmap();
    else if (EV_ACTIVE_TAB === "zonal") buildWhoScoredFig5ZonalControl();
}

function generateWhoScoredHeaderHTML(titleText) {
    const info = EV_GLOBAL_DATA.match_info;
    return `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; text-align:center; margin-bottom:20px;">
            <div style="display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:12px;">
                <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; padding:6px;"><img src="https://cloudfront.net{info.homeId}.png" style="max-width:100%; max-height:100%; object-fit:contain;"></div>
                <span style="font-size:24px; font-weight:900; color:#fff; letter-spacing:1px;">${info.scoreStr}</span>
                <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; padding:6px;"><img src="https://cloudfront.net{info.awayId}.png" style="max-width:100%; max-height:100%; object-fit:contain;"></div>
            </div>
            <div style="font-size:12px; font-weight:800; text-transform:uppercase; color:#fff; letter-spacing:0.5px;">${titleText}</div>
            <div style="font-size:10px; font-weight:600; color:rgba(255,255,255,0.25); margin-top:4px;">Generated via per-90.streamlit.app | WhoScored Telemetry</div>
        </div>
    `;
}

function getMetricColorAndProps(metric) {
    const conf = {
        'Touch': { c: 'orange', m: 'circle' }, 'Opp. Box Touch': { c: '#00f0ff', m: 'circle' },
        'Goal': { c: '#47B745', m: 'star' }, 'Shot': { c: '#3498db', m: 'cross' },
        'Assist': { c: '#47B745', m: 'line' }, 'Shot Assist': { c: '#3498db', m: 'line' },
        'Regular Pass': { c: '#64748b', m: 'line' }, 'Pass into Final ⅓': { c: '#a855f7', m: 'line' },
        'Cross': { c: '#ff0055', m: 'line' }, 'Long Pass': { c: '#f59e0b', m: 'line' },
        'Won Take-on': { c: '#00ff78', m: 'square' }, 'Defensive Action': { c: '#ff4d4d', m: 'square' }
    };
    return conf[metric] || { c: '#fff', m: 'circle' };
}
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 6 AF 10 (FIG 1 – PASSMAPS BEFORE 1ST SUB)
// ==========================================================================

function buildWhoScoredFig1Passmap() {
    const container = getEvEl("ev-capture-target-area");
    const info = EV_GLOBAL_DATA.match_info;

    // To uafhængige kontrol-dropdowns til at skifte hold-visning live på skærmen
    let teamSelectHTML = `<div style="display:flex; gap:10px; margin-bottom:15px;"><button class="mr-btn ${EV_SELECTED_TEAM==info.homeId?'':'active'}" style="background:${EV_SELECTED_TEAM==info.homeId?'#00F0FF':'#1e293b'}; color:#000;" onclick="EV_SELECTED_TEAM='${info.homeId}'; buildWhoScoredFig1Passmap();">${info.homeName}</button><button class="mr-btn" style="background:${EV_SELECTED_TEAM==info.awayId?'#FF0055':'#1e293b'}; color:#fff;" onclick="EV_SELECTED_TEAM='${info.awayId}'; buildWhoScoredFig1Passmap();">${info.awayName}</button></div>`;

    const subMin = EV_SELECTED_TEAM == info.homeId ? info.homeFirstSubMin : info.awayFirstSubMin;
    
    // Filtrering: Kun succesfulde åbne spil passes før holdets første udskiftning
    let passes = EV_GLOBAL_DATA.events.filter(e => e.teamId == EV_SELECTED_TEAM && e.type === "Pass" && e.success && !e.isSetPiece && e.minute < subMin);

    // Beregn gennemsnitspositioner pr. spiller (Brug kun spillere der startede inde)
    let playerStats = {};
    passes.forEach(p => {
        if (!playerStats[p.playerId]) playerStats[p.playerId] = { xSum: 0, ySum: 0, count: 0, xtSum: 0 };
        playerStats[p.playerId].xSum += p.x;
        playerStats[p.playerId].ySum += p.y;
        playerStats[p.playerId].count++;
        playerStats[p.playerId].xtSum += p.xtDiff;
    });

    let nodesHTML = ""; let linesHTML = "";
    const color = EV_SELECTED_TEAM == info.homeId ? info.homeColor : info.awayColor;

    // Tegn spillernoder (Skaleret efter akkumuleret xT score)
    for (const [pId, p] of Object.entries(playerStats)) {
        let avgX = p.xSum / p.count; let avgY = p.ySum / p.count;
        let meta = EV_GLOBAL_DATA.players_map[pId] || { name: "Player", shirtNo: "" };
        if (!meta.isFirstEleven) continue; // Skipper indskiftede spillere

        let initials = meta.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
        let size = 26 + Math.min(15, p.xtSum * 45); // Cirklens størrelse vokser jo mere Expected Threat spilleren skaber

        // Opta banekoordinater oversættes fejlfrit til SVG-procenter (X henad, Y nedad i SVG)
        nodesHTML += `<div class="mr-shot-dot" style="left:${avgX}%; top:${avgY}%; width:${size}px; height:${size}px; background:#fff; border:2px solid ${color}; color:#000; font-size:10px; font-weight:900; line-height:${size-2}px;">${initials}</div>`;
    }

    container.innerHTML = `
        ${teamSelectHTML}
        <div class="mr-capture-card" id="ev-capture-box">
            ${generateWhoScoredHeaderHTML(`PASSMAP (1' - ${subMin}')`)}
            <div class="ev-pitch-box">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="0" y="0" width="100" height="100" class="ev-pitch-line" /><line x1="50" y1="0" x2="50" y2="100" class="ev-pitch-line" /><circle cx="50" cy="50" r="9.15" class="ev-pitch-line" /><rect x="0" y="20" width="16.5" height="60" class="ev-pitch-line" /><rect x="83.5" y="20" width="16.5" height="60" class="ev-pitch-line" /></svg>
                <div class="ev-markers-layer">${nodesHTML}</div>
            </div>
            <div style="font-size:10px; color:rgba(255,255,255,0.4); text-transform:uppercase; margin-top:15px; font-weight:800;">Cirkler er gennemsnitlige positioner • Størrelse styres af akkumuleret xT</div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('whoscored_passmap', 'ev-capture-box')">Download as PNG</button></div>
    `;
}
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 7 AF 10 (FIG 2 & 3 – HÆNDELSES-MAPPING)
// ==========================================================================

function buildWhoScoredFig2PlayerEvents() {
    const pList = Object.entries(EV_GLOBAL_DATA.players_map).map(([id, p]) => `<option value="${id}" ${id==EV_SELECTED_PLAYER?'selected':''}>${p.name} (${p.position})</option>`).join('');
    let dropdownHTML = `<div style="margin-bottom:15px;"><select class="table-drawer-select" style="max-width:35px0px;" onchange="EV_SELECTED_PLAYER=this.value; buildWhoScoredFig2PlayerEvents();">${pList}</select></div>`;
    
    let evs = EV_GLOBAL_DATA.events.filter(e => e.playerId === EV_SELECTED_PLAYER);
    drawWhoScoredEventPitchMatrix(dropdownHTML, evs, `PLAYER EVENTS – ${EV_GLOBAL_DATA.players_map[EV_SELECTED_PLAYER]?.name.toUpperCase()}`);
}

function buildWhoScoredFig3TeamEvents() {
    const info = MATCH_GLOBAL_DATA ? MATCH_GLOBAL_DATA.match_info : EV_GLOBAL_DATA.match_info;
    let teamSelectHTML = `<div style="display:flex; gap:10px; margin-bottom:15px;"><button class="mr-btn" style="background:${EV_SELECTED_TEAM==info.homeId?'#00F0FF':'#1e293b'}; color:#000;" onclick="EV_SELECTED_TEAM='${info.homeId}'; buildWhoScoredFig3TeamEvents();">${info.homeName}</button><button class="mr-btn" style="background:${EV_SELECTED_TEAM==info.awayId?'#FF0055':'#1e293b'}; color:#fff;" onclick="EV_SELECTED_TEAM='${info.awayId}'; buildWhoScoredFig3TeamEvents();">${info.awayName}</button></div>`;
    
    let evs = EV_GLOBAL_DATA.events.filter(e => e.teamId == EV_SELECTED_TEAM);
    drawWhoScoredEventPitchMatrix(teamSelectHTML, evs, `TEAM EVENTS – ${EV_SELECTED_TEAM==info.homeId?info.homeName.toUpperCase():info.awayName.toUpperCase()}`);
}
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 8 AF 10 (COMET LINES BOX ENGINE)
// ==========================================================================

function drawWhoScoredEventPitchMatrix(controlsHTML, eventsList, subtitleText) {
    const container = getEvEl("ev-capture-target-area");
    let markersHTML = ""; let arrowsSVG = ""; let counts = {};
    
    EV_SELECTED_METRICS.forEach(m => counts[m] = 0);

    eventsList.forEach(e => {
        let matchedCategory = null;
        if (e.type === "Pass") {
            if (e.xtDiff > 0.05) matchedCategory = "Pass into Final ⅓";
            else if (e.isSetPiece) matchedCategory = "Long Pass";
            else matchedCategory = "Regular Pass";
        } else if (e.isTouch) {
            matchedCategory = (e.x > 82.5 && e.y > 20.5 && e.y < 79.5) ? "Opp. Box Touch" : "Touch";
        } else if (["Tackle", "Interception", "Clearance"].includes(e.type)) {
            matchedCategory = "Defensive Action";
        }

        if (matchedCategory && EV_SELECTED_METRICS.includes(matchedCategory)) {
            counts[matchedCategory]++;
            const props = getMetricColorAndProps(matchedCategory);
            
            if (props.m === "line" && e.endX !== null) {
                // Tegner en elegant afleveringspil med faldende opacitet bagud (Comet Line effekt)
                arrowsSVG += `<line x1="${e.x}%" y1="${e.y}%" x2="${e.endX}%" y2="${e.endY}%" stroke="${props.c}" stroke-width="1.8" opacity="0.45" class="ev-pass-arrow"/><circle cx="${e.endX}%" cy="${e.endY}%" r="1.5" fill="#000" stroke="${props.c}" stroke-width="1"/>`;
            } else {
                markersHTML += `<div class="mr-shot-dot" style="left:${e.x}%; top:${e.y}%; width:8px; height:8px; background:${props.c}; border:1px solid #000; box-shadow:none;"></div>`;
            }
        }
    });

    let legendHTML = '<div class="ev-legend-grid">' + EV_SELECTED_METRICS.map(m => `<div class="ev-legend-item"><span class="ev-legend-marker" style="background:${getMetricColorAndProps(m).c};"></span>${counts[m]}x ${m}</div>`).join('') + '</div>';

    container.innerHTML = `
        ${controlsHTML}
        <div class="mr-capture-card" id="ev-events-capture">
            ${generateWhoScoredHeaderHTML(subtitleText)}
            <div class="ev-pitch-box">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <rect x="0" y="0" width="100" height="100" class="ev-pitch-line" /><line x1="50" y1="0" x2="50" y2="100" class="ev-pitch-line" /><circle cx="50" cy="50" r="9.15" class="ev-pitch-line" />
                    <g>${arrowsSVG}</g>
                </svg>
                <div class="ev-markers-layer">${markersHTML}</div>
            </div>
            ${legendHTML}
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('whoscored_events', 'ev-events-capture')">Download as PNG</button></div>
    `;
}
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 9 AF 10 (FIG 4 – xT VIA PASSES HEATMAP)
// ==========================================================================

function buildWhoScoredFig4XTHeatmap() {
    const container = getEvEl("ev-capture-target-area");
    const info = EV_GLOBAL_DATA.match_info;

    let teamSelectHTML = `<div style="display:flex; gap:10px; margin-bottom:15px;"><button class="mr-btn" style="background:${EV_SELECTED_TEAM==info.homeId?'#00F0FF':'#1e293b'}; color:#000;" onclick="EV_SELECTED_TEAM='${info.homeId}'; buildWhoScoredFig4XTHeatmap();">${info.homeName}</button><button class="mr-btn" style="background:${EV_SELECTED_TEAM==info.awayId?'#FF0055':'#1e293b'}; color:#fff;" onclick="EV_SELECTED_TEAM='${info.awayId}'; buildWhoScoredFig4XTHeatmap();">${info.awayName}</button></div>`;

    let passes = EV_GLOBAL_DATA.events.filter(e => e.teamId == EV_SELECTED_TEAM && e.type === "Pass" && e.success && e.xtDiff > 0);

    // 🎯 12x8 GRID SCOUT MATRIX (Præcis ligesom din Streamlit xT-opdeling)
    let grid = Array(8).fill(0).map(() => Array(12).fill(0));
    let maxCellVal = 0.001;

    passes.forEach(p => {
        let c = Math.min(11, Math.floor((p.x / 100) * 12));
        let r = Math.min(7, Math.floor((p.y / 100) * 8));
        grid[r][c] += p.xtDiff;
        if (grid[r][c] > maxCellVal) maxCellVal = grid[r][c];
    });

    let rectsHTML = "";
    const color = EV_SELECTED_TEAM == info.homeId ? info.homeColor : info.awayColor;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 12; c++) {
            let val = grid[r][c];
            let opacity = maxCellVal > 0 ? (val / maxCellVal) * 0.65 : 0;
            if (opacity > 0.02) {
                // Tegner de taktiske xT-celler direkte ind i SVG-rummet
                rectsHTML += `<rect x="${(c/12)*100}" y="${(r/8)*100}" width="${100/12}" height="${100/8}" fill="${color}" fill-opacity="${opacity.toFixed(3)}" stroke="rgba(255,255,255,0.08)" stroke-width="0.3"/>`;
            }
        }
    }

    container.innerHTML = `
        ${teamSelectHTML}
        <div class="mr-capture-card" id="ev-xt-capture">
            ${generateWhoScoredHeaderHTML(`${EV_SELECTED_TEAM==info.homeId?info.homeName.toUpperCase():info.awayName.toUpperCase()}'S EXPECTED THREAT VIA PASSES`)}
            <div class="ev-pitch-box">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <g>${rectsHTML}</g>
                    <rect x="0" y="0" width="100" height="100" class="ev-pitch-line" /><line x1="50" y1="0" x2="50" y2="100" class="ev-pitch-line" /><circle cx="50" cy="50" r="9.15" class="ev-pitch-line" />
                </svg>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('whoscored_xt_map', 'ev-xt-capture')">Download as PNG</button></div>
    `;
}
// ==========================================================================
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 10 AF 10 (FIG 5 – ZONAL CONTROL MATRIX)
// ==========================================================================

function buildWhoScoredFig5ZonalControl() {
    const container = getEvEl("ev-capture-target-area");
    const info = EV_GLOBAL_DATA.match_info;

    let touches = EV_GLOBAL_DATA.events.filter(e => e.isTouch);

    // 🎯 4x3 TERRITORIAL BANESPALTNING (12 ZONER)
    let homeGrid = Array(3).fill(0).map(() => Array(4).fill(0));
    let awayGrid = Array(3).fill(0).map(() => Array(4).fill(0));

    touches.forEach(t => {
        let c = Math.min(3, Math.floor((t.x / 100) * 4));
        let r = Math.min(2, Math.floor((t.y / 100) * 3));
        
        // Spejlvender automatisk udeholdets berørings-koordinater kronologisk ligesom din Streamlit-kode
        if (t.teamId == info.awayId) {
            c = Math.min(3, Math.floor(((100 - t.x) / 100) * 4));
            r = Math.min(2, Math.floor(((100 - t.y) / 100) * 3));
            awayGrid[r][c]++;
        } else {
            homeGrid[r][c]++;
        }
    });

    let zonesHTML = "";
    
    // Loop igennem matricen for at generere og farvelægge de 12 zoner
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            let hCount = homeGrid[r][c]; 
            let aCount = awayGrid[r][c];
            let tot = hCount + aCount;
            
            let zoneColor = "#475569"; 
            let alpha = 0.05;
            
            if (tot > 0) {
                let share = hCount / tot;
                if (share > 0.55) { 
                    zoneColor = info.homeColor; 
                    alpha = 0.28; 
                } else if (share < 0.45) { 
                    zoneColor = info.awayColor; 
                    alpha = 0.28; 
                } else { 
                    zoneColor = "#64748b"; 
                    alpha = 0.12; 
                }
            }

            zonesHTML += `<rect x="${(c/4)*100}" y="${(r/3)*100}" width="25" height="${100/3}" fill="${zoneColor}" fill-opacity="${alpha}" stroke="rgba(0,0,0,0.5)" stroke-width="0.8"/>`;
        }
    }

    container.innerHTML = `
        <div class="mr-capture-card" id="ev-zonal-capture">
            ${generateWhoScoredHeaderHTML("ZONAL CONTROL BY TOUCHES")}
            <div style="display:flex; gap:15px; font-size:11px; font-weight:800; text-transform:uppercase; margin-bottom:15px;"><span style="color:${info.homeColor};">${info.homeName}</span><span>•</span><span style="color:${info.awayColor};">${info.awayName}</span><span>•</span><span style="color:#64748b;">Contested</span></div>
            <div class="ev-pitch-box">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                    <g>${zonesHTML}</g>
                    <rect x="0" y="0" width="100" height="100" class="ev-pitch-line" /><line x1="50" y1="0" x2="50" y2="100" class="ev-pitch-line" /><circle cx="50" cy="50" r="9.15" class="ev-pitch-line" />
                </svg>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('zonal_control', 'ev-zonal-capture')">Download as PNG</button></div>
    `;
}

