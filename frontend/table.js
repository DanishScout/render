// ==========================================================================
// PER 90 - TABLE.JS - DEL 1 AF 4 (MASTER STATES & RESPONSIV SPLIT-CARD CSS)
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

// 🎨 CORE DESIGN INJECTION (DIT FAVORIT LOOK - NU FULDT MOBIL-OPTIMERET)
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .table-blocks-container { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 950px; margin: 0 auto; padding: 0 10px; box-sizing: border-box; }
        
        /* 🎯 APPSYNKRONISERING: Skruer markant op for lysstyrken, så overskrifterne står helt rent og tydeligt i appen */
        .table-scouting-header { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            padding: 10px 20px; 
            font-family: 'Gabarito', sans-serif; 
            font-size: 11px; 
            font-weight: 900;          /* Maksimal tykkelse */
            color: #ffffff !important; /* KRIDHVID: Tvinger teksten til at være ultra-synlig i appen */
            text-transform: uppercase; 
            letter-spacing: 1.5px; 
            border-bottom: 2px solid rgba(255,255,255,0.08); 
            margin-bottom: 3px; 
            box-sizing: border-box; 
        }

        .table-sc-hdr-left { 
            display: flex; 
            align-items: center; 
            gap: 20px; 
        }

        /* Låser bredden på højre side af headeren til præcis 500px ligesom spillerkortene */
        .table-sc-hdr-right { 
            display: flex; 
            align-items: center; 
            gap: 25px; 
            flex-grow: 1; 
            justify-content: flex-end; 
            max-width: 500px; 
            padding-right: 0px !important; /* Nulstillet for at sikre perfekt symmetri */
            box-sizing: border-box; 
        }

        
        /* 🎯 ULTRA-KOMPAKT KORT: Polstring skåret fra 16px helt ned til 10px vertikalt */
        .table-leaderboard-card { background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; gap: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); position: relative; overflow: hidden; transition: transform 0.15s ease; }
        .table-leaderboard-card:hover { transform: translateX(3px); border-color: rgba(255,255,255,0.08); }
        
        .table-row-left { display: flex; align-items: center; gap: 20px; }
        
        /* 🎯 LIMEGRØN FINISERING: Rank-nummeret følger nu den neongrønne klubfarve live */
        .table-row-rank { font-size: 20px; font-weight: 900; color: var(--accent-purple); width: 35px; text-align: center; text-shadow: 0 0 12px rgba(168,85,247,0.25); }
        
        .table-row-logo-box { width: 40px; height: 44px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 3px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .table-row-crest { width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity 0.25s ease-in-out; }
        .table-row-crest.logo-loaded { opacity: 1 !important; }
        
        .table-row-names { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .table-row-player-name { font-size: 14px; font-weight: 900; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .table-row-subtext { font-size: 10.5px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .table-row-right { display: flex; align-items: center; gap: 25px; flex-grow: 1; justify-content: flex-end; max-width: 500px; box-sizing: border-box; }
        
        /* 🎯 STRØMLINING: Positionen mister sin blå farve og flugter nu 100% med de øvrige meta-tal */
        .table-row-meta-val-pos { font-size: 12.5px !important; font-weight: 700; color: #94a3b8 !important; text-transform: uppercase; width: 50px; text-align: center; }
        .table-row-meta-val-age { font-size: 12.5px !important; font-weight: 700; color: #94a3b8 !important; width: 55px; text-align: center; }
        .table-row-meta-val-mins { font-size: 12.5px !important; font-weight: 700; color: #94a3b8 !important; width: 65px; text-align: center; }

        /* 🎯 LØSNING: BJÆLKE OG TAL INTEGRERET TIL ÉN SAMLET VERTIKAL ENHED */
        .table-row-bar-container { display: flex; flex-direction: column; align-items: center; gap: 5px; width: 140px; }
        .table-row-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; }
        .table-row-bar-fill { height: 100%; background: var(--accent-purple); border-radius: 10px; width: 0%; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        
        /* 🎯 LIMEGRØN FINISERING: Tal-scoren ligger nu over baren, er centreret, og lyser limegrønt */
        .table-row-score-value { font-size: 14px; font-weight: 900; color: var(--accent-purple); width: 100%; text-align: center; text-shadow: 0 0 10px rgba(168,85,247,0.2); line-height: 1; }

        /* Skuffe-layout elementer */
        .table-drawer-group { display: flex; flex-direction: column; gap: 4px; width: 100%; box-sizing: border-box; margin-bottom: 4px; }
        .table-drawer-label { font-size: 10.5px; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .table-drawer-select, .table-drawer-input { background: #07030c; color: #fff; border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 6px; font-size: 12.5px; outline: none; cursor: pointer; width: 100%; box-sizing: border-box; font-family: 'Gabarito', sans-serif; }
        .table-drawer-checkbox-box { background: #07030c; border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 8px; max-height: 115px; overflow-y: auto; }
        .table-drawer-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: var(--text-primary); transition: opacity 0.15s; }
        .table-drawer-input-row { display: flex; align-items: center; gap: 10px; width: 100%; }


        /* 📱 ULTRA-COMPACT MOBILOPTIMERING V3 (DEN ULTIMATIVE COMPRESSION) */
                /* 📱 ULTRA-COMPACT MOBILOPTIMERING V5 (MAX PLADS TIL SPILLERNAVNET) */
                /* 📱 ULTRA-COMPACT MOBILOPTIMERING V6 (THE FINISHED BALANCED LOOK) */
        @media (max-width: 480px) {
            /* Gør mobil-overskrifterne ultra-små så de flugter med det nye tætte layout */
            .table-scouting-header { 
                display: flex !important; 
                padding: 4px 10px !important; 
                font-size: 7px !important; 
                letter-spacing: 0.5px !important;
                margin-bottom: 2px !important;
                border-bottom: 1px solid rgba(255,255,255,0.05) !important;
            }
            .table-sc-hdr-left { gap: 6px !important; }
            .table-sc-hdr-left div:last-child { padding-left: 18px !important; } 
            
            .table-sc-hdr-right { 
                max-width: 100% !important; 
                justify-content: flex-end !important;
                padding-right: 0px !important;
                gap: 0px !important;
            }
            .table-sc-hdr-right div:nth-child(1),
            .table-sc-hdr-right div:nth-child(2),
            .table-sc-hdr-right div:nth-child(3) { display: none !important; } 
            .table-sc-hdr-right div:nth-child(4) { width: 45px !important; text-align: center !important; } /* Justeret til den nye bælkebredde */

            /* Tætpakket ydre container */
            .table-blocks-container { gap: 4px !important; padding: 0 4px !important; }
            
            /* Det super-komprimerede spillerkort */
            .table-leaderboard-card { 
                flex-direction: row !important; 
                flex-wrap: nowrap !important;
                align-items: center !important; 
                justify-content: space-between !important; 
                padding: 5px 8px !important; 
                gap: 6px !important; 
                border-radius: 6px !important; 
            }
            
            /* Venstre felt presses maksimalt sammen */
            .table-row-left { gap: 6px !important; flex-grow: 1 !important; min-width: 0 !important; }
            
            /* Rank og mini-logo */
            .table-row-rank { font-size: 11px !important; width: 16px !important; text-shadow: none !important; font-weight: 800 !important; }
            .table-row-logo-box { width: 20px !important; height: 20px !important; border-radius: 4px !important; padding: 1px !important; }
            
            /* Navne-beholderen */
            .table-row-names { gap: 0px !important; min-width: 0 !important; flex-grow: 1 !important; }
            
            /* 🎯 EKSTRA KRYMPET NAVN: Skruet ned til 8.5px, så det harmonerer perfekt og har maksimal plads */
            .table-row-player-name { 
                font-size: 7.5px !important; 
                letter-spacing: -0.2px !important;
                white-space: nowrap !important;
                overflow: visible !important; 
                text-overflow: clip !important;
            }
            
            /* 🎯 EKSTRA KRYMPET INFO: Infolinjen gøres super fin og diskret (6.5px) under navnet */
            .table-row-subtext { 
                font-size: 6px !important; 
                letter-spacing: -0.1px !important; 
                color: #475569 !important; 
            }
            
            /* Højre side (Bjælken) presses helt ud mod kanten */
            .table-row-right { 
                width: auto !important; 
                max-width: none !important; 
                justify-content: flex-end !important; 
                padding-left: 0px !important; 
                gap: 0px !important; 
                flex-shrink: 0 !important; 
            }
            .table-row-right .table-row-meta-val-pos,
            .table-row-right .table-row-meta-val-age,
            .table-row-right .table-row-meta-val-mins { display: none !important; } 
            
            /* 🎯 SKÅRET REELT IND: Sat ned fra 55px til kun 45px for minimal og elegant fylde på mobilen */
            .table-row-bar-container { 
                display: flex !important; 
                width: 45px !important; 
                gap: 1px !important;
                margin-left: 0px !important;
                flex-shrink: 0 !important;
            }
            .table-row-bar-bg { height: 2px !important; }
            
            /* Score-tallet tilpasses den nye micro-bjælke */
            .table-row-score-value { font-size: 9px !important; width: 100% !important; text-shadow: none !important; font-weight: 800 !important; }

            .tb-pc-meta-only { display: none !important; }
            .tb-mobile-meta-only { display: inline !important; }
        }

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
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Table</span>
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
                <label class="table-drawer-label">Metric</label>
                <select id="tb-opt-metric" class="table-drawer-select" onchange="handleTableConfigChange()">
                    ${metricOptions}
                </select>
            </div>

            <div class="table-drawer-group">
                <label class="table-drawer-label">Stat Type</label>
                <select id="tb-opt-stat-type" class="table-drawer-select" onchange="handleTableConfigChange()">
                    <option value="Per 90" ${TABLE_STAT_TYPE === "Per 90" ? "selected" : ""}>Per 90</option>
                    <option value="Total" ${TABLE_STAT_TYPE === "Total" ? "selected" : ""}>Total</option>
                </select>
            </div>
            
            <div class="table-drawer-group"><label class="table-drawer-label">Leagues</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(leagues, 'leagues')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Nationalities</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(nationalities, 'nationalities')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Positions</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(positions, 'positions')}</div></div>

            <div class="table-drawer-group">
                <label class="table-drawer-label">Age (Min / Max)</label>
                <div class="table-drawer-input-row">
                    <input type="number" id="tb-filt-min-age" class="table-drawer-input" value="${TABLE_FILTERS.minAge}" oninput="handleTableFilterInputChange()">
                    <input type="number" id="tb-filt-max-age" class="table-drawer-input" value="${TABLE_FILTERS.maxAge}" oninput="handleTableFilterInputChange()">
                </div>
            </div>
            <div class="table-drawer-group">
                <label class="table-drawer-label">Minutes (Min / Max)</label>
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

        // ==========================================================================
    // PER 90 - TABLE.JS - RETTET DEL 4 AF 4 (SAMMENSMELTET PERFORMANCE OG TAL)
    // ==========================================================================
        // ==========================================================================
    // PER 90 - TABLE.JS - RETTET DEL 4 AF 4 (PERFEKT LINIERET KRIDHVID HEADER)
    // ==========================================================================
    const highestScore = top10.length > 0 ? (top10[0].metrics[TABLE_SELECTED_METRIC] || 1) : 1;

    // 🎯 LØSNING: Overskrifterne har nu præcis samme bredder og text-align som selve data-kortene!
    let markup = `
        <div class="table-scouting-header">
            <div class="table-sc-hdr-left">
                <div style="width:35px; text-align:center;">Rank</div>
                <div style="padding-left:64px;">Player</div>
            </div>
            <div class="table-sc-hdr-right">
                <div style="width:50px; text-align:center;">Pos.</div>
                <div style="width:55px; text-align:center;">Age</div>
                <div style="width:65px; text-align:center;">Min.</div>
                <!-- Viser nu udelukkende det rene metric navn (f.eks. GOALS) centreret over bjælkeenheden -->
                <div style="width:140px; text-align:center;">${TABLE_SELECTED_METRIC}</div>
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
                    <div class="table-row-meta-val-age">${p.age}</div>
                    <div class="table-row-meta-val-mins">${p.mins_played}</div>
                    
                    <!-- 🎯 SAMMENSMELTET ENHED: Talværdien er nu rykket ind i samme container og centreret over baren -->
                    <div class="table-row-bar-container">
                        <div class="table-row-score-value">${val.toFixed(2)}</div>
                        <div class="table-row-bar-bg">
                            <div class="table-row-bar-fill" style="width: ${barWidthPct}%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = markup;


    // Asynkron hentning af base64-logoer 1:1 fra pizza-logikken
        // ==========================================================================
    // AKTUEL OPTIMERING: GLIDENDE FADE-IN OG AUTOMATISK OPRYDNING AF TOMME BOKSE
    // ==========================================================================
    top10.forEach(async (p, idx) => {
        const imgId = `tb-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;
        const imgEl = document.getElementById(imgId);
        if (!imgEl) return;

        const containerBox = imgEl.parentElement;

        // Hvis holdet mangler et gyldigt ID, skjuler vi boksen med det samme i stedet for at vise en tom ramme
        if (!p.team_id || p.team_id === "nan" || p.team_id === "None") {
            if (containerBox) containerBox.style.display = "none";
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/logo/${p.team_id}`).then(r => r.json());
            if (res.logo_base64) {
                // Sørg for at tilføje klassen, når billedet reelt er færdig med at loade i DOM'en
                imgEl.onload = () => {
                    imgEl.classList.add('logo-loaded');
                };
                imgEl.src = res.logo_base64;
            } else {
                // Hvis API'et ikke returnerer et gyldigt base64-billede, rydder vi rammen op
                if (containerBox) containerBox.style.display = "none";
            }
        } catch (e) { 
            console.warn(`Kunne ikke hente logo for hold ID: ${p.team_id}`, e);
            if (containerBox) containerBox.style.display = "none";
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
