// ==========================================================================
// PER 90 - SCATTER.JS - DEL 1 AF 6 (MASTER CONFIG & SEMANTISK TABEL-CSS)
// ==========================================================================

let SCATTER_GLOBAL_DATA = null;
let SCATTER_X_AXIS = "npxG";
let SCATTER_Y_AXIS = "Assists";
let SCATTER_STAT_TYPE = "Per 90";

// 🎯 STANDARDVALG DEFINERET: Loader nu direkte Bundesliga og CM/AM for lynhurtig performance
let SCATTER_FILTERS = {
    leagues: ["Bundesliga", "Eliteserien"],
    nationalities: [],
    positions: ["CM/AM"],
    minAge: 0,
    maxAge: 100,
    minMins: 0,
    maxMins: 99999,
    highlightTeam: "",
    highlightPlayer: ""
};

let SCATTER_QUICK_HIGHLIGHTS = {
    top10x: true,
    top10y: false,
    u21: false,
    u19: false
};

const $sc = id => document.getElementById(id);

// 🎨 CORE DESIGN INJECTION (SEMANTISKE TABELKANALER - RESPONSIVT SIKRET OVERALT)
document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        /* 🎯 DIAGRAM-KORT (Bygget som en urokkelig master-beholder) */
        .scatter-chart-card { 
            background: linear-gradient(180deg, #0f172a 0%, #020617 100%) !important; 
            padding: 30px; 
            border-radius: 20px; 
            width: 100%; 
            max-width: 770px; 
            margin: 0 auto !important; 
            border: 1px solid rgba(255,255,255,0.05); 
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); 
            box-sizing: border-box; 
            position: relative; 
            display: block !important; 
        }

        .scatter-quick-toolbar { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 10px; width: 100%; max-width: 1100px; margin: 0 auto 25px; padding: 0 10px; box-sizing: border-box; }
        .scatter-quick-btn { padding: 9px 16px; border-radius: 6px; font-size: 11px; font-weight: 800; border: 1px solid rgba(255,255,255,0.08); background: rgba(15, 23, 42, 0.6); color: #94a3b8; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.2s ease; height: 38px; box-sizing: border-box; }
        .scatter-quick-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
        .scatter-quick-btn.active { background: var(--accent-purple) !important; border-color: var(--accent-purple); color: #06140c !important; box-shadow: 0 0 15px rgba(168,85,247,0.3); }

        .scatter-drawer-group { display: flex; flex-direction: column; gap: 6px; width: 100%; box-sizing: border-box; }
        .scatter-drawer-label { font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .scatter-drawer-select, .scatter-drawer-input { background: #07030c; color: #fff; border: 1px solid var(--border-color); padding: 10px 12px; border-radius: 6px; font-size: 13px; outline: none; cursor: pointer; width: 100%; box-sizing: border-box; font-family: 'Gabarito', sans-serif; }
        .scatter-drawer-input-row { display: flex; gap: 10px; width: 100%; }
        
        .sc-drawer-checkbox-box { background: #07030c; border: 1px solid var(--border-color); border-radius: 6px; padding: 14px; display: flex; flex-direction: column; gap: 11px; max-height: 160px; overflow-y: auto; }
        .sc-drawer-checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 12.5px; color: var(--text-primary); transition: opacity 0.2s; }
        
        #scatter-svg-canvas { display: block; margin: 0 auto; overflow: visible; width: 100%; max-width: 730px; height: auto; }
        .scatter-grid-line { stroke: rgba(255,255,255,0.04); stroke-width: 1; }
        .scatter-axis-line { stroke: rgba(255,255,255,0.15); stroke-width: 1.5; }
        .scatter-axis-lbl { font-size: 11px; fill: #94a3b8; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; font-family: 'Gabarito', sans-serif; }
        
        .scatter-player-text-label { font-size: 9px; font-weight: 700; fill: #fff; font-family: 'Gabarito', sans-serif; pointer-events: none; filter: drop-shadow(0px 1px 2px rgba(0,0,0,1)); }
        .scatter-node-dot { stroke-width: 1.2; stroke: rgba(255,255,255,0.4); cursor: pointer; transition: r 0.12s ease, opacity 0.12s ease; }
        .scatter-node-dot:hover { r: 8.5 !important; opacity: 1 !important; stroke: #ffffff; }
        
        /* 🌐 SEMANTISK COLORBAR-TABEL: Låser farveskalaen og teksten helt fast uden slør */
        .scatter-colorbar-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 20px;
            font-family: 'Gabarito', sans-serif;
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Klasse til at styre minuttallene på hver side af baren */
        .scatter-colorbar-mins-text {
            color: #64748b;
            font-weight: 600;
        }

        .scatter-colorbar-table td { padding: 4px 0 !important; vertical-align: middle; }
        .scatter-colorbar-gradient { width: 250px; height: 8px; border-radius: 4px; background: linear-gradient(90deg, #1e3a8a 0%, #a21caf 50%, var(--accent-purple) 100%) !important; border: 1px solid rgba(255,255,255,0.05); margin: 0 auto; }
        .scatter-colorbar-text-fix { font-size: 11px !important; color: #ffffff !important; font-weight: 900 !important; letter-spacing: 1.5px !important; text-transform: uppercase; opacity: 0.3 !important; text-shadow: 0 0 10px rgba(255,255,255,0.1); }

        /* Gulglow Tooltip */
        .scatter-hover-tooltip { position: absolute; background: #060a12; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px 20px; font-family: 'Gabarito', sans-serif; font-size: 12px; color: #fff; pointer-events: none; opacity: 0; transition: opacity 0.12s ease; z-index: 200; box-shadow: 0 20px 40px rgba(0,0,0,0.7); min-width: 240px; box-sizing: border-box; }
        .sc-tt-header-box { border-left: 3px solid #f59e0b; padding-left: 14px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 4px; }
        .sc-tt-name { font-size: 15px; font-weight: 900; margin: 0; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; }
        .sc-tt-meta { color: #64748b; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .sc-tt-body-box { display: flex; flex-direction: column; gap: 6px; padding-left: 17px; }
        .sc-tt-stat-row { display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 4px; }
        .sc-tt-stat-lbl { color: #94a3b8; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .sc-tt-stat-val { font-weight: 800; color: #f59e0b !important; font-size: 12px; text-shadow: 0 0 8px rgba(245,158,11,0.2); }

        /* 🌐 SEMANTISK FOOTER-TABEL: Ligesom radar og pizza */
        .scatter-footer-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 15px;
            font-family: 'Gabarito', sans-serif;
            text-align: center;
        }
        .scatter-footer-table td { padding: 2px 0 !important; font-size: 11px; font-weight: 400; color: #e5e7eb; letter-spacing: .4px; }
        .scatter-footer-table .footer-line-top { opacity: 0.75; }
        .scatter-footer-table .footer-line-bottom { opacity: 0.45; }

        /* 📱 TABLET- OG MOBILOPTIMERING V5 */
                /* 📱 TABLET- OG MOBILOPTIMERING V5 (MINDRE SKÆRME) */
        @media (max-width: 1025px) {
            .scatter-chart-card { padding: 20px !important; }
            
            /* Gør farvebjælken mere kompakt på tablets */
            .scatter-colorbar-gradient { width: 160px !important; height: 6px !important; }
            .scatter-colorbar-text-fix { font-size: 8px !important; }
            
            /* 🎯 RYKKER BUNDEN OP OG TÆTTERE SAMMEN PÅ TABLETS */
            .scatter-colorbar-table { margin-top: 10px !important; } /* Trækker hele colorbar-tabellen tættere på plottet */
            .scatter-colorbar-table td { padding: 1px 0 !important; } /* Mindre luft mellem bjælken og teksten under */
            .scatter-footer-table { margin-top: 8px !important; } /* Trækker footeren tættere på minutes-teksten */
            .scatter-footer-table td { font-size: 9px !important; }
        }

        /* 📱 SMALE SMARTPHONES (Samsung S8+, iPhones under 480px) */
                /* 📱 SMALE SMARTPHONES (Samsung S8+, iPhones under 480px) */
                /* 📱 SMALE SMARTPHONES (iPhone 7, Samsung S8+, skærme under 480px) */
        @media (max-width: 480px) {
            .scatter-chart-card { padding: 12px 10px !important; border-radius: 12px !important; }
            #scatter-dynamic-vs-title { font-size: 11px !important; letter-spacing: 0.5px !important; margin-bottom: 8px !important; }
            .scatter-quick-toolbar { gap: 4px !important; margin-bottom: 12px !important; }
            .scatter-quick-btn { padding: 0 8px !important; font-size: 8.5px !important; height: 28px !important; flex-grow: 1 !important; text-align: center !important; }
            #scatter-svg-canvas { max-height: 280px !important; }
            .scatter-axis-lbl { font-size: 7.5px !important; letter-spacing: 0.2px !important; }
            .scatter-player-text-label { font-size: 7px !important; }
            
            /* Tvinger mindre margin under plottet på meget smalle skærme */
            .scatter-colorbar-table { 
                margin-top: 6px !important; 
            }
            
            /* Farvebjælken gøres ultra-kompakt */
            .scatter-colorbar-gradient { 
                width: 80px !important; 
                height: 3px !important; 
                margin: 0 auto !important; 
            }
            
            .scatter-colorbar-table td { 
                padding: 0 !important; 
            }
            .scatter-colorbar-table tr:nth-child(2) td { 
                padding-top: 3px !important; 
            }
            
            /* 🎯 ULTRA-NEDSKALERING: Tvinger "MINUTES PLAYED" ned i mikroformat til f.eks. iPhone 7 */
            .scatter-colorbar-text-fix { 
                font-size: 4px !important; /* Ekstremt lille og urokkeligt format */
                opacity: 0.4 !important; 
                display: block !important;
                line-height: 1 !important;
                letter-spacing: 0px !important;
                margin-top: -4px !important; 
            }
            
            /* Giver footeren den præcis samme super-komprimerede højde */
            .scatter-footer-table { 
                margin-top: 4px !important; 
            }
            
            /* 🎯 ULTRA-NEDSKALERING: Gør 'Generated via...' mikroskopisk, så de ikke lapper over */
            .scatter-footer-table .footer-line-bottom td { 
                font-size: 3.5px !important; /* Absolut sweetspot til ældre/smalle telefoner */
                padding: 0 !important;
                line-height: 1 !important;
                opacity: 0.3 !important; 
            }
            
            /* Tooltip tilpasning til micro-skærme */
            .scatter-hover-tooltip { padding: 8px 12px !important; min-width: 170px !important; }
            .sc-tt-name { font-size: 11px !important; }
        }




    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - SCATTER.JS - DEL 2 AF 6 (HTML INITIALISERING & QUICK-TOOLBAR)
// ==========================================================================

async function initScatterView(container) {
    container.innerHTML = `
        <section id="view-scatter" class="content-view active" style="padding-top: 10px;">
            
            <div style="background: none; border: none; box-shadow: none; padding: 0; margin: 0 auto 20px auto; text-align: center; width: fit-content; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                <i class="fa-solid fa-circle-nodes" style="font-size: 65px; color: #ffffff; opacity: 0.8; filter: none; width: auto;"></i>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Scatter Plot</span>
            </div>

            <div class="control-trigger-wrapper" style="margin-bottom: 25px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Customize Plot <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>

            <div class="scatter-quick-toolbar" id="scatter-live-quick-toolbar"></div>
            
            <div class="scatter-chart-card" id="scatter-capture-target-area">
                <div id="scatter-dynamic-vs-title" style="text-align: center; font-size: 18px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 20px;"></div>
                
                <div class="scatter-hover-tooltip" id="scatter-live-tooltip"></div>
                <svg width="730" height="500" viewBox="0 0 730 500" id="scatter-svg-canvas"></svg>
                
                <!-- MINI-COLORBAR INTEGRERET SOM EN RIGTIG TABEL I BUNDEN AF KORTET -->
                <div id="scatter-live-colorbar-target"></div>
            </div>

            <div style="display: flex; justify-content: center; margin-top: 30px; width: 100%;">
                <button onclick="downloadScatterPNG()" style="background: var(--accent-purple); color: #06140c; border: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 14px;">Download Plot as PNG</button>
            </div>
        </section>
    `;
    
    await loadScatterAPIDataFeed();
}

function buildScatterQuickToolbarUI() {
    const bar = $sc("scatter-live-quick-toolbar"); if (!bar) return;
    
    bar.innerHTML = `
        <label class="sc-drawer-checkbox-label" style="opacity: ${SCATTER_QUICK_HIGHLIGHTS.top10x ? 1 : 0.4}; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
            <input type="checkbox" ${SCATTER_QUICK_HIGHLIGHTS.top10x ? "checked" : ""} onclick="toggleScatterQuickHighlight('top10x')" style="accent-color: var(--accent-purple); width: 14px; height: 14px; cursor: pointer;"> Top 10 X-Axis
        </label>
        <label class="sc-drawer-checkbox-label" style="opacity: ${SCATTER_QUICK_HIGHLIGHTS.top10y ? 1 : 0.4}; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
            <input type="checkbox" ${SCATTER_QUICK_HIGHLIGHTS.top10y ? "checked" : ""} onclick="toggleScatterQuickHighlight('top10y')" style="accent-color: var(--accent-purple); width: 14px; height: 14px; cursor: pointer;"> Top 10 Y-Axis
        </label>
        <label class="sc-drawer-checkbox-label" style="opacity: ${SCATTER_QUICK_HIGHLIGHTS.u21 ? 1 : 0.4}; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
            <input type="checkbox" ${SCATTER_QUICK_HIGHLIGHTS.u21 ? "checked" : ""} onclick="toggleScatterQuickHighlight('u21')" style="accent-color: var(--accent-purple); width: 14px; height: 14px; cursor: pointer;"> U21 Players
        </label>
        <label class="sc-drawer-checkbox-label" style="opacity: ${SCATTER_QUICK_HIGHLIGHTS.u19 ? 1 : 0.4}; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
            <input type="checkbox" ${SCATTER_QUICK_HIGHLIGHTS.u19 ? "checked" : ""} onclick="toggleScatterQuickHighlight('u19')" style="accent-color: var(--accent-purple); width: 14px; height: 14px; cursor: pointer;"> U19 Players
        </label>
    `;
}
// ==========================================================================
// PER 90 - SCATTER.JS - DEL 3 AF 6 (SCATTER VEKTOR MOTOR & AKSER)
// ==========================================================================

function buildScatterPlotVektorEngine() {
    const svg = $sc("scatter-svg-canvas"); if (!svg || !SCATTER_GLOBAL_DATA) return;
    svg.innerHTML = "";

    const titleContainer = $sc("scatter-dynamic-vs-title");
    if (titleContainer) titleContainer.innerText = `${SCATTER_X_AXIS} VS ${SCATTER_Y_AXIS}`;

    const padding = { top: 40, right: 55, bottom: 65, left: 55 }; 
    const width = 730, height = 500;
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const filteredPlayers = SCATTER_GLOBAL_DATA.players.filter(p => {
        if (SCATTER_FILTERS.leagues.length > 0 && !SCATTER_FILTERS.leagues.includes(p.league)) return false;
        if (SCATTER_FILTERS.nationalities.length > 0 && !SCATTER_FILTERS.nationalities.includes(p.nationality)) return false;
        if (SCATTER_FILTERS.positions.length > 0 && !SCATTER_FILTERS.positions.includes(p.position)) return false;
        if (p.age < SCATTER_FILTERS.minAge || p.age > SCATTER_FILTERS.maxAge) return false;
        if (p.mins_played < SCATTER_FILTERS.minMins || p.mins_played > SCATTER_FILTERS.maxMins) return false;
        return true;
    });

    if (filteredPlayers.length === 0) {
        svg.innerHTML = `<text x="${width/2}" y="${height/2}" fill="#64748b" text-anchor="middle" font-weight="700">INGEN MATCHER DINE FILTRE</text>`;
        return;
    }

    let xVals = filteredPlayers.map(p => p.stats[SCATTER_X_AXIS] || 0);
    let yVals = filteredPlayers.map(p => p.stats[SCATTER_Y_AXIS] || 0);
    let minMinsGlobal = Math.min(...filteredPlayers.map(p => p.mins_played));
    let maxMinsGlobal = Math.max(...filteredPlayers.map(p => p.mins_played));

    // 🎯 SEMANTISK COLORBAR-TABEL: Nu omdannet til en fejlsikker og urokkelig tabelkanal
    // 🎯 OPPDATERET MARKUP: Tilføjet klasser til minuttallene på siderne
    // 🎯 GLOBAL RENSNING: Minuttal på siderne og den øverste footer-linje er nu fjernet permanent overalt
    const colorbarTarget = $sc("scatter-live-colorbar-target");
    if (colorbarTarget) {
        colorbarTarget.innerHTML = `
            <table class="scatter-colorbar-table">
                <tr>
                    <!-- De to tal på siderne er slettet, så kun selve colorbaren er tilbage i midten -->
                    <td style="text-align: center; width: 100%;">
                        <div class="scatter-colorbar-gradient"></div>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center; padding-top: 8px !important;">
                        <span class="scatter-colorbar-text-fix">MINUTES PLAYED &rarr;</span>
                    </td>
                </tr>
            </table>
            
            <table class="scatter-footer-table">
                <!-- Den øverste 'Performance Distribution' linje er fjernet helt herfra -->
                <tr class="footer-line-bottom"><td>Generated via per-90.streamlit.app</td></tr>
            </table>
        `;
    }



    const calculateNiceAxisBounds = (minVal, maxVal) => {
        if (maxVal === minVal) maxVal += 1;
        const rawRange = maxVal - minVal;
        const rawStep = rawRange / 4;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
        const residual = rawStep / magnitude;
        
        let cleanStep;
        if (residual < 1.5) cleanStep = 1 * magnitude;
        else if (residual < 3) cleanStep = 2 * magnitude;
        else if (residual < 7) cleanStep = 5 * magnitude;
        else cleanStep = 10 * magnitude;

        let cleanMin = Math.floor(minVal / cleanStep) * cleanStep;
        if (minVal >= 0 && cleanMin < 0) cleanMin = 0;
        let cleanMax = cleanMin + (cleanStep * 4);
        
        if (cleanMax < maxVal) cleanMax += cleanStep;
        if (cleanMin > minVal) cleanMin -= cleanStep;

        return { min: cleanMin, max: cleanMax };
    };

    const boundsX = calculateNiceAxisBounds(Math.min(...xVals), Math.max(...xVals));
    const boundsY = calculateNiceAxisBounds(Math.min(...yVals), Math.max(...yVals));

    let minX = boundsX.min, maxX = boundsX.max;
    let minY = boundsY.min, maxY = boundsY.max;

    const getXPixel = v => padding.left + ((v - minX) / (maxX - minX)) * graphWidth;
    const getYPixel = v => padding.top + graphHeight - ((v - minY) / (maxY - minY)) * graphHeight;

    const getMinutesColor = (m) => {
        const pct = (m - minMinsGlobal) / (maxMinsGlobal - minMinsGlobal || 1);
        if (pct < 0.5) {
            const r = Math.round(30 + (162 - 30) * (pct * 2));
            const g = Math.round(58 + (28 - 58) * (pct * 2));
            const b = Math.round(138 + (175 - 138) * (pct * 2));
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            const r = Math.round(162 + (168 - 162) * ((pct - 0.5) * 2));
            const g = Math.round(28 + (240 - 28) * ((pct - 0.5) * 2));
            const b = Math.round(175 + (12 - 175) * ((pct - 0.5) * 2));
            return `rgb(${r}, ${g}, ${b})`;
        }
    };

    let markup = "";

    for (let i = 0; i <= 4; i++) {
        const xVal = minX + (i / 4) * (maxX - minX);
        const yVal = minY + (i / 4) * (maxY - minY);
        const px = getXPixel(xVal);
        const py = getYPixel(yVal);
        
        markup += `<line x1="${px}" y1="${padding.top}" x2="${px}" y2="${padding.top + graphHeight}" class="scatter-grid-line" style="stroke-dasharray:3,3;" />`;
        markup += `<line x1="${padding.left}" y1="${py}" x2="${padding.left + graphWidth}" y2="${py}" class="scatter-grid-line" style="stroke-dasharray:3,3;" />`;

        markup += `<text x="${px}" y="${padding.top + graphHeight + 16}" fill="#475569" font-size="9" text-anchor="middle" font-family="'Gabarito', sans-serif" font-weight="700">${xVal.toFixed(2)}</text>`;
        markup += `<text x="${padding.left - 8}" y="${py}" fill="#475569" font-size="9" text-anchor="end" dominant-baseline="middle" font-family="'Gabarito', sans-serif" font-weight="700">${yVal.toFixed(2)}</text>`;
    }

    markup += `<line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + graphHeight}" class="scatter-axis-line" />`;
    markup += `<line x1="${padding.left}" y1="${padding.top + graphHeight}" x2="${padding.left + graphWidth}" y2="${padding.top + graphHeight}" class="scatter-axis-line" />`;

    const xLabelX = padding.left + graphWidth / 2;
    const xLabelY = height - 12; 
    markup += `<text x="${xLabelX}" y="${xLabelY}" class="scatter-axis-lbl" text-anchor="middle">${SCATTER_X_AXIS}</text>`;

    const yLabelX = 16;
    const yLabelY = padding.top + graphHeight / 2;
    markup += `<text x="${yLabelX}" y="${yLabelY}" class="scatter-axis-lbl" text-anchor="middle" transform="rotate(-90, ${yLabelX}, ${yLabelY})">${SCATTER_Y_AXIS}</text>`;

    continueBuildingScatterPlotPoints(svg, markup, filteredPlayers, getXPixel, getYPixel, getMinutesColor);
}
// ==========================================================================
// PER 90 - SCATTER.JS - DEL 4 AF 6 (NODE PLOTTER & YELLOW-GLOW TOOLTIP)
// ==========================================================================

function continueBuildingScatterPlotPoints(svg, markup, filteredPlayers, getXPixel, getYPixel, getMinutesColor) {
    const sortedX = [...filteredPlayers].sort((a,b) => (b.stats[SCATTER_X_AXIS]||0) - (a.stats[SCATTER_X_AXIS]||0)).slice(0, 10);
    const sortedY = [...filteredPlayers].sort((a,b) => (b.stats[SCATTER_Y_AXIS]||0) - (a.stats[SCATTER_Y_AXIS]||0)).slice(0, 10);

    filteredPlayers.forEach(p => {
        const xV = p.stats[SCATTER_X_AXIS] || 0, yV = p.stats[SCATTER_Y_AXIS] || 0;
        const cx = getXPixel(xV), cy = getYPixel(yV);

        const isTarget = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER && p.player_name.toLowerCase() === CURRENT_SELECTED_PLAYER.toLowerCase());
        
        let isHighlighted = false;
        if (SCATTER_QUICK_HIGHLIGHTS.top10x && sortedX.includes(p)) isHighlighted = true;
        if (SCATTER_QUICK_HIGHLIGHTS.top10y && sortedY.includes(p)) isHighlighted = true;
        if (SCATTER_QUICK_HIGHLIGHTS.u21 && p.age > 0 && p.age <= 21) isHighlighted = true;
        if (SCATTER_QUICK_HIGHLIGHTS.u19 && p.age > 0 && p.age <= 19) isHighlighted = true;
        if (SCATTER_FILTERS.highlightTeam && p.team.toLowerCase() === SCATTER_FILTERS.highlightTeam) isHighlighted = true;
        if (SCATTER_FILTERS.highlightPlayer && p.player_name.toLowerCase() === SCATTER_FILTERS.highlightPlayer) isHighlighted = true;

        const anyHighlightActive = SCATTER_QUICK_HIGHLIGHTS.top10x || SCATTER_QUICK_HIGHLIGHTS.top10y || SCATTER_QUICK_HIGHLIGHTS.u21 || SCATTER_QUICK_HIGHLIGHTS.u19 || SCATTER_FILTERS.highlightTeam || SCATTER_FILTERS.highlightPlayer;
        const opacity = isTarget ? 1 : (isHighlighted ? 1 : (anyHighlightActive ? 0.12 : 0.45));
        
        const nodeColor = isTarget ? "#d946ef" : getMinutesColor(p.mins_played);
        const radius = isTarget ? 6.5 : (isHighlighted ? 5.5 : 4.5);

        const cleanName = p.player_name.replace(/'/g, "\\\\'");
        const cleanTeam = p.team.replace(/'/g, "\\\\'");
        const cleanLeague = p.league.replace(/'/g, "\\\\'");
        const cleanPos = p.position.replace(/'/g, "\\\\'");
        const cleanNat = p.nationality.replace(/'/g, "\\\\'");

        markup += `<circle class="scatter-node-dot" cx="${cx}" cy="${cy}" r="${radius}" fill="${nodeColor}" style="opacity: ${opacity};"
            onmouseover="showScatterLiveTooltip(event, '${cleanName}', '${cleanTeam}', '${cleanLeague}', '${cleanPos}', '${cleanNat}', ${p.age}, ${p.mins_played}, ${xV}, ${yV})" 
            onmouseout="hideScatterLiveTooltip()" />`;

        if (isHighlighted || isTarget) {
            markup += `<text x="${cx}" y="${cy - 9}" class="scatter-player-text-label" text-anchor="middle" style="opacity: ${opacity};">${p.player_name}</text>`;
        }
    });

    svg.innerHTML = markup;
}

function showScatterLiveTooltip(e, name, team, league, pos, nat, age, mins, xVal, yVal) {
    const tooltip = $sc("scatter-live-tooltip"); if (!tooltip) return;
    
    tooltip.innerHTML = `
        <div class="sc-tt-header-box">
            <div class="sc-tt-name">${name}</div>
            <div class="sc-tt-meta">${team} | ${league}</div>
        </div>
        <div class="sc-tt-body-box">
            <div class="sc-tt-stat-row"><span class="sc-tt-stat-lbl">Position:</span><span class="sc-tt-stat-val" style="color:#00f0ff;">${pos}</span></div>
            <div class="sc-tt-stat-row"><span class="sc-tt-stat-lbl">Nationality:</span><span class="sc-tt-stat-val" style="color:#fff;">${nat}</span></div>
            <div class="sc-tt-stat-row"><span class="sc-tt-stat-lbl">Age:</span><span class="sc-tt-stat-val">${age} ÅR</span></div>
            <div class="sc-tt-stat-row"><span class="sc-tt-stat-lbl">Minutes:</span><span class="sc-tt-stat-val">${mins}m</span></div>
            <div class="sc-tt-stat-row" style="margin-top:4px;"><span class="sc-tt-stat-lbl">${SCATTER_X_AXIS}:</span><span class="sc-tt-stat-val">${xVal.toFixed(2)}</span></div>
            <div class="sc-tt-stat-row"><span class="sc-tt-stat-lbl">${SCATTER_Y_AXIS}:</span><span class="sc-tt-stat-val">${yVal.toFixed(2)}</span></div>
        </div>
    `;

    tooltip.style.opacity = "1";
    const rect = $sc("scatter-capture-target-area").getBoundingClientRect();
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    let targetLeft = mouseX + 15;
    let targetTop = mouseY + 15;

    if (mouseX + tooltipWidth + 25 > rect.width) { targetLeft = mouseX - tooltipWidth - 15; }
    if (mouseY + tooltipHeight + 25 > rect.height) { targetTop = mouseY - tooltipHeight - 15; }

    if (targetLeft < 5) targetLeft = 5;
    if (targetTop < 5) targetTop = 5;

    tooltip.style.left = `${targetLeft}px`;
    tooltip.style.top = `${targetTop}px`;
}

function hideScatterLiveTooltip() { 
    const tooltip = $sc("scatter-live-tooltip"); 
    if (tooltip) { tooltip.style.opacity = "0"; tooltip.style.left = "-9999px"; tooltip.style.top = "-9999px"; }
}
// ==========================================================================
// PER 90 - SCATTER.JS - DEL 5 AF 6 (SETTINGS DRAWER PANEL GENERATOR)
// ==========================================================================

function buildAndAppendScatterDrawerHTML() {
    const gammelDrawer = document.querySelector('.scatter-filter-drawer');
    if (gammelDrawer) gammelDrawer.remove();

    const list = SCATTER_GLOBAL_DATA.players;
    const availableAxes = SCATTER_GLOBAL_DATA.available_axes;

    const leagues = [...new Set(list.map(p => p.league).filter(Boolean).sort())];
    const nationalities = [...new Set(list.map(p => p.nationality).filter(Boolean).sort())];
    const positions = [...new Set(list.map(p => p.position).filter(Boolean).sort())];
    const teams = ["Highlight Hold...", ...new Set(list.map(p => p.team).filter(Boolean).sort())];
    const players = ["Highlight Spillere...", ...new Set(list.map(p => p.player_name).filter(Boolean).sort())];

    const xOptions = availableAxes.map(ax => `<option value="${ax}" ${ax === SCATTER_X_AXIS ? 'selected' : ''}>${ax}</option>`).join('');
    const yOptions = availableAxes.map(ax => `<option value="${ax}" ${ax === SCATTER_Y_AXIS ? 'selected' : ''}>${ax}</option>`).join('');
    
    const lCheckboxes = leagues.map(l => {
        const checked = SCATTER_FILTERS.leagues.includes(l);
        return `<label class="sc-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${l}" ${checked ? "checked" : ""} onchange="handleScatterCheckboxToggle(this, 'leagues')" style="accent-color: var(--accent-purple);"> ${l}</label>`;
    }).join('');

    const nCheckboxes = nationalities.map(n => {
        const checked = SCATTER_FILTERS.nationalities.includes(n);
        return `<label class="sc-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${n}" ${checked ? "checked" : ""} onchange="handleScatterCheckboxToggle(this, 'nationalities')" style="accent-color: var(--accent-purple);"> ${n}</label>`;
    }).join('');

    const pCheckboxes = positions.map(pos => {
        const checked = SCATTER_FILTERS.positions.includes(pos);
        return `<label class="sc-drawer-checkbox-label" style="opacity: ${checked ? 1 : 0.4};"><input type="checkbox" value="${pos}" ${checked ? "checked" : ""} onchange="handleScatterCheckboxToggle(this, 'positions')" style="accent-color: var(--accent-purple);"> ${pos}</label>`;
    }).join('');

    const teamOptions = teams.map(t => `<option value="${t === "Highlight Hold..." ? "" : t}" ${t.toLowerCase() === SCATTER_FILTERS.highlightTeam ? 'selected' : ''}>${t}</option>`).join('');
    const playerOptions = players.map(p => `<option value="${p === "Highlight Spillere..." ? "" : p}" ${p.toLowerCase() === SCATTER_FILTERS.highlightPlayer ? 'selected' : ''}>${p}</option>`).join('');

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer stats-filter-drawer scatter-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Plot Settings</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display: flex; flex-direction: column; gap: 14px; width: 100%; max-height: 85vh; overflow-y: auto;">
            
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Stat Type</label><select id="sc-opt-stat-type" class="scatter-drawer-select" onchange="handleScatterConfigChange()"><option value="Per 90" ${SCATTER_STAT_TYPE === "Per 90" ? "selected" : ""}>Per 90</option><option value="Total" ${SCATTER_STAT_TYPE === "Total" ? "selected" : ""}>Total</option></select></div>
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">X Axis Metric</label><select id="sc-opt-x-axis" class="scatter-drawer-select" onchange="handleScatterConfigChange()">${xOptions}</select></div>
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Y Axis Metric</label><select id="sc-opt-y-axis" class="scatter-drawer-select" onchange="handleScatterConfigChange()">${yOptions}</select></div>
            
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Leagues</label><div class="sc-drawer-checkbox-box">${lCheckboxes}</div></div>
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Nationalities</label><div class="sc-drawer-checkbox-box">${nCheckboxes}</div></div>
            <div class="scatter-drawer-group"><label class="scatter-drawer-label">Positions</label><div class="sc-drawer-checkbox-box">${pCheckboxes}</div></div>

            <div class="scatter-drawer-group">
                <label class="scatter-drawer-label">Age (Min / Max)</label>
                <div class="scatter-drawer-input-row">
                    <input type="number" id="sc-filt-min-age" class="scatter-drawer-input" value="${SCATTER_FILTERS.minAge}" oninput="handleScatterFilterInputChange()">
                    <input type="number" id="sc-filt-max-age" class="scatter-drawer-input" value="${SCATTER_FILTERS.maxAge}" oninput="handleScatterFilterInputChange()">
                </div>
            </div>
            <div class="scatter-drawer-group">
                <label class="scatter-drawer-label">Minutes (Min / Max)</label>
                <div class="scatter-drawer-input-row">
                    <input type="number" id="sc-filt-min-mins" class="scatter-drawer-input" value="${SCATTER_FILTERS.minMins}" oninput="handleScatterFilterInputChange()">
                    <input type="number" id="sc-filt-max-mins" class="scatter-drawer-input" value="${SCATTER_FILTERS.maxMins}" oninput="handleScatterFilterInputChange()">
                </div>
            </div>

            <div class="scatter-drawer-group">
                <label class="scatter-drawer-label">Highlight Team</label>
                <select id="sc-toolbar-team" class="scatter-drawer-select" onchange="handleToolbarFilterChange('team')">${teamOptions}</select>
            </div>
            <div class="scatter-drawer-group">
                <label class="scatter-drawer-label">Highlight Player</label>
                <select id="sc-toolbar-player" class="scatter-drawer-select" onchange="handleToolbarFilterChange('player')">${playerOptions}</select>
            </div>
        </div>
    `;
    document.body.appendChild(drawerDiv);
    activateScatterGridVisibility();
}

function activateScatterGridVisibility() {
    const gridLines = document.getElementById('sc-grid-density-styles') || document.createElement('style');
    gridLines.id = 'sc-grid-density-styles';
    gridLines.innerHTML = ` .scatter-grid-line { stroke: rgba(255,255,255,0.12) !important; } `;
    if (!document.getElementById('sc-grid-density-styles')) { document.head.appendChild(gridLines); }
}
// ==========================================================================
// PER 90 - SCATTER.JS - DEL 6 AF 6 (API SYNC & INTERACTION HANDLING)
// ==========================================================================

async function loadScatterAPIDataFeed() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/scatter-data?stat_type=${encodeURIComponent(SCATTER_STAT_TYPE)}`);
        if (res.ok) {
            SCATTER_GLOBAL_DATA = await res.json();
            const list = SCATTER_GLOBAL_DATA.players;

            if (list.length > 0) {
                const ages = list.map(p => p.age).filter(a => a > 0);
                const mins = list.map(p => p.mins_played).filter(m => m > 0);
                SCATTER_FILTERS.minAge = Math.min(...ages); SCATTER_FILTERS.maxAge = Math.max(...ages);
                SCATTER_FILTERS.minMins = Math.min(...mins); SCATTER_FILTERS.maxMins = Math.max(...mins);
            }

            buildAndAppendScatterDrawerHTML();
            buildScatterQuickToolbarUI();
            buildScatterPlotVektorEngine();
        }
    } catch (e) { console.error("Scatter API fejl:", e); }
}

async function handleScatterConfigChange() {
    const typeSelect = $sc("sc-opt-stat-type"), xSelect = $sc("sc-opt-x-axis"), ySelect = $sc("sc-opt-y-axis");
    if (!typeSelect || !xSelect || !ySelect) return;
    const nytType = typeSelect.value; SCATTER_X_AXIS = xSelect.value; SCATTER_Y_AXIS = ySelect.value;
    if (nytType !== SCATTER_STAT_TYPE) { SCATTER_STAT_TYPE = nytType; await loadScatterAPIDataFeed(); } 
    else { buildScatterPlotVektorEngine(); }
}

function handleScatterFilterInputChange() {
    if (!$sc("sc-filt-min-age")) return;
    SCATTER_FILTERS.minAge = parseInt($sc("sc-filt-min-age").value) || 0;
    SCATTER_FILTERS.maxAge = parseInt($sc("sc-filt-max-age").value) || 100;
    SCATTER_FILTERS.minMins = parseInt($sc("sc-filt-min-mins").value) || 0;
    SCATTER_FILTERS.maxMins = parseInt($sc("sc-filt-max-mins").value) || 99999;
    buildScatterPlotVektorEngine();
}

function handleScatterCheckboxToggle(cb, key) {
    const val = cb.value;
    if (cb.checked) {
        if (!SCATTER_FILTERS[key].includes(val)) SCATTER_FILTERS[key].push(val);
    } else {
        SCATTER_FILTERS[key] = SCATTER_FILTERS[key].filter(v => v !== val);
    }
    cb.parentElement.style.opacity = cb.checked ? '1' : '0.4';
    buildScatterPlotVektorEngine();
}

function handleToolbarFilterChange(type) {
    if (type === 'team') {
        SCATTER_FILTERS.highlightTeam = $sc("sc-toolbar-team").value.trim().toLowerCase();
    } else if (type === 'player') {
        SCATTER_FILTERS.highlightPlayer = $sc("sc-toolbar-player").value.trim().toLowerCase();
    }
    buildScatterPlotVektorEngine();
}

function toggleScatterQuickHighlight(key) {
    SCATTER_QUICK_HIGHLIGHTS[key] = !SCATTER_QUICK_HIGHLIGHTS[key];
    buildScatterQuickToolbarUI();
    buildScatterPlotVektorEngine();
}

function downloadScatterPNG() {
    const el = $sc("scatter-capture-target-area"); if (!el) return;
    html2canvas(el, { scale: 4, backgroundColor: "#0B1220", useCORS: true, logging: false }).then(canvas => {
        const link = document.createElement("a"); link.download = `scatter_plot_${SCATTER_X_AXIS}_vs_${SCATTER_Y_AXIS}.png`;
        link.href = canvas.toDataURL("image/png"); link.click();
    });
}

document.addEventListener("click", e => {
    if (!e.target.closest('#scatter-player-wrapper')) { const p = $sc("scatter-player-options"); if(p) p.style.display = "none"; }
});
