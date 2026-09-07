// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 1 AF 5 (MASTER STATES & SELEKTOR-LOGIK)
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
// PER 90 - SIMILARITY.JS - DEL 2 AF 5 (ROBUST SPLIT-CARD CSS MED RESPONSIV LOGIK)
// ==========================================================================

// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 2 AF 5 (STRØMLINET PC & MINI MOBIL CSS)
// ==========================================================================

// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 2 AF 5 (STRØMLINET PC & MINI MOBIL CSS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('sim-core-styles')) return; 
    const style = document.createElement('style');
    style.id = 'sim-core-styles';
    style.innerHTML = `
        .sim-blocks-container { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 950px; margin: 0 auto; padding: 0 10px; box-sizing: border-box; }
        
        /* 🎯 APPSYNKRONISERING: Kridhvide og ultra-synlige kolonneoverskrifter på pc */
        .sim-scouting-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 20px; font-family: 'Gabarito', sans-serif; font-size: 10.5px; font-weight: 900; color: #ffffff !important; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid rgba(255,255,255,0.08); margin-bottom: 3px; box-sizing: border-box; }
        .sim-sc-hdr-left { display: flex; align-items: center; gap: 20px; }
        .sim-sc-hdr-right { display: flex; align-items: center; gap: 25px; flex-grow: 1; justify-content: flex-end; max-width: 500px; padding-right: 0px !important; box-sizing: border-box; }
        
        /* 🎯 ULTRA-KOMPAKT KORT: Polstring skåret fra 16px helt ned til 10px vertikalt på pc */
        .sim-leaderboard-card { background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; padding: 10px 20px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; gap: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); position: relative; overflow: hidden; transition: transform 0.15s ease; }
        .sim-leaderboard-card:hover { transform: translateX(3px); border-color: rgba(255,255,255,0.08); }
        
        .sim-row-left { display: flex; align-items: center; gap: 20px; }
        
        /* 🎯 LIMEGRØN FINISERING: Rank følger jeres neongrønne klubfarve live */
        .sim-row-rank { font-size: 20px; font-weight: 900; color: var(--accent-purple); width: 35px; text-align: center; text-shadow: 0 0 12px rgba(168,85,247,0.25); }
        
        .sim-row-logo-box { width: 40px; height: 44px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 3px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sim-row-crest { width: 100%; height: 100%; object-fit: contain; opacity: 0; transition: opacity 0.25s ease-in-out; }
        .sim-row-crest.logo-loaded { opacity: 1 !important; }
        
        .sim-row-names { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .sim-row-player-name { font-size: 14px; font-weight: 900; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sim-row-subtext { font-size: 10.5px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .sim-row-right { display: flex; align-items: center; gap: 25px; flex-grow: 1; justify-content: flex-end; max-width: 500px; box-sizing: border-box; }
        
        /* 🎯 STRØMLINING: Positionen mister sin blå farve og følger den dæmpede scout-hvid */
        .sim-row-meta-val-pos { font-size: 12.5px !important; font-weight: 700; color: #94a3b8 !important; text-transform: uppercase; width: 50px; text-align: center; }
        .sim-row-meta-val-age { font-size: 12.5px !important; font-weight: 700; color: #94a3b8 !important; width: 55px; text-align: center; }
        .sim-row-meta-val-mins { font-size: 12.5px !important; font-weight: 700; color: #94a3b8 !important; width: 65px; text-align: center; }

        /* 🎯 LEADERBOARD MATCH BJÆLKE INTEGRATION: Sammensmeltet til én vertikal enhed */
        .sim-row-bar-container { display: flex; flex-direction: column; align-items: center; gap: 5px; width: 140px; }
        .sim-row-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; }
        .sim-row-bar-fill { height: 100%; background: var(--accent-purple); border-radius: 10px; width: 0%; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        .sim-row-score-value { font-size: 14px; font-weight: 900; color: var(--accent-purple); width: 100%; text-align: center; text-shadow: 0 0 10px rgba(168,85,247,0.2); line-height: 1; }

        /* Styles til den nye avancerede dropdown */
        .sim-custom-option-item { padding: 10px 14px; color: #f3f1f6; cursor: pointer; font-size: 14px; transition: all 0.15s ease; font-family: Gabarito, sans-serif; }
        .sim-custom-option-item:hover { background-color: rgba(168, 85, 247, 0.25) !important; color: #ffffff !important; padding-left: 18px; }
        .sim-custom-option-item.selected-active { background-color: var(--accent-purple) !important; color: #ffffff !important; }

        /* 📱 ULTRA-COMPACT MOBILOPTIMERING V6 (THE FINISHED BALANCED LOOK) */
        @media (max-width: 480px) {
            .sim-scouting-header { display: flex !important; padding: 4px 10px !important; font-size: 7px !important; letter-spacing: 0.5px !important; margin-bottom: 2px !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
            .sim-sc-hdr-left { gap: 6px !important; }
            .sim-sc-hdr-left div:last-child { padding-left: 18px !important; } 
            
            .sim-sc-hdr-right { max-width: 100% !important; justify-content: flex-end !important; padding-right: 0px !important; gap: 0px !important; }
            .sim-sc-hdr-right div:nth-child(1), .sim-sc-hdr-right div:nth-child(2), .sim-sc-hdr-right div:nth-child(3) { display: none !important; } 
            .sim-sc-hdr-right div:nth-child(4) { width: 45px !important; text-align: center !important; } 
            .sim-sc-hdr-right div:nth-child(5) { display: none !important; }

            .sim-blocks-container { gap: 4px !important; padding: 0 4px !important; }
            .sim-leaderboard-card { flex-direction: row !important; flex-wrap: nowrap !important; align-items: center !important; justify-content: space-between !important; padding: 5px 8px !important; gap: 6px !important; border-radius: 6px !important; }
            .sim-row-left { gap: 6px !important; flex-grow: 1 !important; min-width: 0 !important; }
            
            .sim-row-rank { font-size: 11px !important; width: 16px !important; text-shadow: none !important; font-weight: 800 !important; }
            .sim-row-logo-box { width: 20px !important; height: 20px !important; border-radius: 4px !important; padding: 1px !important; }
            .sim-row-names { gap: 0px !important; min-width: 0 !important; flex-grow: 1 !important; }
            
            .sim-row-player-name { font-size: 8.5px !important; letter-spacing: -0.2px !important; white-space: nowrap !important; overflow: visible !important; text-overflow: clip !important; }
            .sim-row-subtext { font-size: 6.5px !important; letter-spacing: -0.1px !important; color: #475569 !important; }
            
            .sim-row-right { width: auto !important; max-width: none !important; justify-content: flex-end !important; padding-left: 0px !important; gap: 0px !important; flex-shrink: 0 !important; }
            .sim-row-right .sim-row-meta-val-pos, .sim-row-right .sim-row-meta-val-age, .sim-row-right .sim-row-meta-val-mins { display: none !important; } 
            
            .sim-row-bar-container { display: flex !important; width: 45px !important; gap: 1px !important; margin-left: 0px !important; flex-shrink: 0 !important; }
            .sim-row-bar-bg { height: 2px !important; }
            .sim-row-score-value { font-size: 9px !important; width: 100% !important; text-shadow: none !important; font-weight: 800 !important; }

            .sim-pc-meta-only { display: none !important; }
            .sim-mobile-meta-only { display: inline !important; }
        }
    `;
    document.head.appendChild(style);

    // Global klik-lytter til lukning af dropdown
    document.addEventListener("click", e => {
        if (!e.target.closest('#sim-custom-player-wrapper')) {
            const p = getSimEl("sim-custom-player-options");
            if (p) p.style.display = "none";
        }
    });
});



// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 3 AF 5 (LAYOUT & DYNAMISK SKUFFE-HTML)
// ==========================================================================

// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 3 AF 5 (LAYOUT & NEW STATIONARY SPINNER)
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
                <!-- 🎯 NY STATIONÆR INITIAL LOADER SPINNER -->
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

// 🎯 GLOBAL CACHE & TIMERS TIL SIMILARITY SPILLERSØGNING
let SIM_CACHED_PLAYER_ITEMS = null;
let SIM_SEARCH_DEBOUNCE_TIMER = null;

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
    const pOpt = getSimEl("sim-custom-player-options");
    if (!pOpt) return;
    const isOpening = pOpt.style.display === "none" || pOpt.style.display === "";
    pOpt.style.display = isOpening ? "block" : "none"; 
    if (isOpening) { 
        resetSimPlayerSearch(); 
        setTimeout(() => getSimEl("sim-player-search-input")?.focus(), 50); 
    }
}

function buildAndAppendSimilarityDrawerHTML(playerList = []) {
    document.querySelectorAll('.table-filter-drawer, .similarity-filter-drawer').forEach(d => d.remove());

    let sourceList = playerList;
    if (!sourceList || sourceList.length === 0) {
        if (SIM_GLOBAL_DATA && SIM_GLOBAL_DATA.similar_players) {
            sourceList = SIM_GLOBAL_DATA.similar_players;
        } else if (window.GLOBAL_DATASET_CACHE) {
            sourceList = window.GLOBAL_DATASET_CACHE;
        }
    }

    const allPlayerNames = [...new Set(sourceList.map(p => p.player_name || p['Player Name']).filter(Boolean).sort())];
    const leagues = [...new Set(sourceList.map(p => p.league || p.League).filter(Boolean).sort())];
    const positions = [...new Set(sourceList.map(p => p.position || p['Pos.'] || p.Position).filter(Boolean).sort())];

    SIM_CACHED_PLAYER_ITEMS = null; // Nulstil cache-referencen til DOM-søgningen

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
            
            <!-- 🎯 AVANCERET DROPDOWN MED SØGEFELT -->
            <div class="table-drawer-group" style="position: relative;">
                <label class="table-drawer-label">Reference Player</label>
                <div class="custom-select-wrapper" id="sim-custom-player-wrapper" style="position: relative; width: 100%;">
                    <div class="custom-select-trigger" onclick="toggleSimPlayerDropdown()" style="background: rgba(20, 13, 33, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.08); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="sim-custom-player-selected-text">${SIM_TARGET_PLAYER || 'Vælg spiller...'}</span>
                        <i class="fa-solid fa-chevron-down" style="font-size: 12px; color: #64748b;"></i>
                    </div>
                    <div class="custom-options-list" id="sim-custom-player-options" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--accent-purple); border-radius: 6px; max-height: 250px; overflow-y: auto; z-index: 120;">
                        <div style="position: sticky; top: 0; background: #07030c; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); z-index: 130;">
                            <input type="text" id="sim-player-search-input" oninput="filterSimPlayerList()" placeholder="Search..." style="width: 100%; background: rgba(20, 13, 33, 0.85); color: #fff; border: 1px solid rgba(255,255,255,0.08); padding: 8px 10px; border-radius: 4px; font-size: 13px; outline: none;" onclick="event.stopPropagation();">
                        </div>
                        <div id="sim-custom-player-items-container">
                            ${allPlayerNames.map(p => `<div class="sim-custom-option-item ${p === SIM_TARGET_PLAYER ? 'selected-active' : ''}" onclick="selectSimPlayerItem('${p.replace(/'/g, "\\\\'")}')">${p}</div>`).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="table-drawer-group"><label class="table-drawer-label">Leagues</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(leagues, 'leagues')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Positions</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(positions, 'positions')}</div></div>
            <div class="table-drawer-group">
                <label class="table-drawer-label">Age (Min / Max)</label>
                <div class="table-drawer-input-row">
                    <input type="number" id="sim-filt-min-age" class="table-drawer-input" value="${SIM_FILTERS.minAge}" oninput="handleSimFilterInputChange()">
                    <input type="number" id="sim-filt-max-age" class="table-drawer-input" value="${SIM_FILTERS.maxAge}" oninput="handleSimFilterInputChange()">
                </div>
            </div>
            <div class="table-drawer-group">
                <label class="table-drawer-label">Minutes (Min / Max)</label>
                <div class="table-drawer-input-row">
                    <input type="number" id="sim-filt-min-mins" class="table-drawer-input" value="${SIM_FILTERS.minMins}" oninput="handleSimFilterInputChange()">
                    <input type="number" id="sim-filt-max-mins" class="table-drawer-input" value="${SIM_FILTERS.maxMins}" oninput="handleSimFilterInputChange()">
                </div>
            </div>
        </div>`;
    document.body.appendChild(drawerDiv);
}


// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 4 AF 5 (API DATA-FEEDER & BOOTSTRAP-MOTOR)
// ==========================================================================

// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 4 AF 5 (FIRST PLAYER DEFAULT ENGINE)
// ==========================================================================

async function bootstrapSimilarityFilters() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/table-data?stat_type=Per 90`);
        if (res.ok) {
            const dataData = await res.json();
            if (dataData && dataData.players) {
                window.GLOBAL_DATASET_CACHE = dataData.players;
                
                // 🎯 DEFAULT PLAYER ENGINE: Hvis der ikke er valgt en spiller i forvejen, tvinger vi den første i tabellen ind
                if (!SIM_TARGET_PLAYER && dataData.players.length > 0) {
                    SIM_TARGET_PLAYER = dataData.players[0].player_name || dataData.players[0]['Player Name'];
                    if (typeof CURRENT_SELECTED_PLAYER !== 'undefined') {
                        CURRENT_SELECTED_PLAYER = SIM_TARGET_PLAYER;
                    }
                }

                buildAndAppendSimilarityDrawerHTML(dataData.players);
                if (SIM_TARGET_PLAYER) {
                    await loadSimilarityAPIDataFeed();
                }
                return;
            }
        }
    } catch (e) {
        console.error("Fejl under bootstrap af similarity filtre:", e);
    }
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
    } catch (e) {
        console.error("Similarity API fejl:", e);
    }
}

