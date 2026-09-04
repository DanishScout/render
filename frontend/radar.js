// ==========================================================================
// PER 90 - RADAR.JS - DEL 1 AF 4
// ==========================================================================

const AVAILABLE_RADAR_METRICS = [
    "Goals", "npxG", "Shots On Target", "On Target %", 
    "Assists", "xA", "Key Passes", "xT via Live Passes", 
    "Successful Dribbles", "Dribble Attempts", "Dribble Success %", 
    "Tackles Won %", "Aerials Won %", "Duels Won %", "Tackles Won"
];

const RADAR_CATEGORIES = {
    "Shooting": { "Goals": "Goals", "npxG": "npxG", "Shots On Target": "Shots On Target", "On Target %": "On Target %" },
    "Passing": { "Assists": "Assists", "xA": "xA", "Key Passes": "Key Passes", "xT via Live Passes": "xT via Live Passes" },
    "Possession": { "Successful Dribbles": "Successful Dribbles", "Dribble Attempts": "Dribble Attempts", "Dribble Success %": "Dribble Success %" },
    "Defending": { "Tackles Won %": "Tackles Won %", "Aerials Won %": "Aerials Won %", "Duels Won %": "Duels Won %", "Tackles Won": "Tackles Won" }
};// ==========================================================================
// PER 90 - RADAR.JS - DEL 2 AF 4
// ==========================================================================

async function onRadarFilterChange() {
    if (!CURRENT_RADAR_P1 || !CURRENT_RADAR_P2) return;
    
    // Vi henter metrikkerne fra den specifikke radar-metrik-container, du har i skuffen
    const checkboxes = document.querySelectorAll('#radar-checkboxes-container input[type="checkbox"]');
    const selected = [...checkboxes].filter(cb => cb.checked).map(cb => cb.value);
    
    const selectText = $("radar-metrics-select-text");
    if (selectText) {
        selectText.innerText = selected.length === checkboxes.length ? "Alle metrikker valgt" :
                               selected.length === 0 ? "Ingen metrikker valgt" : `${selected.length} af ${checkboxes.length} valgt`;
    }

    const lowMetrics = selected.length < 3;
    if ($("radar-warning-overlay")) $("radar-warning-overlay").style.display = lowMetrics ? "flex" : "none";
    
    if (!lowMetrics) {
        await loadRadarChartDataWithFilters(CURRENT_RADAR_P1, CURRENT_RADAR_P2, selected);
    }
}

function filterP1List() {
    const filter = $("p1-search-input")?.value.toLowerCase();
    if (filter === undefined) return;
    document.querySelectorAll("#custom-p1-items-container .custom-option-item").forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(filter) ? "block" : "none";
    });
}

function filterP2List() {
    const filter = $("p2-search-input")?.value.toLowerCase();
    if (filter === undefined) return;
    document.querySelectorAll("#custom-p2-items-container .custom-option-item").forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(filter) ? "block" : "none";
    });
}

function resetRadarSearches() {
    if ($("p1-search-input")) { $("p1-search-input").value = ""; filterP1List(); }
    if ($("p2-search-input")) { $("p2-search-input").value = ""; filterP2List(); }
}

function onRadarColorChange(playerNum, colorValue) {
    if (playerNum === 1) CURRENT_P1_COLOR = colorValue;
    if (playerNum === 2) CURRENT_P2_COLOR = colorValue;
    onRadarFilterChange();
}
// ==========================================================================
// PER 90 - RADAR.JS - DEL 3 AF 4
// ==========================================================================

async function initCustomRadarSelectors() {
    try {
        const [players] = await Promise.all([
            fetch(`${API_BASE_URL}/api/radar/players`).then(r => r.json())
        ]);
        
        if (players.length > 0) {
            if ($("custom-p1-items-container")) {
                CURRENT_RADAR_P1 = players[0];
                $("custom-p1-selected-text").innerText = CURRENT_RADAR_P1;
                $("custom-p1-items-container").innerHTML = players.map(p => `<div class="custom-option-item ${p === CURRENT_RADAR_P1 ? 'selected-active' : ''}" onclick="selectCustomItem('p1', '${p.replace(/'/g, "\\'")}')">${p}</div>`).join('');
            }
            if ($("custom-p2-items-container")) {
                CURRENT_RADAR_P2 = players[1] || players[0];
                $("custom-p2-selected-text").innerText = CURRENT_RADAR_P2;
                $("custom-p2-items-container").innerHTML = players.map(p => `<div class="custom-option-item ${p === CURRENT_RADAR_P2 ? 'selected-active' : ''}" onclick="selectCustomItem('p2', '${p.replace(/'/g, "\\'")}')">${p}</div>`).join('');
            }
        }
        buildCategorizedRadarMetrics();
        await onRadarFilterChange();
    } catch (e) { console.error("Fejl under indlæsning af radar-dropdowns:", e); }
}

