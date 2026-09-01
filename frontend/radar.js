function generateInlineSVGRadar(comparisonData) {
    const size = 540, center = size / 2, maxRadius = 150;
    const metrics = comparisonData.metrics, numAxes = metrics.length, angleStep = (2 * Math.PI) / numAxes, angleOffset = -Math.PI / 2;
    let svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" height="100%" style="overflow: visible; font-family: -apple-system, monospace;">';
    svg += '<defs><filter id="p1-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter><filter id="p2-glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
    
    [25, 50, 75, 100].forEach(level => {
        const pct = level / 100; let polyPoints = [];
        for (let j = 0; j < numAxes; j++) {
            const currentAngle = j * angleStep + angleOffset;
            polyPoints.push((center + (maxRadius * pct) * Math.cos(currentAngle)) + ',' + (center + (maxRadius * pct) * Math.sin(currentAngle)));
        }
        svg += '<polygon points="' + polyPoints.join(' ') + '" fill="none" stroke="' + (level === 100 ? '#4c2e6b' : '#1e1330') + '" stroke-width="' + (level === 100 ? '1.8' : '1') + '" stroke-dasharray="' + (level === 100 ? 'none' : '4,4') + '" opacity="0.8" />';
    });

    for (let j = 0; j < numAxes; j++) {
        const currentAngle = j * angleStep + angleOffset;
        svg += '<line x1="' + center + '" y1="' + center + '" x2="' + (center + maxRadius * Math.cos(currentAngle)) + '" y2="' + (center + maxRadius * Math.sin(currentAngle)) + '" stroke="#1f162e" stroke-width="1.5" opacity="0.7" />';
    }

    let p1Points = comparisonData.player1.stats.map((pct, j) => (center + ((pct / 100) * maxRadius) * Math.cos(j * angleStep + angleOffset)) + ',' + (center + ((pct / 100) * maxRadius) * Math.sin(j * angleStep + angleOffset)));
    svg += '<polygon points="' + p1Points.join(' ') + '" fill="rgba(168, 85, 247, 0.08)" stroke="#a855f7" stroke-width="2.5" filter="url(#p1-glow)" />';

    let p2Points = comparisonData.player2.stats.map((pct, j) => (center + ((pct / 100) * maxRadius) * Math.cos(j * angleStep + angleOffset)) + ',' + (center + ((pct / 100) * maxRadius) * Math.sin(j * angleStep + angleOffset)));
    svg += '<polygon points="' + p2Points.join(' ') + '" fill="rgba(0, 255, 213, 0.06)" stroke="#00ffd5" stroke-width="2.5" filter="url(#p2-glow)" />';

    metrics.forEach((metric, j) => {
        const currentAngle = j * angleStep + angleOffset;
        const lx = center + (maxRadius + 24) * Math.cos(currentAngle), ly = center + (maxRadius + 24) * Math.sin(currentAngle);
        const cos = Math.cos(currentAngle), textAnchor = cos > 0.3 ? 'start' : (cos < -0.3 ? 'end' : 'middle');
        svg += '<text x="' + lx + '" y="' + ly + '" fill="#948aa3" font-size="10" font-weight="700" text-anchor="' + textAnchor + '" dominant-baseline="central"><tspan fill="#a855f7" font-weight="900">[' + comparisonData.player1.stats[j] + ']</tspan> <tspan fill="#00ffd5" font-weight="900">[' + comparisonData.player2.stats[j] + ']</tspan> ' + metric.replace(',', ' ').toUpperCase() + '</text>';
    });

    return svg + '</svg>';
}

async function loadRadarChartData(p1, p2, metricsList) {
    const container = document.getElementById('radar-chart-target'); if (!container) return;
    container.innerHTML = '<div style="color: #948aa3; font-weight: 600;"><i class="fa-solid fa-spinner fa-spin"></i> Beregner asynkron duelmatrix...</div>';
    try {
        let url = 'http://127.0.0' + encodeURIComponent(p1) + '&player2=' + encodeURIComponent(p2);
        metricsList.forEach(m => url += '&metrics=' + encodeURIComponent(m));
        const res = await fetch(url); if (!res.ok) throw new Error();
        container.innerHTML = generateInlineSVGRadar(await res.json());
    } catch { container.innerHTML = '<div style="color: #ff007f; font-weight: 700;"><i class="fa-solid fa-triangle-exclamation"></i> DUELMATRIX FEJLEDE</div>'; }
}
