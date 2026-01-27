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
    
    // Debug URL และตรวจสอบ
    console.log('🔗 Generated watch URL (category):', watchUrl);
    console.log('🔍 Current location (category):', window.location.href);
    console.log('🔍 Base path (category):', window.location.pathname);
    
    // บังคับให้แน่ใจว่าไม่มี pages/ ซ้ำ - ตรวจสอบและแก้ไขทุกกรณี
    let finalUrl = watchUrl;
    if (finalUrl.includes('pages/pages/')) {
        console.error('❌ DOUBLE PATH DETECTED! Fixing URL...');
        finalUrl = finalUrl.replace(/pages\/pages\//g, 'pages/');
        console.log('✅ Fixed URL (category):', finalUrl);
    }
    
    // ตรวจสอบว่าอยู่ในหน้า category หรือไม่
    if (window.location.pathname.includes('category.html')) {
        // ถ้าอยู่ในหน้า category ให้ใช้ relative path
        finalUrl = finalUrl.replace(/^pages\//, '');
        console.log('📂 In category page, using relative path:', finalUrl);
    }
    
    // Force cache busting
    finalUrl += `&cb=${Date.now()}`;
    
    console.log('🎯 Final URL to use (category):', finalUrl);
    
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

    return `
    <div class="movie-card group flex flex-col focus:outline-none" tabindex="0">
        <div class="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-800 shadow-lg">
            <a href="${finalUrl}" class="block w-full h-full">
                <img src="${movieLogo}" 
                     alt="${movieName}"
                     class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/200x280?text=No+Image';">
                
                <div class="absolute top-2 right-2 flex gap-1">
                    ${movieYear ? `<span class="bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">${movieYear}</span>` : ''}
                    ${movieInfo ? `<span class="bg-transparent text-white text-xs px-2 py-1 rounded font-medium" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);">${movieInfo}</span>` : ''}
                </div>
            </a>
        </div>

        <div class="mt-2 h-[38px] md:h-[44px] overflow-hidden">
            <h3 class="movie-title text-[12px] md:text-sm font-medium leading-tight group-hover:text-blue-400 transition" title="${movieName}">
                ${movieName}
            </h3>
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
    if (isSearchMode) {
        displayMovies(searchResults, `ผลการค้นหา "${document.getElementById('search-input').value}" ใน ${CATEGORIES_FULL_NAME[currentCategory]}`);
    } else {
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
    
    if (isSearchMode) {
        totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
    } else {
        totalPages = Math.ceil(allMovies.length / ITEMS_PER_PAGE);
    }
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        
        // ไม่ล้างค่าค้นหาเมื่อเปลี่ยนหน้าในโหมดค้นหา
        if (isSearchMode) {
            const query = document.getElementById('search-input').value;
            displayMovies(searchResults, `ผลการค้นหา "${query}" ใน ${CATEGORIES_FULL_NAME[currentCategory]}`);
        } else {
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
    searchResults = []; // ล้างผลการค้นหา
    
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
                        <button onclick="window.location.href='../login.html'" class="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-lg transition font-medium">
                            Login & Get VIP Access
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
        searchResults = [];
        displayMovies(allMovies, CATEGORIES_FULL_NAME[currentCategory]);
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
    
    // โหลดข้อมูลจาก temp (ทุกหมวดหมู่)
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
});
