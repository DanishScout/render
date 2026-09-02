function generateInlineSVGScatter(scatterData, activePlayerName) {
    const size = 540, padding = 50, plotSize = size - (padding * 2);
    let svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" height="100%" style="overflow: visible; font-family: -apple-system, monospace;">';
    svg += '<rect x="' + padding + '" y="' + padding + '" width="' + plotSize + '" height="' + plotSize + '" fill="#0f091a" stroke="#231834" stroke-width="1.5" opacity="0.6" />';
    
    const xValues = scatterData.map(p => p.x), yValues = scatterData.map(p => p.y);
    const minX = Math.min(...xValues) || 0, maxX = Math.max(...xValues) || 100, minY = Math.min(...yValues) || 0, maxY = Math.max(...yValues) || 100;

    for (let s = 1; s <= 4; s++) {
        const ratio = s * 0.2;
        svg += '<line x1="' + (padding + (plotSize * ratio)) + '" y1="' + padding + '" x2="' + (padding + (plotSize * ratio)) + '" y2="' + (size - padding) + '" stroke="#1e1330" stroke-width="1" stroke-dasharray="3,3" />';
        svg += '<line x1="' + padding + '" y1="' + (padding + (plotSize * ratio)) + '" x2="' + (size - padding) + '" y2="' + (padding + (plotSize * ratio)) + '" stroke="#1e1330" stroke-width="1" stroke-dasharray="3,3" />';
    }

    scatterData.forEach(player => {
        const cx = padding + (plotSize * ((player.x - minX) / (maxX - minX || 1)));
        const cy = (size - padding) - (plotSize * ((player.y - minY) / (maxY - minY || 1)));
        if (player.name.toLowerCase().trim() === activePlayerName.toLowerCase().trim()) {
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="#e9c83c" stroke="#ffffff" stroke-width="1.5" style="filter: drop-shadow(0 0 8px #e9c83c);" />';
            svg += '<text x="' + cx + '" y="' + (cy - 12) + '" fill="#e9c83c" font-size="11" font-weight="900" text-anchor="middle">' + player.name.toUpperCase() + '</text>';
        } else {
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#a855f7" opacity="0.45" style="cursor: pointer; transition: r 0.1s;" onmouseover="this.setAttribute(\'r\', \'5\'); this.setAttribute(\'opacity\', \'1\')" onmouseout="this.setAttribute(\'r\', \'3\'); this.setAttribute(\'opacity\', \'0.45\')" />';
        }
    });

    svg += '<text x="' + (size / 2) + '" y="' + (size - 15) + '" fill="#948aa3" font-size="11" font-weight="700" text-anchor="middle">X-AKSE: METRIK PERFORMANCE VOLUMEN</text>';
    svg += '<text x="15" y="' + (size / 2) + '" fill="#948aa3" font-size="11" font-weight="700" text-anchor="middle" transform="rotate(-90, 15, ' + (size / 2) + ')">Y-AKSE: EFFEKTIVITETS PERCENTIL</text>';
    return svg + '</svg>';
}

async function loadScatterPlotData(activePlayer) {
    const container = document.getElementById('scatter-chart-target'); if (!container) return;
    container.innerHTML = '<div style="color: #948aa3; font-weight: 600;"><i class="fa-solid fa-spinner fa-spin"></i> Plukker ligakoordinater...</div>';
    try {
        const res = await fetch('http://127.0.0' + encodeURIComponent(activePlayer)); if (!res.ok) throw new Error();
        container.innerHTML = generateInlineSVGScatter(await res.json(), activePlayer);
    } catch { container.innerHTML = '<div style="color: #ff007f; font-weight: 700;"><i class="fa-solid fa-triangle-exclamation"></i> DATA-PLOT FEJLEDE</div>'; }
}
