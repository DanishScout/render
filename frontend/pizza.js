// ==========================================
// DEL 1 AF 4: METRIKKER, VARIABLER OG HELPERS
// ==========================================

const AVAILABLE_PIZZA_METRICS = ["Goals", "npxG", "Shots On Target", "On Target %", "Assists", "xA", "Key Passes", "xT via Live Passes", "Successful Dribbles", "Dribble Attempts", "Dribble Success %", "Tackles Won %", "Aerials Won %", "Duels Won %", "Tackles Won"];

const PIZZA_CATEGORIES = {
    "Shooting": { "Goals": "Goals", "npxG": "npxG", "Shots On Target": "Shots On Target", "On Target %": "On Target %" },
    "Passing": { "Assists": "Assists", "xA": "xA", "Key Passes": "Key Passes", "xT via Live Passes": "xT via Live Passes" },
    "Possession": { "Successful Dribbles": "Successful Dribbles", "Dribble Attempts": "Dribble Attempts", "Dribble Success %": "Dribble Success %" },
    "Defending": { "Tackles Won %": "Tackles Won %", "Aerials Won %": "Aerials Won %", "Duels Won %": "Duels Won %", "Tackles Won": "Tackles Won" }
};

let CURRENT_SELECTED_PLAYER = "", CURRENT_SELECTED_POS = "";
if (typeof window.pizzaChartInstance === 'undefined') window.pizzaChartInstance = null;

const $ = id => document.getElementById(id);
const toggleDisplay = (el, show) => el && (el.style.display = show ? "block" : "none");
// ==========================================
// DEL 2 AF 4: REALTIDS-FILTRERING OG STYLES
// ==========================================

async function onPizzaFilterChange() {
    if (!CURRENT_SELECTED_PLAYER || !CURRENT_SELECTED_POS) return;
    const checkboxes = document.querySelectorAll('#checkboxes-container input[type="checkbox"]');
    const selected = [...checkboxes].filter(cb => cb.checked).map(cb => cb.value);
    const selectText = $("metrics-select-text");
    if (selectText) {
        selectText.innerText = selected.length === checkboxes.length ? "Alle metrikker valgt" :
                               selected.length === 0 ? "Ingen metrikker valgt" : `${selected.length} af ${checkboxes.length} valgt`;
    }
    const lowMetrics = selected.length < 3;
    if ($("pizza-warning-overlay")) $("pizza-warning-overlay").style.display = lowMetrics ? "flex" : "none";
    if (!lowMetrics) await loadPizzaChartDataWithFilters(CURRENT_SELECTED_PLAYER, CURRENT_SELECTED_POS, selected);
}

function filterPlayerList() {
    const filter = $("player-search-input")?.value.toLowerCase();
    if (filter === undefined) return;
    document.querySelectorAll("#custom-player-items-container .custom-option-item").forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(filter) ? "block" : "none";
    });
}

