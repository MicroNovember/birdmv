// กำหนดหมวดหมู่ทั้งหมดที่คุณต้องการแสดงบนหน้าแรก
const MOVIE_CATEGORIES = [
    { key: 'thai', title: 'ไทย' },
    { key: 'korea', title: 'เกาหลี' },
    { key: 'china', title: 'จีน/ฮ่องกง' },
    { key: 'inter', title: 'สากล' },
    { key: 'cartoon', title: 'การ์ตูน/อนิเมชั่น' },
    { key: 'india', title: 'หนังอินเดีย' },
    { key: 'asia', title: 'หนังเอเซีย' },
    { key: 'temp', title: 'VIP', vip: true }, // VIP Category
];

// Check VIP status and filter categories accordingly
function getFilteredCategories() {
    const vipData = localStorage.getItem('vip_access');
    let isVip = false;
    
    if (vipData) {
        try {
            const { expires } = JSON.parse(vipData);
            isVip = expires && new Date(expires) > new Date();
        } catch (error) {
            console.error('Error checking VIP status:', error);
        }
    }
    
    // Check if user is logged in (Guest or VIP)
    const userType = localStorage.getItem('user_type');
    const isLoggedIn = userType === 'guest' || userType === 'vip';
    
    // Debug logs
    console.log('=== VIP Status Check ===');
    console.log('User type from localStorage:', userType);
    console.log('Is logged in:', isLoggedIn);
    console.log('VIP data exists:', !!vipData);
    console.log('VIP data:', vipData ? JSON.parse(vipData) : null);
    console.log('Is VIP valid:', isVip);
    
    // Show VIP category only if user is logged in and has valid VIP access
    const filtered = (isLoggedIn && isVip) ? MOVIE_CATEGORIES : MOVIE_CATEGORIES.filter(cat => !cat.vip);
    console.log('Filtered categories:', filtered.map(c => c.key));
    console.log('========================');
    return filtered;
}

const MOVIES_PER_ROW = 10; 
let moviesDatabase = {}; 
let originalSectionsHtml = ''; // เก็บ HTML หน้าหลักเดิม

// --- [ COMMON FUNCTIONS ] ---
// ใช้ createMovieCard จาก movie-cards.js แทน

// --- [ INDEX.HTML LOGIC ] ---

/**
 * ฟังก์ชันสร้าง Section รายการหนังแบบเลื่อนได้ (Netflix Style)
 * ปรับปรุง: ใช้ createMovieRow จาก movie-cards.js
 */
function createMovieSection(title, movies, categoryKey, isSearch = false) {
    console.log(`Creating section: ${title} (${categoryKey}) with ${movies.length} movies`);
    const limit = isSearch ? movies.length : MOVIES_PER_ROW;
    
    // กรองเฉพาะหนังที่มีข้อมูลครบถ้วน
    const validMovies = movies.filter(movie => {
        if (!movie || typeof movie !== 'object') return false;
        
        const movieFile = movie['video-audio1'] || movie.file || movie.url;
        const movieName = movie.name || '';
        
        return movieFile && movieName && movieName.trim() !== '';
    });
    
    const limitedMovies = validMovies.slice(0, limit);
    
    // แสดงจำนวนหนังที่ถูกกรองออก (ถ้ามี)
    if (movies.length !== validMovies.length) {
        console.log(`Filtered ${movies.length - validMovies.length} invalid movies from category "${categoryKey}"`);
    }
    
    console.log(`Section ${categoryKey}: ${limitedMovies.length} valid movies to display`);
    
    // ใช้ createMovieRow จาก movie-cards.js แทน
    return createMovieRow(title, limitedMovies, categoryKey);
}

/**
 * ฟังก์ชันหลักในการโหลดรายการหนังทั้งหมดมาแสดงแบบ Netflix
 */
