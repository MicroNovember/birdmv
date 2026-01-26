/**
 * ดึงค่าจาก Query Parameter
 * @param {string} param - ชื่อพารามิเตอร์ (เช่น 'video', 'name', 'subtitle')
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

let playerInstance = null;
let currentAudioTracks = [];
let currentSubtitleTracks = [];
let currentAudioIndex = 0;
let currentSubtitleIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Watch.js loaded successfully');
    
    // ตรวจสอบว่า JW Player โหลดเสร็จหรือยัง
    if (typeof jwplayer === 'undefined') {
        console.error('❌ JW Player library not loaded');
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = '❌ ไม่สามารถโหลด JW Player ได้ กรุณาลองใหม่ภายหลัง';
            errorMessage.classList.remove('hidden');
        }
        return;
    } else {
        console.log('✅ JW Player is available');
    }

    const videoUrl1 = getQueryParam('video1') || getQueryParam('video');
    const videoUrl2 = getQueryParam('video2');
    const subtitleUrl1 = getQueryParam('subtitle1');
    const subtitleUrl2 = getQueryParam('subtitle2');
    const movieName = getQueryParam('name');
    const movieDescription = getQueryParam('description');
    const moviePoster = getQueryParam('poster');
    const movieCategory = getQueryParam('category');
    const movieYear = getQueryParam('year');
    const movieInfo = getQueryParam('info');
    const movieDuration = getQueryParam('duration');
    const movieActors = getQueryParam('actors');
    const movieDirector = getQueryParam('director');
    const movieQuality = getQueryParam('quality');

    console.log('📹 Video Parameters:', {
        videoUrl1,
        videoUrl2,
        subtitleUrl1,
        subtitleUrl2,
        movieName,
        movieDescription
    });

    const titleElement = document.getElementById('movie-title');
    const errorMessage = document.getElementById('error-message');
    const videoSelection = document.getElementById('video-selection');
    const movieInfoCard = document.getElementById('movie-info');
    const movieDescriptionEl = document.getElementById('movie-description');

    if (titleElement) {
        titleElement.textContent = movieName || 'ไม่พบชื่อหนัง';
    }
    document.title = `ดูหนัง | ${movieName || 'ไม่พบชื่อหนัง'}`;

    // อัปเดตคำอธิบาย
    if (movieDescriptionEl) {
        if (movieDescription && movieDescription.trim() !== '') {
            movieDescriptionEl.textContent = movieDescription;
            console.log('Description found:', movieDescription);
        } else {
            movieDescriptionEl.textContent = 'ไม่มีเรื่องย่อ';
            console.log('No description found, movieDescription value:', movieDescription);
        }
    }

    // ตรวจสอบว่ามี video URL หรือไม่
    if (!videoUrl1) {
        console.error('❌ No video URL found');
         if (errorMessage) {
             errorMessage.textContent = '❌ ไม่พบ URL ไฟล์วิดีโอที่จำเป็น';
             errorMessage.classList.remove('hidden');
         }
         return;
    } else {
        console.log('✅ Video URL found:', videoUrl1);
    }

    // ตรวจสอบ Type ของไฟล์เพื่อกำหนด type ใน Config
    let fileType = 'hls'; // Default for .m3u8
    if (videoUrl1.endsWith('.mpd')) {
        fileType = 'dash';
    } else if (videoUrl1.endsWith('.mp4')) {
        fileType = 'mp4';
    }

    // เก็บข้อมูล audio/subtitle tracks
    currentAudioTracks = [
        { url: videoUrl1, label: '🇹🇭 เสียงไทย' },
        { url: videoUrl2, label: '🇬🇧 ซับไทย' }
    ].filter(track => track.url); // กรองเฉพาะ track ที่มี URL

    currentSubtitleTracks = [
        { url: subtitleUrl1, label: '🇹🇭 ซับไทย' },
        { url: subtitleUrl2, label: '🇬🇧 ซับอังกฤษ' }
    ].filter(track => track.url); // กรองเฉพาะ track ที่มี URL

    // แสดงปุ่มเลือกวิดีโอถ้ามี video2
    if (videoUrl2) {
        videoSelection.classList.remove('hidden');
    }

    // --- 1. เตรียม Config สำหรับ JW Player ---
    let playerConfig = {
        file: videoUrl1,
        type: fileType,
        autostart: false,  // เปลี่ยนเป็น false ไม่ให้เล่นอัตโนมัติ
        controls: true,
        stretching: "uniform", 
        width: "100%",
        height: "100%",
        
        // ปิดการตรวจสอบสิทธิ์และ entitlement
        advertising: {
            client: "vast"
        },
        
        // ปิดการเรียก entitlements server
        analytics: {
            disabled: true
        },
        
        // การตั้งค่าซับไตเติล
        captions: {
            position: 'bottom',
            backgroundOpacity: 0,
            color: '#FFFF00',
            fontSize: 16,
            fontOpacity: 100
        },
        
        tracks: [], // อาร์เรย์สำหรับ Subtitle Tracks
    };
    
    // --- 2. การเพิ่ม Subtitle Track ---
    if (subtitleUrl1 && subtitleUrl1.trim() !== '') {
        playerConfig.tracks.push({
            file: subtitleUrl1,
            label: 'ซับไทย',
            kind: 'captions',
            default: true
        });
    }
    
    // เพิ่ม subtitle2 ถ้ามี (ไม่ใช่ default)
    if (subtitleUrl2 && subtitleUrl2.trim() !== '' && subtitleUrl2 !== subtitleUrl1) {
        playerConfig.tracks.push({
            file: subtitleUrl2,
            label: 'ซับอังกฤษ',
            kind: 'captions',
            default: false
        });
        console.log(`✅ Subtitle2 URL ถูกเพิ่มใน Config: ${subtitleUrl2}`);
    }
    
    // --- 3. Initialise JW Player ---
    try {
        console.log('🚀 Setting up JW Player with config:', playerConfig);
        
        // ติดตั้ง Player ใน div id="jwplayerDiv"
        playerInstance = jwplayer("jwplayerDiv").setup(playerConfig);

        console.log('✅ JW Player setup initiated');

        // 4. Error Handling และ Event Listeners
        playerInstance.on('error', function(event) {
            const errorMsg = `❌ ข้อผิดพลาดในการเล่นวิดีโอ: ${event.message || 'ไม่ทราบสาเหตุ'}`;
            console.error('JW Player Error:', event);
            if (errorMessage) {
                errorMessage.textContent = errorMsg;
                errorMessage.classList.remove('hidden');
            }
            
            // Fallback: แสดง direct video link ถ้า player ล้มเหลว
            showFallbackPlayer(videoUrl1, movieName);
        });
        
        playerInstance.on('setupError', function(event) {
            const errorMsg = `❌ ข้อผิดพลาดในการตั้งค่า Player: ${event.message || 'ไม่ทราบสาเหตุ'}`;
            console.error('JW Player Setup Error:', event);
            if (errorMessage) {
                errorMessage.textContent = errorMsg;
                errorMessage.classList.remove('hidden');
            }
            
            // Fallback: แสดง direct video link ถ้า setup ล้มเหลว
            showFallbackPlayer(videoUrl1, movieName);
        });
        
        playerInstance.on('ready', function() {
            console.log("✅ JW Player Ready Successfully.");
            if (errorMessage) {
                errorMessage.classList.add('hidden');
            }
            
            // ไม่เพิ่มปุ่มใน JW Player control bar - ใช้ปุ่มภายนอก
            console.log("✅ Using external audio selection buttons only.");
        });

        console.log("✅ JW Player Setup Complete.");

    } catch (e) {
        console.error("❌ JW Player Setup Error:", e);
        if (errorMessage) {
            errorMessage.textContent = '❌ ข้อผิดพลาดร้ายแรงในการสร้าง Player';
            errorMessage.classList.remove('hidden');
        }
        
        // Fallback: แสดง direct video link
        showFallbackPlayer(videoUrl1, movieName);
    }
    
    // Fallback Player Function
    function showFallbackPlayer(videoUrl, movieTitle) {
        const playerDiv = document.getElementById('jwplayerDiv');
        playerDiv.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-4">
                <h3 class="text-white text-lg mb-4">🎬 ${movieTitle}</h3>
                <video 
                    controls 
                    autoplay 
                    class="w-full rounded-lg"
                    style="max-height: 480px;">
                    <source src="${videoUrl}" type="application/x-mpegURL">
                    <source src="${videoUrl}" type="video/mp4">
                    บราวเซอร์ของคุณไม่รองรับ HLS หรือ MP4 นี้
                </video>
                <div class="mt-4">
                    <a href="${videoUrl}" 
                       target="_blank" 
                       class="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                        📱 เปิดในแอปพลิเคชันอื่น
                    </a>
                </div>
            </div>
        `;
        errorMessage.classList.add('hidden');
    }
});

    
    
// Function สำหรับเลือกและเล่นวิดีโอ
function playVideo(videoNumber) {
    const videoUrl1 = getQueryParam('video1') || getQueryParam('video');
    const videoUrl2 = getQueryParam('video2');
    const videoUrl = videoNumber === 1 ? videoUrl1 : videoUrl2;
    const subtitleUrl1 = getQueryParam('subtitle1');
    const subtitleUrl2 = getQueryParam('subtitle2');
    const fileType = videoUrl.endsWith('.mpd') ? 'dash' : 
                    videoUrl.endsWith('.mp4') ? 'mp4' : 'hls';
    
    // อัปเดตสถานะปุ่มภายนอก
    const video1Btn = document.getElementById('video1-btn');
    const video2Btn = document.getElementById('video2-btn');
    
    if (video1Btn && video2Btn) {
        if (videoNumber === 1) {
            video1Btn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2';
            video2Btn.className = 'px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 flex items-center gap-2';
        } else {
            video1Btn.className = 'px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 flex items-center gap-2';
            video2Btn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center gap-2';
        }
    }
    
    // เตรียม config ใหม่พร้อมทุก subtitle
    let newConfig = {
        file: videoUrl,
        type: fileType,
        autostart: true,  // เล่นทันทีเมื่อเลือก
        controls: true,
        stretching: "uniform", 
        width: "100%",
        height: "100%",
        
        advertising: {
            client: "vast"
        },
        
        captions: {
            position: 'bottom',
            backgroundOpacity: 0,
            color: '#FFFF00',
            fontSize: 16,
            fontOpacity: 100
        },
        
        tracks: []
    };
    
    // เพิ่ม subtitle1 (default)
    if (subtitleUrl1 && subtitleUrl1.trim() !== '' && subtitleUrl1 !== 'undefined' && subtitleUrl1 !== 'null') {
        newConfig.tracks.push({
            file: subtitleUrl1,
            label: 'ซับไทย',
            kind: 'captions',
            default: true
        });
        console.log(`✅ เพิ่มซับไทย: ${subtitleUrl1}`);
    }
    
    // เพิ่ม subtitle2 (ถ้ามีและไม่ซ้ำ)
    if (subtitleUrl2 && subtitleUrl2.trim() !== '' && subtitleUrl2 !== 'undefined' && subtitleUrl2 !== 'null' && 
        subtitleUrl2 !== subtitleUrl1) {
        newConfig.tracks.push({
            file: subtitleUrl2,
            label: 'ซับอังกฤษ',
            kind: 'captions'
        });
        console.log(`✅ เพิ่มซับอังกฤษ: ${subtitleUrl2}`);
    }
    
    // โหลดวิดีโอใหม่
    playerInstance.setup(newConfig);
    
    const audioType = videoNumber === 1 ? 'พากย์ไทย' : 'ซับไทย';
    console.log(`🎬 เริ่มเล่น${audioType}: ${videoUrl}`);
}
