// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 1 AF 8 (MASTER CONFIG & STATISKE PARAMETRE)
// ==========================================================================

let SIM_GLOBAL_DATA = null;
let SIM_TARGET_PLAYER = "";

// Strømlinet filter-tilstand til din tjekboks-skuffe
let SIM_FILTERS = {
    leagues: [],
    positions: [],
    minAge: 0,
    maxAge: 100,
    minMins: 0,
    maxMins: 99999
};

// 🎯 ISOLERET SELEKTOR-FUNKTION: Forhindrer 'already been declared' fejl permanent!
const getSimEl = id => document.getElementById(id);
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 2 AF 8 (RUNTIME DESIGN & GLOBALT TABEL-SETUP)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('sim-core-styles')) return; 
    const style = document.createElement('style');
    style.id = 'sim-core-styles';
    style.innerHTML = `
        .sim-blocks-container { width: 100%; max-width: 950px; margin: 0 auto; padding: 0 10px; box-sizing: border-box; }
        
        /* 🌐 DET GLOBALE TABEL-SETUP: Slår browserens elastiske cellestørrelser fra, så det står ens på iPad og PC */
        .sim-scouting-table {
            width: 100% !important;
            border-collapse: separate !important;
            border-spacing: 0 8px !important; /* Laver luft mellem rækkerne, så det ligner kort */
            font-family: 'Gabarito', sans-serif;
            table-layout: fixed !important;
        }

        /* 🎯 APPSYNKRONISERING: Kridhhvide og ultra-synlige kolonneoverskrifter */
        .sim-scouting-table thead tr {
            font-size: 10.5px;
            font-weight: 900;
            color: #ffffff !important;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }

        .sim-scouting-table th {
            padding: 12px 20px !important;
            border-bottom: 2px solid rgba(255,255,255,0.08);
            box-sizing: border-box !important;
            line-height: 14px !important;
            height: 38px !important;
            margin: 0 !important;
        }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 3 AF 8 (KORT-STYLING & LÅSTE HOVER-EFFEKTER)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        /* DET FLOTTE, MØRKE DIAGRAM-KORT (Bygget direkte på <td>-rækken med hård master-højde) */
        .sim-scouting-table tbody tr {
            background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important;
            box-shadow: 0 15px 35px rgba(0,0,0,0.5);
            transition: transform 0.15s ease;
            height: 64px !important;
            max-height: 64px !important;
        }
        .sim-scouting-table tbody tr:hover { 
            transform: translateX(3px) !important; 
        }
        .sim-scouting-table tbody tr:hover td {
            border-color: transparent !important;
            border-left: none !important;
            border-right: none !important;
        }

        .sim-scouting-table tbody td {
            padding: 0 20px !important;
            border-top: 1px solid rgba(255,255,255,0.04);
            border-bottom: 1px solid rgba(255,255,255,0.04);
            box-sizing: border-box;
            vertical-align: middle !important;
            height: 64px !important;
            max-height: 64px !important;
        }

        /* Afrunder hjørnerne på hvert enkelt "kort-række" */
        .sim-scouting-table tbody td:first-child { border-left: 1px solid rgba(255,255,255,0.04); border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        .sim-scouting-table tbody td:last-child { border-right: 1px solid rgba(255,255,255,0.04); border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 4 AF 8 (FASTE BREDDE-KANALER & DATA-TEKST CSS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🎯 FASTE BREDDE-KANALER: Slavelåser overskrifter og datakort i de præcis samme urokkelige rammer på iPad */
        .sim-col-rank { width: 75px !important; min-width: 75px !important; max-width: 75px !important; text-align: center !important; }
        .sim-col-logo { width: 80px !important; min-width: 80px !important; max-width: 80px !important; text-align: center !important; }
        .sim-col-player { text-align: left !important; }
        .sim-col-pos { width: 75px !important; min-width: 75px !important; max-width: 75px !important; text-align: center !important; }
        .sim-col-age { width: 80px !important; min-width: 80px !important; max-width: 80px !important; text-align: center !important; }
        .sim-col-min { width: 90px !important; min-width: 90px !important; max-width: 90px !important; text-align: center !important; }
        .sim-col-metric { width: 180px !important; min-width: 180px !important; max-width: 180px !important; text-align: center !important; }

        /* Datakomponent-formatering baseret på de nye taljusteringer */
        .sim-row-rank { font-size: 16px !important; font-weight: 800; color: var(--accent-purple); text-shadow: 0 0 12px rgba(168,85,247,0.25); line-height: 64px !important; height: 64px !important; display: block !important; }
        .sim-row-meta-val { font-size: 13px !important; font-weight: 900; color: #94a3b8 !important; line-height: 64px !important; }

        .sim-row-logo-box { width: 40px; height: 44px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 3px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-sizing: border-box; }
        .sim-row-crest { width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity 0.25s ease-in-out; }
        .sim-row-crest.logo-loaded { opacity: 1 !important; }
        
        .sim-row-names { display: block !important; width: 100%; text-align: left; }
        .sim-row-player-name { font-size: 14px; font-weight: 900; color: #fff; margin: 0 !important; padding: 0 !important; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 16px !important; height: 16px !important; display: block !important; }
        .sim-row-subtext { font-size: 10.5px; color: #64748b; font-weight: 600; margin: 4px 0 0 0 !important; padding: 0 !important; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 12px !important; height: 12px !important; display: block !important; }
        
        .sim-row-bar-container { display: block !important; width: 100%; text-align: center; }
        .sim-row-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; margin: 6px auto 0 auto !important; }
        .sim-row-bar-fill { height: 100%; background: var(--accent-purple); border-radius: 10px; width: 0%; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .sim-row-score-value { font-size: 14px; font-weight: 900; color: var(--accent-purple); margin: 0 !important; padding: 0 !important; width: 100%; text-shadow: 0 0 10px rgba(168,85,247,0.2); line-height: 16px !important; height: 16px !important; display: block !important; }

        .sim-custom-option-item { padding: 10px 14px; color: #f3f1f6; cursor: pointer; font-size: 14px; transition: all 0.15s ease; font-family: Gabarito, sans-serif; }
        .sim-custom-option-item:hover { background-color: rgba(168, 85, 247, 0.25) !important; color: #ffffff !important; padding-left: 18px; }
        .sim-custom-option-item.selected-active { background-color: var(--accent-purple) !important; color: #ffffff !important; }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 5 AF 8 (ULTRA-COMPACT MOBIL SENSOR-CSS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        /* 📱 ULTRA-COMPACT MOBILOPTIMERING V6 */
        @media (max-width: 480px) {
            .sim-scouting-table th { padding: 6px 6px !important; }
            .sim-scouting-table tbody td { padding: 0 6px !important; height: 48px !important; max-height: 48px !important; }
            .sim-scouting-table tbody tr { height: 48px !important; max-height: 48px !important; }
            
            .sim-col-pos, .sim-col-age, .sim-col-min { display: none !important; }
            .sim-col-rank { width: 40px !important; min-width: 40px !important; max-width: 40px !important; }
            .sim-col-logo { width: 45px !important; min-width: 45px !important; max-width: 45px !important; }
            .sim-col-metric { width: 85px !important; min-width: 85px !important; max-width: 85px !important; }
            
            .sim-row-rank { font-size: 11px !important; line-height: 48px !important; height: 48px !important; text-shadow: none !important; }
            .sim-row-logo-box { width: 26px !important; height: 30px !important; padding: 2px !important; border-radius: 5px !important; }
            .sim-row-player-name { font-size: 10px !important; }
            .sim-row-subtext { font-size: 8px !important; margin-top: 1px !important; }
            .sim-row-score-value { font-size: 10px !important; }
            
            /* Aktiverer mobil-metateksten under navnet på små skærme */
            .sim-mobile-meta-span { display: block !important; font-size: 7.5px !important; color: #475569 !important; text-transform: uppercase; margin-top: 2px; }
            .sim-pc-meta-span { display: none !important; }
        }
        
        @media (min-width: 481px) {
            .sim-mobile-meta-span { display: none !important; }
        }
    `;
    document.head.appendChild(style);

    document.addEventListener("click", e => {
        if (!e.target.closest('#sim-custom-player-wrapper')) {
            const p = getSimEl("sim-custom-player-options"); if (p) p.style.display = "none";
        }
    });
});
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 6 AF 8 (HTML INITIALISERING & BOOTSTRAP LOGIK)
// ==========================================================================

