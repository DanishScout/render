// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 1 AF 4 (MASTER STATES & ISOLERET SELEKTOR)
// ==========================================================================

let MATCH_GLOBAL_DATA = null;       // Indeholder den komplette JSON-datapakke fra matchreport.py
let MATCH_ACTIVE_TAB = "stats";     // Aktiv visningsfane: 'stats', 'xg', 'momentum', 'performers', 'player'
let MATCH_SELECTED_PLAYER = null;   // Den nuværende valgte spiller i Fig 5 (Player Stats)

// 🎯 ISOLERET SELEKTOR-FUNKTION: Forhindrer 'already been declared' fejl permanent på tværs af appen!
const getMatchReportEl = id => document.getElementById(id);

// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 2 AF 4 (INTEGRERET CSS - DEL A)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // FORCE OVERRIDE: Vi fjerner det gamle style-tag, hvis det findes, så de nye centreringer slår fejlfrit igennem live
    const oldStyle = document.getElementById('match-report-core-styles');
    if (oldStyle) oldStyle.remove();

    const style = document.createElement('style');
    style.id = 'match-report-core-styles';
    style.innerHTML = `
        .mr-main-container { width: 100%; max-width: 820px; margin: 0 auto; padding: 0 15px; box-sizing: border-box; }
        
        /* 🔥 CENTRERINGS-FIX: Sørger for at indholdet (visualiseringerne) indeni altid står absolut midt på skærmen */
        .mr-scale-viewport { width: 100%; overflow: hidden; position: relative; display: flex; justify-content: center; align-items: flex-start; }
        
        .mr-search-box { background: linear-gradient(180deg, #0f172a 0%, #020617 100%); border: 1px solid rgba(255,255,255,0.04); border-radius: 16px; padding: 20px; margin-bottom: 20px; display: flex; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); box-sizing: border-box; width: 100%; }
        .mr-input-field { flex-grow: 1; background: #07030c; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px 16px; color: #fff; font-size: 14px; outline: none; }
        .mr-input-field:focus { border-color: var(--accent-purple); }
        .mr-btn { background: var(--accent-purple); color: #06140c; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
        
        /* 🔥 FULL WIDTH & SPREAD FIX: Fanelinjen fylder nu 100% og knapperne fordeler sig helt ligeligt ud over bredden */
        .mr-tabs-nav { display: flex; overflow-x: auto; gap: 6px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 10px; padding: 4px; margin-bottom: 25px; width: 100%; box-sizing: border-box; justify-content: space-between; }
        
        /* 🔥 TYDELIGERE FANE-TEKST OG HOVER: Givet en markant lysere nuance så den er letlæselig mod det grønne underlag */
        .mr-tab-item { flex: 1; text-align: center; padding: 10px 12px; font-size: 12.5px; font-weight: 800; color: rgba(255, 255, 255, 0.55); text-transform: uppercase; letter-spacing: 0.8px; border-radius: 7px; cursor: pointer; border: none; background: transparent; transition: all 0.15s; white-space: nowrap; }
        .mr-tab-item:hover { color: #ffffff; }
        .mr-tab-item.active { color: #fff; background: #1e293b; }
        
        /* 🔥 ABSOLUT CENTRERING: Kortet er låst til 680px og tvinges ind på midten af sin flex-parent */
        .mr-capture-card { position: relative; width: 680px; min-width: 680px; max-width: 680px; padding: 35px 25px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); background: radial-gradient(circle at top, #111A2E 0%, #070A13 100%); display: flex; flex-direction: column; align-items: center; box-shadow: 0 25px 60px rgba(0,0,0,0.4); box-sizing: border-box; transform-origin: top center; margin: 0 auto; }

        .mr-pitch-wrapper { width: 100%; max-width: 620px; aspect-ratio: 105 / 68; position: relative; overflow: visible; background: transparent; margin-bottom: 10px; }
        .mr-pitch-line { stroke: rgba(255, 255, 255, 0.12); stroke-width: 0.6; fill: none; }
        .mr-markers-layer { position: absolute; inset: 0; pointer-events: none; z-index: 10; }
        .mr-shot-dot { position: absolute; transform: translate(-50%, -50%); border-radius: 50%; border: 1px solid #040812; box-shadow: 0 3px 8px rgba(0,0,0,0.5); text-align: center; font-weight: 900; }
        .mr-shot-dot.own-goal { border: none; box-shadow: none; background: transparent !important; }
        .mr-stats-overlay { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 190px; padding: 14px; background: rgba(11, 18, 32, 0.88); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; display: flex; flex-direction: column; gap: 11px; z-index: 15; backdrop-filter: blur(4px); box-sizing: border-box; }
        .mr-stat-row { display: flex; flex-direction: column; gap: 4px; }
        .mr-stat-meta { display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; font-weight: 700; text-transform: uppercase; }
        .mr-stat-lbl { color: rgba(255,255,255,0.6); font-size: 8.5px; letter-spacing: 0.5px; font-weight: 800; text-align: center; flex-grow: 1; }
        .mr-bar-track { width: 100%; height: 3px; background: rgba(255,255,255,0.05); border-radius: 1.5px; display: flex; overflow: hidden; }
        .mr-graph-frame { display: flex; width: 100%; height: 340px; position: relative; }
        .mr-y-axis { position: relative; width: 90px; height: 100%; color: #475569; text-align: right; box-sizing: border-box; }
        .mr-y-axis span { position: absolute; right: 14px; transform: translateY(-50%); font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .mr-svg-canvas { flex-grow: 1; height: 100%; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); position: relative; }
        .mr-svg-canvas svg { width: 100%; height: 100%; overflow: visible; display: block; }
        .mr-x-row { display: flex; width: 100%; }
        .mr-x-axis { flex-grow: 1; display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569; padding-top: 14px; }
        .mr-x-axis span { width: 0; display: flex; justify-content: center; white-space: nowrap; }
        .mr-perf-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%; box-sizing: border-box; }
        .mr-perf-col { display: flex; flex-direction: column; gap: 22px; min-width: 0; }
        .mr-column-headline { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #ffffff; background: rgba(255, 255, 255, 0.04); padding: 6px 12px; clip-path: polygon(0 0, 90% 0, 100% 100%, 0% 100%); border-left: 3px solid #ff4d4d; margin-bottom: -6px; width: fit-content; }
        .mr-player-record-box { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 6px; background: rgba(255, 255, 255, 0.01); border: 1px solid rgba(255, 255, 255, 0.02); min-width: 0; }
        .mr-player-record-box.rank-1 { background: linear-gradient(135deg, rgba(255, 77, 77, 0.15) 0%, rgba(255, 77, 77, 0.03) 100%); border: 1px solid rgba(255, 77, 77, 0.3); transform: scale(1.01); }
        .mr-rank-num { font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.2); width: 10px; text-align: center; }
        .mr-rank-num.rank-1 { color: #ff4d4d; font-size: 12px; }
        .mr-mini-logo { width: 16px; height: 16px; object-fit: contain; }
        .mr-mini-name { flex-grow: 1; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mr-player-record-box.rank-1 .mr-mini-name { color: #ffffff; font-weight: 700; }
        .mr-mini-value { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.5); text-variant-numeric: tabular-nums; }
        .mr-mini-value.rank-1 { color: #ff4d4d; font-weight: 900; text-shadow: 0 0 15px rgba(255, 77, 77, 0.4); }
        .mr-player-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; width: 100%; margin-top: 20px; box-sizing: border-box; }
        .mr-player-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 14px; padding: 12px; min-width: 0; display: flex; flex-direction: column; }
        .mr-card-headline { font-size: 11px; font-weight: 900; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin-bottom: 20px; text-align: center; }
        .mr-metric-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 32px; min-height: 76px; }
        .mr-metric-row:last-child { margin-bottom: 0; }
        .mr-wave-box { width: 100%; height: 16px; margin-top: auto; }
        .mr-wave-box svg { width: 100%; height: 100%; }
        
        @media (max-width: 600px) {
            .mr-search-box { flex-direction: column; padding: 15px; gap: 10px; }
            .mr-btn { width: 100%; justify-content: center; }
        }
    `;
    document.head.appendChild(style);

    const applyMatchReportScale = () => {
        const cards = document.querySelectorAll('.mr-capture-card');
        cards.forEach(card => {
            const container = card.parentElement;
            if (!container) return;
            
            if (!container.classList.contains('mr-scale-viewport')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'mr-scale-viewport';
                container.insertBefore(wrapper, card);
                wrapper.appendChild(card);
                return;
            }
            
            const viewportWidth = container.getBoundingClientRect().width;
            const targetWidth = 680;
            
            if (viewportWidth < targetWidth && viewportWidth > 0) {
                const scaleFactor = viewportWidth / targetWidth;
                card.style.transform = `scale(${scaleFactor})`;
                const calculatedHeight = card.offsetHeight * scaleFactor;
                container.style.height = `${calculatedHeight}px`;
            } else {
                card.style.transform = 'none';
                container.style.height = 'auto';
            }
        });
    };

    window.addEventListener('resize', applyMatchReportScale);
    const observer = new MutationObserver(applyMatchReportScale);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(applyMatchReportScale, 150);
});

// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 3 AF 4 (DOWNLOAD-SANDBOX & INITIALISERING)
// ==========================================================================

function triggerMatchReportDownload(filename, elementId) {
    const originalEl = getMatchReportEl(elementId);
    if (!originalEl) return;

    // 1. Opretter den urokkelige PC-sandbox container i baggrunden (fastlåst til 820px bredde)
    const hiddenContainer = document.createElement("div");
    Object.assign(hiddenContainer.style, {
        position: "absolute", left: "-9999px", top: "-9999px",
        width: "820px", minWidth: "820px", maxWidth: "820px",
        height: "auto", overflow: "visible", boxSizing: "border-box"
    });

    // 2. Klon det originale element og tving det ind i PC-layout i sandkassen
    const clone = originalEl.cloneNode(true);
    clone.id = `${elementId}-download-clone`;
    
    Object.assign(clone.style, {
        width: "820px", minWidth: "820px", maxWidth: "820px",
        height: "auto", minHeight: "auto", maxHeight: "none",
        background: "#0B1220", boxSizing: "border-box",
        display: "flex", opacity: "1", transform: "none"
    });

    // Fjern spillervælger-dropdown'en fra download-billedet, hvis det er Fig 5
    const dropdownInClone = clone.querySelector("#mr-player-dropdown");
    if (dropdownInClone) {
        dropdownInClone.parentElement.remove();
    }

    // Tving Fig 4 til 3 kolonner i det downloadede billede
    const gridBoxInClone = clone.querySelector("#fig4-grid-box");
    if (gridBoxInClone) {
        gridBoxInClone.style.setProperty("grid-template-columns", "repeat(3, 1fr)", "important");
        gridBoxInClone.style.setProperty("gap", "20px", "important");
    }
    
    // Tving Fig 5 til 4 kolonner i det downloadede billede
    const playerGridInClone = clone.querySelector(".grid-container");
    if (playerGridInClone) {
        playerGridInClone.style.setProperty("grid-template-columns", "repeat(4, 1fr)", "important");
        playerGridInClone.style.setProperty("gap", "12px", "important");
    }

    // 3. Skyd det ind i DOM'en, affyr html2canvas, og ryd op bagefter
    hiddenContainer.appendChild(clone);
    document.body.appendChild(hiddenContainer);

    html2canvas(clone, { 
        scale: 3, 
        backgroundColor: "#0B1220", 
        useCORS: true,
        logging: false
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        document.body.removeChild(hiddenContainer);
    }).catch(err => {
        console.error("Download fejlede:", err);
        if (document.body.contains(hiddenContainer)) {
            document.body.removeChild(hiddenContainer);
        }
    });
}

function initMatchReportView(container) {
    container.innerHTML = `
        <div class="mr-main-container" style="padding-top: 10px;">
            <!-- 🎯 APPSYNKRONISERING: Sektions-header der matcher stilen fra table.js -->
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-file-invoice" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Match report</span>
            </div>

            <!-- URL SØGEBJÆLKE (Spinner fjernet fra knappen) -->
            <div class="mr-search-box">
                <input type="text" id="mr-url-input" class="mr-input-field" placeholder="Indsæt FotMob kamp-URL (f.eks. https://fotmob.com...)" value="https://www.fotmob.com/en-GB/matches/bodoglimt-vs-bayern-munchen/2qvz54#6106240">
                <button class="mr-btn" id="mr-submit-btn" onclick="fetchMatchReportFeed()">
                    <span id="mr-btn-text">Load data</span>
                </button>
            </div>

            <!-- FANE NAVIGATION (Bredde sat til 100% via CSS i Del 1) -->
            <div class="mr-tabs-nav" id="mr-tabs-bar" style="display:none;">
                <button class="mr-tab-item active" id="tab-btn-stats" onclick="switchMatchTab('stats')">Match Stats</button>
                <button class="mr-tab-item" id="tab-btn-xg" onclick="switchMatchTab('xg')">Accumulated xG</button>
                <button class="mr-tab-item" id="tab-btn-momentum" onclick="switchMatchTab('momentum')">Game State</button>
                <button class="mr-tab-item" id="tab-btn-performers" onclick="switchMatchTab('performers')">Top Performers</button>
                <button class="mr-tab-item" id="tab-btn-player" onclick="switchMatchTab('player')">Player Stats</button>
            </div>

            <!-- CENTRAL INFOGRAFIK VISNING OG SKALERINGS-VIEWPORT -->
            <div class="mr-scale-viewport" id="mr-display-viewport" style="display:block; width:100%;">
                <div id="mr-display-target-area" style="width:100%;">
                    <div id="mr-placeholder-msg" style="text-align:center; padding:80px 20px; color:rgba(255,255,255,0.4); font-size:14px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase;">
                        Press 'Load Data' to view the different visualizations
                    </div>
                </div>
            </div>
        </div>
    `;
}