function resetPlayerSearch() {
    if ($("player-search-input")) { $("player-search-input").value = ""; filterPlayerList(); }
}

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://googleapis.com');
        .custom-option-item { padding: 10px 14px; color: #f3f1f6; cursor: pointer; font-size: 14px; transition: all 0.15s ease; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        .custom-option-item:hover { background-color: rgba(168, 85, 247, 0.25) !important; color: #ffffff !important; padding-left: 18px; }
        .custom-option-item.selected-active { background-color: var(--accent-purple) !important; color: #ffffff !important; }
        #chart-only { position: relative; padding: 15px 15px 35px; border-radius: 24px; width: 100%; max-width: 710px; border: 1px solid rgba(0,240,255,.08); box-shadow: 0 30px 60px -15px #000, inset 0 1px 0 rgba(255,255,255,.05); box-sizing: border-box; opacity: .85; overflow: hidden; background: #0B1220; display: flex; flex-direction: column; align-items: center; margin: 20px auto !important; font-family: 'Gabarito', sans-serif; color: #e5e7eb; }
        #chart-only::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(#0f172a, #020617); z-index: 0; border-radius: 24px; }
        .header-card { position: relative; z-index: 2; width: 100%; max-width: 575px; margin: 15px auto 25px; padding: 20px 25px; background: transparent; border: 1px solid rgba(0, 240, 255, 0.08); border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4); box-sizing: border-box; }
        .h-cnt { display: flex; gap: 20px; width: 100%; box-sizing: border-box; }
        .p-meta-right { display: flex; flex-direction: column; flex-grow: 1; }
        .p-nm { font-size: 27px; font-weight: 900; margin: 0 0 10px; text-transform: uppercase; letter-spacing: -.5px; color: #fff; }
        .tactic-line { width: 100%; height: 2px; margin-bottom: 12px; }
        .p-sub-bar { display: flex; align-items: center; gap: 14px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; flex-wrap: wrap; }
        .meta-item { display: flex; align-items: center; gap: 6px; color: #fff; }
        .meta-item svg { opacity: .6; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; width: 15px; height: 15px; }
        .logo-shape { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: rgba(0,240,255,0.1); border-radius: 50%; padding: 2px; box-sizing: border-box; }
        .club-crest-small { width: 100%; height: 100%; object-fit: contain; }
        .data-val { color: #94a3b8; font-weight: 600; }
        .pipe-divider { color: rgba(0,240,255,.2); font-size: 14px; }
        #pizza-svg-element { display: block; margin: -15px auto 0; overflow: visible; max-width: 100%; height: auto; position: relative; z-index: 1; }
        .grid-circle { fill: none; stroke: rgba(255,255,255,.08); }
        .grid-line { stroke: rgba(255,255,255,.06); }
        .ax-lbl { font-size: 13px; fill: #94a3b8; font-weight: 700; letter-spacing: .5px; }
        .slice-b { stroke-width: 1.75; stroke-linejoin: round; }
        .box-bg-rect { fill: #0B1220 !important; }
        .tx-b { font-size: 11px; font-weight: 900; }
        .chart-footer, .chart-footer-source { text-align: center; width: 100%; font-size: 11px; font-weight: 300; color: #e5e7eb; letter-spacing: .4px; padding: 0 40px; box-sizing: border-box; position: relative; z-index: 2; }
        .chart-footer { margin-top: 1px; opacity: 0.75; }
        .chart-footer-source { margin-top: 6px; opacity: 0.5; }
    `;
    document.head.appendChild(style);
    buildCategorizedMetrics();
    initCustomPizzaSelectors();
    document.addEventListener("click", e => {
        if (!e.target.closest('#custom-player-wrapper')) toggleDisplay($("custom-player-options"), false);
        if (!e.target.closest('#custom-pos-wrapper')) toggleDisplay($("custom-pos-options"), false);
        if (!e.target.closest('.multiselect')) toggleDisplay($("checkboxes-container"), false);
    });
});
// ==========================================
// DEL 3 AF 4: DROPDOWN OG ARRAY-PARSING FIX
// ==========================================

function toggleCustomDropdown(type) {
    const pOpt = $("custom-player-options"), posOpt = $("custom-pos-options");
    if (type === 'player') {
        const isOpening = pOpt?.style.display === "none";
        toggleDisplay(pOpt, isOpening); toggleDisplay(posOpt, false);
        if (isOpening) { resetPlayerSearch(); setTimeout(() => $("player-search-input")?.focus(), 50); }
    } else if (type === 'pos') {
        toggleDisplay(posOpt, posOpt?.style.display === "none"); toggleDisplay(pOpt, false);
    }
}

function toggleCheckboxDropdown() {
    const cb = $("checkboxes-container");
    if (cb) cb.style.display = ["none", ""].includes(cb.style.display) ? "flex" : "none";
    toggleDisplay($("custom-player-options"), false); toggleDisplay($("custom-pos-options"), false);
}

async function initCustomPizzaSelectors() {
    try {
        const [players, positions] = await Promise.all([
            fetch(`${API_BASE_URL}/api/pizza/players`).then(r => r.json()),
            fetch(`${API_BASE_URL}/api/pizza/positions`).then(r => r.json())
        ]);
        
        if (players.length > 0 && $("custom-player-items-container")) {
            CURRENT_SELECTED_PLAYER = players[0]; 
            $("custom-player-selected-text").innerText = CURRENT_SELECTED_PLAYER;
            $("custom-player-items-container").innerHTML = players.map(p => `<div class="custom-option-item ${p === CURRENT_SELECTED_PLAYER ? 'selected-active' : ''}" onclick="selectCustomItem('player', '${p.replace(/'/g, "\\'")}')">${p}</div>`).join('');
        }

        if (positions.length > 0 && $("custom-pos-options")) {
            CURRENT_SELECTED_POS = positions[0]; 
            $("custom-pos-selected-text").innerText = CURRENT_SELECTED_POS;
            $("custom-pos-options").innerHTML = positions.map(pos => `<div class="custom-option-item ${pos === CURRENT_SELECTED_POS ? 'selected-active' : ''}" id="opt-pos-${pos}" onclick="selectCustomItem('pos', '${pos}')">${pos}</div>`).join('');
        }
        await onPizzaPlayerChange();
    } catch (e) { console.error("Fejl under indlæsning af dropdowns:", e); }
}

async function selectCustomItem(type, value) {
    const isPlayer = type === 'player';
    if (isPlayer) CURRENT_SELECTED_PLAYER = value; else CURRENT_SELECTED_POS = value;
    $(`custom-${type}-selected-text`).innerText = value;
    toggleDisplay($(`custom-${type}-options`), false);
    document.querySelectorAll(`#custom-${type}-options .custom-option-item`).forEach(el => el.classList.toggle('selected-active', el.innerText === value));
    if (isPlayer) await onPizzaPlayerChange(); else onPizzaFilterChange();
}

async function onPizzaPlayerChange() {
    if (!CURRENT_SELECTED_PLAYER) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/pizza?player=${encodeURIComponent(CURRENT_SELECTED_PLAYER)}&compare_pos=`);
        if (response.ok) {
            const data = await response.json();
            if (data.player_pos) {
                CURRENT_SELECTED_POS = data.player_pos;
                $("custom-pos-selected-text").innerText = data.player_pos;
                document.querySelectorAll('#custom-pos-options .custom-option-item').forEach(el => el.classList.toggle('selected-active', el.innerText === data.player_pos));
            }
        }
    } catch (e) { console.error(e); }
    onPizzaFilterChange();
}
// ==========================================
// DEL 4 AF 4: DATA INTERFACES OG VEKTORGENERERING
// ==========================================

function buildCategorizedMetrics() {
    const container = $("checkboxes-container"); if (!container) return;
    const colors = { "Shooting": "#ff007f", "Passing": "#00ffd5", "Possession": "#ffb700", "Defending": "#00ff66" };
    const defaults = ["Goals", "Assists", "Successful Dribbles", "Tackles Won %"];
    container.innerHTML = Object.entries(PIZZA_CATEGORIES).map(([cat, metrics]) => {
        const c = colors[cat] || "var(--accent-purple)";
        const body = Object.values(metrics).map(m => {
            const checked = defaults.includes(m);
            return `<label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; color: var(--text-primary); transition: opacity 0.2s; opacity: ${checked ? 1 : 0.35};"><input type="checkbox" value="${m}" ${checked ? "checked" : ""} onchange="this.parentElement.style.opacity = this.checked ? '1' : '0.35'; onPizzaFilterChange();" style="accent-color: ${c}; cursor: pointer;">${m}</label>`;
        }).join('');
        return `<div style="margin-bottom: 12px;"><div style="font-size: 11px; color: ${c}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid ${c}44; padding-bottom: 4px; margin-bottom: 6px;">${cat}</div><div style="display: flex; flex-direction: column; gap: 6px; padding-left: 4px;">${body}</div></div>`;
    }).join('');
}

