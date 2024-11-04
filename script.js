// document.getElementById('playButton').addEventListener('click', function() {
//     const videos = document.querySelectorAll('video');
//     videos.forEach(video => {
//         video.play();
//     });
// });

// document.addEventListener('DOMContentLoaded', function() {

//     const video1 = document.getElementById('video1');
//     const video2 = document.getElementById('video2');
//     const video3 = document.getElementById('video3');
//     const slider1 = document.getElementById('slider1');
//     const slider2 = document.getElementById('slider2');
//     const videoContainer = document.getElementById('video-compare-container');
//     const videoContainer1 = document.getElementById('video-container1');
//     const videoContainer2 = document.getElementById('video-container2');
//     const videoContainer3 = document.getElementById('video-container3');



//     // Sync the play/pause state of all videos
//     video1.addEventListener('play', () => { video2.play(); video3.play(); });
//     video1.addEventListener('pause', () => { video2.pause(); video3.pause(); });
//     video2.addEventListener('play', () => { video1.play(); video3.play(); });
//     video2.addEventListener('pause', () => { video1.pause(); video3.pause(); });
//     video3.addEventListener('play', () => { video1.play(); video2.play(); });
//     video3.addEventListener('pause', () => { video1.pause(); video2.pause(); });

//     let isDragging1 = false;
//     let isDragging2 = false;

//     slider1.addEventListener('mousedown', function(e) {
//         isDragging1 = true;
//         document.body.style.cursor = 'ew-resize';
//     });

//     slider2.addEventListener('mousedown', function(e) {
//         isDragging2 = true;
//         document.body.style.cursor = 'ew-resize';
//     });

//     document.addEventListener('mouseup', function(e) {
//         isDragging1 = false;
//         isDragging2 = false;
//         document.body.style.cursor = 'default';
//     });

//     document.addEventListener('mousemove', function(e) {
//         if (isDragging1 || isDragging2) {
//             const rect = videoContainer.getBoundingClientRect();
//             let offsetX = e.clientX - rect.left;

//             if (offsetX < 0) offsetX = 0;
//             if (offsetX > rect.width) offsetX = rect.width;

//             const percentage = offsetX / rect.width * 100;

//             if (isDragging1) {
//                 slider1.style.left = `${percentage}%`;
//                 videoContainer1.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
//                 videoContainer2.style.clipPath = `inset(0 0 0 ${percentage}%)`;
//             }

//             if (isDragging2) {
//                 slider2.style.left = `${percentage}%`;
//                 videoContainer2.style.clipPath = `inset(0 0 0 ${parseFloat(slider1.style.left)}%)`;
//                 videoContainer3.style.clipPath = `inset(0 0 0 ${percentage}%)`;
//             }
//         }
//     });
// });




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

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-tab');

            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            // Add active class to the clicked button
            this.classList.add('active');

            // Update video sources
            videoContainers.forEach((video, index) => {
                video.pause();
                video.querySelector('source').src = videoSources[targetId][index];
                video.load();
                video.play();
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

