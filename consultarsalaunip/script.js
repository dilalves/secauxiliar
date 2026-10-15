/* ============================================
   MAPA DE SALAS UNIP - JavaScript Leaflet
   ============================================ */

window.leafletInterop = {
    map: null,
    polyline: null,
    markerStart: null,
    markerEnd: null,
    imageBounds: [[0, 0], [1000, 1000]],

    initMap: function (elementId, imageUrl) {
        if (this.map !== null) {
            this.map.remove();
            this.map = null;
            this.polyline = null;
            this.markerStart = null;
            this.markerEnd = null;
        }

        this.map = L.map(elementId, {
            crs: L.CRS.Simple,
            minZoom: -2,
            maxZoom: 2,
            zoomControl: true,
            attributionControl: false
        });

        // Adiciona a planta baixa como imagem de fundo
        L.imageOverlay(imageUrl, this.imageBounds).addTo(this.map);

        // Sempre mostra o mapa inteiro
        this.map.fitBounds(this.imageBounds, { padding: [10, 10] });
    },

    drawRoute: function (pointsArray, startPointSvg) {
        if (!this.map) return;

        if (this.polyline !== null) this.map.removeLayer(this.polyline);
        if (this.markerStart !== null) this.map.removeLayer(this.markerStart);
        if (this.markerEnd !== null) this.map.removeLayer(this.markerEnd);

        // Desenha a linha tracejada amarela
        this.polyline = L.polyline(pointsArray, {
            color: '#FFED00',
            weight: 7,
            opacity: 1,
            dashArray: '12, 14',
            lineJoin: 'round',
            lineCap: 'round'
        }).addTo(this.map);

        // Converte ponto de partida SVG [x, y] para Leaflet [1000-y, x]
        var startPoint = [1000 - startPointSvg[1], startPointSvg[0]];
        var endPoint = pointsArray[pointsArray.length - 1];

        // Marcador de início: círculo azul (Você está aqui)
        this.markerStart = L.circleMarker(startPoint, {
            color: '#FFED00',
            fillColor: '#075EBD',
            fillOpacity: 1,
            radius: 10,
            weight: 3
        }).addTo(this.map).bindTooltip('📍 Você está aqui', { permanent: true, direction: 'left', className: 'map-tooltip' });

        // Marcador de destino: círculo amarelo (Sala)
        this.markerEnd = L.circleMarker(endPoint, {
            color: '#075EBD',
            fillColor: '#FFED00',
            fillOpacity: 1,
            radius: 10,
            weight: 3
        }).addTo(this.map).bindTooltip('🏁 Destino', { permanent: true, direction: 'right', className: 'map-tooltip' });

        // Mantém o mapa mostrando o plano completo
        this.map.fitBounds(this.imageBounds, { padding: [10, 10] });
    }
};

// Inicializa o mapa e desenha a rota quando a página carrega com resultado
document.addEventListener('DOMContentLoaded', function () {
    var mapaDiv = document.getElementById('leaflet-map');
    var rotaData = document.getElementById('data-rota');
    var svgData = document.getElementById('data-svg');
    var partidaData = document.getElementById('data-partida');

    if (mapaDiv && rotaData && svgData && partidaData) {
        var rota = JSON.parse(rotaData.textContent);
        var svgUrl = svgData.textContent;
        var partida = JSON.parse(partidaData.textContent); // [svg_x, svg_y]

        leafletInterop.initMap('leaflet-map', svgUrl);
        leafletInterop.drawRoute(rota, partida);
    }

    // Ajusta o mapa ao redimensionar a janela (útil em mobile)
    window.addEventListener('resize', function () {
        if (leafletInterop.map) {
            leafletInterop.map.invalidateSize();
        }
    });
});
