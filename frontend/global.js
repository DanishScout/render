// --- INTERFACE STYRESYSTEM FOR PER 90 ---

// Dynamisk URL: Finder automatisk ud af om du tester lokalt (port 8000) eller kører live på Render!
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : window.location.origin;

// Global reference til dit pizza-chart objekt så vi kan nulstille det uden memory leaks
let pizzaChartInstance = null;

/**
 * Funktion der skifter fane i din sidebar og aktiverer de rigtige HTML-sektioner.
 * @param {string} viewId - Id'et på den fane du vil skifte til
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

    // Finder den nuværende valgte spiller (hvis defineret), så vi kan føre spilleren automatisk med over i næste fane!
    const fallbackPlayer = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) ? CURRENT_SELECTED_PLAYER : "";

    // 5. DYNAMISK DATA-TRIGGER FOR SAMTLIGE 10 FANER (SIKRET MOD MANGLENDE JS FILER) 🎯
    if (viewId === 'pizza') {
        if (fallbackPlayer && typeof onPizzaFilterChange === 'function') onPizzaFilterChange();
    } else if (viewId === 'player_stats') {
        if (typeof loadPlayerStatsData === 'function') loadPlayerStatsData(fallbackPlayer);
    } else if (viewId === 'radar') {
        const radarMetrics = ["Goals", "xG", "Successful Dribbles", "Tackles", "Assists"];
        if (typeof loadRadarChartData === 'function') loadRadarChartData(fallbackPlayer, fallbackPlayer, radarMetrics);
    } else if (viewId === 'scatter') {
        if (typeof loadScatterPlotData === 'function') loadScatterPlotData(fallbackPlayer);
    } else if (viewId === 'table') {
        if (typeof loadTableDatabase === 'function') loadTableDatabase();
    } else if (viewId === 'stat_filters') {
        if (typeof applyStatFiltersEngine === 'function') applyStatFiltersEngine();
    } else if (viewId === 'similarity') {
        if (typeof loadPlayerSimilarity === 'function') loadPlayerSimilarity(fallbackPlayer);
    } else if (viewId === 'role_ranks') {
        if (typeof calculateRoleRanks === 'function') calculateRoleRanks();
    } else if (viewId === 'event_data') {
        if (typeof renderEventFieldMap === 'function') renderEventFieldMap(fallbackPlayer);
    } else if (viewId === 'match_report') {
        if (typeof generateAutomatedReport === 'function') generateAutomatedReport(fallbackPlayer);
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
    if (typeof loadPizzaChartDataWithFilters === 'function' && typeof CURRENT_SELECTED_POS !== 'undefined') {
        const checkboxes = document.querySelectorAll('#checkboxes-container input[type="checkbox"]');
        const selectedMetrics = [];
        checkboxes.forEach(cb => { if (cb.checked) selectedMetrics.push(cb.value); });
        await loadPizzaChartDataWithFilters(playerName, CURRENT_SELECTED_POS, selectedMetrics);
    }
}
