/* ============================================================
   OAK — INFOBOX MODULE
   Refined minimal info box for cities, counties, sub-regions,
   Bay Area overview, and OAK airport.
   ============================================================ */

const OAKInfoBox = (function () {

    const infoBox = document.getElementById('info-box');
    const infoContent = document.getElementById('info-box-content');
    const closeBtn = document.getElementById('info-box-close');

    // Current selection state
    let currentType = null;
    let currentName = null;

    function init() {
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            // Reset collapsed state so next open is fully expanded
            infoBox.classList.remove('collapsed');
            var t = document.getElementById('info-box-toggle');
            if (t) t.innerHTML = '&#x203A;';
            if (window.OAKApp && window.OAKApp.clearSelection) {
                window.OAKApp.clearSelection();
            }
        });
    }

    function show() { infoBox.classList.remove('hidden'); }
    function hide() { infoBox.classList.add('hidden'); currentType = null; currentName = null; }
    function isVisible() { return !infoBox.classList.contains('hidden'); }

    // ---- Breadcrumb ----
    function buildBreadcrumb(parts) {
        var html = '<div class="info-breadcrumb">';
        for (var i = 0; i < parts.length; i++) {
            if (i > 0) html += '<span class="bc-sep">/</span>';
            var isLast = (i === parts.length - 1);
            if (isLast) {
                html += '<span class="bc-current">' + parts[i].label + '</span>';
            } else {
                html += '<span onclick="OAKInfoBox.navigate(\'' +
                        parts[i].type + '\',\'' +
                        parts[i].name.replace(/'/g, "\\'") + '\')">' +
                        parts[i].label + '</span>';
            }
        }
        html += '</div>';
        return html;
    }

    function navigate(type, name) {
        if (type === 'bayarea') {
            OAKLayers.clearSelection();
        } else if (type === 'subregion') {
            showSubregion(name);
        } else if (type === 'county') {
            OAKLayers.selectCounty(name);
        } else if (type === 'city') {
            OAKLayers.selectCity(name);
        } else if (type === 'airport') {
            showAirport();
        } else if (type === 'bart') {
            OAKLayers.selectBartStation(name);
        }
    }

    // ================================================================
    // MULTI-CITY AGGREGATED INFO BOX
    // ================================================================
    function showMultiCity(names) {
        if (!names || names.length === 0) { showBayArea(); return; }
        if (names.length === 1) { showCity(names[0]); return; }

        currentType = 'multicity';
        currentName = null;

        // Aggregate data
        var totalPop = 0;
        var allEmployers = [];
        var seenEmp = {};
        var counties = [];
        var seenCounty = {};
        var subs = [];
        var seenSub = {};
        var minDist = Infinity, maxDist = 0;
        var minTime = Infinity, maxTime = 0;

        var minBartTime = Infinity, maxBartTime = 0;
        var hasAnyBart = false;

        names.forEach(function (name) {
            var d = CITY_DATA[name];
            if (!d) return;
            totalPop += d.pop || 0;
            if (!seenCounty[d.county]) { counties.push(d.county); seenCounty[d.county] = true; }
            if (!seenSub[d.sub]) { subs.push(d.sub); seenSub[d.sub] = true; }
            if (d.dist < minDist) minDist = d.dist;
            if (d.dist > maxDist) maxDist = d.dist;
            if (d.time < minTime) minTime = d.time;
            if (d.time > maxTime) maxTime = d.time;
            (d.emp || []).forEach(function (e) {
                if (!seenEmp[e]) { allEmployers.push(e); seenEmp[e] = true; }
            });
            var bt = getBartTransitTime(name);
            if (bt !== null) {
                if (bt < minBartTime) minBartTime = bt;
                if (bt > maxBartTime) maxBartTime = bt;
                hasAnyBart = true;
            }
        });

        // Header: all city names
        var nameList = names.map(function(n){ return n.toUpperCase(); }).join('  ·  ');
        var html = '<div class="info-name info-name--multi">' + nameList + '</div>';
        html += '<div class="info-breadcrumb"><span class="bc-current">' + names.length + ' CITIES SELECTED</span></div>';

        html += '<div class="info-section">';
        html += row('Total Pop.', formatNumber(totalPop));
        html += row('Counties', counties.join(', '));
        if (subs.length > 0) html += row('Sub-regions', subs.join(', '));
        html += '</div>';

        if (allEmployers.length > 0) {
            html += '<div class="info-section">';
            html += sectionTitle('KEY EMPLOYERS');
            var topN = allEmployers.slice(0, 8);
            for (var i = 0; i < topN.length; i++) {
                html += '<div class="info-emp">' + (i + 1) + '. ' + topN[i] + '</div>';
            }
            if (allEmployers.length > 8) {
                html += '<div class="info-emp" style="color:#555">+ ' + (allEmployers.length - 8) + ' more</div>';
            }
            html += '</div>';
        }

        // OAK distance block
        var distStr = minDist === maxDist ? minDist + ' mi' : minDist + ' – ' + maxDist + ' mi';
        var timeStr = minTime === maxTime ? minTime + ' min' : minTime + ' – ' + maxTime + ' min';
        var bartTimeStr = null;
        if (hasAnyBart) {
            bartTimeStr = minBartTime === maxBartTime ? minBartTime + ' min' : minBartTime + ' – ' + maxBartTime + ' min';
        }

        html += '<div class="info-oak-block">';
        html += '<div class="info-oak-header"><div class="info-oak-icon"></div><div class="info-oak-label">DISTANCE TO OAK</div></div>';
        html += '<div class="info-oak-dist">' + distStr + '</div>';
        html += '<div class="info-oak-time">' + timeStr + ' drive</div>';
        if (bartTimeStr) {
            html += '<div class="info-oak-time">' + bartTimeStr + ' BART transit</div>';
        }
        html += '</div>';

        infoContent.innerHTML = html;
        show();
    }

    // ================================================================
    // CITY INFO BOX
    // ================================================================
    function showCity(name) {
        var d = CITY_DATA[name];
        if (!d) return;

        currentType = 'city';
        currentName = name;

        var breadcrumb = buildBreadcrumb([
            { label: 'BAY AREA', type: 'bayarea', name: 'bayarea' },
            { label: d.county.toUpperCase(), type: 'county', name: d.county },
            { label: name.toUpperCase(), type: 'city', name: name }
        ]);

        var html = '<div class="info-name">' + name + '</div>';
        html += breadcrumb;

        // Key metrics — compact row
        html += '<div class="info-section">';
        html += row('Population', formatNumber(d.pop));
        html += row('County', d.county);
        html += row('Sub-region', d.sub);
        html += '</div>';

        // Top employers
        if (d.emp && d.emp.length > 0) {
            html += '<div class="info-section">';
            html += sectionTitle('TOP EMPLOYERS');
            for (var i = 0; i < d.emp.length; i++) {
                html += '<div class="info-emp">' + (i + 1) + '. ' + d.emp[i] + '</div>';
            }
            html += '</div>';
        }

        // BART station
        var bartStation = OAKRoutes.getNearestBartStation(name);
        if (bartStation) {
            html += '<div class="info-section">';
            html += row('BART', bartStation + ' Station');
            html += '</div>';
        }

        // OAK distance — accent block
        var bartTime = getBartTransitTime(name);
        html += oakDistanceBlock(d.dist, d.time, bartTime, name);

        infoContent.innerHTML = html;
        show();
    }

    // ================================================================
    // COUNTY INFO BOX
    // ================================================================
    function showCounty(name) {
        var d = COUNTY_DATA[name];
        if (!d) return;

        currentType = 'county';
        currentName = name;

        var breadcrumb = buildBreadcrumb([
            { label: 'BAY AREA', type: 'bayarea', name: 'bayarea' },
            { label: (name + ' CO.').toUpperCase(), type: 'county', name: name }
        ]);

        var html = '<div class="info-name">' + name + ' County</div>';
        html += breadcrumb;

        html += '<div class="info-section">';
        html += row('Population', formatNumber(d.pop));
        html += row('GDP', formatGDP(d.gdp));
        html += row('Cities', d.cities);
        html += row('Sub-region', d.sub);
        html += '</div>';

        if (d.emp && d.emp.length > 0) {
            html += '<div class="info-section">';
            html += sectionTitle('TOP EMPLOYERS');
            for (var i = 0; i < d.emp.length; i++) {
                html += '<div class="info-emp">' + (i + 1) + '. ' + d.emp[i] + '</div>';
            }
            html += '</div>';
        }

        infoContent.innerHTML = html;
        show();
    }

    // ================================================================
    // SUB-REGION INFO BOX
    // ================================================================
    function showSubregion(name) {
        var d = SUBREGION_DATA[name];
        if (!d) return;

        currentType = 'subregion';
        currentName = name;

        var breadcrumb = buildBreadcrumb([
            { label: 'BAY AREA', type: 'bayarea', name: 'bayarea' },
            { label: name.toUpperCase(), type: 'subregion', name: name }
        ]);

        var html = '<div class="info-name">' + name + '</div>';
        html += breadcrumb;

        html += '<div class="info-section">';
        html += row('Population', formatNumber(d.pop));
        html += row('GDP', formatGDP(d.gdp));
        html += row('Cities', d.cities);
        html += row('Counties', d.counties.join(', '));
        html += '</div>';

        if (d.description) {
            html += '<div class="info-section">';
            html += '<p class="info-desc">' + d.description + '</p>';
            html += '</div>';
        }

        infoContent.innerHTML = html;
        show();
    }

    // ================================================================
    // BAY AREA OVERVIEW
    // ================================================================
    function showBayArea() {
        var d = BAYAREA_DATA;

        currentType = 'bayarea';
        currentName = 'bayarea';

        var html = '<div class="info-name">SF Bay Area</div>';
        html += '<div class="info-breadcrumb"><span class="bc-current">ECONOMIC MEGAREGION</span></div>';

        html += '<div class="info-section">';
        html += row('Population', formatNumber(d.pop));
        html += row('GDP', formatGDP(d.gdp));
        html += row('Counties', d.counties);
        html += row('Cities', d.cities);
        html += '</div>';

        // Sub-regions as clickable items
        html += '<div class="info-section">';
        html += sectionTitle('SUB-REGIONS');
        var subs = Object.keys(SUBREGION_DATA);
        for (var i = 0; i < subs.length; i++) {
            var sr = SUBREGION_DATA[subs[i]];
            html += '<div class="info-row info-link" onclick="OAKInfoBox.navigate(\'subregion\',\'' + subs[i] + '\')">';
            html += '<span class="info-label">' + subs[i] + '</span>';
            html += '<span class="info-value">' + formatNumber(sr.pop) + '</span>';
            html += '</div>';
        }
        html += '</div>';

        // OAK summary
        html += '<div class="info-oak-block" onclick="OAKInfoBox.showAirport()" style="cursor:pointer">';
        html += '<div class="info-oak-header">';
        html += '<div class="info-oak-icon"></div>';
        html += '<div class="info-oak-label">OAK — OAKLAND INTERNATIONAL</div>';
        html += '</div>';
        html += '<div class="info-oak-stat">' + OAK_DATA.passengers + ' passengers</div>';
        html += '</div>';

        infoContent.innerHTML = html;
        show();
    }

    // ================================================================
    // OAK AIRPORT INFO BOX
    // ================================================================
    function showAirport() {
        var d = OAK_DATA;

        currentType = 'airport';
        currentName = 'OAK';

        var breadcrumb = buildBreadcrumb([
            { label: 'BAY AREA', type: 'bayarea', name: 'bayarea' },
            { label: 'OAK', type: 'airport', name: 'OAK' }
        ]);

        var html = '<div class="info-name">OAKLAND<br>SAN FRANCISCO BAY<br>AIRPORT</div>';
        html += breadcrumb;

        html += '<div class="info-section">';
        html += row('IATA Code', d.code);
        html += row('Passengers', d.passengers);
        html += row('Airlines', d.airlines);
        html += row('Destinations', d.destinations);
        html += '</div>';

        html += '<div class="info-section">';
        html += '<p class="info-desc">' + d.description + '</p>';
        html += '</div>';

        html += '<div class="info-section">';
        html += sectionTitle('CONNECTIVITY');
        html += row('Highway', 'I-880 / Hegenberger Rd');
        html += row('BART', 'OAK Airport Connector');
        html += row('Location', 'Oakland, Alameda County');
        html += '</div>';

        infoContent.innerHTML = html;
        show();
    }

    function showBartStation(stationName, routeCoords) {
        currentType = 'bart';
        currentName = stationName;

        var totalMeters = 0;
        for (var i = 0; i < routeCoords.length - 1; i++) {
            var p1 = L.latLng(routeCoords[i][0], routeCoords[i][1]);
            var p2 = L.latLng(routeCoords[i+1][0], routeCoords[i+1][1]);
            totalMeters += p1.distanceTo(p2);
        }
        var miles = totalMeters / 1609.34;
        var timeMins = Math.round(miles * 1.6) + 2;

        var county = getCountyForBartStation(stationName);

        var breadcrumb = buildBreadcrumb([
            { label: 'BAY AREA', type: 'bayarea', name: 'bayarea' },
            { label: county.toUpperCase(), type: 'county', name: county.replace(/ County$/i, '') },
            { label: (stationName + ' Station').toUpperCase(), type: 'bart', name: stationName }
        ]);

        var html = '<div class="info-name">' + stationName + ' Station</div>';
        html += breadcrumb;

        html += '<div class="info-section">';
        html += sectionTitle('BART STATION INFO');
        html += row('Station Name', stationName + ' Station');
        html += row('County', county);
        html += '</div>';

        html += oakTransitBlock(Math.round(miles), timeMins);

        infoContent.innerHTML = html;
        show();
    }

    function getCountyForBartStation(stationName) {
        var alameda = ["Coliseum", "Oakland Airport", "San Leandro", "Bay Fair", "Hayward", "South Hayward", "Union City", "Fremont", "Warm Springs", "Castro Valley", "West Dublin", "Dublin", "MacArthur", "19th St Oakland", "12th St Oakland", "Lake Merritt", "Fruitvale", "West Oakland", "Ashby", "Downtown Berkeley", "North Berkeley", "Rockridge", "Dublin/Pleasanton", "West Dublin/Pleasanton"];
        var cc = ["El Cerrito del Norte", "El Cerrito Plaza", "Orinda", "Lafayette", "Walnut Creek", "Pleasant Hill", "Concord", "North Concord", "Pittsburg", "Pittsburg Center", "Antioch", "Richmond", "Pittsburg/Bay Point"];
        var sf = ["Embarcadero", "Montgomery", "Montgomery St", "Powell", "Powell St", "Civic Center", "16th St Mission", "24th St Mission", "Glen Park", "Balboa Park"];
        var sm = ["Daly City", "Colma", "South San Francisco", "San Bruno", "Millbrae", "San Francisco Int'l Airport", "San Francisco International Airport"];
        var sc = ["Milpitas", "Berryessa"];

        var name = OAKRoutes.normalizeStationName(stationName);

        if (alameda.indexOf(name) !== -1) return "Alameda County";
        if (cc.indexOf(name) !== -1) return "Contra Costa County";
        if (sf.indexOf(name) !== -1) return "San Francisco County";
        if (sm.indexOf(name) !== -1) return "San Mateo County";
        if (sc.indexOf(name) !== -1) return "Santa Clara County";
        return "Bay Area";
    }

    function oakTransitBlock(dist, time) {
        var html = '<div class="info-oak-block">';
        html += '<div class="info-oak-header">';
        html += '<div class="info-oak-icon"></div>';
        html += '<div class="info-oak-label">DISTANCE TO OAK VIA BART</div>';
        html += '</div>';
        html += '<div class="info-oak-dist">' + dist + ' mi</div>';
        html += '<div class="info-oak-time">' + time + ' min BART transit</div>';
        html += '</div>';
        return html;
    }

    // ================================================================
    // HELPERS
    // ================================================================

    function sectionTitle(text) {
        return '<div class="info-section-title">' + text + '</div>';
    }

    function row(label, value) {
        return '<div class="info-row"><span class="info-label">' + label + '</span><span class="info-value">' + value + '</span></div>';
    }

    function getBartTransitTime(cityName) {
        var route = OAKRoutes.getBartRoute(cityName);
        if (!route || route.length < 2) return null;

        var totalMeters = 0;
        for (var i = 0; i < route.length - 1; i++) {
            var p1 = L.latLng(route[i][0], route[i][1]);
            var p2 = L.latLng(route[i+1][0], route[i+1][1]);
            totalMeters += p1.distanceTo(p2);
        }
        var miles = totalMeters / 1609.34;
        return Math.round(miles * 1.6) + 2;
    }

    function isStationInCity(stationName, cityName) {
        if (!stationName || !cityName) return false;
        var s = OAKRoutes.normalizeStationName(stationName).toLowerCase();
        var c = cityName.toLowerCase();
        
        if (s.indexOf(c) !== -1 || c.indexOf(s) !== -1) return true;
        
        if (s === "berryessa" && c === "san jose") return true;
        if (s === "bay fair" && c === "san leandro") return true;
        
        var oaklandStations = ["macarthur", "fruitvale", "coliseum", "lake merritt", "rockridge", "west oakland", "12th st oakland", "19th st oakland", "oakland airport"];
        if (c === "oakland" && oaklandStations.indexOf(s) !== -1) return true;
        
        var berkeleyStations = ["downtown berkeley", "north berkeley", "ashby"];
        if (c === "berkeley" && berkeleyStations.indexOf(s) !== -1) return true;
        
        var ecStations = ["el cerrito del norte", "el cerrito plaza"];
        if (c === "el cerrito" && ecStations.indexOf(s) !== -1) return true;
        
        var sfStations = ["embarcadero", "montgomery", "powell", "civic center", "16th st mission", "24th st mission", "glen park", "balboa park"];
        if (c === "san francisco" && sfStations.indexOf(s) !== -1) return true;
        
        if ((s === "dublin/pleasanton" || s === "west dublin/pleasanton") && (c === "dublin" || c === "pleasanton")) return true;
        
        return false;
    }

    function getDriveTimeToStation(cityName, stationName) {
        var route = OAKRoutes.getHighwayRoute(cityName);
        if (!route || route.length === 0) return null;
        var cityPt = route[0];
        
        var stations = OAKRoutes.getBartStations();
        var stationPt = stations[stationName];
        if (!stationPt) return null;
        
        var lat1 = cityPt[0], lon1 = cityPt[1];
        var lat2 = stationPt[0], lon2 = stationPt[1];
        var R = 3958.8; // Radius of Earth in miles
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var miles = R * c;
        
        return Math.max(2, Math.round(miles * 1.8 + 2));
    }

    function oakDistanceBlock(dist, time, bartTime, cityName) {
        var html = '<div class="info-oak-block">';
        html += '<div class="info-oak-header">';
        html += '<div class="info-oak-icon"></div>';
        html += '<div class="info-oak-label">DISTANCE TO OAK</div>';
        html += '</div>';
        html += '<div class="info-oak-dist">' + dist + ' mi</div>';
        html += '<div class="info-oak-time">' + time + ' min drive</div>';
        if (bartTime) {
            var bartStr = bartTime + ' min BART transit';
            if (cityName) {
                var stationName = OAKRoutes.getNearestBartStation(cityName);
                if (stationName && !isStationInCity(stationName, cityName)) {
                    var stationDriveTime = getDriveTimeToStation(cityName, stationName);
                    if (stationDriveTime !== null) {
                        var displayStationName = OAKRoutes.getDisplayStationName(stationName);
                        bartStr += ' (' + stationDriveTime + ' min drive to ' + displayStationName + ' Station)';
                    }
                }
            }
            html += '<div class="info-oak-time">' + bartStr + '</div>';
        }
        html += '</div>';
        return html;
    }

    return {
        init: init,
        show: show,
        hide: hide,
        isVisible: isVisible,
        showCity: showCity,
        showCounty: showCounty,
        showSubregion: showSubregion,
        showBayArea: showBayArea,
        showAirport: showAirport,
        showMultiCity: showMultiCity,
        showBartStation: showBartStation,
        navigate: navigate
    };
})();