async function loadAllMovies() {
    const container = document.getElementById('movie-sections-container');
    
    // แสดง container หลักอย่างชัดเจน
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';

    container.innerHTML = '<p class="text-gray-400">กำลังโหลดรายการหนังทั้งหมด...</p>';
    let allSectionsHtml = '';
    moviesDatabase = {};
    
    for (const category of getFilteredCategories()) {
        let movies = [];
        try {
            // ใช้ function จาก JS files ที่เข้ารหัส
            let functionName;
            
            // ถ้าเป็นหมวด erotic ให้ใช้ข้อมูลจาก TEMP
            if (category.key === 'erotic') {
                functionName = 'getTEMP';
                movies = typeof window[functionName] === 'function' ? window[functionName]() : [];
                // กรองเฉพาะที่มี category: "erotic" เท่านั้น
                movies = movies.filter(movie => movie.category === 'erotic');
                console.error(`Filtered ${movies.length} erotic movies for VIP category`);
            } else {
                functionName = 'get' + category.key.toUpperCase();
                movies = typeof window[functionName] === 'function' ? window[functionName]() : [];
            }
            
            console.error(`Loaded ${movies.length} movies from ${category.key} (JavaScript)`);
            
        } catch (error) {
            console.error(`Error loading JSON for ${category.key}:`, error);
            continue; 
        }
        
        if (movies && movies.length > 0) {
            // ส่ง category.key เข้าไปใน createMovieSection
            console.error(`Adding section for category: ${category.key} (${category.title})`);
            allSectionsHtml += createMovieSection(category.title, movies, category.key); 
            
            movies.forEach(movie => {
                // ตรวจสอบว่าหนังมีข้อมูลครบถ้วนก่อนเก็บในฐานข้อมูล
                if (movie && typeof movie === 'object') {
                    const movieFile = movie['video-audio1'] || movie.file || movie.url;
                    const movieName = movie.name || '';
                    
                    if (movieFile && movieName && movieName.trim() !== '') {
                        const nameKey = movieName.toLowerCase();
                        if (!moviesDatabase[nameKey]) {
                            // เก็บข้อมูลหนังสำหรับใช้ในการค้นหา (ถ้าต้องการในอนาคต)
                            moviesDatabase[nameKey] = movie; 
                        }
                    }
                }
            });
        }
    }

    if (allSectionsHtml) {
        container.innerHTML = allSectionsHtml;
        originalSectionsHtml = allSectionsHtml; // เก็บ HTML เดิมไว้
    } else {
        container.innerHTML = '<p class="text-blue-500">ไม่พบรายการหนังในทุกหมวดหมู่. โปรดตรวจสอบไฟล์ JSON ในโฟลเดอร์ **data/playlist/**</p>';
        originalSectionsHtml = '';
    }
}

/**
 * ฟังก์ชันสำหรับ Mobile Search Overlay
 */
function toggleSearch() {
    const overlay = document.getElementById('mobile-search-overlay');
    if (overlay) {
        // Use proper class toggle for show/hide
        if (overlay.classList.contains('hidden')) {
            overlay.classList.remove('hidden');
            // Add animation class
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
            // Focus search input when opened
            const searchInput = document.getElementById('mobile-search-input');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }
        } else {
            overlay.style.opacity = '0';
            // Hide after transition
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    }
}

/**
 * ฟังก์ชันค้นหาสำหรับ Mobile
 * อัปเดต: ใช้ global search system
 */
function mobileSearchMovies() {
    const searchInput = document.getElementById('mobile-search-input');
    const searchResult = document.getElementById('mobile-search-result-grid');
    
    if (!searchInput || !searchResult) return;
    
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length < 2) {
        searchResult.innerHTML = '<p class="text-gray-400 text-center col-span-full">กรุณาพิมพ์อย่างน้อย 2 ตัวอักษร</p>';
        return;
    }
    
    // Use global search system if available
    if (typeof searchGlobalIndex === 'function') {
        const results = searchGlobalIndex(query, { limit: 12 });
        
        if (results.length > 0) {
            const cardsHtml = results.map(createMovieCard).join('');
            searchResult.innerHTML = cardsHtml;
            
            // Add result count
            const resultCount = document.createElement('div');
            resultCount.className = 'col-span-full text-center text-gray-400 text-sm mb-4';
            resultCount.textContent = `พบ ${results.length} รายการสำหรับ "${query}"`;
            searchResult.insertBefore(resultCount, searchResult.firstChild);
        } else {
            searchResult.innerHTML = '<p class="text-gray-400 text-center col-span-full">ไม่พบรายการที่ตรงกับการค้นหา</p>';
        }
        return;
    }
    
    // Fallback
    searchResult.innerHTML = '<p class="text-gray-400 text-center col-span-full">ฟังก์ชันค้นหาไม่พร้อมใช้งาน</p>';
}

/**
 * ฟังก์ชันแสดงผลการค้นหาเต็มจาก Mobile
 */
