// ==========================================================================
// PER 90 - STATS.JS - DEL 1 AF 4 (MASTER MODUL & COMPACT TEXT CSS RESPONSIV)
// ==========================================================================

const STATS_CATEGORIES_LIST = ["OUTPUT", "PLAYMAKING", "PASSING", "POSSESSION", "DEFENDING/DUELS", "OTHER"];
let STATS_CURRENT_PLAYER = "";
let STATS_ACTIVE_CATEGORIES = [...STATS_CATEGORIES_LIST];
let STATS_GLOBAL_PAYLOAD = null;

const $s = id => document.getElementById(id);

// 🎨 FIXET LOKAL CSS INJECTION: Gør teksterne mindre, barerne 5-trins farvede og fuldt mobil-responsive!
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        /* Spiced Header Design - Cyber Scouting Shield */
        .stats-profile-card { width: 100%; max-width: 1100px; background: rgba(11, 18, 32, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.04); border-top: 3px solid var(--accent-purple); border-radius: 20px; padding: 30px; margin: 0 auto 35px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; flex-wrap: wrap; gap: 20px; box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
        .stats-p-left { display: flex; align-items: center; gap: 24px; }
        .stats-p-names { display: flex; flex-direction: column; }
        .stats-p-name { font-size: 34px; font-weight: 900; margin: 0; color: #fff; letter-spacing: -0.5px; text-shadow: 0 0 20px rgba(255,255,255,0.1); }
        .stats-p-sub { font-size: 12px; color: #64748b; margin: 6px 0 0 0; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }

        .stats-p-right { display: grid; grid-template-columns: repeat(4, 115px); gap: 12px; }
        .stats-meta-box { background: rgba(6, 10, 18, 0.7); border: 1px solid rgba(255,255,255,0.06); padding: 10px 14px; border-radius: 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; position: relative; overflow: hidden; }
        .stats-meta-box::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent); }
        .stats-meta-val { font-size: 11px; font-weight: 900; color: #f1f5f9; text-transform: uppercase; letter-spacing: 0.5px; }
        .stats-meta-lbl { font-size: 9px; font-weight: 800; color: #475569; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }

        /* Blok-containere i to-kolonne layout side-om-side */
        .stats-blocks-container { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 25px; width: 100%; max-width: 1100px; margin: 0 auto; box-sizing: border-box; }
        .stats-cat-block { background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 25px; box-sizing: border-box; display: flex; flex-direction: column; gap: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .stats-cat-title { font-size: 13px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 10px; }
        
        /* 2x3/3x2 Metrik-grid indeni kasserne */
        .stats-metrics-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 20px; width: 100%; }
        
        @media (max-width: 950px) { .stats-blocks-container { grid-template-columns: 1fr !important; } .stats-p-right { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .stats-metrics-grid { grid-template-columns: 1fr !important; } .stats-profile-card { padding: 20px; } .stats-p-name { font-size: 26px; } }
        
        .stats-metric-item { display: flex; flex-direction: column; width: 100%; box-sizing: border-box; }
        
        /* Mindre og slankere metrik-titler (11px, weight 500) */
        .stats-m-lbl { font-size: 10px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
        .stats-m-bar-bg { width: 100%; height: 4px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; position: relative; margin-bottom: 6px; }
        .stats-m-bar-fill { height: 100%; border-radius: 10px; width: 0%; transition: width 0.6s ease-in-out; }
        
        .stats-m-info-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }
        .stats-m-val-text { font-size: 11px; font-weight: 800; color: #fff; }
        .stats-m-val-text span { color: #475569; font-weight: 600; font-size: 10px; margin-left: 2px; }
        
        .stats-status-badge { font-size: 8.5px; font-weight: 900; padding: 1px 5px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; }
        
        .fill-elite { background: #22c55e !important; }
        .fill-good { background: #60a5fa !important; }
        .fill-avg { background: #94a3b8 !important; }
        .fill-concern { background: #f59e0b !important; }
        .fill-poor { background: #ef4444 !important; }

        .badge-elite { background: rgba(34, 197, 94, 0.06); border: 1px solid #22c55e; color: #22c55e; }
        .badge-good { background: rgba(96, 165, 252, 0.06); border: 1px solid #60a5fa; color: #60a5fa; }
        .badge-avg { background: rgba(148, 163, 184, 0.12); border: 1px solid #94a3b8; color: #94a3b8; }
        .badge-concern { background: rgba(245, 158, 11, 0.06); border: 1px solid #f59e0b; color: #f59e0b; }
        .badge-poor { background: rgba(239, 68, 68, 0.06); border: 1px solid #ef4444; color: #ef4444; }

        /* 📱 RESPONSIV MOBILOPTIMERING FOR STATS-PROFIL (Når skærmen er under 480px) */
        @media (max-width: 480px) {
            /* Trækker profilkortet tæt sammen */
            .stats-profile-card { padding: 10px 10px !important; margin-bottom: 12px !important; gap: 8px !important; flex-direction: column !important; align-items: flex-start !important; }
            .stats-p-left { gap: 6px !important; width: 100% !important; }
            .stats-p-names { border-left-width: 3px !important; padding-left: 6px !important; }
            
            /* Spillernavnet bevarer sin fine, læsbare størrelse */
            .stats-p-name { font-size: 18px !important; letter-spacing: -0.5px !important; }
            /* Gør undertitlen en smule mindre */
            .stats-p-sub { font-size: 7.5px !important; margin-top: 1px !important; letter-spacing: 0.2px !important; }

            /* 🎯 ULTRA-RETTELSE 1: Tvinger Club, Age og Mins side om side på én linje på mobil */
            .stats-p-right { display: flex !important; flex-direction: row !important; width: 100% !important; gap: 4px !important; justify-content: space-between !important; }
            .stats-meta-box { flex: 1 !important; padding: 4px 2px !important; border-radius: 5px !important; min-width: 0 !important; text-align: center !important; }
            .stats-meta-val { font-size: 8px !important; font-weight: 800 !important; }
            .stats-meta-lbl { font-size: 6.5px !important; margin-top: 0px !important; opacity: 0.7 !important; }

            /* Tvinger kasserne til at stå side om side i 2 brede kolonner */
            .stats-blocks-container { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 6px !important; width: 100% !important; padding: 0 !important; }
            
            /* Gør hver kategoriboks endnu mere kompakt */
            .stats-cat-block { padding: 8px !important; gap: 6px !important; border-radius: 10px !important; }
            .stats-cat-title { font-size: 8.5px !important; padding-bottom: 3px !important; margin-bottom: 0px !important; }
            
            /* Tvinger metrikkerne ind i 1 kolonne indeni de små kasser */
            .stats-metrics-grid { grid-template-columns: 1fr !important; gap: 6px !important; }
            
            /* 🎯 ULTRA-RETTELSE 2: Skruer helt ned for alle tekstelementer i metrikkerne */
            .stats-m-lbl { font-size: 6px !important; margin-bottom: 1px !important; letter-spacing: 0px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0.8 !important; }
            .stats-m-bar-bg { height: 2px !important; margin-bottom: 2px !important; }
            .stats-m-val-text { font-size: 6px !important; }
            .stats-m-val-text span { font-size: 6px !important; margin-left: 1px !important; }
            .stats-status-badge { 
                font-size: 5px !important; 
                padding: 2px 4px 2px 4px !important; /* Præcis kontrol over top/bund polstring */
                line-height: 1 !important;           /* Låser tekstens linjehøjde */
                display: inline-flex !important;      
                align-items: center !important;      /* Centrerer kassen vertikalt */
                justify-content: center !important;   /* Centrerer kassen horisontalt */
                letter-spacing: -0.2px !important; 
                border-radius: 2px !important; 
                height: 10px !important;             /* Fastlåser højden så html2canvas ikke gætter forkert */
                box-sizing: border-box !important;
            }



    `;
    document.head.appendChild(style);
});
// ==========================================================================

// ==========================================================================
// PER 90 - STATS.JS - DEL 2 AF 4 (RENSÉ DRAWER SKABELON - UDEN SKRÅSTREGER)
// ==========================================================================

async function initPlayerStatsView(container) {
    container.innerHTML = `
        <section id="view-stats" class="content-view active" style="padding-top: 10px;">
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-id-card-clip" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Player Stats</span>
            </div>
            <div class="control-trigger-wrapper" style="margin-bottom: 35px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Profile <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            <div id="stats-capture-target-area" style="padding: 15px 5px; width: 100%; box-sizing: border-box;">
                <div id="stats-main-profile-card"></div>
                <div class="stats-blocks-container" id="stats-live-blocks-grid"></div>
            </div>
            <div style="display: flex; justify-content: center; margin-top: 30px; width: 100%;">
                <button onclick="downloadPlayerStatsPNG()" style="background: var(--accent-purple); color: #06140c; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">Download Profile as PNG</button>
            </div>
        </section>
    `;
    await initCustomStatsSelectors();
}

function buildAndAppendStatsDrawerHTML() {
    const checkboxesHTML = STATS_CATEGORIES_LIST.map(cat => {
        const checked = STATS_ACTIVE_CATEGORIES.includes(cat);
        return `
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 13px; color: var(--text-primary); transition: opacity 0.2s; opacity: ${checked ? 1 : 0.4};">
                <input type="checkbox" value="${cat}" ${checked ? "checked" : ""} onchange="handleStatsCategoryToggle(this)" style="accent-color: var(--accent-purple); cursor: pointer;">
                ${cat}
            </label>
        `;
    }).join('');

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer stats-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Profile Settings</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 20px; width: 100%;">
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px; position: relative; width:100%;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Select profile</label>
                <div class="custom-select-wrapper" id="stats-player-wrapper" style="position: relative; width: 100%;">
                    <div class="custom-select-trigger" onclick="toggleStatsDropdown()" style="background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; font-size: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <span id="stats-player-selected-text">Indlæser...</span><i class="fa-solid fa-chevron-down" style="font-size: 12px; color: var(--text-muted);"></i>
                    </div>
                    <div class="custom-options-list" id="stats-player-options" style="display: none; position: absolute; top: 105%; left: 0; right: 0; background: #07030c; border: 1px solid var(--accent-purple); border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 120;">
                        <div style="position: sticky; top: 0; background: #07030c; padding: 8px; border-bottom: 1px solid var(--border-color); z-index: 130;"><input type="text" id="stats-player-search" oninput="filterStatsPlayerList()" placeholder="Search..." style="width: 100%; background: rgba(20, 13, 33, 0.85); color: var(--text-primary); border: 1px solid var(--border-color); padding: 8px 10px; border-radius: 4px; font-size: 13px; outline: none;" onclick="event.stopPropagation();"></div>
                        <div id="stats-player-items-container"></div>
                    </div>
                </div>
            </div>
            <div class="filter-group" style="display: flex; flex-direction: column; gap: 6px;">
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Select Categories</label>
                <div style="background: #07030c; border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 12px;">
                    ${checkboxesHTML}
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(drawerDiv);
}

// ==========================================================================
// PER 90 - STATS.JS - DEL 3 AF 4 (DATA LOGIK & API FEED BINDINGS)
// ==========================================================================

function handleStatsCategoryToggle(checkbox) {
    const cat = checkbox.value;
    if (checkbox.checked) {
        if (!STATS_ACTIVE_CATEGORIES.includes(cat)) STATS_ACTIVE_CATEGORIES.push(cat);
    } else {
        if (STATS_ACTIVE_CATEGORIES.length > 1) {
            STATS_ACTIVE_CATEGORIES = STATS_ACTIVE_CATEGORIES.filter(c => c !== cat);
        } else { checkbox.checked = true; return; }
    }
    checkbox.parentElement.style.opacity = checkbox.checked ? '1' : '0.4';
    renderStatsActiveBlocks();
}

async function initCustomStatsSelectors() {
    const gammelDrawer = document.querySelector('.stats-filter-drawer');
    if (gammelDrawer) gammelDrawer.remove();
    buildAndAppendStatsDrawerHTML();
    try {
        const players = await fetch(`${API_BASE_URL}/api/pizza/players`).then(r => r.json());
        // Find denne sektion inde i din initCustomStatsSelectors() i stats.js (Del 3 af 4):
        if (players.length > 0 && $s("stats-player-items-container")) {
            STATS_CURRENT_PLAYER = players[0];
            $s("stats-player-selected-text").innerText = STATS_CURRENT_PLAYER;
            
            // 🎯 FIXET: Skråstregen foran dollar-tegnet er fjernet helt, så spillernavnene looper perfekt!
            $s("stats-player-items-container").innerHTML = players.map(p => `<div class="custom-option-item ${p === STATS_CURRENT_PLAYER ? 'selected-active' : ''}" onclick="selectStatsPlayer('${p.replace(/'/g, "\\\\'")}')">${p}</div>`).join('');
            
            await onStatsFilterChange();
        }

    } catch (e) { console.error("Fejl under indlæsning af spillere:", e); }
}

// 🎯 GLOBAL CACHE & TIMERS (Låser elementerne og forhindrer unødvendige opdateringer)
let STATS_CACHED_PLAYER_ITEMS = null;
let STATS_SEARCH_DEBOUNCE_TIMER = null;

function toggleStatsDropdown() {
    const p = $s("stats-player-options"); 
    if (!p) return;
    
    const isOpening = p.style.display === "none" || p.style.display === "";
    p.style.display = isOpening ? "block" : "none";
    
    if (isOpening) {
        if ($s("stats-player-search")) {
            $s("stats-player-search").value = "";
        }
        
        // Cache listen i hukommelsen
        STATS_CACHED_PLAYER_ITEMS = document.querySelectorAll("#stats-player-items-container .custom-option-item");
        
        // 🚀 Begræns synligheden til kun de første 30 spillere ved åbning, så browseren ikke overvældes
        for (let i = 0; i < STATS_CACHED_PLAYER_ITEMS.length; i++) {
            STATS_CACHED_PLAYER_ITEMS[i].style.display = i < 30 ? "block" : "none";
        }
        
        setTimeout(() => $s("stats-player-search")?.focus(), 50);
    }
}

function filterStatsPlayerList() {
    // ⏱️ DEBOUNCE: Nulstil timeren hvis brugeren stadig taster
    clearTimeout(STATS_SEARCH_DEBOUNCE_TIMER);

    // Vent 150 millisekunder efter sidste tastetryk før vi overhovedet rører layoutet
    STATS_SEARCH_DEBOUNCE_TIMER = setTimeout(() => {
        const filter = $s("stats-player-search")?.value.toLowerCase(); 
        if (filter === undefined) return;
        
        if (!STATS_CACHED_PLAYER_ITEMS) {
            STATS_CACHED_PLAYER_ITEMS = document.querySelectorAll("#stats-player-items-container .custom-option-item");
        }
        
        let matchesFound = 0;
        
        // 🚀 SMART SYNLIGHEDS-LOOP
        for (let i = 0; i < STATS_CACHED_PLAYER_ITEMS.length; i++) {
            const item = STATS_CACHED_PLAYER_ITEMS[i];
            
            // Hvis feltet er tomt, vis kun de første 30
            if (filter === "") {
                item.style.display = i < 30 ? "block" : "none";
            } else {
                // Hvis der søges, tjek om teksten matcher, og om vi har fundet færre end 30 hits
                if (item.innerText.toLowerCase().includes(filter) && matchesFound < 30) {
                    item.style.display = "block";
                    matchesFound++; // Stop med at tegne flere elementer når vi rammer 30
                } else {
                    item.style.display = "none";
                }
            }
        }
    }, 150); // 150ms forsinkelse er usynligt for øjet, men redder browserens ydeevne fuldstændig!
}

async function selectStatsPlayer(val) {
    STATS_CURRENT_PLAYER = val; 
    $s("stats-player-selected-text").innerText = val;
    if ($s("stats-player-options")) $s("stats-player-options").style.display = "none";
    await onStatsFilterChange();
}

async function onStatsFilterChange() {
    if (!STATS_CURRENT_PLAYER) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/player-stats?player=${encodeURIComponent(STATS_CURRENT_PLAYER)}`);
        if (res.ok) {
            STATS_GLOBAL_PAYLOAD = await res.json();
            renderStatsPlayerHeaderCard(STATS_GLOBAL_PAYLOAD);
            renderStatsActiveBlocks();
        }
    } catch (e) { console.error("Fejl under hentning af profil-data:", e); }
}

// ==========================================================================
// PER 90 - STATS.JS - RETTET DEL 4A AF 4 (SYMMETRISK CORE LINING)
// ==========================================================================

function renderStatsPlayerHeaderCard(data) {
    const container = $s("stats-main-profile-card"); if (!container) return;
    
    // Gør positionen pluralis (f.eks. CB -> CBs)
    const posPlural = data.position ? `${data.position}s` : 'Peers';
    const dynamicSubtitle = `Percentile rank vs. ${data.league || 'League'} ${posPlural}`;

    container.innerHTML = `
        <div class="stats-profile-card">
            <div class="stats-p-left">
                <!-- 🎯 LØSNING: Vi flytter stregen og paddingen op på containeren, så både titel og undertitel liner op! -->
                <div class="stats-p-names" style="border-left: 4px solid var(--accent-purple); padding-left: 14px;">
                    <h1 class="stats-p-name" style="border-left: none; padding-left: 0;">${data.player_name}</h1>
                    <p class="stats-p-sub" style="margin-top: 6px;">${dynamicSubtitle}</p>
                </div>
            </div>
            <div class="stats-p-right" style="grid-template-columns: repeat(3, 115px) !important;">
                <div class="stats-meta-box"><div class="stats-meta-val" style="color:var(--accent-purple);">${data.team || 'N/A'}</div><div class="stats-meta-lbl">Club</div></div>
                <div class="stats-meta-box"><div class="stats-meta-val" style="color:var(--accent-purple);">${data.age || 0} Y/O</div><div class="stats-meta-lbl">Age</div></div>
                <div class="stats-meta-box"><div class="stats-meta-val" style="color:var(--accent-purple);">${data.mins_played || 0}</div><div class="stats-meta-lbl">Min.</div></div>
            </div>
        </div>
    `;
}




// 🎯 HENTER DE NYE 5 FARVER OG BADGES BASERET PÅ DINE PROCENTER PRECISE
function getStats5TierConfig(p) {
    if (p >= 85) return { text: "Elite", classSuffix: "elite" };
    if (p >= 65) return { text: "Above Avg", classSuffix: "good" };
    if (p >= 40) return { text: "Average", classSuffix: "avg" };
    if (p >= 20) return { text: "Below Avg", classSuffix: "concern" };
    return { text: "Poor", classSuffix: "poor" };
}
// ==========================================================================
// PER 90 - STATS.JS - DEL 4B AF 4 (DYNAMIC BLOCKS & CAPTURE EXPORT)
// ==========================================================================

function renderStatsActiveBlocks() {
    const grid = $s("stats-live-blocks-grid"); if (!grid || !STATS_GLOBAL_PAYLOAD) return;
    
    // Tvinger de aktive kategorier ud i dit nye, mørke side-om-side layout
    grid.innerHTML = Object.entries(STATS_GLOBAL_PAYLOAD.categories)
        .filter(([catName]) => STATS_ACTIVE_CATEGORIES.includes(catName))
        .map(([catName, metrics]) => {
            const metricsHTML = metrics.map(m => {
                const conf = getStats5TierConfig(m.percentile); 
                return `
                    <div class="stats-metric-item">
                        <div class="stats-m-lbl">${m.metric_name}</div>
                        <div class="stats-m-bar-bg">
                            <div class="stats-m-bar-fill fill-${conf.classSuffix}" style="width: ${m.percentile}%;"></div>
                        </div>
                        <div class="stats-m-info-row">
                            <div class="stats-m-val-text">${m.value.toFixed(2)}/90 <span>(${Math.round(m.percentile)}%)</span></div>
                            <div class="stats-status-badge badge-${conf.classSuffix}">${conf.text}</div>
                        </div>
                    </div>
                `;
            }).join('');
            return `<div class="stats-cat-block"><div class="stats-cat-title" style="color:var(--accent-purple); font-weight:900; letter-spacing:1.5px;">${catName}</div><div class="stats-metrics-grid">${metricsHTML}</div></div>`;
        }).join('');
}

// 🎯 CAPTURE MOTOR: Gemmer udelukkende datakortet med den rigtige mørkeblå baggrund, uden download-knapper!
function downloadPlayerStatsPNG() {
    const el = $s("stats-capture-target-area"); if (!el) return;
    html2canvas(el, { scale: 4, backgroundColor: "#0B1220", useCORS: true, logging: false }).then(canvas => {
        const link = document.createElement("a"); 
        link.download = `player_stats_${STATS_CURRENT_PLAYER.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL("image/png"); link.click();
    });
}

// Universel lukker til dropdown-menuer ved klik udenfor feltet
document.addEventListener("click", e => {
    if (!e.target.closest('#stats-player-wrapper')) { const p = $s("stats-player-options"); if(p) p.style.display = "none"; }
});
