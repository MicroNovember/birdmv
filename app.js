let videos = [];
let currentPage = 1;
const videosPerPage = 24;

// Playlist URL configuration
const UPDATE_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const STORAGE_KEY_PREFIX = 'playlist_data_';
const LAST_UPDATE_KEY_PREFIX = 'playlist_last_update_';

document.getElementById('m3uFile').addEventListener('change', handleFileUpload);
document.getElementById('loadUrlBtn').addEventListener('click', handleUrlLoad);

// Playlist management
document.getElementById('addPlaylistBtn').addEventListener('click', openAddPlaylistModal);
document.getElementById('closeModalBtn').addEventListener('click', closeAddPlaylistModal);
document.getElementById('cancelPlaylistBtn').addEventListener('click', closeAddPlaylistModal);
document.getElementById('savePlaylistBtn').addEventListener('click', saveNewPlaylist);
document.getElementById('playlistSelect').addEventListener('change', handlePlaylistChange);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializePlaylistSelector();
    checkAndLoadPlaylist();
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            parseM3U(e.target.result);
        };
        reader.readAsText(file);
    }
}

function handleUrlLoad() {
    const urlInput = document.getElementById('playlistUrl');
    const url = urlInput.value.trim();
    if (url) {
        loadPlaylistFromUrl(url);
    } else {
        alert('กรุณาใส่ URL ของ Playlist');
    }
}

