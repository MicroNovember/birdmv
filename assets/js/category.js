// กำหนดหมวดหมู่ทั้งหมดพร้อมชื่อเต็ม (ใช้ในการแสดงหัวข้อ)
const CATEGORIES_FULL_NAME = {
    'thai': 'หนังไทย',
    'korea': 'หนังเกาหลี',
    'china': 'หนังจีน/ฮ่องกง',
    'inter': 'หนังฝรั่ง/สากล',
    'cartoon': 'การ์ตูน/อนิเมชั่น',
    'india': 'หนังอินเดีย',
    'asia': 'หนังเอเซีย',
    'erotic': 'VIP',
    'temp': 'VIP',
};

const ITEMS_PER_PAGE_OPTIONS = [24, 48, 72, 96]; // ตัวเลือกจำนวนรายการต่อหน้า (Netflix-style)
let ITEMS_PER_PAGE = 48; // ค่าเริ่มต้น จำกัดรายการสูงสุด 48 เรื่องต่อหน้า
let allMovies = [];      // เก็บรายการหนังทั้งหมดของหมวดหมู่ปัจจุบัน
let currentPage = 1;      // หน้าปัจจุบันที่กำลังแสดง
let currentCategory = '';  // หมวดหมู่ที่กำลังแสดง
let searchResults = [];   // เก็บผลการค้นหาแยกจาก allMovies
let isSearchMode = false; // ตรวจสอบว่าอยู่ในโหมดค้นหาหรือไม่

// --- [ COMMON FUNCTIONS ] ---

// Global search state variables
let globalSearchResults = [];
let globalSearchQuery = '';
let isGlobalSearchMode = false;

/**
 * [TAG: โครงสร้าง Card ที่สมบูรณ์แบบที่สุดสำหรับ Category Page]
 * ฟังก์ชันสร้าง Movie Card HTML String (Netflix Style)
 */
function createMovieCard(movie) {
    // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
    if (!movie || typeof movie !== 'object') {
        console.warn('Invalid movie object:', movie);
        return '';
    }

    const movieFile = movie['video-audio1'] || movie.file || movie.url;
    const movieName = movie.name || '';
    const movieSubtitle = movie.subtitle1 || movie.subtitle;
    const movieLogo = movie.logo || movie.image;
    const movieInfo = movie.info || '';
    const movieDescription = movie.description || movie.info || '';
    const movieYear = movie.year || '';

    // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
    if (!movieFile || !movieName || movieName.trim() === '') {
        console.warn('Missing required movie data:', {
            movie: movie,
            movieFile: !!movieFile,
            movieName: !!movieName,
            movieNameTrimmed: movieName && movieName.trim() !== ''
        });
        return '';
    }

    // สร้าง URL สำหรับดูหนัง
    let watchUrl = `pages/watch-simple.html?video1=${encodeURIComponent(movieFile)}&name=${encodeURIComponent(movieName)}&description=${encodeURIComponent(movieDescription)}&year=${movieYear}&t=${Date.now()}`;
    
    // บังคับให้แน่ใจว่าไม่มี pages/ ซ้ำ - ตรวจสอบและแก้ไขทุกกรณี
    let finalUrl = watchUrl;
    if (finalUrl.includes('pages/pages/')) {
        console.error('❌ DOUBLE PATH DETECTED! Fixing URL...');
        finalUrl = finalUrl.replace(/pages\/pages\//g, 'pages/');
    }
    
    // ตรวจสอบว่าอยู่ในหน้า index หรือไม่
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        // ถ้าอยู่ในหน้า index ให้ใช้ relative path แต่ยังคง pages/
    } else if (window.location.pathname.includes('pages/')) {
        // ถ้าอยู่ในหน้า pages อยู่แล้ว ให้ใช้ relative path ภายใน pages
        finalUrl = finalUrl.replace(/^pages\//, '');
    }
    
    // Force cache busting
    finalUrl += `&cb=${Date.now()}`;
    
    // ตรวจสอบครั้งสุดท้ายว่า URL ถูกต้องหรือไม่
    if (!finalUrl.includes('watch-simple.html')) {
        // บังคับให้แน่ใจว่าไม่มี pages/ ซ้ำ - ตรวจสอบและแก้ไขทุกกรณี
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            finalUrl = 'pages/watch-simple.html?' + finalUrl.split('?')[1];
        } else if (window.location.pathname.includes('pages/')) {
            finalUrl = 'watch-simple.html?' + finalUrl.split('?')[1];
        } else {
            finalUrl = 'pages/watch-simple.html?' + finalUrl.split('?')[1];
        }
    }
    
    // เพิ่ม subtitle ถ้ามี
    if (movieSubtitle && movieSubtitle.trim() !== '') {
        finalUrl += `&subtitle1=${encodeURIComponent(movieSubtitle)}`;
    }
    
    // เพิ่ม audio2 ถ้ามี
    if (movie['video-audio2'] && movie['video-audio2'].trim() !== '') {
        finalUrl += `&video2=${encodeURIComponent(movie['video-audio2'])}`;
    }
    
    // เพิ่ม subtitle2 ถ้ามี
    if (movie['subtitle2'] && movie['subtitle2'].trim() !== '') {
        finalUrl += `&subtitle2=${encodeURIComponent(movie['subtitle2'])}`;
    }

    // Add category badge for search results
    const categoryBadge = (movie.searchCategory && (isSearchMode || window.isSearchMode)) ? 
        `<span class="absolute top-2 right-2 bg-blue-600/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">
            ${movie.searchCategoryTitle || movie.searchCategory}
        </span>` : '';

    return `
    <div class="movie-card group relative overflow-hidden rounded-lg bg-gray-900 shadow-lg" onclick="window.location.href='${finalUrl}'">
        ${categoryBadge}
        <img src="${movieLogo}" 
             alt="${movieName}"
             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
             loading="lazy"
             onerror="this.src='https://via.placeholder.com/200x280?text=No+Image';">
        
        <div class="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end px-3 pb-3">
            
            <div class="h-[40px] flex items-center mb-1"> 
                <h3 class="text-white text-[12px] md:text-sm font-bold leading-tight line-clamp-2 w-full" title="${movieName}">
                    ${movieName}
                </h3>
            </div>

            <p class="text-gray-400 text-[10px] md:text-xs truncate opacity-80">
                ${movieInfo || movieYear ? `${movieInfo || ''} ${movieYear || ''}`.trim() : 'HD | ซับไทย'}
            </p>
        </div>
    </div>`;
}

