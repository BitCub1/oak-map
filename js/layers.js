/* ============================================================
   OAK — LAYERS MODULE
   GeoJSON layer management, styling, and interaction
   ============================================================ */

const OAKLayers = (function () {

    let map = null;

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
                        sticky: true,
                        permanent: false,
                        opacity: 1
                    });
                }

                // Hover effects
                layer.on('mouseover', function () {
                    var sel = selectedCities.get(name);
                    if (!sel || sel.isStation) {
                        this.setStyle(STYLES.city.hover);
                        this.bringToFront();
                        if (airportLayer) airportLayer.bringToFront();
                    }
                });

                layer.on('mouseout', function () {
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
                layer.bindTooltip(name, {
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
        cityLayer.eachLayer(function (l) {
            var name = l.feature.properties.NAME || l.feature.properties.name || '';
            var sel = selectedCities.get(name);
            if (sel && !sel.isStation) {
                l.setStyle(STYLES.city.selected);
            } else {
                if (hasSelection) {
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

        // Build per-city route layers — BART first, highway on top
        var hwLayer = null, bartLayer = null;

        var zoom = map.getZoom();
        var offsetMeters = getOffsetDistanceInMeters(zoom);

        var bartRoute = OAKRoutes.getBartRoute(name);
        var hwRoute = OAKRoutes.getHighwayRoute(name);
        var stationIndices = [];

        // Align BART route coordinates to highway coordinates where they run in the same corridor
        // to prevent crossings and gaps when offset.
        if (bartRoute) {
            if (hwRoute) {
                var alignResult = alignBartRouteToHighway(bartRoute, hwRoute);
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
            }
        }
        if (hwRoute && hwRoute.length >= 2) {
            var offsetHwRoute = offsetPolyline(hwRoute, offsetMeters);
            hwLayer = L.polyline(offsetHwRoute, Object.assign({}, STYLES.routeHighlight.highway, {pane: 'routePane'})).addTo(map);
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
                sticky: true,
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
        }

        var selectedCoords = bartRoute[0];
        var marker = L.marker(selectedCoords, {
            icon: L.divIcon({
                className: 'bart-station-icon-square',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            }),
            pane: 'markerPane'
        });
        marker.bindTooltip(stationName.toUpperCase(), {
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
                    sticky: true,
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
        if (!points || points.length < 2) return points;

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
                            newRoute.push(hwRoute[h]);
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
        clearRouteHighlights: clearRouteHighlights
    };
})();

