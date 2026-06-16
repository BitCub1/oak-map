/* ============================================================
   OAK — APP MODULE
   Main application bootstrap and coordination
   ============================================================ */

const OAKApp = (function () {

    function init() {
        // 1. Initialize map
        var map = OAKMap.init();

        // 2. Initialize info box
        OAKInfoBox.init();

        // 2b. Info box collapse toggle
        var infoBox = document.getElementById('info-box');
        var toggleBtn = document.getElementById('info-box-toggle');
        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var collapsed = infoBox.classList.toggle('collapsed');
            // Left-edge tab: › when open (click to collapse), ‹ when closed (click to expand)
            toggleBtn.innerHTML = collapsed ? '&#x2039;' : '&#x203A;';
        });

        // 3. Initialize layers (loads GeoJSON async)
        OAKLayers.init(map, {
            onReady: function () {
                // Synchronize layer visibilities with checkboxes at startup
                var layerMap = {
                    'layer-cities': 'cities',
                    'layer-counties': 'counties',
                    'layer-bart': 'bart',
                    'layer-highways': 'highways',
                    'layer-airport': 'airport'
                };
                Object.keys(layerMap).forEach(function (checkId) {
                    var checkbox = document.getElementById(checkId);
                    if (checkbox) {
                        OAKLayers.toggleLayer(layerMap[checkId], checkbox.checked);
                    }
                });

                // Show Bay Area overview as default state
                OAKInfoBox.showBayArea();
            }
        });

        // 4. Set up layer toggle controls
        initLayerControls();

        // 5. Map click on empty area → show Bay Area overview
        map.on('click', function () {
            OAKLayers.clearSelection();
        });

        // 6. Keyboard shortcuts
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                OAKLayers.clearSelection();
                closeLayerControls();
            }
        });
    }

    function initLayerControls() {
        var toggleBtn = document.getElementById('layer-toggle-btn');
        var panel = document.getElementById('layer-controls');

        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            panel.classList.toggle('hidden');
            toggleBtn.classList.toggle('active');
        });

        // Layer checkboxes
        var layerMap = {
            'layer-cities': 'cities',
            'layer-counties': 'counties',
            'layer-bart': 'bart',
            'layer-highways': 'highways',
            'layer-airport': 'airport'
        };

        Object.keys(layerMap).forEach(function (checkId) {
            var checkbox = document.getElementById(checkId);
            if (checkbox) {
                checkbox.addEventListener('change', function () {
                    OAKLayers.toggleLayer(layerMap[checkId], this.checked);
                });
            }
        });

        // Close panel when clicking elsewhere
        document.addEventListener('click', function (e) {
            if (!panel.contains(e.target) && e.target !== toggleBtn) {
                panel.classList.add('hidden');
                toggleBtn.classList.remove('active');
            }
        });
    }

    function closeLayerControls() {
        var panel = document.getElementById('layer-controls');
        var btn = document.getElementById('layer-toggle-btn');
        panel.classList.add('hidden');
        btn.classList.remove('active');
    }

    // Expose globally for info box breadcrumb navigation
    window.OAKApp = {
        clearSelection: function () { OAKLayers.clearSelection(); }
    };

    return {
        init: init
    };
})();

// ---- Boot ----
document.addEventListener('DOMContentLoaded', function () {
    OAKApp.init();
});