// --- [ PAGINATION LOGIC ] ---

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * ฟังก์ชันสร้างและแสดงปุ่มแบ่งหน้า (Pagination)
 */
function renderPagination(totalItems, totalPages) {
    const paginationContainer = document.getElementById('pagination-container');
    
    // Debug logging
    console.log('renderPagination called:', { totalItems, totalPages, currentPage });
    
    if (!paginationContainer) {
        console.error('Pagination container not found!');
        return;
    }
    
    let paginationHtml = '';

    // Force pagination to show if we have more than ITEMS_PER_PAGE items
    if (totalPages <= 1 && totalItems > ITEMS_PER_PAGE) {
        console.log('Forcing pagination to show due to item count mismatch');
        totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    }
    
    if (totalPages <= 1) {
        console.log('Total pages <= 1, hiding pagination');
        paginationContainer.innerHTML = '';
        return;
    }

    console.log('Rendering pagination with', totalPages, 'pages');

    paginationHtml += '<nav class="flex justify-center items-center flex-wrap gap-2 p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm">';
    
    // แสดงข้อความ "หน้าที่..."
    paginationHtml += `<span class="text-gray-300 text-sm sm:text-base mx-2 font-medium">หน้าที่ ${currentPage} / ${totalPages}</span>`;
    
    // ปุ่มก่อนหน้า
    const prevDisabled = (currentPage === 1) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 bg-blue-600';
    const prevPage = currentPage > 1 ? currentPage - 1 : 1;
    paginationHtml += `<button onclick="changePage(${prevPage})" class="py-2 px-4 rounded-lg text-white text-sm sm:text-base transition-all duration-200 ${prevDisabled}" ${currentPage === 1 ? 'disabled' : ''}>ก่อนหน้า</button>`;

    // แสดงปุ่มหมายเลขหน้า (แสดงสูงสุด 5 หน้า)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHtml += `<button onclick="changePage(1)" class="py-2 px-3 rounded-lg bg-gray-700 hover:bg-blue-600 text-white text-sm sm:text-base transition-all duration-200">1</button>`;
        if (startPage > 2) paginationHtml += `<span class="py-2 px-1 text-gray-400 text-sm sm:text-base">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = (i === currentPage) ? 'bg-blue-800 text-white shadow-lg shadow-blue-800/50' : 'bg-gray-700 hover:bg-blue-600 text-white';
        paginationHtml += `<button onclick="changePage(${i})" class="py-2 px-3 rounded-lg ${activeClass} text-sm sm:text-base transition-all duration-200 font-medium">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationHtml += `<span class="py-2 px-1 text-gray-400 text-sm sm:text-base">...</span>`;
        paginationHtml += `<button onclick="changePage(${totalPages})" class="py-2 px-3 rounded-lg bg-gray-700 hover:bg-blue-600 text-white text-sm sm:text-base transition-all duration-200">${totalPages}</button>`;
    }

    // ปุ่มถัดไป
    const nextDisabled = (currentPage === totalPages) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 bg-blue-600';
    const nextPage = currentPage < totalPages ? currentPage + 1 : totalPages;
    paginationHtml += `<button onclick="changePage(${nextPage})" class="py-2 px-4 rounded-lg text-white text-sm sm:text-base transition-all duration-200 ${nextDisabled}" ${currentPage === totalPages ? 'disabled' : ''}>ถัดไป</button>`;
    
    paginationHtml += '</nav>';
    paginationContainer.innerHTML = paginationHtml;
    console.log('Pagination HTML set successfully');
}