async function initSimilarityView(container) {
    container.innerHTML = `
        <section id="view-similarity" class="content-view active" style="padding-top: 10px;">
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-people-arrows" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Player Similarity</span>
            </div>

            <div class="control-trigger-wrapper" style="margin-bottom: 25px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Similarity Engine <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            
            <div class="sim-blocks-container" id="sim-capture-target-area" style="padding: 15px 5px; width: 100%; box-sizing: border-box;">
                <div id="sim-initial-spinner" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; gap: 12px; color: #94a3b8; font-family: 'Gabarito', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; width: 100%;">
                    <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 40px; color: var(--accent-purple); height: 40px; width: 40px; display: flex; align-items: center; justify-content: center;"></i>
                    <span>Loading...</span>
                </div>
            </div>
        </section>
    `;
    
    if (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) {
        SIM_TARGET_PLAYER = CURRENT_SELECTED_PLAYER;
    }
    await bootstrapSimilarityFilters();
}

let SIM_CACHED_PLAYER_ITEMS = null;
let SIM_SEARCH_DEBOUNCE_TIMER = null;
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 7 AF 8 (CACHET SØGNING & SKUFFE UI BUILDER)
// ==========================================================================

function filterSimPlayerList() {
    clearTimeout(SIM_SEARCH_DEBOUNCE_TIMER);
    SIM_SEARCH_DEBOUNCE_TIMER = setTimeout(() => {
        const filter = getSimEl("sim-player-search-input")?.value.toLowerCase();
        if (filter === undefined) return;
        
        if (!SIM_CACHED_PLAYER_ITEMS) {
            SIM_CACHED_PLAYER_ITEMS = document.querySelectorAll("#sim-custom-player-items-container .sim-custom-option-item");
        }
        
        let matchesFound = 0;
        for (let i = 0; i < SIM_CACHED_PLAYER_ITEMS.length; i++) {
            const item = SIM_CACHED_PLAYER_ITEMS[i];
            if (filter === "") {
                item.style.display = i < 30 ? "block" : "none";
            } else {
                if (item.innerText.toLowerCase().includes(filter) && matchesFound < 30) {
                    item.style.display = "block";
                    matchesFound++;
                } else {
                    item.style.display = "none";
                }
            }
        }
    }, 150);
}

