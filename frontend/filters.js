// ==========================================================================
// PER 90 - FILTERS.JS - DEL 1 AF 5 (SORT STATES & BASE PERFORMANCE CSS)
// ==========================================================================

let FILTERS_GLOBAL_DATA = null, FILTERS_STAT_TYPE = "Per 90";
let FILTERS_META = { leagues: [], nationalities: [], positions: [], minAge: 0, maxAge: 100, minMins: 0, maxMins: 99999 };
let FILTERS_METRIC_SLIDERS = {}; 

// 🎯 SORTERINGS MASTER STATE (Standard: Sorter efter spilletid faldende)
let FILTERS_SORT = { key: "mins_played", type: "metric", desc: true };

const $f = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://googleapis.com');
        .filters-main-layout { display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 950px; margin: 0 auto; padding: 0 10px; box-sizing: border-box; }
        .filters-data-viewport-wrapper { width: 100%; background: linear-gradient(180deg, #090f1e 0%, #020617 100%); border: 1px solid rgba(255,255,255,0.04); border-radius: 12px; overflow-x: auto; box-sizing: border-box; }
        .filters-dynamic-grid-container { min-width: 100%; display: flex; flex-direction: column; width: max-content; }
        
        /* INTERAKTIVE KLIKBARE COLUMNS HEADERS */
        .filters-scouting-header { display: grid; align-items: center; padding: 14px 20px; font-family: 'Gabarito', sans-serif; font-size: 10.5px; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 2px solid rgba(255,255,255,0.06); background: rgba(15, 23, 42, 0.6); }
        .filters-sort-trigger { cursor: pointer; display: flex; align-items: center; gap: 4px; user-select: none; transition: color 0.1s; }
        .filters-sort-trigger:hover { color: #fff; }
        .filters-sort-trigger.active-sort { color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,0.3); }
        
        .filters-scroll-window { display: flex; flex-direction: column; max-height: 480px; overflow-y: auto; }
        .filters-compact-card { display: grid; align-items: center; padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.02); }
        .filters-compact-card:hover { background: rgba(255,255,255,0.02); }
        .filters-c-cell { display: flex; flex-direction: column; justify-content: center; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 15px; }
        .filters-c-player-name { font-size: 13.5px; font-weight: 800; color: #fff; text-transform: uppercase; }
        .filters-c-subtext { font-size: 10.5px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .filters-c-val-pos { font-size: 11px; font-weight: 800; color: #00f0ff; text-transform: uppercase; text-align: center; }
        .filters-c-val-age, .filters-c-val-mins { font-size: 12px; font-weight: 700; color: #94a3b8; text-align: center; }
        .filters-c-val-metric { font-size: 12.5px; font-weight: 900; color: #f59e0b; text-align: right; padding-right: 10px; }
        .filters-hdr-metric { justify-content: flex-end; padding-right: 10px; }
        .filters-data-viewport-wrapper::-webkit-scrollbar { height: 6px; width: 5px; }
        .filters-data-viewport-wrapper::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
    `;
    document.head.appendChild(style);
});
// ==========================================================================
// PER 90 - FILTERS.JS - DEL 2 AF 5 (MAIN VIEW SETUP & METRIC CSS)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement('style');
    style.innerHTML = `
        .drawer-metrics-section { display: flex; flex-direction: column; gap: 12px; margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.08); }
        .drawer-section-title { font-size: 11px; font-weight: 900; color: #f59e0b; text-transform: uppercase; }
        .filter-compact-row { display: flex; flex-direction: column; gap: 6px; background: #07030c; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); }
        .filter-row-topline { display: flex; align-items: center; justify-content: space-between; }
        .filter-label-checkbox-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: #fff; font-weight: 700; text-transform: uppercase; }
        .filter-row-range-text { font-size: 11px; font-weight: 800; color: #f59e0b; }
        .range-slider-container { display: flex; flex-direction: column; opacity: 0.25; pointer-events: none; }
        .range-slider-container.active { opacity: 1; pointer-events: auto; }
        .range-slider-wrapper { position: relative; width: 100%; height: 16px; display: flex; align-items: center; }
        .filter-native-slider { position: absolute; width: 100%; pointer-events: none; -webkit-appearance: none; background: none; border: none; outline: none; }
        .filter-native-slider::-webkit-slider-runnable-track { background: rgba(255,255,255,0.08); height: 4px; border-radius: 4px; }
        .filter-native-slider.slider-max-input::-webkit-slider-runnable-track { background: none; } 
        .filter-native-slider::-webkit-slider-thumb { -webkit-appearance: none; pointer-events: auto; width: 12px; height: 12px; border-radius: 50%; background: var(--accent-purple, #a855f7); cursor: pointer; position: relative; z-index: 2; margin-top: -4px; }
    `;
    document.head.appendChild(style);
});

async function initFiltersView(container) {
    container.innerHTML = `
        <section id="view-filters" class="content-view active" style="padding-top: 10px;">
            <div style="text-align: center; margin: 0 auto 20px auto;">
                <i class="fa-solid fa-filter" style="font-size: 65px; color: #ffffff; opacity: 0.8; margin-bottom:6px;"></i><br>
                <span style="font-size: 12px; color: #ffffff; opacity: 0.45; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Advanced Performance Filtering</span>
            </div>
            <div class="control-trigger-wrapper" style="margin-bottom: 25px; display: flex; justify-content: center; width: 100%;">
                <button class="open-drawer-btn" onclick="openGlobalDrawer()">Configure Metrics & Sliders <i class="fa-solid fa-sliders" style="margin-left: 6px;"></i></button>
            </div>
            <div class="filters-main-layout">
                <div class="filters-counter-badge" id="filters-live-counter">Match count: <span class="filters-counter-highlight">0</span> spillere</div>
                <div class="filters-data-viewport-wrapper">
                    <div class="filters-dynamic-grid-container" id="filters-master-grid-canvas"></div>
                </div>
            </div>
        </section>
    `;
    await loadFiltersAPIDataFeed();
}
// ==========================================================================
// PER 90 - FILTERS.JS - DEL 3 AF 5 (DRAWER DASHBOARD PANEL BUILDER)
// ==========================================================================

function buildAndAppendFiltersDrawerHTML() {
    const gammelDrawer = document.querySelector('.table-filter-drawer');
    if (gammelDrawer) gammelDrawer.remove();

    const list = FILTERS_GLOBAL_DATA.players;
    const leagues = [...new Set(list.map(p => p.league).filter(Boolean).sort())];
    const nationalities = [...new Set(list.map(p => p.nationality).filter(Boolean).sort())];
    const positions = [...new Set(list.map(p => p.position).filter(Boolean).sort())];

    const genCheckboxes = (items, key) => items.map(item => {
        const chk = FILTERS_META[key].includes(item);
        return `<label class="table-drawer-checkbox-label" style="opacity: ${chk ? 1 : 0.4};"><input type="checkbox" value="${item}" ${chk ? "checked" : ""} onchange="handleFiltersCheckboxToggle(this, '${key}')"> ${item}</label>`;
    }).join('');

    let slidersHTML = `<div class="drawer-metrics-section"><div class="drawer-section-title">Performance Metrics Activation</div>`;
    Object.keys(FILTERS_METRIC_SLIDERS).forEach(m => {
        const s = FILTERS_METRIC_SLIDERS[m], step = s.max <= 2 ? "0.01" : (s.max <= 100 ? "0.1" : "1"), cid = m.replace(/\s+/g, '');
        slidersHTML += `
            <div class="filter-compact-row">
                <div class="filter-row-topline">
                    <label class="filter-label-checkbox-wrap"><input type="checkbox" id="fl-chk-${cid}" ${s.enabled ? "checked" : ""} onchange="handleMetricToggleClick(this, '${m}')"> ${m}</label>
                    <span class="filter-row-range-text" id="fl-lbl-${cid}">${s.currentMin.toFixed(2)} - ${s.currentMax.toFixed(2)}</span>
                </div>
                <div class="range-slider-container ${s.enabled ? 'active' : ''}" id="fl-wrap-${cid}">
                    <div class="range-slider-wrapper">
                        <input type="range" class="filter-native-slider slider-min-input" min="${s.min}" max="${s.max}" step="${step}" value="${s.currentMin}" oninput="handleDualSliderMovement(this, '${m}', 'min')" />
                        <input type="range" class="filter-native-slider slider-max-input" min="${s.min}" max="${s.max}" step="${step}" value="${s.currentMax}" oninput="handleDualSliderMovement(this, '${m}', 'max')" />
                    </div>
                </div>
            </div>`;
    });
    slidersHTML += `</div>`;

    const drawerDiv = document.createElement('div');
    drawerDiv.className = 'filter-drawer stats-filter-drawer table-filter-drawer';
    drawerDiv.innerHTML = `
        <div class="drawer-header"><span class="drawer-title">Filter Engine</span><button class="close-drawer-btn" onclick="closeGlobalDrawer()">✕</button></div>
        <div class="filter-panel" style="display:flex; flex-direction:column; gap:12px; width:100%; max-height:85vh; overflow-y:auto;">
            <div class="table-drawer-group"><label class="table-drawer-label">Stat Type</label><select id="fl-opt-stat-type" class="table-drawer-select" onchange="handleFiltersStatTypeChange()"><option value="Per 90" ${FILTERS_STAT_TYPE === "Per 90" ? "selected" : ""}>Per 90</option><option value="Total" ${FILTERS_STAT_TYPE === "Total" ? "selected" : ""}>Total</option></select></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Ligaer</label><div class="table-drawer-checkbox-box">${genCheckboxes(leagues, 'leagues')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Nationaliteter</label><div class="table-drawer-checkbox-box">${genCheckboxes(nationalities, 'nationalities')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Positioner</label><div class="table-drawer-checkbox-box">${genCheckboxes(positions, 'positions')}</div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Alder Range</label><div class="table-drawer-input-row"><input type="number" id="fl-filt-min-age" class="table-drawer-input" value="${FILTERS_META.minAge}" oninput="handleFiltersMetaInputChange()"><input type="number" id="fl-filt-max-age" class="table-drawer-input" value="${FILTERS_META.maxAge}" oninput="handleFiltersMetaInputChange()"></div></div>
            <div class="table-drawer-group"><label class="table-drawer-label">Minutter Range</label><div class="table-drawer-input-row"><input type="number" id="fl-filt-min-mins" class="table-drawer-input" value="${FILTERS_META.minMins}" oninput="handleFiltersMetaInputChange()"><input type="number" id="fl-filt-max-mins" class="table-drawer-input" value="${FILTERS_META.maxMins}" oninput="handleFiltersMetaInputChange()"></div></div>
            ${slidersHTML}
        </div>`;
    document.body.appendChild(drawerDiv);
}
// ==========================================================================
// PER 90 - FILTERS.JS - DEL 4 AF 5 (API SYNC & CLICK SORT TRIGGERS)
// ==========================================================================

async function loadFiltersAPIDataFeed() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/filters-data?stat_type=${encodeURIComponent(FILTERS_STAT_TYPE)}`);
        if (!res.ok) return;
        FILTERS_GLOBAL_DATA = await res.json();
        const list = FILTERS_GLOBAL_DATA.players, mList = FILTERS_GLOBAL_DATA.filter_metrics;
        if (list.length > 0) {
            const ages = list.map(p => p.age).filter(a => a > 0), mins = list.map(p => p.mins_played).filter(m => m > 0);
            FILTERS_META.minAge = Math.min(...ages); FILTERS_META.maxAge = Math.max(...ages);
            FILTERS_META.minMins = Math.min(...mins); FILTERS_META.maxMins = Math.max(...mins);
            FILTERS_METRIC_SLIDERS = {}; 
            mList.forEach(m => {
                const vals = list.map(p => p.metrics[m] || 0.0), mn = Math.min(...vals), mx = Math.max(...vals);
                FILTERS_METRIC_SLIDERS[m] = { enabled: false, min: mn, max: mx, currentMin: mn, currentMax: mx };
            });
        }
        buildAndAppendFiltersDrawerHTML(); runAdvancedFilteringEngine();
    } catch (e) { console.error("API Fejl:", e); }
}

// 🎯 INTERAKTIV METODE: HÅNDTERER KLIK PÅ KOLONNE-HEADERS FOR LIVE SORTERING
function setFiltersSortColumn(columnKey, columnType) {
    if (FILTERS_SORT.key === columnKey) {
        FILTERS_SORT.desc = !FILTERS_SORT.desc; // Samme kolonne -> Vend rækkefølgen om
    } else {
        FILTERS_SORT.key = columnKey;
        FILTERS_SORT.type = columnType; // 'meta' (alder, mins) eller 'metric' (goals, assists osv.)
        FILTERS_SORT.desc = true; // Ny kolonne -> Sorter altid højest-til-lavest først
    }
    runAdvancedFilteringEngine();
}

function handleMetricToggleClick(cb, m) {
    const wrapper = $f(`fl-wrap-${m.replace(/\s+/g, '')}`);
    FILTERS_METRIC_SLIDERS[m].enabled = cb.checked;
    if (wrapper) wrapper.classList.toggle('active', cb.checked);
    runAdvancedFilteringEngine();
}

function handleDualSliderMovement(el, m, type) {
    const s = FILTERS_METRIC_SLIDERS[m], val = parseFloat(el.value);
    if (type === 'min') {
        if (val > s.currentMax) { el.value = s.currentMax; s.currentMin = s.currentMax; } else { s.currentMin = val; }
    } else {
        if (val < s.currentMin) { el.value = s.currentMin; s.currentMax = s.currentMin; } else { s.currentMax = val; }
    }
    const lbl = $f(`fl-lbl-${m.replace(/\s+/g, '')}`);
    if (lbl) lbl.innerText = `${s.currentMin.toFixed(2)} - ${s.currentMax.toFixed(2)}`;
    runAdvancedFilteringEngine();
}
// ==========================================================================
// PER 90 - FILTERS.JS - DEL 5 AF 5 (INTERACTIVE SPREADSHEET ENGINE)
// ==========================================================================

function runAdvancedFilteringEngine() {
    const canvas = $f("filters-master-grid-canvas"), badge = $f("filters-live-counter");
    if (!canvas || !FILTERS_GLOBAL_DATA) return;

    const activeM = Object.keys(FILTERS_METRIC_SLIDERS).filter(m => FILTERS_METRIC_SLIDERS[m].enabled);
    let gridLayout = "240px 60px 70px 80px";
    activeM.forEach(() => { gridLayout += " 130px"; });

    // 1. Filtrering live i datasættet baseret på skuffens indstillinger
    let filtered = FILTERS_GLOBAL_DATA.players.filter(p => {
        if (FILTERS_META.leagues.length > 0 && !FILTERS_META.leagues.includes(p.league)) return false;
        if (FILTERS_META.nationalities.length > 0 && !FILTERS_META.nationalities.includes(p.nationality)) return false;
        if (FILTERS_META.positions.length > 0 && !FILTERS_META.positions.includes(p.position)) return false;
        if (p.age < FILTERS_META.minAge || p.age > FILTERS_META.maxAge) return false;
        if (p.mins_played < FILTERS_META.minMins || p.mins_played > FILTERS_META.maxMins) return false;

        for (let i = 0; i < activeM.length; i++) {
            const m = activeM[i], val = p.metrics[m] || 0.0, b = FILTERS_METRIC_SLIDERS[m];
            if (val < b.currentMin || val > b.currentMax) return false;
        }
        return true;
    });

    if (badge) badge.innerHTML = `Match count: <span class="filters-counter-highlight">${filtered.length}</span> spillere`;
    if (filtered.length === 0) {
        canvas.innerHTML = `<div style="text-align:center; padding:40px; color:#64748b; font-size:12px; font-weight:700;">INGEN MATCHES DETEKTERET</div>`;
        return;
    }

    // 2. 🎯 LIVE INTERAKTIV SORTERINGS-MATRIX
    filtered.sort((a, b) => {
        let valA = FILTERS_SORT.type === "meta" ? a[FILTERS_SORT.key] : (a.metrics[FILTERS_SORT.key] || 0.0);
        let valB = FILTERS_SORT.type === "meta" ? b[FILTERS_SORT.key] : (b.metrics[FILTERS_SORT.key] || 0.0);
        return FILTERS_SORT.desc ? valB - valA : valA - valB;
    });

    // Hjælpefunktion til at tegne den rigtige sorterings-pil og active class på overskriften
    const getSortIndicator = (colKey) => {
        if (FILTERS_SORT.key !== colKey) return `<i class="fa-solid fa-sort" style="opacity:0.3; font-size:9px;"></i>`;
        return FILTERS_SORT.desc ? ` ▼` : ` ▲`;
    };
    const getSortClass = (colKey) => FILTERS_SORT.key === colKey ? "active-sort" : "";

    // 3. GENERER KLIKBARE COLUMNS HEADERS DYNAMISK
    let headerHTML = `
        <div class="filters-scouting-header" style="grid-template-columns: ${gridLayout};">
            <div>Spillerdetaljer</div>
            <div style="text-align:center;">Pos</div>
            <div style="text-align:center;" class="filters-sort-trigger ${getSortClass('age')}" onclick="setFiltersSortColumn('age','meta')">Alder${getSortIndicator('age')}</div>
            <div style="text-align:center;" class="filters-sort-trigger ${getSortClass('mins_played')}" onclick="setFiltersSortColumn('mins_played','meta')">Minutter${getSortIndicator('mins_played')}</div>
            ${activeM.map(m => `
                <div class="filters-sort-trigger filters-hdr-metric ${getSortClass(m)}" onclick="setFiltersSortColumn('${m}','metric')">
                    ${m}${getSortIndicator(m)}
                </div>
            `).join('')}
        </div>
    `;

    // 4. RENDER CELLER MED VÆRDIER PER SPILLER
    let rowsHTML = filtered.map(p => {
        const mCells = activeM.map(m => `<div class="filters-c-cell filters-c-val-metric">${(p.metrics[m] || 0.0).toFixed(2)}</div>`).join('');
        return `<div class="filters-compact-card" style="grid-template-columns: ${gridLayout};"><div class="filters-c-cell"><div class="filters-c-player-name">${p.player_name}</div><div class="filters-c-subtext">${p.team} | ${p.league}</div></div><div class="filters-c-cell filters-c-val-pos">${p.position}</div><div class="filters-c-cell filters-c-val-age">${p.age} År</div><div class="filters-c-cell filters-c-val-mins">${p.mins_played}m</div>${mCells}</div>`;
    }).join('');

    canvas.innerHTML = headerHTML + `<div class="filters-scroll-window">${rowsHTML}</div>`;
}

async function handleFiltersStatTypeChange() {
    const sel = $f("fl-opt-stat-type"); if (sel) { FILTERS_STAT_TYPE = sel.value; await loadFiltersAPIDataFeed(); }
}
function handleFiltersMetaInputChange() {
    if (!$f("fl-filt-min-age")) return;
    FILTERS_META.minAge = parseInt($f("fl-filt-min-age").value) || 0; FILTERS_META.maxAge = parseInt($f("fl-filt-max-age").value) || 100;
    FILTERS_META.minMins = parseInt($f("fl-filt-min-mins").value) || 0; FILTERS_META.maxMins = parseInt($f("fl-filt-max-mins").value) || 99999;
    runAdvancedFilteringEngine();
}
function handleFiltersCheckboxToggle(cb, key) {
    FILTERS_META[key] = cb.checked ? [...FILTERS_META[key], cb.value] : FILTERS_META[key].filter(v => v !== cb.value);
    cb.parentElement.style.opacity = cb.checked ? '1' : '0.4'; runAdvancedFilteringEngine();
}
function onFiltersFilterChange() { runAdvancedFilteringEngine(); }