/**
 * ฟังก์ชันแสดงผลรายการหนังบนหน้าจอ (เฉพาะหน้าปัจจุบัน)
 * อัปเดต: รองรับโหมดค้นหาและโหมดปกติแยกกัน
 */
function displayMovies(moviesToDisplay, title) {
    console.log(`=== displayMovies Debug ===`);
    console.log(`Movies to display: ${moviesToDisplay.length}`);
    console.log(`Title: ${title}`);
    console.log(`Search mode: ${isSearchMode}`);
    
    const listContainer = document.getElementById('movie-list-grid');
    const titleElement = document.getElementById('category-title');
    const paginationContainer = document.getElementById('pagination-container');
    
    // Ensure containers exist
    if (!listContainer || !titleElement || !paginationContainer) {
        console.error('Required containers not found:', {
            listContainer: !!listContainer,
            titleElement: !!titleElement,
            paginationContainer: !!paginationContainer
        });
        return;
    }
    
    console.log('All containers found successfully');
    
    // กรองเฉพาะหนังที่มีข้อมูลครบถ้วน
    const validMovies = moviesToDisplay.filter(movie => {
        if (!movie || typeof movie !== 'object') {
            console.warn('Invalid movie object:', movie);
            return false;
        }
        
        const movieFile = movie['video-audio1'] || movie.file || movie.url;
        const movieName = movie.name || '';
        
        const isValid = movieFile && movieName && movieName.trim() !== '';
        if (!isValid) {
            console.warn('Invalid movie data:', {
                name: movieName,
                file: movieFile,
                movie: movie
            });
        }
        
        return isValid;
    });
    
    // แสดงจำนวนหนังที่ถูกกรองออก (ถ้ามี)
    if (moviesToDisplay.length !== validMovies.length) {
        console.log(`Filtered ${moviesToDisplay.length - validMovies.length} invalid movies from display`);
    }
    
    const totalItems = validMovies.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    console.log('displayMovies:', { 
        totalItems, 
        totalPages, 
        currentPage, 
        ITEMS_PER_PAGE,
        validMoviesLength: validMovies.length 
    });

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    
    const limitedMovies = validMovies.slice(startIndex, endIndex);
    
    console.log(`Limited movies for display: ${limitedMovies.length} (from index ${startIndex} to ${endIndex})`);

    if (limitedMovies && limitedMovies.length > 0) {
        console.log('Creating movie cards...');
        const cardsHtml = limitedMovies.map(createMovieCard).join('');
        console.log(`Created HTML with ${cardsHtml.length} characters`);
        listContainer.innerHTML = cardsHtml;
        console.log('Set container innerHTML');
        
        // แสดง title ตามโหมด
        if (isSearchMode) {
            titleElement.textContent = `${title} (หน้า ${currentPage}/${totalPages} | รวม ${totalItems} รายการ)`;
        } else {
            titleElement.textContent = `${title} (หน้า ${currentPage}/${totalPages} | รวม ${totalItems} รายการ)`;
        }
        console.log('Set title');
    } else {
        console.log('No movies to display, showing empty message');
        if (isSearchMode) {
            listContainer.innerHTML = `<p class="text-blue-500 col-span-full">ไม่พบรายการที่ตรงกับการค้นหา!</p>`;
        } else {
            listContainer.innerHTML = `<p class="text-blue-500 col-span-full">ไม่พบรายการหนัง!</p>`;
        }
        titleElement.textContent = `${title} (0 รายการ)`;
    }

    renderPagination(totalItems, totalPages);
    
    // [TAG: อัปเดต Netflix-style Items Per Page Controls]
    updateItemsPerPageButtons(ITEMS_PER_PAGE);
    updateTotalItemsDisplay(totalItems);
    
    // Debug: Force pagination to show if it should be visible
    if (totalItems > 0 && !document.getElementById('pagination-container').innerHTML.trim()) {
        console.log('Pagination should be visible but is empty, forcing render');
        // Force at least 2 pages for testing if we have any items
        const forceTotalPages = Math.max(2, totalPages);
        renderPagination(totalItems, forceTotalPages);
    }
}