// Playlist management functions
function initializePlaylistSelector() {
    const select = document.getElementById('playlistSelect');
    select.innerHTML = '';
    
    const playlists = playlistManager.getAllPlaylists();
    playlists.forEach(playlist => {
        const option = document.createElement('option');
        option.value = playlist.id;
        option.textContent = playlist.name;
        if (playlist.id === playlistManager.currentPlaylistId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function openAddPlaylistModal() {
    document.getElementById('addPlaylistModal').style.display = 'flex';
    document.getElementById('playlistName').value = '';
    document.getElementById('playlistUrlInput').value = '';
}

function closeAddPlaylistModal() {
    document.getElementById('addPlaylistModal').style.display = 'none';
}

function saveNewPlaylist() {
    const name = document.getElementById('playlistName').value.trim();
    const url = document.getElementById('playlistUrlInput').value.trim();
    
    if (!name || !url) {
        alert('กรุณากรอกชื่อและ URL ของ Playlist');
        return;
    }
    
    try {
        const newPlaylist = playlistManager.addPlaylist(name, url);
        initializePlaylistSelector();
        document.getElementById('playlistSelect').value = newPlaylist.id;
        handlePlaylistChange();
        closeAddPlaylistModal();
        alert('เพิ่ม Playlist สำเร็จ');
    } catch (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    }
}

function handlePlaylistChange() {
    const select = document.getElementById('playlistSelect');
    const selectedId = select.value;
    
    if (selectedId) {
        playlistManager.selectPlaylist(selectedId);
        checkAndLoadPlaylist();
    }
}

async function loadPlaylistFromUrl(url) {
    showLoading(true);
    try {
        // Use CORS proxy for Google Drive URLs
        let fetchUrl = url;
        if (url.includes('drive.google.com')) {
            fetchUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        }

        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error('ไม่สามารถโหลด Playlist ได้');
        }
        const content = await response.text();
        
        // Save to local storage with playlist-specific key
        const currentPlaylist = playlistManager.getCurrentPlaylist();
        const storageKey = STORAGE_KEY_PREFIX + currentPlaylist.id;
        const lastUpdateKey = LAST_UPDATE_KEY_PREFIX + currentPlaylist.id;
        
        localStorage.setItem(storageKey, content);
        localStorage.setItem(lastUpdateKey, Date.now().toString());
        
        // Update playlist timestamp
        playlistManager.updatePlaylistTimestamp(currentPlaylist.id);
        
        parseM3U(content);
    } catch (error) {
        console.error('Error loading playlist:', error);
        if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
            alert('ไม่สามารถโหลด Playlist จาก URL นี้ได้เนื่องจาก CORS policy\n\nกรุณา:\n1. ใช้ไฟล์ .m3u จากเครื่องแทน\n2. หรือใช้ URL จาก server ที่รองรับ CORS\n3. หรืออัพโหลดไฟล์ไปยัง GitHub Pages หรือ hosting อื่นที่รองรับ');
        } else {
            alert('เกิดข้อผิดพลาดในการโหลด Playlist: ' + error.message);
        }
    } finally {
        showLoading(false);
    }
}

function checkAndLoadPlaylist() {
    const currentPlaylist = playlistManager.getCurrentPlaylist();
    if (!currentPlaylist) return;
    
    const storageKey = STORAGE_KEY_PREFIX + currentPlaylist.id;
    const lastUpdateKey = LAST_UPDATE_KEY_PREFIX + currentPlaylist.id;
    
    const lastUpdate = localStorage.getItem(lastUpdateKey);
    const now = Date.now();
    
    // Check if we need to update (first time or 3 hours passed)
    if (!lastUpdate || (now - parseInt(lastUpdate)) > UPDATE_INTERVAL) {
        // Load from URL
        loadPlaylistFromUrl(currentPlaylist.url);
    } else {
        // Load from local storage
        const cachedData = localStorage.getItem(storageKey);
        if (cachedData) {
            parseM3U(cachedData);
        } else {
            // No cached data, load from URL
            loadPlaylistFromUrl(currentPlaylist.url);
        }
    }
}

function showLoading(show) {
    const indicator = document.getElementById('loadingIndicator');
    indicator.style.display = show ? 'block' : 'none';
}

function parseM3U(content) {
    videos = [];
    const lines = content.split('\n');
    let currentVideo = {};

    for (let line of lines) {
        line = line.trim();
        
        if (line.startsWith('#EXTINF:')) {
            // Parse title and logo
            const titleMatch = line.match(/,(.+)$/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            
            currentVideo = {
                title: titleMatch ? titleMatch[1].trim() : 'Unknown',
                logo: logoMatch ? logoMatch[1] : '',
                url: ''
            };
        } else if (line.startsWith('#EXTIMG:')) {
            // Alternative logo format
            currentVideo.logo = line.replace('#EXTIMG:', '').trim();
        } else if (line && !line.startsWith('#')) {
            // Video URL
            currentVideo.url = line;
            if (currentVideo.url) {
                videos.push({...currentVideo});
            }
            currentVideo = {};
        }
    }

    currentPage = 1;
    displayVideos();
    updateStats();
}

function displayVideos() {
    const grid = document.getElementById('videoGrid');
    grid.innerHTML = '';

    const startIndex = (currentPage - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    const pageVideos = videos.slice(startIndex, endIndex);

    if (pageVideos.length === 0) {
        grid.innerHTML = '<div class="no-videos">ไม่พบวิดีโอ</div>';
        return;
    }

    pageVideos.forEach((video, index) => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.onclick = () => openPlayer(video, card);

        const thumbnail = video.logo || 'https://via.placeholder.com/300x200?text=No+Thumbnail';
        
        card.innerHTML = `
            <img src="${thumbnail}" alt="${video.title}" class="video-thumbnail" onerror="this.src='https://via.placeholder.com/300x200?text=No+Thumbnail'">
            <div class="video-info">
                <div class="video-title">${video.title}</div>
            </div>
        `;

        grid.appendChild(card);
    });

    displayPagination();
}

function displayPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(videos.length / videosPerPage);

    if (totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← ก่อนหน้า';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayVideos();
        }
    };
    pagination.appendChild(prevBtn);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => {
            currentPage = i;
            displayVideos();
        };
        pagination.appendChild(btn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'ถัดไป →';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayVideos();
        }
    };
    pagination.appendChild(nextBtn);
}

function updateStats() {
    const stats = document.getElementById('stats');
    stats.textContent = `ทั้งหมด ${videos.length} เรื่อง | หน้า ${currentPage} จาก ${Math.ceil(videos.length / videosPerPage)}`;
}

function openPlayer(video, cardElement) {
    // Update playing state
    document.querySelectorAll('.video-card').forEach(c => c.classList.remove('playing'));
    cardElement.classList.add('playing');

    // Store video data in localStorage
    const videoData = {
        title: video.title,
        url: video.url,
        logo: video.logo
    };
    localStorage.setItem('currentVideo', JSON.stringify(videoData));

    // Open player page
    window.open('player.html', '_blank');
}
