// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 1 AF 10 (MASTER STATES & SELEKTOR-LOGIK)
// ==========================================================================

let EV_GLOBAL_DATA = null;       // Indeholder det rå JSON-objekt fra eventdata.py
let EV_ACTIVE_TAB = "passmap";   // Aktive diagramfane: 'passmap', 'player', 'team', 'xt', 'zonal'
let EV_SELECTED_PLAYER = "";     // Den valgte spiller under Player Events
let EV_SELECTED_TEAM = "";       // Det valgte hold under Team/xT/Zonal visninger

// Mappings-ordbog til filter-tjekbokse i dine hændelsestabs
const EV_METRIC_CONFIG = ["Touch", "Opp. Box Touch", "Goal", "Shot", "Assist", "Shot Assist", "Regular Pass", "Pass into Final ⅓", "Cross", "Long Pass", "Won Take-on", "Defensive Action"];
let EV_SELECTED_METRICS = ["Touch"]; // Standardvalg

// 🎯 UNIK ISOLERET SELEKTOR: Forhindrer sammenstød i det globale navnerum
const getEvEl = id => document.getElementById(id);
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 2 AF 10 (WHOSCORED DASHBOARD CSS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('ev-core-styles')) return;
    const style = document.createElement('style');
    style.id = 'ev-core-styles';
    style.innerHTML = `
        .ev-main-container { width: 100%; max-width: 820px; margin: 0 auto; padding: 0 15px; box-sizing: border-box; font-family: 'Gabarito', sans-serif; color: #e5e7eb; }
        .ev-pitch-box { width: 100%; max-width: 660px; aspect-ratio: 105 / 68; position: relative; overflow: visible; background: transparent; margin: 0 auto 10px auto; }
        .ev-pitch-box svg { width: 100%; height: 100%; overflow: visible; display: block; }
        .ev-pitch-line { stroke: rgba(255, 255, 255, 0.22); stroke-width: 1.5; fill: none; }
        .ev-markers-layer { position: absolute; inset: 0; pointer-events: none; z-index: 10; }
        
        /* Comet lines og pile til afleveringsmapping */
        .ev-pass-arrow { stroke-dasharray: 0; stroke-linecap: round; }
        
        /* Legend styling nederst på banen */
        .ev-legend-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 20px; width: 100%; margin-top: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #fff; }
        .ev-legend-item { display: flex; align-items: center; gap: 6px; }
        .ev-legend-marker { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 3 AF 10 (HTML-SKAL & TJEKBOKS-SKUFFE)
// ==========================================================================

function initEventDataView(container) {
    container.innerHTML = `
        <div class="ev-main-container">
            <!-- URL INPUT -->
            <div class="mr-search-box">
                <input type="text" id="ev-url-input" class="mr-input-field" placeholder="Indsæt WhoScored kamp-URL (f.srv. https://whoscored.com...)" value="https://www.whoscored.com/matches/1983584/live/england-premier-league-2026-2027-newcastle-bournemouth">
                <button class="mr-btn" onclick="fetchWhoScoredEventFeed()">Hent Telemetri <i class="fa-solid fa-circle-notch fa-spin" id="ev-spinner" style="display:none;"></i></button>
            </div>

            <!-- FANE BJÆLKE -->
            <div class="mr-tabs-nav" id="ev-tabs-bar" style="display:none;">
                <button class="mr-tab-item active" id="ev-tab-passmap" onclick="switchEventTab('passmap')">Passmap</button>
                <button class="mr-tab-item" id="ev-tab-player" onclick="switchEventTab('player')">Player Events</button>
                <button class="mr-tab-item" id="ev-tab-team" onclick="switchEventTab('team')">Team Events</button>
                <button class="mr-tab-item" id="ev-tab-xt" onclick="switchEventTab('xt')">xT via Passes</button>
                <button class="mr-tab-item" id="ev-tab-zonal" onclick="switchEventTab('zonal')">Zonal Control</button>
            </div>

            <!-- FILTER PANEL TIL METRIKKER -->
            <div id="ev-metric-filter-panel" style="display:none; flex-wrap:wrap; gap:10px; margin-bottom:20px; justify-content:center;"></div>

            <!-- CENTRAL TEGNE-FLADE -->
            <div class="mr-capture-card" id="ev-capture-target-area" style="display:none;"></div>
        </div>
    `;
    buildWhoScoredMetricFiltersHTML();
}

function buildWhoScoredMetricFiltersHTML() {
    const p = getEvEl("ev-metric-filter-panel"); if (!p) return;
    p.innerHTML = EV_METRIC_CONFIG.map(m => {
        const checked = EV_SELECTED_METRICS.includes(m);
        return `<label class="table-drawer-checkbox-label" style="opacity:${checked?1:0.4}; background:#0f172a; padding:6px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);"><input type="checkbox" value="${m}" ${checked?"checked":""} onchange="handleEvMetricToggle(this)" style="accent-color:#00F0FF; margin-right:6px;">${m}</label>`;
    }).join('');
}
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 4 AF 10 (API-SYNKRONISERING & MENU-TOGGLING)
// ==========================================================================

async function fetchWhoScoredEventFeed() {
    const urlInput = getEvEl("ev-url-input"); const spinner = getEvEl("ev-spinner");
    if (!urlInput || !urlInput.value.trim()) return;

    spinner.style.display = "inline-block";
    try {
        const res = await fetch(`${API_BASE_URL}/api/fetch-events?url=${encodeURIComponent(urlInput.value.trim())}`);
        if (res.ok) {
            EV_GLOBAL_DATA = await res.json();
            EV_SELECTED_TEAM = EV_GLOBAL_DATA.match_info.homeId;
            
            // Sæt den første spiller i rækken som standardvalg til Player Events
            const firstPId = Object.keys(EV_GLOBAL_DATA.players_map)[0];
            EV_SELECTED_PLAYER = firstPId || "";

            getEvEl("ev-tabs-bar").style.display = "flex";
            getEvEl("ev-capture-target-area").style.display = "flex";
            switchEventTab(EV_ACTIVE_TAB);
        } else {
            const err = await res.json(); alert(`Fejl: ${err.detail}`);
        }
    } catch (e) { console.error(e); alert("Fejl under indlæsning af WhoScored hændelser."); }
    finally { spinner.style.display = "none"; }
}

function switchEventTab(tabId) {
    EV_ACTIVE_TAB = tabId;
    document.querySelectorAll('.mr-tab-item').forEach(b => b.classList.remove('active'));
    getEvEl(`ev-tab-${tabId}`).classList.add('active');

    // Vis kun tjekbokse til valg af metrics på de faner, der understøtter det (Player/Team Events)
    getEvEl("ev-metric-filter-panel").style.display = (tabId === "player" || tabId === "team") ? "flex" : "none";
    renderActiveEventVisualization();
}

function handleEvMetricToggle(cb) {
    if (cb.checked) { if (!EV_SELECTED_METRICS.includes(cb.value)) EV_SELECTED_METRICS.push(cb.value); }
    else { EV_SELECTED_METRICS = EV_SELECTED_METRICS.filter(m => m !== cb.value); }
    buildWhoScoredMetricFiltersHTML();
    renderActiveEventVisualization();
}
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 5 AF 10 (RENDERTRANSFORMATION & FÆLLES HEADER)
// ==========================================================================

function renderActiveEventVisualization() {
    if (!EV_GLOBAL_DATA) return;
    if (EV_ACTIVE_TAB === "passmap") buildWhoScoredFig1Passmap();
    else if (EV_ACTIVE_TAB === "player") buildWhoScoredFig2PlayerEvents();
    else if (EV_ACTIVE_TAB === "team") buildWhoScoredFig3TeamEvents();
    else if (EV_ACTIVE_TAB === "xt") buildWhoScoredFig4XTHeatmap();
    else if (EV_ACTIVE_TAB === "zonal") buildWhoScoredFig5ZonalControl();
}

function generateWhoScoredHeaderHTML(titleText) {
    const info = EV_GLOBAL_DATA.match_info;
    return `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; text-align:center; margin-bottom:20px;">
            <div style="display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:12px;">
                <!-- 🎯 RETTET TIL info.homeLogo -->
                <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; padding:6px;"><img src="${info.homeLogo}" style="max-width:100%; max-height:100%; object-fit:contain;"></div>
                <span style="font-size:24px; font-weight:900; color:#fff; letter-spacing:1px;">${info.scoreStr}</span>
                <!-- 🎯 RETTET TIL info.awayLogo -->
                <div style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); display:flex; align-items:center; justify-content:center; padding:6px;"><img src="${info.awayLogo}" style="max-width:100%; max-height:100%; object-fit:contain;"></div>
            </div>
            <div style="font-size:12px; font-weight:800; text-transform:uppercase; color:#fff; letter-spacing:0.5px;">${titleText}</div>
            <div style="font-size:10px; font-weight:600; color:rgba(255,255,255,0.25); margin-top:4px;">Generated via per-90.streamlit.app | WhoScored Telemetry</div>
        </div>
    `;
}


function getMetricColorAndProps(metric) {
    const conf = {
        'Touch': { c: 'orange', m: 'circle' }, 'Opp. Box Touch': { c: '#00f0ff', m: 'circle' },
        'Goal': { c: '#47B745', m: 'star' }, 'Shot': { c: '#3498db', m: 'cross' },
        'Assist': { c: '#47B745', m: 'line' }, 'Shot Assist': { c: '#3498db', m: 'line' },
        'Regular Pass': { c: '#64748b', m: 'line' }, 'Pass into Final ⅓': { c: '#a855f7', m: 'line' },
        'Cross': { c: '#ff0055', m: 'line' }, 'Long Pass': { c: '#f59e0b', m: 'line' },
        'Won Take-on': { c: '#00ff78', m: 'square' }, 'Defensive Action': { c: '#ff4d4d', m: 'square' }
    };
    return conf[metric] || { c: '#fff', m: 'circle' };
}
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 6A AF 10 (FIG 1 – RETTET TIL BACKEND BASE64 LOGOER)
// ==========================================================================

function buildWhoScoredFig1Passmap() {
    const container = getEvEl("ev-capture-target-area");
    if (!EV_GLOBAL_DATA) return;

    const info = EV_GLOBAL_DATA.match_info;

    const subMinHome = info.homeFirstSubMin || 90;
    const subMinAway = info.awayFirstSubMin || 90;
    
    // 1. Filtrering og databehandling for HOME TEAM
    let homePasses = EV_GLOBAL_DATA.events.filter(e => e.teamId == info.homeId && e.type === "Pass" && e.success && !e.isSetPiece && e.minute < subMinHome);
    let homePlayerStats = {}, homeNetworkPairs = {};
    processPassmapData(homePasses, homePlayerStats, homeNetworkPairs);

    // 2. Filtrering og databehandling for AWAY TEAM
    let awayPasses = EV_GLOBAL_DATA.events.filter(e => e.teamId == info.awayId && e.type === "Pass" && e.success && !e.isSetPiece && e.minute < subMinAway);
    let awayPlayerStats = {}, awayNetworkPairs = {};
    processPassmapData(awayPasses, awayPlayerStats, awayNetworkPairs);

    // CSS Grid-styling der splitter containeren op i 2 lige store lodrette kolonner side om side
    container.innerHTML = `
        <div class="mr-capture-card" id="ev-capture-box" style="background:#0a0f1a; padding: 20px; border-radius: 12px; max-width: 820px; margin: 0 auto;">
            ${generateWhoScoredHeaderHTML("TEAM PASSMAPS BEFORE 1ST SUB")}
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; width: 100%; margin-top: 10px;">
                
                <!-- HOME TEAM COLUMN -->
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="font-size: 11px; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <!-- 🎯 RETTET: Læser nu holdets cachede Base64 logo direkte fra din python-backend -->
                        <img src="${info.homeLogo}" style="height: 18px; width: auto; object-fit: contain;">
                        ${info.homeName} (1' - ${subMinHome}')
                    </div>
                    <div class="ev-pitch-box" style="width: 100%; aspect-ratio: 68 / 105; position: relative;">
                        ${generateVerticalPitchSVG(homePlayerStats, homeNetworkPairs, info.homeColor, true)}
                    </div>
                </div>

                <!-- AWAY TEAM COLUMN -->
                <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="font-size: 11px; font-weight: 800; color: #fff; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                        <!-- 🎯 RETTET: Læser nu holdets cachede Base64 logo direkte fra din python-backend -->
                        <img src="${info.awayLogo}" style="height: 18px; width: auto; object-fit: contain;">
                        ${info.awayName} (1' - ${subMinAway}')
                    </div>
                    <div class="ev-pitch-box" style="width: 100%; aspect-ratio: 68 / 105; position: relative;">
                        ${generateVerticalPitchSVG(awayPlayerStats, awayNetworkPairs, info.awayColor, false)}
                    </div>
                </div>

            </div>

            <!-- FÆLLES TEKSTINFO OG xT-LEGENDE I BUNDEN -->
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 9px; color: rgba(255,255,255,0.5); font-weight: 600;">
                <div style="text-align: left; line-height: 1.4;">Circles are avg. pass locations<br>Lines are sized by pass frequency</div>
                
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; text-transform: uppercase; color: #fff;">
                    <span>Low xT</span>
                    <div style="width: 60px; height: 6px; background: linear-gradient(90deg, #1e293b, #00f0ff); border-radius: 3px;"></div>
                    <span>High xT</span>
                </div>

                <div style="text-align: right; line-height: 1.4;">Via per-90.streamlit.app<br>Data from WhoScored</div>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;">
            <button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('whoscored_passmap', 'ev-capture-box')">Download as PNG</button>
        </div>
    `;
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 6B (OPDATERET: ELEGANTE BUEDE KVALITETSKURVER)
// ==========================================================================

function generateVerticalPitchSVG(playerStats, networkPairs, teamColor, isHome) {
    let linesSVG = "";
    let nodesHTML = "";
    
    const minPassThreshold = 2; 
    let maxPairCount = Math.max(...Object.values(networkPairs), 1);

    // 1. GENERER RETNINGSBESTEMTE, BUEDE KURVER (BÉZIER-PATHWAYS)
    for (const [pairKey, count] of Object.entries(networkPairs)) {
        if (count < minPassThreshold) continue;
        const [fromId, toId] = pairKey.split("->");
        const p1 = playerStats[fromId];
        const p2 = playerStats[toId];

        if (p1 && p2 && EV_GLOBAL_DATA.players_map[fromId]?.isFirstEleven && EV_GLOBAL_DATA.players_map[toId]?.isFirstEleven) {
            let x1 = 100 - (p1.ySum / p1.count);
            let x2 = 100 - (p2.ySum / p2.count);
            let y1 = 100 - (p1.xSum / p1.count);
            let y2 = 100 - (p2.xSum / p2.count);

            // Tykkelse og opacitet skalerer stadig flot efter frekvens
            let weight = 0.4 + (count / maxPairCount) * 1.8;
            let opacity = 0.08 + (count / maxPairCount) * 0.62;

            // 🎯 BEREGN ET KONTOLPUNKT (MIDTPUNKT + FORSKYDNING) TIL AT SKABE BUEN
            // Midtpunktet mellem de to spillere
            let midX = (x1 + x2) / 2;
            let midY = (y1 + y2) / 2;

            // Beregn vektoren for linjen
            let dx = x2 - x1;
            let dy = y2 - y1;

            // Find normalen til linjen og forskyd kontrolpunktet let til siden (0.12 = bue-intensitet)
            // Dette sikrer, at kurven altid buer let med uret, hvilket viser retningen på spillet!
            let cx = midX - dy * 0.12;
            let cy = midY + dx * 0.12;

            // Q (Quadratic Bézier) tegner en smuk, glat kurve fra (x1,y1) via kontrolpunktet (cx,cy) til (x2,y2)
            linesSVG += `
                <path d="M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}" 
                      fill="none" 
                      stroke="rgba(238, 237, 224, ${opacity.toFixed(2)})" 
                      stroke-width="${weight.toFixed(2)}" 
                      stroke-linecap="round" />
            `;
        }
    }

    // 2. GENERER SPILLER-CIRKLER (NODER)
    for (const [pId, p] of Object.entries(playerStats)) {
        let meta = EV_GLOBAL_DATA.players_map[pId] || { name: "Player", shirtNo: "" };
        if (!meta.isFirstEleven) continue;

        let avgX = p.xSum / p.count; 
        let avgY = p.ySum / p.count;
        
        let leftPercent = 100 - avgY;
        let topPercent = 100 - avgX;

        let initials = meta.name.split(' ').map(n => n).join('').substring(0,2).toUpperCase();
        let size = 24 + Math.min(12, p.xtSum * 45); 

        nodesHTML += `
            <div class="mr-shot-dot" style="left:${leftPercent}%; top:${topPercent}%; width:${size}px; height:${size}px; background:#0a0f1a; border:2.5px solid ${teamColor}; color:#fff; font-size: 9.5px; font-weight:900; line-height:${size-5}px; transform: translate(-50%, -50%); position: absolute; box-shadow: 0 4px 12px rgba(0,0,0,0.9); border-radius: 50%; display: flex; align-items: center; justify-content: center; z-index: 20;">
                ${initials}
            </div>
        `;
    }

    // 3. LODRET BANE OVERFLADE
    return `
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block; z-index: 1;">
            <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <circle cx="50" cy="50" r="12.5" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <circle cx="50" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" />
            
            <rect x="21.1" y="83.0" width="57.8" height="17.0" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <rect x="36.8" y="94.2" width="26.4" height="5.8" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <circle cx="50" cy="88.5" r="0.4" fill="rgba(255,255,255,0.3)" />
            <path d="M 40.0,83.0 A 6.5,6.5 0 0,1 60.0,83.0" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />

            <rect x="21.1" y="0.0" width="57.8" height="17.0" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <rect x="36.8" y="0.0" width="26.4" height="5.8" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            <circle cx="50" cy="11.5" r="0.4" fill="rgba(255,255,255,0.3)" />
            <path d="M 40.0,17.0 A 6.5,6.5 0 0,0 60.0,17.0" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="0.4" />
            
            <!-- DE ELEGANTE BUEDE STREGER LANDER HER -->
            <g>${linesSVG}</g>
        </svg>
        
        <div class="ev-markers-layer" style="position: absolute; inset: 0; pointer-events: none; z-index: 10;">
            ${nodesHTML}
        </div>
    `;
}



// ==========================================================================
// PER 90 - EVENTDATA.JS - OPPDATERET DATAPROCESSERING (SEKVENTIEL FEED LINK)
// ==========================================================================

function processPassmapData(passesArray, playerStats, networkPairs) {
    // 1. Først beregner vi gennemsnitspositioner og akkumuleret xT for hver enkelt afsender
    passesArray.forEach(p => {
        if (!playerStats[p.playerId]) playerStats[p.playerId] = { xSum: 0, ySum: 0, count: 0, xtSum: 0 };
        playerStats[p.playerId].xSum += p.x;
        playerStats[p.playerId].ySum += p.y;
        playerStats[p.playerId].count++;
        playerStats[p.playerId].xtSum += (p.xtDiff || 0);
    });

    // 2. Dernæst løber vi kronologisk igennem arrayet (ligesom din for-løkke i Python) 
    // for at bygge netværksforbindelser mellem spiller (i) og modtager (i + 1)
    for (let i = 0; i < passesArray.length - 1; i++) {
        const passer = passesArray[i].playerId;
        const receiver = passesArray[i + 1].playerId;

        // Vi linker dem kun sammen, hvis det er to forskellige spillere
        if (passer && receiver && passer !== receiver) {
            const pairKey = `${passer}->${receiver}`;
            networkPairs[pairKey] = (networkPairs[pairKey] || 0) + 1;
        }
    }
}
// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 7A AF 10 (PLAYER EVENTS - REPLICA MASTER HEADER)
// ==========================================================================

function buildWhoScoredFig2PlayerEvents() {
    const container = getEvEl("ev-capture-target-area");
    if (!EV_GLOBAL_DATA) return;

    const info = EV_GLOBAL_DATA.match_info;
    
    // Generer dropdown-listen over alle spillere på holdet
    const pList = Object.entries(EV_GLOBAL_DATA.players_map)
        .map(([id, p]) => `<option value="${id}" ${id == EV_SELECTED_PLAYER ? 'selected' : ''}>${p.name} (${p.position})</option>`).join('');
        
    let dropdownHTML = `
        <div style="margin-bottom:20px; display: flex; justify-content: center;">
            <select class="table-drawer-select" style="max-width:350px; background:#1e293b; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:8px 12px; border-radius:6px; font-weight:600;" onchange="EV_SELECTED_PLAYER=this.value; buildWhoScoredFig2PlayerEvents();">
                ${pList}
            </select>
        </div>
    `;
    
    let markersHTML = "", arrowsSVG = "", gradientDefs = "", counts = {};
    EV_SELECTED_METRICS.forEach(m => counts[m] = 0);

    // Henter data og kiler fra beregningsmotoren (Del 7B)
    const loopResult = processPlayerEventsGraphics(counts);
    markersHTML = loopResult.markersHTML;
    arrowsSVG = loopResult.arrowsSVG;
    gradientDefs = loopResult.gradientDefs;

    let legendHTML = '<div class="ev-legend-grid" style="justify-content:flex-end; padding-right:15px;">' + 
        EV_SELECTED_METRICS.map(m => `<div class="ev-legend-item" style="font-size:11px; color:#cbd5e1;"><span class="ev-legend-marker" style="background:${getMetricColorAndProps(m).c}; width:10px; height:10px;"></span>— ${counts[m]}x ${m}</div>`).join('') + '</div>';
    
    const playerName = EV_GLOBAL_DATA.players_map[EV_SELECTED_PLAYER]?.name.toUpperCase() || "PLAYER";

    container.innerHTML = `
        ${dropdownHTML}
        <div class="mr-capture-card" id="ev-player-events-capture" style="background:#0a0f1a; padding:25px; border-radius:12px; width:100%; max-width:820px; margin:0 auto; box-sizing:border-box; font-family: sans-serif;">
            
            <!-- 🎯 MASTER HEADER REPLICA: Samme struktur som dit godkendte passmap -->
            ${generateWhoScoredHeaderHTML(`PLAYER EVENTS – ${playerName}`)}
            
            <div class="ev-pitch-box" style="width:100%; max-width:660px; aspect-ratio:105/68; position:relative; margin:0 auto;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                    <defs>${gradientDefs}</defs>
                    
                    <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                    <ellipse cx="50" cy="50" rx="8.7" ry="13.5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                    <circle cx="50" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" />
                    
                    <rect x="0" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" /><rect x="0" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" /><circle cx="11.5" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" /><path d="M 17,43.5 A 4.5,6.5 0 0,1 17,56.5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                    <rect x="83" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" /><rect x="94.2" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" /><circle cx="88.5" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" /><path d="M 83,43.5 A 4.5,6.5 0 0,0 83,56.5" fill="none" stroke="rgba(255, 255, 255, 0.18)" stroke-width="0.4" />
                    
                    <g>${arrowsSVG}</g>
                </svg>
                <div class="ev-markers-layer" style="position:absolute; inset:0; pointer-events:none;">${markersHTML}</div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:660px; margin:20px auto 0 auto;">
                <div style="display:flex; flex-direction:column; color:rgba(255,255,255,0.6); font-weight:700; font-size:10px;">
                    <span style="font-size:9px; text-transform:uppercase;">Attacking Direction</span>
                    <span style="font-size:14px; letter-spacing:-2px; color:rgba(255,255,255,0.4);">≫≫≫≫≫≫</span>
                </div>
                ${legendHTML}
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" onclick="triggerMatchReportDownload('whoscored_player_events', 'ev-player-events-capture')">Download as PNG</button></div>
    `;
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 7B AF 10 (OPDATERET: TYNDERE KILER & RENE CIRKLER)
// ==========================================================================

function processPlayerEventsGraphics(counts) {
    let markersHTML = "";
    let arrowsSVG = "";
    let gradientDefs = "";
    let idx = 0;

    EV_GLOBAL_DATA.events.filter(e => e.playerId === EV_SELECTED_PLAYER).forEach(e => {
        let cats = [];
        if (e.type === "Pass") cats.push(e.xtDiff > 0.05 ? "Pass into Final ⅓" : (e.isSetPiece ? "Long Pass" : "Regular Pass"));
        if (e.isTouch) cats.push(e.x > 83.0 && e.y > 21.1 && e.y < 78.9 ? "Opp. Box Touch" : "Touch");
        if (["Tackle", "Interception", "Clearance"].includes(e.type)) cats.push("Defensive Action");

        cats.forEach(cat => {
            if (!EV_SELECTED_METRICS.includes(cat)) return;
            counts[cat]++;
            const props = getMetricColorAndProps(cat);
            
            let flipY = 100 - e.y;
            let flipEndY = 100 - e.endY;
            
            if (props.m === "line" && e.endX !== null) {
                idx++;
                const gradId = `comet-grad-${idx}`;
                
                gradientDefs += `
                    <linearGradient id="${gradId}" x1="${e.x}%" y1="${flipY}%" x2="${e.endX}%" y2="${flipEndY}%" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="${props.c}" stop-opacity="0.00" />
                        <stop offset="65%" stop-color="${props.c}" stop-opacity="0.50" />
                        <stop offset="100%" stop-color="${props.c}" stop-opacity="0.95" />
                    </linearGradient>
                `;

                let dx = e.endX - e.x;
                let dy = flipEndY - flipY;
                let len = Math.sqrt(dx * dx + dy * dy) || 1;
                
                let nx = -dy / len;
                let ny = dx / len;
                
                // 🎯 RECONFIGURERET TYKKELSE: WEnd er justeret ned til 0.42 for et mere strømlinet udtryk
                let wStart = 0.03;
                let wEnd = 0.42;
                
                let xStartLeft = e.x + nx * wStart;
                let yStartLeft = flipY + ny * wStart;
                let xStartRight = e.x - nx * wStart;
                let yStartRight = flipY - ny * wStart;
                
                let xEndLeft = e.endX + nx * wEnd;
                let yEndLeft = flipEndY + ny * wEnd;
                let xEndRight = e.endX - nx * wEnd;
                let yEndRight = flipEndY - ny * wEnd;

                // 🎯 RENDERINGSLAG: Solid mørk baggrundscirkel skjuler nu kilen perfekt
                arrowsSVG += `
                    <!-- Det ekspanderende kile-polygon -->
                    <path d="M ${xStartLeft} ${yStartLeft} L ${xEndLeft} ${yEndLeft} L ${xEndRight} ${yEndRight} L ${xStartRight} ${yStartRight} Z" 
                          fill="url(#${gradId})" />
                          
                    <!-- Solid maskering med banens baggrundsfarve (#0a0f1a) -->
                    <circle cx="${e.endX}" cy="${flipEndY}" r="0.75" fill="#0a0f1a" opacity="1" />
                          
                    <!-- Den åbne farvede modtager-ring helt i front -->
                    <circle cx="${e.endX}" cy="${flipEndY}" r="0.75" fill="none" stroke="${props.c}" stroke-width="0.22" opacity="0.95" />
                `;
            } else if (props.m === "circle" || props.m === "square") {
                markersHTML += `<div style="left:${e.x}%; top:${flipY}%; width:11px; height:11px; background:${props.c}; border:1.5px solid #fff; box-shadow:0 0 6px ${props.c}; position:absolute; transform:translate(-50%,-50%); border-radius:50%;"></div>`;
            }
        });
    });

    return { markersHTML, arrowsSVG, gradientDefs };
}



// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 7C AF 10 (TEAM EVENTS - REPLICA MASTER HEADER)
// ==========================================================================

function buildWhoScoredFig3TeamEvents() {
    const container = getEvEl("ev-capture-target-area");
    if (!EV_GLOBAL_DATA) return;

    const info = EV_GLOBAL_DATA.match_info;
    
    // Holdvælger-knapper i toppen
    let teamSelectHTML = `
        <div style="display:flex; gap:10px; margin-bottom:15px; justify-content:center;">
            <button class="mr-btn" style="background:${EV_SELECTED_TEAM == info.homeId ? '#00F0FF' : '#1e293b'}; color:${EV_SELECTED_TEAM == info.homeId ? '#000' : '#fff'}; font-weight:700;" onclick="EV_SELECTED_TEAM='${info.homeId}'; buildWhoScoredFig3TeamEvents();">${info.homeName}</button>
            <button class="mr-btn" style="background:${EV_SELECTED_TEAM == info.awayId ? '#FF0055' : '#1e293b'}; color:#fff; font-weight:700;" onclick="EV_SELECTED_TEAM='${info.awayId}'; buildWhoScoredFig3TeamEvents();">${info.awayName}</button>
        </div>
    `;
    
    let markersHTML = "", arrowsSVG = "", gradientDefs = "", counts = {};
    EV_SELECTED_METRICS.forEach(m => counts[m] = 0);

    // Kald holdets specifikke datamotor (Del 3B)
    const loopResult = processTeamEventsGraphics(counts);
    markersHTML = loopResult.markersHTML;
    arrowsSVG = loopResult.arrowsSVG;
    gradientDefs = loopResult.gradientDefs;

    let legendHTML = '<div class="ev-legend-grid" style="justify-content:flex-end; padding-right:15px;">' + 
        EV_SELECTED_METRICS.map(m => `<div class="ev-legend-item" style="font-size:11px; color:#cbd5e1;"><span class="ev-legend-marker" style="background:${getMetricColorAndProps(m).c}; width:10px; height:10px;"></span>— ${counts[m]}x ${m}</div>`).join('') + '</div>';
    
    const teamName = EV_SELECTED_TEAM == info.homeId ? info.homeName.toUpperCase() : info.awayName.toUpperCase();

    container.innerHTML = `
        ${teamSelectHTML}
        <div class="mr-capture-card" id="ev-team-events-capture" style="background:#0a0f1a; padding:25px; border-radius:12px; width:100%; max-width:820px; margin:0 auto; box-sizing:border-box; font-family: sans-serif;">
            
            <!-- 🎯 MASTER HEADER REPLICA: Nu fuldt synkroniseret med Base64-logoer -->
            ${generateWhoScoredHeaderHTML(`TEAM EVENTS – ${teamName}`)}
            
            <div class="ev-pitch-box" style="width:100%; max-width:660px; aspect-ratio:105/68; position:relative; margin:0 auto;">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                    <defs>${gradientDefs}</defs>
                    
                    <!-- Banens kridtstreger -->
                    <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                    <ellipse cx="50" cy="50" rx="8.7" ry="13.5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                    <circle cx="50" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" />
                    
                    <rect x="0" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" /><rect x="0" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" /><circle cx="11.5" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" /><path d="M 17,43.5 A 4.5,6.5 0 0,1 17,56.5" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" />
                    <rect x="83" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" /><rect x="94.2" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.4" /><circle cx="88.5" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" /><path d="M 83,43.5 A 4.5,6.5 0 0,0 83,56.5" fill="none" stroke="rgba(255, 255, 255, 0.18)" stroke-width="0.4" />
                    
                    <g>${arrowsSVG}</g>
                </svg>
                <div class="ev-markers-layer" style="position:absolute; inset:0; pointer-events:none;">${markersHTML}</div>
            </div>

            <!-- BUNDPANEL MED PILE -->
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:660px; margin:20px auto 0 auto;">
                <div style="display:flex; flex-direction:column; color:rgba(255,255,255,0.6); font-weight:700; font-size:10px;">
                    <span style="font-size:9px; text-transform:uppercase;">Attacking Direction</span>
                    <span style="font-size:14px; letter-spacing:-2px; color:rgba(255,255,255,0.4);">≫≫≫≫≫≫</span>
                </div>
                ${legendHTML}
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" onclick="triggerMatchReportDownload('whoscored_team_events', 'ev-team-events-capture')">Download as PNG</button></div>
    `;
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 7D AF 10 (MATEMATISK KILE-MOTOR TIL HOLD-EVENTS)
// ==========================================================================

function processTeamEventsGraphics(counts) {
    let markersHTML = "";
    let arrowsSVG = "";
    let gradientDefs = "";
    let idx = 0;

    // Filtrer kampens hændelser udelukkende for det valgte hold
    EV_GLOBAL_DATA.events.filter(e => e.teamId == EV_SELECTED_TEAM).forEach(e => {
        let cats = [];
        
        // 1. Tjek afleveringer
        if (e.type === "Pass") {
            cats.push(e.xtDiff > 0.05 ? "Pass into Final ⅓" : (e.isSetPiece ? "Long Pass" : "Regular Pass"));
        }
        
        // 2. Tjek Touches (Uafhængigt tjek - sikrer korrekte volumener for hele holdet)
        if (e.isTouch) {
            cats.push(e.x > 83.0 && e.y > 21.1 && e.y < 78.9 ? "Opp. Box Touch" : "Touch");
        }
        
        // 3. Tjek defensive aktioner
        if (["Tackle", "Interception", "Clearance"].includes(e.type)) {
            cats.push("Defensive Action");
        }

        cats.forEach(cat => {
            if (!EV_SELECTED_METRICS.includes(cat)) return;
            counts[cat]++;
            const props = getMetricColorAndProps(cat);
            
            // Korrekt Y-flipping for det liggende Opta-grid
            let flipY = 100 - e.y;
            let flipEndY = 100 - e.endY;
            
            if (props.m === "line" && e.endX !== null) {
                idx++;
                const gradId = `team-comet-grad-${idx}`;
                
                // INVERTERET GRADIENT: Fader fra gennemsigtig (0%) ved start til fuld farve (100%) ved slut
                gradientDefs += `
                    <linearGradient id="${gradId}" x1="${e.x}%" y1="${flipY}%" x2="${e.endX}%" y2="${flipEndY}%" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="${props.c}" stop-opacity="0.00" />
                        <stop offset="65%" stop-color="${props.c}" stop-opacity="0.50" />
                        <stop offset="100%" stop-color="${props.c}" stop-opacity="0.95" />
                    </linearGradient>
                `;

                let dx = e.endX - e.x;
                let dy = flipEndY - flipY;
                let len = Math.sqrt(dx * dx + dy * dy) || 1;
                
                let nx = -dy / len;
                let ny = dx / len;
                
                // Tykkelser i SVG enheder (Tynd 0.03 ved start, ekspanderer til 0.42 ved slut)
                let wStart = 0.03;
                let wEnd = 0.42;
                
                let xStartLeft = e.x + nx * wStart;
                let yStartLeft = flipY + ny * wStart;
                let xStartRight = e.x - nx * wStart;
                let yStartRight = flipY - ny * wStart;
                
                let xEndLeft = e.endX + nx * wEnd;
                let yEndLeft = flipEndY + ny * wEnd;
                let xEndRight = e.endX - nx * wEnd;
                let yEndRight = flipEndY - ny * wEnd;

                // Tegner holdets ekspanderende kile-stier og masker modtager-ringen
                arrowsSVG += `
                    <!-- Det ekspanderende kile-polygon -->
                    <path d="M ${xStartLeft} ${yStartLeft} L ${xEndLeft} ${yEndLeft} L ${xEndRight} ${yEndRight} L ${xStartRight} ${yStartRight} Z" 
                          fill="url(#${gradId})" />
                          
                    <!-- Solid maskering med banens baggrundsfarve (#0a0f1a) -->
                    <circle cx="${e.endX}" cy="${flipEndY}" r="0.75" fill="#0a0f1a" opacity="1" />
                          
                    <!-- Den åbne farvede modtager-ring helt i front -->
                    <circle cx="${e.endX}" cy="${flipEndY}" r="0.75" fill="none" stroke="${props.c}" stroke-width="0.22" opacity="0.95" />
                `;
            } else if (props.m === "circle" || props.m === "square") {
                // Store glødende cirkler til defensive aktioner og touches på holdniveau (11px)
                markersHTML += `<div style="left:${e.x}%; top:${flipY}%; width:11px; height:11px; background:${props.c}; border:1.5px solid #fff; box-shadow:0 0 6px ${props.c}; position:absolute; transform:translate(-50%,-50%); border-radius:50%;"></div>`;
            }
        });
    });

    return { markersHTML, arrowsSVG, gradientDefs };
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 9A AF 10 (6x5 xT BLOCK GRID - INTERFACE)
// ==========================================================================

// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 9A AF 10 (8x6 xT BLOCK GRID - REPLICA MASTER HEADER)
// ==========================================================================

function buildWhoScoredFig4XTHeatmap() {
    const container = getEvEl("ev-capture-target-area");
    if (!EV_GLOBAL_DATA) return;
    
    const info = EV_GLOBAL_DATA.match_info;
    const baseColor = EV_SELECTED_TEAM == info.homeId ? info.homeColor : info.awayColor;

    // Holdvælger-knapper i toppen
    let teamSelectHTML = `
        <div style="display:flex; gap:10px; margin-bottom:15px; justify-content:center;">
            <button class="mr-btn" style="background:${EV_SELECTED_TEAM == info.homeId ? '#00F0FF' : '#1e293b'}; color:${EV_SELECTED_TEAM == info.homeId ? '#000' : '#fff'}; font-weight:700;" onclick="EV_SELECTED_TEAM='${info.homeId}'; buildWhoScoredFig4XTHeatmap();">${info.homeName}</button>
            <button class="mr-btn" style="background:${EV_SELECTED_TEAM == info.awayId ? '#FF0055' : '#1e293b'}; color:#fff; font-weight:700;" onclick="EV_SELECTED_TEAM='${info.awayId}'; buildWhoScoredFig4XTHeatmap();">${info.awayName}</button>
        </div>
    `;

    // Filtrer holdets succesfulde xT-afleveringer
    let passes = EV_GLOBAL_DATA.events.filter(e => e.teamId == EV_SELECTED_TEAM && e.type === "Pass" && e.success && e.xtDiff > 0);

    // Kald den proportionelle 6x5 datamotor (Del 4B)
    const gridResult = processWhoScored6x5XTGrid(passes, baseColor);
    let gridBlocksHTML = gridResult.gridBlocksHTML;

    const teamName = EV_SELECTED_TEAM == info.homeId ? info.homeName.toUpperCase() : info.awayName.toUpperCase();

    container.innerHTML = `
        ${teamSelectHTML}
        <div class="mr-capture-card" id="ev-xt-capture" style="background:#0a0f1a; padding:25px; border-radius:12px; width:100%; max-width:820px; margin:0 auto; box-sizing:border-box; font-family: sans-serif;">
            
            <!-- 🎯 MASTER HEADER REPLICA: Nu fuldt synkroniseret med Base64-logoer og resultat -->
            ${generateWhoScoredHeaderHTML(`${teamName}'S EXPECTED THREAT VIA PASSES`)}
            
            <div class="ev-pitch-box" style="width:100%; max-width:660px; aspect-ratio:105 / 68; position:relative; margin:0 auto; background:#0b0813; overflow: hidden; border-radius: 4px; box-shadow: inset 0 0 30px rgba(0,0,0,0.8);">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block; position: relative;">
                    
                    <!-- LAYER A: DATA-GRID -->
                    <g id="ev-xt-6x5-grid-layer">${gridBlocksHTML}</g>

                    <!-- LAYER B: BANELINJERNE OVENPÅ -->
                    <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <ellipse cx="50" cy="50" rx="8.7" ry="13.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <circle cx="50" cy="50" r="0.4" fill="rgba(255,255,255,0.4)" />
                    
                    <rect x="0" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" /><rect x="0" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" /><circle cx="11.5" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" /><path d="M 17,43.5 A 4.5,6.5 0 0,1 17,56.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <rect x="83" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" /><rect x="94.2" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" /><circle cx="88.5" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" /><path d="M 83,43.5 A 4.5,6.5 0 0,0 83,56.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                </svg>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%; max-width:660px; margin:20px auto 0 auto; font-size:10px; font-weight:700; color:rgba(255,255,255,0.5);">
                <div style="text-align:left; text-transform:uppercase;">Attacking Direction<br><span style="font-size:14px; letter-spacing:-2px; color:rgba(255,255,255,0.4);">≫≫≫≫≫≫</span></div>
                <div style="display:flex; align-items:center; gap:8px; text-transform:uppercase;">
                    <span>Zero xT</span>
                    <div style="width:80px; height:6px; background:linear-gradient(90deg, #0c111e, ${baseColor}); border-radius:3px; border:0.5px solid rgba(255,255,255,0.1);"></div>
                    <span>Max Threat</span>
                </div>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" onclick="triggerMatchReportDownload('whoscored_xt_map', 'ev-xt-capture')">Download as PNG</button></div>
    `;
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 9B AF 10 (6x5 Taktisk Grid Data Engine)
// ==========================================================================

function processWhoScored6x5XTGrid(passes, teamColor) {
    // 🎯 OPRETTER EN STRØMLINET 6x5 REKTANGULÆR MATRIX (30 zoner totalt)
    let grid = Array(5).fill(0).map(() => Array(6).fill(0));
    let maxCellVal = 0.001;

    // Fordel afleveringernes xT-værdier i det nye 6x5-system
    passes.forEach(p => {
        let c = Math.min(5, Math.floor((p.x / 100) * 6));
        let r = Math.min(4, Math.floor((p.y / 100) * 5));
        grid[r][c] += p.xtDiff;
        if (grid[r][c] > maxCellVal) maxCellVal = grid[r][c];
    });

    let gridBlocksHTML = "";
    const baseDarkColor = "#0c111e"; // Den faste basisfarve

    // Gennemløb alle 30 rektangulære felter på banen
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 6; c++) {
            let val = grid[r][c];
            let factor = maxCellVal > 0 ? (val / maxCellVal) : 0;
            
            // 4-r klarer den lodrette Y-flipping, så top og bund passer til banens layout
            let flipRow = 4 - r;
            let xPos = (c / 6) * 100;
            let yPos = (flipRow / 5) * 100;
            let width = 100 / 6;
            let height = 100 / 5;

            if (factor === 0) {
                // Tomme zoner får den rene mørkeblå basisfarve med en solid dækning
                gridBlocksHTML += `
                    <rect x="${xPos}" y="${yPos}" width="${width}" height="${height}" 
                          fill="${baseDarkColor}" fill-opacity="0.95" 
                          stroke="rgba(0, 0, 0, 0.4)" stroke-width="0.3" />
                `;
            } else {
                // Aktive zoner blender basisfarven i bunden med holdets farve ovenpå
                gridBlocksHTML += `
                    <rect x="${xPos}" y="${yPos}" width="${width}" height="${height}" fill="${baseDarkColor}" fill-opacity="1" />
                    <rect x="${xPos}" y="${yPos}" width="${width}" height="${height}" 
                          fill="${teamColor}" fill-opacity="${(factor * 0.85).toFixed(3)}" 
                          stroke="rgba(0, 0, 0, 0.4)" stroke-width="0.3" />
                `;
            }
        }
    }

    return { gridBlocksHTML };
}

// ==========================================================================
// PER 90 - EVENTDATA.JS - DEL 10 AF 10 (FIG 5 – ZONAL CONTROL MATRIX - OPDATERET)
// ==========================================================================

function buildWhoScoredFig5ZonalControl() {
    const container = getEvEl("ev-capture-target-area");
    if (!EV_GLOBAL_DATA) return;

    const info = EV_GLOBAL_DATA.match_info;
    let touches = EV_GLOBAL_DATA.events.filter(e => e.isTouch);

    // 4x3 TERRITORIAL BANESPALTNING (12 ZONER)
    let homeGrid = Array(3).fill(0).map(() => Array(4).fill(0));
    let awayGrid = Array(3).fill(0).map(() => Array(4).fill(0));

    touches.forEach(t => {
        let c = Math.min(3, Math.floor((t.x / 100) * 4));
        let r = Math.min(2, Math.floor((t.y / 100) * 3));
        
        if (t.teamId == info.awayId) {
            c = Math.min(3, Math.floor(((100 - t.x) / 100) * 4));
            r = Math.min(2, Math.floor(((100 - t.y) / 100) * 3));
            awayGrid[r][c]++;
        } else {
            homeGrid[r][c]++;
        }
    });

    let zonesHTML = "";
    const baseDarkColor = "#0c111e"; // Basisfarven
    
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 4; c++) {
            let hCount = homeGrid[r][c]; 
            let aCount = awayGrid[r][c];
            let tot = hCount + aCount;
            
            let zoneColor = baseDarkColor; 
            let alpha = 0.95;
            
            if (tot > 0) {
                let share = hCount / tot;
                if (share > 0.55) { 
                    zoneColor = info.homeColor; 
                    alpha = 0.35; 
                } else if (share < 0.45) { 
                    zoneColor = info.awayColor; 
                    alpha = 0.35; 
                } else { 
                    zoneColor = baseDarkColor; 
                    alpha = 0.95; 
                }
            }

            let flipRow = 2 - r; 
            
            if (zoneColor !== baseDarkColor) {
                zonesHTML += `<rect x="${(c / 4) * 100}" y="${(flipRow / 3) * 100}" width="25" height="${100 / 3}" fill="${baseDarkColor}" fill-opacity="1" />`;
            }

            zonesHTML += `
                <rect x="${(c / 4) * 100}" y="${(flipRow / 3) * 100}" width="25" height="${100 / 3}" 
                      fill="${zoneColor}" fill-opacity="${alpha.toFixed(3)}" stroke="rgba(0,0,0,0.4)" stroke-width="0.3"/>
            `;
        }
    }

    const teamNameHome = info.homeName.toUpperCase();
    const teamNameAway = info.awayName.toUpperCase();

    container.innerHTML = `
        <div class="mr-capture-card" id="ev-zonal-capture" style="background:#0a0f1a; padding:25px; border-radius:12px; width:100%; max-width:820px; margin:0 auto; box-sizing:border-box; font-family: sans-serif;">
            
            <!-- 🎯 RETTET TOP: Scoren er fjernet, og titlen er gjort markant større (22px) -->
            <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:15px; color:#fff; text-align:center;">
                <div style="font-size:22px; font-weight:900; color:#fff; letter-spacing:0.8px; text-transform:uppercase;">ZONAL CONTROL BY TOUCHES</div>
                <div style="font-size:10px; font-weight:600; color:rgba(255,255,255,0.25); margin-top:5px;">Generated via per-90.streamlit.app | WhoScored Telemetry</div>
            </div>

            <!-- MIDTERSTE BANERAMME -->
            <div class="ev-pitch-box" style="width:100%; max-width:660px; aspect-ratio:105/68; position:relative; margin:0 auto; background:#0b0813; overflow: hidden; border-radius: 4px; box-shadow: inset 0 0 30px rgba(0,0,0,0.8);">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; display:block;">
                    <g id="ev-zonal-matrix-layer">${zonesHTML}</g>
                    <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <ellipse cx="50" cy="50" rx="8.7" ry="13.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <circle cx="50" cy="50" r="0.4" fill="rgba(255,255,255,0.4)" />
                    <rect x="0" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" /><rect x="0" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" /><circle cx="11.5" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" /><path d="M 17,43.5 A 4.5,6.5 0 0,1 17,56.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                    <rect x="83" y="21.1" width="17" height="57.8" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" /><rect x="94.2" y="36.8" width="5.8" height="26.4" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" /><circle cx="88.5" cy="50" r="0.4" fill="rgba(255,255,255,0.3)" /><path d="M 83,43.5 A 4.5,6.5 0 0,0 83,56.5" fill="none" stroke="rgba(255, 255, 255, 0.16)" stroke-width="0.38" />
                </svg>
            </div>
            
            <!-- BUNDPANEL: LOGOER OG RETNINGSPILE -->
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; max-width: 660px; margin: 25px auto 0 auto; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); font-family: sans-serif;">
                
                <!-- VENSTRE: Hjemmehold -->
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; padding:4px;">
                        <img src="${info.homeLogo}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    <div style="display: flex; flex-direction: column; line-height: 1.2;">
                        <span style="font-size: 11px; font-weight: 800; color: ${info.homeColor};">${teamNameHome}</span>
                        <span style="font-size: 14px; letter-spacing: -2px; color: rgba(255,255,255,0.3); margin-top: -2px;">≫≫≫≫</span>
                    </div>
                </div>

                <!-- 🎯 RETTET LOGO-BOX: Firkanten har nu fået en skarp, hvid kant (border: 1px solid #fff) -->
                <div style="display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">
                    <span style="background: ${baseDarkColor}; width: 10px; height: 10px; border-radius: 2px; border: 1px solid #fff; display: inline-block; box-sizing: border-box;"></span>
                    Contested Zone
                </div>

                <!-- HØJRE: Udehold -->
                <div style="display: flex; align-items: center; gap: 10px; flex-direction: row-reverse; text-align: right;">
                    <div style="width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; padding:4px;">
                        <img src="${info.awayLogo}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    <div style="display: flex; flex-direction: column; line-height: 1.2;">
                        <span style="font-size: 11px; font-weight: 800; color: ${info.awayColor};">${teamNameAway}</span>
                        <span style="font-size: 14px; letter-spacing: -2px; color: rgba(255,255,255,0.3); margin-top: -2px;">≪≪≪≪</span>
                    </div>
                </div>

            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" onclick="triggerMatchReportDownload('zonal_control', 'ev-zonal-capture')">Download as PNG</button></div>
    `;
}

