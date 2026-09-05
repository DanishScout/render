// ==========================================================================
// PER 90 - RADAR.JS - RETTET DEL 1 AF 4 (ISOLERET LOKAL CSS - INGEN PIZZA-STØJ)
// ==========================================================================

const AVAILABLE_RADAR_METRICS = [
    "Goals", "npxG", "Shots On Target", "On Target %", "Assists", "xA", 
    "Key Passes", "xT via Live Passes", "Successful Dribbles", "Dribble Attempts", 
    "Dribble Success %", "Tackles Won %", "Aerials Won %", "Duels Won %", "Tackles Won"
];

const RADAR_CATEGORIES = {
    "Shooting": { "Goals": "Goals", "npxG": "npxG", "Shots On Target": "Shots On Target", "On Target %": "On Target %" },
    "Passing": { "Assists": "Assists", "xA": "xA", "Key Passes": "Key Passes", "xT via Live Passes": "xT via Live Passes" },
    "Possession": { "Successful Dribbles": "Successful Dribbles", "Dribble Attempts": "Dribble Attempts", "Dribble Success %": "Dribble Success %" },
    "Defending": { "Tackles Won %": "Tackles Won %", "Aerials Won %": "Aerials Won %", "Duels Won %": "Duels Won %", "Tackles Won": "Tackles Won" }
};

let RADAR_PLAYER_1 = "", RADAR_PLAYER_2 = "";
let RADAR_COLOR_1 = "#00f0ff", RADAR_COLOR_2 = "#d946ef";

const $r = id => document.getElementById(id);

