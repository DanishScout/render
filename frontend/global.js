// ==========================================================================
// PER 90 - GLOBAL.JS - CENTRAL INTERFACE ROUTER & APP BRAIN - DEL 1 AF 2
// ==========================================================================

// Finder automatisk ud af, om du tester lokalt eller kører live på Render
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' ? 'http://127.0.0.1:8000' : window.location.origin;

// Global reference til dit pizza-chart objekt
let pizzaChartInstance = null;

/**
 * Central router der styrer alt indhold på skærmen baseret på den valgte fane
 */
function switchView(viewId) {
    console.log("LOG: Skifter visning til -> " + viewId);
    
    // 🎯 DOM-STØVSUGER: Sletter alle gamle faners indstillingsskuffer øjeblikkeligt!
    // Dette forhindrer at dropdowns smitter af på hinanden, når du skifter fane.
    document.querySelectorAll('.filter-drawer, .stats-filter-drawer, .scatter-filter-drawer, .table-filter-drawer').forEach(drawer => {
        drawer.remove();
    });

    // 1. NAVIGATION: Opdater aktive klasser på knapperne i sidebaren
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

    // 2. CONTAINER-TJEK: Find det centrale visningsområde i index.html
    const contentArea = document.getElementById('dynamic-content-area');
    if (!contentArea) {
        console.error("FEJL: Kunne ikke finde #dynamic-content-area i HTML'en.");
        return;
    }

    // Gem den nuværende valgte spiller som fallback til den næste fane, der indlæses
    const fallbackPlayer = (typeof CURRENT_SELECTED_PLAYER !== 'undefined' && CURRENT_SELECTED_PLAYER) ? CURRENT_SELECTED_PLAYER : "";

    // 3. CENTRAL ROUTING MATRIX 🎯
    
    // Visning: HOME / LANDING PAGE med dynamisk datadrevet karrusel
    if (viewId === 'landing' || viewId === 'home') {
        contentArea.innerHTML = `
            <section id="view-landing" class="content-view active">
                <div class="hero-container">
                    <div class="dashboard-tag">LIVE DATABASE STATS</div>
                    <h1 class="hero-title">ALL YOU NEED<br><span class="highlight">PER 90</span></h1>
                    <p class="hero-subtitle">Avancerede statistikker fra 25 ligaer på tværs af hele verden. Top-præstationer trackes live direkte fra datasættene.</p>
                </div>
                
                <!-- Karrusel Sektion -->
                <div class="carousel-wrapper" style="margin-top: 40px;">
                    <h3 id="carousel-metric-title" style="font-size: 18px; text-transform: uppercase; color: var(--text-primary); letter-spacing: 2px; margin-bottom: 20px; transition: opacity 0.3s;">
                        Indlæser top-spillere...
                    </h3>
                    <div class="stats-grid" id="carousel-cards-container" style="transition: opacity 0.4s ease-in-out;">
                        <!-- JavaScript indsætter de 3 stat-cards automatisk her -->
                    </div>
                </div>
            </section>
        `;

        // Start karrusellen op med det samme ved indlæsning
        updateHomeCarousel();
        
        // Nulstil og genstart interval-timeren (Skifter slide hvert 7. sekund - Uendeligt loop)
        if (window.carouselInterval) clearInterval(window.carouselInterval);
        window.carouselInterval = setInterval(updateHomeCarousel, 7000);
    } 
    // Visning: PIZZA CHART ENGINE
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
    // Visning: RADAR SPIDERWEB ENGINE
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
    // Visning: PLAYER STATS PROFILE DASHBOARD
    else if (viewId === 'player_stats') {
        if (typeof initPlayerStatsView === 'function') {
            initPlayerStatsView(contentArea);
            if (fallbackPlayer && typeof onStatsFilterChange === 'function') {
                onStatsFilterChange();
            }
        } else {
            console.error("FEJL: initPlayerStatsView() blev ikke fundet i stats.js");
        }
    }
    // Visning: SCATTER PLOT COORDINATE GRAPH
    else if (viewId === 'scatter') {
        if (typeof initScatterView === 'function') {
            initScatterView(contentArea);
            if (fallbackPlayer && typeof onScatterFilterChange === 'function') {
                onScatterFilterChange();
            }
        } else {
            console.error("FEJL: initScatterView() blev ikke fundet i scatter.js");
        }
    }
    // Visning: TOP 10 LEADERBOARD TABLE
    else if (viewId === 'table') {
        if (typeof initTableView === 'function') {
            initTableView(contentArea);
            if (fallbackPlayer && typeof onTableFilterChange === 'function') {
                onTableFilterChange();
            }
        } else {
            console.error("FEJL: initTableView() blev ikke fundet i table.js");
        }
    }
    // Visning: ADVANCED STAT FILTERS ENGINE
    else if (viewId === 'stat_filters') {
        if (typeof initFiltersView === 'function') {
            initFiltersView(contentArea);
            if (fallbackPlayer && typeof onFiltersFilterChange === 'function') {
                onFiltersFilterChange();
            }
        } else {
            console.error("FEJL: initFiltersView() blev ikke fundet i filters.js");
        }
    }
    // Visning: PLAYER SIMILARITY ENGINE
    else if (viewId === 'similarity') {
        if (typeof initSimilarityView === 'function') {
            initSimilarityView(contentArea);
            if (fallbackPlayer && typeof onSimilarityFilterChange === 'function') {
                onSimilarityFilterChange();
            }
        } else {
            console.error("FEJL: initSimilarityView() blev ikke fundet i similarity.js");
        }
    }
    // Visning: CUSTOM PERFORMANCE RANKING ENGINE
    else if (viewId === 'ranking') {
        if (typeof initRankingView === 'function') {
            initRankingView(contentArea);
            if (fallbackPlayer && typeof onRankingFilterChange === 'function') {
                onRankingFilterChange();
            }
        } else {
            console.error("FEJL: initRankingView() blev ikke fundet i ranking.js");
        }
    }
    // Visning: TACTICAL MATCH REPORT ENGINE
    else if (viewId === 'matchreport') {
        if (typeof initMatchReportView === 'function') {
            initMatchReportView(contentArea);
        } else {
            console.error("FEJL: initMatchReportView() blev ikke fundet i matchreport.js");
        }
    }
    // Visning: WHOSCORED ADVANCED EVENT DATA ENGINE
    else if (viewId === 'eventdata') {
        if (typeof initEventDataView === 'function') {
            initEventDataView(contentArea);
        } else {
            console.error("FEJL: initEventDataView() blev ikke fundet i eventdata.js");
        }
    }
    // Visning: FALLBACK PLACEHOLDERS
    else {
        const faneNavn = viewId.replace('_', ' ').toUpperCase();
        contentArea.innerHTML = `
            <section class="content-view active" style="text-align: center; padding: 60px 20px;">
                <div style="margin-bottom: 20px;">
                    <i class="fa-solid fa-screwdriver-wrench" style="font-size: 60px; color: var(--text-muted); opacity: 0.5;"></i>
                </div>
                <h2 style="font-size: 24px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px;">${faneNavn}</h2>
                <p style="color: var(--text-muted);">Denne fane is under opbygning. Logik og diagrammer tilføjes i din ${viewId}.js fil senere.</p>
            </section>
        `;
    }
}
// ==========================================================================
// MOBIL-NAVIGATION, EVENT HANDLING & LIVE KARRUSEL LOGIK - DEL 2 AF 2
// ==========================================================================

