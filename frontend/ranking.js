// ==========================================================================
// PER 90 - RANKING.JS - DEL 1 AF 4 (OPDATERET: SQUEEZED MED RESPONSIV MOBIL-CSS)
// ==========================================================================

let RANK_GLOBAL_DATA = null;
let RANK_SELECTED_POSITION = "CBs";
let RANK_SELECTED_ROLE = "Quarterback";

// Filter-tilstande for kontrolpanelet
let RANK_FILTERS = {
    leagues: [],
    minAge: 0,
    maxAge: 100,
    minMins: 0,
    maxMins: 99999
};

const RANK_METRIC_TITLES = {
    "total goals_p90": "Goals",
    "xG_p90": "npxG",
    "total ontarget attempt_p90": "Shots On Target",
    "attempt_success_pct_p90": "On Target %",
    "CreatedOwnShot_p90": "Created Own Shot",
    "total attempt_p90": "Total Shots",
    "total attempts obox_p90": "Shots Outside Box",
    "total attempts ibox_p90": "Shots Inside Box",
    "total assists_p90": "Assists",
    "xA_p90": "xA",
    "total att assist_p90": "Key Passes",
    "xT_pass_p90": "xT via Pass",
    "progressive_passes_p90": "Prog. Passes",
    "passes_into_final_third_p90": "Passes Final 3rd",
    "forward_passes_p90": "Forward Passes",
    "total accurate fwd zone pass_p90": "Passes Opp. Half",
    "total accurate back zone pass_p90": "Passes Own Half",
    "total accurate pass_p90": "Comp. Passes",
    "total accurate long balls_p90": "Comp. Long Balls",
    "total accurate cross_p90": "Comp. Crosses",
    "pass_success_pct_p90": "Pass Comp. %",
    "long_balls_success_pct_p90": "Long Ball %",
    "cross_success_pct_p90": "Cross Comp. %",
    "total won contest_p90": "Succ. Dribbles",
    "total contest_p90": "Dribble Att.",
    "dribble_success_pct_p90": "Dribble %",
    "Total Carries_p90": "Prog. Carries",
    "Total Carry xT_p90": "xT Carries",
    "Total Final Third Carries_p90": "Carries Final 3rd",
    "total touches in opposition box_p90": "Touches Box",
    "total was fouled_p90": "Fouls Drawn",
    "tackle_success_pct_p90": "Tackles Won %",
    "aerial_success_pct_p90": "Aerials Won %",
    "duel_success_pct_p90": "Duels Won %",
    "total won tackle_p90": "Tackles Won",
    "total aerial won_p90": "Aerials Won",
    "total duels won_p90": "Duels Won",
    "total effective clearance_p90": "Clearances",
    "total interception_p90": "Interceptions"
};