function buildCategorizedRadarMetrics() {
    const container = $("radar-checkboxes-container"); if (!container) return;
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

// Initialisering af radar ved fane-start (kan kaldes fra din global.js switchView)
window.loadRadarChartData = function(p1, p2) {
    if (p1) selectCustomItem('p1', p1);
    if (p2) selectCustomItem('p2', p2);
    if (!p1 && !p2) onRadarFilterChange();
};
// ==========================================================================
// PER 90 - RADAR.JS - DEL 4 AF 4
// ==========================================================================

async function loadMarketChartDataWithFilters(player1, player2, metricsList) { // Omdøbt internt match-kald
    await loadRadarChartDataWithFilters(player1, player2, metricsList);
}

async function loadRadarChartDataWithFilters(player1, player2, metricsList) {
    try {
        let url = `${API_BASE_URL}/api/radar?player1=${encodeURIComponent(player1)}&player2=${encodeURIComponent(player2)}`;
        metricsList.forEach(m => url += `&metrics=${encodeURIComponent(m)}`);
        
        const apiResponse = await fetch(url).then(r => { if (!r.ok) throw new Error(); return r.json(); });
        const chartContainer = $("radar-only"); if (!chartContainer) return;

        const leagueVal = apiResponse.player1.league || "N/A";

        chartContainer.innerHTML = `
            <div class="header-card" style="max-width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px; width: 100%;">
                    <div style="text-align: left; flex: 1;">
                        <h2 class="p-nm" style="color: ${CURRENT_P1_COLOR};">${apiResponse.player1.player_name}</h2>
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">
                            ${apiResponse.player1.team} | ${apiResponse.player1.player_pos} | ${apiResponse.player1.mins_played} MIN.
                        </div>
                    </div>
                    <div style="font-size: 14px; font-weight: 900; color: rgba(255,255,255,0.2);">VS</div>
                    <div style="text-align: right; flex: 1;">
                        <h2 class="p-nm" style="color: ${CURRENT_P2_COLOR};">${apiResponse.player2.player_name}</h2>
                        <div style="font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">
                            ${apiResponse.player2.team} | ${apiResponse.player2.player_pos} | ${apiResponse.player2.mins_played} MIN.
                        </div>
                    </div>
                </div>
            </div>
            <svg viewBox="0 0 710 570" id="radar-svg-element"></svg>
            <div class="chart-footer" style="font-family: var(--font-family), sans-serif; margin-top: 15px;">Percentile Rank Sammenligning | Base: ${leagueVal}</div>
            <div class="chart-footer-source" style="font-family: var(--font-family), sans-serif;">Generated via per-90.streamlit.app</div>
        `;
        
        buildRadarVektorChart(apiResponse);
    } catch (e) { console.error("Radar interface fejl:", e); }
}

function buildRadarVektorChart(data) {
    const svg = $("radar-svg-element"); if (!svg) return;
    const CX = 355, CY = 285, MAX_R = 230, total = data.metrics.length, angle = (2 * Math.PI) / total;
    
    let markup = [57.5, 115, 172.5, 230].map(r => `<circle cx="${CX}" cy="${CY}" r="${r}" class="grid-circle" style="stroke:rgba(255,255,255,.07); fill:none;" />`).join('');

    let p1Points = [], p2Points = [];

    data.metrics.forEach((metric, i) => {
        const a = (i * angle) - Math.PI / 2;
        const cos = Math.cos(a), sin = Math.sin(a);

        markup += `<line x1="${CX}" y1="${CY}" x2="${CX + MAX_R * cos}" y2="${CY + MAX_R * sin}" class="grid-line" style="stroke:rgba(255,255,255,.05);" />`;

        const p1Score = data.player1.percentiles[i] || 0;
        const p1R = (p1Score / 100) * MAX_R;
        p1Points.push(`${CX + p1R * cos},${CY + p1R * sin}`);

        const p2Score = data.player2.percentiles[i] || 0;
        const p2R = (p2Score / 100) * MAX_R;
        p2Points.push(`${CX + p2R * cos},${CY + p2R * sin}`);

        let anchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";
        markup += `<text x="${CX + 258 * cos}" y="${CY + 250 * sin}" class="ax-lbl" style="font-family: var(--font-family), sans-serif;" text-anchor="${anchor}" dominant-baseline="middle" fill="#94a3b8">${metric}</text>`;
    });

    // Tegn polygoner med dine valgte, dynamiske farver fra skuffen
    markup += `<polygon points="${p1Points.join(' ')}" fill="${CURRENT_P1_COLOR}1F" stroke="${CURRENT_P1_COLOR}" stroke-width="2.5" style="stroke-linejoin:round;" filter="drop-shadow(0 0 8px ${CURRENT_P1_COLOR}33)" />`;
    markup += `<polygon points="${p2Points.join(' ')}" fill="${CURRENT_P2_COLOR}1F" stroke="${CURRENT_P2_COLOR}" stroke-width="2.5" style="stroke-linejoin:round;" filter="drop-shadow(0 0 8px ${CURRENT_P2_COLOR}33)" />`;

    svg.innerHTML = markup + `<circle cx="${CX}" cy="${CY}" r="8" fill="#FFFFFF" />`;
}

function downloadRadarPNG() { 
    const el = $("radar-only"); if (!el) return;
    document.fonts.ready.then(() => {
        html2canvas(el, { 
            scale: 4, 
            backgroundColor: "#0B1220", 
            useCORS: true,
            logging: false
        }).then(canvas => { 
            const link = document.createElement("a"); 
            link.download = `radar_${CURRENT_RADAR_P1.toLowerCase().replace(/ /g, "_")}_vs_${CURRENT_RADAR_P2.toLowerCase().replace(/ /g, "_")}.png`; 
            link.href = canvas.toDataURL("image/png"); link.click(); 
        }).catch(e => console.error(e)); 
    });
}

// Kald initialiseringen af tjekbokse og API, når DOM'en er helt på plads
document.addEventListener("DOMContentLoaded", () => {
    initCustomRadarSelectors();
});


// Globale variabler til styring af data og farvevalg
let CURRENT_RADAR_P1 = "", CURRENT_RADAR_P2 = "";
let CURRENT_P1_COLOR = "#ff007f"; // Standard Pink
let CURRENT_P2_COLOR = "#00ffd5"; // Standard Cyan

if (typeof $ !== 'function') { var $ = id => document.getElementById(id); }
if (typeof toggleDisplay !== 'function') { var toggleDisplay = (el, show) => el && (el.style.display = show ? "block" : "none"); }
