// ==========================================================================
// PER 90 - RADAR.JS - DEL 1 AF 4 (PRODUKTIONSKLAR ENGINE)
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
let RADAR_COLOR_1 = "#00ffd5", RADAR_COLOR_2 = "#ff007f";

const $r = id => document.getElementById(id);

async function initRadarView(container) {
    container.innerHTML = `
        <section id="view-radar" class="content-view active">
            <div class="chart-header-container"><i class="fa-solid fa-circle-nodes"></i><span>Radar Chart</span></div>
            <div class="control-trigger-wrapper" style="margin-bottom: 24px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Radar <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            <div class="chart-container-wrapper" id="radar-chart-only" style="position: relative; display: flex; flex-direction: column; align-items: center; padding: 40px; background: #0B1220; border-radius: 12px; min-height: 600px; box-shadow: 0 20px 40px rgba(0,0,0,0.4); width: 100%;">
                <div id="radar-warning-overlay" style="display: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(11, 6, 18, 0.9); border-radius: 12px; justify-content: center; align-items: center; z-index: 150;">
                    <div style="color: #ff007f; font-weight: 700; text-align: center;">CHOOSE AT LEAST 3 METRICS FOR SPIDERWEB</div>
                </div>
                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 class="p-nm" id="radar-player-title" style="font-size: 24px; font-weight: 900; color: #ffffff; margin: 0 0 4px 0;">Radar Sammenligning</h2>
                    <div id="radar-player-subtitle" style="font-size: 13px; color: #948aa3;">Vælg to spillere for at tegne edderkoppespind...</div>
                </div>
                <div class="chart-box" style="width: 100%; max-width: 500px; height: 440px; display: flex; justify-content: center; align-items: center;">
                    <canvas id="radar-chart-canvas" width="500" height="440" style="max-width: 100%; height: auto;"></canvas>
                </div>
            </div>
            <div class="download" style="display: flex; justify-content: center; margin-top: 24px;">
                <button onclick="downloadRadarPNG()" style="background: var(--accent-purple); color: #06140c; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; cursor: pointer;">Download as PNG</button>
            </div>
        </section>
    `;

    const gammelRadarDrawer = document.querySelector('.radar-filter-drawer');
    if (gammelRadarDrawer) gammelRadarDrawer.remove();

    buildAndAppendRadarDrawer();
}
// ==========================================================================
// PER 90 - RADAR.JS - DEL 2 AF 4 (FILTER PANEL GENERATOR)
// ==========================================================================

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

function updateRadarColors(playerNum) {
    if (playerNum === 1) RADAR_COLOR_1 = $r("radar-color1-input").value;
    if (playerNum === 2) RADAR_COLOR_2 = $r("radar-color2-input").value;
    onRadarFilterChange();
}
// ==========================================================================
// PER 90 - RADAR.JS - DEL 3 AF 4 (LOGIK OG EVENT HANDLERS)
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