function resetSimPlayerSearch() {
    if (getSimEl("sim-player-search-input")) { 
        getSimEl("sim-player-search-input").value = ""; 
        SIM_CACHED_PLAYER_ITEMS = document.querySelectorAll("#sim-custom-player-items-container .sim-custom-option-item");
        for (let i = 0; i < SIM_CACHED_PLAYER_ITEMS.length; i++) {
            SIM_CACHED_PLAYER_ITEMS[i].style.display = i < 30 ? "block" : "none";
        }
    }
}

function toggleSimPlayerDropdown() {
    const pOpt = getSimEl("sim-custom-player-options"); if (!pOpt) return;
    const isOpening = pOpt.style.display === "none" || pOpt.style.display === "";
    pOpt.style.display = isOpening ? "block" : "none"; 
    if (isOpening) { resetSimPlayerSearch(); setTimeout(() => getSimEl("sim-player-search-input")?.focus(), 50); }
}

function buildAndAppendSimilarityDrawerHTML(playerList = []) {
    document.querySelectorAll('.table-filter-drawer, .similarity-filter-drawer').forEach(d => d.remove());

    let sourceList = playerList;
    if (!sourceList || sourceList.length === 0) {
        if (SIM_GLOBAL_DATA && SIM_GLOBAL_DATA.similar_players) sourceList = SIM_GLOBAL_DATA.similar_players;
        else if (window.GLOBAL_DATASET_CACHE) sourceList = window.GLOBAL_DATASET_CACHE;
    }

    const allPlayerNames = [...new Set(sourceList.map(p => p.player_name || p['Player Name']).filter(Boolean).sort())];
    const leagues = [...new Set(sourceList.map(p => p.league || p.League).filter(Boolean).sort())];
    const positions = [...new Set(sourceList.map(p => p.position || p['Pos.'] || p.Position).filter(Boolean).sort())];

    const generateCheckboxesHTML = (items, key) => {
        return items.map(item => {
            const checked = SIM_FILTERS[key].includes(item);
            return `<label class="table-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${item}" ${checked ? "checked" : ""} onchange="handleSimCheckboxToggle(this, '${key}')" style="accent-color: var(--accent-purple);"> ${item}</label>`;
        }).join('');
    };

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer stats-filter-drawer table-filter-drawer similarity-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Similarity Settings</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-height: 85vh; overflow-y: auto;">
            <div class="table-drawer-group" style="position: relative;">
                <label class="table-drawer-label">Reference Player</label>
                <div class="custom-select-wrapper" id="sim-custom-player-wrapper" style="position: relative; width: 100%;">
                    <div class="custom-select-trigger" onclick="toggleSimPlayerDropdown()" style="background: rgba(20, 13, 33, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="sim-custom-player-selected-text">${SIM_TARGET_PLAYER || 'Vælg spiller...'}</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: #64748b;"></i>
                    </div>
                    <div class="custom-options-list" id="sim-custom-player-options" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--accent-purple); border-radius: 6px; max-height: 250px; overflow-y: auto; z-index: 120;">
                        <div style="position: sticky; top: 0; background: #07030c; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); z-index: 130;"><input type="text" id="sim-player-search-input" oninput="filterSimPlayerList()" placeholder="Search..." style="width: 100%; background: rgba(20, 13, 33, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.08); padding: 8px 10px; border-radius: 4px; font-size: 13px; outline: none;" onclick="event.stopPropagation();"></div>
                        <div id="sim-custom-player-items-container">${allPlayerNames.map(p => `<div class="sim-custom-option-item ${p === SIM_TARGET_PLAYER ? 'selected-active' : ''}" onclick="selectSimPlayerItem('${p.replace(/'/g, "\\\\'")}')">${p}</div>`).join('')}</div>
                    </div>
                </div>
            </div>
            <div class="table-drawer-group"><label class="table-drawer-label">Leagues</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(leagues, 'leagues')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Positions</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(positions, 'positions')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Age (Min / Max)</label><div class="table-drawer-input-row"><input type="number" id="sim-filt-min-age" class="table-drawer-input" value="${SIM_FILTERS.minAge}" oninput="handleSimFilterInputChange()"><input type="number" id="sim-filt-max-age" class="table-drawer-input" value="${SIM_FILTERS.maxAge}" oninput="handleSimFilterInputChange()"></div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Minutes (Min / Max)</label><div class="table-drawer-input-row"><input type="number" id="sim-filt-min-mins" class="table-drawer-input" value="${SIM_FILTERS.minMins}" oninput="handleSimFilterInputChange()"><input type="number" id="sim-filt-max-mins" class="table-drawer-input" value="${SIM_FILTERS.maxMins}" oninput="handleSimFilterInputChange()"></div></div>
        </div>`;
    document.body.appendChild(drawerDiv);
}
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 8 AF 8 (API DATAMOTOR & MATRIX ENGINE)
// ==========================================================================

async function bootstrapSimilarityFilters() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/table-data?stat_type=Per 90`);
        if (res.ok) {
            const dataData = await res.json();
            if (dataData && dataData.players) {
                window.GLOBAL_DATASET_CACHE = dataData.players;
                if (!SIM_TARGET_PLAYER && dataData.players.length > 0) {
                    SIM_TARGET_PLAYER = dataData.players[0].player_name || dataData.players[0]['Player Name'];
                    if (typeof CURRENT_SELECTED_PLAYER !== 'undefined') CURRENT_SELECTED_PLAYER = SIM_TARGET_PLAYER;
                }
                buildAndAppendSimilarityDrawerHTML(dataData.players);
                if (SIM_TARGET_PLAYER) await loadSimilarityAPIDataFeed();
                return;
            }
        }
    } catch (e) { console.error("Fejl under bootstrap af similarity filtre:", e); }
    buildAndAppendSimilarityDrawerHTML([]);
}

