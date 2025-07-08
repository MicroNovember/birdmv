// player.js

document.addEventListener('DOMContentLoaded', () => {
    // Get URL parameters
    const params = new URLSearchParams(location.search);
    const name = params.get("name") || "ไม่ทราบชื่อ";
    const info = (params.get("info") || params.get("audio") || "").trim(); // รับได้ทั้ง info และ audio
    const rawUrl = params.get("url") || "";
    const image = params.get("image") || "";
    const videoURL = decodeURIComponent(rawUrl);

    // Update movie title and audio info
    document.getElementById("movie-title").textContent = name;
    const audioInfoElem = document.getElementById("audio-info");
    if (audioInfoElem) {
        audioInfoElem.textContent = info ? "เสียง: " + info : "";
    }

    // Get video elements and favorite button
    const videoElement = document.getElementById("my-player");
    const videoSource = document.getElementById("video-source");
    const favBtn = document.getElementById("fav-btn");
    const homeButton = document.getElementById("home-button"); // อ้างอิงปุ่มหน้าแรก

    // Set video source
    if (videoURL) {
        videoSource.src = videoURL;
        // Plyr can handle MP4 directly. For HLS (.m3u8), hls.js will be used.
        if (videoURL.endsWith(".m3u8")) {
            videoSource.type = "application/x-mpegURL"; // Still specify type for clarity
        }
    }

    // Initialize Plyr player with desired controls
    const player = new Plyr(videoElement, {
        // Define which controls to show in the player
        controls: [
            'play-large', // Large play button in the center of the player
            'play',       // Play/pause button
            'progress',   // Progress bar
            'current-time', // Current playback time
            'duration',   // Total duration of the video
            'mute',       // Mute/unmute button
            'volume',     // Volume slider
            'settings',   // Settings menu (for quality, speed, etc.)
            'pip',        // Picture-in-Picture button
            'fullscreen'  // Fullscreen button
        ],
        // Configure the settings menu to include quality and speed options
        settings: ['quality', 'speed'],
        // You can add more Plyr options here, e.g., volume, autoplay, etc.
    });

    // Handle HLS (m3u8) streams with hls.js for Plyr
    if (videoURL.endsWith(".m3u8") && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoURL);
        hls.attachMedia(videoElement);

        // When HLS manifest is parsed, set up quality options for Plyr
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            console.log("HLS manifest parsed.");
            // Optional: Set initial volume after HLS is ready
            player.volume = 0.3;
            // If there's a poster image, set it
            if (image) {
                player.poster = image;
            }
            // Trigger resume dialog if applicable after HLS is ready
            checkResumePlayback();

            // Set up quality options for Plyr based on HLS levels
            const levels = hls.levels.map((level, index) => ({
                size: level.height,
                label: level.height + 'p',
                selected: index === hls.currentLevel, // Set initial selected quality
                value: index,
            }));
            // Add 'Auto' option
            levels.unshift({
                size: 0, // A special value for auto
                label: 'Auto',
                selected: true, // Auto is usually default
                value: 'auto',
            });
            player.quality = levels;

            // Listen for quality change from Plyr and update HLS
            player.on('qualitychange', (event) => {
                const newQuality = event.detail.quality;
                if (newQuality === 'auto') {
                    hls.currentLevel = -1; // -1 for auto
                } else {
                    hls.currentLevel = newQuality;
                }
            });
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch(data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error("Fatal network error encountered, trying to recover...", data);
                        hls.startLoad();
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error("Fatal media error encountered, trying to recover...", data);
                        hls.recoverMediaError();
                        break;
                    default:
                        // Cannot recover
                        hls.destroy();
                        console.error("Fatal HLS error, cannot recover:", data);
                        break;
                }
            }
        });
    } else if (!videoURL.endsWith(".m3u8") && videoURL) {
        // For MP4 or general videos, set src directly and then initialize Plyr
        videoElement.src = videoURL;
        player.volume = 0.3; // Set initial volume
        if (image) {
            player.poster = image; // Set poster
        }
        // Trigger resume dialog immediately for non-HLS videos
        checkResumePlayback();
    } else {
        console.error("Browser not supported for HLS or no video URL provided.");
    }

    const watchKey = "watch_" + videoURL;
    let watchData = null;
    try {
        watchData = JSON.parse(localStorage.getItem(watchKey) || "null");
    } catch (e) {
        console.error("Error parsing watch data from localStorage:", e);
    }

    // Function to check and show resume dialog
    function checkResumePlayback() {
        // Ensure player is ready before checking currentTime
        if (player.currentTime !== undefined && watchData?.currentTime > 20) {
            player.pause();
            const mins = Math.floor(watchData.currentTime / 60);
            const secs = String(Math.floor(watchData.currentTime % 60)).padStart(2, "0");
            document.getElementById("resume-message").textContent = `คุณเคยดู "${name}" ถึงนาทีที่ ${mins}:${secs} `;
            document.getElementById("resume-dialog").style.display = "block";

            document.getElementById("resume-yes").onclick = () => {
                document.getElementById("resume-dialog").style.display = "none";
                // Delay setting currentTime slightly to ensure player is fully ready
                setTimeout(() => {
                    player.currentTime = watchData.currentTime;
                    player.play();
                }, 50);
            };

            document.getElementById("resume-no").onclick = () => {
                document.getElementById("resume-dialog").style.display = "none";
                setTimeout(() => {
                    player.currentTime = 0;
                    player.play();
                }, 50);
            };
        }
    }

    // Plyr 'ready' event listener
    player.on("ready", () => {
        // For HLS, checkResumePlayback is called after MANIFEST_PARSED.
        // For non-HLS, it's called immediately after Plyr initialization.
        // This 'ready' event can also trigger it as a fallback or for other player states.
        if (!videoURL.endsWith(".m3u8")) { // Only call if not HLS, to avoid double-call
             checkResumePlayback();
        }
    });

    // Plyr 'timeupdate' event listener to save progress
    player.on("timeupdate", () => {
        const progress = {
            name,
            url: videoURL,
            image,
            currentTime: player.currentTime,
            duration: player.duration,
            lastWatched: Date.now()
        };
        localStorage.setItem(watchKey, JSON.stringify(progress));
    });

    // Function to update favorite button UI
    function updateFavUI() {
        const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
        const isFav = favs.some(m => m.url === videoURL);
        favBtn.textContent = isFav ? "💔 ลบรายการโปรด" : "❤️ เพิ่มรายการโปรด";
    }

    // Add event listener for favorite button
    favBtn.addEventListener("click", () => {
        let favs = JSON.parse(localStorage.getItem("favorites") || "[]");
        const index = favs.findIndex(m => m.url === videoURL);
        if (index >= 0) {
            favs.splice(index, 1);
        } else {
            favs.push({ name, url: videoURL, image });
        }
        localStorage.setItem("favorites", JSON.stringify(favs));
        updateFavUI();
    });

    // Event listener for Home button
    homeButton.addEventListener('click', () => {
        window.location.href = 'index.html'; // กลับไปหน้า index.html
    });

    // Initial update of favorite UI on page load
    updateFavUI();
});