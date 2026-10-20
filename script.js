

document.addEventListener('DOMContentLoaded', function() {
    const videoContainers = [
        document.getElementById('video1'),
        document.getElementById('video2'),
        document.getElementById('video3')
    ];

    const videoSources = {
        instance1: ['video/1-3.mp4', 'video/1-2.mp4', 'video/1-1.mp4'],
        instance2: ['video/2-3.mp4', 'video/2-2.mp4', 'video/2-1.mp4'],
        instance3: ['video/3-3.mp4', 'video/3-2.mp4', 'video/3-1.mp4']
    };

    const tabButtons = document.querySelectorAll('.tab-button');
    const videoStatus = document.getElementById('video-status');
    const videoStatusText = document.getElementById('video-status-text');
    const videoProgress = document.getElementById('video-progress');
    const videoProgressLabel = document.getElementById('video-progress-label');
    let loadController;
    let videoUrls = [];

    async function loadVideos(targetId) {
        if (loadController) loadController.abort();
        loadController = new AbortController();
        const controller = loadController;
        const signal = controller.signal;

        videoContainers.forEach(video => {
            video.pause();
            video.removeAttribute('src');
            video.load();
        });
        videoUrls.forEach(url => URL.revokeObjectURL(url));
        videoUrls = [];
        videoStatus.hidden = false;
        videoStatusText.textContent = 'Loading previews';
        videoProgress.hidden = false;
        videoProgress.value = 0;
        videoProgressLabel.textContent = '0%';
        const receivedBytes = [0, 0, 0];
        const totalBytes = [0, 0, 0];

        function updateProgress() {
            if (signal.aborted) return;
            if (totalBytes.every(total => total > 0)) {
                const total = totalBytes.reduce((sum, size) => sum + size, 0);
                const received = receivedBytes.reduce((sum, size) => sum + size, 0);
                const percent = Math.min(100, Math.floor(received / total * 100));
                videoProgress.value = percent;
                videoProgressLabel.textContent = `${percent}%`;
            } else {
                videoProgress.removeAttribute('value');
                videoProgressLabel.textContent = 'Downloading…';
            }
        }

        try {
            // Download complete files so a slower connection cannot start one video early.
            const blobs = await Promise.all(videoSources[targetId].map(async (source, index) => {
                const response = await fetch(source, { signal });
                if (!response.ok) throw new Error('Video download failed');
                totalBytes[index] = Number(response.headers.get('Content-Length'));
                updateProgress();
                const reader = response.body.getReader();
                const chunks = [];
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                    receivedBytes[index] += value.byteLength;
                    updateProgress();
                }
                return new Blob(chunks, { type: response.headers.get('Content-Type') || 'video/mp4' });
            }));
            if (signal.aborted) return;
            videoProgress.value = 100;
            videoProgressLabel.textContent = '100%';
            videoStatusText.textContent = 'Preparing synchronized playback…';

            videoUrls = blobs.map(blob => URL.createObjectURL(blob));
            await Promise.all(videoContainers.map((video, index) => new Promise((resolve, reject) => {
                video.addEventListener('canplay', resolve, { once: true, signal });
                video.addEventListener('error', () => reject(new Error('Video could not be decoded')), { once: true, signal });
                signal.addEventListener('abort', () => reject(signal.reason), { once: true });
                video.src = videoUrls[index];
                video.load();
            })));
            if (signal.aborted) return;

            videoContainers.forEach(video => { video.currentTime = 0; });
            await Promise.all(videoContainers.map(video => video.play()));
            if (!signal.aborted) videoStatus.hidden = true;
        } catch (error) {
            if (signal.aborted) return;
            controller.abort();
            videoContainers.forEach(video => video.pause());
            videoStatusText.textContent = 'Unable to load previews';
            videoProgress.hidden = true;
            videoProgressLabel.textContent = 'Select an instance to retry.';
        }
    }

    // Keep the other modalities aligned with the first video, including after looping.
    videoContainers[0].addEventListener('timeupdate', function() {
        if (this.paused) return;
        videoContainers.slice(1).forEach(video => {
            if (Math.abs(video.currentTime - this.currentTime) > 0.1) {
                video.currentTime = this.currentTime;
            }
        });
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-tab');

            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to the clicked button
            this.classList.add('active');
            loadVideos(targetId);
        });
    });

    // Initialize the first tab as active
    tabButtons[0].click();

    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        let isDragging = false;

        slider.addEventListener('mousedown', function() {
            isDragging = true;
            document.body.style.cursor = 'ew-resize';
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
            document.body.style.cursor = 'default';
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                const videoContainer = slider.closest('#video-compare-container');
                const rect = videoContainer.getBoundingClientRect();
                let offsetX = e.clientX - rect.left;

                if (offsetX < 0) offsetX = 0;
                if (offsetX > rect.width) offsetX = rect.width;

                const percentage = offsetX / rect.width * 100;
                
                const slider1 = document.getElementById('slider1');
                const slider2 = document.getElementById('slider2');
                var slider1Percentage = parseFloat(slider1.style.left);
                var slider2Percentage = parseFloat(slider2.style.left);
                
                if (isNaN(slider2Percentage)){slider2Percentage= 61;}
                if (isNaN(slider1Percentage)){slider1Percentage= 36;}
                console.log("s1: ", slider1Percentage, "s2: ", slider2Percentage);

                if (slider.id === 'slider1' && percentage < slider2Percentage - 3) {
                    slider.style.left = `${percentage}%`;
                    videoContainer.querySelector('#video-container1').style.clipPath = `inset(0 ${100 - percentage}% 0 0`;
                    videoContainer.querySelector('#video-container2').style.clipPath = `inset(0 0 0 ${percentage}%)`;
                }

                if (slider.id === 'slider2' && percentage > slider1Percentage + 3) {
                    slider.style.left = `${percentage}%`;
                    videoContainer.querySelector('#video-container2').style.clipPath = `inset(0 0 0 ${parseFloat(slider.previousElementSibling.style.left)}%)`;
                    videoContainer.querySelector('#video-container3').style.clipPath = `inset(0 0 0 ${percentage}%)`;
                }
            }
        });
    });
});