// 🎯 NY KLIK-LOGIK TIL VALG AF SPILLER FRA INTEGRERET SØGELISTE
async function selectSimPlayerItem(value) {
    SIM_TARGET_PLAYER = value;
    if (typeof CURRENT_SELECTED_PLAYER !== 'undefined') {
        CURRENT_SELECTED_PLAYER = SIM_TARGET_PLAYER;
    }
    
    const triggerText = getSimEl("sim-custom-player-selected-text");
    if (triggerText) triggerText.innerText = value;
    
    const optEl = getSimEl("sim-custom-player-options"); 
    if (optEl) optEl.style.display = "none";
    
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

// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 5 AF 5 (BOX LEADERBOARD MATRIX ENGINE)
// ==========================================================================

// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 5 AF 5 (BOX LEADERBOARD MATRIX ENGINE)
// ==========================================================================

function buildSimilarityLeaderboardEngine() {
    const container = getSimEl("sim-capture-target-area");
    if (!container || !SIM_GLOBAL_DATA) return;
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

    const top10 = filtered
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, 10);

    // 🎯 SNEAKY HEADER LINE-UP: Symmetriske bredder centreret på midteraksen over bjælkeenheden
    let markup = `
        <div class="sim-scouting-header">
            <div class="sim-sc-hdr-left">
                <div style="width:35px; text-align:center;">Rank</div>
                <div style="padding-left:64px;">Player</div>
            </div>
            <div class="sim-sc-hdr-right">
                <div style="width:50px; text-align:center;">Pos.</div>
                <div style="width:55px; text-align:center;">Age</div>
                <div style="width:65px; text-align:center;">Min.</div>
                <div style="width:140px; text-align:center;">Similarity</div>
            </div>
        </div>
    `;

    markup += top10.map((p, idx) => {
        const score = p.similarity_score;
        const imgId = `sim-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;

        return `
            <div class="sim-leaderboard-card">
                <div class="sim-row-left">
                    <div class="sim-row-rank">#${idx + 1}</div>
                    <div class="sim-row-logo-box">
                        <img id="${imgId}" class="sim-row-crest" src="data:image/svg+xml;utf8,<svg xmlns=%22http://w3.org width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23475569%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>'" />
                    </div>
                    <!-- 🎯 INTEGRERET MOBIL METADATA UNDER NAVNET -->
                    <div class="sim-row-names">
                        <div class="sim-row-player-name">${p.player_name}</div>
                        <div class="sim-row-subtext">
                            <span class="sim-pc-meta-only">${p.team} | ${p.league}</span>
                            <span class="sim-mobile-meta-only" style="display: none;">${p.position} • ${p.age} år • ${p.mins_played}m</span>
                        </div>
                    </div>
                </div>
                <div class="sim-row-right">
                    <div class="sim-row-meta-val-pos">${p.position}</div>
                    <div class="sim-row-meta-val-age">${p.age} År</div>
                    <div class="sim-row-meta-val-mins">${p.mins_played}m</div>
                    
                    <!-- 🎯 SAMMENSMELTET ENHED: Procenttallet svæver nu centreret lige over baren -->
                    <div class="sim-row-bar-container">
                        <div class="sim-row-score-value">${score.toFixed(1)}%</div>
                        <div class="sim-row-bar-bg">
                            <div class="sim-row-bar-fill" style="width: ${score}%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = markup;

    top10.forEach(async (p, idx) => {
        const imgId = `sim-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;
        const imgEl = document.getElementById(imgId);
        if (!imgEl) return;
        const containerBox = imgEl.parentElement;

        if (!p.team_id || p.team_id === "nan" || p.team_id === "None") {
            if (containerBox) containerBox.style.display = "none";
            return;
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
            console.warn(`Kunne ikke hente logo for hold ID: ${p.team_id}`, e);
            if (containerBox) containerBox.style.display = "none";
        }
    });
}