async function loadSimilarityAPIDataFeed() {
    if (!SIM_TARGET_PLAYER) return;
    try {
        const officialMetrics = [
            "Goals", "npxG", "Shots On Target", "On Target %",
            "Assists", "xA", "Key Passes", "Pass Accuracy %", "Long Ball Accuracy %", "Cross Accuracy %",
            "Successful Dribbles", "Dribble Attempts", "Dribble Success %",
            "Tackles Won %", "Aerials Won %", "Duels Won %"
        ];
        
        let metricsParams = officialMetrics.map(m => `selected_metrics=${encodeURIComponent(m)}`).join('&');
        const url = `${API_BASE_URL}/api/similarity-search?target_player=${encodeURIComponent(SIM_TARGET_PLAYER)}&${metricsParams}`;

        const res = await fetch(url);
        if (res.ok) {
            SIM_GLOBAL_DATA = await res.json();
            const list = SIM_GLOBAL_DATA.similar_players;

            if (list.length > 0 && SIM_FILTERS.minMins === 0 && SIM_FILTERS.maxMins === 99999) {
                const ages = list.map(p => p.age).filter(a => a > 0);
                const mins = list.map(p => p.mins_played).filter(m => m > 0);
                if (ages.length > 0) { SIM_FILTERS.minAge = Math.min(...ages); SIM_FILTERS.maxAge = Math.max(...ages); }
                if (mins.length > 0) { SIM_FILTERS.minMins = Math.min(...mins); SIM_FILTERS.maxMins = Math.max(...mins); }
            }

            const cachedList = window.GLOBAL_DATASET_CACHE || list;
            buildAndAppendSimilarityDrawerHTML(cachedList);
            buildSimilarityLeaderboardEngine();
        }
    } catch (e) { console.error("Similarity API fejl:", e); }
}

