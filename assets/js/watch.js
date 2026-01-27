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

// Fallback Player Function
function showFallbackPlayer(videoUrl, movieTitle) {
    const playerDiv = document.getElementById('video-player');
    if (playerDiv) {
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
    }
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

// 404 Error Handler Function
function showVideoNotFoundError(videoUrl, movieTitle) {
    const playerDiv = document.getElementById('video-player');
    if (playerDiv) {
        playerDiv.innerHTML = `
            <div class="bg-red-900/20 border border-blue-600 rounded-lg p-6 text-center">
                <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <h3 class="text-xl font-semibold text-white mb-2">ไม่พบไฟล์วิดีโอ</h3>
                <p class="text-gray-300 mb-4">วิดีโอ "${movieTitle}" ไม่สามารถเข้าถึงได้ในขณะนี้</p>
                <div class="bg-gray-800 rounded p-3 mb-4">
                    <p class="text-xs text-gray-400 break-all">${videoUrl}</p>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                        🔄 ลองใหม่
                    </button>
                    <a href="../index.html" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition inline-block">
                        🏠 กลับหน้าหลัก
                    </a>
                </div>
            </div>
        `;
    }
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Watch.js loaded successfully (Video.js version)');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 Search params:', window.location.search);
    
    // ตรวจสอบว่า Video.js โหลดเสร็จหรือยัง
    if (typeof videojs === 'undefined') {
        console.error('❌ Video.js library not loaded');
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = '❌ ไม่สามารถโหลด Video Player ได้ กรุณาลองใหม่ภายหลัง';
            errorMessage.classList.remove('hidden');
        }
        return;
    } else {
        console.log('✅ Video.js is available');
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
        movieDescription,
        movieYear,
        movieCategory
    });
    
    // ตรวจสอบพารามิเตอร์ที่จำเป็น
    if (!videoUrl1) {
        console.error('❌ Missing video URL parameter');
        console.log('🔍 Full URL:', window.location.href);
        console.log('🔍 All params:', window.location.search);
    }

    const titleElement = document.getElementById('movie-title');
    const yearElement = document.getElementById('movie-year');
    const categoryElement = document.getElementById('movie-category');
    const descriptionElement = document.getElementById('movie-description');
    const errorMessage = document.getElementById('error-message');

    // อัปเดตข้อมูลหนังใน Simple Info Section
    if (titleElement) {
        titleElement.textContent = movieName || 'ไม่พบชื่อหนัง';
    }
    document.title = `ดูหนัง | ${movieName || 'ไม่พบชื่อหนัง'}`;

    // อัปเดตปี
    if (yearElement) {
        yearElement.textContent = movieYear || '-';
    }

    // อัปเดตหมวดหมู่
    if (categoryElement) {
        categoryElement.textContent = movieCategory || 'หมวดหมู่';
    }

    // อัปเดตเรื่องย่อ
    if (descriptionElement) {
        if (movieDescription && movieDescription.trim() !== '') {
            descriptionElement.textContent = movieDescription;
            console.log('Description found:', movieDescription);
        } else {
            descriptionElement.textContent = 'ไม่มีข้อมูลเรื่องย่อสำหรับภาพยนตร์เรื่องนี้';
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

    // --- 1. เตรียม Config สำหรับ Video.js ---
    let playerConfig = {
        controls: true,
        responsive: true,
        fluid: true,
        autoplay: false,
        preload: 'auto',
        poster: moviePoster || '',
        
        // HLS.js config
        html5: {
            hlsjsConfig: {
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                maxBufferSize: 60 * 1000 * 1000,
                maxBufferHole: 0.5
            }
        }
    };
    
    // Debug ประเภทไฟล์
    console.log('🎬 Video file type:', fileType);
    console.log('🎬 Video URL extension:', videoUrl1.split('.').pop());
    
    // ตรวจสอบว่าเป็น video+audio stream หรือไม่
    if (videoUrl1.includes('playlist.m3u8') || videoUrl1.includes('master.m3u8')) {
        console.log('🎬 Detected HLS stream with video+audio');
    }
    
    // --- 3. Initialise Video.js Player ---
    try {
        console.log('🚀 Setting up Video.js with config:', playerConfig);
        
        // ตรวจสอบว่า element มีอยู่จริงหรือไม่
        const videoElement = document.getElementById('video-player');
        if (!videoElement) {
            console.error('❌ Video element #video-player not found in DOM');
            if (errorMessage) {
                errorMessage.textContent = '❌ ไม่พบ Video Player element กรุณารีเฟรชหน้าเว็บ';
                errorMessage.classList.remove('hidden');
            }
            return;
        }
        
        console.log('✅ Video element found:', videoElement);
        
        // ตรวจสอบว่ามี player อยู่แล้วหรือไม่
        const existingPlayer = videojs.getPlayer('video-player');
        if (existingPlayer) {
            console.log('🔄 Disposing existing player');
            existingPlayer.dispose();
        }
        
        // รอสักครู่ให้ DOM พร้อม
        setTimeout(() => {
            try {
                // สร้าง Video.js player
                playerInstance = videojs('video-player', playerConfig);
                console.log('✅ Video.js player created successfully');
                
                // รอให้ player ready แล้วค่อยตั้งค่า source
                playerInstance.ready(() => {
                    console.log('✅ Video.js player is ready');
                    
                    // กำหนด source โดยตรวจสอบ HLS support
                    if (videoUrl1.endsWith('.m3u8')) {
                        // ตรวจสอบว่า browser รองรับ HLS แบบ native หรือไม่
                        try {
                            const videoTag = document.querySelector('#video-player_html5_api');
                            if (videoTag && videoTag.canPlayType && videoTag.canPlayType('application/vnd.apple.mpegurl')) {
                                // Native HLS support (Safari, iOS)
                                playerInstance.src({
                                    src: videoUrl1,
                                    type: 'application/vnd.apple.mpegurl'
                                });
                                console.log('🎬 Using native HLS support');
                            } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
                                // ใช้ HLS.js สำหรับ browser อื่นๆ
                                const hls = new Hls({
                                    enableWorker: true,
                                    lowLatencyMode: false,
                                    backBufferLength: 90,
                                    maxBufferLength: 30,
                                    maxMaxBufferLength: 600,
                                    maxBufferSize: 60 * 1000 * 1000,
                                    maxBufferHole: 0.5
                                });
                                hls.loadSource(videoUrl1);
                                hls.attachMedia(videoTag);
                                console.log('🎬 Using HLS.js for HLS support');
                            } else {
                                // Fallback
                                playerInstance.src({
                                    src: videoUrl1,
                                    type: 'application/x-mpegURL'
                                });
                                console.log('🎬 Using fallback HLS support');
                            }
                        } catch (techError) {
                            console.warn('⚠️ Tech detection failed, using fallback:', techError);
                            playerInstance.src({
                                src: videoUrl1,
                                type: 'application/x-mpegURL'
                            });
                        }
                    } else if (videoUrl1.endsWith('.mp4')) {
                        // MP4
                        playerInstance.src({
                            src: videoUrl1,
                            type: 'video/mp4'
                        });
                    } else {
                        // Auto detect
                        playerInstance.src(videoUrl1);
                    }
                    
                    console.log('✅ Video source set successfully');
                    
                    // 4. Error Handling และ Event Listeners - ตั้งค่าหลังจาก player ready
                    playerInstance.on('error', function(event) {
                        const errorMsg = `❌ ข้อผิดพลาดในการเล่นวิดีโอ: ${event.message || 'ไม่ทราบสาเหตุ'}`;
                        console.error('Video.js Error:', event);
                        
                        // ตรวจสอบว่าเป็น 404 หรือไม่
                        if (event.code === 4 || event.message?.includes('404') || event.message?.includes('Not Found')) {
                            showVideoNotFoundError(videoUrl1, movieName);
                        } else {
                            if (errorMessage) {
                                errorMessage.textContent = errorMsg;
                                errorMessage.classList.remove('hidden');
                            }
                            
                            // Fallback: แสดง direct video link ถ้า player ล้มเหลว
                            showFallbackPlayer(videoUrl1, movieName);
                        }
                    });
                    
                    playerInstance.on('loadeddata', function() {
                        console.log("✅ Video.js Ready Successfully.");
                        if (errorMessage) {
                            errorMessage.classList.add('hidden');
                        }
                        
                        // ซ่อน loading state
                        const loadingElement = document.getElementById('player-loading');
                        if (loadingElement) {
                            loadingElement.classList.add('hidden');
                        }
                    });
                    
                    console.log("✅ Video.js Setup Complete.");
                });
                
                console.log('✅ Video.js setup initiated');
                
            } catch (playerError) {
                console.error('❌ Error creating Video.js player:', playerError);
                if (errorMessage) {
                    errorMessage.textContent = '❌ ไม่สามารถสร้าง Video Player ได้';
                    errorMessage.classList.remove('hidden');
                }
                
                // Fallback: แสดง direct video link
                showFallbackPlayer(videoUrl1, movieName);
            }
        }, 100); // รอ 100ms ให้ DOM พร้อม

    } catch (e) {
        console.error("❌ Video.js Setup Error:", e);
        if (errorMessage) {
            errorMessage.textContent = '❌ ข้อผิดพลาดร้ายแรงในการสร้าง Player';
            errorMessage.classList.remove('hidden');
        }
        
        // Fallback: แสดง direct video link
        showFallbackPlayer(videoUrl1, movieName);
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
        autostart: true,
        controls: true,
        stretching: "uniform", 
        width: "100%",
        height: "100%",
        
        captions: {
            position: 'bottom',
            backgroundOpacity: 0,
            color: '#FFFF00',
            fontSize: 16,
            fontOpacity: 100
        },
        
        tracks: []
    };
    
    // เพิ่มการตั้งค่าพิเศษสำหรับ HLS
    if (fileType === 'hls') {
        newConfig.hlsjsConfig = {
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5
        };
        console.log('🎬 Applied HLS config for video+audio stream (playVideo)');
    }
    
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
