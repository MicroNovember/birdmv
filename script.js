const M3U_URL = 'https://3ird.samorn-team.workers.dev/playlist.m3u';
const CACHE_KEY = 'netflix_playlist_data';
const CACHE_TIME = 6 * 60 * 60 * 1000; // 6 ชั่วโมง

let allData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 48;
let videoPlayer = null;

document.addEventListener('DOMContentLoaded', () => {
    initPlayer();
    loadPlaylist();
    setupEvents();
});

function initPlayer() {
    videoPlayer = videojs('video-player', {
        fluid: true,
        autoplay: false,
        controls: true,
        responsive: true
    });
}

function setupEvents() {
    // ระบบ Navbar เปลี่ยนสีเมื่อเลื่อน
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (window.scrollY > 50) nav.classList.add('nav-scrolled');
        else nav.classList.remove('nav-scrolled');
    });

    // ระบบ Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filteredData = allData.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.group.toLowerCase().includes(query)
        );
        currentPage = 1;
        renderGrid();
    });
}

async function loadPlaylist() {
    const cached = localStorage.getItem(CACHE_KEY);
    const now = new Date().getTime();
    const statusEl = document.getElementById('cache-status');

    if (cached) {
        const cache = JSON.parse(cached);
        if (now - cache.timestamp < CACHE_TIME) {
            console.log('⚡ Loaded from Cache');
            allData = cache.data;
            statusEl.innerText = "Loaded from cache (Auto-refresh in " + Math.round((CACHE_TIME - (now - cache.timestamp)) / 60000) + " mins)";
            finishLoading();
            return;
        }
    }

    // Fetch New Data
    statusEl.innerText = "Updating playlist from server...";
    try {
        const res = await fetch(M3U_URL);
        const text = await res.text();
        allData = parseM3U(text);
        
        // Save to Cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: now,
            data: allData
        }));
        
        finishLoading();
    } catch (err) {
        console.error("Fetch failed", err);
        if(cached) allData = JSON.parse(cached).data;
        finishLoading();
    }
}

function parseM3U(data) {
    const lines = data.split('\n');
    const items = [];
    let current = {};
    
    lines.forEach(line => {
        if (line.startsWith('#EXTINF:')) {
            current.title = line.split(',')[1]?.trim() || 'Unknown';
            current.logo = (line.match(/tvg-logo="(.*?)"/) || [])[1] || '';
            current.group = (line.match(/group-title="(.*?)"/) || [])[1] || 'ทั่วไป';
        } else if (line.startsWith('http')) {
            current.url = line.trim();
            items.push({ ...current });
            current = {};
        }
    });
    return items;
}

function finishLoading() {
    filteredData = [...allData];
    renderGrid();
    renderCategories();
}

function renderGrid() {
    const grid = document.getElementById('movie-grid');
    const start = (currentPage - 1) * itemsPerPage;
    const pageData = filteredData.slice(start, start + itemsPerPage);

    grid.innerHTML = pageData.map(item => `
        <div onclick="openPlayer('${item.url}', '${item.title.replace(/'/g, "\\'")}')" class="movie-card group cursor-pointer">
            <div class="relative aspect-video rounded-md overflow-hidden bg-gray-800 shadow-xl">
                <img src="${item.logo}" class="w-full h-full object-cover" loading="lazy" onerror="this.src='https://via.placeholder.com/300x169/141414/666666?text=No+Preview'">
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <i class="fas fa-play text-white text-3xl"></i>
                </div>
            </div>
            <h4 class="mt-3 text-sm font-medium text-gray-300 truncate group-hover:text-white">${item.title}</h4>
            <span class="text-[10px] text-gray-500 uppercase font-bold">${item.group}</span>
        </div>
    `).join('');

    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const nav = document.getElementById('pagination');
    nav.innerHTML = '';

    if (totalPages <= 1) return;

    let pages = [1, currentPage - 1, currentPage, currentPage + 1, totalPages];
    pages = [...new Set(pages.filter(p => p > 0 && p <= totalPages))].sort((a,b) => a-b);

    pages.forEach(p => {
        const btn = document.createElement('button');
        btn.innerText = p;
        btn.className = `page-btn ${p === currentPage ? 'active' : ''}`;
        btn.onclick = () => { currentPage = p; renderGrid(); window.scrollTo({top: 0, behavior: 'smooth'}); };
        nav.appendChild(btn);
    });
}

function renderCategories() {
    const groups = ['ทั้งหมด', ...new Set(allData.map(i => i.group))];
    const bar = document.getElementById('category-bar');
    bar.innerHTML = groups.map(g => `
        <span onclick="filterGroup('${g}')" class="cursor-pointer hover:text-white transition-colors uppercase whitespace-nowrap">${g}</span>
    `).join('');
}

function filterGroup(g) {
    filteredData = g === 'ทั้งหมด' ? [...allData] : allData.filter(i => i.group === g);
    currentPage = 1;
    document.getElementById('section-title').innerText = g;
    renderGrid();
}

function openPlayer(url, title) {
    document.getElementById('player-page').classList.remove('hidden');
    document.getElementById('playing-title').innerText = title;
    document.body.style.overflow = 'hidden';

    const type = url.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4';
    
    // Try multiple proxy sources
    const proxyAttempts = [
        url, // Direct URL first
        'http://localhost:8001/' + url, // Local proxy
        'https://corsproxy.io/?' + encodeURIComponent(url),
        'https://api.allorigins.win/raw?url=' + encodeURIComponent(url),
        'https://thingproxy.freeboard.io/fetch/' + encodeURIComponent(url)
    ];
    
    let attemptIndex = 0;
    
    function tryNextProxy() {
        if (attemptIndex >= proxyAttempts.length) {
            alert('Video cannot be loaded from any source. The video server may be down or blocking access.');
            return;
        }
        
        const currentUrl = proxyAttempts[attemptIndex];
        console.log(`Trying source ${attemptIndex + 1}:`, currentUrl);
        
        videoPlayer.ready(() => {
            videoPlayer.src({ type, src: currentUrl });
            videoPlayer.play().catch(err => {
                console.warn(`Source ${attemptIndex + 1} failed:`, err);
                attemptIndex++;
                setTimeout(tryNextProxy, 500); // Small delay before next attempt
            });
        });
        
        // Set timeout to try next proxy if no error but also no success
        setTimeout(() => {
            if (!videoPlayer.paused() || videoPlayer.readyState() > 0) {
                console.log(`Source ${attemptIndex + 1} succeeded!`);
            } else {
                attemptIndex++;
                tryNextProxy();
            }
        }, 3000);
    }
    
    tryNextProxy();
}

function closePlayer() {
    videoPlayer.pause();
    document.getElementById('player-page').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function refreshPlaylist() {
    const icon = document.getElementById('refresh-icon');
    icon.classList.add('fa-spin');
    localStorage.removeItem(CACHE_KEY);
    location.reload();
}

function resetView() {
    location.reload();
}