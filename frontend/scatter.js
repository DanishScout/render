// ==========================================================================
// PER 90 - SCATTER.JS - DEL 1 AF 5 (MASTER ARRAYS & CUSTOM-DRAWER CSS)
// ==========================================================================

let SCATTER_GLOBAL_DATA = null;
let SCATTER_X_AXIS = "npxG";
let SCATTER_Y_AXIS = "Assists";
let SCATTER_STAT_TYPE = "Per 90";

let SCATTER_FILTERS = {
    leagues: [],
    nationalities: [],
    positions: [],
    minAge: 0,
    maxAge: 100,
    minMins: 0,
    maxMins: 99999,
    highlightTeam: "",
    highlightPlayer: ""
};

let SCATTER_QUICK_HIGHLIGHTS = {
    top10x: false,
    top10y: false,
    u21: false,
    u19: false
};

const $sc = id => document.getElementById(id);

// 🎨 COMPREHENSIVE STYLE INJECTION: Med neongrønne flueben og live quick-dropdowns
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://googleapis.com');
        
        .scatter-chart-card { background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; padding: 30px; border-radius: 20px; width: 100%; max-width: 1100px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); box-sizing: border-box; position: relative; }
        
        /* 🎯 Den opdaterede Quick-Highlight Toolbar med integrerede menuer */
        .scatter-quick-toolbar { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 10px; width: 100%; max-width: 1100px; margin: 0 auto 25px; padding: 0 10px; box-sizing: border-box; }
        .scatter-quick-btn { padding: 9px 16px; border-radius: 6px; font-size: 11px; font-weight: 800; border: 1px solid rgba(255,255,255,0.08); background: rgba(15, 23, 42, 0.6); color: #94a3b8; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.2s ease; height: 38px; box-sizing: border-box; }
        .scatter-quick-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
        .scatter-quick-btn.active { background: var(--accent-purple) !important; border-color: var(--accent-purple); color: #06140c !important; box-shadow: 0 0 15px rgba(168,85,247,0.3); }

        /* Skuffe-layout grupper */
        .scatter-drawer-group { display: flex; flex-direction: column; gap: 6px; width: 100%; box-sizing: border-box; }
        .scatter-drawer-label { font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .scatter-drawer-select, .scatter-drawer-input { background: #07030c; color: #fff; border: 1px solid var(--border-color); padding: 10px 12px; border-radius: 6px; font-size: 13px; outline: none; cursor: pointer; width: 100%; box-sizing: border-box; font-family: 'Gabarito', sans-serif; }
        .scatter-drawer-input-row { display: flex; gap: 10px; width: 100%; }
        
        /* 🎯 Tjekboks containere indeni skuffen med dine neongrønne flueben */
        .sc-drawer-checkbox-box { background: #07030c; border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 11px; max-height: 160px; overflow-y: auto; }
        .sc-drawer-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 12.5px; color: var(--text-primary); transition: opacity 0.2s; }
        
        /* SVG-koordinat grafik */
        #scatter-svg-canvas { display: block; margin: 0 auto; overflow: visible; max-width: 100%; height: auto; }
        .scatter-grid-line { stroke: rgba(255,255,255,0.04); stroke-width: 1; }
        .scatter-axis-line { stroke: rgba(255,255,255,0.15); stroke-width: 1.5; }
        .scatter-axis-lbl { font-size: 10.5px; fill: #94a3b8; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; font-family: 'Gabarito', sans-serif; }
        
        .scatter-player-text-label { font-size: 9px; font-weight: 700; fill: #fff; font-family: 'Gabarito', sans-serif; pointer-events: none; filter: drop-shadow(0px 1px 2px rgba(0,0,0,1)); }
        .scatter-node-dot { stroke-width: 1.2; stroke: rgba(255,255,255,0.4); cursor: pointer; transition: r 0.12s ease, opacity 0.12s ease; }
        .scatter-node-dot:hover { r: 8.5 !important; opacity: 1 !important; stroke: #ffffff; }
        
        /* Scouting Colorbar */
        .scatter-colorbar-wrapper { display: flex; align-items: center; justify-content: center; gap: 15px; margin-top: 20px; font-family: 'Gabarito', sans-serif; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .scatter-colorbar-gradient { width: 250px; height: 8px; border-radius: 4px; background: linear-gradient(90deg, #1e3a8a 0%, #a21caf 50%, #00f0ff 100%); border: 1px solid rgba(255,255,255,0.05); }

        /* Gulglow Tooltip */
        .scatter-hover-tooltip { position: absolute; background: #060a12; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px 20px; font-family: 'Gabarito', sans-serif; font-size: 12px; color: #fff; pointer-events: none; opacity: 0; transition: opacity 0.12s ease; z-index: 200; box-shadow: 0 20px 40px rgba(0,0,0,0.7); min-width: 240px; box-sizing: border-box; }
        .sc-tt-header-box { border-left: 3px solid #f59e0b; padding-left: 14px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
        .sc-tt-name { font-size: 15px; font-weight: 900; margin: 0; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; }
        .sc-tt-meta { color: #64748b; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .sc-tt-body-box { display: flex; flex-direction: column; gap: 6px; padding-left: 17px; }
        .sc-tt-stat-row { display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px; }
        .sc-tt-stat-lbl { color: #94a3b8; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .sc-tt-stat-val { font-weight: 800; color: #f59e0b !important; font-size: 12px; text-shadow: 0 0 8px rgba(245,158,11,0.2); }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - SCATTER.JS - DEL 2 AF 5 (LAYOUT GENERATOR)
// ==========================================================================

async function initScatterView(container) {
    container.innerHTML = `
        <section id="view-scatter" class="content-view active" style="padding-top: 10px;">
            
            <!-- STORT FLOT HOVED-IKON OG DESIGNLINJE -->
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-circle-nodes" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Scatter Plot Analyse</span>
            </div>

            <!-- BUTTON DER ÅBNER SKUFFEN -->
            <div class="control-trigger-wrapper" style="margin-bottom: 25px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Plot <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>

            <!-- 🎯 NYT: QUICK-HIGHLIGHT TOOLBAR MED LIVE DROPDOWNS OVER CHARTET 🎯 -->
            <div class="scatter-quick-toolbar" id="scatter-live-quick-toolbar"></div>
            
            <!-- DET FLOTTE, MØRKE DIAGRAM-KORT (CAPTURE OMRÅDE) -->
            <div class="scatter-chart-card" id="scatter-capture-target-area">
                <div id="scatter-dynamic-vs-title" style="text-align: center; font-size: 18px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px;"></div>
                
                <div class="scatter-hover-tooltip" id="scatter-live-tooltip"></div>
                <svg width="730" height="500" viewBox="0 0 730 500" id="scatter-svg-canvas"></svg>
                
                <!-- MINI-COLORBAR INTEGRERET I BUNDEN AF KORTET -->
                <div class="scatter-colorbar-wrapper" id="scatter-live-colorbar" style="display:none;">
                    <span>0m</span><div class="scatter-colorbar-gradient"></div><span id="scatter-colorbar-max-text">3000m</span>
                </div>
            </div>

            <!-- JOGA BONITO DOWNLOAD KNAP I BUNDEN -->
            <div style="display: flex; justify-content: center; margin-top: 30px; width: 100%;">
                <button onclick="downloadScatterPNG()" style="background: var(--accent-purple); color: #06140c; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">Download Plot as PNG</button>
            </div>
        </section>
    `;
    
    await loadScatterAPIDataFeed();
}

function buildScatterQuickToolbarUI() {
    const bar = $sc("scatter-live-quick-toolbar"); if (!bar) return;
    
    const list = SCATTER_GLOBAL_DATA.players;
    const teams = ["Highlight Hold...", ...new Set(list.map(p => p.team).filter(Boolean).sort())];
    const players = ["Highlight Spillere...", ...new Set(list.map(p => p.player_name).filter(Boolean).sort())];

    const teamOptions = teams.map(t => `<option value="${t === "Highlight Hold..." ? "" : t}" ${t.toLowerCase() === SCATTER_FILTERS.highlightTeam ? 'selected' : ''}>${t}</option>`).join('');
    const playerOptions = players.map(p => `<option value="${p === "Highlight Spillere..." ? "" : p}" ${p.toLowerCase() === SCATTER_FILTERS.highlightPlayer ? 'selected' : ''}>${p}</option>`).join('');

    bar.innerHTML = `
        <button class="scatter-quick-btn ${SCATTER_QUICK_HIGHLIGHTS.top10x ? 'active' : ''}" onclick="toggleScatterQuickHighlight('top10x')">Top 10 X-Axis</button>
        <button class="scatter-quick-btn ${SCATTER_QUICK_HIGHLIGHTS.top10y ? 'active' : ''}" onclick="toggleScatterQuickHighlight('top10y')">Top 10 Y-Axis</button>
        <button class="scatter-quick-btn ${SCATTER_QUICK_HIGHLIGHTS.u21 ? 'active' : ''}" onclick="toggleScatterQuickHighlight('u21')">U21 Players</button>
        <button class="scatter-quick-btn ${SCATTER_QUICK_HIGHLIGHTS.u19 ? 'active' : ''}" onclick="toggleScatterQuickHighlight('u19')">U19 Players</button>
        
        <!-- 🎯 NYE DROPDOWNS INTEGRERET DIREKTE I TOOLBAREN MED RIGTIG STYLING 🎯 -->
        <select id="sc-toolbar-team" class="scatter-drawer-input" style="width: auto; height: 38px; padding: 0 12px;" onchange="handleToolbarFilterChange('team')">
            ${teamOptions}
        </select>
        <select id="sc-toolbar-player" class="scatter-drawer-input" style="width: auto; height: 38px; padding: 0 12px;" onchange="handleToolbarFilterChange('player')">
            ${playerOptions}
        </select>
    `;
}
// ==========================================================================
// PER 90 - SCATTER.JS - DEL 3 AF 5 (CHECKBOX DRAWER UI)
// ==========================================================================

function buildAndAppendScatterDrawerHTML() {
    const gammelDrawer = document.querySelector('.scatter-filter-drawer');
    if (gammelDrawer) gammelDrawer.remove();

    const list = SCATTER_GLOBAL_DATA.players;
    const availableAxes = SCATTER_GLOBAL_DATA.available_axes;

    const leagues = [...new Set(list.map(p => p.league).filter(Boolean).sort())];
    const nationalities = [...new Set(list.map(p => p.nationality).filter(Boolean).sort())];
    const positions = [...new Set(list.map(p => p.position).filter(Boolean).sort())];

    const xOptions = availableAxes.map(ax => `<option value="${ax}" ${ax === SCATTER_X_AXIS ? 'selected' : ''}>${ax}</option>`).join('');
    const yOptions = availableAxes.map(ax => `<option value="${ax}" ${ax === SCATTER_Y_AXIS ? 'selected' : ''}>${ax}</option>`).join('');
    
    // 🎯 FLUEBEN GENERATORER FOR LIGA, NATIONALITET OG POSITION 1:1 🎯
    const lCheckboxes = leagues.map(l => {
        const checked = SCATTER_FILTERS.leagues.includes(l);
        return `<label class="sc-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${l}" ${checked ? "checked" : ""} onchange="handleScatterCheckboxToggle(this, 'leagues')" style="accent-color: var(--accent-purple);"> ${l}</label>`;
    }).join('');

    const nCheckboxes = nationalities.map(n => {
        const checked = SCATTER_FILTERS.nationalities.includes(n);
        return `<label class="sc-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${n}" ${checked ? "checked" : ""} onchange="handleScatterCheckboxToggle(this, 'nationalities')" style="accent-color: var(--accent-purple);"> ${n}</label>`;
    }).join('');

    const pCheckboxes = positions.map(pos => {
        const checked = SCATTER_FILTERS.positions.includes(pos);
        return `<label class="sc-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${pos}" ${checked ? "checked" : ""} onchange="handleScatterCheckboxToggle(this, 'positions')" style="accent-color: var(--accent-purple);"> ${pos}</label>`;
    }).join('');

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer stats-filter-drawer scatter-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Plot Settings</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 14px; width: 100%; max-height: 85vh; overflow-y: auto;">
            
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Stat Type</label><select id="sc-opt-stat-type" class="scatter-drawer-select" onchange="handleScatterConfigChange()"><option value="Per 90" ${SCATTER_STAT_TYPE === "Per 90" ? "selected" : ""}>Per 90</option><option value="Total" ${SCATTER_STAT_TYPE === "Total" ? "selected" : ""}>Total</option></select></div>
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Choose X Axis</label><select id="sc-opt-x-axis" class="scatter-drawer-select" onchange="handleScatterConfigChange()">${xOptions}</select></div>
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Choose Y Axis</label><select id="sc-opt-y-axis" class="scatter-drawer-select" onchange="handleScatterConfigChange()">${yOptions}</select></div>
            
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Ligaer</label><div class="sc-drawer-checkbox-box">${lCheckboxes}</div></div>
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Nationaliteter</label><div class="sc-drawer-checkbox-box">${nCheckboxes}</div></div>
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Positioner</label><div class="sc-drawer-checkbox-box">${pCheckboxes}</div></div>

            <div class="scatter-drawer-group">
                <label class="scatter-drawer-label">Alder (Min / Max)</label>
                <div class="scatter-drawer-input-row">
                    <input type="number" id="sc-filt-min-age" class="scatter-drawer-input" value="${SCATTER_FILTERS.minAge}" oninput="handleScatterFilterInputChange()">
                    <input type="number" id="sc-filt-max-age" class="scatter-drawer-input" value="${SCATTER_FILTERS.maxAge}" oninput="handleScatterFilterInputChange()">
                </div>
            </div>
            <div class="scatter-drawer-group">
                <label class="scatter-drawer-label">Minutter (Min / Max)</label>
                <div class="scatter-drawer-input-row">
                    <input type="number" id="sc-filt-min-mins" class="scatter-drawer-input" value="${SCATTER_FILTERS.minMins}" oninput="handleScatterFilterInputChange()">
                    <input type="number" id="sc-filt-max-mins" class="scatter-drawer-input" value="${SCATTER_FILTERS.maxMins}" oninput="handleScatterFilterInputChange()">
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(drawerDiv);
}

function handleScatterCheckboxToggle(cb, key) {
    const val = cb.value;
    if (cb.checked) {
        if (!SCATTER_FILTERS[key].includes(val)) SCATTER_FILTERS[key].push(val);
    } else {
        SCATTER_FILTERS[key] = SCATTER_FILTERS[key].filter(v => v !== val);
    }
    cb.parentElement.style.opacity = cb.checked ? '1' : '0.4';
    buildScatterPlotVektorEngine();
}
// ==========================================================================
// PER 90 - SCATTER.JS - DEL 4 AF 5 (API SYNC & RUNTIME FILTERS)
// ==========================================================================

async function loadScatterAPIDataFeed() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/scatter-data?stat_type=${encodeURIComponent(SCATTER_STAT_TYPE)}`);
        if (res.ok) {
            SCATTER_GLOBAL_DATA = await res.json();
            const list = SCATTER_GLOBAL_DATA.players;

            if (list.length > 0) {
                const ages = list.map(p => p.age).filter(a => a > 0);
                const mins = list.map(p => p.mins_played).filter(m => m > 0);
                SCATTER_FILTERS.minAge = Math.min(...ages); SCATTER_FILTERS.maxAge = Math.max(...ages);
                SCATTER_FILTERS.minMins = Math.min(...mins); SCATTER_FILTERS.maxMins = Math.max(...mins);
            }

            buildAndAppendScatterDrawerHTML();
            buildScatterQuickToolbarUI();
            buildScatterPlotVektorEngine();
        }
    } catch (e) { console.error("Scatter API fejl:", e); }
}

async function handleScatterConfigChange() {
    const typeSelect = $sc("sc-opt-stat-type"), xSelect = $sc("sc-opt-x-axis"), ySelect = $sc("sc-opt-y-axis");
    if (!typeSelect || !xSelect || !ySelect) return;
    const nytType = typeSelect.value; SCATTER_X_AXIS = xSelect.value; SCATTER_Y_AXIS = ySelect.value;
    if (nytType !== SCATTER_STAT_TYPE) { SCATTER_STAT_TYPE = nytType; await loadScatterAPIDataFeed(); } 
    else { buildScatterPlotVektorEngine(); }
}

function handleScatterFilterInputChange() {
    if (!$sc("sc-filt-min-age")) return;
    SCATTER_FILTERS.minAge = parseInt($sc("sc-filt-min-age").value) || 0;
    SCATTER_FILTERS.maxAge = parseInt($sc("sc-filt-max-age").value) || 100;
    SCATTER_FILTERS.minMins = parseInt($sc("sc-filt-min-mins").value) || 0;
    SCATTER_FILTERS.maxMins = parseInt($sc("sc-filt-max-mins").value) || 99999;
    buildScatterPlotVektorEngine();
}

// 🎯 EVENT HANDLER TIL DE NYE TOOLBAR DROPDOWNS 1:1 🎯
function handleToolbarFilterChange(type) {
    if (type === 'team') {
        SCATTER_FILTERS.highlightTeam = $sc("sc-toolbar-team").value.trim().toLowerCase();
    } else if (type === 'player') {
        SCATTER_FILTERS.highlightPlayer = $sc("sc-toolbar-player").value.trim().toLowerCase();
    }
    buildScatterPlotVektorEngine();
}

function toggleScatterQuickHighlight(key) {
    SCATTER_QUICK_HIGHLIGHTS[key] = !SCATTER_QUICK_HIGHLIGHTS[key];
    buildScatterQuickToolbarUI();
    buildScatterPlotVektorEngine();
}
// ==========================================================================
// PER 90 - SCATTER.JS - DEL 5A AF 5 (ROUNDED AXES & MINUTES COLOR ENGINE)
// ==========================================================================

function buildScatterPlotVektorEngine() {
    const svg = $sc("scatter-svg-canvas"); if (!svg || !SCATTER_GLOBAL_DATA) return;
    svg.innerHTML = "";

    const titleContainer = $sc("scatter-dynamic-vs-title");
    if (titleContainer) titleContainer.innerText = `${SCATTER_X_AXIS} vs. ${SCATTER_Y_AXIS}`;

    const padding = { top: 30, right: 40, bottom: 60, left: 65 };
    const width = 730, height = 500;
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // 1. MULTI-SELECT ARRAY-FILTRERING FOR LIGA, NATIONALITET OG POSITION 🎯
    const filteredPlayers = SCATTER_GLOBAL_DATA.players.filter(p => {
        if (SCATTER_FILTERS.leagues.length > 0 && !SCATTER_FILTERS.leagues.includes(p.league)) return false;
        if (SCATTER_FILTERS.nationalities.length > 0 && !SCATTER_FILTERS.nationalities.includes(p.nationality)) return false;
        if (SCATTER_FILTERS.positions.length > 0 && !SCATTER_FILTERS.positions.includes(p.position)) return false;
        if (p.age < SCATTER_FILTERS.minAge || p.age > SCATTER_FILTERS.maxAge) return false;
        if (p.mins_played < SCATTER_FILTERS.minMins || p.mins_played > SCATTER_FILTERS.maxMins) return false;
        return true;
    });

    if (filteredPlayers.length === 0) {
        svg.innerHTML = `<text x="${width/2}" y="${height/2}" fill="#64748b" text-anchor="middle" font-weight="700">INGEN MATCHER DINE FILTRE</text>`;
        return;
    }

    let xVals = filteredPlayers.map(p => p.stats[SCATTER_X_AXIS] || 0);
    let yVals = filteredPlayers.map(p => p.stats[SCATTER_Y_AXIS] || 0);
    let minMinsGlobal = Math.min(...filteredPlayers.map(p => p.mins_played));
    let maxMinsGlobal = Math.max(...filteredPlayers.map(p => p.mins_played));

    if ($sc("scatter-live-colorbar")) {
        $sc("scatter-live-colorbar").style.display = "flex";
        $sc("scatter-colorbar-max-text").innerText = `${maxMinsGlobal}m`;
    }

    // 2. MATEMATISK RETTELSE: Udregner pæne, helt runde akseintervaller (fx 0.20 eller 0.35) [10]
    const roundToNiceInterval = (val, roundUp) => {
        if (val === 0) return 0;
        const factor = val > 10 ? 5 : (val > 1 ? 0.5 : 0.05);
        return roundUp ? Math.ceil(val / factor) * factor : Math.floor(val / factor) * factor;
    };

    let minX = roundToNiceInterval(Math.min(...xVals), false), maxX = roundToNiceInterval(Math.max(...xVals), true);
    let minY = roundToNiceInterval(Math.min(...yVals), false), maxY = roundToNiceInterval(Math.max(...yVals), true);
    if (maxX === minX) maxX += 1; if (maxY === minY) maxY += 1;

    const getXPixel = v => padding.left + ((v - minX) / (maxX - minX)) * graphWidth;
    const getYPixel = v => padding.top + graphHeight - ((v - minY) / (maxY - minY)) * graphHeight;

    // 3. MINUTTER FARVEMOTOR: Går fra Mørkeblå -> Lilla -> Lys Cyan [10]
    const getMinutesColor = (m) => {
        const pct = (m - minMinsGlobal) / (maxMinsGlobal - minMinsGlobal || 1);
        if (pct < 0.5) {
            return `rgb(${Math.round(30 + 132 * (pct * 2))}, ${Math.round(58 - 30 * (pct * 2))}, ${Math.round(138 + 37 * (pct * 2))})`;
        } else {
            return `rgb(${Math.round(162 - 162 * ((pct - 0.5) * 2))}, ${Math.round(28 + 212 * ((pct - 0.5) * 2))}, ${Math.round(175 + 80 * ((pct - 0.5) * 2))})`;
        }
    };

    let markup = "";

    // Tegn baggrunds-grid
    for (let i = 0; i <= 4; i++) {
        const xVal = minX + (i / 4) * (maxX - minX), yVal = minY + (i / 4) * (maxY - minY);
        const px = getXPixel(xVal), py = getYPixel(yVal);
        markup += `<line x1="${px}" y1="${padding.top}" x2="${px}" y2="${padding.top + graphHeight}" class="scatter-grid-line" style="stroke-dasharray:3,3;" />`;
        markup += `<line x1="${padding.left}" y1="${py}" x2="${padding.left + graphWidth}" y2="${py}" class="scatter-grid-line" style="stroke-dasharray:3,3;" />`;
    }

    markup += `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + graphHeight}" class="scatter-axis-line" />`;
    markup += `<line x1="${padding.left}" y1="${padding.top + graphHeight}" x2="${padding.left + graphWidth}" y2="${padding.top + graphHeight}" class="scatter-axis-line" />`;

    markup += `<text x="${padding.left}" y="${padding.top + graphHeight + 16}" fill="#475569" font-size="10" text-anchor="middle">${minX.toFixed(2)}</text>`;
    markup += `<text x="${padding.left + graphWidth}" y="${padding.top + graphHeight + 16}" fill="#475569" font-size="10" text-anchor="middle">${maxX.toFixed(2)}</text>`;
    markup += `<text x="${padding.left - 8}" y="${padding.top + graphHeight}" fill="#475569" font-size="10" text-anchor="end" dominant-baseline="middle">${minY.toFixed(2)}</text>`;
    markup += `<text x="${padding.left - 8}" y="${padding.top}" fill="#475569" font-size="10" text-anchor="end" dominant-baseline="middle">${maxY.toFixed(2)}</text>`;

    // Kalder næste trin (Del 5b) for at færdiggøre prikkerne og tooltippet
    continueBuildingScatterPlotPoints(svg, markup, filteredPlayers, getXPixel, getYPixel, getMinutesColor);
}
// ==========================================================================
// PER 90 - SCATTER.JS - DEL 5B AF 5 (NODE DOT ENGINE & YELLOW-GLOW TOOLTIP)
// ==========================================================================

function continueBuildingScatterPlotPoints(svg, markup, filteredPlayers, getXPixel, getYPixel, getMinutesColor) {
    const sortedX = [...filteredPlayers].sort((a,b) => (b.stats[SCATTER_X_AXIS]||0) - (a.stats[SCATTER_X_AXIS]||0)).slice(0, 10);
    const sortedY = [...filteredPlayers].sort((a,b) => (b.stats[SCATTER_Y_AXIS]||0) - (a.stats[SCATTER_Y_AXIS]||0)).slice(0, 10);

    filteredPlayers.forEach(p => {
        const xV = p.stats[SCATTER_X_AXIS] || 0, yV = p.stats[SCATTER_Y_AXIS] || 0;
        const cx = getXPixel(xV), cy = getYPixel(yV);

        const isTarget = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER && p.player_name.toLowerCase() === CURRENT_SELECTED_PLAYER.toLowerCase());
        
        // 🎯 HIGHLIGHT VALÍDATOR: Læser nu både knapper og dine to nye live toolbar-dropdowns
        let isHighlighted = false;
        if (SCATTER_QUICK_HIGHLIGHTS.top10x && sortedX.includes(p)) isHighlighted = true;
        if (SCATTER_QUICK_HIGHLIGHTS.top10y && sortedY.includes(p)) isHighlighted = true;
        if (SCATTER_QUICK_HIGHLIGHTS.u21 && p.age > 0 && p.age <= 21) isHighlighted = true;
        if (SCATTER_QUICK_HIGHLIGHTS.u19 && p.age > 0 && p.age <= 19) isHighlighted = true;
        if (SCATTER_FILTERS.highlightTeam && p.team.toLowerCase() === SCATTER_FILTERS.highlightTeam) isHighlighted = true;
        if (SCATTER_FILTERS.highlightPlayer && p.player_name.toLowerCase() === SCATTER_FILTERS.highlightPlayer) isHighlighted = true;

        // OPACITY ENGINE: Hvis noget er highlighted, dæmpes de andre prikker helt ned til 0.12!
        const anyHighlightActive = SCATTER_QUICK_HIGHLIGHTS.top10x || SCATTER_QUICK_HIGHLIGHTS.top10y || SCATTER_QUICK_HIGHLIGHTS.u21 || SCATTER_QUICK_HIGHLIGHTS.u19 || SCATTER_FILTERS.highlightTeam || SCATTER_FILTERS.highlightPlayer;
        const opacity = isTarget ? 1 : (isHighlighted ? 1 : (anyHighlightActive ? 0.12 : 0.45));
        
        const nodeColor = isTarget ? "#d946ef" : getMinutesColor(p.mins_played);
        const radius = isTarget ? 6.5 : (isHighlighted ? 5.5 : 4.5);

        const cleanName = p.player_name.replace(/'/g, "\\\\'");
        const cleanTeam = p.team.replace(/'/g, "\\\\'");
        const cleanLeague = p.league.replace(/'/g, "\\\\'");
        const cleanPos = p.position.replace(/'/g, "\\\\'");
        const cleanNat = p.nationality.replace(/'/g, "\\\\'");

        markup += `<circle class="scatter-node-dot" cx="${cx}" cy="${cy}" r="${radius}" fill="${nodeColor}" style="opacity: ${opacity};"
            onmouseover="showScatterLiveTooltip(event, '${cleanName}', '${cleanTeam}', '${cleanLeague}', '${cleanPos}', '${cleanNat}', ${p.age}, ${p.mins_played}, ${xV}, ${yV})" 
            onmouseout="hideScatterLiveTooltip()" />`;

        if (isHighlighted || isTarget) {
            markup += `<text x="${cx}" y="${cy - 9}" class="scatter-player-text-label" text-anchor="middle" style="opacity: ${opacity};">${p.player_name}</text>`;
        }
    });

    svg.innerHTML = markup;
}

// 🎯 DIT RENE UNIFORME YELLOW-GLOW SCOUTING TOOLTIP FRA SCREENSHOT 1:1 🎯
function showScatterLiveTooltip(e, name, team, league, pos, nat, age, mins, xVal, yVal) {
    const tooltip = $sc("scatter-live-tooltip"); if (!tooltip) return;
    
    // 1:1 Højre side tvinges over i den præcise, rene neongule gulglow farve!
    tooltip.innerHTML = `
        <div class="sc-tt-header-box">
            <div class="sc-tt-name">${name}</div>
            <div class="sc-tt-meta">${team} | ${league}</div>
        </div>
        <div class="sc-tt-body-box">
            <div class="sc-tt-stat-row"><span class="sc-tt-stat-lbl">Position:</span><span class="sc-tt-stat-val" style="color:#00f0ff;">${pos}</span></div>
            <div class="sc-tt-stat-row"><span class="sc-tt-stat-lbl">Nationalitet:</span><span class="sc-tt-stat-val" style="color:#fff;">${nat}</span></div>
            <div class="sc-tt-stat-row"><span class="sc-tt-stat-lbl">Alder:</span><span class="sc-tt-stat-val">${age} ÅR</span></div>
            <div class="sc-tt-stat-row"><span class="sc-tt-stat-lbl">Minutter:</span><span class="sc-tt-stat-val">${mins}m</span></div>
            <div class="sc-tt-stat-row" style="margin-top:4px;"><span class="sc-tt-stat-lbl">${SCATTER_X_AXIS}:</span><span class="sc-tt-stat-val">${xVal.toFixed(2)}</span></div>
            <div class="sc-tt-stat-row"><span class="sc-tt-stat-lbl">${SCATTER_Y_AXIS}:</span><span class="sc-tt-stat-val">${yVal.toFixed(2)}</span></div>
        </div>
    `;

    const rect = $sc("scatter-capture-target-area").getBoundingClientRect();
    tooltip.style.left = `${e.clientX - rect.left + 15}px`;
    tooltip.style.top = `${e.clientY - rect.top + 15}px`;
    tooltip.style.opacity = "1";
}

function hideScatterLiveTooltip() { 
    const tooltip = $sc("scatter-live-tooltip"); 
    if (tooltip) tooltip.style.opacity = "0"; 
}

function downloadScatterPNG() {
    const el = $sc("scatter-capture-target-area"); if (!el) return;
    html2canvas(el, { scale: 4, backgroundColor: "#0B1220", useCORS: true, logging: false }).then(canvas => {
        const link = document.createElement("a"); link.download = `scatter_plot_${SCATTER_X_AXIS}_vs_${SCATTER_Y_AXIS}.png`;
        link.href = canvas.toDataURL("image/png"); link.click();
    });
}

document.addEventListener("click", e => {
    if (!e.target.closest('#scatter-player-wrapper')) { const p = $sc("scatter-player-options"); if(p) p.style.display = "none"; }
});