async function loadPizzaChartDataWithFilters(playerName, comparePos, metricsList) {
    try {
        let url = `${API_BASE_URL}/api/pizza?player=${encodeURIComponent(playerName)}&compare_pos=${encodeURIComponent(comparePos)}`;
        metricsList.forEach(m => url += `&metrics=${encodeURIComponent(m)}`);
        const apiResponse = await fetch(url).then(r => { if (!r.ok) throw new Error(); return r.json(); });
        let logoBase64 = apiResponse.logo_base64 || "";
        if (apiResponse.team_id && apiResponse.team_id !== "nan" && !logoBase64) {
            try { logoBase64 = (await fetch(`${API_BASE_URL}/api/logo/${apiResponse.team_id}`).then(r => r.json())).logo_base64 || ""; } catch (e) {}
        }
        const chartContainer = $("chart-only"); if (!chartContainer) return;
        const sColor = apiResponse.selected_color || "#00f0ff", leagueVal = apiResponse.league || "N/A";

        chartContainer.innerHTML = `
            <div class="header-card">
                <div class="h-cnt">
                    <div class="p-meta-right">
                        <h2 class="p-nm">${apiResponse.player_name}</h2>
                        <svg class="tactic-line" viewBox="0 0 100 2" preserveAspectRatio="none"><defs><linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="${sColor}" stop-opacity="0.6" /><stop offset="70%" stop-color="${sColor}" stop-opacity="0.3" /><stop offset="100%" stop-color="${sColor}" stop-opacity="0" /></linearGradient></defs><rect width="100" height="2" fill="url(#lineGrad)" /></svg>
                        <div class="p-sub-bar">
                            <div class="meta-item"><div class="logo-shape" style="border: 1px solid ${sColor}"><img class="club-crest-small" src="${logoBase64}" /></div><span class="data-val">${leagueVal}</span></div>
                            <span class="pipe-divider">|</span>
                            <div class="meta-item"><svg viewBox="0 0 24 24" style="stroke: ${sColor}"><path d="M20.38 3.46L16 2a4 4 0 0 0-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l1.08 5.4A2 2 0 0 0 5.3 12.5H7v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7h1.7a2 2 0 0 0 1.94-1.41l1.08-5.4a2 2 0 0 0-1.34-2.23z"/></svg><span class="data-val">${CURRENT_SELECTED_POS}</span></div>
                            <span class="pipe-divider">|</span>
                            <div class="meta-item"><svg viewBox="0 0 24 24" style="stroke: ${sColor}"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span class="data-val">${apiResponse.mins_played || 0} MIN.</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <svg width="710" height="570" viewBox="0 0 710 570" id="pizza-svg-element"></svg>
            <div class="chart-footer">${apiResponse.player_name}'s percentile rank vs. ${leagueVal} ${CURRENT_SELECTED_POS}s</div>
            <div class="chart-footer-source">Generated via per-90.streamlit.app</div>
        `;
        buildPizzaVektorChart(apiResponse, sColor);
    } catch (e) { console.error("Interface fejl:", e); }
}

