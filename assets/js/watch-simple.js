// [TAG: ฟังก์ชันหลักสำหรับหน้าดูหนัง]
document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    
    // Debug: แสดง URL parameters ทั้งหมด
    console.log('🔍 URL Parameters:', window.location.search);
    console.log('📋 All params:', Object.fromEntries(params.entries()));
    
    // 1. ดึงข้อมูลจาก URL Parameters
    const videoUrl = params.get('video1') || params.get('video');
    const movieName = params.get('name') || 'ไม่ระบุชื่อเรื่อง';
    const movieInfo = params.get('description') || params.get('info') || 'ไม่มีข้อมูลเรื่องย่อสำหรับภาพยนตร์เรื่องนี้';
    const movieYear = params.get('year') || '2026';

    // Debug: แสดงค่าที่ดึงได้
    console.log('🎬 Video URL:', videoUrl);
    console.log('📝 Movie Name:', movieName);
    console.log('📅 Movie Year:', movieYear);
    console.log('📄 Movie Info:', movieInfo);

    // 2. แสดงข้อมูลบนหน้าจอ
    document.getElementById('movie-title').textContent = decodeURIComponent(movieName);
    document.getElementById('movie-description').textContent = decodeURIComponent(movieInfo);
    document.getElementById('movie-year').textContent = decodeURIComponent(movieYear);

    // 3. ตั้งค่า Video.js Player
    if (videoUrl) {
        console.log('✅ มี Video URL จะเริ่มเล่นวิดีโอ');
        const player = videojs('movie-player');
        
        // ตรวจสอบประเภทไฟล์
        let videoType = 'application/x-mpegURL'; // Default for .m3u8
        if (videoUrl.includes('.mp4')) {
            videoType = 'video/mp4';
        } else if (videoUrl.includes('.mpd')) {
            videoType = 'application/dash+xml';
        }
        
        console.log('🎥 Video Type:', videoType);
        
        player.src({
            src: decodeURIComponent(videoUrl),
            type: videoType
        });
        
        // เล่นอัตโนมัติ (บาง Browser อาจต้อง Muted ก่อน)
        player.play().catch(error => {
            console.log("Autoplay ถูกระงับ: ", error);
            // ถ้า autoplay ไม่ได้ ให้แสดงปุ่ม play
            player.muted(true);
            player.play().catch(e => {
                console.log("Muted autoplay ก็ไม่ได้:", e);
            });
        });
        
        // Event listeners
        player.on('error', function(e) {
            console.error('Video.js error:', e);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'bg-red-900/20 border border-red-600 rounded-lg p-6 text-center mt-4';
            errorDiv.innerHTML = `
                <h3 class="text-xl font-semibold text-white mb-2">ไม่สามารถโหลดวิดีโอได้</h3>
                <p class="text-gray-300 mb-4">กรุณาลองใหม่อีกครั้งหรือเลือกตอนอื่น</p>
                <button onclick="location.reload()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                    ลองใหม่
                </button>
            `;
            document.querySelector('.max-w-5xl').appendChild(errorDiv);
        });
        
        player.on('loadeddata', function() {
            console.log('วิดีโอโหลดสำเร็จ');
        });
        
    } else {
        console.log('❌ ไม่มี Video URL แสดงข้อความ error');
        // แสดงข้อความ error ถ้าไม่มี video URL
        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-yellow-900/20 border border-yellow-600 rounded-lg p-6 text-center mt-4';
        errorDiv.innerHTML = `
            <h3 class="text-xl font-semibold text-white mb-2">ไม่พบลิงก์วิดีโอ</h3>
            <p class="text-gray-300 mb-2">กรุณาเลือกหนังจากหน้าหลักก่อน</p>
            <p class="text-gray-400 text-sm mb-4">URL ต้องมีพารามิเตอร์: ?video1=URL&name=ชื่อหนัง</p>
            <a href="../index.html" class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                กลับหน้าหลัก
            </a>
        `;
        document.querySelector('.max-w-5xl').appendChild(errorDiv);
    }
});
