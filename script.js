
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

    // function getNetworkSpeed() {
    //     const fileUrl = 'https://speed.hetzner.de/1MB.bin'; // 替换为实际的测试文件URL
    //     const fileSizeInBytes = 10 * 1024 * 1024; // 替换为实际的测试文件大小（例如10MB）
    
    //     return new Promise((resolve, reject) => {
    //         const startTime = new Date().getTime();
    //         const xhr = new XMLHttpRequest();
    
    //         xhr.open('GET', fileUrl, true);
    //         xhr.responseType = 'blob';
    
    //         xhr.onload = function() {
    //             if (xhr.status === 200) {
    //                 const endTime = new Date().getTime();
    //                 const durationInSeconds = (endTime - startTime) / 1000;
    //                 const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    //                 const speedInMBps = fileSizeInMB / durationInSeconds;
    //                 resolve(speedInMBps);
    //             } else {
    //                 reject(`Failed to download file: ${xhr.status}`);
    //             }
    //         };
    
    //         xhr.onerror = function() {
    //             reject('Network error occurred while downloading the file.');
    //         };
    
    //         xhr.send();
    //     });
    // }
    
    // // 使用示例
    // getNetworkSpeed().then(speedInMBps => {
    //     console.log(`Download speed: ${speedInMBps.toFixed(2)} MB/s`);
    // }).catch(error => {
    //     console.error(error);
    // });

    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-tab');

            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to the clicked button
            this.classList.add('active');
            
            let loadedCount = 0;
            // Update video sources
            videoContainers.forEach((video, index) => {
                video.pause();
                video.querySelector('source').src = videoSources[targetId][index];
                video.load();
            

                video.oncanplaythrough = function() {
                    loadedCount++;
                    console.log(loadedCount);
                    if (loadedCount === videoContainers.length) {
                        videoContainers.forEach(v => v.play());
                    }
                };
                // setTimeout(() => {
                //     video.play();
                // }, 10000);
                // video.play();
            });
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
                
                if (isNaN(slider2Percentage)){slider2Percentage= 66;}
                if (isNaN(slider1Percentage)){slider1Percentage= 33;}
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