const getRankEl = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('rank-core-styles')) return;
    const style = document.createElement('style');
    style.id = 'rank-core-styles';
    style.innerHTML = `
        .rank-blocks-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 100%; max-width: 1100px; margin: 0 auto; padding: 0 10px; box-sizing: border-box; }
        @media (max-width: 992px) { .rank-blocks-container { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .rank-blocks-container { grid-template-columns: 1fr; } }
        
        .rank-scouting-header { display: none !important; }
        
        .rank-leaderboard-card { background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 12px 25px rgba(0,0,0,0.4); box-sizing: border-box; transition: transform 0.15s ease, border-color 0.15s; position: relative; }
        .rank-leaderboard-card:hover { transform: translateY(-3px); border-color: rgba(255,255,255,0.09); }
        
        .rank-card-top-row { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 10px; }
        .rank-row-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex-grow: 1; }
        
        .rank-row-rank { font-size: 15px; font-weight: 900; color: #3498db; text-shadow: 0 0 10px rgba(52,152,219,0.3); line-height: 1; width: 24px; text-align: center; flex-shrink: 0; }
        
        .rank-row-logo-box { width: 36px; height: 36px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 3px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rank-row-crest { 
            width: 100%; 
            height: 100%; 
            object-fit: contain; 
            opacity: 0; 
            transition: opacity 0.25s ease-in-out; 
        }
        
        /* Denne klasse smides på via JavaScript, i det sekund billedet er klar */
        .rank-row-crest.logo-loaded { 
            opacity: 1 !important; 
        }

        
        .rank-row-names { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex-grow: 1; }
        .rank-row-player-name { font-size: 14px; font-weight: 900; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
        .rank-row-subtext { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .rank-card-meta-row { display: flex; gap: 10px; font-size: 11px; font-weight: 700; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.02); padding-top: 8px; }
        .rank-row-meta-val-pos { color: #00f0ff; text-transform: uppercase; }
        
        .rank-row-score-value { font-size: 18px; font-weight: 900; color: #2ecc71; text-shadow: 0 0 10px rgba(46,204,113,0.2); text-align: right; flex-shrink: 0; }

        .rank-metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 12px; width: 100%; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 10px; box-sizing: border-box; }
        
        .rank-bar-item { display: flex; flex-direction: column; gap: 2px; width: 100%; }
        .rank-bar-info { display: flex; justify-content: space-between; align-items: center; font-size: 9px; font-weight: 700; text-transform: uppercase; color: #64748b; }
        .rank-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.03); border-radius: 3px; overflow: hidden; }
        .rank-bar-fill { height: 100%; border-radius: 3px; width: 0%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

        /* 📱 RESPONSIV MOBILOPTIMERING FOR LEADERBOARD CARDS (Når skærmen er under 480px) */
        @media (max-width: 480px) {
            .rank-blocks-container { grid-template-columns: 1fr !important; padding: 0 4px !important; gap: 12px !important; }
            .rank-leaderboard-card { padding: 12px !important; gap: 10px !important; }
            
            /* Squeezer top-rækken så navne, logo og score har plads */
            .rank-row-rank { font-size: 13px !important; width: 18px !important; }
            .rank-row-logo-box { width: 30px !important; height: 30px !important; border-radius: 6px !important; }
            .rank-row-player-name { font-size: 12px !important; letter-spacing: 0.1px !important; }
            .rank-row-subtext { font-size: 9px !important; }
            .rank-row-score-value { font-size: 15px !important; }
            
            /* Komprimerer metadata-linjen (Position, Alder, Minutter) */
            .rank-card-meta-row { font-size: 10px !important; padding-top: 6px !important; gap: 6px !important; }
            
            /* Gør metrik-bjælkerne og talværdierne klar til små skærme */
            .rank-metrics-grid { gap: 6px 10px !important; padding-top: 8px !important; }
            .rank-bar-info { font-size: 8px !important; }
            .rank-bar-bg { height: 3px !important; }
        }
    `;
    document.head.appendChild(style);
});


// ==========================================================================
// PER 90 - RANKING.JS - DEL 2 AF 4 (LAYOUT & CHECKBOX DRAWER PANEL)
// ==========================================================================

async function initRankingView(container) {
    container.innerHTML = `
        <section id="view-ranking" class="content-view active" style="padding-top: 10px;">
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-arrow-up-9-1" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Role Ranking</span>
            </div>
            <div class="control-trigger-wrapper" style="margin-bottom: 25px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Ranking Engine <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            <div class="rank-blocks-container" id="rank-capture-target-area" style="padding: 15px 5px; width: 100%; box-sizing: border-box;">
                <div style="text-align:center; padding:50px; color:#64748b; font-weight:700;">ÅBEN INDSTILLINGER FOR AT VÆLGE POSITION OG SCOUTE ROLLEN</div>
            </div>
        </section>
    `;
    
    await bootstrapRankingFilters();
}

