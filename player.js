let hls = null;

// Load video from localStorage
window.onload = function() {
    const videoData = JSON.parse(localStorage.getItem('currentVideo'));
    if (videoData) {
        playVideo(videoData);
    } else {
        alert('ไม่พบข้อมูลวิดีโอ');
        window.close();
    }
};

function playVideo(video) {
    const player = document.getElementById('videoPlayer');
    const overlay = document.getElementById('videoInfoOverlay');

    // นำชื่อเรื่องวิดีโอจากตัวแปรมาแสดงบนหน้าจอทันที
    if (overlay && video.title) {
        overlay.textContent = video.title;
    }

    // Destroy previous HLS instance
    if (hls) {
        hls.destroy();
    }

    // Play video directly without proxy
    const videoUrl = video.url;

    if (video.url.endsWith('.m3u8') || video.url.includes('m3u8')) {
        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(videoUrl);
            hls.attachMedia(player);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                player.play();
            });
            hls.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                    console.error('HLS Error:', data);
                }
            });
        } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
            player.src = videoUrl;
            player.play();
        }
    } else {
        player.src = videoUrl;
        player.play();
    }
}

function closePlayer() {
    const player = document.getElementById('videoPlayer');

    player.pause();
    
    if (hls) {
        hls.destroy();
        hls = null;
    }

    window.close();
}

function goBack() {
    window.close();
}

// Close player on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePlayer();
    }
});