/**
 * Henter top-3 spillere for en tilfældig liga og metric fra API'et i et uendeligt loop
 */
function updateHomeCarousel() {
    const container = document.getElementById('carousel-cards-container');
    const titleElement = document.getElementById('carousel-metric-title');
    const viewLanding = document.getElementById('view-landing');
    
    // 🎯 SKUDSIKKER PAUSE: Hvis elementerne ikke eksisterer på skærmen lige nu, pauser vi roligt.
    // Vi sletter IKKE intervallet her, så det kører uendeligt videre næste gang der klikkes Home.
    if (!container || !titleElement || !viewLanding) {
        return;
    }

    // Fade kortene og overskriften ud (forbereder en blød CSS-transition)
    container.style.opacity = '0';
    titleElement.style.opacity = '0';

    // Afvent at fade-out animationen er færdig, før data loades ind
    setTimeout(() => {
        // Dobbelttjek at brugeren ikke har forladt fanen under de 400ms fade transition
        if (!document.getElementById('carousel-cards-container')) return;

        fetch(`${API_BASE_URL}/api/carousel`)
            .then(res => res.json())
            .then(data => {
                if (data.error || !data.players || data.players.length === 0) {
                    titleElement.innerText = "SØGER EFTER STATISTIKKER...";
                    container.innerHTML = "";
                    return;
                }
    
                // 1. Definer om det er Total eller Per 90
                let formattedMetricSentence = "";
                if (data.suffix_type === "Total") {
                    formattedMetricSentence = `TOTAL ${data.metric_name}`;
                } else {
                    formattedMetricSentence = `${data.metric_name} PER 90`;
                }

                // 2. Container med lav opacity, centreret tekst og den blinkende lygte til venstre
                titleElement.style.textTransform = "uppercase";
                titleElement.style.width = "100%";
                titleElement.style.maxWidth = "760px";
                titleElement.style.margin = "0 auto 30px auto";
                
                titleElement.innerHTML = `
                    <div style="background: rgba(14, 28, 20, 0.35); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(30, 58, 39, 0.5); border-radius: 10px; padding: 18px 24px; display: flex; justify-content: center; align-items: center; gap: 14px; box-shadow: 0 8px 32px rgba(0,0,0,0.25); width: 100%;">
                        
                        <!-- Den blinkende lygte er nu placeret direkte til venstre for teksten -->
                        <span style="display: inline-block; width: 7px; height: 7px; background-color: var(--accent-purple); border-radius: 50%; box-shadow: 0 0 10px var(--accent-purple); animation: blinker 1.5s linear infinite; flex-shrink: 0;"></span>
                        
                        <!-- Hele sætningen samlet i én lang, flydende live-tekst -->
                        <h3 style="font-size: 17px; font-weight: 800; color: #ffffff; letter-spacing: 0.8px; margin: 0; line-height: 1.4; text-align: center;">
                            DISCOVER THE CURRENT LEADERS FOR 
                            <span style="color: var(--accent-purple); font-weight: 900;">${formattedMetricSentence}</span> 
                            IN 
                            <span style="color: #ffffff; font-weight: 900; border-bottom: 2px solid var(--accent-purple); padding-bottom: 2px;">${data.league_name}</span>
                        </h3>
                    </div>
                    
                    <style>
                        @keyframes blinker { 50% { opacity: 0; } }
                    </style>
                `;
                
                // 3. Opbyg kortene præcis som de var (Med trøje-ikonet bevaret)
                let cardsHtml = "";
                data.players.forEach((player, index) => {
                    const podiumClasses = ['c-rooney', 'c-ronaldinho', 'c-davids'];
                    const currentPodium = podiumClasses[index] || 'c-henry';
    
                    cardsHtml += `
                        <div class="stat-card ${currentPodium}" style="display: flex; flex-direction: column; justify-content: space-between; min-height: 150px;">
                            <div>
                                <div class="stat-value" style="font-size: 32px; color: var(--text-primary);">${player.value}</div>
                                <div class="stat-label" style="margin-top: 5px; font-size: 13px; font-weight: 800; color: #ffffff;">
                                    #${index + 1} ${player.player_name}
                                </div>
                            </div>
                            <div class="stat-desc" style="font-size: 12px; color: var(--text-muted); margin-top: 10px; display: flex; align-items: center; gap: 8px;">
                                <i class="fa-solid fa-shirt" style="font-size: 10px; color: var(--accent-purple); width: auto !important;"></i> 
                                ${player.team_name}
                            </div>
                        </div>
                    `;
                });
    
                container.innerHTML = cardsHtml;
                
                // Fade indholdet flot ind igen
                container.style.opacity = '1';
                titleElement.style.opacity = '1';
            })


            .catch(err => {
                console.error("Karrusel netværksfejl:", err);
                titleElement.innerText = "HENTER NÆSTE LIGA-METRIK...";
            });
    }, 400);
}

/**
 * Sørger for, at mobilmenuen toggler åben/lukket fejlfrit,
 * når man klikker på selve overskriften/pilen på telefonen!
 */
function toggleMobileMenu(event) {
    if (event.target.closest('.nav-item')) return;
    
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu) {
        navMenu.classList.toggle('mobile-open');
    }
}