function switchMatchTab(tabId) {
    MATCH_ACTIVE_TAB = tabId;
    document.querySelectorAll('.mr-tabs-nav .mr-tab-item').forEach(b => b.classList.remove('active'));
    const activeBtn = getMatchReportEl(`tab-btn-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    renderActiveMatchVisualization();
}
async function fetchMatchReportFeed() {
    const urlInput = getMatchReportEl("mr-url-input");
    const targetArea = getMatchReportEl("mr-display-target-area");
    
    if (!urlInput || !urlInput.value.trim()) return;

    targetArea.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:100px 20px; gap:16px; color:rgba(255,255,255,0.6); width:100%; box-sizing:border-box;">
            <style>
                @keyframes mrPerfectSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .mr-smooth-loader { animation: mrPerfectSpin 0.85s linear infinite; display: inline-block; line-height: 1; transform-origin: center center; }
            </style>
            <div style="width:42px; height:42px; display:flex; align-items:center; justify-content:center; box-sizing:border-box; overflow:visible;">
                <i class="fa-solid fa-circle-notch mr-smooth-loader" style="font-size: 42px; color: #2563eb; width:42px; height:42px; text-align:center;"></i>
            </div>
            <!-- 🔥 TEKST-FIX: Tvunget til ren, skarp hvid farve -->
            <span style="font-size: 16px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #ffffff; display:block; text-align:center; margin:0; padding:0;">Loading...</span>
        </div>
    `;

    try {
        const res = await fetch(`${API_BASE_URL}/api/fetch-match?url=${encodeURIComponent(urlInput.value.trim())}`);
        if (res.ok) {
            MATCH_GLOBAL_DATA = await res.json();
            getMatchReportEl("mr-tabs-bar").style.display = "flex";
            
            if (MATCH_GLOBAL_DATA.players && MATCH_GLOBAL_DATA.players.length > 0) {
                MATCH_SELECTED_PLAYER = Number(MATCH_GLOBAL_DATA.players[0].playerId);
            } else {
                MATCH_SELECTED_PLAYER = null;
            }
            
            await renderActiveMatchVisualization();
        } else {
            const err = await res.json();
            alert(`Fejl fra server: ${err.detail}`);
            resetLoadingState(targetArea);
        }
    } catch (e) {
        console.error("MatchReport API fejl:", e);
        alert("Kunne ikke kontakte kampscraper-motoren på din backend.");
        resetLoadingState(targetArea);
    }
}


async function renderActiveMatchVisualization() {
    if (!MATCH_GLOBAL_DATA) return;
    
    if (MATCH_ACTIVE_TAB === "stats") buildFig1MatchStats();
    else if (MATCH_ACTIVE_TAB === "xg") buildFig2AccumulatedXG();
    else if (MATCH_ACTIVE_TAB === "momentum") buildFig3GameState();
    else if (MATCH_ACTIVE_TAB === "performers") buildFig4TopPerformers();
    else if (MATCH_ACTIVE_TAB === "player") await buildFig5PlayerStats();
}

function resetLoadingState(targetArea) {
    targetArea.innerHTML = `
        <div id="mr-placeholder-msg" style="text-align:center; padding:80px 20px; color:rgba(255,255,255,0.4); font-size:14px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase;">
            Press 'Load Data' to view the different visualizations
        </div>
    `;
}


// Hjælpefunktion til at genskabe placeholderen, hvis fetchen fejler
function resetLoadingState(targetArea) {
    targetArea.innerHTML = `
        <div id="mr-placeholder-msg" style="text-align:center; padding:60px 20px; color:rgba(255,255,255,0.4); font-size:14px; font-weight:600; letter-spacing:0.5px;">
            Please enter a match URL and load the data above to view the analysis
        </div>
    `;
}


function renderActiveMatchVisualization() {
    if (!MATCH_GLOBAL_DATA) return;
    
    if (MATCH_ACTIVE_TAB === "stats") buildFig1MatchStats();
    else if (MATCH_ACTIVE_TAB === "xg") buildFig2AccumulatedXG();
    else if (MATCH_ACTIVE_TAB === "momentum") buildFig3GameState();
    else if (MATCH_ACTIVE_TAB === "performers") buildFig4TopPerformers();
    else if (MATCH_ACTIVE_TAB === "player") buildFig5PlayerStats();
}

// ==========================================================================
// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 5 AF 10 (FÆLLES SCOREBOARD & DOWNLOAD)
// ==========================================================================

function generateSharedHeaderHTML(subtitle) {
    const info = MATCH_GLOBAL_DATA.match_info;
    const scores = info.scoreStr.split('-');
    const homeGoals = scores[0] ? scores[0].trim() : "0";
    const awayGoals = scores[1] ? scores[1].trim() : "0";

    return `
        <div style="display:flex; flex-direction:column; align-items:center; width:100%; padding:0 24px 15px 24px; margin-bottom:25px; text-align:center;">
            <div style="display:flex; align-items:center; justify-content:center; gap:14px; width:100%;">
                <div style="display:flex; align-items:center; gap:12px; font-size:22px; font-weight:900; text-transform:uppercase; justify-content:flex-end; flex:1;">
                    <span style="color:${info.homeColor};">${info.homeName}</span>
                    <div style="width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; padding:5px;">
                        <!-- RETTELSE: Bruger nu den lokale Base64-streng fra din backend for hjemmeholdet -->
                        <img src="${info.homeLogoB64}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                </div>
                <div style="font-size:26px; font-weight:900; color:#fff; letter-spacing:1px; padding:0 10px;">${homeGoals} - ${awayGoals}</div>
                <div style="display:flex; align-items:center; gap:12px; font-size:22px; font-weight:900; text-transform:uppercase; justify-content:flex-start; flex:1;">
                    <div style="width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; padding:5px;">
                        <!-- RETTELSE: Bruger nu den lokale Base64-streng fra din backend for udeholdet -->
                        <img src="${info.awayLogoB64}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    <span style="color:${info.awayColor};">${info.awayName}</span>
                </div>
            </div>
            <div style="font-size:11px; font-weight:700; color:rgba(255,255,255,0.3); letter-spacing:1.2px; text-transform:uppercase; margin-top:8px;">${subtitle} via per-90.streamlit.app</div>
        </div>
    `;
}

function triggerMatchReportDownload(filename, elementId) {
    const originalEl = getMatchReportEl(elementId);
    if (!originalEl) return;

    // 1. Opretter en urokkelig PC-sandbox container i baggrunden (820px matcher dit dashboard max-width)
    const hiddenContainer = document.createElement("div");
    Object.assign(hiddenContainer.style, {
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: "820px",
        minWidth: "820px",
        maxWidth: "820px",
        height: "auto",
        overflow: "visible",
        boxSizing: "border-box"
    });

    // 2. Klon det originale element og nulstil responsive begrænsninger på klonen
    const clone = originalEl.cloneNode(true);
    clone.id = `${elementId}-download-clone`;
    
    Object.assign(clone.style, {
        width: "820px",
        minWidth: "820px",
        maxWidth: "820px",
        height: "auto",
        minHeight: "auto",
        maxHeight: "none",
        background: "#0B1220", // Sikrer ensartet mørk baggrund
        boxSizing: "border-box",
        display: "flex",
        opacity: "1"
    });

    // 🎯 SIKKERHEDS-FIX FOR DROPDOWNS: Hvis det er Fig 5, vil vi ikke have select-boksen med på billedet
    const dropdownInClone = clone.querySelector("#mr-player-dropdown");
    if (dropdownInClone) {
        dropdownInClone.parentElement.remove(); // Fjerner dropdown-bjælken fra download-billedet
    }

    // Specifikt fix for Fig 4 grid i PC-størrelse under download
    const gridBoxInClone = clone.querySelector("#fig4-grid-box");
    if (gridBoxInClone) {
        gridBoxInClone.style.setProperty("grid-template-columns", "repeat(3, 1fr)", "important");
        gridBoxInClone.style.setProperty("gap", "20px", "important");
    }
    
    // Specifikt fix for Fig 5 grid i PC-størrelse under download
    const playerGridInClone = clone.querySelector(".grid-container");
    if (playerGridInClone) {
        playerGridInClone.style.setProperty("grid-template-columns", "repeat(4, 1fr)", "important");
        playerGridInClone.style.setProperty("gap", "12px", "important");
    }

    // 3. Tilføj container og klon til DOM'en midlertidigt
    hiddenContainer.appendChild(clone);
    document.body.appendChild(hiddenContainer);

    // 4. Kør html2canvas på vores skjulte PC-klon
    html2canvas(clone, { 
        scale: 3, // Giver skyhøj og professionel printopløsning
        backgroundColor: "#0B1220", 
        useCORS: true,
        logging: false
    }).then(canvas => {
        const link = document.createElement("a");
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        // 5. Oprydning: Fjern sandboxen fra DOM'en igen med det samme
        document.body.removeChild(hiddenContainer);
    }).catch(err => {
        console.error("Download fejlede:", err);
        if (document.body.contains(hiddenContainer)) {
            document.body.removeChild(hiddenContainer);
        }
    });
}

// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 6 AF 10 (FIG 1 – MATCH STATS PITCH)
// ==========================================================================
// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 6 AF 10 (FIG 1 – MATCH STATS PITCH)
// ==========================================================================
function buildFig1MatchStats() {
    const container = getMatchReportEl("mr-display-target-area");
    const info = MATCH_GLOBAL_DATA.match_info;
    const homeColor = info.homeColor || '#ff4d4d';
    const awayColor = info.awayColor || '#eed202';

    // 1. Map skudmarkører til HTML-strenge
    const shotsHTML = MATCH_GLOBAL_DATA.shotmap.map(shot => {
        const is_og = !!shot.isOwnGoal;
        const effectiveTeam = is_og ? (shot.teamId == info.homeId ? info.awayId : info.homeId) : shot.teamId;
        
        const pctLeft = effectiveTeam == info.homeId ? (shot.x / 105) * 100 : 100 - ((shot.x / 105) * 100);
        const pctTop = effectiveTeam == info.homeId ? 100 - ((shot.y / 68) * 100) : (shot.y / 68) * 100;

        let color = "#C82929"; let content = "";
        if (is_og) { color = "#D1257E"; content = "&times;"; }
        else if (shot.eventType === "Goal") color = "#47B745";
        else if (shot.expectedGoalsOnTarget > 0) color = "#C8C329";

        const size = is_og ? 15 : Math.max(10, Math.min(48, Math.sqrt(shot.expectedGoals) * 30));

        return `<div class="mr-shot-dot" style="left:${pctLeft.toFixed(2)}%; top:${pctTop.toFixed(2)}%; width:${size}px; height:${size}px; background:${is_og ? 'transparent' : color}; color:${color}; line-height:${size-2}px; font-size:${parseInt(size*1.6)}px;">${content}</div>`;
    }).join('');

    // 2. Map dine 8 Streamlit-metrics til rækker
    const statMapping = [
        { apiKey: 'Expected goals (xG)', label: 'xG' },
        { apiKey: 'xG set play', label: 'SET PIECE xG' },
        { apiKey: 'xG on target (xGOT)', label: 'xGOT' },
        { apiKey: 'Total shots', label: 'SHOTS' },
        { apiKey: 'Corners', label: 'CORNERS' },
        { apiKey: 'Touches in opposition box', label: 'OPP. BOX TOUCHES' },
        { apiKey: 'Ball possession', label: 'POSSESSION (%)' },
        { apiKey: 'Duels won', label: 'DUELS WON' }
    ];

    const statsOverlayRows = statMapping.map(mapping => {
        const originalStat = MATCH_GLOBAL_DATA.team_stats.find(s => s.title === mapping.apiKey);
        if (!originalStat) return '';

        const hNum = parseFloat(originalStat.home.toString().replace('%', '').split('/')) || 0;
        const aNum = parseFloat(originalStat.away.toString().replace('%', '').split('/')) || 0;
        const hPct = (hNum + aNum) > 0 ? (hNum / (hNum + aNum)) * 100 : 50;

        // Elementerne samles centreret og tæt om midten med et naturligt gap
        return `
            <div class="mr-stat-row">
                <div class="mr-stat-meta" style="display: flex !important; justify-content: center !important; align-items: center !important; width: 100% !important; gap: 8px !important;">
                    <span style="color:${homeColor}; font-weight:900; font-size: 14px; line-height: 1; flex-shrink: 0;">${originalStat.home}</span>
                    <span class="mr-stat-lbl" style="font-size:9px; font-weight:800; color:rgba(255,255,255,0.7); text-align: center; white-space: nowrap;">${mapping.label}</span>
                    <span style="color:${awayColor}; font-weight:900; font-size: 14px; line-height: 1; flex-shrink: 0;">${originalStat.away}</span>
                </div>
                <div class="mr-bar-track" style="height:4px; background:rgba(255,255,255,0.08); border-radius:2px;">
                    <div style="width:${hPct}%; background:${homeColor}; height:100%;"></div>
                    <div style="width:${100 - hPct}%; background:${awayColor}; height:100%;"></div>
                </div>
            </div>`;
    }).join('');

    // 3. Render det samlede view med den strømlinede legende
    container.innerHTML = `
        <div class="mr-capture-card" id="fig1-capture">
            ${generateSharedHeaderHTML("Match Report")}
            
            <div class="mr-pitch-wrapper">
                <svg viewBox="0 0 105 68"><rect x="0" y="0" width="105" height="68" class="mr-pitch-line" /><line x1="52.5" y1="0" x2="52.5" y2="68" class="mr-pitch-line" /><circle cx="52.5" cy="34" r="9.15" class="mr-pitch-line" /><rect x="0" y="13.85" width="16.5" height="40.3" class="mr-pitch-line" /><rect x="0" y="24.85" width="5.5" height="18.3" class="mr-pitch-line" /><rect x="88.5" y="13.85" width="16.5" height="40.3" class="mr-pitch-line" /><rect x="99.5" y="24.85" width="5.5" height="18.3" class="mr-pitch-line" /></svg>
                <div class="mr-markers-layer">${shotsHTML}</div>
                <!-- 🎯 ULTRA-SLIM REPARATION: Sættes nu til 165px bredde, så den sidder knivskarpt på midten af banen -->
                <div class="mr-stats-overlay" style="width:165px; background:rgba(11, 18, 32, 0.85); padding:12px 10px; border-radius:12px;">${statsOverlayRows}</div>
            </div>

            <!-- LEGENDE -->
            <div style="width:100%; max-width:660px; display:flex; justify-content:space-between; align-items:center; margin-top:25px; padding:0 10px; color:rgba(255,255,255,0.5); font-size:10px; font-weight:800; letter-spacing:0.8px; text-transform:uppercase; box-sizing:border-box;">
                
                <!-- SKUD KATEGORIER -->
                <div style="display:grid; grid-template-columns:auto auto; gap:12px 24px;">
                    <div style="display:flex; align-items:center; gap:8px;"><div style="width:8px; height:8px; background:#47B745; border-radius:50%;"></div><span>Goal</span></div>
                    <div style="display:flex; align-items:center; gap:8px;"><div style="width:8px; height:8px; background:#C8C329; border-radius:50%;"></div><span>On Target</span></div>
                    <div style="display:flex; align-items:center; gap:8px;"><div style="width:8px; height:8px; display:flex; align-items:center; justify-content:center; font-size:12px; color:#D1257E; font-weight:900;">&times;</div><span>Own Goal</span></div>
                    <div style="display:flex; align-items:center; gap:8px;"><div style="width:8px; height:8px; background:#C82929; border-radius:50%;"></div><span>Off Target</span></div>
                </div>

                <!-- ANGREBSRETNING -->
                <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                    <span style="color:rgba(255,255,255,0.3); font-size:9px; letter-spacing:1px;">Attacking Direction</span>
                    <div style="display:flex; align-items:center;">
                        <!-- Udeholdets pil: Højre mod venstre -->
                        <div style="width:40px; height:2px; position:relative; background:${awayColor};">
                            <div style="position:absolute; left:0; top:-3px; border-top:4px solid transparent; border-bottom:4px solid transparent; border-right:6px solid ${awayColor};"></div>
                        </div>
                        
                        <!-- Lodret adskiller -->
                        <div style="width:1px; height:12px; background:rgba(255,255,255,0.15); margin:0 6px;"></div>
                        
                        <!-- Hjemmeholdets pil: Venstre mod højre -->
                        <div style="width:40px; height:2px; position:relative; background:${homeColor};">
                            <div style="position:absolute; right:0; top:-3px; border-top:4px solid transparent; border-bottom:4px solid transparent; border-left:6px solid ${homeColor};"></div>
                        </div>
                    </div>
                </div>

                <!-- xG STØRRELSER -->
                <div style="display:flex; align-items:center; gap:10px;">
                    <span>Low xG</span>
                    <div style="width:4px; height:4px; border:1px solid rgba(255,255,255,0.4); border-radius:50%;"></div>
                    <div style="width:10px; height:10px; border:1px solid rgba(255,255,255,0.4); border-radius:50%;"></div>
                    <div style="width:16px; height:16px; border:1px solid rgba(255,255,255,0.4); border-radius:50%;"></div>
                    <span>High xG</span>
                </div>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('match_report', 'fig1-capture')">Download as PNG</button></div>
    `;
}

// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 7 AF 10 (FIG 2 – ACCUMULATED xG TIMELINE)
// ==========================================================================

function buildFig2AccumulatedXG() {
    const container = getMatchReportEl("mr-display-target-area");
    const info = MATCH_GLOBAL_DATA.match_info;
    const homeColor = info.homeColor || '#ff4d4d';
    const awayColor = info.awayColor || '#eed202';

    // 1. Sorter og filtrer skuddata
    const hShots = MATCH_GLOBAL_DATA.shotmap.filter(s => s.teamId == info.homeId && !s.isOwnGoal).sort((a,b)=>a.min-b.min);
    const aShots = MATCH_GLOBAL_DATA.shotmap.filter(s => s.teamId == info.awayId && !s.isOwnGoal).sort((a,b)=>a.min-b.min);

    const maxMin = Math.max(90, ...MATCH_GLOBAL_DATA.shotmap.map(s=>s.min));
    const totXGHome = hShots.reduce((sum,s)=>sum+s.expectedGoals, 0);
    const totXGAway = aShots.reduce((sum,s)=>sum+s.expectedGoals, 0);
    
    let maxY = Math.max(1.0, Math.ceil(Math.max(totXGHome, totXGAway) * 2) / 2);
    if (maxY < Math.max(totXGHome, totXGAway)) maxY += 0.5;

    // Generer 5 Y-akse punkter (0.0 til maxY)
    const yTicks = Array.from({length: 5}, (_, i) => (maxY * (i / 4)));

    // Step-line generator til xG trappekurven
    const getPathData = (shots) => {
        let cur = 0; let pts = ["M 0,100"];
        shots.forEach(s => {
            pts.push(`L ${(s.min/maxMin)*100},${100-(cur/maxY)*100}`);
            cur += s.expectedGoals;
            pts.push(`L ${(s.min/maxMin)*100},${100-(cur/maxY)*100}`);
        });
        pts.push(`L 100,${100-(cur/maxY)*100}`);
        return { line: pts.join(" "), area: pts.join(" ") + " L 100,100 L 0,100 Z" };
    };

    const hPaths = getPathData(hShots);
    const aPaths = getPathData(aShots);

    // 2. Byg dæmpede gridlines (Vandrette + Lodrette kvarter-linjer)
    let svgGridLines = yTicks.map(t => `<line x1="0" y1="${100-(t/maxY)*100}" x2="100" y2="${100-(t/maxY)*100}" stroke="rgba(255,255,255,0.04)" stroke-width="0.5" />`).join('');
    svgGridLines += [15, 30, 45, 60, 75, 90].map(m => `<line x1="${(m/maxMin)*100}" y1="0" x2="${(m/maxMin)*100}" y2="100" stroke="rgba(255,255,255,0.03)" stroke-width="0.5" stroke-dasharray="2 2" />`).join('');

  
    const goalMarkersHTML = MATCH_GLOBAL_DATA.shotmap.filter(s => s.eventType === "Goal").map(g => {
        const isHome = (!!g.isOwnGoal ? (g.teamId != info.homeId) : (g.teamId == info.homeId));
        const cumulative = (isHome ? hShots : aShots).filter(s => s.min <= g.min).reduce((sum,s)=>sum+s.expectedGoals, 0);

        return `
            <div style="position:absolute; left:${(g.min/maxMin)*100}%; top:${100-(cumulative/maxY)*100}%; transform:translate(-50%, -50%); z-index:10; width:16px; height:16px; background:#47B745; border:1.5px solid #ffffff; border-radius:50%; box-shadow:0 2px 6px rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center;">
                <!-- Super clean hvidt vektor-flueben på den grønne baggrund -->
                <svg viewBox="0 0 24 24" style="width:9px; height:9px; fill:none; stroke:#ffffff; stroke-width:4; stroke-linecap:round; stroke-linejoin:round;">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>`;
    }).join('');


    // 4. Split måltallene til top-headeren
    const [homeGoals, awayGoals] = (info.scoreStr || "0 - 0").split('-').map(s => s.trim());

    // 5. Render det færdige og strømlinede layout
    container.innerHTML = `
        <div class="mr-capture-card" id="fig2-capture" style="padding: 40px 30px;">
            
            <!-- TOPBAR JUSTERET MED MARGIN-LEFT SÅ DET FLUGTER MED Y-AKSEN -->
            <div style="width:100%; display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px;">
                <div style="display:flex; flex-direction:column; gap:12px; margin-left:45px;">
                    <!-- Hjemmehold Linje -->
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${info.homeLogoB64}" style="width:24px; height:24px; object-fit:contain;">
                        <span style="font-size:24px; font-weight:950; color:#fff; width:20px; text-align:center;">${homeGoals}</span>
                        <span style="font-size:18px; font-weight:900; color:${homeColor}; text-transform:uppercase; letter-spacing:0.3px;">${info.homeName}</span>
                        <span style="font-size:13px; font-weight:700; color:rgba(255,255,255,0.35);">(${totXGHome.toFixed(2)} xG)</span>
                    </div>
                    <!-- Udehold Linje -->
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${info.awayLogoB64}" style="width:24px; height:24px; object-fit:contain;">
                        <span style="font-size:24px; font-weight:950; color:#fff; width:20px; text-align:center;">${awayGoals}</span>
                        <span style="font-size:18px; font-weight:900; color:${awayColor}; text-transform:uppercase; letter-spacing:0.3px;">${info.awayName}</span>
                        <span style="font-size:13px; font-weight:700; color:rgba(255,255,255,0.35);">(${totXGAway.toFixed(2)} xG)</span>
                    </div>
                </div>
                
                <div style="text-align:right; padding-top:4px;">
                    <h2 style="font-size:15px; font-weight:900; color:#fff; letter-spacing:1.2px; margin:0; text-transform:uppercase;">Accumulated xG</h2>
                    <span style="font-size:9px; font-weight:800; color:rgba(255,255,255,0.25); letter-spacing:1px;">VIA PER-90.STREAMLIT.APP</span>
                </div>
            </div>

            <!-- GRAF MED TYDELIGERE COLOR-FILL OG ULTRA MINIMALISTISKE FLUEBEN -->
            <div class="mr-graph-frame" style="height:350px;">
                <div class="mr-y-axis" style="width:45px; height:100%; position:relative; font-variant-numeric:tabular-nums;">
                    ${[...yTicks].reverse().map(tick => `<span style="position:absolute; top:${100-(tick/maxY)*100}%; right:12px; font-size:11px; font-weight:800; color:#475569; transform:translateY(-50%);">${tick.toFixed(1)}</span>`).join('')}
                </div>
                
                <div class="mr-svg-canvas" style="border-bottom:1px solid rgba(255,255,255,0.1); border-left:1px solid rgba(255,255,255,0.1);">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                        ${svgGridLines}
                        <!-- OPDATERET fill-opacity: 0.12 for markant tydeligere hold-farvearealer -->
                        <path d="${hPaths.area}" fill="${homeColor}" fill-opacity="0.12"/>
                        <path d="${aPaths.area}" fill="${awayColor}" fill-opacity="0.12"/>
                        
                        <path d="${hPaths.line}" fill="none" stroke="${homeColor}" stroke-width="1.2" stroke-linejoin="miter"/>
                        <path d="${aPaths.line}" fill="none" stroke="${awayColor}" stroke-width="1.2" stroke-linejoin="miter"/>
                    </svg>
                    <div class="mr-markers-layer" style="left:0;">${goalMarkersHTML}</div>
                </div>
            </div>

            <div class="mr-x-row">
                <div style="width:45px;"></div>
                <div class="mr-x-axis" style="padding-top:10px; color:#475569; font-size:11px; font-weight:800;">
                    <span>0'</span><span style="position:relative; left:-2%;">15'</span><span style="position:relative; left:-1%;">30'</span>
                    <span>45'</span><span style="position:relative; left:1%;">60'</span><span style="position:relative; left:2%;">75'</span><span>90'</span>
                </div>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('xg_timeline', 'fig2-capture')">Download as PNG</button></div>
    `;
}



// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 8 AF 10 (FIG 3 – GAME STATE / MOMENTUM)
// ==========================================================================

// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 8 AF 10 (FIG 3 – GAME STATE & MOMENTUM)
// ==========================================================================
function buildFig3GameState() {
    const container = getMatchReportEl("mr-display-target-area");
    const info = MATCH_GLOBAL_DATA.match_info;
    const mData = MATCH_GLOBAL_DATA.momentum;
    const homeColor = info.homeColor || '#ff4d4d';
    const awayColor = info.awayColor || '#eed202';

    if (!mData || mData.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:rgba(255,255,255,0.4);">Ingen momentumdata tilgængelig.</div>`;
        return;
    }

    const maxMin = Math.max(90, ...mData.map(m => m.minute));

    // 1. Glat momentum-punkterne ud (Moving average) for at få den flydende bølge
    const smoothedPoints = mData.map((m, idx) => {
        const start = Math.max(0, idx - 3);
        const end = Math.min(mData.length, idx + 4);
        const slice = mData.slice(start, end);
        const avg = slice.reduce((sum, item) => sum + item.value, 0) / slice.length;
        return { minute: m.minute, value: avg };
    });

    // Generer SVG-stier for over- og undersiden af midterlinjen (Y=50)
    let hPoints = ["M 0,50"];
    let aPoints = ["M 0,50"];
    
    smoothedPoints.forEach(p => {
        const x = (p.minute / maxMin) * 100;
        const y = 50 - (p.value / 100) * 42; // Skalerer momentum-værdien ind på aksen
        hPoints.push(`L ${x.toFixed(2)},${y <= 50 ? y.toFixed(2) : 50}`);
        aPoints.push(`L ${x.toFixed(2)},${y >= 50 ? y.toFixed(2) : 50}`);
    });
    
    hPoints.push("L 100,50 Z");
    aPoints.push("L 100,50 Z");

    // 2. Byg dæmpede gridlines med fulde, urokkelige HTML-attributter (Sikrer html2canvas kompabilitet)
    let svgGridLines = [8, 50, 92].map(y => `
        <line x1="0" y1="${y}" x2="100" y2="${y}" stroke="rgba(255,255,255,${y === 50 ? '0.15' : '0.04'})" stroke-width="${y === 50 ? '0.8' : '0.5'}" />
    `).join('');
    
    const timeMinutes = [15, 30, 45, 60, 75, 90];
    svgGridLines += timeMinutes.map(m => `
        <line x1="${(m/maxMin)*100}" y1="0" x2="${(m/maxMin)*100}" y2="100" stroke="rgba(255,255,255,0.03)" stroke-width="0.5" stroke-dasharray="2,2" />
    `).join('');

    // 3. Split scoringstallene til topbar
    const [homeGoals, awayGoals] = (info.scoreStr || "0 - 0").split('-').map(s => s.trim());

    // 4. Render det samlede layout
    container.innerHTML = `
        <div class="mr-capture-card" id="fig3-capture" style="padding: 40px 30px;">
            
            <!-- TOPBAR -->
            <div style="width:100%; display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:30px;">
                <div style="display:flex; flex-direction:column; gap:12px; margin-left:110px;">
                    <!-- Hjemmehold Linje -->
                    <div style="display:flex; align-items:center; gap:12px; line-height:1;">
                        <img src="${info.homeLogoB64}" style="width:24px; height:24px; object-fit:contain; flex-shrink:0; display:block;">
                        <span style="font-size:24px; font-weight:950; color:#fff; width:20px; text-align:center; display:inline-block; line-height:1;">${homeGoals}</span>
                        <span style="font-size:18px; font-weight:900; color:${homeColor}; text-transform:uppercase; letter-spacing:0.3px; display:inline-block; line-height:1;">${info.homeName}</span>
                    </div>
                    <!-- Udehold Linje -->
                    <div style="display:flex; align-items:center; gap:12px; line-height:1;">
                        <img src="${info.awayLogoB64}" style="width:24px; height:24px; object-fit:contain; flex-shrink:0; display:block;">
                        <span style="font-size:24px; font-weight:950; color:#fff; width:20px; text-align:center; display:inline-block; line-height:1;">${awayGoals}</span>
                        <span style="font-size:18px; font-weight:900; color:${awayColor}; text-transform:uppercase; letter-spacing:0.3px; display:inline-block; line-height:1;">${info.awayName}</span>
                    </div>
                </div>
                
                <div style="text-align:right; padding-top:4px;">
                    <h2 style="font-size:15px; font-weight:900; color:#fff; letter-spacing:1.2px; margin:0; text-transform:uppercase;">Game State</h2>
                    <span style="font-size:9px; font-weight:800; color:rgba(255,255,255,0.25); letter-spacing:1px;">VIA PER-90.STREAMLIT.APP</span>
                </div>
            </div>

            <!-- GRAF FRAME MED DE RIGTIGE TEKST-Y-AKSER -->
            <div class="mr-graph-frame" style="height:350px;">
                <!-- Venstre Y-akse tekstlabels -->
                <div class="mr-y-axis" style="width:110px; height:100%; position:relative;">
                    <span style="position:absolute; top:8%; right:15px; font-size:10px; font-weight:900; color:${homeColor}; text-transform:uppercase; letter-spacing:0.5px; transform:translateY(-50%);">Dominance (H)</span>
                    <span style="position:absolute; top:50%; right:15px; font-size:10px; font-weight:800; color:#475569; text-transform:uppercase; letter-spacing:0.5px; transform:translateY(-50%);">Balanced</span>
                    <span style="position:absolute; top:92%; right:15px; font-size:10px; font-weight:900; color:${awayColor}; text-transform:uppercase; letter-spacing:0.5px; transform:translateY(-50%);">Dominance (A)</span>
                </div>
                
                <!-- SVG Canvas med de rettede attributter for download-motoren -->
                <div class="mr-svg-canvas" style="border-bottom:1px solid rgba(255,255,255,0.1); border-left:1px solid rgba(255,255,255,0.1);">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%;">
                        <!-- Baggrunds-gridlines -->
                        ${svgGridLines}
                        
                        <!-- Farve-flader (Fill) -->
                        <path d="${hPoints.join(' ')}" fill="${homeColor}" fill-opacity="0.12" stroke="none" />
                        <path d="${aPoints.join(' ')}" fill="${awayColor}" fill-opacity="0.12" stroke="none" />
                        
                        <!-- Slanke momentum-linjer (Med urokkelige SVG-attributter i stedet for ren CSS) -->
                        <path d="${hPoints.join(' ')}" fill="none" stroke="${homeColor}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="${aPoints.join(' ')}" fill="none" stroke="${awayColor}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>

            <!-- X-AKSE TIDS-ETIKETTER -->
            <div class="mr-x-row">
                <div style="width:110px;"></div>
                <div class="mr-x-axis" style="padding-top:10px; color:#475569; font-size:11px; font-weight:800;">
                    <span>0'</span><span style="position:relative; left:-2%;">15'</span><span style="position:relative; left:-1%;">30'</span>
                    <span>45'</span><span style="position:relative; left:1%;">60'</span><span style="position:relative; left:2%;">75'</span><span>90'</span>
                </div>
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('game_momentum', 'fig3-capture')">Download as PNG</button></div>
    `;
}

// ==========================================================================
// PER 90 - MATCHREPORT.JS - FIG 4 (DEL A: DATABEHANDLING & HTML-MAPPING)
// ==========================================================================
function buildFig4TopPerformers() {
    const container = getMatchReportEl("mr-display-target-area");
    const info = MATCH_GLOBAL_DATA.match_info;
    const playersList = MATCH_GLOBAL_DATA.players;

    if (!playersList || playersList.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:rgba(255,255,255,0.4);">Ingen spillerdata tilgængelig.</div>`;
        return;
    }

    const columnsConfig = [
        { title: "Attacking", metrics: [ { id: "Expected goals (xG)", label: "EXPECTED GOALS (XG)" }, { id: "Shots on target", label: "SHOTS ON TARGET" }, { id: "Successful dribbles", label: "SUCCESSFUL DRIBBLES" }, { id: "Touches in opposition box", label: "TOUCHES IN OPPOSITION BOX" } ] },
        { title: "Passing", metrics: [ { id: "Expected assists (xA)", label: "EXPECTED ASSISTS (XA)" }, { id: "Chances created", label: "CHANCES CREATED" }, { id: "Passes into final third", label: "PASSES INTO FINAL THIRD" }, { id: "Accurate long balls", label: "ACCURATE LONG BALLS" } ] },
        { title: "Defending", metrics: [ { id: "Defensive actions", label: "DEFENSIVE ACTIONS" }, { id: "Tackles", label: "TACKLES" }, { id: "Ground duels won", label: "GROUND DUELS WON" }, { id: "Aerial duels won", label: "AERIAL DUELS WON" } ] }
    ];

    const cols_html = columnsConfig.map(col => {
        const metrics_html = col.metrics.map(metric => {
            const topPlayers = [...playersList]
                .map(p => ({ name: p.playerName, teamId: p.teamId, val: parseFloat(p.stats?.[metric.id] || 0) }))
                .filter(p => p.val > 0)
                .sort((a, b) => b.val - a.val)
                .slice(0, 3);

            if (topPlayers.length === 0) return '';

            const players_html = topPlayers.map((player, idx) => {
                const is_1st = idx === 0;
                
                // 🔥 FAST BREDDE & FLEX FIX: Vi låser elementerne, så navne ALDRIG kan blive skåret af (f.eks. Tavernier)
                return `
                <div class="pr ${is_1st ? 'l1' : ''}" style="display: flex !important; align-items: center !important; justify-content: flex-start !important; gap: 10px !important; padding: 2px 8px !important; margin-bottom: 4px !important; border-radius: 6px !important; background: rgba(255,255,255,0.01) !important; border: 1px solid rgba(255,255,255,0.02) !important; min-height: 28px !important; box-sizing: border-box !important; overflow: hidden !important;">
                    <span class="rb ${is_1st ? 'gd' : ''}" style="font-size: ${is_1st ? '12px' : '11px'} !important; font-weight: 900 !important; color: ${is_1st ? '#ff4d4d' : 'rgba(255,255,255,0.2)'} !important; width: 12px !important; text-align: center !important; flex-shrink: 0 !important; display: inline-block !important; line-height: 1 !important; margin: 0 !important; padding: 0 !important;">
                        ${idx + 1}
                    </span>
                    <img class="logo" src="${player.teamId == info.homeId ? info.homeLogoB64 : info.awayLogoB64 || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}" style="width: 16px !important; height: 16px !important; object-fit: contain !important; flex-shrink: 0 !important; display: block !important; margin: 0 !important; padding: 0 !important; filter: drop-shadow(0 0 4px rgba(255,255,255,0.1)) !important;">
                    <span class="p-nm" style="flex-grow: 1 !important; width: 0 !important; font-size: 11px !important; font-weight: ${is_1st ? '700' : '600'} !important; color: ${is_1st ? '#ffffff' : 'rgba(255,255,255,0.6)'} !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; display: inline-block !important; line-height: 1 !important; margin: 0 !important; padding: 0 !important;">
                        ${player.name}
                    </span>
                    <span class="p-vl" style="font-size: 11px !important; font-weight: ${is_1st ? '900' : '700'} !important; color: ${is_1st ? '#ff4d4d' : 'rgba(255,255,255,0.5)'} !important; text-shadow: ${is_1st ? '0 0 15px rgba(255, 77, 77, 0.4)' : 'none'} !important; text-align: right !important; margin-left: auto !important; font-variant-numeric: tabular-nums !important; display: inline-block !important; line-height: 1 !important; padding: 0 !important; flex-shrink: 0 !important; width: 35px !important;">
                        ${Number.isInteger(player.val) ? player.val : player.val.toFixed(2)}
                    </span>
                </div>`;
            }).join('');

            return `<div style="display:flex; flex-direction:column; margin-bottom: 4px;"><div style="font-size:10px; font-weight:700; color:rgba(255,255,255,0.35); letter-spacing:0.5px; margin-bottom:8px; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${metric.label}</div>${players_html}</div>`;
        }).join('');

        return `<div class="gcol" style="display:flex; flex-direction:column; gap:20px; min-width:0; flex: 1 1 0%;"><div class="cht" style="font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:1.5px; color:#ffffff; background:rgba(255, 255, 255, 0.04); padding:6px 12px; margin-bottom:-4px; clip-path:polygon(0 0, 90% 0, 100% 100%, 0% 100%); border-left:3px solid #ff4d4d; width: fit-content;">${col.title.toUpperCase()}</div>${metrics_html}</div>`;
    }).join('');

// ==========================================================================
// PER 90 - MATCHREPORT.JS - FIG 4 (DEL B: FRAME-RENDERING & DOWNLOAD)
// ==========================================================================
    container.innerHTML = `
        <div id="chart-only-fig4" class="mr-capture-card" style="background:radial-gradient(circle at 0% 0%, #15151e 0%, #060609 100%); padding:44px 32px; border-radius:24px; position:relative; overflow:hidden; border:1px solid rgba(255,255,255,0.05); width:100%; box-sizing:border-box; align-items: stretch !important;">
            <style>
                #chart-only-fig4::before { content:''; position:absolute; inset:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px); background-size:20px 20px; }
                .pr.l1 { 
                    background: linear-gradient(135deg, rgba(255, 77, 77, 0.15) 0%, rgba(255, 77, 77, 0.03) 100%) !important; 
                    border: 1px solid rgba(255, 77, 77, 0.3) !important; 
                    box-shadow: 0 10px 25px rgba(255, 77, 77, 0.08) !important; 
                    transform: scale(1.01) !important;
                }
            </style>
            <div style="display:flex; flex-direction:column; align-items:flex-start; margin-bottom:40px; position:relative; z-index:2;">
                <h1 style="font-size:30px; font-weight:900; text-transform:uppercase; margin:0; letter-spacing:2px; line-height:0.85; color:#ffffff;">Top <strong style="font-weight:900; letter-spacing:2px; color:#ff4d4d;">Performers</strong></h1>
                <div style="font-size:9px; font-weight:700; color:#ff4d4d; letter-spacing:2px; margin-top:8px; text-transform:uppercase; padding-left:12px; border-left:2px solid #ff4d4d;">Generated via per-90.streamlit.app</div>
            </div>
            
            <!-- 🔥 STRUKTUR FIX: Vi tvinger containeren til altid at bruge flex og fordele kolonnerne ensartet under download -->
            <div id="fig4-grid-box" style="display: flex !important; flex-direction: row !important; gap: 20px !important; position: relative; z-index: 2; width: 100% !important; box-sizing: border-box !important;">
                ${cols_html}
            </div>
        </div>
        <div style="text-align:center; margin-top:20px;"><button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('top_performers', 'chart-only-fig4')">Download as PNG</button></div>
    `;
}



// ==========================================================================
// PER 90 - MATCHREPORT.JS - DEL 10 AF 10 (FIG 5 – PAKKE 1 AF 4 – OPDATERET)
// ==========================================================================

async function buildFig5PlayerStats() {
    const container = getMatchReportEl("mr-display-target-area");
    const info = MATCH_GLOBAL_DATA.match_info;
    const rawPlayers = MATCH_GLOBAL_DATA.players;

    if (!rawPlayers || rawPlayers.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:rgba(255,255,255,0.4);">Ingen spillerdata tilgængelig.</div>`;
        return;
    }

    // 🎯 NYT: Filtrer alle spillere fra, som har 0 eller mangler rating (ligesom din eligible_df i Python)
    const players = rawPlayers.filter(p => {
        const r = parseFloat(p.stats?.["FotMob rating"] || 0);
        return r > 0;
    });

    if (players.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:rgba(255,255,255,0.4);">Ingen spillere med gyldig rating i denne kamp.</div>`;
        return;
    }

    // 🎯 NYT: Sorter listen midlertidigt for altid at finde spilleren med den absolut højeste rating i kampen
    const maxRatingInMatch = Math.max(...players.map(p => parseFloat(p.stats?.["FotMob rating"] || 0)));

    // Hvis brugeren ikke selv har valgt en spiller endnu, vælger vi automatisk ham med højest rating som default!
    if (!MATCH_SELECTED_PLAYER) {
        const topRatedPlayer = players.find(p => parseFloat(p.stats?.["FotMob rating"] || 0) === maxRatingInMatch);
        MATCH_SELECTED_PLAYER = topRatedPlayer ? topRatedPlayer.playerId : players[0].playerId;
    }

    const current = players.find(p => p.playerId == MATCH_SELECTED_PLAYER) || players[0];
    const isHome = current.teamId == info.homeId;
    
    const rating = parseFloat(current.stats?.["FotMob rating"] || 0);
    const ratingColor = rating === maxRatingInMatch ? "#14a0ff" : (rating >= 7 ? "#33c771" : (rating >= 6 ? "#ff963f" : "#ff3939"));

    // Dynamisk Rank-tekst (f.eks. "MAN OF THE MATCH" eller "2nd HIGHEST RATING")
    const allRatingsSorted = [...players].map(p => parseFloat(p.stats?.["FotMob rating"] || 0)).sort((a,b)=>b-a);
    const playerRank = allRatingsSorted.indexOf(rating) + 1;
    let rankText = "MAN OF THE MATCH";
    if (rating !== maxRatingInMatch) {
        const suffix = (playerRank % 100 >= 11 && playerRank % 100 <= 13) ? "th" : ({1: "st", 2: "nd", 3: "rd"}[playerRank % 10] || "th");
        rankText = `${playerRank}${suffix} HIGHEST RATING`;
    }


    // 4. ON-DEMAND BASE64 GENERATOR: Kalder dit nye Python-endpoint KUN for denne spiller!
    let playerImgB64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    try {
        const imgRes = await fetch(`${API_BASE_URL}/api/player-image?player_id=${current.playerId}`);
        if (imgRes.ok) {
            const imgData = await imgRes.json();
            // Hvis spilleren mangler profilbillede, laver vi fallback til holdets Base64-logo
            playerImgB64 = imgData.player_img_b64 || (isHome ? info.homeLogoB64 : info.awayLogoB64);
        }
    } catch(e) { console.error("Fejl under on-demand hentning af backend-spillerbillede:", e); }

    // 5. Byg stakkede mål- (fodbolde) og assist- (A-badges) ikoner til bunden af ansigtet
    const goals = parseInt(current.stats?.["Goals"] || 0);
    const assists = parseInt(current.stats?.["Assists"] || 0);
    let iconsHTML = "";
    
    for (let i = 0; i < goals; i++) {
        const isLastGoal = i === goals - 1 && assists > 0;
        iconsHTML += `
        <svg style="display:block; margin-right:${isLastGoal ? '3px' : '-4px'} !important; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.9)); flex-shrink:0;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.8">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7l4.76 3.45l-1.76 5.55h-6l-1.76 -5.55z" fill="#1e293b" />
            <path d="M12 7v-4m3 13l2.5 3m-.74 -8.55l3.74 -1.45m-11.44 7.05l-2.56 2.95m.74 -8.55l-3.74 -1.45" />
        </svg>`;
    }
    for (let i = 0; i < assists; i++) {
        iconsHTML += `
        <svg style="display:block; margin-right:-4px; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.9)); flex-shrink:0;" width="16" height="16" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="#E13B4F" />
            <text x="12" y="17" fill="#FFFFFF" font-family="sans-serif" font-weight="900" font-size="13" text-anchor="middle">A</text>
        </svg>`;
    }

    for (let i = 0; i < assists; i++) {
        iconsHTML += `
        <svg style="display:block; margin-right:-4px; filter:drop-shadow(0 2px 3px rgba(0,0,0,0.9)); flex-shrink:0;" width="16" height="16" viewBox="0 0 24 24">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="#E13B4F" />
            <text x="12" y="17" fill="#FFFFFF" font-family="sans-serif" font-weight="900" font-size="13" text-anchor="middle">A</text>
        </svg>`;
    }


    // 6. Konfiguration af dine 16 metrics fordelt på de 4 Streamlit-kategorier
    const groupsConfig = [
        { title: "Expected", metrics: ['xG + xA', 'Expected goals (xG)', 'Expected assists (xA)', 'Expected goals on target (xGOT)'] },
        { title: "Passing", metrics: ['Big chances created', 'Chances created', 'Passes into final third', 'Accurate passes'] },
        { title: "Possession", metrics: ['Successful dribbles', 'Touches in opposition box', 'Touches', 'Was fouled'] },
        { title: "Other", metrics: ['Defensive actions', 'Recoveries', 'Ground duels won', 'Aerial duels won'] }
    ];

    // 7. Loop igennem grupperne og udregn reelle percentil-ranks ud fra alle kvalificerede spillere
    const cards_html = groupsConfig.map(group => {
        const metrics_inner = group.metrics.map(metric => {
            let p_val = metric === 'xG + xA' ? (parseFloat(current.stats?.['Expected goals (xG)'] || 0) + parseFloat(current.stats?.['Expected assists (xA)'] || 0)) : parseFloat(current.stats?.[metric] || 0);
            const allVals = players.map(p => metric === 'xG + xA' ? (parseFloat(p.stats?.['Expected goals (xG)'] || 0) + parseFloat(p.stats?.['Expected assists (xA)'] || 0)) : parseFloat(p.stats?.[metric] || 0));
            const lessThanCount = allVals.filter(v => v < p_val).length;
            const rankPct = allVals.length > 0 ? (lessThanCount / allVals.length) * 100 : 0;

            const isDecimal = metric.includes('(x') || metric === 'xG + xA';
            const wavePath = "M 0,25 Q 25,5 50,20 T 100,15 L 100,30 L 0,30 Z";
            const clip_id = `clip-${metric.replace(/[^a-zA-Z0-9]/g, '')}`;

            return `
            <div class="metric-row" style="display:flex; flex-direction:column; gap:6px; margin-bottom:32px; min-height:76px;">
                <div class="metric-meta" style="display:flex; flex-direction:column; align-items:flex-start; gap:2px;">
                    <span class="metric-value" style="font-size:20px; font-weight:900; line-height:1.1; color:${ratingColor}; font-variant-numeric:tabular-nums;">${isDecimal ? p_val.toFixed(2) : Math.round(p_val)}</span>
                    <span class="metric-name" style="font-size:10px; color:rgba(255,255,255,0.6); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${metric}</span>
                </div>
                <div class="wave-container" style="width:100%; height:16px; margin-top:auto;">
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none" style="width:100%; height:100%;">
                        <defs><clipPath id="${clip_id}"><rect x="0" y="0" width="${rankPct}" height="30" /></clipPath></defs>
                        <path d="${wavePath}" fill="rgba(255,255,255,0.06)" />
                        <path d="${wavePath}" clip-path="url(#${clip_id})" style="fill:${ratingColor};" />
                    </svg>
                </div>
            </div>`;
        }).join('');

        return `
        <div class="metric-card" style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.04); border-radius:14px; padding:12px; min-width:0; flex:1;">
            <div class="card-title" style="font-size:11px; font-weight:900; color:rgba(255,255,255,0.3); letter-spacing:1px; margin-bottom:20px; text-align:center; text-transform:uppercase;">${group.title}</div>
            ${metrics_inner}
        </div>`;
    }).join('');

    // 🎯 NYT: Dropdown-menuen filtrerer 0.0, SORTERER EFTER RATINGS (HØJEST TIL LAVEST) og mapper ud bagefter!
    const playerOptionsHTML = [...players]
        .sort((a, b) => parseFloat(b.stats?.["FotMob rating"] || 0) - parseFloat(a.stats?.["FotMob rating"] || 0))
        .map(p => `<option value="${p.playerId}" ${p.playerId == MATCH_SELECTED_PLAYER ? 'selected' : ''}>${p.playerName} (${parseFloat(p.stats?.["FotMob rating"] || 0).toFixed(1)})</option>`)
        .join('');
        
    const opponentTeamName = current.teamName === info.homeName ? info.awayName : info.homeName;


    // 8. Render det endelige, smukke Streamlit-look til skærmen
    container.innerHTML = `
        <!-- SPILLER SELECT DROPDOWN -->
        <div style="width:100%; max-width:600px; margin:0 auto 20px auto; display:flex; align-items:center; gap:12px; background:rgba(255,255,255,0.03); padding:10px 15px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <span style="font-size:11px; font-weight:800; color:rgba(255,255,255,0.5); text-transform:uppercase;">Select Player:</span>
            <select id="mr-player-dropdown" onchange="MATCH_SELECTED_PLAYER=parseInt(this.value); buildFig5PlayerStats();" style="flex:1; background:#0B1220; color:#fff; border:1px solid rgba(255,255,255,0.1); padding:6px 10px; border-radius:6px; font-weight:700; font-size:13px; outline:none; cursor:pointer;">
                ${playerOptionsHTML}
            </select>
        </div>

        <!-- DET DIGITALE CAPTURE-KORT -->
        <div class="chart-container" id="fig5-capture" style="position:relative; padding:25px 20px 20px; border-radius:24px; width:100%; border:1px solid rgba(0,240,255,.08); box-shadow:0 30px 60px -15px #000, inset 0 1px 0 rgba(255,255,255,.05); overflow:hidden; background:#0B1220; display:flex; flex-direction:column; font-family:sans-serif; color:#e5e7eb; box-sizing:border-box;">
            
            <!-- STREAMLIT HEADER CARD -->
            <div class="header-card" style="position:relative; z-index:2; width:100%; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:16px; padding:20px; display:flex; gap:28px; align-items:center;">
                <div class="avatar-block" style="position:relative; flex-shrink:0; display:flex; align-items:center; justify-content:center;">
                    
                    <div class="rating-badge" style="position:absolute; top:-6px; left:-10px; background:${ratingColor}; color:#000; font-weight:900; border-radius:10px; font-size:13px; box-shadow:0 4px 10px rgba(0,0,0,0.5); z-index:3; display:block; height:24px; padding:3px 7px 0px 7px; text-align:center; line-height:18px; white-space:nowrap;">
                        <span>${rating.toFixed(1)}</span>
                    </div>

                    <div class="img-container" style="width:80px; height:80px; background:#1e293b; border-radius:50%; border:3px solid ${ratingColor}; overflow:hidden; display:flex; align-items:center; justify-content:center;">
                        <img class="player-img" src="${playerImgB64}" style="width:100%; height:100%; object-fit:cover;">
                    </div>

                    <div class="corner-team-box" style="position:absolute; top:-6px; right:-10px; width:24px; height:24px; background:#1e293b; border-radius:50%; padding:3px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 4px 8px rgba(0,0,0,0.4); z-index:3; display:flex; align-items:center; justify-content:center;">
                        <img class="corner-team-logo" src="${isHome ? info.homeLogoB64 : info.awayLogoB64}" style="width:100%; height:100%; object-fit:contain;" />
                    </div>

                    ${iconsHTML ? `<div class="icon-fan" style="position:absolute; bottom:-8px; left:50%; transform:translateX(-50%); display:flex; align-items:center; justify-content:center; z-index:4; white-space:nowrap;">${iconsHTML}</div>` : ''}
                </div>

                <div class="info-container" style="flex-grow:1; min-width:0; display:flex; flex-direction:column;">
                    <h2 class="player-name" style="font-size:28px; font-weight:900; margin:0; text-transform:uppercase; color:#ffffff; line-height:1.0;">${current.playerName}</h2>
                    <div class="rank-kicker" style="font-size:11px; font-weight:900; color:${ratingColor}; letter-spacing:1px; text-transform:uppercase; margin-top:6px;">${rankText}</div>
                    <div class="tactic-line" style="width:100%; height:2px; margin:10px 0; background:linear-gradient(90deg, ${ratingColor} 60%, transparent); opacity:0.3;"></div>
                    
                    <div class="meta-bar" style="display:flex; align-items:center; gap:8px; font-size:12px; font-weight:500; color:#94a3b8; text-transform:uppercase;">
                        <span class="match-versus" style="font-weight:500; color:#94a3b8;">${current.teamName} VS. ${opponentTeamName}</span>
                        <span class="separator" style="color:#475569; font-weight:400;">|</span>
                        <span>${Math.round(current.stats?.["Minutes played"] || 90)} Mins Played</span>
                    </div>
                </div>
            </div>

            <div class="grid-container" style="position:relative; z-index:2; display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-top:20px; width:100%; box-sizing:border-box;">
                ${cards_html}
            </div>
            
            <div class="footer" style="position:relative; z-index:2; text-align:center; font-size:11px; color:#94a3b8; margin-top:20px; width:100%;">
                The waves show distribution and the <span style="color:${ratingColor}; font-weight:700;">filled area</span> represents the player's rank.
            </div>
        </div>

        <div style="text-align:center; margin-top:20px;">
            <button class="mr-btn" style="margin:auto;" onclick="triggerMatchReportDownload('${current.playerName.replace(/\s+/g,'_')}_report', 'fig5-capture')">Download as PNG</button>
        </div>
    `;
}

