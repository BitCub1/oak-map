/* ============================================================
   OAK — MAP MODULE
   Leaflet initialization, tile layer, zoom controls
   ============================================================ */

const OAKMap = (function () {
    let map = null;
    let minZoomCalculated = 8;

    // Bay Area center (centered on OAK)
    const BAY_AREA_CENTER = [37.7213, -122.2208];
    const DEFAULT_ZOOM = 10;
    const MIN_ZOOM = 8;
    const MAX_ZOOM = 16;

    const bounds = L.latLngBounds(
        [37.1, -123.0],  // SW
        [38.9, -121.2]   // NE
    );

    function init() {
        map = L.map('map', {
            zoomControl: false,
            renderer: L.canvas({ padding: 0.5 }),
            attributionControl: true,
            maxBounds: bounds,
            maxBoundsViscosity: 1.0
        });

        // Fit map bounds to the Bay Area initially
        map.fitBounds(bounds, { animate: false });

        // Lock min zoom dynamically to whatever fitBounds calculated so user cannot zoom out further
        const currentZoom = map.getZoom();
        minZoomCalculated = currentZoom;
        map.setMinZoom(currentZoom);
        map.setMaxZoom(MAX_ZOOM);

        // Adjust to 2 zoom levels closer and center on OAK atomically
        map.setView(BAY_AREA_CENTER, currentZoom + 2, { animate: false });

        // Create custom panes for z-ordering
        // tooltipPane is z-index 650, so airport must be below that
        map.createPane('airportPane');
        map.getPane('airportPane').style.zIndex = 630;
        map.createPane('routePane');
        map.getPane('routePane').style.zIndex = 420;

        // CartoDB Positron No Labels — light basemap for clean color filtering
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: MAX_ZOOM
        }).addTo(map);


        // Close info box / deselect on map click (empty area)
        map.on('click', function (e) {
            // Only fire if no feature was clicked
            // (feature click handlers call stopPropagation)
        });

        return map;
    }

    function getMap() {
        return map;
    }

    function fitBayArea() {
        // Bay Area bounds: roughly SW to NE
        const bounds = L.latLngBounds(
            [37.1, -123.0],  // SW
            [38.9, -121.2]   // NE
        );
        map.fitBounds(bounds, { padding: [20, 20] });
    }

    function flyToCity(lat, lng) {
        map.flyTo([lat, lng], 13, { duration: 0.5 });
    }

    function resetView() {
        map.flyTo(BAY_AREA_CENTER, minZoomCalculated + 2, { duration: 0.5 });
    }

    return {
        init: init,
        getMap: getMap,
        fitBayArea: fitBayArea,
        flyToCity: flyToCity,
        resetView: resetView,
        BAY_AREA_CENTER: BAY_AREA_CENTER,
        DEFAULT_ZOOM: DEFAULT_ZOOM
    };
})();
