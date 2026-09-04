// --- INTERFACE STYRESYSTEM FOR PER 90 ---

// Finder automatisk ud af om du tester lokalt eller kører live på Render
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : window.location.origin;

// Global reference til dit pizza-chart objekt
let pizzaChartInstance = null;

/**
 * Central router der styrer alt indhold på skærmen baseret på den valgte fane
 */
function switchView(viewId) {
    console.log("LOG: Skifter visning til -> " + viewId);
    
    // 1. NAVIGATION: Opdater aktive klasser på knapperne
    const allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(item => item.classList.remove('active'));
    
    allNavItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'" + viewId + "'")) {
            item.classList.add('active');
        }
    });

    // Luk mobilmenuen hvis den er åben
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) navMenu.classList.remove('mobile-open');

    // 2. CONTAINER-TJEK: Find det centrale område i index.html
    const contentArea = document.getElementById('dynamic-content-area');
    if (!contentArea) {
        console.error("FEJL: Kunne ikke finde #dynamic-content-area i HTML'en.");
        return;
    }

    // Gem den nuværende valgte spiller som fallback til næste fane
    const fallbackPlayer = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) ? CURRENT_SELECTED_PLAYER : "";

    // 3. ROUTING LOGIK 🎯
    
    // Visning: HOME / LANDING PAGE
    if (viewId === 'landing' || viewId === 'home') {
        contentArea.innerHTML = `
            <section id="view-landing" class="content-view active">
                <div class="hero-container">
                    <div class="dashboard-tag">JOGA BONITO EDITION</div>
                    <h1 class="hero-title">ALL YOU NEED<br><span class="highlight">PER 90.</span></h1>
                    <p class="hero-subtitle">Avanceret performance-filtrering på tværs af historiske og moderne topdivisioner.</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card c-rooney">
                        <div class="stat-value">4.440</div>
                        <div class="stat-label">Minutter</div>
                        <div class="stat-desc">Højeste spilletid</div>
                    </div>
                    <div class="stat-card c-ronaldinho">
                        <div class="stat-value">684</div>
                        <div class="stat-label">Spillere</div>
                        <div class="stat-desc">Liga-database</div>
                    </div>
                    <div class="stat-card c-davids">
                        <div class="stat-value">47</div>
                        <div class="stat-label">Metrikker</div>
                        <div class="stat-desc">Parametre målt pr. kamp</div>
                    </div>
                    <div class="stat-card c-henry">
                        <div class="stat-value">73</div>
                        <div class="stat-label">Modeller</div>
                        <div class="stat-desc">Taktiske spillestile</div>
                    </div>
                </div>
            </section>
        `;
    } 
    // Visning: PIZZA CHART (Den eneste rigtige funktionelle fane lige nu)
    else if (viewId === 'pizza') {
        if (typeof initPizzaView === 'function') {
            // Vi beder pizza.js om selv at bygge og tegne sit layout ind i containeren
            initPizzaView(contentArea);
            if (fallbackPlayer && typeof onPizzaFilterChange === 'function') {
                onPizzaFilterChange();
            }
        } else {
            console.error("FEJL: initPizzaView() blev ikke fundet i pizza.js");
        }
    } 
    // Visning: PLACEHOLDERS (Alle de andre 9 faner indtil du bygger dem)
    else {
        // Formaterer viewId til et pænere navn (f.eks. "player_stats" -> "PLAYER STATS")
        const faneNavn = viewId.replace('_', ' ').toUpperCase();
        
        contentArea.innerHTML = `
            <section class="content-view active" style="text-align: center; padding: 60px 20px;">
                <div style="margin-bottom: 20px;">
                    <i class="fa-solid fa-screwdriver-wrench" style="font-size: 60px; color: var(--text-muted); opacity: 0.5;"></i>
                </div>
                <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">${faneNavn}</h2>
                <p style="color: var(--text-muted);">Denne fane er under opbygning. Logik og diagrammer tilføjes i din ${viewId}.js fil senere.</p>
            </section>
        `;
    }
}

/**
 * Global hjælpefunktion der kaldes, når brugeren ændrer noget i dine pizza-filtre
 */
function triggerPizzaUpdate() {
    if (typeof onPizzaFilterChange === 'function') {
        onPizzaFilterChange();
    }
}

/**
 * Henter valgte tjekbokse og opdaterer data
 */
async function loadPizzaChartData(playerName) {
    if (typeof loadPizzaChartDataWithFilters === 'function' && typeof CURRENT_SELECTED_POS !== 'undefined') {
        const checkboxes = document.querySelectorAll('#checkboxes-container input[type="checkbox"]');
        const selectedMetrics = [];
        checkboxes.forEach(cb => { if (cb.checked) selectedMetrics.push(cb.value); });
        await loadPizzaChartDataWithFilters(playerName, CURRENT_SELECTED_POS, selectedMetrics);
    }
}