async function selectSimPlayerItem(value) {
    SIM_TARGET_PLAYER = value;
    if (typeof CURRENT_SELECTED_PLAYER !== 'undefined') CURRENT_SELECTED_PLAYER = SIM_TARGET_PLAYER;
    const triggerText = getSimEl("sim-custom-player-selected-text"); if (triggerText) triggerText.innerText = value;
    const optEl = getSimEl("sim-custom-player-options"); if (optEl) optEl.style.display = "none";
    
    document.querySelectorAll('#sim-custom-player-options .sim-custom-option-item').forEach(el => {
        el.classList.toggle('selected-active', el.innerText === value);
    });
    await loadSimilarityAPIDataFeed();
}

function handleSimFilterInputChange() {
    if (!getSimEl("sim-filt-min-age")) return;
    SIM_FILTERS.minAge = parseInt(getSimEl("sim-filt-min-age").value) || 0;
    SIM_FILTERS.maxAge = parseInt(getSimEl("sim-filt-max-age").value) || 100;
    SIM_FILTERS.minMins = parseInt(getSimEl("sim-filt-min-mins").value) || 0;
    SIM_FILTERS.maxMins = parseInt(getSimEl("sim-filt-max-mins").value) || 99999;
    buildSimilarityLeaderboardEngine();
}

function handleSimCheckboxToggle(cb, key) {
    const val = cb.value;
    if (cb.checked) {
        if (!SIM_FILTERS[key].includes(val)) SIM_FILTERS[key].push(val);
    } else {
        SIM_FILTERS[key] = SIM_FILTERS[key].filter(v => v !== val);
    }
    cb.parentElement.style.opacity = cb.checked ? '1' : '0.4';
    buildSimilarityLeaderboardEngine();
}