function buildAndAppendRankingDrawerHTML(configData, leagueList = []) {
    document.querySelectorAll('.table-filter-drawer, .ranking-filter-drawer').forEach(d => d.remove());

    const secureConfig = configData ? configData : {
        "position_groups": ["CBs", "FB/Wide CBs", "DM/CMs", "AM/Wide Midfielders", "Wingers", "Strikers"],
        "position_to_roles": {}
    };

    const positionGroups = secureConfig.position_groups;
    const positionToRoles = secureConfig.position_to_roles || {};

    const posOptions = positionGroups.map(p => `<option value="${p}" ${p === RANK_SELECTED_POSITION ? 'selected' : ''}>${p}</option>`).join('');
    
    const currentRoles = positionToRoles[RANK_SELECTED_POSITION] || [];
    const roleOptions = currentRoles.map(r => `<option value="${r}" ${r === RANK_SELECTED_ROLE ? 'selected' : ''}>${r}</option>`).join('');

    const generateCheckboxesHTML = (items) => {
        return items.map(item => {
            const checked = RANK_FILTERS.leagues.includes(item);
            return `<label class="table-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${item}" ${checked ? "checked" : ""} onchange="handleRankLeagueToggle(this)" style="accent-color: var(--accent-purple);"> ${item}</label>`;
        }).join('');
    };

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer stats-filter-drawer table-filter-drawer ranking-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Scouting & Ranking</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-height: 85vh; overflow-y: auto;">
            <div class="table-drawer-group">
                <label class="table-drawer-label">Position</label>
                <select id="rank-opt-position" class="table-drawer-select" onchange="handleRankPositionChange()">
                    ${posOptions}
                </select>
            </div>
            <div class="table-drawer-group">
                <label class="table-drawer-label">Role</label>
                <select id="rank-opt-role" class="table-drawer-select" onchange="handleRankRoleChange()">
                    ${roleOptions}
                </select>
            </div>
            <div class="table-drawer-group"><label class="table-drawer-label">Leagues</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(leagueList)}</div></div>
            <div class="table-drawer-group">
                <label class="table-drawer-label">Age (Min / Max)</label>
                <div class="table-drawer-input-row">
                    <input type="number" id="rank-filt-min-age" class="table-drawer-input" value="${RANK_FILTERS.minAge}" oninput="handleRankFilterInputChange()">
                    <input type="number" id="rank-filt-max-age" class="table-drawer-input" value="${RANK_FILTERS.maxAge}" oninput="handleRankFilterInputChange()">
                </div>
            </div>
            <div class="table-drawer-group">
                <label class="table-drawer-label">Minutes (Min / Max)</label>
                <div class="table-drawer-input-row">
                    <input type="number" id="rank-filt-min-mins" class="table-drawer-input" value="${RANK_FILTERS.minMins}" oninput="handleRankFilterInputChange()">
                    <input type="number" id="rank-filt-max-mins" class="table-drawer-input" value="${RANK_FILTERS.maxMins}" oninput="handleRankFilterInputChange()">
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(drawerDiv);
}
// ==========================================================================
// PER 90 - RANKING.JS - DEL 3 AF 4 (ASYNC API SYNC & STATE MANAGEMENT)
// ==========================================================================

// ==========================================================================
// PER 90 - RANKING.JS - DEL 3A (ASYNC BOOTSTRAPPER & STATE ENGINE)
// ==========================================================================

let RANK_CONFIG_CACHE = null;
let RANK_LEAGUE_CACHE = [];

async function bootstrapRankingFilters() {
    try {
        // 1. Hent konfigurationerne som trækkes direkte fra roles.csv i backenden
        const configRes = await fetch(`${API_BASE_URL}/api/ranking-config`);
        if (configRes.ok) {
            RANK_CONFIG_CACHE = await configRes.json();
        }

        // 2. Træk ligaerne ud af den overordnede master-cache for kontinuitet
        if (window.GLOBAL_DATASET_CACHE && window.GLOBAL_DATASET_CACHE.length > 0) {
            RANK_LEAGUE_CACHE = [...new Set(window.GLOBAL_DATASET_CACHE.map(p => p.league || p.League).filter(Boolean).sort())];
        } else {
            const tableRes = await fetch(`${API_BASE_URL}/api/table-data?stat_type=Per 90`);
            if (tableRes.ok) {
                const tableData = await tableRes.json();
                window.GLOBAL_DATASET_CACHE = tableData.players;
                RANK_LEAGUE_CACHE = [...new Set(tableData.players.map(p => p.league || p.League).filter(Boolean).sort())];
            }
        }

        // Sørg for at vælge en gyldig default rolle baseret på CSV-arket
        if (RANK_CONFIG_CACHE && RANK_CONFIG_CACHE.position_to_roles) {
            const allowed = RANK_CONFIG_CACHE.position_to_roles[RANK_SELECTED_POSITION] || [];
            if (allowed.length > 0 && !allowed.includes(RANK_SELECTED_ROLE)) {
                RANK_SELECTED_ROLE = allowed[0];
            }
        }

        buildAndAppendRankingDrawerHTML(RANK_CONFIG_CACHE, RANK_LEAGUE_CACHE);
        await loadRankingAPIDataFeed();

    } catch (e) {
        console.error("Fejl under bootstrap af ranking parametre:", e);
    }
}
// ==========================================================================
// PER 90 - RANKING.JS - DEL 3B (ASYNC DATA FEED & ANTI-BLUR CONTROLS)
// ==========================================================================

