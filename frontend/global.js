// ==========================================================================
// PER 90 - GLOBAL.JS - DEL 1 AF 2 (ROUTING OG WEB INTERFACE ENGINE)
// ==========================================================================

// Finder automatisk ud af om du tester lokalt eller kører live på Render
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : window.location.origin;

// Global reference til dit pizza-chart objekt
let pizzaChartInstance = null;

/**
 * Central router der styrer alt indhold på skærmen baseret på den valgte fane
 */
function switchView(viewId) {
    console.log("LOG: Skifter visning til -> " + viewId);
    
    // 1. Navigation opdateringer (behold dine eksisterende linjer her...)
    const allNavItems = document.querySelectorAll('.nav-item');
    allNavItems.forEach(item => item.classList.remove('active'));
    allNavItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'" + viewId + "'")) {
            item.classList.add('active');
        }
    });

    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) navMenu.classList.remove('mobile-open');

    // 2. Find det centrale område
    const contentArea = document.getElementById('dynamic-content-area');
    if (!contentArea) return;

    // 🎯 GLOBAL OPRYDNING: Sletter alle gamle skuffer i body, så de ikke overlapper hinanden!
    const eksisterendeSkuffer = document.querySelectorAll('.filter-drawer');
    eksisterendeSkuffer.forEach(drawer => drawer.remove());

    // Luk også slørings-overlayet ned ved faneskift, hvis det var åbent
    if (typeof closeGlobalDrawer === 'function') {
        closeGlobalDrawer();
    }

    const fallbackPlayer = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) ? CURRENT_SELECTED_PLAYER : "";

    // ... resten af din switchView if/else logik (Home, pizza, radar osv.) fortsætter uforstyrret herunder ...


    // 3. ROUTING LOGIK 🎯
    
    // Visning: HOME / LANDING PAGE (Bevaret 1:1)
    if (viewId === 'landing' || viewId === 'home') {
        contentArea.innerHTML = `
            <section id="view-landing" class="content-view active">
                <div class="hero-container">
                    <div class="dashboard-tag">JOGA BONITO EDITION</div>
                    <h1 class="hero-title">ALL YOU NEED<br><span class="highlight">PER 90.</span></h1>
                    <p class="hero-subtitle">Avanceret performance-filtrering på tværs af historiske og moderne topdivisioner.</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card c-rooney"><div class="stat-value">4.440</div><div class="stat-label">Minutter</div><div class="stat-desc">Højeste spilletid</div></div>
                    <div class="stat-card c-ronaldinho"><div class="stat-value">684</div><div class="stat-label">Spillere</div><div class="stat-desc">Liga-database</div></div>
                    <div class="stat-card c-davids"><div class="stat-value">47</div><div class="stat-label">Metrikker</div><div class="stat-desc">Parametre målt pr. kamp</div></div>
                    <div class="stat-card c-henry"><div class="stat-value">73</div><div class="stat-label">Modeller</div><div class="stat-desc">Taktiske spillestile</div></div>
                </div>
            </section>
        `;
    } 
    // Visning: PIZZA CHART
    else if (viewId === 'pizza') {
        if (typeof initPizzaView === 'function') {
            initPizzaView(contentArea);
            if (fallbackPlayer && typeof onPizzaFilterChange === 'function') {
                onPizzaFilterChange();
            }
        } else {
            console.error("FEJL: initPizzaView() blev ikke fundet i pizza.js");
        }
    } 
    // Visning: RADAR CHART (Ny live fane!) 🕸️
    else if (viewId === 'radar') {
        if (typeof initRadarView === 'function') {
            initRadarView(contentArea);
            if (fallbackPlayer && typeof onRadarFilterChange === 'function') {
                onRadarFilterChange();
            }
        } else {
            console.error("FEJL: initRadarView() blev ikke fundet i radar.js");
        }
    }
    // Visning: PLACEHOLDERS (De andre 8 faner under opbygning)
    else {
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
// ==========================================================================
// PER 90 - GLOBAL.JS - DEL 2 AF 2 (HJÆLPEFUNKTIONER OG MOBILSTYRING)
// ==========================================================================

/**
 * Global hjælpefunktion der kaldes, når brugeren ændrer noget i dine pizza-filtre
 */
function triggerPizzaUpdate() {
    if (typeof onPizzaFilterChange === 'function') {
        onPizzaFilterChange();
    }
}

/**
 * Henter valgte tjekbokse og opdaterer data for pizza-diagrammet
 */
async function loadPizzaChartData(playerName) {
    if (typeof loadPizzaChartDataWithFilters === 'function' && typeof CURRENT_SELECTED_POS !== 'undefined') {
        const checkboxes = document.querySelectorAll('#checkboxes-container input[type="checkbox"]');
        const selected = [];
        checkboxes.forEach(cb => { if (cb.checked) selected.push(cb.value); });
        await loadPizzaChartDataWithFilters(playerName, CURRENT_SELECTED_POS, selected);
    }
}

/**
 * 🎯 MOBILSTYLING HJÆLPER: Sørger for, at mobilmenuen åbner og lukker fejlfrit,
 * når man klikker på selve menu-titlen/pilen på telefonen!
 */
function toggleMobileMenu(event) {
    // Hvis brugeren har klikket på en reel fane/knap indeni menuen, lader vi switchView håndtere det
    if (event.target.closest('.nav-item')) return;
    
    // Ellers har de trykket på selve dropdown-pilen i toppen, og vi toggler åben/lukket statussen
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('mobile-open');
    }
}
