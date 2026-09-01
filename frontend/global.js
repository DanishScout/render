// --- INTERFACE STYRESYSTEM FOR PER 90 ---

function switchView(viewId) {
    console.log("LOG: Skifter visning til -> " + viewId);
    
    // 1. Find og deaktiver alle nuværende visninger
    const allViews = document.querySelectorAll('.content-view');
    allViews.forEach(view => view.classList.remove('active'));
    
    // 2. Fjern active-klassen fra alle knapper i sidebaren
    const allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(item => item.classList.remove('active'));
    
    // 3. Aktiver den valgte sektion
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

    // 5. ASYNKRON DATA-TRIGGER FOR HVER FANE
    const defaultPlayer = "Aaron Opoku";
    
    if (viewId === 'pizza') {
        const selectedMetrics = ["Goals", "xG", "Successful Dribbles", "Dribbles", "Tackles", "Interceptions", "Assists", "Passes"];
        if (typeof loadPizzaChartData === 'function') {
            loadPizzaChartData(defaultPlayer, selectedMetrics);
        }
    } else if (viewId === 'radar') {
        const radarMetrics = ["Goals", "xG", "Successful Dribbles", "Tackles", "Assists"];
        if (typeof loadRadarChartData === 'function') {
            loadRadarChartData(defaultPlayer, "Erling Haaland", radarMetrics);
        }
    } else if (viewId === 'scatter') {
        if (typeof loadScatterPlotData === 'function') {
            loadScatterPlotData(defaultPlayer);
        }
    }
}