async function initCustomRadarSelectors() {
    try {
        const players = await fetch(`${API_BASE_URL}/api/pizza/players`).then(r => r.json());
        
        if (players.length > 1 && $r("radar-p1-items-container") && $r("radar-p2-items-container")) {
            RADAR_PLAYER_1 = players[0]; RADAR_PLAYER_2 = players[1]; 
            $r("radar-p1-selected-text").innerText = RADAR_PLAYER_1;
            $r("radar-p2-selected-text").innerText = RADAR_PLAYER_2;
            
            // 🎯 RETTET: De to knivskarpe og fejlsikrede linjer til din editor!
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
// ==========================================================================
// PER 90 - RADAR.JS - DEL 4 AF 4 (MATEMATISK TEGNING OG FILL)
// ==========================================================================

async function loadRadarChartDataWithFilters(p1, p2, metricsList) {
    try {
        let p1Url = `${API_BASE_URL}/api/radar?player=${encodeURIComponent(p1)}&compare_pos=`;
        let p2Url = `${API_BASE_URL}/api/radar?player=${encodeURIComponent(p2)}&compare_pos=`;
        metricsList.forEach(m => { p1Url += `&metrics=${encodeURIComponent(m)}`; p2Url += `&metrics=${encodeURIComponent(m)}`; });
        
        const [d1, d2] = await Promise.all([
            fetch(p1Url).then(r => r.json()),
            fetch(p2Url).then(r => r.json()).catch(() => null)
        ]);

        $r("radar-player-title").innerText = d2 && d2.player_name ? `${d1.player_name} vs. ${d2.player_name}` : d1.player_name;
        $r("radar-player-subtitle").innerText = "Percentile Spiderweb Comparison";
        drawSpiderweb(d1, d2);
    } catch (e) { console.error("Radar motorfejl:", e); }
}

function drawSpiderweb(d1, d2) {
    const canvas = $r("radar-chart-canvas"); if (!canvas) return;
    const ctx = canvas.getContext("2d"); ctx.clearRect(0, 0, canvas.width, canvas.height);
    const CX = canvas.width / 2, CY = canvas.height / 2 + 10, MAX_R = 140, total = d1.metrics.length, angle = (2 * Math.PI) / total;

    // 1. BAGGRUNDS-NET (Ringe ved 25, 50, 75, 100) — FAST SAT OP UDEN SYNTEXFEJL
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"; ctx.lineWidth = 1;
    [35, 70, 105, 140].forEach(r => {
        ctx.beginPath();
        for (let i = 0; i < total; i++) {
            const x = CX + r * Math.cos(i * angle - Math.PI/2), y = CY + r * Math.sin(i * angle - Math.PI/2);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
    });

    d1.metrics.forEach((metric, i) => {
        const a = i * angle - Math.PI / 2, cos = Math.cos(a), sin = Math.sin(a);
        ctx.beginPath(); ctx.moveTo(CX, CY); ctx.lineTo(CX + MAX_R * cos, CY + MAX_R * sin); ctx.stroke();
        ctx.fillStyle = "#94a3b8"; ctx.font = "bold 10px Gabarito, sans-serif";
        ctx.textAlign = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "center";
        ctx.fillText(metric, CX + (MAX_R + 15) * cos, CY + (MAX_R + 8) * sin + 4);
    });

    // 2. RENDERING AF SPILLER-LINJER + INTEGRERET FARVEFYLD (FILL) 🎯
    const drawPlayerPath = (data, color) => {
        if (!data || !data.metrics) return;
        ctx.beginPath();
        data.metrics.forEach((_, i) => {
            const r = ((data.percentiles[i] || 0) / 100) * MAX_R, a = i * angle - Math.PI / 2;
            const x = CX + r * Math.cos(a), y = CY + r * Math.sin(a);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.closePath(); 
        
        ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke(); 
        ctx.fillStyle = color + "18"; ctx.fill(); // 🎯 FARVEFYLD AKTIVERET PERFEKT HER!

        // Noder/prikker
        data.metrics.forEach((_, i) => {
            const r = ((data.percentiles[i] || 0) / 100) * MAX_R, a = i * angle - Math.PI / 2;
            ctx.beginPath(); ctx.arc(CX + r * Math.cos(a), CY + r * Math.sin(a), 3.5, 0, 2*Math.PI);
            ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.strokeStyle = color; ctx.stroke();
        });
    };

    if (d2 && d2.metrics) drawPlayerPath(d2, RADAR_COLOR_2);
    drawPlayerPath(d1, RADAR_COLOR_1);
}

function downloadRadarPNG() {
    const el = $r("radar-chart-only");
    html2canvas(el, { scale: 4, backgroundColor: "#0B1220", useCORS: true, logging: false }).then(canvas => {
        const link = document.createElement("a"); link.download = `radar_comparison.png`;
        link.href = canvas.toDataURL("image/png"); link.click();
    });
}

window.loadRadarChartData = function(playerName) {
    if (playerName) selectRadarItem('player1', playerName); else onRadarFilterChange();
};

document.addEventListener("click", e => {
    if (!e.target.closest('#radar-player1-wrapper')) { const p = $r("radar-player1-options"); if(p) p.style.display = "none"; }
    if (!e.target.closest('#radar-player2-wrapper')) { const p = $r("radar-player2-options"); if(p) p.style.display = "none"; }
    if (!e.target.closest('.multiselect')) { const cb = $r("radar-checkboxes-container"); if(cb) cb.style.display = "none"; }
});