// 🎯 LOKALISERET STYLE INJECTION: Nu påvirker disse regler KUN radar-fanen!
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://googleapis.com');
        #view-radar .wrap { max-width: 100%; margin: auto; padding: 10px; background: #0B1220; display: flex; flex-direction: column; align-items: center; }
        #view-radar .chart-container { background: linear-gradient(180deg, #0f172a 0%, #020617 100%); padding: 30px; border-radius: 20px; width: 100%; max-width: 710px; margin: 10px auto; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); box-sizing: border-box; }
        #view-radar .h-cnt { position: relative; display: flex; flex-direction: row; height: 110px; margin-bottom: 35px; border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); background: rgba(15, 23, 42, 0.6); }
        #view-radar .p-panel { flex: 1; width: 50%; display: flex; flex-direction: column; justify-content: center; padding: 0 25px; z-index: 1; overflow: hidden; box-sizing: border-box; }
        #view-radar .p-panel.left { align-items: flex-start; background: linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(0,0,0,0) 80%); }
        #view-radar .p-panel.right { align-items: flex-end; text-align: right; background: linear-gradient(315deg, rgba(217,70,239,0.08) 0%, rgba(0,0,0,0) 80%); }
        #view-radar .h-divider { position: absolute; left: 50%; top: 10%; bottom: 10%; width: 1px; background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.35), transparent); transform: translateX(-50%); z-index: 2; }
        
        /* Tilføjet #view-radar foran navnet, så pizzaens .p-nm (28px) overlever i fred! */
        #view-radar .p-nm { font-size: 15px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 2px; opacity: 0.95; z-index: 2; }
        #view-radar .b-tx { color: #00f0ff; text-shadow: 0 0 15px rgba(0,240,255,0.3); } 
        #view-radar .p-tx { color: #d946ef; text-shadow: 0 0 15px rgba(217,70,239,0.3); }
        #view-radar .p-row { display: flex; align-items: center; gap: 6px; margin-top: 6px; z-index: 2; }
        #view-radar .info-tag { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.05); color: #f1f5f9; letter-spacing: 0.5px; text-transform: uppercase; }
        #view-radar .left .info-tag { border-left: 2px solid #00f0ff; }
        #view-radar .right .info-tag { border-right: 2px solid #d946ef; }
        
        /* Låser SVG specifikt til radaren */
        #radar-svg-element { display: block; margin: 0 auto; overflow: visible; max-width: 100%; height: auto; }
        #view-radar .grid-poly { fill: rgba(255,255,255,0.005); stroke: rgba(255,255,255,0.1); }
        #view-radar .grid-line { stroke: rgba(255,255,255,0.075); stroke-dasharray: 4,4; }
        #view-radar .ax-lbl { font-size: 10px; fill: #94a3b8; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; font-family: 'Gabarito', sans-serif; }
        #view-radar .pl-b { fill: rgba(0,240,255,0.06); stroke: #00f0ff; stroke-width: 2.2; stroke-linejoin: round; }
        #view-radar .pl-p { fill: rgba(217,70,239,0.06); stroke: #d946ef; stroke-width: 2.2; stroke-linejoin: round; }
        #view-radar .n-b { fill: #00f0ff; opacity: 0.9; stroke: #ffffff; stroke-width: 1; } 
        #view-radar .n-p { fill: #d946ef; opacity: 0.9; stroke: #ffffff; stroke-width: 1; }
        #view-radar .chart-footer { text-align: center; width: 100%; margin-top: 25px; font-size: 12px; opacity: 0.25; font-family: 'Gabarito', sans-serif; }
        #view-radar .chart-footer-source { text-align: center; width: 100%; margin-top: 6px; font-size: 12px; opacity: 0.25; font-family: 'Gabarito', sans-serif; }

        #view-radar .svg-score-rect-p1 { fill: rgba(0, 240, 255, 0.04); stroke: #00f0ff; stroke-width: 1; }
        #view-radar .svg-score-rect-p2 { fill: rgba(217, 70, 239, 0.04); stroke: #d946ef; stroke-width: 1; }
        #view-radar .svg-score-text { font-size: 10px; font-weight: 700; font-family: 'Gabarito', sans-serif; dominant-baseline: central; text-anchor: middle; }
    `;
    document.head.appendChild(style);
});

// ==========================================================================
// PER 90 - RADAR.JS - DEL 2 AF 4 (FRONTEND VISNING & SETTINGS DRAWER)
// ==========================================================================

async function initRadarView(container) {
    container.innerHTML = `
        <section id="view-radar" class="content-view active">
            
            <!-- 🎯 DIT STORE IKON OG IDENTISKE HOVED-OVER-SKRIFT ER TILBAGE 1:1 🎯 -->
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-circle-nodes" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Radar Sammenligning</span>
            </div>

            <div class="control-trigger-wrapper" style="margin-bottom: 24px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Radar <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            
            <!-- DET VISUELLE BILLEDE-CONTAINER OMRÅDE -->
            <div class="wrap" id="radar-chart-only"></div>
        </section>
    `;

    const gammelRadarDrawer = document.querySelector('.radar-filter-drawer');
    if (gammelRadarDrawer) gammelRadarDrawer.remove();

    buildAndAppendRadarDrawer();
}

function buildAndAppendRadarDrawer() {
    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer radar-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Radar Settings</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
            
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; position: relative;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Player 1 (Target)</label>
                <div style="display: flex; gap: 10px; width: 100%;">
                    <div class="custom-select-wrapper" id="radar-player1-wrapper" style="position: relative; flex-grow: 1;">
                        <div class="custom-select-trigger" onclick="toggleRadarDropdown('player1')" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <span id="radar-p1-selected-text">Vælg Spiller 1</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                        </div>
                        <div class="custom-options-list" id="radar-player1-options" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--accent-purple); border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 120;">
                            <div style="position: sticky; top: 0; background: #07030c; padding: 8px; border-bottom: 1px solid var(--border-color); z-index: 130;"><input type="text" id="radar-p1-search" oninput="filterRadarPlayerList('p1')" placeholder="Søg spiller 1..." style="width: 100%; background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 4px; font-size: 13px; outline: none;" onclick="event.stopPropagation();"></div>
                            <div id="radar-p1-items-container"></div>
                        </div>
                    </div>
                    <input type="color" id="radar-color1-input" value="${RADAR_COLOR_1}" onchange="updateRadarColors(1)" style="width: 44px; height: 44px; background: none; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; padding: 2px;">
                </div>
            </div>

            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; position: relative;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Player 2 (Comparison)</label>
                <div style="display: flex; gap: 10px; width: 100%;">
                    <div class="custom-select-wrapper" id="radar-player2-wrapper" style="position: relative; flex-grow: 1;">
                        <div class="custom-select-trigger" onclick="toggleRadarDropdown('player2')" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <span id="radar-p2-selected-text">Vælg Spiller 2</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                        </div>
                        <div class="custom-options-list" id="radar-player2-options" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--accent-purple); border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 120;">
                            <div style="position: sticky; top: 0; background: #07030c; padding: 8px; border-bottom: 1px solid var(--border-color); z-index: 130;"><input type="text" id="radar-p2-search" oninput="filterRadarPlayerList('p2')" placeholder="Søg spiller 2..." style="width: 100%; background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 4px; font-size: 13px; outline: none;" onclick="event.stopPropagation();"></div>
                            <div id="radar-p2-items-container"></div>
                        </div>
                    </div>
                    <input type="color" id="radar-color2-input" value="${RADAR_COLOR_2}" onchange="updateRadarColors(2)" style="width: 44px; height: 44px; background: none; border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; padding: 2px;">
                </div>
            </div>

            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; position: relative;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Select Metrics</label>
                <div class="multiselect" style="position: relative; width: 100%;">
                    <div class="selectBox" onclick="toggleRadarCheckboxDropdown()" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="radar-metrics-select-text">Vælg parametre...</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                    </div>
                    <div id="radar-checkboxes-container" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; flex-direction: column; gap: 12px; max-height: 220px; overflow-y: auto; z-index: 120;"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(drawerDiv);
    buildCategorizedRadarMetrics();
    initCustomRadarSelectors();
}

function toggleRadarDropdown(type) {
    const p1Opt = $r("radar-player1-options"), p2Opt = $r("radar-player2-options");
    if (p1Opt && type !== 'player1') p1Opt.style.display = "none";
    if (p2Opt && type !== 'player2') p2Opt.style.display = "none";
    if (type === 'player1' && p1Opt) {
        p1Opt.style.display = p1Opt.style.display === "none" ? "block" : "none";
        if (p1Opt.style.display === "block") { resetRadarPlayerSearch('p1'); setTimeout(() => $r("radar-p1-search")?.focus(), 50); }
    } else if (type === 'player2' && p2Opt) {
        p2Opt.style.display = p2Opt.style.display === "none" ? "block" : "none";
        if (p2Opt.style.display === "block") { resetRadarPlayerSearch('p2'); setTimeout(() => $r("radar-p2-search")?.focus(), 50); }
    }
}

function toggleRadarCheckboxDropdown() {
    const cb = $r("radar-checkboxes-container");
    if (cb) cb.style.display = ["none", ""].includes(cb.style.display) ? "flex" : "none";
    const p1 = $r("radar-player1-options"), p2 = $r("radar-player2-options");
    if (p1) p1.style.display = "none"; if (p2) p2.style.display = "none";
}
// ==========================================================================
// PER 90 - RADAR.JS - DEL 3 AF 4 (SPLIT CARD & LIVE JOGA BONITO KNAP)
// ==========================================================================

async function onRadarFilterChange() {
    if (!RADAR_PLAYER_1) return;
    const checkboxes = document.querySelectorAll('#radar-checkboxes-container input[type="checkbox"]');
    const selected = [...checkboxes].filter(cb => cb.checked).map(cb => cb.value);
    const selectText = $r("radar-metrics-select-text");
    if (selectText) {
        selectText.innerText = selected.length === checkboxes.length ? "Alle metrikker valgt" :
                               selected.length === 0 ? "Ingen metrikker valgt" : `${selected.length} af ${checkboxes.length} valgt`;
    }
    const lowMetrics = selected.length < 3;
    if ($r("radar-warning-overlay")) $r("radar-warning-overlay").style.display = lowMetrics ? "flex" : "none";
    if (!lowMetrics) await loadRadarChartDataWithFilters(RADAR_PLAYER_1, RADAR_PLAYER_2, selected);
}

function filterRadarPlayerList(type) {
    const filter = $r(`radar-${type}-search`)?.value.toLowerCase();
    if (filter === undefined) return;
    document.querySelectorAll(`#radar-${type}-items-container .custom-option-item`).forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(filter) ? "block" : "none";
    });
}

