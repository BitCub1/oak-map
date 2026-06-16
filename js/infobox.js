/* ============================================================
   OAK — INFOBOX MODULE
   Refined minimal info box for cities, counties, sub-regions,
   Bay Area overview, and OAK airport.
   ============================================================ */

const OAKInfoBox = (function () {

    const infoBox = document.getElementById('info-box');
    const infoContent = document.getElementById('info-box-content');
    const closeBtn = document.getElementById('info-box-close');

    const BART_ICON_SVG = '<svg class="bart-station-tooltip-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 294 300"><path d="M 258 163 L 258 162 L 256 162 L 256 161 L 254 161 L 254 160 L 243 160 L 243 161 L 240 161 L 240 162 L 238 162 L 238 163 L 237 163 L 237 164 L 236 164 L 236 165 L 235 165 L 235 166 L 234 166 L 234 167 L 233 167 L 233 169 L 232 169 L 232 171 L 231 171 L 231 174 L 230 174 L 230 181 L 231 181 L 231 185 L 232 185 L 232 187 L 233 187 L 233 188 L 234 188 L 234 189 L 235 189 L 235 191 L 236 191 L 236 192 L 238 192 L 238 193 L 239 193 L 239 194 L 241 194 L 241 195 L 244 195 L 244 196 L 252 196 L 252 195 L 255 195 L 255 194 L 257 194 L 257 193 L 259 193 L 259 192 L 260 192 L 260 191 L 261 191 L 261 190 L 262 190 L 262 189 L 263 189 L 263 187 L 264 187 L 264 185 L 265 185 L 265 183 L 266 183 L 266 173 L 265 173 L 265 170 L 264 170 L 264 168 L 263 168 L 263 167 L 262 167 L 262 166 L 261 166 L 261 165 L 260 165 L 260 164 L 259 164 L 259 163 Z M 7 110 L 8 110 L 8 105 L 9 105 L 9 100 L 10 100 L 10 94 L 11 94 L 11 89 L 12 89 L 12 84 L 13 84 L 13 79 L 14 79 L 14 73 L 15 73 L 15 68 L 16 68 L 16 63 L 17 63 L 17 58 L 18 58 L 18 52 L 19 52 L 19 47 L 20 47 L 20 42 L 21 42 L 21 36 L 22 36 L 22 31 L 23 31 L 23 27 L 24 27 L 24 25 L 25 25 L 25 23 L 26 23 L 26 22 L 27 22 L 27 21 L 28 21 L 28 19 L 29 19 L 29 18 L 31 18 L 31 17 L 32 17 L 32 16 L 33 16 L 33 15 L 35 15 L 35 14 L 37 14 L 37 13 L 40 13 L 40 12 L 45 12 L 45 11 L 51 11 L 51 10 L 57 10 L 57 9 L 63 9 L 63 8 L 69 8 L 69 7 L 74 7 L 74 6 L 80 6 L 80 5 L 86 5 L 86 4 L 92 4 L 92 3 L 98 3 L 98 2 L 104 2 L 104 1 L 190 1 L 190 2 L 196 2 L 196 3 L 202 3 L 202 4 L 208 4 L 208 5 L 214 5 L 214 6 L 220 6 L 220 7 L 226 7 L 226 8 L 232 8 L 232 9 L 238 9 L 238 10 L 243 10 L 243 11 L 249 11 L 249 12 L 254 12 L 254 13 L 257 13 L 257 14 L 259 14 L 259 15 L 261 15 L 261 16 L 262 16 L 262 17 L 264 17 L 264 18 L 265 18 L 265 19 L 266 19 L 266 20 L 267 20 L 267 22 L 268 22 L 268 23 L 269 23 L 269 25 L 270 25 L 270 27 L 271 27 L 271 30 L 272 30 L 272 35 L 273 35 L 273 41 L 274 41 L 274 46 L 275 46 L 275 51 L 276 51 L 276 57 L 277 57 L 277 62 L 278 62 L 278 67 L 279 67 L 279 73 L 280 73 L 280 78 L 281 78 L 281 83 L 282 83 L 282 88 L 283 88 L 283 94 L 284 94 L 284 99 L 285 99 L 285 104 L 286 104 L 286 110 L 287 110 L 287 115 L 288 115 L 288 120 L 289 120 L 289 125 L 290 125 L 290 131 L 291 131 L 291 136 L 292 136 L 292 141 L 293 141 L 293 149 L 294 149 L 294 160 L 293 160 L 293 168 L 292 168 L 292 172 L 291 172 L 291 176 L 290 176 L 290 181 L 289 181 L 289 185 L 288 185 L 288 189 L 287 189 L 287 193 L 286 193 L 286 197 L 285 197 L 285 202 L 284 202 L 284 206 L 283 206 L 283 210 L 282 210 L 282 214 L 281 214 L 281 218 L 280 218 L 280 222 L 279 222 L 279 227 L 278 227 L 278 231 L 277 231 L 277 235 L 276 235 L 276 239 L 275 239 L 275 243 L 274 243 L 274 245 L 273 245 L 273 246 L 272 246 L 272 247 L 271 247 L 271 248 L 269 248 L 269 249 L 225 249 L 225 299 L 206 299 L 206 258 L 88 258 L 88 299 L 69 299 L 69 249 L 25 249 L 25 248 L 23 248 L 23 247 L 22 247 L 22 246 L 21 246 L 21 245 L 20 245 L 20 243 L 19 243 L 19 239 L 18 239 L 18 235 L 17 235 L 17 231 L 16 231 L 16 226 L 15 226 L 15 222 L 14 222 L 14 218 L 13 218 L 13 214 L 12 214 L 12 210 L 11 210 L 11 205 L 10 205 L 10 201 L 9 201 L 9 197 L 8 197 L 8 193 L 7 193 L 7 189 L 6 189 L 6 184 L 5 184 L 5 180 L 4 180 L 4 176 L 3 176 L 3 172 L 2 172 L 2 167 L 1 167 L 1 156 L 0 156 L 0 153 L 1 153 L 1 142 L 2 142 L 2 136 L 3 136 L 3 131 L 4 131 L 4 126 L 5 126 L 5 121 L 6 121 L 6 116 L 7 116 Z M 26 121 L 25 121 L 25 126 L 26 126 L 26 128 L 27 128 L 27 129 L 28 129 L 28 130 L 29 130 L 29 131 L 30 131 L 30 132 L 33 132 L 33 133 L 91 133 L 91 132 L 93 132 L 93 131 L 94 131 L 94 130 L 95 130 L 95 129 L 96 129 L 96 27 L 95 27 L 95 26 L 94 26 L 94 25 L 92 25 L 92 24 L 85 24 L 85 25 L 77 25 L 77 26 L 69 26 L 69 27 L 61 27 L 61 28 L 54 28 L 54 29 L 46 29 L 46 30 L 43 30 L 43 31 L 41 31 L 41 32 L 40 32 L 40 34 L 39 34 L 39 40 L 38 40 L 38 46 L 37 46 L 37 52 L 36 52 L 36 58 L 35 58 L 35 64 L 34 64 L 34 70 L 33 70 L 33 77 L 32 77 L 32 83 L 31 83 L 31 89 L 30 89 L 30 96 L 29 96 L 29 102 L 28 102 L 28 108 L 27 108 L 27 114 L 26 114 Z M 28 182 L 29 182 L 29 185 L 30 185 L 30 187 L 31 187 L 31 189 L 32 189 L 32 190 L 33 190 L 33 191 L 34 191 L 34 192 L 36 192 L 36 193 L 37 193 L 37 194 L 39 194 L 39 195 L 42 195 L 42 196 L 50 196 L 50 195 L 53 195 L 53 194 L 55 194 L 55 193 L 56 193 L 56 192 L 58 192 L 58 191 L 59 191 L 59 190 L 60 190 L 60 188 L 61 188 L 61 187 L 62 187 L 62 185 L 63 185 L 63 182 L 64 182 L 64 174 L 63 174 L 63 171 L 62 171 L 62 169 L 61 169 L 61 167 L 60 167 L 60 166 L 59 166 L 59 165 L 58 165 L 58 164 L 57 164 L 57 163 L 56 163 L 56 162 L 54 162 L 54 161 L 52 161 L 52 160 L 41 160 L 41 161 L 38 161 L 38 162 L 36 162 L 36 163 L 35 163 L 35 164 L 34 164 L 34 165 L 33 165 L 33 166 L 32 166 L 32 167 L 31 167 L 31 169 L 30 169 L 30 171 L 29 171 L 29 173 L 28 173 Z M 97 221 L 97 222 L 96 222 L 96 240 L 198 240 L 198 221 Z" fill="currentColor" fill-rule="evenodd" /></svg>';

    // Current selection state
    let currentType = null;
    let currentName = null;

    function init() {
        if (closeBtn) {
            closeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                // Reset collapsed state so next open is fully expanded
                infoBox.classList.remove('collapsed');
                var t = document.getElementById('info-box-toggle');
                if (t) {
                    t.classList.remove('active');
                    t.classList.add('hidden');
                }
                if (window.OAKApp && window.OAKApp.clearSelection) {
                    window.OAKApp.clearSelection();
                }
            });
        }
    }

    function show() {
        infoBox.classList.remove('hidden');
        var t = document.getElementById('info-box-toggle');
        if (t) {
            t.classList.remove('hidden');
            t.classList.add('active');
        }
    }

    function hide() {
        infoBox.classList.add('hidden');
        var t = document.getElementById('info-box-toggle');
        if (t) {
            t.classList.add('hidden');
            t.classList.remove('active');
        }
        currentType = null;
        currentName = null;
    }

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
            var driveData = getDynamicCityDrivingData(name);
            if (driveData.dist < minDist) minDist = driveData.dist;
            if (driveData.dist > maxDist) maxDist = driveData.dist;
            if (driveData.time < minTime) minTime = driveData.time;
            if (driveData.time > maxTime) maxTime = driveData.time;
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
        var distStr = "";
        if (minDist === maxDist) {
            distStr = minDist + ' mi / ' + Math.round(minDist * 1.60934) + ' km';
        } else {
            distStr = minDist + ' – ' + maxDist + ' mi / ' + Math.round(minDist * 1.60934) + ' – ' + Math.round(maxDist * 1.60934) + ' km';
        }
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
        var driveData = getDynamicCityDrivingData(name);
        html += oakDistanceBlock(driveData.dist, driveData.time, bartTime, name);

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
            { label: stationName.toUpperCase(), type: 'bart', name: stationName }
        ]);

        var html = '<div class="info-name info-name--bart">' + BART_ICON_SVG + '<span>' + stationName + '</span></div>';
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
        var cc = ["El Cerrito del Norte", "El Cerrito Plaza", "Orinda", "Lafayette", "Walnut Creek", "Pleasant Hill", "Concord", "North Concord/Martinez", "Pittsburg", "Pittsburg Center", "Antioch", "Richmond", "Pittsburg/Bay Point"];
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
        var km = Math.round(dist * 1.60934);
        html += '<div class="info-oak-dist">' + dist + ' mi / ' + km + ' km</div>';
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
        var bartTime = Math.round(miles * 1.6) + 2;

        var stationName = OAKRoutes.getNearestBartStation(cityName);
        if (stationName && !OAKRoutes.isStationInCity(stationName, cityName)) {
            var driveTime = getDriveTimeToStation(cityName, stationName);
            if (driveTime !== null) {
                bartTime += driveTime;
            }
        }

        return bartTime;
    }

    function getDynamicCityDrivingData(cityName) {
        var route = OAKRoutes.getHighwayRoute(cityName);
        if (!route || route.length < 2) {
            var d = CITY_DATA[cityName];
            return { dist: d ? d.dist : 0, time: d ? d.time : 0 };
        }

        var totalMiles = 0;
        var R = 3958.8; // Radius of Earth in miles
        for (var i = 0; i < route.length - 1; i++) {
            var p1 = route[i];
            var p2 = route[i+1];
            var dLat = (p2[0] - p1[0]) * Math.PI / 180;
            var dLng = (p2[1] - p1[1]) * Math.PI / 180;
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
                      Math.sin(dLng/2) * Math.sin(dLng/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            totalMiles += R * c;
        }

        var dist = Math.round(totalMiles);
        // Average speed under no traffic congestion is ~55 mph.
        // We add 2 minutes for local street transitions.
        var time = Math.round((totalMiles / 55) * 60 + 2);
        time = Math.max(5, time);

        return { dist: dist, time: time };
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
        var km = Math.round(dist * 1.60934);
        html += '<div class="info-oak-dist">' + dist + ' mi / ' + km + ' km</div>';
        html += '<div class="info-oak-time">' + time + ' min drive</div>';
        if (bartTime) {
            var bartStr = bartTime + ' min BART transit';
            if (cityName) {
                var stationName = OAKRoutes.getNearestBartStation(cityName);
                if (stationName && !OAKRoutes.isStationInCity(stationName, cityName)) {
                    var stationDriveTime = getDriveTimeToStation(cityName, stationName);
                    if (stationDriveTime !== null) {
                        var displayStationName = OAKRoutes.getDisplayStationName(stationName);
                        bartStr += ' (' + stationDriveTime + ' min to ' + displayStationName + ' Station)';
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
