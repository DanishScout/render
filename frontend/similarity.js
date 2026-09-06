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

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('sim-core-styles')) return; // Undgå gen-injektion
    const style = document.createElement('style');
    style.id = 'sim-core-styles';
    style.innerHTML = `
        .sim-blocks-container { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 950px; margin: 0 auto; padding: 0 10px; box-sizing: border-box; }
        
        /* LEADERBOARD OVER-OVERSKRIFT: Definerer kolonnerne én gang for alle øverst */
        .sim-scouting-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 25px; font-family: 'Gabarito', sans-serif; font-size: 10.5px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid rgba(255,255,255,0.05); margin-bottom: 5px; box-sizing: border-box; }
        .sim-sc-hdr-left { display: flex; align-items: center; gap: 20px; }
        .sim-sc-hdr-right { display: flex; align-items: center; gap: 25px; flex-grow: 1; justify-content: flex-end; max-width: 500px; padding-right: 65px; box-sizing: border-box; }
        
        /* THE SPLIT CARD: Det store, rå, mørke profilkort til din Top 10 */
        .sim-leaderboard-card { background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; padding: 16px 25px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; gap: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); position: relative; overflow: hidden; transition: transform 0.15s ease; }
        .sim-leaderboard-card:hover { transform: translateX(3px); border-color: rgba(255,255,255,0.08); }
        
        /* Venstre felt */
        .sim-row-left { display: flex; align-items: center; gap: 20px; }
        .sim-row-rank { font-size: 22px; font-weight: 900; color: #a855f7; width: 35px; text-align: center; text-shadow: 0 0 12px rgba(168,85,247,0.25); }
        
        /* Logo ramme */
        .sim-row-logo-box { width: 44px; height: 44px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 3px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sim-row-crest { 
            width: 100%; 
            height: 100%; 
            object-fit: contain; 
            opacity: 0; 
            transition: opacity 0.25s ease-in-out; 
        }
        
        /* Denne klasse skydes på via JavaScript, i det sekund billedet er færdighentet */
        .sim-row-crest.logo-loaded { 
            opacity: 1 !important; 
        }

        
        .sim-row-names { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .sim-row-player-name { font-size: 15px; font-weight: 900; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sim-row-subtext { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        /* Højre felt */
        .sim-row-right { display: flex; align-items: center; gap: 25px; flex-grow: 1; justify-content: flex-end; max-width: 500px; box-sizing: border-box; }
        .sim-row-meta-val-pos { font-size: 12px; font-weight: 800; color: #00f0ff; text-transform: uppercase; width: 50px; text-align: center; }
        .sim-row-meta-val-age { font-size: 13px; font-weight: 700; color: #94a3b8; width: 55px; text-align: center; }
        .sim-row-meta-val-mins { font-size: 13px; font-weight: 700; color: #94a3b8; width: 65px; text-align: center; }

        /* Lysende Match-bjælke */
        .sim-row-bar-container { display: flex; flex-direction: column; width: 140px; }
        .sim-row-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; }
        .sim-row-bar-fill { height: 100%; background: linear-gradient(90deg, #a855f7 0%, #00f0ff 100%); border-radius: 10px; width: 0%; transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        
        .sim-row-score-value { font-size: 16px; font-weight: 900; color: #00f0ff; width: 65px; text-align: right; text-shadow: 0 0 10px rgba(0,240,255,0.2); }

        /* 📱 RESPONSIV MOBILOPTIMERING FOR SIMILARITY FEED (Når skærmen er under 480px) */
        @media (max-width: 480px) {
            /* Skjuler tabeloverskriften på mobil for at forhindre støj */
            .sim-scouting-header { display: none !important; }
            
            .sim-blocks-container { gap: 10px !important; padding: 0 4px !important; }
            
            /* Stabler spillerkortet vertikalt */
            .sim-leaderboard-card { flex-direction: column !important; align-items: flex-start !important; padding: 12px !important; gap: 10px !important; border-radius: 12px !important; }
            
            .sim-row-left { width: 100% !important; gap: 12px !important; }
            .sim-row-rank { font-size: 16px !important; width: 24px !important; }
            .sim-row-logo-box { width: 34px !important; height: 34px !important; border-radius: 8px !important; }
            .sim-row-player-name { font-size: 13px !important; }
            .sim-row-subtext { font-size: 10px !important; }
            
            /* Flytter højre datapanel ind under navnet som en sekundær linje */
            .sim-row-right { width: 100% !important; max-width: 100% !important; justify-content: space-between !important; padding-left: 36px !important; box-sizing: border-box; gap: 0px !important; }
            
            /* Arrangerer metadata inline med prik-separatorer */
            .sim-row-meta-val-pos, .sim-row-meta-val-age, .sim-row-meta-val-mins { font-size: 10.5px !important; width: auto !important; text-align: left !important; }
            .sim-row-meta-val-pos::after { content: ' •'; color: #475569; }
            .sim-row-meta-val-age::after { content: ' •'; color: #475569; }
            
            /* Fjerner den lineære matchbjælke for at holde det kompakt på mobil */
            .sim-row-bar-container { display: none !important; }
            
            .sim-row-score-value { font-size: 14px !important; width: auto !important; text-align: right !important; font-weight: 900 !important; }
        }
    `;
    document.head.appendChild(style);
});

// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 3 AF 5 (LAYOUT & DYNAMISK SKUFFE-HTML)
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
            </div>
        </section>
    `;
    
    if (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) {
        SIM_TARGET_PLAYER = CURRENT_SELECTED_PLAYER;
    }
    
    // Tvinger appen til at hente datafeeden fra backend før skuffen åbnes
    await bootstrapSimilarityFilters();
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

    // Udtrækker metadata asynkront fra dine indlæste liga-filer
    const allPlayerNames = [...new Set(sourceList.map(p => p.player_name || p['Player Name']).filter(Boolean).sort())];
    const leagues = [...new Set(sourceList.map(p => p.league || p.League).filter(Boolean).sort())];
    const positions = [...new Set(sourceList.map(p => p.position || p['Pos.'] || p.Position).filter(Boolean).sort())];

    const playerOptions = allPlayerNames.map(p => `<option value="${p}" ${p === SIM_TARGET_PLAYER ? 'selected' : ''}>${p}</option>`).join('');

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
            
            <div class="table-drawer-group">
                <label class="table-drawer-label">Reference Player</label>
                <select id="sim-opt-target" class="table-drawer-select" onchange="handleSimTargetChange()">
                    <option value="">-- Select player --</option>
                    ${playerOptions}
                </select>
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
        </div>
    `;
    document.body.appendChild(drawerDiv);
}
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 4 AF 5 (API DATA-FEEDER & BOOTSTRAP-MOTOR)
// ==========================================================================

async function bootstrapSimilarityFilters() {
    try {
        // Kalder tabel-data-feedet for lynhurtigt at hente og cachelagre metadata
        const res = await fetch(`${API_BASE_URL}/api/table-data?stat_type=Per 90`);
        if (res.ok) {
            const dataData = await res.json();
            if (dataData && dataData.players) {
                window.GLOBAL_DATASET_CACHE = dataData.players;
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
        // De 15 officielle grundmetrikker sendes automatisk med til backendens distance-beregner
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

async function handleSimTargetChange() {
    const targetSelect = getSimEl("sim-opt-target");
    if (!targetSelect) return;
    
    SIM_TARGET_PLAYER = targetSelect.value;
    if (typeof CURRENT_SELECTED_PLAYER !== 'undefined') {
        CURRENT_SELECTED_PLAYER = SIM_TARGET_PLAYER;
    }
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

function buildSimilarityLeaderboardEngine() {
    const container = getSimEl("sim-capture-target-area");
    if (!container || !SIM_GLOBAL_DATA) return;
    container.innerHTML = "";

    // Filtrering på baggrund af rullemenuerne
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

    // Sorterer efter højeste Match % (Lighedsscore)
    const top10 = filtered
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, 10);

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
                <div style="width:140px; padding-left:25px;">Similarity</div>
                <div style="width:65px; text-align:right;">Match %</div>
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
                        <img id="${imgId}" class="sim-row-crest" src="data:image/svg+xml;utf8,<svg xmlns=%22http://w3.org width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23475569%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>" />
                    </div>
                    <div class="sim-row-names">
                        <div class="sim-row-player-name">${p.player_name}</div>
                        <div class="sim-row-subtext">${p.team} | ${p.league}</div>
                    </div>
                </div>
                <div class="sim-row-right">
                    <div class="sim-row-meta-val-pos">${p.position}</div>
                    <div class="sim-row-meta-val-age">${p.age} År</div>
                    <div class="sim-row-meta-val-mins">${p.mins_played}m</div>
                    <div class="sim-row-bar-container">
                        <div class="sim-row-bar-bg">
                            <div class="sim-row-bar-fill" style="width: ${score}%;"></div>
                        </div>
                    </div>
                    <div class="sim-row-score-value">${score.toFixed(1)}%</div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = markup;

        // ==========================================================================
    // AKTUEL OPTIMERING: GLIDENDE FADE-IN OG AUTOMATISK OPRYDNING AF TOMME BOKSE
    // ==========================================================================
    top10.forEach(async (p, idx) => {
        const imgId = `sim-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;
        const imgEl = document.getElementById(imgId);
        if (!imgEl) return;

        const containerBox = imgEl.parentElement;

        // Hvis holdet mangler et gyldigt ID, fjerner vi logorammen med det samme for et rent udtryk
        if (!p.team_id || p.team_id === "nan" || p.team_id === "None") {
            if (containerBox) containerBox.style.display = "none";
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/logo/${p.team_id}`).then(r => r.json());
            if (res.logo_base64) {
                // Sørg for først at fjerne gennemsigtigheden, når base64-strengen reelt er færdigbygget i DOM'en
                imgEl.onload = () => {
                    imgEl.classList.add('logo-loaded');
                };
                imgEl.src = res.logo_base64;
            } else {
                // Hvis API'et ikke returnerer et gyldigt billede, rydder vi op
                if (containerBox) containerBox.style.display = "none";
            }
        } catch (e) {
            console.warn(`Kunne ikke hente logo for hold ID: ${p.team_id}`, e);
            if (containerBox) containerBox.style.display = "none";
        }
    });

}