/**
 * ฟังก์ชันเปลี่ยนจำนวนรายการต่อหน้า
 */
function changeItemsPerPage(newItemsPerPage) {
    ITEMS_PER_PAGE = newItemsPerPage;
    currentPage = 1; // รีเซ็ตไปหน้าแรกเสมอเมื่อเปลี่ยนจำนวนรายการ
    
    // แสดงผลตามโหมดปัจจุบัน
    if (isGlobalSearchMode && globalSearchResults.length > 0) {
        // Global search results - show all categories
        const query = globalSearchQuery || document.getElementById('search-input').value || '';
        displayMovies(globalSearchResults, `ผลการค้นหา "${query}" จากทุกหมวดหมู่ (${globalSearchResults.length} รายการ)`);
    } else if (isSearchMode && searchResults.length > 0) {
        // Category search results
        const query = document.getElementById('search-input').value || globalSearchQuery || '';
        displayMovies(searchResults, `ผลการค้นหา "${query}" ใน ${CATEGORIES_FULL_NAME[currentCategory]}`);
    } else {
        // Normal category view
        displayMovies(allMovies, CATEGORIES_FULL_NAME[currentCategory]);
    }
}

/**
 * [TAG: Netflix-style Items Per Page Button Handler]
 * อัปเดตปุ่มจำนวนรายการต่อหน้าแบบ Netflix
 */
function updateItemsPerPageButtons(currentItemsPerPage) {
    const buttons = document.querySelectorAll('.items-per-page-btn');
    
    buttons.forEach(button => {
        const items = parseInt(button.dataset.items);
        
        if (items === currentItemsPerPage) {
            // Active state - Netflix blue style
            button.className = 'items-per-page-btn px-3 py-1 text-sm rounded-lg border border-blue-500 bg-blue-500/20 text-blue-400';
        } else {
            // Inactive state
            button.className = 'items-per-page-btn px-3 py-1 text-sm rounded-lg border border-gray-700 text-gray-400 hover:border-blue-500 hover:text-blue-400 transition';
        }
    });
}

/**
 * [TAG: Update Total Items Display]
 * อัปเดตจำนวนรายการทั้งหมด
 */
function updateTotalItemsDisplay(totalItems) {
    const totalItemsElement = document.getElementById('total-items');
    if (totalItemsElement) {
        totalItemsElement.textContent = `ทั้งหมด: ${totalItems} รายการ`;
    }
}

/**
 * [TAG: ฟังก์ชันเปลี่ยนหน้าพร้อม Scroll to Top]
 * ฟังก์ชันเปลี่ยนหน้า (Next/Previous/หมายเลข)
 * อัปเดต: รองรับโหมดค้นหาและโหมดปกติ พร้อมเลื่อนขึ้นบนอัตโนมัติ
 */
