var allCachedPlayers = [], allCachedPositions = [];

document.addEventListener("DOMContentLoaded", function() {
    buildPizzaControlPanel();
    document.addEventListener("click", function() {
        if (document.getElementById("pizza-player-options")) document.getElementById("pizza-player-options").style.display = "none";
        if (document.getElementById("pizza-pos-options")) document.getElementById("pizza-pos-options").style.display = "none";
        var d = document.getElementById("all-metrics-drop"); if (d) d.style.display = "none";
    });

    fetch("/api/init-pizza-meta")
        .then(function(res) { return res.ok ? res.json() : null; })
        .then(function(data) {
            if (!data || !data.players.length) return;
            allCachedPlayers = data.players; allCachedPositions = data.positions;
            renderOptionsList("pizza-player-options", data.players, function(p) { return 'setComboValue("pizza-player-combo-input",\''+p.replace(/'/g, "\\'")+'\'); autoSyncPlayerPosition();'; });
            renderOptionsList("pizza-pos-options", data.positions, function(pos) { return 'setComboValue("pizza-pos-combo-input",\''+pos+'\'); triggerPizzaFetch();'; });
            setComboValue("pizza-player-combo-input", data.players[0]);
            autoSyncPlayerPosition();
        });
});

// GENANVENDELIG DROPDOWN GENRATOR FOR BÅDE NAVNE OG POSITIONER
function renderOptionsList(id, arr, clickFn) {
    var c = document.getElementById(id); if (!c) return;
    c.innerHTML = arr.length === 0 ? '<div style="padding:10px; color:var(--text-muted); text-align:center;">Ingen fundet</div>' :
        arr.map(function(item) { return '<div onclick="' + clickFn(item) + '" style="padding:10px; cursor:pointer; color:var(--text-primary); text-align:left;" onmouseover="this.style.background=\'var(--accent-purple-dim)\'" onmouseout="this.style.background=\'none\'">' + item + '</div>'; }).join('');
}

function filterSearchablePlayers() {
    var input = document.getElementById("pizza-player-combo-input");
    var container = document.getElementById("pizza-player-options");
    if (!input || !container) return;
    container.style.display = "block";
    renderSearchablePlayerList(allCachedPlayers.filter(function(p) { return p.toLowerCase().includes(input.value.toLowerCase().trim()); }));
}

function renderSearchablePlayerList(arr) {
    renderOptionsList("pizza-player-options", arr, function(p) { return 'setComboValue("pizza-player-combo-input",\''+p.replace(/'/g, "\\'")+'\'); autoSyncPlayerPosition();'; });
}

function setComboValue(id, val) {
    var input = document.getElementById(id); if (input) { input.value = val; input.setAttribute("data-selected-value", val); }
}
function autoSyncPlayerPosition() {
    var player = document.getElementById("pizza-player-combo-input")?.getAttribute("data-selected-value") || ""; if (!player) return;
    fetch('/api/pizza-chart?player_name=' + encodeURIComponent(player) + '&position=N/A&metrics=xG_p90')
        .then(function(res) { return res.ok ? res.json() : null; })
        .then(function(data) { if (data && data.playerDefaultPos) { setComboValue("pizza-pos-combo-input", data.playerDefaultPos); triggerPizzaFetch(); } });
}

function triggerPizzaFetch() {
    var player = document.getElementById("pizza-player-combo-input")?.getAttribute("data-selected-value");
    var pos = document.getElementById("pizza-pos-combo-input")?.getAttribute("data-selected-value");
    var metrics = Array.from(document.querySelectorAll('input[name="pizza-metric"]:checked')).map(function(cb) { return cb.value; });
    if (player && pos && metrics.length >= 3) loadPizzaChartCanvas(player, pos, metrics);
}

function buildPizzaControlPanel() {
    var target = document.getElementById("pizza-chart-target"); if (!target) return;
    var cats = [
        { name: 'SHOOTING', color: '#00ffd5', items: [['total goals_p90', 'Goals', true], ['xG_p90', 'npxG', true], ['total ontarget attempt_p90', 'Shots on Target', false], ['attempt_success_pct_p90', 'On Target %', false], ['CreatedOwnShot_p90', 'Created Own Shot', false]] },
        { name: 'PASSING', color: '#a855f7', items: [['total assists_p90', 'Assists', true], ['xA_p90', 'xA', true], ['total att assist_p90', 'Key Passes', false], ['xT_pass_p90', 'xT via Live Passes', false], ['progressive_passes_p90', 'Progressive Passes', false]] },
        { name: 'POSSESSION', color: '#e9c83c', items: [['total won contest_p90', 'Successful Dribbles', true], ['total contest_p90', 'Dribble Attempts', false], ['dribble_success_pct_p90', 'Dribble Success %', false], ['Total Carries_p90', 'Progressive Carries', false]] },
        { name: 'DEFENDING', color: '#ff007f', items: [['tackle_success_pct_p90', 'Tackles Won %', true], ['aerial_success_pct_p90', 'Aerials Won %', true], ['duel_success_pct_p90', 'Duels Won %', false], ['total won tackle_p90', 'Tackles Won', false], ['total aerial won_p90', 'Aerials Won', false]] }
    ];

    var box = 'width:100%; padding:10px 30px 10px 10px; background:rgba(20,13,33,0.8); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; height:42px; font-weight:600; box-sizing:border-box; text-align:left; font-size:13px;';
    var grp = 'position:relative; width:100%;';

    var html = '<div style="display: grid; grid-template-columns: 2fr 2fr 2fr 42px; gap: 16px; margin-bottom: 24px; position: relative; z-index: 100; align-items: end; width: 100%; max-width:900px; margin:0 auto 24px auto;">';
    
    // 1. Spillerdropdown
    html += '<div style="'+grp+'"><label style="display:block; font-size:11px; margin-bottom:8px; color:var(--text-muted); font-weight:700; text-align:center;">SØG/VÆLG SPILLER</label><div style="position:relative;"><input type="text" id="pizza-player-combo-input" oninput="filterSearchablePlayers()" onclick="event.stopPropagation(); document.getElementById(\'pizza-player-options\').style.display=\'block\'; document.getElementById(\'pizza-pos-options\').style.display=\'none\'; document.getElementById(\'all-metrics-drop\').style.display=\'none\'; this.select();" placeholder="Søg..." style="'+box+'"> <i class="fa-solid fa-chevron-down" style="position: absolute; right: 12px; top: 15px; color: var(--text-muted); font-size: 11px; pointer-events: none;"></i></div><div id="pizza-player-options" style="display:none; position:absolute; top:46px; left:0; width:100%; max-height:200px; overflow-y:auto; background:#0b0612; border:1px solid var(--border-color); border-radius:6px; box-shadow:0 10px 25px rgba(0,0,0,0.5); z-index:999;"></div></div>';
    
    // 2. Positionsdropdown (100% identisk struktur)
    html += '<div style="'+grp+'"><label style="display:block; font-size:11px; margin-bottom:8px; color:var(--text-muted); font-weight:700; text-align:center;">SAMMENLIGN IMOD POSITION</label><div style="position:relative;"><input type="text" id="pizza-pos-combo-input" readonly onclick="event.stopPropagation(); document.getElementById(\'pizza-pos-options\').style.display=\'block\'; document.getElementById(\'pizza-player-options\').style.display=\'none\'; document.getElementById(\'all-metrics-drop\').style.display=\'none\';" placeholder="Vælg position..." style="'+box+' cursor:pointer;"> <i class="fa-solid fa-chevron-down" style="position: absolute; right: 12px; top: 15px; color: var(--text-muted); font-size: 11px; pointer-events: none;"></i></div><div id="pizza-pos-options" style="display:none; position:absolute; top:46px; left:0; width:100%; max-height:200px; overflow-y:auto; background:#0b0612; border:1px solid var(--border-color); border-radius:6px; box-shadow:0 10px 25px rgba(0,0,0,0.5); z-index:999;"></div></div>';
    
    // 3. Metrikdropdown
    html += '<div style="'+grp+'"><label style="display:block; font-size:11px; margin-bottom:8px; color:var(--text-muted); font-weight:700; text-align:center;">VÆLG METRIKKER</label><button onclick="event.stopPropagation(); var d=document.getElementById(\'all-metrics-drop\'); var v=d.style.display===\'block\'; document.getElementById(\'pizza-player-options\').style.display=\'none\'; document.getElementById(\'pizza-pos-options\').style.display=\'none\'; d.style.display=v?\'none\':\'block\';" style="'+box+' display:flex; justify-content:space-between; align-items:center;"><span>Vælg parametre...</span><i class="fa-solid fa-chevron-down" style="color:var(--text-muted); font-size:11px;"></i></button><div id="all-metrics-drop" style="display:none; position:absolute; top:46px; left:0; width:100%; max-height:280px; overflow-y:auto; background:#140d21; border:1px solid var(--border-color); padding:14px; border-radius:6px; box-shadow:0 15px 30px rgba(0,0,0,0.6); text-align:left; z-index:999; box-sizing:border-box;">';

    cats.forEach(function(cat) {
        html += '<div style="margin-bottom: 14px;"><div style="font-size:10px; font-weight:900; color:'+cat.color+'; padding-bottom:4px; margin-bottom:8px; border-bottom:2px solid '+cat.color+'; letter-spacing:1px; text-align:left;">'+cat.name+'</div>';
        cat.items.forEach(function(it) {
            html += '<label onclick="event.stopPropagation();" style="display:block; padding:4px 0; font-size:13px; color:var(--text-primary); cursor:pointer; text-align:left;"><input type="checkbox" name="pizza-metric" value="'+it[0]+'" onchange="triggerPizzaFetch()" '+(it[2]?'checked':'')+' style="margin-right:8px; vertical-align:middle;">'+it[1]+'</label>';
        });
        html += '</div>';
    });

    html += '</div></div>';
    // 4. Farvevælger og Canvas opsætning
    html += '<div style="display:flex; flex-direction:column; align-items:center;"><label style="display:block; font-size:11px; margin-bottom:8px; color:var(--text-muted); font-weight:700; text-align:center;">FARVE</label><input type="color" id="pizza-color-picker" onchange="triggerPizzaFetch()" value="#00FFD5" style="width:42px; height:42px; background:none; border:1px solid var(--border-color); cursor:pointer; border-radius:50%; padding:0; overflow:hidden; box-sizing:border-box;"></div></div>\
        <div style="display:flex; flex-direction:column; align-items:center; gap:20px; background:var(--bg-card); padding:24px; border-radius:12px; border:1px solid var(--border-color); width:100%; box-sizing:border-box;">\
            <canvas id="pizza-canvas" width="600" height="600" style="max-width:100%; height:auto; background:#0b0612; border-radius:8px;"></canvas>\
            <button onclick="downloadPizzaAsPNG()" style="padding:12px 24px; background:#22c55e; border:none; color:#fff; font-weight:700; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:8px; width:100%; justify-content:center; max-width:240px;"><i class="fa-solid fa-download"></i> Download som PNG</button>\
        </div>\
    ';
    target.innerHTML = html;
}

function loadPizzaChartCanvas(playerName, position, metricsList) {
    var canvas = document.getElementById("pizza-canvas"); if (!canvas) return;
    var ctx = canvas.getContext("2d"); ctx.fillStyle = "#0b0612"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#948aa3"; ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Beregner og genererer dataprofil...", canvas.width / 2, canvas.height / 2);
    
    var url = '/api/pizza-chart?player_name=' + encodeURIComponent(playerName) + '&position=' + encodeURIComponent(position);
    metricsList.forEach(function(m) { url += '&metrics=' + encodeURIComponent(m); });
    
    fetch(url).then(function(res) { return res.ok ? res.json() : null; }).then(function(serverData) {
        if (serverData) drawPizzaOnCanvas(canvas, ctx, serverData.slices, serverData.playerName, document.getElementById("pizza-color-picker").value, serverData.logo);
    }).catch(function() {
        ctx.fillStyle = "#0b0612"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff007f"; ctx.fillText("⚠️ PIZZA-PROFIL FEJLEDE", canvas.width / 2, canvas.height / 2);
    });
}

function drawPizzaOnCanvas(canvas, ctx, slices, playerName, userColor, logoBase64) {
    var cx = canvas.width / 2, cy = canvas.height / 2 - 15, maxR = 170, N = slices.length, sliceAngle = (2 * Math.PI) / N, angleOffset = -Math.PI / 2;
    ctx.fillStyle = "#0b0612"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineWidth = 1; ctx.strokeStyle = "#1e1330";
    ctx.beginPath(); ctx.arc(cx, cy, 42.5, 0, 2 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 85, 0, 2 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 127.5, 0, 2 * Math.PI); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = "#3b2554";
    ctx.beginPath(); ctx.arc(cx, cy, maxR, 0, 2 * Math.PI); ctx.stroke();
    
    slices.forEach(function(slice, i) {
        var startAng = i * sliceAngle + angleOffset, endAng = (i + 1) * sliceAngle + angleOffset, radius = (slice.percentile / 100) * maxR;
        if (radius > 0) {
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, radius, startAng, endAng); ctx.closePath();
            ctx.fillStyle = userColor + "22"; ctx.fill(); ctx.strokeStyle = userColor; ctx.lineWidth = 2; ctx.stroke();
        }
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + maxR * Math.cos(startAng), cy + maxR * Math.sin(startAng));
        ctx.strokeStyle = "#1e1330"; ctx.lineWidth = 1.2; ctx.stroke();
    });
    
    slices.forEach(function(slice, i) {
        var midAng = i * sliceAngle + sliceAngle / 2 + angleOffset, tDist = maxR + 32, bDist = maxR + 12;
        ctx.fillStyle = "#948aa3"; ctx.font = "bold 10px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        var words = slice.label.split(' ');
        if (words.length > 1) {
            ctx.fillText(words, cx + tDist * Math.cos(midAng), cy + tDist * Math.sin(midAng) - 6);
            ctx.fillText(words.slice(1).join(' '), cx + tDist * Math.cos(midAng), cy + tDist * Math.sin(midAng) + 6);
        } else { ctx.fillText(slice.label, cx + tDist * Math.cos(midAng), cy + tDist * Math.sin(midAng)); }
        
        var bx = cx + bDist * Math.cos(midAng), by = cy + bDist * Math.sin(midAng);
        ctx.fillStyle = "#140d21"; ctx.strokeStyle = userColor; ctx.lineWidth = 1;
        ctx.fillRect(bx - 14, by - 9, 28, 18); ctx.strokeRect(bx - 14, by - 9, 28, 18);
        ctx.fillStyle = userColor; ctx.font = "800 10px monospace"; ctx.fillText(Math.round(slice.percentile), bx, by);
    });
    
    ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center"; ctx.fillText(playerName.toUpperCase(), canvas.width / 2, canvas.height - 25);
    if (logoBase64) {
        var img = new Image(); img.onload = function() {
            ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 24, 0, 2 * Math.PI); ctx.closePath(); ctx.clip();
            ctx.drawImage(img, cx - 24, cy - 24, 48, 48); ctx.restore();
        }; img.src = logoBase64;
    }
}

function downloadPizzaAsPNG() {
    var canvas = document.getElementById("pizza-canvas"); if (!canvas) return;
    var name = (document.getElementById("pizza-player-combo-input")?.getAttribute("data-selected-value") || "pizza_chart").replace(/\s+/g, '_');
    var link = document.createElement("a"); link.download = name + "_per90.png"; link.href = canvas.toDataURL("image/png"); link.click();
}

function loadPizzaChartData(p, m) { triggerPizzaFetch(); }
