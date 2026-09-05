// ==========================================================================
// PER 90 - TABLE.JS - DEL 1 AF 4 (MASTER STATES & ROBUST SPLIT-CARD CSS)
// ==========================================================================

let TABLE_GLOBAL_DATA = null;
let TABLE_SELECTED_METRIC = "Goals";
let TABLE_STAT_TYPE = "Per 90";

// Filter tilstande: Tomme arrays [] betyder "Vis alle" ligesom pizza
let TABLE_FILTERS = {
    leagues: [],
    nationalities: [],
    positions: [],
    minAge: 0,
    maxAge: 100,
    minMins: 0,
    maxMins: 99999
};

const $t = id => document.getElementById(id);

// 🎨 CORE DESIGN INJECTION (DIT FORETRUKNE VISUELLE LOOK MED FULDE BOKSE)
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://googleapis.com');

        .table-blocks-container { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 950px; margin: 0 auto; padding: 0 10px; box-sizing: border-box; }
        
        /* 🎯 LEADERBOARD OVER-OVERSKRIFT: Definerer kolonnerne én gang for alle øverst! */
        .table-scouting-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 25px; font-family: 'Gabarito', sans-serif; font-size: 10.5px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid rgba(255,255,255,0.05); margin-bottom: 5px; box-sizing: border-box; }
        .table-sc-hdr-left { display: flex; align-items: center; gap: 20px; }
        .table-sc-hdr-right { display: flex; align-items: center; gap: 25px; flex-grow: 1; justify-content: flex-end; max-width: 500px; padding-right: 65px; box-sizing: border-box; }
        
        /* 🎯 THE SPLIT CARD: Det store, rå, mørke profilkort til din Top 10 1:1 */
        .table-leaderboard-card { background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; padding: 16px 25px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; gap: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); position: relative; overflow: hidden; transition: transform 0.15s ease; }
        .table-leaderboard-card:hover { transform: translateX(3px); border-color: rgba(255,255,255,0.08); }
        
        /* Venstre felt */
        .table-row-left { display: flex; align-items: center; gap: 20px; }
        .table-row-rank { font-size: 22px; font-weight: 900; color: #f59e0b; width: 35px; text-align: center; text-shadow: 0 0 12px rgba(245,158,11,0.25); }
        
        /* Logo ramme */
        .table-row-logo-box { width: 44px; height: 44px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 4px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .table-row-crest { width: 100%; height: 100%; object-fit: contain; }
        
        .table-row-names { display: flex; flex-direction: column; gap: 2px; }
        .table-row-player-name { font-size: 15px; font-weight: 900; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .table-row-subtext { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        
        /* Højre felt */
        .table-row-right { display: flex; align-items: center; gap: 25px; flex-grow: 1; justify-content: flex-end; max-width: 500px; box-sizing: border-box; }
        .table-row-meta-val-pos { font-size: 12px; font-weight: 800; color: #00f0ff; text-transform: uppercase; width: 50px; text-align: center; }
        .table-row-meta-val-age { font-size: 13px; font-weight: 700; color: #94a3b8; width: 55px; text-align: center; }
        .table-row-meta-val-mins { font-size: 13px; font-weight: 700; color: #94a3b8; width: 65px; text-align: center; }

        /* Lysende Performance bjælke */
        .table-row-bar-container { display: flex; flex-direction: column; width: 140px; }
        .table-row-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; }
        .table-row-bar-fill { height: 100%; background: var(--accent-purple); border-radius: 10px; width: 0%; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        
        .table-row-score-value { font-size: 16px; font-weight: 900; color: #f59e0b; width: 65px; text-align: right; text-shadow: 0 0 10px rgba(245,158,11,0.2); }

        /* Skuffe-layout elementer */
        .table-drawer-group { display: flex; flex-direction: column; gap: 4px; width: 100%; box-sizing: border-box; margin-bottom: 4px; }
        .table-drawer-label { font-size: 10.5px; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .table-drawer-select, .table-drawer-input { background: #07030c; color: #fff; border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 6px; font-size: 12.5px; outline: none; cursor: pointer; width: 100%; box-sizing: border-box; font-family: 'Gabarito', sans-serif; }
        .table-drawer-checkbox-box { background: #07030c; border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 8px; max-height: 115px; overflow-y: auto; }
        .table-drawer-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: var(--text-primary); transition: opacity 0.15s; }
        .table-drawer-input-row { display: flex; align-items: center; gap: 10px; width: 100%; }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - TABLE.JS - DEL 2 AF 4 (LAYOUT & CHECKBOX DRAWER PANEL)
// ==========================================================================

async function initTableView(container) {
    container.innerHTML = `
        <section id="view-table" class="content-view active" style="padding-top: 10px;">
            
            <!-- STORT FLOT HOVED-IKON OG DESIGNLINJE -->
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-list-ol" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Top 10 Leaderboard</span>
            </div>

            <!-- BUTTON DER ÅBNER FILTER-SKUFFEN -->
            <div class="control-trigger-wrapper" style="margin-bottom: 25px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Leaderboard <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            
            <!-- DET FLOTTE, MØRKE DIAGRAM-KORT (CAPTURE OMRÅDE) -->
            <div class="table-blocks-container" id="table-capture-target-area" style="padding: 15px 5px; width: 100%; box-sizing: border-box;"></div>

            <!-- SIGNATUR JOGA BONITO DOWNLOAD KNAP I BUNDEN -->
            <div style="display: flex; justify-content: center; margin-top: 30px; width: 100%;">
                <button onclick="downloadTablePNG()" style="background: var(--accent-purple); color: #06140c; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">Download Leaderboard as PNG</button>
            </div>
        </section>
    `;
    
    await loadTableAPIDataFeed();
}

function buildAndAppendTableDrawerHTML() {
    const gammelDrawer = document.querySelector('.table-filter-drawer');
    if (gammelDrawer) gammelDrawer.remove();

    const list = TABLE_GLOBAL_DATA.players;
    const availableAxes = TABLE_GLOBAL_DATA.table_headers.slice(7);

    const leagues = [...new Set(list.map(p => p.league).filter(Boolean).sort())];
    const nationalities = [...new Set(list.map(p => p.nationality).filter(Boolean).sort())];
    const positions = [...new Set(list.map(p => p.position).filter(Boolean).sort())];

    const metricOptions = availableAxes.map(ax => `<option value="${ax}" ${ax === TABLE_SELECTED_METRIC ? 'selected' : ''}>${ax}</option>`).join('');

    const generateCheckboxesHTML = (items, key) => {
        return items.map(item => {
            const checked = TABLE_FILTERS[key].includes(item);
            return `<label class="table-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${item}" ${checked ? "checked" : ""} onchange="handleTableCheckboxToggle(this, '${key}')" style="accent-color: var(--accent-purple);"> ${item}</label>`;
        }).join('');
    };

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer stats-filter-drawer table-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Leaderboard Settings</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-height: 85vh; overflow-y: auto;">
            
            <div class="table-drawer-group">
                <label class="table-drawer-label">Scouting Metric</label>
                <select id="tb-opt-metric" class="table-drawer-select" onchange="handleTableConfigChange()">
                    ${metricOptions}
                </select>
            </div>

            <div class="table-drawer-group">
                <label class="table-drawer-label">Stat Type</label>
                <select id="tb-opt-stat-type" class="table-drawer-select" onchange="handleTableConfigChange()">
                    <option value="Per 90" ${TABLE_STAT_TYPE === "Per 90" ? "selected" : ""}>Per 90</option>
                    <option value="Total" ${TABLE_STAT_TYPE === "Total" ? "selected" : ""}>Total (Akkumuleret)</option>
                </select>
            </div>
            
            <div class="table-drawer-group"><label class="table-drawer-label">Ligaer</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(leagues, 'leagues')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Nationaliteter</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(nationalities, 'nationalities')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Positioner</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(positions, 'positions')}</div></div>

            <div class="table-drawer-group">
                <label class="table-drawer-label">Alder Range (Min / Max)</label>
                <div class="table-drawer-input-row">
                    <input type="number" id="tb-filt-min-age" class="table-drawer-input" value="${TABLE_FILTERS.minAge}" oninput="handleTableFilterInputChange()">
                    <input type="number" id="tb-filt-max-age" class="table-drawer-input" value="${TABLE_FILTERS.maxAge}" oninput="handleTableFilterInputChange()">
                </div>
            </div>
            <div class="table-drawer-group">
                <label class="table-drawer-label">Minutter Range (Min / Max)</label>
                <div class="table-drawer-input-row">
                    <input type="number" id="tb-filt-min-mins" class="table-drawer-input" value="${TABLE_FILTERS.minMins}" oninput="handleTableFilterInputChange()">
                    <input type="number" id="tb-filt-max-mins" class="table-drawer-input" value="${TABLE_FILTERS.maxMins}" oninput="handleTableFilterInputChange()">
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(drawerDiv);
}
// ==========================================================================
// PER 90 - TABLE.JS - DEL 3 AF 4 (API SYNC & STATE MANAGEMENT)
// ==========================================================================

async function loadTableAPIDataFeed() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/table-data?stat_type=${encodeURIComponent(TABLE_STAT_TYPE)}`);
        if (res.ok) {
            TABLE_GLOBAL_DATA = await res.json();
            const list = TABLE_GLOBAL_DATA.players;

            if (list.length > 0) {
                const ages = list.map(p => p.age).filter(a => a > 0);
                const mins = list.map(p => p.mins_played).filter(m => m > 0);
                TABLE_FILTERS.minAge = Math.min(...ages); TABLE_FILTERS.maxAge = Math.max(...ages);
                TABLE_FILTERS.minMins = Math.min(...mins); TABLE_FILTERS.maxMins = Math.max(...mins);
            }

            buildAndAppendTableDrawerHTML();
            buildTableLeaderboardEngine();
        }
    } catch (e) { console.error("Tabel API fejl:", e); }
}

async function handleTableConfigChange() {
    const metricSelect = $t("tb-opt-metric");
    const typeSelect = $t("tb-opt-stat-type");

    if (!metricSelect || !typeSelect) return;
    const nytType = typeSelect.value;
    TABLE_SELECTED_METRIC = metricSelect.value;

    if (nytType !== TABLE_STAT_TYPE) {
        TABLE_STAT_TYPE = nytType;
        await loadTableAPIDataFeed();
    } else {
        buildTableLeaderboardEngine();
    }
}

function handleTableFilterInputChange() {
    if (!$t("tb-filt-min-age")) return;
    TABLE_FILTERS.minAge = parseInt($t("tb-filt-min-age").value) || 0;
    TABLE_FILTERS.maxAge = parseInt($t("tb-filt-max-age").value) || 100;
    TABLE_FILTERS.minMins = parseInt($t("tb-filt-min-mins").value) || 0;
    TABLE_FILTERS.maxMins = parseInt($t("tb-filt-max-mins").value) || 99999;
    
    buildTableLeaderboardEngine();
}

function handleTableCheckboxToggle(cb, key) {
    const val = cb.value;
    if (cb.checked) {
        if (!TABLE_FILTERS[key].includes(val)) TABLE_FILTERS[key].push(val);
    } else {
        TABLE_FILTERS[key] = TABLE_FILTERS[key].filter(v => v !== val);
    }
    cb.parentElement.style.opacity = cb.checked ? '1' : '0.4';
    buildTableLeaderboardEngine();
}
// ==========================================================================
// PER 90 - TABLE.JS - DEL 4 AF 4 (BOX ENGINE WITH LOGO & CAPTURE EXPORT)
// ==========================================================================

async function buildTableLeaderboardEngine() {
    const container = $t("table-capture-target-area"); if (!container || !TABLE_GLOBAL_DATA) return;
    container.innerHTML = "";

    const filtered = TABLE_GLOBAL_DATA.players.filter(p => {
        if (TABLE_FILTERS.leagues.length > 0 && !TABLE_FILTERS.leagues.includes(p.league)) return false;
        if (TABLE_FILTERS.nationalities.length > 0 && !TABLE_FILTERS.nationalities.includes(p.nationality)) return false;
        if (TABLE_FILTERS.positions.length > 0 && !TABLE_FILTERS.positions.includes(p.position)) return false;
        if (p.age < TABLE_FILTERS.minAge || p.age > TABLE_FILTERS.maxAge) return false;
        if (p.mins_played < TABLE_FILTERS.minMins || p.mins_played > TABLE_FILTERS.maxMins) return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#64748b; font-weight:700;">INGEN SPILLERE MATCHER DINE SØGEKRITERIER</div>`;
        return;
    }

    const top10 = filtered
        .sort((a, b) => (b.metrics[TABLE_SELECTED_METRIC] || 0) - (a.metrics[TABLE_SELECTED_METRIC] || 0))
        .slice(0, 10);

    const highestScore = top10.length > 0 ? (top10[0].metrics[TABLE_SELECTED_METRIC] || 1) : 1;

    let markup = `
        <div class="table-scouting-header">
            <div class="table-sc-hdr-left">
                <div style="width:35px; text-align:center;">Rank</div>
                <div style="padding-left:64px;">Spillerdetaljer</div>
            </div>
            <div class="table-sc-hdr-right">
                <div style="width:50px; text-align:center;">Pos</div>
                <div style="width:55px; text-align:center;">Alder</div>
                <div style="width:65px; text-align:center;">Minutter</div>
                <div style="width:140px; padding-left:25px;">Performance</div>
                <div style="width:65px; text-align:right;">${TABLE_SELECTED_METRIC}</div>
            </div>
        </div>
    `;

    markup += top10.map((p, idx) => {
        const val = p.metrics[TABLE_SELECTED_METRIC] || 0;
        const barWidthPct = highestScore > 0 ? (val / highestScore) * 100 : 0;
        const imgId = `tb-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;

        return `
            <div class="table-leaderboard-card">
                <div class="table-row-left">
                    <div class="table-row-rank">#${idx + 1}</div>
                    <div class="table-row-logo-box">
                        <img id="${imgId}" class="table-row-crest" src="data:image/svg+xml;utf8,<svg xmlns=%22http://w3.org width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23475569%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>'" />
                    </div>
                    <div class="table-row-names">
                        <div class="table-row-player-name">${p.player_name}</div>
                        <div class="table-row-subtext">${p.team} | ${p.league}</div>
                    </div>
                </div>

                <div class="table-row-right">
                    <div class="table-row-meta-val-pos">${p.position}</div>
                    <div class="table-row-meta-val-age">${p.age} År</div>
                    <div class="table-row-meta-val-mins">${p.mins_played}m</div>
                    <div class="table-row-bar-container">
                        <div class="table-row-bar-bg">
                            <div class="table-row-bar-fill" style="width: ${barWidthPct}%;"></div>
                        </div>
                    </div>
                    <div class="table-row-score-value">${val.toFixed(2)}</div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = markup;

    // Asynkron hentning af base64-logoer 1:1 fra pizza-logikken
    top10.forEach(async (p, idx) => {
        const imgId = `tb-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;
        const imgEl = document.getElementById(imgId);
        if (!imgEl) return;

        if (p.team_id && p.team_id !== "nan") {
            try {
                const res = await fetch(`${API_BASE_URL}/api/logo/${p.team_id}`).then(r => r.json());
                if (res.logo_base64) {
                    imgEl.src = res.logo_base64;
                }
            } catch (e) { console.warn(`Kunne ikke hente logo for hold ID: ${p.team_id}`, e); }
        }
    });
}

// 🎯 DIT FOTO-ISOLEREDE DOWNLOAD SYSTEM TIL DATATABELLEN 1:1 🎯
function downloadTablePNG() {
    const el = $t("table-capture-target-area"); if (!el) return;
    html2canvas(el, { scale: 4, backgroundColor: "#0B1220", useCORS: true, logging: false }).then(canvas => {
        const link = document.createElement("a"); 
        link.download = `leaderboard_top10_${TABLE_SELECTED_METRIC.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL("image/png"); link.click();
    });
}

document.addEventListener("click", e => {
    if (!e.target.closest('#table-player-wrapper')) { const p = $t("table-player-options"); if(p) p.style.display = "none"; }
});
