/* ============================================================
   OAK — RECORDER MODULE
   4K video capture tool using MediaRecorder and getDisplayMedia APIs.
   ============================================================ */

const OAKRecorder = (function () {
    let mediaRecorder = null;
    let recordedChunks = [];
    let stream = null;
    let isRecording = false;
    let timerInterval = null;
    let startTime = 0;

    function init() {
        const recordBtn = document.getElementById('record-btn');
        if (!recordBtn) return;

        recordBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (isRecording) {
                stopRecording();
            } else {
                startRecording();
            }
        });
    }

    async function startRecording() {
        const recordBtn = document.getElementById('record-btn');
        try {
            // Request display media for tab, window or screen with 4K preference
            // preferCurrentTab is highly recommended for Region Capture (CropTarget)
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 3840, max: 3840 },
                    height: { ideal: 2160, max: 2160 },
                    frameRate: { ideal: 60, max: 60 }
                },
                audio: false,
                preferCurrentTab: true
            });

            // Set up MediaRecorder
            recordedChunks = [];
            let options = { mimeType: 'video/webm;codecs=vp9' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm;codecs=vp8' };
            }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm' };
            }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/mp4' };
            }

            // Apply CropTarget if supported (Region Capture API)
            // This crops the video stream to `#map-container` (the entire map area)
            if (typeof CropTarget !== 'undefined' && typeof CropTarget.fromElement === 'function') {
                const mapContainer = document.getElementById('map-container');
                if (mapContainer) {
                    try {
                        const cropTarget = await CropTarget.fromElement(mapContainer);
                        const [track] = stream.getVideoTracks();
                        if (track && typeof track.cropTo === 'function') {
                            await track.cropTo(cropTarget);
                        }
                    } catch (cropErr) {
                        console.warn('Region Capture (CropTarget) failed or not supported:', cropErr);
                    }
                }
            }

            mediaRecorder = new MediaRecorder(stream, {
                mimeType: options.mimeType,
                videoBitsPerSecond: 50000000 // 50 Mbps for high quality 4K
            });

            mediaRecorder.ondataavailable = function (e) {
                if (e.data && e.data.size > 0) {
                    recordedChunks.push(e.data);
                }
            };

            mediaRecorder.onstop = function () {
                saveRecording();
            };

            // Start recording
            mediaRecorder.start();
            isRecording = true;
            startTime = Date.now();

            // Update UI
            if (recordBtn) {
                recordBtn.classList.add('recording');
                recordBtn.innerHTML = 'RECORDING 00:00';
            }
            document.body.classList.add('map-recording');

            // Hide unselected city borders on map during recording
            if (typeof OAKLayers !== 'undefined' && typeof OAKLayers.updateCityBorders === 'function') {
                OAKLayers.updateCityBorders();
            }

            // Handle when user stops sharing via browser bar
            if (stream && stream.getVideoTracks().length > 0) {
                stream.getVideoTracks()[0].onended = function () {
                    if (isRecording) {
                        stopRecording();
                    }
                };
            }

            // Start timer
            timerInterval = setInterval(updateTimer, 1000);

        } catch (err) {
            console.error('Error starting video capture:', err);
            isRecording = false;
        }
    }

    function updateTimer() {
        const recordBtn = document.getElementById('record-btn');
        if (!recordBtn) return;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
        const secs = String(elapsed % 60).padStart(2, '0');
        recordBtn.innerHTML = `RECORDING ${mins}:${secs}`;
    }

    function stopRecording() {
        if (!isRecording) return;
        
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        clearInterval(timerInterval);
        isRecording = false;

        const recordBtn = document.getElementById('record-btn');
        if (recordBtn) {
            recordBtn.classList.remove('recording');
            recordBtn.innerHTML = 'RECORD';
        }
        document.body.classList.remove('map-recording');

        // Restore city borders on map
        if (typeof OAKLayers !== 'undefined' && typeof OAKLayers.updateCityBorders === 'function') {
            OAKLayers.updateCityBorders();
        }
    }

    function saveRecording() {
        if (recordedChunks.length === 0) return;

        // Create blob and trigger download
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const dateStr = new Date().toISOString().slice(0, 19).replace(/T/g, '-').replace(/:/g, '-');
        a.download = `OAK-Map-4K-${dateStr}.webm`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }

    return {
        init: init
    };
})();
