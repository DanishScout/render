// ==========================================================================
// PER 90 - RADAR.JS (KOMPLET FIL) - DEL 1 AF 3
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
};

let RADAR_PLAYER_1 = "", RADAR_PLAYER_2 = "";
const $$ = id => document.getElementById(id);

function toggleRadarDropdown(type) {
    // Vi stopper eventet fra at boble op og fryse i skuffen
    if (window.event) window.event.stopPropagation();

    const p1Opt = document.getElementById("custom-radar-p1-options");
    const p2Opt = document.getElementById("custom-radar-p2-options");
    const cb = document.getElementById("radar-checkboxes-container");
    
    // Lukker altid metrik-tjekboksene hvis de er åbne
    if (cb) cb.style.display = "none";
    
    if (type === 'p1') {
        const isOpening = !p1Opt.style.display || p1Opt.style.display === "none";
        if (p1Opt) p1Opt.style.display = isOpening ? "block" : "none";
        if (p2Opt) p2Opt.style.display = "none";
        if (isOpening) setTimeout(() => document.getElementById("radar-p1-search")?.focus(), 30);
    } else if (type === 'p2') {
        const isOpening = !p2Opt.style.display || p2Opt.style.display === "none";
        if (p2Opt) p2Opt.style.display = isOpening ? "block" : "none";
        if (p1Opt) p1Opt.style.display = "none";
        if (isOpening) setTimeout(() => document.getElementById("radar-p2-search")?.focus(), 30);
    }
}

function toggleRadarCheckboxDropdown() {
    if (window.event) window.event.stopPropagation();

    const cb = document.getElementById("radar-checkboxes-container");
    const p1Opt = document.getElementById("custom-radar-p1-options");
    const p2Opt = document.getElementById("custom-radar-p2-options");
    
    if (p1Opt) p1Opt.style.display = "none";
    if (p2Opt) p2Opt.style.display = "none";
    
    if (cb) {
        cb.style.display = (cb.style.style && cb.style.display === "flex") ? "none" : "flex";
    }
}

// Henter automatisk spillerlisten og metrikkerne fra Python og bygger dine menuer ved start
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const players = await fetch(`${API_BASE_URL}/api/radar/players`).then(r => r.json());
        
        if (players.length > 0) {
            const p1Container = $$("radar-p1-items-container");
            const p2Container = $$("radar-p2-items-container");
            
            if (p1Container) p1Container.innerHTML = players.map(p => `<div class="custom-option-item" onclick="selectRadarItem('p1', '${p.replace(/'/g, "\\'")}')">${p}</div>`).join('');
            if (p2Container) {
                let p2HTML = `<div class="custom-option-item" style="color:var(--text-muted);" onclick="selectRadarItem('p2', '')">✕ Ingen spillersammenligning</div>`;
                p2HTML += players.map(p => `<div class="custom-option-item" onclick="selectRadarItem('p2', '${p.replace(/'/g, "\\'")}')">${p}</div>`).join('');
                p2Container.innerHTML = p2HTML;
            }
        }
        
        const cbContainer = $$("radar-checkboxes-container");
        if (cbContainer && typeof RADAR_CATEGORIES !== 'undefined') {
            const colors = { "Shooting": "#ff007f", "Passing": "#00ffd5", "Possession": "#ffb700", "Defending": "#00ff66" };
            const defaults = ["Goals", "Assists", "Successful Dribbles", "Tackles Won %"];
            
            cbContainer.innerHTML = Object.entries(RADAR_CATEGORIES).map(([cat, metrics]) => {
                const c = colors[cat] || "var(--accent-purple)";
                const body = Object.values(metrics).map(m => {
                    const checked = defaults.includes(m);
                    return `<label style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:13px; color:var(--text-primary); margin-bottom:4px;"><input type="checkbox" value="${m}" ${checked ? "checked" : ""} onchange="onRadarFilterChange();" style="accent-color:${c};">${m}</label>`;
                }).join('');
                return `<div style="margin-bottom:12px;"><div style="font-size:11px; color:${c}; font-weight:800; text-transform:uppercase; border-bottom:1px solid ${c}44; padding-bottom:4px; margin-bottom:6px;">${cat}</div>${body}</div>`;
            }).join('');
        }
    } catch (e) { console.error("Fejl under radar-initialisering:", e); }
});// ==========================================================================
// PER 90 - RADAR.JS - DEL 2 AF 3
// ==========================================================================

