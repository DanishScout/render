// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 1 AF 4 (MASTER STATES & SPLIT CARD CSS)
// ==========================================================================

let SIMILARITY_GLOBAL_DATA = null;
let SIMILARITY_TARGET_PLAYER = ""; 

// Globale master-filtre til indstillingsskuffen
let SIMILARITY_FILTERS = {
    leagues: [],
    minAge: 0,
    maxAge: 100,
    minMins: 0,
    maxMins: 99999
};

const $s = id => document.getElementById(id);

// 🎨 CORE DESIGN INJECTION (IDENTISK MED DIT SMUKKE TABLE.JS LOOK)
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .sim-blocks-container { display: flex; flex-direction: column; gap: 14px; width: 100%; max-width: 950px; margin: 0 auto; padding: 0 10px; box-sizing: border-box; }
        
        /* 🎯 LEADERBOARD OVER-OVERSKRIFT */
        .sim-scouting-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 25px; font-family: 'Gabarito', sans-serif; font-size: 10.5px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid rgba(255,255,255,0.05); margin-bottom: 5px; box-sizing: border-box; }
        .sim-sc-hdr-left { display: flex; align-items: center; gap: 20px; }
        .sim-sc-hdr-right { display: flex; align-items: center; gap: 25px; flex-grow: 1; justify-content: flex-end; max-width: 500px; padding-right: 65px; box-sizing: border-box; }
        
        /* 🎯 THE SPLIT CARD: Dit signatur-profilkort */
        .sim-leaderboard-card { background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; padding: 16px 25px; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; gap: 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.5); position: relative; overflow: hidden; transition: transform 0.15s ease; }
        .sim-leaderboard-card:hover { transform: translateX(3px); border-color: rgba(255,255,255,0.08); }
        
        .sim-row-left { display: flex; align-items: center; gap: 20px; }
        .sim-row-rank { font-size: 22px; font-weight: 900; color: #f59e0b; width: 35px; text-align: center; text-shadow: 0 0 12px rgba(245,158,11,0.25); }
        
        /* Logo boks */
        .sim-row-logo-box { width: 44px; height: 44px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 4px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sim-row-crest { width: 100%; height: 100%; object-fit: contain; }
        
        .sim-row-names { display: flex; flex-direction: column; gap: 2px; }
        .sim-row-player-name { font-size: 15px; font-weight: 900; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .sim-row-subtext { font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .sim-row-right { display: flex; align-items: center; gap: 25px; flex-grow: 1; justify-content: flex-end; max-width: 500px; box-sizing: border-box; }
        .sim-row-meta-val-pos { font-size: 12px; font-weight: 800; color: #00f0ff; text-transform: uppercase; width: 50px; text-align: center; }
        .sim-row-meta-val-age, .sim-row-meta-val-mins { font-size: 13px; font-weight: 700; color: #94a3b8; text-align: center; }
        .sim-row-meta-val-age { width: 55px; }
        .sim-row-meta-val-mins { width: 65px; }

        /* Lysende Ligheds-bjælke (Match %) */
        .sim-row-bar-container { display: flex; flex-direction: column; width: 140px; }
        .sim-row-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; }
        .sim-row-bar-fill { height: 100%; background: var(--accent-purple, #a855f7); border-radius: 10px; width: 0%; transition: width 0.5s ease; }
        
        .sim-row-score-value { font-size: 16px; font-weight: 900; color: #f59e0b; width: 65px; text-align: right; text-shadow: 0 0 10px rgba(245,158,11,0.2); }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 2 AF 4 (LAYOUT & DROPDOWN DRAWER)
// ==========================================================================

async function initSimilarityView(container) {
    container.innerHTML = `
        <section id="view-similarity" class="content-view active" style="padding-top: 10px;">
            
            <!-- STORT FLOT HOVED-IKON OG DESIGNLINJE -->
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-users-viewfinder" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Player Similarity Engine</span>
            </div>

            <!-- BUTTON DER ÅBNER FILTER-SKUFFEN -->
            <div class="control-trigger-wrapper" style="margin-bottom: 25px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Configure Comparison <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            
            <!-- DET FLOTTE, MØRKE DIAGRAM-KORT -->
            <div class="sim-blocks-container" id="similarity-leaderboard-area" style="padding: 15px 5px; width: 100%; box-sizing: border-box;"></div>
        </section>
    `;
    
    if (!SIMILARITY_TARGET_PLAYER) {
        SIMILARITY_TARGET_PLAYER = "Erling Haaland"; // Standard fallback target
    }
    await loadSimilarityAPIDataFeed();
}

function buildAndAppendSimilarityDrawerHTML() {
    const gammelDrawer = document.querySelector('.table-filter-drawer');
    if (gammelDrawer) gammelDrawer.remove();

    // Sorter listen over alle tilgængelige spillere alfabetisk til søge-dropdownen
    const allPlayers = [...new Set(SIMILARITY_GLOBAL_DATA.similarity_leaderboard.map(p => p.player_name))].sort();
    const leagues = [...new Set(SIMILARITY_GLOBAL_DATA.similarity_leaderboard.map(p => p.league).filter(Boolean).sort())];

    const playerOptions = allPlayers.map(p => `<option value="${p}" ${p.toLowerCase() === SIMILARITY_TARGET_PLAYER.toLowerCase() ? 'selected' : ''}>${p}</option>`).join('');

    const generateCheckboxesHTML = (items, key) => {
        return items.map(item => {
            const checked = SIMILARITY_FILTERS[key].includes(item);
            return `<label class="table-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${item}" ${checked ? "checked" : ""} onchange="handleSimilarityCheckboxToggle(this, '${key}')" style="accent-color: var(--accent-purple);"> ${item}</label>`;
        }).join('');
    };

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer stats-filter-drawer table-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Similarity Dashboard</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-height: 85vh; overflow-y: auto;">
            
            <div class="table-drawer-group">
                <label class="table-drawer-label">Target Reference Player</label>
                <select id="sim-opt-player" class="table-drawer-select" onchange="handleSimilarityPlayerChange()">
                    ${playerOptions}
                </select>
            </div>
            
            <div class="table-drawer-group"><label class="table-drawer-label">Ligaer</label><div class="table-drawer-checkbox-box">${generateCheckboxesHTML(leagues, 'leagues')}</div></div>

            <div class="table-drawer-group">
                <label class="table-drawer-label">Alder Range (Min / Max)</label>
                <div class="table-drawer-input-row">
                    <input type="number" id="sim-filt-min-age" class="table-drawer-input" value="${SIMILARITY_FILTERS.minAge}" oninput="handleSimilarityFilterInputChange()">
                    <input type="number" id="sim-filt-max-age" class="table-drawer-input" value="${SIMILARITY_FILTERS.maxAge}" oninput="handleSimilarityFilterInputChange()">
                </div>
            </div>
            <div class="table-drawer-group">
                <label class="table-drawer-label">Minutter Range (Min / Max)</label>
                <div class="table-drawer-input-row">
                    <input type="number" id="sim-filt-min-mins" class="table-drawer-input" value="${SIMILARITY_FILTERS.minMins}" oninput="handleSimilarityFilterInputChange()">
                    <input type="number" id="sim-filt-max-mins" class="table-drawer-input" value="${SIMILARITY_FILTERS.maxMins}" oninput="handleSimilarityFilterInputChange()">
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(drawerDiv);
}
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 3 AF 4 (API SYNC & STATE INPUTS)
// ==========================================================================

async function loadSimilarityAPIDataFeed() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/similarity-data?target_player=${encodeURIComponent(SIMILARITY_TARGET_PLAYER)}`);
        if (res.ok) {
            SIMILARITY_GLOBAL_DATA = await res.json();
            const list = SIMILARITY_GLOBAL_DATA.similarity_leaderboard;

            if (list.length > 0 && SIMILARITY_FILTERS.minAge === 0 && SIMILARITY_FILTERS.maxAge === 100) {
                const ages = list.map(p => p.age).filter(a => a > 0);
                const mins = list.map(p => p.mins_played).filter(m => m > 0);
                SIMILARITY_FILTERS.minAge = Math.min(...ages); SIMILARITY_FILTERS.maxAge = Math.max(...ages);
                SIMILARITY_FILTERS.minMins = Math.min(...mins); SIMILARITY_FILTERS.maxMins = Math.max(...mins);
            }

            buildAndAppendSimilarityDrawerHTML();
            buildSimilarityLeaderboardEngine();
        }
    } catch (e) { console.error("Similarity API fejl:", e); }
}

async function handleSimilarityPlayerChange() {
    const playerSelect = $s("sim-opt-player");
    if (!playerSelect) return;
    
    SIMILARITY_TARGET_PLAYER = playerSelect.value;
    await loadSimilarityAPIDataFeed();
}

function handleSimilarityFilterInputChange() {
    if (!$s("sim-filt-min-age")) return;
    SIMILARITY_FILTERS.minAge = parseInt($s("sim-filt-min-age").value) || 0;
    SIMILARITY_FILTERS.maxAge = parseInt($s("sim-filt-max-age").value) || 100;
    SIMILARITY_FILTERS.minMins = parseInt($s("sim-filt-min-mins").value) || 0;
    SIMILARITY_FILTERS.maxMins = parseInt($s("sim-filt-max-mins").value) || 99999;
    
    buildSimilarityLeaderboardEngine();
}

function handleSimilarityCheckboxToggle(cb, key) {
    const val = cb.value;
    if (cb.checked) {
        if (!SIMILARITY_FILTERS[key].includes(val)) SIMILARITY_FILTERS[key].push(val);
    } else {
        SIMILARITY_FILTERS[key] = SIMILARITY_FILTERS[key].filter(v => v !== val);
    }
    cb.parentElement.style.opacity = cb.checked ? '1' : '0.4';
    buildSimilarityLeaderboardEngine();
}
// ==========================================================================
// PER 90 - SIMILARITY.JS - DEL 4 AF 4 (TOP 10 ENGINE WITH IMAGE PROXY)
// ==========================================================================

async function buildSimilarityLeaderboardEngine() {
    const container = $s("similarity-leaderboard-area"); 
    if (!container || !SIMILARITY_GLOBAL_DATA) return;
    container.innerHTML = "";

    const filtered = SIMILARITY_GLOBAL_DATA.similarity_leaderboard.filter(p => {
        if (p.player_name.toLowerCase() === SIMILARITY_TARGET_PLAYER.toLowerCase()) return false;
        
        if (SIMILARITY_FILTERS.leagues.length > 0 && !SIMILARITY_FILTERS.leagues.includes(p.league)) return false;
        if (p.age < SIMILARITY_FILTERS.minAge || p.age > SIMILARITY_FILTERS.maxAge) return false;
        if (p.mins_played < SIMILARITY_FILTERS.minMins || p.mins_played > SIMILARITY_FILTERS.maxMins) return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#64748b; font-weight:700;">INGEN ALTERNATIVE SPILLERE MATCHER DINE KRITERIER</div>`;
        return;
    }

    const top10Sim = filtered.slice(0, 10);

    let markup = `
        <div style="text-align:center; font-size:12px; color:#f59e0b; font-weight:800; text-transform:uppercase; margin-bottom:10px; letter-spacing:1px;">
            Closest statistical profiles to: ${SIMILARITY_GLOBAL_DATA.target_player_verified}
        </div>
        <div class="sim-scouting-header">
            <div class="sim-sc-hdr-left">
                <div style="width:35px; text-align:center;">Rank</div>
                <div style="padding-left:64px;">Alternative Spillerprofiler</div>
            </div>
            <div class="sim-sc-hdr-right">
                <div style="width:50px; text-align:center;">Pos</div>
                <div style="width:55px; text-align:center;">Alder</div>
                <div style="width:65px; text-align:center;">Minutter</div>
                <div style="width:140px; padding-left:25px;">Match Spektrum</div>
                <div style="width:65px; text-align:right;">Match %</div>
            </div>
        </div>
    `;

    markup += top10Sim.map((p, idx) => {
        const simPct = p.similarity_percentage;
        const imgId = `sim-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;

        return `
            <div class="sim-leaderboard-card">
                <div class="sim-row-left">
                    <div class="sim-row-rank">#${idx + 1}</div>
                    <div class="sim-row-logo-box">
                        <img id="${imgId}" class="sim-row-crest" src="data:image/svg+xml;utf8,<svg xmlns=%22http://w3.org width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23475569%22 stroke-width=%222%22><circle cx=%2212%22 cy=%2212%22 r=%2210%22/></svg>'" />
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
                            <div class="sim-row-bar-fill" style="width: ${simPct}%;"></div>
                        </div>
                    </div>
                    <div class="sim-row-score-value">${simPct.toFixed(1)}%</div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = markup;

    top10Sim.forEach(async (p, idx) => {
        const imgId = `sim-crest-${idx}-${p.player_name.replace(/[^a-zA-Z0-9]/g, '')}`;
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

function onSimilarityFilterChange() {
    buildSimilarityLeaderboardEngine();
}
