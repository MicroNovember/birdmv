// MovieStream Main JavaScript

// Global state
let currentTab = 'series';
let content = [];
let continueWatching = JSON.parse(localStorage.getItem('continueWatching') || '[]');
let watchlist = JSON.parse(localStorage.getItem('watchlist') || '[]');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    loadContentData();
    initializeSearch();
    initializeTheme();
});

// Tab functionality
function initializeTabs() {
    const tabs = ['movies', 'series', 'continue', 'watchlist'];
    
    tabs.forEach(tab => {
        const tabButton = document.getElementById(`${tab}Tab`);
        const section = document.getElementById(`${tab}Section`);
        
        tabButton.addEventListener('click', () => {
            switchTab(tab);
        });
    });
    
    // Set initial active tab to series
    switchTab('series');
}

function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${tab}Tab`).classList.add('active');
    
    // Update sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(`${tab}Section`).classList.remove('hidden');
    
    currentTab = tab;
    loadContent();
}

// Load content from JSON file
async function loadContentData() {
    try {
        const response = await fetch('data/content.json');
        const data = await response.json();
        content = data.content;
        
        // Load content based on current tab
        loadContent();
        
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// Load content based on current tab
function loadContent() {
    switch(currentTab) {
        case 'movies':
            loadMovies();
            break;
        case 'series':
            loadSeries();
            break;
        case 'continue':
            loadContinueWatching();
            break;
        case 'watchlist':
            loadWatchlist();
            break;
    }
}

// Load movies
function loadMovies() {
    const moviesGrid = document.getElementById('moviesGrid');
    const movies = content.filter(item => item.type === 'movie');
    
    if (movies.length === 0) {
        moviesGrid.innerHTML = `
            <div class="col-span-full text-center py-16">
                <div class="loading-spinner w-12 h-12 mx-auto mb-4"></div>
                <p class="text-gray-400 text-lg">กำลังโหลดหนัง...</p>
            </div>
        `;
        return;
    }
    
    moviesGrid.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
}

// Load series
function loadSeries() {
    const seriesGrid = document.getElementById('seriesGrid');
    const series = content.filter(item => item.type === 'series');
    
    if (series.length === 0) {
        seriesGrid.innerHTML = `
            <div class="col-span-full text-center py-16">
                <p class="text-gray-400 text-lg">ยังไม่มีซีรีส์</p>
                <p class="text-gray-500 mt-2">เพิ่มซีรีส์ในข้อมูลเพื่อแสดงที่นี่</p>
            </div>
        `;
        return;
    }
    
    seriesGrid.innerHTML = series.map(item => createSeriesCard(item)).join('');
}

// Load continue watching
function loadContinueWatching() {
    const continueGrid = document.getElementById('continueGrid');
    
    if (continueWatching.length === 0) {
        continueGrid.innerHTML = `
            <div class="col-span-full text-center py-16">
                <p class="text-gray-400 text-lg">ยังไม่มีรายการที่ดูอยู่</p>
                <p class="text-gray-500 mt-2">เริ่มดูหนังหรือซีรีส์เพื่อเพิ่มในรายการนี้</p>
            </div>
        `;
        return;
    }
    
    continueGrid.innerHTML = continueWatching.map(item => createContinueCard(item)).join('');
}

// Load watchlist
function loadWatchlist() {
    const watchlistGrid = document.getElementById('watchlistGrid');
    
    if (watchlist.length === 0) {
        watchlistGrid.innerHTML = `
            <div class="col-span-full text-center py-16">
                <p class="text-gray-400 text-lg">ยังไม่มีรายการโปรด</p>
                <p class="text-gray-500 mt-2">กดไอค่อนหัวใจบนหนังหรือซีรีส์เพื่อเพิ่มในรายการโปรด</p>
            </div>
        `;
        return;
    }
    
    watchlistGrid.innerHTML = watchlist.map(item => createWatchlistCard(item)).join('');
}

// Create movie card
function createMovieCard(movie) {
    return `
        <div class="content-card cursor-pointer" onclick="playMovie('${movie.id}')">
            <div class="relative aspect-[2/3] overflow-hidden">
                <img src="${movie.poster}" alt="${movie.titleTh}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/300x450/374151/ffffff?text=No+Image'">
                <div class="card-overlay flex items-end p-4">
                    <div class="text-white">
                        <h3 class="font-semibold text-lg">${movie.titleTh}</h3>
                        <p class="text-sm opacity-90">${movie.year} • ${movie.rating} ⭐</p>
                        <div class="flex flex-wrap gap-1 mt-2">
                            ${movie.genreTh.map(g => `<span class="text-xs bg-purple-600/80 px-2 py-1 rounded">${g}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Create series card
function createSeriesCard(series) {
    const totalEpisodes = series.seasons.reduce((total, season) => total + season.episodes.length, 0);
    const genres = series.genreTh || ['ระทึกขวัญ', 'ดราม่า'];
    const rating = series.rating || '7.0';
    
    return `
        <div class="content-card cursor-pointer" onclick="showSeriesDetail('${series.id}')">
            <div class="relative aspect-[2/3] overflow-hidden">
                <img src="${series.poster}" alt="${series.titleTh}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/300x450/374151/ffffff?text=No+Image'">
                <div class="card-overlay flex items-end p-4">
                    <div class="text-white">
                        <h3 class="font-semibold text-lg">${series.titleTh}</h3>
                        <p class="text-sm opacity-90">${series.year} • ${rating} ⭐</p>
                        <p class="text-xs opacity-80 mt-1">${series.seasons.length} ฤดูกาล • ${totalEpisodes} ตอน</p>
                        <div class="flex flex-wrap gap-1 mt-2">
                            ${genres.map(g => `<span class="text-xs bg-purple-600/80 px-2 py-1 rounded">${g}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="absolute top-2 right-2">
                    <span class="badge-new">ซีรีส์</span>
                </div>
            </div>
        </div>
    `;
}

// Create continue watching card
function createContinueCard(item) {
    const progress = item.progress || 0;
    return `
        <div class="content-card cursor-pointer" onclick="resumeWatching('${item.id}', '${item.type}')">
            <div class="relative aspect-[2/3] overflow-hidden">
                <img src="${item.poster}" alt="${item.titleTh}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/300x450/374151/ffffff?text=No+Image'">
                <div class="card-overlay flex items-end p-4">
                    <div class="text-white">
                        <h3 class="font-semibold text-lg">${item.titleTh}</h3>
                        <p class="text-sm opacity-90">ดูถึง ${Math.round(progress)}%</p>
                        <div class="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
                <div class="absolute top-2 right-2">
                    <span class="badge-continue">ดูต่อ</span>
                </div>
            </div>
        </div>
    `;
}

// Create watchlist card
function createWatchlistCard(item) {
    return `
        <div class="content-card cursor-pointer" onclick="playFromWatchlist('${item.id}', '${item.type}')">
            <div class="relative aspect-[2/3] overflow-hidden">
                <img src="${item.poster}" alt="${item.titleTh}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/300x450/374151/ffffff?text=No+Image'">
                <div class="card-overlay flex items-end p-4">
                    <div class="text-white">
                        <h3 class="font-semibold text-lg">${item.titleTh}</h3>
                        <p class="text-sm opacity-90">${item.year} • ${item.rating} ⭐</p>
                    </div>
                </div>
                <div class="absolute top-2 right-2">
                    <span class="bg-red-600 text-white text-xs px-2 py-1 rounded-full">รายการโปรด</span>
                </div>
            </div>
        </div>
    `;
}

// Play movie
function playMovie(movieId) {
    const movie = content.find(item => item.id === movieId);
    if (movie) {
        // Add to continue watching
        addToContinueWatching(movie, 'movie');
        // Redirect to player (for now, just show alert)
        alert(`กำลังเล่นหนัง: ${movie.titleTh}`);
    }
}

// Show series detail
function showSeriesDetail(seriesId) {
    const series = content.find(item => item.id === seriesId);
    if (series) {
        showSeriesEpisodesPage(series);
    }
}

// Show series episodes page
function showSeriesEpisodesPage(series) {
    const main = document.querySelector('main');
    const totalEpisodes = series.seasons.reduce((total, season) => total + season.episodes.length, 0);
    
    main.innerHTML = `
        <div class="max-w-6xl mx-auto">
            <!-- Back button -->
            <button onclick="backToHome()" class="mb-6 flex items-center text-gray-400 hover:text-white transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                กลับ
            </button>
            
            <!-- Series Header -->
            <div class="flex flex-col md:flex-row gap-8 mb-8">
                <div class="md:w-1/3">
                    <img src="${series.poster}" alt="${series.titleTh}" 
                         class="w-full rounded-lg shadow-lg"
                         onerror="this.src='https://via.placeholder.com/300x450/374151/ffffff?text=No+Image'">
                </div>
                <div class="md:w-2/3">
                    <h1 class="text-3xl font-bold mb-4">${series.titleTh}</h1>
                    <p class="text-gray-400 mb-4">${series.descriptionTh}</p>
                    <div class="flex flex-wrap gap-2 mb-4">
                        <span class="bg-gray-700 px-3 py-1 rounded-full text-sm">${series.year}</span>
                        <span class="bg-purple-600/20 border border-purple-600 px-3 py-1 rounded-full text-sm text-purple-400">ซีรีส์</span>
                        <span class="bg-gray-700 px-3 py-1 rounded-full text-sm">${series.seasons.length} ฤดูกาล</span>
                        <span class="bg-gray-700 px-3 py-1 rounded-full text-sm">${totalEpisodes} ตอน</span>
                    </div>
                    <button onclick="playFirstEpisode('${series.id}')" 
                            class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                        ▶️ ดูตอนแรก
                    </button>
                </div>
            </div>
            
            <!-- Episodes -->
            <div class="space-y-8">
                ${series.seasons.map(season => `
                    <div>
                        <h2 class="text-xl font-semibold mb-4">ฤดูกาล ${season.season}</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${season.episodes.map(episode => `
                                <div class="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                                     onclick="playEpisode('${series.id}', ${season.season}, ${episode.episode})">
                                    <div class="flex items-start gap-4">
                                        <div class="bg-purple-600 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold">
                                            ${episode.episode}
                                        </div>
                                        <div class="flex-1">
                                            <h3 class="font-medium mb-1">${episode.titleTh}</h3>
                                            <p class="text-sm text-gray-400 mb-2">${episode.title}</p>
                                            <p class="text-xs text-gray-500">${episode.duration}</p>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Play first episode
function playFirstEpisode(seriesId) {
    const series = content.find(item => item.id === seriesId);
    if (series && series.seasons[0] && series.seasons[0].episodes[0]) {
        const firstEpisode = series.seasons[0].episodes[0];
        playVideo(series, series.seasons[0].season, firstEpisode);
    }
}

// Play specific episode
function playEpisode(seriesId, seasonNum, episodeNum) {
    const series = content.find(item => item.id === seriesId);
    if (series) {
        const season = series.seasons.find(s => s.season === seasonNum);
        if (season) {
            const episode = season.episodes.find(e => e.episode == episodeNum);
            if (episode) {
                playVideo(series, seasonNum, episode);
            }
        }
    }
}

// Play video
function playVideo(series, seasonNum, episode) {
    // Add to continue watching
    addToContinueWatching({
        id: series.id,
        titleTh: series.titleTh,
        poster: series.poster,
        type: 'series',
        season: seasonNum,
        episode: episode.episode,
        episodeTitle: episode.titleTh
    }, 'series');
    
    // Show video player
    showVideoPlayer(series, seasonNum, episode);
}

// Show video player
function showVideoPlayer(series, seasonNum, episode) {
    const main = document.querySelector('main');
    
    main.innerHTML = `
        <div class="max-w-6xl mx-auto">
            <!-- Back button -->
            <button onclick="backToSeriesDetail('${series.id}')" class="mb-6 flex items-center text-gray-400 hover:text-white transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                กลับไปหน้าซีรีส์
            </button>
            
            <!-- Simple Video Player -->
            <div class="bg-black rounded-lg overflow-hidden mb-6">
                <video id="videoPlayer" class="w-full" controls autoplay>
                    <source src="${episode.videoUrl}" type="video/mp4">
                    ${episode.subtitle ? `<track label="Thai" kind="subtitles" srclang="th" src="${episode.subtitle}">` : ''}
                    บราวเซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                </video>
            </div>
            
            <!-- Video Info -->
            <div class="bg-gray-800 rounded-lg p-6">
                <h1 class="text-2xl font-bold mb-2">${episode.titleTh}</h1>
                <p class="text-gray-400 mb-4">${episode.title}</p>
                <div class="flex items-center gap-4 text-sm text-gray-500">
                    <span>ซีรีส์: ${series.titleTh}</span>
                    <span>•</span>
                    <span>ฤดูกาล ${seasonNum} ตอน ${episode.episode}</span>
                    <span>•</span>
                    <span>${episode.duration || '45:00'}</span>
                </div>
            </div>
            
            <!-- Episode Navigation -->
            <div class="mt-6 flex justify-between">
                <button onclick="previousEpisode('${series.id}', ${seasonNum}, ${episode.episode})" 
                        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                    ← ตอนก่อนหน้า
                </button>
                <button onclick="nextEpisode('${series.id}', ${seasonNum}, ${episode.episode})" 
                        class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                    ตอนถัดไป →
                </button>
            </div>
        </div>
    `;
}

// Navigate episodes
function previousEpisode(seriesId, seasonNum, currentEpisode) {
    const series = content.find(item => item.id === seriesId);
    if (series) {
        const season = series.seasons.find(s => s.season === seasonNum);
        if (season) {
            const episodeIndex = season.episodes.findIndex(e => e.episode == currentEpisode);
            if (episodeIndex > 0) {
                const prevEpisode = season.episodes[episodeIndex - 1];
                playVideo(series, seasonNum, prevEpisode);
            }
        }
    }
}

function nextEpisode(seriesId, seasonNum, currentEpisode) {
    const series = content.find(item => item.id === seriesId);
    if (series) {
        const season = series.seasons.find(s => s.season === seasonNum);
        if (season) {
            const episodeIndex = season.episodes.findIndex(e => e.episode == currentEpisode);
            if (episodeIndex < season.episodes.length - 1) {
                const nextEpisode = season.episodes[episodeIndex + 1];
                playVideo(series, seasonNum, nextEpisode);
            }
        }
    }
}

// Navigation functions
function backToHome() {
    location.reload();
}

function backToSeriesDetail(seriesId) {
    showSeriesDetail(seriesId);
}

// Resume watching
function resumeWatching(id, type) {
    const item = content.find(item => item.id === id);
    if (item) {
        alert(`ดูต่อ: ${item.titleTh}`);
    }
}

// Play from watchlist
function playFromWatchlist(id, type) {
    const item = content.find(item => item.id === id);
    if (item) {
        alert(`เล่นจากรายการโปรด: ${item.titleTh}`);
    }
}

// Add to continue watching
function addToContinueWatching(item, type) {
    const existingIndex = continueWatching.findIndex(w => w.id === item.id);
    
    if (existingIndex !== -1) {
        continueWatching[existingIndex].lastWatched = new Date().toISOString();
    } else {
        continueWatching.push({
            id: item.id,
            type: type,
            titleTh: item.titleTh,
            poster: item.poster,
            year: item.year,
            rating: item.rating,
            progress: 0,
            lastWatched: new Date().toISOString()
        });
    }
    
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = searchInput.nextElementSibling;
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    if (!query) {
        loadContent();
        return;
    }
    
    const results = content.filter(item => 
        item.titleTh.toLowerCase().includes(query) ||
        item.descriptionTh.toLowerCase().includes(query) ||
        item.genreTh.some(g => g.toLowerCase().includes(query))
    );
    
    // Display search results (simplified for now)
    alert(`พบ ${results.length} รายการสำหรับ "${query}"`);
}

// Theme toggle
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.classList.toggle('light', savedTheme === 'light');
    
    themeToggle.addEventListener('click', () => {
        const isLight = html.classList.contains('light');
        html.classList.toggle('light', !isLight);
        localStorage.setItem('theme', !isLight ? 'light' : 'dark');
        
        // Update icon
        themeToggle.innerHTML = isLight ? 
            `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m6.364-6.364l-.707.707M6.343 17.657l-.707.707"></path>
            </svg>` :
            `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>`;
    });
}