function resetRadarPlayerSearch(type) {
    if ($r(`radar-${type}-search`)) { $r(`radar-${type}-search`).value = ""; filterRadarPlayerList(type); }
}

async function initCustomRadarSelectors() {
    try {
        const players = await fetch(`${API_BASE_URL}/api/pizza/players`).then(r => r.json());
        if (players.length > 1 && $r("radar-p1-items-container") && $r("radar-p2-items-container")) {
            RADAR_PLAYER_1 = players[0]; RADAR_PLAYER_2 = players[1]; 
            $r("radar-p1-selected-text").innerText = RADAR_PLAYER_1;
            $r("radar-p2-selected-text").innerText = RADAR_PLAYER_2;
            
            $r("radar-p1-items-container").innerHTML = players.map(p => `<div class="custom-option-item ${p === RADAR_PLAYER_1 ? 'selected-active' : ''}" onclick="selectRadarItem('player1', '${p.replace(/'/g, "\\\\'")}')">${p}</div>`).join('');
            $r("radar-p2-items-container").innerHTML = players.map(p => `<div class="custom-option-item ${p === RADAR_PLAYER_2 ? 'selected-active' : ''}" onclick="selectRadarItem('player2', '${p.replace(/'/g, "\\\\'")}')">${p}</div>`).join('');
        }
        await onRadarFilterChange();
    } catch (e) { console.error("Fejl under indlæsning:", e); }
}