function selectRadarItem(type, value) {
    if (type === 'p1') {
        RADAR_PLAYER_1 = value;
        $$("custom-radar-p1-text").innerText = value || "Vælg Spiller 1...";
        $$("custom-radar-p1-options").style.display = "none";
    } else {
        RADAR_PLAYER_2 = value;
        $$("custom-radar-p2-text").innerText = value || "Valgfri (Ingen valgt)...";
        $$("custom-radar-p2-options").style.display = "none";
    }
    onRadarFilterChange();
}

function filterRadarPlayerList(type) {
    const filter = $$(`radar-${type}-search`)?.value.toLowerCase();
    if (!filter) return;
    document.querySelectorAll(`#radar-${type}-items-container .custom-option-item`).forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(filter) ? "block" : "none";
    });
}

async function onRadarFilterChange() {
    if (!RADAR_PLAYER_1) return;
    const checkboxes = document.querySelectorAll('#radar-checkboxes-container input[type="checkbox"]');
    const selected = [...checkboxes].filter(cb => cb.checked).map(cb => cb.value);
    const lowMetrics = selected.length < 3;
    if ($("pizza-warning-overlay")) $("pizza-warning-overlay").style.display = lowMetrics ? "flex" : "none";
    if (!lowMetrics) await loadRadarChartData(RADAR_PLAYER_1, RADAR_PLAYER_2, selected);
}

async function loadRadarChartData(player1, player2, metricsList) {
    try {
        let url = `${API_BASE_URL}/api/radar?player1=${encodeURIComponent(player1)}`;
        if (player2) url += `&player2=${encodeURIComponent(player2)}`;
        metricsList.forEach(m => url += `&metrics=${encodeURIComponent(m)}`);

        const apiResponse = await fetch(url).then(r => { if (!r.ok) throw new Error(); return r.json(); });
        const chartContainer = $$("chart-only"); if (!chartContainer) return;

        const p1 = apiResponse.player1; const p2 = apiResponse.player2;
        let logo1 = p1.team_id !== "nan" ? `${API_BASE_URL}/api/logo/${p1.team_id}` : "";
        let logo2 = p2 && p2.team_id !== "nan" ? `${API_BASE_URL}/api/logo/${p2.team_id}` : "";

        let headerHTML = `
            <div class="header-card" style="border-image: linear-gradient(to right, #00ffd5, #ff007f) 1; width:100%;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; width: 100%;">
                    <div style="flex: 1; text-align: left;">
                        <h2 class="p-nm" style="font-size: 24px; color: #fff; margin-bottom: 2px;">${p1.player_name}</h2>
                        <div style="font-size: 12px; color: #00ffd5; font-weight: 700; margin-bottom: 8px;">${p1.player_pos} | ${p1.mins_played} MIN.</div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #948aa3;">
                            <div class="logo-shape" style="border: 1px solid #00ffd5; width: 16px; height: 16px;"><img src="${logo1}" style="width:100%; height:100%; object-fit:contain;" /></div>
                            <span>${p1.league}</span>
                        </div>
                    </div>
        `;

        if (p2) {
            headerHTML += `
                    <div style="display: flex; align-items: center; justify-content: center; height: 60px; font-weight: 900; color: #554a63; font-size: 14px; letter-spacing: 1px;">VS</div>
                    <div style="flex: 1; text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                        <h2 class="p-nm" style="font-size: 24px; color: #fff; margin-bottom: 2px;">${p2.player_name}</h2>
                        <div style="font-size: 12px; color: #ff007f; font-weight: 700; margin-bottom: 8px;">${p2.player_pos} | ${p2.mins_played} MIN.</div>
                        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: #948aa3; flex-direction: row-reverse;">
                            <div class="logo-shape" style="border: 1px solid #ff007f; width: 16px; height: 16px;"><img src="${logo2}" style="width:100%; height:100%; object-fit:contain;" /></div>
                            <span>${p2.league}</span>
                        </div>
                    </div>
            `;
        }

        headerHTML += `
                </div>
            </div>
            <svg viewBox="0 0 710 570" id="pizza-svg-element" style="overflow: visible; width: 100%; height: auto;"></svg>
            <div class="chart-footer">Percentile rank comparison map</div>
            <div class="chart-footer-source">Generated via per-90.streamlit.app</div>
        `;

        chartContainer.innerHTML = headerHTML; buildRadarVectorChart(p1, p2);
    } catch (e) { console.error("Radar data-fejl:", e); }
}==================================================
// PER 90 - RADAR.JS - DEL 3 AF 3
// ==========================================================================

