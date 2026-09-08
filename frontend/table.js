// ==========================================================================
// PER 90 - TABLE.JS - DEL 1 AF 6 (MASTER CONFIG & STATISKE PARAMETRE)
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
// ==========================================================================
// PER 90 - TABLE.JS - DEL 2 AF 6 (RUNTIME DESIGN & RESPONSIV TABEL-CSS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .table-blocks-container { width: 100%; max-width: 950px; margin: 0 auto; padding: 0 10px; box-sizing: border-box; }
        
        /* 🌐 DET GLOBALE TABEL-SETUP */
        .scouting-leaderboard-table {
            width: 100% !important;
            border-collapse: separate !important;
            border-spacing: 0 8px !important; /* Laver luft mellem rækkerne, så det ligner kort */
            font-family: 'Gabarito', sans-serif;
        }

        /* 🎯 APPSYNKRONISERING: Overskrifterne låses i præcise vertikale kanaler */
        .scouting-leaderboard-table thead tr {
            font-size: 11px;
            font-weight: 900;
            color: #ffffff !important;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }

        /* 🎯 LIVE HEADER REPARATION: Låser overskrifterne mekanisk fast, så de aldrig kan rykke sig, når talstørrelser ændres */
        .scouting-leaderboard-table th {
            padding: 12px 20px !important;
            border-bottom: 2px solid rgba(255,255,255,0.08);
            box-sizing: border-box !important;
            line-height: 14px !important;
            height: 38px !important;
            margin: 0 !important;
        }


        /* DET FLOTTE, MØRKE DIAGRAM-KORT (Bygget direkte på <td>-rækken) */
        .scouting-leaderboard-table tbody tr {
            background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important;
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
            transition: transform 0.15s ease;
        }
        
        /* 🎯 FIX: Tvinger alle interne linjer og borders væk under hover, så der ikke popper streger op */
        .scouting-leaderboard-table tbody tr:hover { 
            transform: translateX(3px) !important; 
        }
        .scouting-leaderboard-table tbody tr:hover td {
            border-color: transparent !important;
            border-left: none !important;
            border-right: none !important;
        }

        /* 🎯 FIX: Sænket opacity på Rank efter dit ønske, så det matcher Pos, Age og Min */
        .font-rank { font-size: 20px; font-weight: 800; color: #fff; opacity: 0.35 !important; }


        /* Afrunder hjørnerne på hvert enkelt "kort-række" */
        .scouting-leaderboard-table tbody td:first-child { border-left: 1px solid rgba(255,255,255,0.04); border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        .scouting-leaderboard-table tbody td:last-child { border-right: 1px solid rgba(255,255,255,0.04); border-top-right-radius: 12px; border-bottom-right-radius: 12px; }

        /* 🎯 FASTE BREDDE-KANALER (Slavelåser top og bund i browserens motor) */
        .col-rank { width: 75px; text-align: center !important; }
        .col-logo { width: 80px; text-align: center !important; }
        .col-player { text-align: left !important; }
        .col-pos { width: 75px; text-align: center !important; }
        .col-age { width: 80px; text-align: center !important; }
        .col-min { width: 90px; text-align: center !important; }
        .col-metric { width: 180px; text-align: center !important; }

        /* Hjælpe-klasser til formatering */
        .text-center { text-align: center !important; }
        .font-rank { 
            font-size: 16px !important; /* Skruet ned fra 20px for et mere strømlinet look */
            font-weight: 800; 
            color: #fff; 
            opacity: 0.35 !important; 
        }
        
        .font-meta { 
            font-size: 13px !important; /* Tvunget ned i en mindre, elegant størrelse på store skærme */
            font-weight: 900; 
            color: #fff; 
            opacity: 0.35 !important; 
        }

        .table-row-logo-box { width: 40px; height: 44px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 3px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto; }
        .table-row-crest { width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity 0.25s ease-in-out; }
        .table-row-crest.logo-loaded { opacity: 1 !important; }
        
        .table-row-names { display: flex; flex-direction: column; gap: 2px; min-width: 0; text-align: left; }
        .table-row-player-name { font-size: 14px; font-weight: 900; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .table-row-subtext { font-size: 10.5px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .table-row-bar-container { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; }
        .table-row-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; margin-top: 4px; }
        .table-row-bar-fill { height: 100%; background: var(--accent-purple); border-radius: 10px; width: 0%; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .table-row-score-value { font-size: 14px; font-weight: 900; color: var(--accent-purple); width: 100%; text-shadow: 0 0 10px rgba(168,85,247,0.2); line-height: 1; }

        /* Skuffe-layout elementer */
        .table-drawer-group { display: flex; flex-direction: column; gap: 4px; width: 100%; box-sizing: border-box; margin-bottom: 4px; }
        .table-drawer-label { font-size: 10.5px; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .table-drawer-select, .table-drawer-input { background: #07030c; color: #fff; border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 6px; font-size: 12.5px; outline: none; cursor: pointer; width: 100%; box-sizing: border-box; font-family: 'Gabarito', sans-serif; }
        .table-drawer-checkbox-box { background: #07030c; border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 8px; max-height: 115px; overflow-y: auto; }
        .table-drawer-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: var(--text-primary); transition: opacity 0.15s; }
        .table-drawer-input-row { display: flex; align-items: center; gap: 10px; width: 100%; }

        /* 📱 TABLET- OG MOBILOPTIMERING V5 (KRYMPER ELEGANTE PÅ MINDRE SKÆRME) */
        @media (max-width: 1025px) {
            .scouting-leaderboard-table th, .scouting-leaderboard-table tbody td { padding: 8px 10px !important; }
            .col-rank { width: 50px; }
            .col-logo { width: 55px; }
            .col-pos { width: 50px; }
            .col-age { width: 55px; }
            .col-min { width: 65px; }
            .col-metric { width: 110px; }
            
            .font-rank { font-size: 14px !important; }
            .table-row-player-name { font-size: 11px !important; }
            .table-row-subtext { font-size: 9px !important; }
            .font-meta { font-size: 10px !important; }
            .table-row-score-value { font-size: 11px !important; }
            .table-row-logo-box { width: 32px !important; height: 36px !important; border-radius: 6px; }
        }

        /* 📱 MOBILTELEFONER (Samsung S8+, iPhones osv. under 480px) */
        @media (max-width: 480px) {
            /* Skjul Pos, Age og Min helt på små mobilskærme, så intet mases */
            .col-pos, .col-age, .col-min { display: none !important; }
            
            .col-rank { width: 40px; }
            .col-logo { width: 45px; }
            .col-metric { width: 85px; }
            
            .scouting-leaderboard-table th, .scouting-leaderboard-table tbody td { padding: 6px 6px !important; }
            .table-row-logo-box { width: 26px !important; height: 30px !important; padding: 2px; border-radius: 5px; }
            .font-rank { font-size: 11px !important; }
            .table-row-player-name { font-size: 10px !important; }
            .table-row-subtext { font-size: 8px !important; }
            .table-row-score-value { font-size: 10px !important; }
        }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - TABLE.JS - DEL 3 AF 6 (VIEW INITIALISERING & DRAWER UI BUILDER)
// ==========================================================================

async function initTableView(container) {
    container.innerHTML = `
        <section id="view-table" class="content-view active" style="padding-top: 10px;">
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-list-ol" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Table</span>
            </div>

            <div class="control-trigger-wrapper" style="margin-bottom: 25px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Leaderboard <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            
            <div class="table-blocks-container" id="table-capture-target-area" style="padding: 15px 5px; width: 100%; box-sizing: border-box;"></div>

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
            <div class="table-drawer-group"><label class="table-drawer-label">Metric</label><select id="tb-opt-metric" class="table-drawer-select" onchange="handleTableConfigChange()">${metricOptions}</select></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Stat Type</label><select id="tb-opt-stat-type" class="table-drawer-select" onchange="handleTableConfigChange()"><option value="Per 90" ${TABLE_STAT_TYPE === "Per 90" ? "selected" : ""}>Per 90</option><option value="Total" ${TABLE_STAT_TYPE === "Total" ? "selected" : ""}>Total</option></select></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Leagues</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(leagues, 'leagues')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Nationalities</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(nationalities, 'nationalities')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Positions</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(positions, 'positions')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Age (Min / Max)</label><div class="table-drawer-input-row"><input type="number" id="tb-filt-min-age" class="table-drawer-input" value="${TABLE_FILTERS.minAge}" oninput="handleTableFilterInputChange()"><input type="number" id="tb-filt-max-age" class="table-drawer-input" value="${TABLE_FILTERS.maxAge}" oninput="handleTableFilterInputChange()"></div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Minutes (Min / Max)</label><div class="table-drawer-input-row"><input type="number" id="tb-filt-min-mins" class="table-drawer-input" value="${TABLE_FILTERS.minMins}" oninput="handleTableFilterInputChange()"><input type="number" id="tb-filt-max-mins" class="table-drawer-input" value="${TABLE_FILTERS.maxMins}" oninput="handleTableFilterInputChange()"></div></div>
        </div>
    `;
    document.body.appendChild(drawerDiv);
}
// ==========================================================================
// PER 90 - TABLE.JS - DEL 4 AF 6 (API SYNC & INTERACTION LOGIK)
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
    const metricSelect = $t("tb-opt-metric"), typeSelect = $t("tb-opt-stat-type");
    if (!metricSelect || !typeSelect) return;
    const nytType = typeSelect.value; TABLE_SELECTED_METRIC = metricSelect.value;

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
// PER 90 - TABLE.JS - DEL 5 AF 6 (TABEL-DATAMOTOR & LOGO LOGIK)
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
        <table class="scouting-leaderboard-table">
            <thead>
                <tr>
                    <th class="col-rank">Rank</th>
                    <th class="col-logo"></th>
                    <th class="col-player">Player</th>
                    <th class="col-pos text-center">Pos.</th>
                    <th class="col-age text-center">Age</th>
                    <th class="col-min text-center">Min.</th>
                    <th class="col-metric text-center">${TABLE_SELECTED_METRIC}</th>
                </tr>
            </thead>
            <tbody>
    `;

    markup += top10.map((p, idx) => {
        const val = p.metrics[TABLE_SELECTED_METRIC] || 0;
        const barWidthPct = highestScore > 0 ? (val / highestScore) * 100 : 0;
        const imgId = `tb-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;

        return `
                <tr>
                    <td class="col-rank font-rank">#${idx + 1}</td>
                    <td class="col-logo">
                        <div class="table-row-logo-box">
                            <img id="${imgId}" class="table-row-crest" src="data:image/svg+xml;utf8,<svg xmlns=%22http://w3.org width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23475569%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>'" />
                        </div>
                    </td>
                    <td class="col-player">
                        <div class="table-row-names">
                            <div class="table-row-player-name">${p.player_name}</div>
                            <div class="table-row-subtext">${p.team} | ${p.league}</div>
                        </div>
                    </td>
                    <td class="col-pos text-center font-meta">${p.position}</td>
                    <td class="col-age text-center font-meta">${p.age}</td>
                    <td class="col-min text-center font-meta">${p.mins_played}</td>
                    <td class="col-metric">
                        <div class="table-row-bar-container">
                            <div class="table-row-score-value">${val.toFixed(2)}</div>
                            <div class="table-row-bar-bg">
                                <div class="table-row-bar-fill" style="width: ${barWidthPct}%;"></div>
                            </div>
                        </div>
                    </td>
                </tr>
        `;
    }).join('');

    markup += `</tbody></table>`;
    container.innerHTML = markup;

    top10.forEach(async (p, idx) => {
        const imgId = `tb-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;
        const imgEl = document.getElementById(imgId); if (!imgEl) return;
        const containerBox = imgEl.parentElement;

        if (!p.team_id || p.team_id === "nan" || p.team_id === "None") {
            if (containerBox) containerBox.style.display = "none"; return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/logo/${p.team_id}`).then(r => r.json());
            if (res.logo_base64) {
                imgEl.onload = () => imgEl.classList.add('logo-loaded');
                imgEl.src = res.logo_base64;
            } else {
                if (containerBox) containerBox.style.display = "none";
            }
        } catch (e) { 
            if (containerBox) containerBox.style.display = "none";
        }
    });
}
// ==========================================================================
// PER 90 - TABLE.JS - DEL 6 AF 6 (ISOLERET MASTER-CLONE DOWNLOAD MOTOR)
// ==========================================================================

// ==========================================================================
// PER 90 - TABLE.JS - DEL 6 AF 6 (ISOLERET MASTER-CLONE DOWNLOAD MOTOR)
// ==========================================================================

function downloadTablePNG() {
    const originalEl = $t("table-capture-target-area"); if (!originalEl) return;
    
    // Opretter den urokkelige pc-sandbox container i baggrunden
    const hiddenContainer = document.createElement("div");
    Object.assign(hiddenContainer.style, {
        position: "absolute", left: "-9999px", top: "-9999px",
        width: "950px", minWidth: "950px", maxWidth: "950px", height: "auto", overflow: "visible"
    });
    
    const clone = originalEl.cloneNode(true);
    clone.id = "table-download-clone";
    
    Object.assign(clone.style, {
        width: "950px", minWidth: "950px", maxWidth: "950px",
        height: "auto", minHeight: "auto", maxHeight: "none",
        padding: "25px 25px 35px 25px", background: "#0B1220",
        boxSizing: "border-box", display: "block", opacity: "1"
    });
    
    hiddenContainer.appendChild(clone);
    
    const overrideStyle = document.createElement("style");
    overrideStyle.innerHTML = `
        /* Appsanktionering: Tvinger alle kolonner frem på billedet og ophæver mobile skjulere */
        #table-download-clone .scouting-leaderboard-table { width: 100% !important; display: table !important; border-collapse: separate !important; border-spacing: 0 8px !important; }
        #table-download-clone .scouting-leaderboard-table thead { display: table-header-group !important; }
        #table-download-clone .scouting-leaderboard-table tr { display: table-row !important; }
        
        #table-download-clone .col-pos, 
        #table-download-clone .col-age, 
        #table-download-clone .col-min { 
            display: table-cell !important; 
        }
        
        /* 🎯 HEADER TITEL FIX: Fastlåser cellehøjden, linjehøjden og skrifttypen totalt, så overskrifterne aldrig rykker sig */
        #table-download-clone .scouting-leaderboard-table th { 
            padding: 12px 20px !important; 
            font-size: 11px !important; 
            font-weight: 900 !important; 
            color: #ffffff !important; 
            line-height: 14px !important;
            height: 38px !important;
            box-sizing: border-box !important;
            margin: 0 !important;
        }
        
        #table-download-clone .scouting-leaderboard-table tbody td { padding: 12px 20px !important; font-size: 13px !important; background: none !important; }
        
        /* Genopbygger det mørke gradient-look på rækkerne i billedet */
        #table-download-clone .scouting-leaderboard-table tbody tr { 
            background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; 
        }
        
        #table-download-clone .font-rank { font-size: 20px !important; font-weight: 800 !important; color: #ffffff !important; opacity: 0.35 !important; }
        #table-download-clone .font-meta { font-size: 13px !important; font-weight: 900 !important; color: #ffffff !important; opacity: 0.35 !important; }
        #table-download-clone .table-row-player-name { font-size: 14px !important; font-weight: 900 !important; color: #ffffff !important; }
        #table-download-clone .table-row-subtext { font-size: 10.5px !important; color: #64748b !important; }
        #table-download-clone .table-row-score-value { font-size: 14px !important; font-weight: 900 !important; color: var(--accent-purple) !important; }
        #table-download-clone .table-row-logo-box { width: 40px !important; height: 44px !important; }
    `;
    
    document.body.appendChild(hiddenContainer);
    document.body.appendChild(overrideStyle);
    
    document.fonts.ready.then(() => {
        html2canvas(clone, { 
            scale: 4, 
            pixelRatio: 1, 
            width: 950,
            windowWidth: 950,
            backgroundColor: "#0B1220", 
            useCORS: true, 
            logging: false 
        }).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        
        // 🎯 MASTER-FIX: Tjekker om brugeren sidder på en iPad eller iPhone/Safari
        const isIPad = /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1 || /iPad/i.test(navigator.userAgent);
        
        if (isIPad) {
            // Åbner det genererede billede i et nyt faneblad, så iPad-brugeren blot kan holde fingeren nede og vælge "Gem i fotos"
            const newWindow = window.open();
            if (newWindow) {
                newWindow.document.write(`<iframe src="${imgData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
            } else {
                alert("Venligst tillad pop-ups for at downloade på denne iPad.");
            }
        } else {
            // Beholder den lynhurtige direkte download til PC og normale mobiler
            const link = document.createElement("a"); 
            link.download = `leaderboard_top10_${TABLE_SELECTED_METRIC.replace(/\\s+/g, '_')}.png`;
            link.href = imgData; 
            link.click();
        }
        
        hiddenContainer.remove(); 
        overrideStyle.remove();
    }).catch(e => { ... });

document.addEventListener("click", e => {
    if (!e.target.closest('#table-player-wrapper')) { const p = $t("table-player-options"); if(p) p.style.display = "none"; }
});
