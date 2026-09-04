// --- INTERFACE STYRESYSTEM FOR PER 90 ---

// Dynamisk URL: Finder automatisk ud af om du tester lokalt (port 8000) eller kører live på Render!
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? 'http://127.0.0.1:8000'
    : window.location.origin;

// Global reference til dit pizza-chart objekt så vi kan nulstille det uden memory leaks
let pizzaChartInstance = null;

/**
 * Funktion der skifter fane i din sidebar og aktiverer de rigtige HTML-sektioner.
 * @param {string} viewId - Id'et på den fane du vil skifte til (landing, pizza, radar, scatter)
 */
function switchView(viewId) {
    console.log("LOG: Skifter visning til -> " + viewId);
    
    // 1. Find og deaktiver alle nuværende visninger
    const allViews = document.querySelectorAll('.content-view');
    allViews.forEach(view => view.classList.remove('active'));
    
    // 2. Fjern active-klassen fra alle knapper i sidebaren
    const allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(item => item.classList.remove('active'));
    
    // 3. Aktiver den valgte sektion i HTML'en
    const targetView = document.getElementById('view-' + viewId);
    if (targetView) {
        targetView.classList.add('active');
    } else {
        console.error("FEJL: Sektionen 'view-" + viewId + "' findes ikke i HTML.");
        return;
    }
    
    // 4. Gør den klikkede knap aktiv i sidebaren
    allNavItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'" + viewId + "'")) {
            item.classList.add('active');
        }
    });

    // 5. DYNAMISK DATA-TRIGGER FOR HVER FANE (VÆK MED DELANEY)
    if (viewId === 'pizza') {
        // Hvis pizza-js har sat en global startspiller fra din CSV, bruger vi den med det samme!
        const currentPlayer = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) 
            ? CURRENT_SELECTED_PLAYER 
            : "";
            
        if (currentPlayer && typeof onPizzaFilterChange === 'function') {
            onPizzaFilterChange(); // Genberegn ud fra dine lilla dropdowns
        }
    } else if (viewId === 'radar') {
        const radarMetrics = ["Goals", "xG", "Successful Dribbles", "Tackles", "Assists"];
        if (typeof loadRadarChartData === 'function') {
            // Midlertidig fallback til første navn hvis muligt, ellers tom streng indtil radar.js opdateres
            const fallbackPlayer = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) ? CURRENT_SELECTED_PLAYER : "";
            loadRadarChartData(fallbackPlayer, fallbackPlayer, radarMetrics);
        }
    } else if (viewId === 'scatter') {
        if (typeof loadScatterPlotData === 'function') {
            const fallbackPlayer = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) ? CURRENT_SELECTED_PLAYER : "";
            loadScatterPlotData(fallbackPlayer);
        }
    }
}

/**
 * Global hjælpefunktion der kaldes når brugeren piller ved dropdown-menuerne i din pizza-sektion
 */
function triggerPizzaUpdate() {
    if (typeof onPizzaFilterChange === 'function') {
        onPizzaFilterChange();
    }
}

/**
 * Henter rå data fra din FastAPI pizza-rute og sender det videre til render-motoren
 */
async function loadPizzaChartData(playerName) {
    // Denne funktion overskrives og styres nu 100% internt af pizza.js (Del 3)
    // Vi beholder den her som en tom sikkerhedsskal for bagudkompatibilitet
    if (typeof loadPizzaChartDataWithFilters === 'function' && typeof CURRENT_SELECTED_POS !== 'undefined') {
        const checkboxes = document.querySelectorAll('#checkboxes-container input[type="checkbox"]');
        const selectedMetrics = [];
        checkboxes.forEach(cb => { if (cb.checked) selectedMetrics.push(cb.value); });
        await loadPizzaChartDataWithFilters(playerName, CURRENT_SELECTED_POS, selectedMetrics);
    }
}