async function selectRadarItem(type, value) {
    if (type === 'player1') { RADAR_PLAYER_1 = value; $r("radar-p1-selected-text").innerText = value; }
    else if (type === 'player2') { RADAR_PLAYER_2 = value; $r("radar-p2-selected-text").innerText = value; }
    const optEl = $r(`radar-${type}-options`); if (optEl) optEl.style.display = "none";
    await onRadarFilterChange();
}

async function onRadarPlayerChange() { onRadarFilterChange(); }

function buildCategorizedRadarMetrics() {
    const container = $r("radar-checkboxes-container"); if (!container) return;
    const colors = { "Shooting": "#ff007f", "Passing": "#00ffd5", "Possession": "#ffb700", "Defending": "#00ff66" };
    const defaults = ["Goals", "Assists", "Successful Dribbles", "Tackles Won %"];
    container.innerHTML = Object.entries(RADAR_CATEGORIES).map(([cat, metrics]) => {
        const c = colors[cat] || "var(--accent-purple)";
        const body = Object.values(metrics).map(m => {
            const checked = defaults.includes(m);
            return `<label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; color: var(--text-primary); transition: opacity 0.2s; opacity: ${checked ? 1 : 0.35};"><input type="checkbox" value="${m}" ${checked ? "checked" : ""} onchange="this.parentElement.style.opacity = this.checked ? '1' : '0.35'; onRadarFilterChange();" style="accent-color: ${c}; cursor: pointer;">${m}</label>`;
        }).join('');
        return `<div style="margin-bottom: 12px;"><div style="font-size: 11px; color: ${c}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${c}44; padding-bottom: 4px; margin-bottom: 6px;">${cat}</div><div style="display: flex; flex-direction: column; gap: 6px; padding-left: 4px;">${body}</div></div>`;
    }).join('');
}