function showFullSearchResults(encodedQuery) {
    const query = decodeURIComponent(encodedQuery);
    
    // Use global search system if available
    if (typeof searchGlobalIndex === 'function') {
        const results = searchGlobalIndex(query, { limit: 100 });
        
        // Redirect to category page with search results
        const categoryUrl = `category.html?search=${encodeURIComponent(query)}`;
        window.location.href = categoryUrl;
        return;
    }
    
    // Fallback
    console.log('Full search results not available');
}

/**
 * ฟังก์ชันตั้งค่า active state สำหรับ mobile navigation
 */
function setActiveMobileNav() {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    
    // ตรวจสอบว่ามี mobile navigation หรือไม่
    const mobileNav = document.querySelector('.mobile-bottom-nav');
    if (!mobileNav) {
        return; // ไม่ทำอะไรถ้าไม่มี mobile navigation
    }
    
    // ลบ active class ทั้งหมด
    mobileNav.querySelectorAll('a').forEach(link => {
        link.classList.remove('active');
    });
    
    // ตั้งค่า active ตามหน้าปัจจุบัน
    if (currentPath.includes('index.html') || currentPath === '/') {
        const homeLink = mobileNav.querySelector('a[href="index.html"]');
        if (homeLink) homeLink.classList.add('active');
    } else if (currentPath.includes('category.html')) {
        if (currentSearch.includes('cat=erotic')) {
            const eroticLink = mobileNav.querySelector('a[href*="erotic"]');
            if (eroticLink) eroticLink.classList.add('active');
        } else {
            const thaiLink = mobileNav.querySelector('a[href*="thai"]');
            if (thaiLink) thaiLink.classList.add('active');
        }
    }
}

// ป้องกัน right click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// เริ่มต้นโหลดรายการทั้งหมดเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    // โหลดเฉพาะใน index.html เท่านั้น (ป้องกันการโหลดซ้ำถ้าใช้ category.js ในหน้าอื่น)
    if (document.title.includes('หน้าหลัก')) {
        loadAllMovies(); 
    }
    
    // ตั้งค่า mobile navigation
    setActiveMobileNav();
    
    // Initialize search system if available
    if (typeof initializeSearchSystem === 'function') {
        initializeSearchSystem();
    }
    
    // Set up desktop search listeners if on index page
    const searchInput = document.getElementById('search-input');
    if (searchInput && document.title.includes('หน้าหลัก')) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    // Show search suggestions for desktop
                    if (typeof showSearchSuggestions === 'function') {
                        showSearchSuggestions(query);
                    }
                    // Perform search and show results on index page
                    performIndexSearch(query);
                }, 300);
            } else if (query.length === 0) {
                if (typeof hideSearchSuggestions === 'function') {
                    hideSearchSuggestions();
                }
                // Clear search and show normal content
                clearIndexSearchResults();
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    performIndexSearch(query);
                    hideSearchSuggestions();
                }
            }
        });
        
        // Also handle search button click
        const searchButton = document.querySelector('.netflix-search-button');
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                const query = searchInput.value.trim();
                if (query.length >= 2) {
                    performIndexSearch(query);
                    hideSearchSuggestions();
                }
            });
        }
    }
});

/**
 * Perform search on index page and display results
 * @param {string} query - Search query
 */
function performIndexSearch(query) {
    // Create visual debug indicator
    const debugDiv = document.createElement('div');
    debugDiv.id = 'search-debug';
    debugDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: red;
        color: white;
        padding: 10px;
        border-radius: 5px;
        z-index: 9999;
        font-size: 12px;
    `;
    debugDiv.textContent = `Searching for: "${query}"`;
    document.body.appendChild(debugDiv);
    
    // Show search results container
    const sectionsContainer = document.getElementById('movie-sections-container');
    const searchContainer = document.getElementById('search-results-container');
    const searchGrid = document.getElementById('search-results-grid');
    const searchTitle = document.getElementById('search-results-title');
    const searchDescription = document.getElementById('search-results-description');
    
    if (sectionsContainer) sectionsContainer.classList.add('hidden');
    if (searchContainer) searchContainer.classList.remove('hidden');
    
    // Show loading state
    if (searchGrid) {
        searchGrid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p class="text-gray-500 animate-pulse uppercase tracking-widest text-xs font-bold">กำลังค้นหา...</p>
            </div>
        `;
    }
    
    if (searchTitle) searchTitle.textContent = `ผลการค้นหา "${query}"`;
    if (searchDescription) searchDescription.textContent = 'กำลังค้นหาจากทุกหมวดหมู่...';
    
    // Use global search system if available
    if (typeof searchGlobalIndex === 'function') {
        const results = searchGlobalIndex(query, { limit: 100 });
        
        // Update debug indicator
        debugDiv.style.background = 'green';
        debugDiv.textContent = `Found ${results.length} results`;
        
        // Update search state
        window.isSearchMode = true;
        window.searchResults = results;
        window.currentPage = 1;
        window.currentSearchQuery = query;
        
        // Display results
        displayIndexSearchResults(results, query);
        
        // Remove debug indicator after 3 seconds
        setTimeout(() => {
            if (debugDiv.parentNode) {
                debugDiv.parentNode.removeChild(debugDiv);
            }
        }, 3000);
    } else {
        // Fallback search
        debugDiv.style.background = 'orange';
        debugDiv.textContent = 'Using fallback search';
        performFallbackIndexSearch(query);
    }
}

