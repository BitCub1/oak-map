/* ============================================================
   OAK — LAYERS MODULE
   GeoJSON layer management, styling, and interaction
   ============================================================ */

const OAKLayers = (function () {

    let map = null;

    const BART_ICON_SVG = '<svg class="bart-station-tooltip-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 294 300"><path d="M 258 163 L 258 162 L 256 162 L 256 161 L 254 161 L 254 160 L 243 160 L 243 161 L 240 161 L 240 162 L 238 162 L 238 163 L 237 163 L 237 164 L 236 164 L 236 165 L 235 165 L 235 166 L 234 166 L 234 167 L 233 167 L 233 169 L 232 169 L 232 171 L 231 171 L 231 174 L 230 174 L 230 181 L 231 181 L 231 185 L 232 185 L 232 187 L 233 187 L 233 188 L 234 188 L 234 189 L 235 189 L 235 191 L 236 191 L 236 192 L 238 192 L 238 193 L 239 193 L 239 194 L 241 194 L 241 195 L 244 195 L 244 196 L 252 196 L 252 195 L 255 195 L 255 194 L 257 194 L 257 193 L 259 193 L 259 192 L 260 192 L 260 191 L 261 191 L 261 190 L 262 190 L 262 189 L 263 189 L 263 187 L 264 187 L 264 185 L 265 185 L 265 183 L 266 183 L 266 173 L 265 173 L 265 170 L 264 170 L 264 168 L 263 168 L 263 167 L 262 167 L 262 166 L 261 166 L 261 165 L 260 165 L 260 164 L 259 164 L 259 163 Z M 7 110 L 8 110 L 8 105 L 9 105 L 9 100 L 10 100 L 10 94 L 11 94 L 11 89 L 12 89 L 12 84 L 13 84 L 13 79 L 14 79 L 14 73 L 15 73 L 15 68 L 16 68 L 16 63 L 17 63 L 17 58 L 18 58 L 18 52 L 19 52 L 19 47 L 20 47 L 20 42 L 21 42 L 21 36 L 22 36 L 22 31 L 23 31 L 23 27 L 24 27 L 24 25 L 25 25 L 25 23 L 26 23 L 26 22 L 27 22 L 27 21 L 28 21 L 28 19 L 29 19 L 29 18 L 31 18 L 31 17 L 32 17 L 32 16 L 33 16 L 33 15 L 35 15 L 35 14 L 37 14 L 37 13 L 40 13 L 40 12 L 45 12 L 45 11 L 51 11 L 51 10 L 57 10 L 57 9 L 63 9 L 63 8 L 69 8 L 69 7 L 74 7 L 74 6 L 80 6 L 80 5 L 86 5 L 86 4 L 92 4 L 92 3 L 98 3 L 98 2 L 104 2 L 104 1 L 190 1 L 190 2 L 196 2 L 196 3 L 202 3 L 202 4 L 208 4 L 208 5 L 214 5 L 214 6 L 220 6 L 220 7 L 226 7 L 226 8 L 232 8 L 232 9 L 238 9 L 238 10 L 243 10 L 243 11 L 249 11 L 249 12 L 254 12 L 254 13 L 257 13 L 257 14 L 259 14 L 259 15 L 261 15 L 261 16 L 262 16 L 262 17 L 264 17 L 264 18 L 265 18 L 265 19 L 266 19 L 266 20 L 267 20 L 267 22 L 268 22 L 268 23 L 269 23 L 269 25 L 270 25 L 270 27 L 271 27 L 271 30 L 272 30 L 272 35 L 273 35 L 273 41 L 274 41 L 274 46 L 275 46 L 275 51 L 276 51 L 276 57 L 277 57 L 277 62 L 278 62 L 278 67 L 279 67 L 279 73 L 280 73 L 280 78 L 281 78 L 281 83 L 282 83 L 282 88 L 283 88 L 283 94 L 284 94 L 284 99 L 285 99 L 285 104 L 286 104 L 286 110 L 287 110 L 287 115 L 288 115 L 288 120 L 289 120 L 289 125 L 290 125 L 290 131 L 291 131 L 291 136 L 292 136 L 292 141 L 293 141 L 293 149 L 294 149 L 294 160 L 293 160 L 293 168 L 292 168 L 292 172 L 291 172 L 291 176 L 290 176 L 290 181 L 289 181 L 289 185 L 288 185 L 288 189 L 287 189 L 287 193 L 286 193 L 286 197 L 285 197 L 285 202 L 284 202 L 284 206 L 283 206 L 283 210 L 282 210 L 282 214 L 281 214 L 281 218 L 280 218 L 280 222 L 279 222 L 279 227 L 278 227 L 278 231 L 277 231 L 277 235 L 276 235 L 276 239 L 275 239 L 275 243 L 274 243 L 274 245 L 273 245 L 273 246 L 272 246 L 272 247 L 271 247 L 271 248 L 269 248 L 269 249 L 225 249 L 225 299 L 206 299 L 206 258 L 88 258 L 88 299 L 69 299 L 69 249 L 25 249 L 25 248 L 23 248 L 23 247 L 22 247 L 22 246 L 21 246 L 21 245 L 20 245 L 20 243 L 19 243 L 19 239 L 18 239 L 18 235 L 17 235 L 17 231 L 16 231 L 16 226 L 15 226 L 15 222 L 14 222 L 14 218 L 13 218 L 13 214 L 12 214 L 12 210 L 11 210 L 11 205 L 10 205 L 10 201 L 9 201 L 9 197 L 8 197 L 8 193 L 7 193 L 7 189 L 6 189 L 6 184 L 5 184 L 5 180 L 4 180 L 4 176 L 3 176 L 3 172 L 2 172 L 2 167 L 1 167 L 1 156 L 0 156 L 0 153 L 1 153 L 1 142 L 2 142 L 2 136 L 3 136 L 3 131 L 4 131 L 4 126 L 5 126 L 5 121 L 6 121 L 6 116 L 7 116 Z M 26 121 L 25 121 L 25 126 L 26 126 L 26 128 L 27 128 L 27 129 L 28 129 L 28 130 L 29 130 L 29 131 L 30 131 L 30 132 L 33 132 L 33 133 L 91 133 L 91 132 L 93 132 L 93 131 L 94 131 L 94 130 L 95 130 L 95 129 L 96 129 L 96 27 L 95 27 L 95 26 L 94 26 L 94 25 L 92 25 L 92 24 L 85 24 L 85 25 L 77 25 L 77 26 L 69 26 L 69 27 L 61 27 L 61 28 L 54 28 L 54 29 L 46 29 L 46 30 L 43 30 L 43 31 L 41 31 L 41 32 L 40 32 L 40 34 L 39 34 L 39 40 L 38 40 L 38 46 L 37 46 L 37 52 L 36 52 L 36 58 L 35 58 L 35 64 L 34 64 L 34 70 L 33 70 L 33 77 L 32 77 L 32 83 L 31 83 L 31 89 L 30 89 L 30 96 L 29 96 L 29 102 L 28 102 L 28 108 L 27 108 L 27 114 L 26 114 Z M 28 182 L 29 182 L 29 185 L 30 185 L 30 187 L 31 187 L 31 189 L 32 189 L 32 190 L 33 190 L 33 191 L 34 191 L 34 192 L 36 192 L 36 193 L 37 193 L 37 194 L 39 194 L 39 195 L 42 195 L 42 196 L 50 196 L 50 195 L 53 195 L 53 194 L 55 194 L 55 193 L 56 193 L 56 192 L 58 192 L 58 191 L 59 191 L 59 190 L 60 190 L 60 188 L 61 188 L 61 187 L 62 187 L 62 185 L 63 185 L 63 182 L 64 182 L 64 174 L 63 174 L 63 171 L 62 171 L 62 169 L 61 169 L 61 167 L 60 167 L 60 166 L 59 166 L 59 165 L 58 165 L 58 164 L 57 164 L 57 163 L 56 163 L 56 162 L 54 162 L 54 161 L 52 161 L 52 160 L 41 160 L 41 161 L 38 161 L 38 162 L 36 162 L 36 163 L 35 163 L 35 164 L 34 164 L 34 165 L 33 165 L 33 166 L 32 166 L 32 167 L 31 167 L 31 169 L 30 169 L 30 171 L 29 171 L 29 173 L 28 173 Z M 97 221 L 97 222 L 96 222 L 96 240 L 198 240 L 198 221 Z" fill="currentColor" fill-rule="evenodd" /></svg>';

    // Layer groups
    let cityLayer = null;
    let countyLayer = null;
    let bartRouteLayer = null;
    let bartStationLayer = null;
    let highwayLayer = null;
    let airportLayer = null;

    // Route highlight layers
    let highwayRouteLayer = null;
    let bartRouteHighlight = null;

    // Currently selected features — Map<cityName, {layer, hwLayer, bartLayer}>
    let selectedCities = new Map();
    let selectedCountyName = null;
    let onReadyCallback = null;
    let rippleMarker = null;

    // ================================================================
    // STYLES
    // ================================================================

    const STYLES = {
        city: {
            default: {
                color: '#808080',
                weight: 1,
                fillColor: 'transparent',
                fillOpacity: 0,
                opacity: 0.7
            },
            hover: {
                color: '#ffffff',
                weight: 1.5,
                fillColor: 'transparent',
                fillOpacity: 0,
                opacity: 1
            },
            selected: {
                color: '#F04A00',
                weight: 2.5,
                fillColor: 'transparent',
                fillOpacity: 0,
                opacity: 1
            },
            hidden: {
                color: 'transparent',
                weight: 0,
                fillColor: 'transparent',
                fillOpacity: 0,
                opacity: 0
            }
        },
        county: {
            color: 'transparent',
            weight: 0,
            fillColor: '#000000',
            fillOpacity: 0,
            opacity: 0
        },
        countySelected: {
            color: '#F04A00',
            weight: 2.5,
            fillColor: 'transparent',
            fillOpacity: 0,
            opacity: 1
        },
        countyHidden: {
            color: 'transparent',
            weight: 0,
            fillColor: 'transparent',
            fillOpacity: 0,
            opacity: 0
        },
        bart: {
            route: {
                color: '#555',
                weight: 2,
                opacity: 0.5,
                dashArray: '6,4'
            },
            station: {
                radius: 3,
                color: '#666',
                fillColor: '#555',
                fillOpacity: 0.9,
                weight: 1
            }
        },
        highway: {
            color: '#444',
            weight: 1,
            opacity: 0.5
        },
        airport: {
            color: '#F04A00',
            weight: 2,
            fillColor: 'transparent',
            fillOpacity: 0,
            opacity: 1
        },
        routeHighlight: {
            highway: {
                color: '#ffffff',
                weight: 3.5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
            },
            bart: {
                color: '#3B82F6',
                weight: 3.5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round'
            }
        }
    };

    // ================================================================
    // INITIALIZATION
    // ================================================================

    function init(leafletMap, opts) {
        map = leafletMap;
        if (opts && opts.onReady) onReadyCallback = opts.onReady;

        map.on('zoomend', function () {
            updateRouteOffsets();
        });

        loadAllLayers();
    }

    async function loadAllLayers() {
        // Show loading overlay
        showLoading(true);

        try {
            // Load all GeoJSON files in parallel
            const [citiesData, countiesData, bartRoutesData, bartStationsData, highwaysData, airportData] =
                await Promise.all([
                    fetchGeoJSON('data/cities.geojson'),
                    fetchGeoJSON('data/counties.geojson'),
                    fetchGeoJSON('data/bart_routes.geojson'),
                    fetchGeoJSON('data/bart_stations.geojson'),
                    fetchGeoJSON('data/highways.geojson'),
                    fetchGeoJSON('data/oak_airport.geojson')
                ]);

            // Create layers in draw order (bottom to top)
            if (countiesData) createCountyLayer(countiesData);
            if (highwaysData) createHighwayLayer(highwaysData);
            if (bartRoutesData) createBartRouteLayer(bartRoutesData);
            if (bartStationsData) createBartStationLayer(bartStationsData);
            if (citiesData) createCityLayer(citiesData);
            if (airportData) createAirportLayer(airportData);

        } catch (err) {
            console.error('Error loading GeoJSON layers:', err);
        }

        showLoading(false);

        // Notify app that layers are loaded
        if (onReadyCallback) onReadyCallback();
    }

    async function fetchGeoJSON(url) {
        try {
            const resp = await fetch(url);
            if (!resp.ok) {
                console.warn('Failed to load:', url, resp.status);
                return null;
            }
            return await resp.json();
        } catch (err) {
            console.warn('Error fetching:', url, err.message);
            return null;
        }
    }

    // ================================================================
    // LAYER CREATION
    // ================================================================

    function createCityLayer(data) {
        cityLayer = L.geoJSON(data, {
            style: function () { return STYLES.city.default; },
            onEachFeature: function (feature, layer) {
                var name = feature.properties.NAME || feature.properties.name || '';

                // Landmark cities always show a permanent label
                var LANDMARKS = {'San Francisco': true, 'Oakland': true, 'Berkeley': true};
                if (LANDMARKS[name]) {
                    layer.bindTooltip(name.toUpperCase(), {
                        className: 'city-tooltip city-tooltip--selected city-tooltip--landmark',
                        direction: 'top',
                        offset: [0, -8],
                        permanent: true,
                        sticky: false,
                        opacity: 1
                    });
                } else {
                    layer.bindTooltip(name, {
                        className: 'city-tooltip',
                        direction: 'top',
                        offset: [0, -8],
                        sticky: false,
                        permanent: false,
                        opacity: 1
                    });
                }

                // Hover effects
                layer.on('mouseover', function () {
                    if (document.body.classList.contains('map-recording')) return;
                    var sel = selectedCities.get(name);
                    if (!sel || sel.isStation) {
                        this.setStyle(STYLES.city.hover);
                        this.bringToFront();
                        if (airportLayer) airportLayer.bringToFront();
                    }
                });

                layer.on('mouseout', function () {
                    if (document.body.classList.contains('map-recording')) return;
                    var sel = selectedCities.get(name);
                    if (!sel || sel.isStation) {
                        if (selectedCities.size === 0) {
                            this.setStyle(STYLES.city.default);
                        } else {
                            this.setStyle(STYLES.city.hidden);
                        }
                    }
                });

                // Click to select / multi-select with Ctrl
                layer.on('click', function (e) {
                    L.DomEvent.stopPropagation(e);
                    if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
                        toggleCitySelection(name, this);
                    } else {
                        selectCity(name, this);
                    }
                });
            }
        }).addTo(map);
    }

    function createCountyLayer(data) {
        countyLayer = L.geoJSON(data, {
            style: function () { return STYLES.county; },
            onEachFeature: function (feature, layer) {
                var rawName = feature.properties.NAME || feature.properties.name || '';
                var name = rawName.replace(/ County$/i, '');

                layer.on('click', function (e) {
                    L.DomEvent.stopPropagation(e);
                    selectCounty(name);
                });
            }
        }).addTo(map);
        countyLayer.bringToBack();
    }

    function createBartRouteLayer(data) {
        bartRouteLayer = L.geoJSON(data, {
            style: function () { return STYLES.bart.route; }
        });
        // Not added to map — only route highlights are visible
    }

    function createBartStationLayer(data) {
        bartStationLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: L.divIcon({
                        className: 'bart-station-icon-square',
                        iconSize: [10, 10],
                        iconAnchor: [5, 5]
                    }),
                    pane: 'markerPane'
                });
            },
            onEachFeature: function (feature, layer) {
                var name = feature.properties.name || '';
                var labelHtml = '<span class="bart-station-label">' + BART_ICON_SVG + ' ' + name + '</span>';
                layer.bindTooltip(labelHtml, {
                    className: 'city-tooltip',
                    direction: 'top',
                    offset: [0, -8],
                    opacity: 1
                });

                layer.on('click', function (e) {
                    L.DomEvent.stopPropagation(e);
                    selectBartStation(name, this);
                });
            }
        }).addTo(map);
    }

    function createHighwayLayer(data) {
        highwayLayer = L.geoJSON(data, {
            style: function () { return STYLES.highway; }
        });
        // Not added to map — only route highlights are visible
    }

    function createAirportLayer(data) {
        airportLayer = L.geoJSON(data, {
            style: function () { return STYLES.airport; },
            pane: 'airportPane',
            onEachFeature: function (feature, layer) {
                layer.bindTooltip('&#x2708;&#xFE0E;OAK', {
                    className: 'city-tooltip city-tooltip--oak',
                    direction: 'top',
                    permanent: true,
                    offset: [0, -8],
                    opacity: 1
                });

                layer.on('click', function (e) {
                    L.DomEvent.stopPropagation(e);
                    clearSelection();
                    OAKInfoBox.showAirport();
                });
            }
        }).addTo(map);
    }

    var LANDMARK_CITIES = {'San Francisco': true, 'Oakland': true, 'Berkeley': true};

    function bindLandmarkTooltip(name, layer) {
        layer.unbindTooltip();
        layer.bindTooltip(name.toUpperCase(), {
            className: 'city-tooltip city-tooltip--selected city-tooltip--landmark',
            direction: 'top',
            offset: [0, -8],
            permanent: true,
            sticky: false,
            opacity: 1
        });
    }

    function updateCityBorders() {
        if (!cityLayer) return;
        var hasSelection = selectedCities.size > 0;
        var isRecording = document.body.classList.contains('map-recording');
        cityLayer.eachLayer(function (l) {
            var name = l.feature.properties.NAME || l.feature.properties.name || '';
            var sel = selectedCities.get(name);
            if (sel && !sel.isStation) {
                l.setStyle(STYLES.city.selected);
            } else {
                if (hasSelection || isRecording) {
                    l.setStyle(STYLES.city.hidden);
                } else {
                    l.setStyle(STYLES.city.default);
                }
            }
        });
        updateBartStationsVisibility();
    }

    function updateBartStationsVisibility() {
        if (!bartStationLayer) return;
        var bartCheckbox = document.getElementById('layer-bart');
        var bartChecked = bartCheckbox ? bartCheckbox.checked : true;
        var hasSelection = selectedCities.size > 0;
        if (hasSelection || !bartChecked) {
            if (map.hasLayer(bartStationLayer)) {
                map.removeLayer(bartStationLayer);
            }
        } else {
            if (!map.hasLayer(bartStationLayer)) {
                map.addLayer(bartStationLayer);
            }
        }
    }

    // ---- Internal: Selection Animations (Motion Graphics) ----
    function addRippleMarker(latlng) {
        if (!map) return;
        if (rippleMarker) {
            map.removeLayer(rippleMarker);
        }
        var rippleIcon = L.divIcon({
            className: 'map-ripple-icon',
            html: '<div class="ripple-ring"></div><div class="ripple-ring"></div><div class="ripple-ring"></div><div class="ripple-dot"></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        rippleMarker = L.marker(latlng, { icon: rippleIcon, pane: 'markerPane' }).addTo(map);
    }

    function animatePolyline(polyline) {
        if (!polyline || typeof polyline.getElement !== 'function') return;
        setTimeout(function () {
            var path = polyline.getElement();
            if (path) {
                var length = path.getTotalLength();
                path.style.strokeDasharray = length;
                path.style.strokeDashoffset = length;
                path.getBoundingClientRect(); // force reflow
                path.style.transition = 'stroke-dashoffset 3.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
                path.style.strokeDashoffset = '0';
                
                // Clean up transition styles after animation completes so zooming/panning works normally
                setTimeout(function () {
                    if (path) {
                        path.style.transition = '';
                        path.style.strokeDasharray = '';
                        path.style.strokeDashoffset = '';
                    }
                }, 3600);
            }
        }, 50);
    }

    // ---- Internal: add a single city to selection ----
    function addCityToSelection(name, layer) {
        layer.setStyle(STYLES.city.selected);
        layer.bringToFront();

        // Bind permanent label (landmarks keep their style; others get selected style)
        layer.unbindTooltip();
        layer.bindTooltip(name.toUpperCase(), {
            className: 'city-tooltip city-tooltip--selected',
            direction: 'top',
            offset: [0, -8],
            permanent: true,
            sticky: false,
            opacity: 1
        });
        layer.openTooltip();

        // Add pulsing ripple marker at city centroid
        if (layer && typeof layer.getBounds === 'function') {
            addRippleMarker(layer.getBounds().getCenter());
        }

        // Build per-city route layers — BART first, highway on top
        var hwLayer = null, bartLayer = null;

        var zoom = map.getZoom();
        var offsetMeters = getOffsetDistanceInMeters(zoom);

        var bartRoute = OAKRoutes.getBartRoute(name);
        var hwRoute = OAKRoutes.getExtendedHighwayRoute(name);
        var stationIndices = [];

        // Align BART route coordinates to highway coordinates where they run in the same corridor
        // to prevent crossings and gaps when offset.
        if (bartRoute) {
            if (hwRoute) {
                // If hwRoute is a MultiPolyline (LatLng[][]), use the main highway route (hwRoute[0]) for alignment.
                var mainHwRoute = (Array.isArray(hwRoute[0]) && Array.isArray(hwRoute[0][0])) ? hwRoute[0] : hwRoute;
                var alignResult = alignBartRouteToHighway(bartRoute, mainHwRoute);
                bartRoute = alignResult.route;
                stationIndices = alignResult.stationIndices;
            } else {
                for (var i = 0; i < bartRoute.length; i++) {
                    stationIndices.push(i);
                }
            }
        }

        var offsetBartRoute = [];
        if (bartRoute && bartRoute.length >= 2) {
            offsetBartRoute = offsetPolyline(bartRoute, -offsetMeters);
            bartLayer = L.polyline(offsetBartRoute, Object.assign({}, STYLES.routeHighlight.bart, {pane: 'routePane'}));
            var bartCheckbox = document.getElementById('layer-bart');
            var bartChecked = bartCheckbox ? bartCheckbox.checked : true;
            if (bartChecked) {
                bartLayer.addTo(map);
                animatePolyline(bartLayer);
            }
        }

        var hasValidHwRoute = false;
        if (hwRoute) {
            if (Array.isArray(hwRoute[0]) && Array.isArray(hwRoute[0][0])) {
                hasValidHwRoute = hwRoute[0].length >= 2;
            } else {
                hasValidHwRoute = hwRoute.length >= 2;
            }
        }

        if (hasValidHwRoute) {
            var offsetHwRoute = offsetPolyline(hwRoute, offsetMeters);
            hwLayer = L.polyline(offsetHwRoute, Object.assign({}, STYLES.routeHighlight.highway, {pane: 'routePane'})).addTo(map);
            animatePolyline(hwLayer);
        }

        // Draw individual BART station markers along the selected route as blue squares (disabled)
        var stationMarkers = [];

        selectedCities.set(name, {
            layer: layer,
            hwLayer: hwLayer,
            bartLayer: bartLayer,
            hwRoute: hwRoute,
            bartRoute: bartRoute,
            stationMarkers: stationMarkers,
            stationIndices: stationIndices
        });

        updateCityBorders();

        if (airportLayer) airportLayer.bringToFront();
    }

    // ---- Internal: remove a single city from selection ----
    function removeCityFromSelection(name) {
        var sel = selectedCities.get(name);
        if (!sel) return;

        // Restore tooltip — landmarks keep permanent label, others go back to hover
        if (LANDMARK_CITIES[name]) {
            bindLandmarkTooltip(name, sel.layer);
        } else {
            sel.layer.unbindTooltip();
            sel.layer.bindTooltip(name, {
                className: 'city-tooltip',
                direction: 'top',
                offset: [0, -8],
                sticky: false,
                permanent: false,
                opacity: 1
            });
        }

        // Remove per-city route layers
        if (sel.hwLayer) map.removeLayer(sel.hwLayer);
        if (sel.bartLayer) map.removeLayer(sel.bartLayer);
        if (sel.stationMarkers) {
            sel.stationMarkers.forEach(function (m) { map.removeLayer(m); });
        }

        selectedCities.delete(name);
        updateCityBorders();
    }

    // ---- Plain click: replace entire selection ----
    function selectCity(name, layer) {
        clearSelection();

        // Resolve layer by name if not provided
        if (!layer && cityLayer) {
            cityLayer.eachLayer(function (l) {
                var featureName = l.feature.properties.NAME || l.feature.properties.name || '';
                if (featureName === name) {
                    layer = l;
                }
            });
        }

        if (layer) {
            addCityToSelection(name, layer);
        }
        OAKInfoBox.showMultiCity(Array.from(selectedCities.keys()));
    }

    function selectCounty(name) {
        clearSelection();

        selectedCountyName = name;

        if (countyLayer) {
            countyLayer.setStyle(function (feature) {
                var rawName = feature.properties.NAME || feature.properties.name || '';
                var featureCountyName = rawName.replace(/ County$/i, '');
                if (featureCountyName === selectedCountyName) {
                    return STYLES.countySelected;
                } else {
                    return STYLES.countyHidden;
                }
            });
            if (!map.hasLayer(countyLayer)) {
                countyLayer.addTo(map);
            }
            countyLayer.bringToBack();
            
            // Add pulsing ripple marker at county centroid
            var countyFeatureLayer = null;
            countyLayer.eachLayer(function (l) {
                var rawName = l.feature.properties.NAME || l.feature.properties.name || '';
                var featureCountyName = rawName.replace(/ County$/i, '');
                if (featureCountyName === name) {
                    countyFeatureLayer = l;
                }
            });
            if (countyFeatureLayer && typeof countyFeatureLayer.getBounds === 'function') {
                addRippleMarker(countyFeatureLayer.getBounds().getCenter());
            }
        }

        OAKInfoBox.showCounty(name);
    }

    function selectBartStation(stationName, layer) {
        clearSelection();

        var bartRoute = OAKRoutes.getBartRoute(stationName);
        if (!bartRoute || bartRoute.length < 2) return;

        var bartCheckbox = document.getElementById('layer-bart');
        var bartChecked = bartCheckbox ? bartCheckbox.checked : true;

        var bartLayer = L.polyline(bartRoute, Object.assign({}, STYLES.routeHighlight.bart, {pane: 'routePane'}));
        if (bartChecked) {
            bartLayer.addTo(map);
            animatePolyline(bartLayer);
        }

        var selectedCoords = bartRoute[0];
        
        // Add pulsing ripple marker at station coordinate
        addRippleMarker(selectedCoords);

        var marker = L.marker(selectedCoords, {
            icon: L.divIcon({
                className: 'bart-station-icon-square',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            }),
            pane: 'markerPane'
        });
        var labelHtml = '<span class="bart-station-label">' + BART_ICON_SVG + ' ' + stationName.toUpperCase() + '</span>';
        marker.bindTooltip(labelHtml, {
            className: 'city-tooltip city-tooltip--selected',
            direction: 'top',
            offset: [0, -6],
            permanent: true,
            opacity: 1
        });
        marker.addTo(map);
        marker.openTooltip();

        selectedCities.set(stationName, {
            layer: layer,
            bartLayer: bartLayer,
            hwLayer: null,
            stationMarkers: [marker],
            stationIndices: [],
            isStation: true
        });

        updateCityBorders();
        OAKInfoBox.showBartStation(stationName, bartRoute);
    }

    // ---- Ctrl+click: toggle city in/out of selection ----
    function toggleCitySelection(name, layer) {
        var sel = selectedCities.get(name);
        if (sel && !sel.isStation) {
            removeCityFromSelection(name);

            if (selectedCities.size === 0) {
                OAKInfoBox.showBayArea();
            } else {
                OAKInfoBox.showMultiCity(Array.from(selectedCities.keys()));
            }
        } else {
            addCityToSelection(name, layer);
            OAKInfoBox.showMultiCity(Array.from(selectedCities.keys()));
        }
    }

    function clearSelection() {
        // Remove ripple marker
        if (rippleMarker) {
            map.removeLayer(rippleMarker);
            rippleMarker = null;
        }

        // Remove all per-city route layers and restore tooltips
        selectedCities.forEach(function (sel, name) {
            if (sel.hwLayer) map.removeLayer(sel.hwLayer);
            if (sel.bartLayer) map.removeLayer(sel.bartLayer);
            if (sel.stationMarkers) {
                sel.stationMarkers.forEach(function (m) { map.removeLayer(m); });
            }
            if (LANDMARK_CITIES[name]) {
                bindLandmarkTooltip(name, sel.layer);
            } else {
                sel.layer.unbindTooltip();
                sel.layer.bindTooltip(name, {
                    className: 'city-tooltip',
                    direction: 'top',
                    offset: [0, -8],
                    sticky: false,
                    permanent: false,
                    opacity: 1
                });
            }
        });
        selectedCities.clear();

        // Restore all city outlines and tooltips
        updateCityBorders();

        // Reset county selection styles instead of removing it from the map
        if (countyLayer) {
            countyLayer.setStyle(STYLES.county);
            countyLayer.bringToBack();
        }
        selectedCountyName = null;

        OAKInfoBox.showBayArea();
    }

    // Legacy stubs — kept for external callers
    function showRouteToOAK() {}
    function clearRouteHighlights() {}

    // ================================================================
    // LAYER VISIBILITY TOGGLES
    // ================================================================

    function toggleLayer(layerName, visible) {
        var layer = null;
        switch (layerName) {
            case 'cities': layer = cityLayer; break;
            case 'counties': layer = countyLayer; break;
            case 'bart':
                if (visible) {
                    var hasSelection = selectedCities.size > 0;
                    if (bartStationLayer && !hasSelection) {
                        map.addLayer(bartStationLayer);
                    }
                    selectedCities.forEach(function (sel) {
                        if (sel.bartLayer && !map.hasLayer(sel.bartLayer)) {
                            map.addLayer(sel.bartLayer);
                        }
                    });
                } else {
                    if (bartRouteLayer && map.hasLayer(bartRouteLayer)) {
                        map.removeLayer(bartRouteLayer);
                    }
                    if (bartStationLayer) map.removeLayer(bartStationLayer);
                    selectedCities.forEach(function (sel) {
                        if (sel.bartLayer && map.hasLayer(sel.bartLayer)) {
                            map.removeLayer(sel.bartLayer);
                        }
                    });
                }
                return;
            case 'highways': layer = highwayLayer; break;
            case 'airport': layer = airportLayer; break;
        }

        if (layer) {
            if (visible) map.addLayer(layer);
            else map.removeLayer(layer);
        }
    }

    // ================================================================
    // LOADING OVERLAY
    // ================================================================

    function showLoading(show) {
        var overlay = document.querySelector('.loading-overlay');
        if (show && !overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-text">LOADING MAP DATA</div><div class="loading-bar"></div>';
            document.body.appendChild(overlay);
        } else if (!show && overlay) {
            overlay.remove();
        }
    }

    // ================================================================
    // ROUTE OFFSETTING FOR SIDE-BY-SIDE VISIBILITY
    // ================================================================

    function getOffsetDistanceInMeters(zoom) {
        // Desired visual offset: exactly half of route line weight (3.5px / 2 = 1.75px)
        // This ensures the two parallel lines touch side-by-side with no gap and no overlap.
        var desiredPixelOffset = 1.75;
        var lat = 37.75; // average Bay Area latitude
        var metersPerPixel = 40075016.686 * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom + 8);
        return desiredPixelOffset * metersPerPixel;
    }

    function offsetPolyline(points, offsetMeters) {
        if (!points || points.length === 0) return points;
        if (Array.isArray(points[0]) && Array.isArray(points[0][0])) {
            return points.map(function (subline) {
                return offsetPolyline(subline, offsetMeters);
            });
        }
        if (points.length < 2) return points;

        var latConv = 111111;
        var avgLat = 37.75;
        var lngConv = 111111 * Math.cos(avgLat * Math.PI / 180);

        var offsetLat = offsetMeters / latConv;
        var offsetLng = offsetMeters / lngConv;

        var newPoints = [];
        var n = points.length;
        var normals = [];

        for (var i = 0; i < n - 1; i++) {
            var p1 = points[i];
            var p2 = points[i+1];

            var dy = p2[0] - p1[0]; // lat difference
            var dx = p2[1] - p1[1]; // lng difference

            var my = dy * latConv;
            var mx = dx * lngConv;

            var len = Math.sqrt(mx * mx + my * my);
            if (len === 0) {
                normals.push([0, 0]);
            } else {
                normals.push([-mx / len, my / len]);
            }
        }

        for (var j = 0; j < n; j++) {
            var ny = 0;
            var nx = 0;

            if (j === 0) {
                ny = normals[0][0];
                nx = normals[0][1];
            } else if (j === n - 1) {
                ny = normals[n-2][0];
                nx = normals[n-2][1];
            } else {
                var n1 = normals[j-1];
                var n2 = normals[j];

                ny = n1[0] + n2[0];
                nx = n1[1] + n2[1];

                var jointLen = Math.sqrt(nx * nx + ny * ny);
                if (jointLen > 0.01) {
                    var factor = Math.min(2.0, 2.0 / jointLen);
                    ny = (ny / jointLen) * factor;
                    nx = (nx / jointLen) * factor;
                } else {
                    ny = n1[0];
                    nx = n1[1];
                }
            }

            var latOffset = ny * offsetLat;
            var lngOffset = nx * offsetLng;

            newPoints.push([points[j][0] + latOffset, points[j][1] + lngOffset]);
        }

        return newPoints;
    }

    function updateRouteOffsets() {
        if (!map) return;
        var zoom = map.getZoom();
        var offsetMeters = getOffsetDistanceInMeters(zoom);
        selectedCities.forEach(function (sel) {
            var offsetBartRoute = [];
            if (sel.bartLayer && sel.bartRoute) {
                offsetBartRoute = offsetPolyline(sel.bartRoute, -offsetMeters);
                sel.bartLayer.setLatLngs(offsetBartRoute);
            }
            if (sel.hwLayer && sel.hwRoute) {
                sel.hwLayer.setLatLngs(offsetPolyline(sel.hwRoute, offsetMeters));
            }
            // Reposition station markers to align with offset polyline vertices
            if (sel.stationMarkers && sel.stationIndices && offsetBartRoute.length > 0) {
                for (var i = 0; i < sel.stationMarkers.length; i++) {
                    var idx = sel.stationIndices[i];
                    if (offsetBartRoute[idx]) {
                        sel.stationMarkers[i].setLatLng(offsetBartRoute[idx]);
                    }
                }
            }
        });
    }

    function alignBartRouteToHighway(bartRoute, hwRoute) {
        // Safe check
        if (!bartRoute) {
            return { route: [], stationIndices: [] };
        }

        // If bartRoute or hwRoute is too short, we can't snap
        if (bartRoute.length < 2 || !hwRoute || hwRoute.length < 2) {
            var stationIndices = [];
            for (var i = 0; i < bartRoute.length; i++) {
                stationIndices.push(i);
            }
            return { route: bartRoute, stationIndices: stationIndices };
        }

        // Snap threshold: 1200 meters (~0.012 degrees)
        var SNAP_THRESHOLD = 0.012;

        function getDist2(p1, p2) {
            var dy = p1[0] - p2[0];
            var dx = p1[1] - p2[1];
            return dx * dx + dy * dy;
        }

        function projectPointOnSegment(p, a, b) {
            var dy = b[0] - a[0];
            var dx = b[1] - a[1];
            var len2 = dx * dx + dy * dy;
            if (len2 === 0) return { coords: a, t: 0, dist2: getDist2(p, a) };

            var t = ((p[0] - a[0]) * dy + (p[1] - a[1]) * dx) / len2;
            t = Math.max(0, Math.min(1, t));

            var projCoords = [a[0] + t * dy, a[1] + t * dx];
            return {
                coords: projCoords,
                t: t,
                dist2: getDist2(p, projCoords)
            };
        }

        // snappedInfo[i] will store the snapping result for bartRoute[i]
        var snappedInfo = new Array(bartRoute.length).fill(null);
        var hasAnySnapped = false;

        for (var i = 0; i < bartRoute.length; i++) {
            var bp = bartRoute[i];
            var bestProj = null;
            var bestSegIdx = -1;
            var minDist2 = Infinity;

            for (var j = 0; j < hwRoute.length - 1; j++) {
                var proj = projectPointOnSegment(bp, hwRoute[j], hwRoute[j+1]);
                if (proj.dist2 < minDist2) {
                    minDist2 = proj.dist2;
                    bestProj = proj;
                    bestSegIdx = j;
                }
            }

            if (bestProj && Math.sqrt(minDist2) < SNAP_THRESHOLD) {
                snappedInfo[i] = {
                    segmentIndex: bestSegIdx,
                    t: bestProj.t,
                    coords: bestProj.coords
                };
                hasAnySnapped = true;
            }
        }

        // If nothing snapped, return original route
        if (!hasAnySnapped) {
            var stationIndices = [];
            for (var i = 0; i < bartRoute.length; i++) {
                stationIndices.push(i);
            }
            return { route: bartRoute, stationIndices: stationIndices };
        }

        var newRoute = [];
        var stationIndices = new Array(bartRoute.length).fill(-1);

        for (var i = 0; i < bartRoute.length; i++) {
            var curr = snappedInfo[i];

            if (i === 0) {
                if (curr) {
                    newRoute.push(curr.coords);
                } else {
                    newRoute.push(bartRoute[0]);
                }
                stationIndices[0] = newRoute.length - 1;
            } else {
                var prev = snappedInfo[i-1];

                // If both are snapped, check if they are moving forward along the highway
                if (prev && curr) {
                    var isForward = (prev.segmentIndex < curr.segmentIndex) ||
                                    (prev.segmentIndex === curr.segmentIndex && prev.t <= curr.t);

                    if (isForward) {
                        // Insert intermediate highway vertices
                        // from segmentIndex of prev + 1 to segmentIndex of curr
                        for (var h = prev.segmentIndex + 1; h <= curr.segmentIndex; h++) {
                            var proj = projectPointOnSegment(hwRoute[h], bartRoute[i-1], bartRoute[i]);
                            if (Math.sqrt(proj.dist2) < SNAP_THRESHOLD) {
                                newRoute.push(hwRoute[h]);
                            }
                        }
                    }
                    newRoute.push(curr.coords);
                    stationIndices[i] = newRoute.length - 1;
                } else {
                    // At least one is not snapped, just push current coordinates
                    if (curr) {
                        newRoute.push(curr.coords);
                    } else {
                        newRoute.push(bartRoute[i]);
                    }
                    stationIndices[i] = newRoute.length - 1;
                }
            }
        }

        return { route: newRoute, stationIndices: stationIndices };
    }

    return {
        init: init,
        selectCity: selectCity,
        selectCounty: selectCounty,
        selectBartStation: selectBartStation,
        clearSelection: clearSelection,
        toggleLayer: toggleLayer,
        showRouteToOAK: showRouteToOAK,
        clearRouteHighlights: clearRouteHighlights,
        updateCityBorders: updateCityBorders
    };
})();