async function loadRadarChartDataWithFilters(p1, p2, metricsList) {
    try {
        let p1Url = `${API_BASE_URL}/api/radar?player=${encodeURIComponent(p1)}&compare_pos=`;
        let p2Url = `${API_BASE_URL}/api/radar?player=${encodeURIComponent(p2)}&compare_pos=`;
        metricsList.forEach(m => { p1Url += `&metrics=${encodeURIComponent(m)}`; p2Url += `&metrics=${encodeURIComponent(m)}`; });
        
        const [d1, d2] = await Promise.all([ fetch(p1Url).then(r => r.json()), fetch(p2Url).then(r => r.json()).catch(() => null) ]);
        const chartContainer = $r("radar-chart-only"); if (!chartContainer) return;

        chartContainer.innerHTML = `
            <div class="chart-container">
                <div class="h-cnt">
                    <div class="p-panel left">
                        <h2 class="p-nm b-tx" style="color: ${RADAR_COLOR_1};">${d1.player_name}</h2>
                        <div class="p-row">
                            <span class="info-tag">${d1.player_pos || 'N/A'}</span>
                            <span class="info-tag">${d1.mins_played || 0} MIN.</span>
                            <span class="info-tag">${d1.league || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="h-divider"></div>
                    <div class="p-panel right">
                        <h2 class="p-nm p-tx" style="color: ${RADAR_COLOR_2};">${d2 && d2.player_name ? d2.player_name : 'No Compare'}</h2>
                        <div class="p-row">
                            <span class="info-tag">${d2 ? d2.player_pos : 'N/A'}</span>
                            <span class="info-tag">${d2 ? d2.mins_played : 0} MIN.</span>
                            <span class="info-tag" style="border-right: 2px solid ${RADAR_COLOR_2};">${d2 ? d2.league : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <svg width="710" height="600" viewBox="0 0 710 600" id="radar-svg-element"></svg>

                <div class="chart-footer" style="margin-top: 35px;">Percentile Spiderweb Comparison</div>
                <div class="chart-footer-source">Generated via per-90.streamlit.app</div>
            </div>
            
            <!-- 🎯 DIT NYE NEONGRØNNE JOGA BONITO DOWNLOAD KNAP LAYOUT 🎯 -->
            <div style="display: flex; justify-content: center; margin-top: 24px;">
                <button onclick="downloadRadarPNG()" style="background: var(--accent-purple); color: #06140c; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px; transition: opacity 0.2s;">Download as PNG</button>
            </div>
        `;
        
        buildRadarVektorSpiderweb(d1, d2);
    } catch (e) { console.error("Radar motorfejl:", e); }
}
// ==========================================================================
// PER 90 - RADAR.JS - DEL 4 AF 4 (SKUDSIKKER SVG GRUPPE CENTRERING)
// ==========================================================================