function buildPizzaVektorChart(data, selectedColor) {
    const svg = $("pizza-svg-element"); if (!svg) return;
    const CX = 355, CY = 285, MAX_R = 230, total = data.metrics.length, angle = (2 * Math.PI) / total;
    const catColors = { "Shooting": "#ff007f", "Passing": "#00ffd5", "Possession": "#ffb700", "Defending": "#00ff66" };
    
    let markup = [57.5, 115, 172.5, 230].map(r => `<circle cx="${CX}" cy="${CY}" r="${r}" class="grid-circle" ${r === 230 ? 'style="stroke:rgba(255,255,255,.08);"' : ''} />`).join('');

    data.metrics.forEach((metric, i) => {
        const rawScore = data.percentiles[i], score = Math.round(rawScore), currentR = (rawScore / 100) * 230;
        const sA = (i * angle) - Math.PI / 2, eA = sA + angle, midA = sA + angle / 2;
        const cos = Math.cos(midA), sin = Math.sin(midA);

        let cat = Object.keys(PIZZA_CATEGORIES).find(k => Object.values(PIZZA_CATEGORIES[k]).includes(metric)) || "Shooting";
        const c = catColors[cat] || selectedColor;

        if (currentR > 0) {
            markup += `<path d="M ${CX} ${CY} L ${CX + currentR * Math.cos(sA)} ${CY + currentR * Math.sin(sA)} A ${currentR} ${currentR} 0 ${angle > Math.PI ? 1 : 0} 1 ${CX + currentR * Math.cos(eA)} ${CY + currentR * Math.sin(eA)} Z" class="slice-b" fill="${c}26" stroke="${c}" filter="drop-shadow(0 0 6px ${c}26)" />`;
        }
        markup += `<line x1="${CX}" y1="${CY}" x2="${CX + 230 * Math.cos(sA)}" y2="${CY + 230 * Math.sin(sA)}" class="grid-line" />`;
        
        let anchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";
        
        /* RETTET: Inline style med var(--font-family) tilføjet direkte på SVG <text>, så f.eks. iPhones tvinges til at bruge den */
        markup += `<text x="${CX + 258 * cos}" y="${CY + 250 * sin}" class="ax-lbl" style="font-family: var(--font-family), sans-serif;" text-anchor="${anchor}" dominant-baseline="middle" fill="#94a3b8">${metric}</text>`;

        if (score > 15) {
            /* RETTET: Inline style med var(--font-family) tilføjet til score-tallene inde i cirklerne */
            markup += `<g><rect x="${CX + currentR * cos - 13}" y="${CY + currentR * sin - 7}" width="26" height="14" rx="3" class="box-bg-rect" stroke="${c}" stroke-width="1.5" /><text x="${CX + currentR * cos}" y="${CY + currentR * sin}" class="tx-b" style="font-family: var(--font-family), sans-serif;" text-anchor="middle" dominant-baseline="central">${score}</text></g>`;
        }
    });
    svg.innerHTML = markup + `<circle cx="${CX}" cy="${CY}" r="12" fill="#FFFFFF" />`;
}

function downloadPNG() { 
    const el = $("chart-only"), title = document.querySelector('.p-nm'); 
    if (title) { title.style.webkitTextFillColor = '#fff'; title.style.color = '#fff'; } 
    
    // RETTET: Fortæller html2canvas at den skal vente på at skrifttyper (fonts) er fuldt indlæst før rendering
    document.fonts.ready.then(() => {
        html2canvas(el, { 
            scale: 4, 
            backgroundColor: "#0B1220", 
            useCORS: true,
            logging: false
        }).then(canvas => { 
            if (title) title.style.webkitTextFillColor = '#fff'; 
            const link = document.createElement("a"); 
            link.download = `report_${CURRENT_SELECTED_PLAYER ? CURRENT_SELECTED_PLAYER.toLowerCase().replace(/ /g, "_") : "chart"}.png`; 
            link.href = canvas.toDataURL("image/png"); link.click(); 
        }).catch(e => console.error(e)); 
    });
}


window.loadPizzaChartData = function(playerName) {
    if (playerName && CURRENT_SELECTED_PLAYER !== playerName) selectCustomItem('player', playerName); else onPizzaFilterChange();
};