// ==========================================================================
// PER 90 - RANKING.JS - DEL 3B (OPDATERET: FORBLIVER ÅBEN VED FILTER-ÆNDRING)
// ==========================================================================

async function loadRankingAPIDataFeed() {
    try {
        let leaguesQuery = RANK_FILTERS.leagues.length > 0 
            ? RANK_FILTERS.leagues.map(l => `leagues=${encodeURIComponent(l)}`).join('&')
            : "leagues=All";

        const url = `${API_BASE_URL}/api/ranking-data?position_group=${encodeURIComponent(RANK_SELECTED_POSITION)}&role_name=${encodeURIComponent(RANK_SELECTED_ROLE)}&${leaguesQuery}&min_age=${RANK_FILTERS.minAge}&max_age=${RANK_FILTERS.maxAge}&min_mins=${RANK_FILTERS.minMins}&max_mins=${RANK_FILTERS.maxMins}`;

        const res = await fetch(url);
        if (res.ok) {
            RANK_GLOBAL_DATA = await res.json();
            buildRankingLeaderboardEngine();
            
            // 🎯 ANTI-BLUR RETTELSE: Vi fjerner kun sløringen på selve baggrunds-indholdet,
            // så man kan se dataene opdatere sig bagved, men fjerner IKKE 'drawer-open' klassen!
            document.body.classList.remove('blurry');
            const contentOverlay = document.getElementById('dynamic-content-area');
            if (contentOverlay) contentOverlay.classList.remove('blurry', 'blur-active');
            
            // ❌ closeGlobalDrawer ELIMINERET HERFRA: Skuffen forbliver åben indtil aktivt lukket af brugeren!
        }
    } catch (e) {
        console.error("Ranking API systemfejl:", e);
    }
}

function handleRankPositionChange() {
    const posSelect = getRankEl("rank-opt-position");
    if (!posSelect) return;
    
    RANK_SELECTED_POSITION = posSelect.value;
    
    if (RANK_CONFIG_CACHE && RANK_CONFIG_CACHE.position_to_roles) {
        const allowed = RANK_CONFIG_CACHE.position_to_roles[RANK_SELECTED_POSITION] || [];
        if (allowed.length > 0) RANK_SELECTED_ROLE = allowed[0]; // Sæt første ledige rolle som default
    }
    
    buildAndAppendRankingDrawerHTML(RANK_CONFIG_CACHE, RANK_LEAGUE_CACHE);
    
    // 🎯 SIKRER AT SKUFFEN VISES: Da buildAndAppend fjerner og genindsætter HTML-skuffen,
    // kalder vi lige open-funktionen med det samme, så den ikke forsvinder visuelt under gen-bygningen.
    if (typeof openGlobalDrawer === 'function') {
        openGlobalDrawer();
    }
    
    loadRankingAPIDataFeed();
}

function handleRankRoleChange() {
    const roleSelect = getRankEl("rank-opt-role");
    if (!roleSelect) return;
    RANK_SELECTED_ROLE = roleSelect.value;
    loadRankingAPIDataFeed();
}

function handleRankFilterInputChange() {
    if (!getRankEl("rank-filt-min-age")) return;
    RANK_FILTERS.minAge = parseInt(getRankEl("rank-filt-min-age").value) || 0;
    RANK_FILTERS.maxAge = parseInt(getRankEl("rank-filt-max-age").value) || 100;
    RANK_FILTERS.minMins = parseInt(getRankEl("rank-filt-min-mins").value) || 0;
    RANK_FILTERS.maxMins = parseInt(getRankEl("rank-filt-max-mins").value) || 99999;
    loadRankingAPIDataFeed();
}

function handleRankLeagueToggle(cb) {
    const val = cb.value;
    if (cb.checked) {
        if (!RANK_FILTERS.leagues.includes(val)) RANK_FILTERS.leagues.push(val);
    } else {
        RANK_FILTERS.leagues = RANK_FILTERS.leagues.filter(v => v !== val);
    }
    cb.parentElement.style.opacity = cb.checked ? '1' : '0.4';
    loadRankingAPIDataFeed();
}



// ==========================================================================
// PER 90 - RANKING.JS - DEL 4A (HTML MATRIX & TOP 9 SLICING)
// ==========================================================================