function changePage(newPage) {
    let totalPages;
    let moviesToUse;
    
    // Determine which movie set to use and calculate total pages
    if (isGlobalSearchMode && globalSearchResults.length > 0) {
        // Use global search results
        moviesToUse = globalSearchResults;
        totalPages = Math.ceil(globalSearchResults.length / ITEMS_PER_PAGE);
    } else if (isSearchMode && searchResults.length > 0) {
        // Use category search results
        moviesToUse = searchResults;
        totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
    } else {
        // Use normal category results
        moviesToUse = allMovies;
        totalPages = Math.ceil(allMovies.length / ITEMS_PER_PAGE);
    }
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        
        // Display appropriate results based on search mode
        if (isGlobalSearchMode && globalSearchResults.length > 0) {
            // Global search results - show all categories
            const query = globalSearchQuery || document.getElementById('search-input').value || '';
            displayMovies(globalSearchResults, `ผลการค้นหา "${query}" จากทุกหมวดหมู่ (${globalSearchResults.length} รายการ)`);
        } else if (isSearchMode && searchResults.length > 0) {
            // Category search results
            const query = document.getElementById('search-input').value || globalSearchQuery || '';
            displayMovies(searchResults, `ผลการค้นหา "${query}" ใน ${CATEGORIES_FULL_NAME[currentCategory]}`);
        } else {
            // Normal category view
            document.getElementById('search-input').value = '';
            displayMovies(allMovies, CATEGORIES_FULL_NAME[currentCategory]);
        }
        
        // [TAG: เลื่อนไปด้านบนของหน้าเมื่อเปลี่ยนหน้า]
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * ฟังก์ชันหลักสำหรับโหลดและแสดงผลรายการหนังตามหมวดหมู่
 */
async function loadCategory(categoryKey) {
    currentCategory = categoryKey;
    currentPage = 1; 
    isSearchMode = false; // รีเซ็ตโหมดค้นหา
    isGlobalSearchMode = false; // รีเซ็ตโหมดค้นหาทั่วโลก
    searchResults = []; // ล้างผลการค้นหา
    globalSearchResults = []; // ล้างผลการค้นหาทั่วโลก
    globalSearchQuery = ''; // ล้างคำค้นหาทั่วโลก
    
    const listContainer = document.getElementById('movie-list-grid');
    listContainer.innerHTML = '<p class="text-gray-400 col-span-full">กำลังโหลดรายการ...</p>';
    document.getElementById('pagination-container').innerHTML = '';
    document.getElementById('search-input').value = '';

    // Check if user is logged in for VIP categories
    if (categoryKey === 'erotic' || categoryKey === 'temp') {
        const userType = localStorage.getItem('user_type');
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
        
        const isLoggedIn = userType === 'guest' || userType === 'vip';
        
        console.log(`Category check: ${categoryKey}, Logged in: ${isLoggedIn}, VIP: ${isVip}`);
        console.log('User type:', userType);
        console.log('VIP data:', vipData);
        
        if (!isLoggedIn || !isVip) {
            console.log('❌ VIP access denied - showing login prompt');
            document.getElementById('category-title').textContent = 'VIP';
            listContainer.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <div class="bg-gray-800/20 border border-gray-600/50 rounded-lg p-8 max-w-md mx-auto">
                        <div class="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-gray-400 mb-2">VIP Access Required</h3>
                        <p class="text-gray-300 mb-4">กรุณา Login และใส่รหัส VIP เพื่อดูหนังในหมวดนี้</p>
                        <button onclick="window.location.reload()" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg transition font-medium">
                            Refresh Page
                        </button>
                    </div>
                </div>
            `;
            return;
        }
    }
    
    console.log('✅ VIP access granted - loading movies');
    
    // 1. ดึงข้อมูล
    let movies = [];
    try {
        // ใช้ JavaScript files แทน JSON files
        let functionName;
        if (categoryKey === 'erotic' || categoryKey === 'temp') {
            functionName = 'getTEMP';
        } else {
            functionName = 'get' + categoryKey.toUpperCase();
        }
        
        console.log(`Loading category ${categoryKey} from function: ${functionName}`);
        
        // ตรวจสอบว่าฟังก์ชันมีอยู่หรือไม่
        if (typeof window[functionName] === 'function') {
            movies = window[functionName]();
            console.error(`Loaded ${movies.length} movies from ${functionName} (JavaScript)`);
        } else {
            throw new Error(`Function ${functionName} not found`);
        }
        
        // ถ้าเป็น temp ให้แสดงทั้งหมดที่มีใน temp.json
        if (categoryKey === 'temp') {
            console.log(`Loading ${movies.length} VIP movies from temp.js`);
        }
        // ถ้าเป็น erotic ให้กรองเฉพาะที่มี category: "erotic" เท่านั้น
        else if (categoryKey === 'erotic') {
            movies = movies.filter(movie => movie.category === 'erotic');
            console.log(`Filtered ${movies.length} erotic movies for VIP category`);
        }
        
    } catch (error) {
        console.error(`Error loading JavaScript for ${categoryKey}:`, error);
        document.getElementById('category-title').textContent = CATEGORIES_FULL_NAME[categoryKey] || 'รายการหนัง';
        listContainer.innerHTML = `<p class="text-blue-500 col-span-full">❌ เกิดข้อผิดพลาดในการโหลดรายการ **${CATEGORIES_FULL_NAME[categoryKey]}** หรือไม่พบไฟล์</p>`;
        return; 
    }
    
    // 2. กรองและเก็บข้อมูลที่ถูกต้องเท่านั้น
    const validMovies = movies.filter(movie => {
        if (!movie || typeof movie !== 'object') return false;
        
        const movieFile = movie['video-audio1'] || movie.file || movie.url;
        const movieName = movie.name || '';
        
        return movieFile && movieName && movieName.trim() !== '';
    });
    
    // Debug logs
    console.log(`=== Category ${categoryKey} Debug ===`);
    console.log(`Total movies loaded: ${movies.length}`);
    console.log(`Valid movies after filter: ${validMovies.length}`);
    console.log(`Sample movie:`, validMovies[0]);
    console.log(`============================`);
    
    // แสดงจำนวนหนังที่ถูกกรองออก (ถ้ามี)
    if (movies.length !== validMovies.length) {
        console.log(`Filtered ${movies.length - validMovies.length} invalid movies from category "${categoryKey}"`);
    }
    
    allMovies = validMovies;
    
    // 3. อัปเดตปุ่ม Active ใน Navigation
    const categoryButtons = document.querySelectorAll('#main-nav a[data-category]');
    categoryButtons.forEach(a => {
        a.classList.remove('bg-blue-600', 'text-white');
        a.classList.add('hover:bg-gray-700');
        if (a.getAttribute('data-category') === categoryKey) {
            a.classList.add('bg-blue-600', 'text-white');
            a.classList.remove('hover:bg-gray-700');
        }
    });

    console.log(`Calling displayMovies with ${allMovies.length} movies for category ${categoryKey}`);
    displayMovies(allMovies, CATEGORIES_FULL_NAME[categoryKey]);
}

/**
 * ฟังก์ชันค้นหารายการหนังในหมวดหมู่ที่กำลังแสดง
 * อัปเดต: ค้นหาเฉพาะในหมวดหมู่ปัจจุบัน และแยกผลการค้นหา
 */
function searchMovies() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (!query) {
        // ถ้าช่องค้นหาว่าง ให้กลับไปแสดงรายการทั้งหมด
        currentPage = 1;
        isSearchMode = false;
        isGlobalSearchMode = false;
        searchResults = [];
        globalSearchResults = [];
        globalSearchQuery = '';
        displayMovies(allMovies, CATEGORIES_FULL_NAME[currentCategory]);
        return;
    }
    
    // ใช้ global search system ถ้ามีและต้องการค้นหาจากทุกหมวดหมู่
    if (typeof searchGlobalIndex === 'function' && !currentCategory) {
        // Global search mode
        const globalResults = searchGlobalIndex(query, { limit: 100 });
        
        // Set global search state
        isGlobalSearchMode = true;
        globalSearchResults = globalResults;
        globalSearchQuery = query;
        
        // Also set local search state for compatibility
        isSearchMode = true;
        searchResults = globalResults;
        currentPage = 1;
        
        displayMovies(searchResults, `ผลการค้นหา "${query}" จากทุกหมวดหมู่ (${globalResults.length} รายการ)`);
        return;
    }
    
    // กรองรายการหนังเฉพาะในหมวดหมู่ปัจจุบัน
    const filteredMovies = allMovies.filter(movie => {
        const name = (movie.name || '').toLowerCase();
        const info = (movie.info || '').toLowerCase();
        const category = (movie.category || '').toLowerCase();
        return name.includes(query) || info.includes(query) || category.includes(query);
    });
    
    // เก็บผลการค้นหาและเข้าโหมดค้นหา
    searchResults = filteredMovies;
    isSearchMode = true;
    isGlobalSearchMode = false; // This is category search, not global
    currentPage = 1; // เริ่มแสดงที่หน้า 1 ของผลการค้นหา
    
    console.log(`Search in category ${currentCategory}: Found ${filteredMovies.length} results for "${query}"`);
    
    // แสดงผลการค้นหา
    displayMovies(searchResults, `ผลการค้นหา "${query}" ใน ${CATEGORIES_FULL_NAME[currentCategory]}`);
}

/**
 * ฟังก์ชันค้นหาจาก temp และแสดงผลแทนหมวดหมู่ปัจจุบัน
 * ใช้สำหรับแสดงผลการค้นหาจากทุกหมวดหมู่ในหน้า category
 */
function searchFromTemp(query) {
    if (!query) {
        // ถ้าช่องค้นหาว่าง ให้กลับไปแสดงรายการทั้งหมด
        currentPage = 1;
        isSearchMode = false;
        searchResults = [];
        displayMovies(allMovies, CATEGORIES_FULL_NAME[currentCategory]);
        return;
    }
    
    // ใช้ global search system ถ้ามี
    if (typeof searchGlobalIndex === 'function') {
        const globalResults = searchGlobalIndex(query, { limit: 100 });
        searchResults = globalResults;
        isSearchMode = true;
        currentPage = 1;
        displayMovies(searchResults, `ผลการค้นหา "${query}" จากทุกหมวดหมู่ (${globalResults.length} รายการ)`);
        return;
    }
    
    // Fallback to old method
    let tempMovies = [];
    try {
        if (typeof window.getTEMP === 'function') {
            tempMovies = window.getTEMP();
            console.log(`Loaded ${tempMovies.length} movies from temp for search`);
        }
    } catch (error) {
        console.error('Error loading temp movies for search:', error);
        return;
    }
    
    // กรองเฉพาะหนังที่มีข้อมูลครบถ้วน
    const validTempMovies = tempMovies.filter(movie => {
        if (!movie || typeof movie !== 'object') return false;
        
        const movieFile = movie['video-audio1'] || movie.file || movie.url;
        const movieName = movie.name || '';
        
        return movieFile && movieName && movieName.trim() !== '';
    });
    
    // ค้นหาในข้อมูล temp
    const filteredTempMovies = validTempMovies.filter(movie => {
        const name = (movie.name || '').toLowerCase();
        const info = (movie.info || '').toLowerCase();
        const category = (movie.category || '').toLowerCase();
        return name.includes(query.toLowerCase()) || info.includes(query.toLowerCase()) || category.includes(query.toLowerCase());
    });
    
    // เก็บผลการค้นหาและเข้าโหมดค้นหา
    searchResults = filteredTempMovies;
    isSearchMode = true;
    currentPage = 1;
    
    console.log(`Temp search: Found ${filteredTempMovies.length} results for "${query}" from ${validTempMovies.length} temp movies`);
    
    // แสดงผลการค้นหาจาก temp
    displayMovies(searchResults, `ผลการค้นหา "${query}" จากทุกหมวดหมู่`);
}

// โหลดรายการตามพารามิเตอร์เมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    const categoryKey = getQueryParam('cat');
    if (categoryKey && CATEGORIES_FULL_NAME[categoryKey]) {
        loadCategory(categoryKey);
    } else {
        // หากไม่มีพารามิเตอร์ ให้โหลดหมวดหมู่แรกเป็นค่าเริ่มต้น (Thai)
        loadCategory('thai');
    }
    
    // [TAG: Netflix-style Items Per Page Button Event Listeners]
    const itemsPerPageButtons = document.querySelectorAll('.items-per-page-btn');
    itemsPerPageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const newItemsPerPage = parseInt(this.dataset.items);
            changeItemsPerPage(newItemsPerPage);
        });
    });
    
    // Initialize search system if available
    if (typeof initializeSearchSystem === 'function') {
        initializeSearchSystem();
    }
});