function buildSimilarityLeaderboardEngine() {
    const container = getSimEl("sim-capture-target-area"); if (!container || !SIM_GLOBAL_DATA) return;
    container.innerHTML = "";

    const filtered = SIM_GLOBAL_DATA.similar_players.filter(p => {
        if (SIM_FILTERS.leagues.length > 0 && !SIM_FILTERS.leagues.includes(p.league)) return false;
        if (SIM_FILTERS.positions.length > 0 && !SIM_FILTERS.positions.includes(p.position)) return false;
        if (p.age < SIM_FILTERS.minAge || p.age > SIM_FILTERS.maxAge) return false;
        if (p.mins_played < SIM_FILTERS.minMins || p.mins_played > SIM_FILTERS.maxMins) return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#64748b; font-weight:700;">INGEN MATCHENDE SPILLERE FUNDET</div>`;
        return;
    }

    const top10 = filtered.sort((a, b) => b.similarity_score - a.similarity_score).slice(0, 10);

    let markup = `
        <table class="sim-scouting-table">
            <thead>
                <tr>
                    <th class="sim-col-rank">Rank</th>
                    <th class="sim-col-logo"></th>
                    <th class="sim-col-player">Player</th>
                    <th class="sim-col-pos text-center">Pos.</th>
                    <th class="sim-col-age text-center">Age</th>
                    <th class="sim-col-min text-center">Min.</th>
                    <th class="sim-col-metric text-center">Similarity</th>
                </tr>
            </thead>
            <tbody>
    `;

    markup += top10.map((p, idx) => {
        const score = p.similarity_score;
        const imgId = `sim-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;

        return `
                <tr>
                    <td class="sim-col-rank sim-row-rank">#${idx + 1}</td>
                    <td class="sim-col-logo">
                        <div class="sim-row-logo-box">
                            <img id="${imgId}" class="sim-row-crest" src="data:image/svg+xml;utf8,<svg xmlns=%22http://w3.org width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23475569%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>'" />
                        </div>
                    </td>
                    <td class="sim-col-player">
                        <div class="sim-row-names">
                            <div class="sim-row-player-name">${p.player_name}</div>
                            <div class="sim-row-subtext">
                                <span class="sim-pc-meta-span">${p.team} | ${p.league}</span>
                                <span class="sim-mobile-meta-span" style="display: none;">${p.position} • ${p.age} år • ${p.mins_played}m</span>
                            </div>
                        </div>
                    </td>
                    <td class="sim-col-pos text-center sim-row-meta-val">${p.position}</td>
                    <td class="sim-col-age text-center sim-row-meta-val">${p.age} År</td>
                    <td class="sim-col-min text-center sim-row-meta-val">${p.mins_played}m</td>
                    <td class="sim-col-metric">
                        <div class="sim-row-bar-container">
                            <div class="sim-row-score-value">${score.toFixed(1)}%</div>
                            <div class="sim-row-bar-bg">
                                <div class="sim-row-bar-fill" style="width: ${score}%;"></div>
                            </div>
                        </div>
                    </td>
                </tr>
        `;
    }).join('');

    markup += `
            </tbody>
        </table>
        <table style="width:100%; border-collapse:collapse; margin-top:15px; font-family:'Gabarito',sans-serif; text-align:center;">
            <tr style="opacity:0.45;"><td style="font-size:11px; color:#e5e7eb; letter-spacing:0.4px; padding:2px 0;">Generated via per-90.streamlit.app</td></tr>
        </table>
    `;

    container.innerHTML = markup;

    top10.forEach(async (p, idx) => {
        const imgId = `sim-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;
        const imgEl = document.getElementById(imgId); if (!imgEl) return;
        const containerBox = imgEl.parentElement;

        if (!p.team_id || p.team_id === "nan" || p.team_id === "None") {
            if (containerBox) containerBox.style.display = "none"; return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/logo/${p.team_id}`).then(r => r.json());
            if (res.logo_base64) {
                imgEl.onload = () => { imgEl.classList.add('logo-loaded'); };
                imgEl.src = res.logo_base64;
            } else {
                if (containerBox) containerBox.style.display = "none";
            }
        } catch (e) {
            if (containerBox) containerBox.style.display = "none";
        }
    });
}