function buildRankingLeaderboardEngine() {
    const container = getRankEl("rank-capture-target-area");
    if (!container || !RANK_GLOBAL_DATA) return;
    container.innerHTML = "";

    const list = RANK_GLOBAL_DATA.players || [];

    if (list.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#64748b; font-weight:700; grid-column: span 3;">INGEN SPILLERE MATCHER DINE SØGEKRITERIER I DENNE ROLLE</div>`;
        return;
    }

    const barColors = ["#3498db", "#2ecc71", "#9b59b6", "#e74c3c", "#1abc9c", "#e67e22"];

    // 🎯 TOP 9 SLICE: Vi ændrer fra 10 til 9 spillere for et perfekt 3x3 layout!
    const top9 = list
        .sort((a, b) => b.role_score - a.role_score)
        .slice(0, 9);

    let markup = "";

    markup += top9.map((p, idx) => {
        const imgId = `rank-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;
        
        let barsHTML = '<div class="rank-metrics-grid">';
        let colorIdx = 0;
        
        for (const [rawMetric, scoreVal] of Object.entries(p.metric_scores)) {
            const prettyTitle = RANK_METRIC_TITLES[rawMetric] || rawMetric.replace("_p90", "");
            const color = barColors[colorIdx % barColors.length];
            colorIdx++;

            barsHTML += `
                <div class="rank-bar-item">
                    <div class="rank-bar-info">
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 65px;">${prettyTitle}</span>
                        <span style="color: ${color}; font-weight:800;">${Math.round(scoreVal)}</span>
                    </div>
                    <div class="rank-bar-bg">
                        <div class="rank-bar-fill" style="background: ${color}; width: ${scoreVal}%;"></div>
                    </div>
                </div>
            `;
        }
        barsHTML += '</div>';

        return `
            <div class="rank-leaderboard-card">
                <!-- Top række: Spiller og overordnet rolle-score -->
                <div class="rank-card-top-row">
                    <div class="rank-row-left">
                        <div class="rank-row-rank">#${p.rank}</div>
                        <div class="rank-row-logo-box">
                            <img id="${imgId}" class="rank-row-crest" src="data:image/svg+xml;utf8,<svg xmlns=%22http://w3.org width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23475569%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>'" />
                        </div>
                        <div class="rank-row-names">
                            <h4 class="rank-row-player-name" title="${p.player_name}">${p.player_name}</h4>
                            <div class="rank-row-subtext">${p.team}</div>
                        </div>
                    </div>
                    <div class="rank-row-score-value">${p.role_score.toFixed(1)}</div>
                </div>
                
                <!-- Kompakt metadata midt i kortet -->
                <div class="rank-card-meta-row">
                    <span class="rank-row-meta-val-pos">${p.position}</span>
                    <span>•</span>
                    <span>${p.age} År</span>
                    <span>•</span>
                    <span>${p.mins_played}m</span>
                </div>
                
                <!-- Bund række: De 6 vægtede performance-bjælker (Nu i tæt 2-kolonne grid) -->
                ${barsHTML}
            </div>
        `;
    }).join('');

    container.innerHTML = markup;

    // Vi eksekverer logo-hentningen asynkront (Se Del 4b)
    fetchRankLogosParallel(top9);
}
// ==========================================================================
// PER 90 - RANKING.JS - RETTET DEL 4B (GLIDENDE FADE-IN OG AUTOMATISK OPRYDNING)
// ==========================================================================

function fetchRankLogosParallel(playerList) {
    playerList.forEach(async (p, idx) => {
        const imgId = `rank-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;
        const imgEl = document.getElementById(imgId);
        if (!imgEl) return;

        const containerBox = imgEl.parentElement;

        // Hvis holdet mangler et gyldigt ID, fjerner vi rammen med det samme for at undgå tom støj
        if (!p.team_id || p.team_id === "nan" || p.team_id === "None") {
            if (containerBox) containerBox.style.display = "none";
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/logo/${p.team_id}`).then(r => r.json());
            if (res.logo_base64) {
                // Først når billedet reelt er færdigbygget i hukommelsen, fader vi det blidt ind
                imgEl.onload = () => {
                    imgEl.classList.add('logo-loaded');
                };
                imgEl.src = res.logo_base64;
            } else {
                // Hvis API'et ikke returnerer et gyldigt billede, rydder vi bunden op
                if (containerBox) containerBox.style.display = "none";
            }
        } catch (e) {
            console.warn(`Kunne ikke hente logo for hold ID: ${p.team_id}`, e);
            if (containerBox) containerBox.style.display = "none";
        }
    });
}