/**
 * Display search results on index page
 * @param {Array} results - Search results
 * @param {string} query - Search query
 */
function displayIndexSearchResults(results, query) {
    const searchGrid = document.getElementById('search-results-grid');
    const searchDescription = document.getElementById('search-results-description');
    const paginationContainer = document.getElementById('search-pagination-container');
    
    if (searchDescription) {
        searchDescription.textContent = `พบ ${results.length} รายการสำหรับ "${query}"`;
    }
    
    if (results.length === 0) {
        if (searchGrid) {
            searchGrid.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <div class="text-gray-400 text-lg mb-4">ไม่พบรายการที่ตรงกับการค้นหา</div>
                    <div class="text-gray-500 mb-6">ลองค้นหาด้วยคำอื่นหรือตรวจสอบการสะกด</div>
                </div>
            `;
        }
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }
    
    // Display results using createMovieCard function
    if (searchGrid && typeof createMovieCard === 'function') {
        const cardsHtml = results.slice(0, 24).map(createMovieCard).join(''); // Show first 24 results
        searchGrid.innerHTML = cardsHtml;
        
        // Add pagination if more results
        if (results.length > 24) {
            if (paginationContainer) {
                paginationContainer.innerHTML = `
                    <div class="text-center text-gray-400">
                        <p>แสดง 24 จาก ${results.length} รายการ</p>
                        <button onclick="window.location.href='pages/category.html?search=${encodeURIComponent(query)}'" class="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            ดูผลการค้นหาทั้งหมด
                        </button>
                    </div>
                `;
            }
        }
    }
}

/**
 * Fallback search function for index page
 * @param {string} query - Search query
 */
function performFallbackIndexSearch(query) {
    const categories = ['thai', 'korea', 'china', 'inter', 'cartoon', 'india', 'asia', 'temp'];
    let allMovies = [];
    let loadedCategories = 0;
    
    categories.forEach(cat => {
        try {
            const functionName = 'get' + cat.toUpperCase();
            if (typeof window[functionName] === 'function') {
                const movies = window[functionName]();
                if (Array.isArray(movies)) {
                    allMovies = allMovies.concat(movies);
                }
            }
            loadedCategories++;
            
            if (loadedCategories === categories.length) {
                // All categories loaded, perform search
                const results = allMovies.filter(movie => {
                    const name = (movie.name || '').toLowerCase();
                    const info = (movie.info || '').toLowerCase();
                    const category = (movie.category || '').toLowerCase();
                    return name.includes(query.toLowerCase()) || 
                           info.includes(query.toLowerCase()) || 
                           category.includes(query.toLowerCase());
                });
                
                displayIndexSearchResults(results, query);
            }
        } catch (error) {
            console.error(`Error loading category ${cat}:`, error);
            loadedCategories++;
            
            if (loadedCategories === categories.length) {
                displayIndexSearchResults([], query);
            }
        }
    });
}

/**
 * Clear search results and return to normal view
 */
function clearIndexSearchResults() {
    const sectionsContainer = document.getElementById('movie-sections-container');
    const searchContainer = document.getElementById('search-results-container');
    const searchInput = document.getElementById('search-input');
    
    if (sectionsContainer) sectionsContainer.classList.remove('hidden');
    if (searchContainer) searchContainer.classList.add('hidden');
    if (searchInput) searchInput.value = '';
    
    // Reset search state
    window.isSearchMode = false;
    window.searchResults = [];
    window.currentPage = 1;
    window.currentSearchQuery = '';
}