function buildRadarVectorChart(p1, p2) {
    const svg = $$("pizza-svg-element"); if (!svg) return;
    const CX = 355, CY = 285, MAX_R = 210, total = p1.metrics.length, angle = (2 * Math.PI) / total;
    
    let markup = [52.5, 105, 157.5, 210].map(r => `<circle cx="${CX}" cy="${CY}" r="${r}" style="fill:none; stroke:rgba(255,255,255,.05); stroke-width:1;" />`).join('');
    let p1Points = [], p2Points = [];

    p1.metrics.forEach((metric, i) => {
        const curAngle = (i * angle) - Math.PI / 2; const cos = Math.cos(curAngle), sin = Math.sin(curAngle);
        markup += `<line x1="${CX}" y1="${CY}" x2="${CX + MAX_R * cos}" y2="${CY + MAX_R * sin}" style="stroke:rgba(255,255,255,.05); stroke-width:1;" />`;

        let anchor = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";
        markup += `<text x="${CX + (MAX_R + 25) * cos}" y="${CY + (MAX_R + 20) * sin}" class="ax-lbl" text-anchor="${anchor}" dominant-baseline="middle" style="fill:#94a3b8; font-size:12px; font-weight:700;">${metric}</text>`;

        const p1R = (p1.values[i] / 100) * MAX_R; p1Points.push(`${CX + p1R * cos},${CY + p1R * sin}`);
        if (p2) { const p2R = (p2.values[i] / 100) * MAX_R; p2Points.push(`${CX + p2R * cos},${CY + p2R * sin}`); }
    });

    markup += `<polygon points="${p1Points.join(' ')}" style="fill:rgba(0,255,213,0.12); stroke:#00ffd5; stroke-width:2.5; filter:drop-shadow(0 0 8px rgba(0,255,213,0.3));" />`;
    if (p2 && p2Points.length > 0) {
        markup += `<polygon points="${p2Points.join(' ')}" style="fill:rgba(255,0,127,0.12); stroke:#ff007f; stroke-width:2.5; filter:drop-shadow(0 0 8px rgba(255,0,127,0.3));" />`;
    }

    p1.metrics.forEach((metric, i) => {
        const curAngle = (i * angle) - Math.PI / 2; const cos = Math.cos(curAngle), sin = Math.sin(curAngle);
        const p1R = (p1.values[i] / 100) * MAX_R;
        if (p1.values[i] > 10) markup += `<g><circle cx="${CX + p1R * cos}" cy="${CY + p1R * sin}" r="4" fill="#00ffd5" /><text x="${CX + (p1R - 14) * cos}" y="${CY + (p1R - 12) * sin}" style="fill:#00ffd5; font-size:10px; font-weight:900;" text-anchor="middle">${Math.round(p1.values[i])}</text></g>`;

        if (p2) {
            const p2R = (p2.values[i] / 100) * MAX_R;
            if (p2.values[i] > 10) markup += `<g><circle cx="${CX + p2R * cos}" cy="${CY + p2R * sin}" r="4" fill="#ff007f" /><text x="${CX + (p2R + 14) * cos}" y="${CY + (p2R + 12) * sin}" style="fill:#ff007f; font-size:10px; font-weight:900;" text-anchor="middle">${Math.round(p2.values[i])}</text></g>`;
        }
    });

    markup += `<circle cx="${CX}" cy="${CY}" r="6" fill="#FFFFFF" />`; svg.innerHTML = markup;
}

function downloadRadarPNG() {
    const el = $$("chart-only");
    document.fonts.ready.then(() => {
        html2canvas(el, { scale: 4, backgroundColor: "#0B1220", useCORS: true, logging: false }).then(canvas => { 
            const link = document.createElement("a"); 
            link.download = `radar_comparison_${RADAR_PLAYER_1 ? RADAR_PLAYER_1.toLowerCase().replace(/ /g, "_") : "chart"}.png`; 
            link.href = canvas.toDataURL("image/png"); link.click(); 
        }).catch(e => console.error(e)); 
    });
}

window.loadRadarChart = function(p1, p2) { RADAR_PLAYER_1 = p1; RADAR_PLAYER_2 = p2 || ""; onRadarFilterChange(); };