function buildRadarVektorSpiderweb(d1, d2) {
    const svg = $r("radar-svg-element"); if (!svg) return;
    const CX = 355, CY = 280, MAX_R = 150, total = d1.metrics.length, angle = (2 * Math.PI) / total;

    // 1. Spindelvævets baggrunds-ringe
    let markup = [37.5, 75, 112.5, 150].map(r => {
        let points = [];
        for (let i = 0; i < total; i++) points.push(`${CX + r * Math.cos(i * angle - Math.PI/2)},${CY + r * Math.sin(i * angle - Math.PI/2)}`);
        return `<polygon points="${points.join(' ')}" class="grid-poly" />`;
    }).join('');

    // Axis spokes stråler
    d1.metrics.forEach((_, i) => {
        const a = i * angle - Math.PI / 2;
        markup += `<line x1="${CX}" y1="${CY}" x2="${CX + MAX_R * Math.cos(a)}" y2="${CY + MAX_R * Math.sin(a)}" class="grid-line" />`;
    });

    // 2. RENDERING AF SPILLER-BANERNE (pl-b / pl-p) OG NODER
    const generatePlayerPathMarkup = (data, polyClass, nodeClass) => {
        if (!data || !data.metrics) return '';
        let points = [];
        data.metrics.forEach((_, i) => {
            const r = ((data.percentiles[i] || 0) / 100) * MAX_R, a = i * angle - Math.PI / 2;
            points.push(`${CX + r * Math.cos(a)},${CY + r * Math.sin(a)}`);
        });
        
        let pathMarkup = `<polygon class="${polyClass}" points="${points.join(' ')}" />`;
        data.metrics.forEach((_, i) => {
            const r = ((data.percentiles[i] || 0) / 100) * MAX_R, a = i * angle - Math.PI / 2;
            pathMarkup += `<circle class="${nodeClass}" cx="${CX + r * Math.cos(a)}" cy="${CY + r * Math.sin(a)}" r="4.5" />`;
        });
        return pathMarkup;
    };

    if (d2 && d2.metrics) markup += generatePlayerPathMarkup(d2, 'pl-p', 'n-p');
    markup += generatePlayerPathMarkup(d1, 'pl-b', 'n-b');

    // 3. 🎯 NY SKUDSIKKER METODE: ALT CENTRERES VIA DET SAMME ANCHOR-PUNKT 🎯
    d1.metrics.forEach((metric, i) => {
        const a = i * angle - Math.PI / 2;
        const cos = Math.cos(a), sin = Math.sin(a);
        
        // Vi finder det præcise yderpunkt for metrikken (skubbet 32px ud fra hjulet)
        const tx = CX + (MAX_R + 32) * cos;
        const ty = CY + (MAX_R + 32) * sin;

        const score1 = Math.round(d1.percentiles[i] || 0);
        const score2 = d2 && d2.percentiles ? Math.round(d2.percentiles[i] || 0) : 0;

        // Vi opretter en lokal SVG-gruppe, transformerer/flytter NULPUNKTET til tx,ty
        // Nu vil alt indeni denne gruppe automatisk ligge på linje ud fra samme akse!
        markup += `<g transform="translate(${tx}, ${ty})">`;
        
        // Teksten tvinges nu ALTID til at være midterstillet (middle) præcis på koordinat 0,0
        markup += `<text x="0" y="0" class="ax-lbl" text-anchor="middle" dominant-baseline="central">${metric}</text>`;

        // Boks-parret fylder samlet 54px i bredden. 
        // Ved at sætte startkoordinatet for boks 1 til -27px, rammer midteraksen præcis på 0 (lige under ordet)
        const b1X = -27;
        const b2X = 2; // -27 + 25px boks + 4px luft imellem dem
        const boxY = 12; // Lægger boksene præcis 12px under teksten

        markup += `
                <!-- Spiller 1 Cyan Mikro-Boks (Symmetrisk centreret om 0) -->
                <rect x="${b1X}" y="${boxY}" width="25" height="15" rx="4" class="svg-score-rect-p1" />
                <text x="${b1X + 12.5}" y="${boxY + 7.5}" class="svg-score-text" style="fill: ${RADAR_COLOR_1};">${score1}</text>
                
                <!-- Spiller 2 Pink Mikro-Boks (Symmetrisk centreret om 0) -->
                <rect x="${b2X}" y="${boxY}" width="25" height="15" rx="4" class="svg-score-rect-p2" />
                <text x="${b2X + 12.5}" y="${boxY + 7.5}" class="svg-score-text" style="fill: ${RADAR_COLOR_2};">${d2 ? score2 : '-'}</text>
            </g>
        `;
    });

    svg.innerHTML = markup + `<circle cx="${CX}" cy="${CY}" r="4" fill="#ffffff" />`;
}

function downloadRadarPNG() {
    const el = $r("radar-chart-only");
    html2canvas(el, { scale: 4, backgroundColor: "#0B1220", useCORS: true, logging: false }).then(canvas => {
        const link = document.createElement("a"); link.download = `radar_comparison.png`;
        link.href = canvas.toDataURL("image/png"); link.click();
    });
}

document.addEventListener("click", e => {
    if (!e.target.closest('#radar-player1-wrapper')) { const p = $r("radar-player1-options"); if(p) p.style.display = "none"; }
    if (!e.target.closest('#radar-player2-wrapper')) { const p = $r("radar-player2-options"); if(p) p.style.display = "none"; }
    if (!e.target.closest('.multiselect')) { const cb = $r("radar-checkboxes-container"); if(cb) cb.style.display = "none"; }
});

