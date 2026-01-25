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

const ITEMS_PER_PAGE_OPTIONS = [24, 48, 72, 96]; // ตัวเลือกจำนวนรายการต่อหน้า
let ITEMS_PER_PAGE = 48; // ค่าเริ่มต้น จำกัดรายการสูงสุด 48 เรื่องต่อหน้า
let allMovies = [];      // เก็บรายการหนังทั้งหมดของหมวดหมู่ปัจจุบัน
let currentPage = 1;      // หน้าปัจจุบันที่กำลังแสดง
let currentCategory = '';  // หมวดหมู่ที่กำลังแสดง

// --- [ COMMON FUNCTIONS ] ---

/**
 * ฟังก์ชันสร้าง Movie Card HTML String (แนวตั้ง 150x225)
 * อัปเดต: รองรับ video-audio1, subtitle1 และการจัดการ error
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
    let watchUrl = `watch.html?video1=${encodeURIComponent(movieFile)}&name=${encodeURIComponent(movieName)}`;
    
    // เพิ่ม subtitle ถ้ามี
    if (movieSubtitle && movieSubtitle.trim() !== '') {
        watchUrl += `&subtitle1=${encodeURIComponent(movieSubtitle)}`;
    }
    
    // เพิ่ม audio2 ถ้ามี
    if (movie['video-audio2'] && movie['video-audio2'].trim() !== '') {
        watchUrl += `&video2=${encodeURIComponent(movie['video-audio2'])}`;
    }
    
    // เพิ่ม subtitle2 ถ้ามี
    if (movie['subtitle2'] && movie['subtitle2'].trim() !== '') {
        watchUrl += `&subtitle2=${encodeURIComponent(movie['subtitle2'])}`;
    }

    return `
        <div class="w-[130px] sm:w-[140px] md:w-[150px] lg:w-[160px] xl:w-[170px] flex-shrink-0 bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-red-500/30 transition duration-300 poster-card group cursor-pointer">
            <div class="relative">
                <a href="${watchUrl}">
                    <div class="w-full h-[195px] bg-gray-700">
                        <img src="${movieLogo}"
                             onerror="this.onerror=null;this.src='https://via.placeholder.com/130x195?text=No+Image';"
                             alt="${movieName}"
                             class="w-full h-full object-cover transition duration-500">
                    </div>
                    ${movieYear ? `<div class="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">${movieYear}</div>` : ''}
                    ${movieInfo ? `<div class="absolute bottom-2 right-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded font-medium">${movieInfo}</div>` : ''}
                </a>
            </div>
            <div class="p-2">
                <p class="text-xs font-bold text-white leading-tight mb-1 truncate" style="max-height: 2.4em; overflow: hidden;" title="${movieName}">${movieName}</p>
                ${movieYear ? `<div class="text-xs text-gray-500 text-center">${movieYear}</div>` : ''}
            </div>
        </div>
    `;
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
 */
function displayMovies(moviesToDisplay, title) {
    console.log(`=== displayMovies Debug ===`);
    console.log(`Movies to display: ${moviesToDisplay.length}`);
    console.log(`Title: ${title}`);
    
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
        
        titleElement.textContent = `${title} (หน้า ${currentPage}/${totalPages} | รวม ${totalItems} รายการ)`;
        console.log('Set title');
    } else {
        console.log('No movies to display, showing empty message');
        listContainer.innerHTML = `<p class="text-blue-500 col-span-full">ไม่พบรายการหนัง!</p>`;
        titleElement.textContent = `${title} (0 รายการ)`;
    }

    renderPagination(totalItems, totalPages);
    renderItemsPerPageSelector(totalItems);
    
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
    displayMovies(allMovies, CATEGORIES_FULL_NAME[currentCategory]);
}

/**
 * สร้างตัวเลือกจำนวนรายการต่อหน้า
 */
function renderItemsPerPageSelector(totalItems) {
    // ลบ selector เก่าถ้ามี
    const existingSelector = document.getElementById('items-per-page-selector');
    if (existingSelector) {
        existingSelector.remove();
    }
    
    const selectorHtml = `
        <div id="items-per-page-selector" class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
            <div class="flex items-center">
                <label class="text-sm text-gray-400 mr-2">แสดง:</label>
                <select id="items-per-page" onchange="changeItemsPerPage(parseInt(this.value))" 
                        class="bg-gray-800 border border-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
                    ${ITEMS_PER_PAGE_OPTIONS.map(count => 
                        `<option value="${count}" ${count === ITEMS_PER_PAGE ? 'selected' : ''}>${count} รายการ</option>`
                    ).join('')}
                </select>
            </div>
            <div class="text-xs sm:text-sm text-gray-500">
                รวม ${totalItems} รายการ
            </div>
        </div>
    `;
    
    // แทรก selector ก่อน pagination container
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.insertAdjacentHTML('beforebegin', selectorHtml);
}

/**
 * ฟังก์ชันเปลี่ยนหน้า (Next/Previous/หมายเลข)
 */
function changePage(newPage) {
    const totalPages = Math.ceil(allMovies.length / ITEMS_PER_PAGE);
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        document.getElementById('search-input').value = '';
        displayMovies(allMovies, CATEGORIES_FULL_NAME[currentCategory]);
        // เลื่อนไปด้านบนของหน้าเมื่อเปลี่ยนหน้า
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * ฟังก์ชันหลักสำหรับโหลดและแสดงผลรายการหนังตามหมวดหมู่
 */
async function loadCategory(categoryKey) {
    currentCategory = categoryKey;
    currentPage = 1; 
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
        
        if (!isLoggedIn || !isVip) {
            document.getElementById('category-title').textContent = 'VIP';
            listContainer.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <div class="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-8 max-w-md mx-auto">
                        <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-bold text-yellow-500 mb-2">VIP Access Required</h3>
                        <p class="text-gray-300 mb-4">กรุณา Login และใส่รหัส VIP เพื่อดูหนังในหมวดนี้</p>
                        <button onclick="window.location.href='../login.html'" class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-lg transition font-medium">
                            Login & Get VIP Access
                        </button>
                    </div>
                </div>
            `;
            return;
        }
    }
    
    // 1. ดึงข้อมูล
    let movies = [];
    try {
        // ถ้าเป็นหมวด erotic หรือ temp ให้อ่านจาก temp.json (VIP) เท่านั้น
        let jsonFile = (categoryKey === 'erotic' || categoryKey === 'temp') ? '../data/playlist/temp.json' : `../data/playlist/${categoryKey}.json`;
        
        console.log(`Loading category ${categoryKey} from file: ${jsonFile}`);
        const response = await fetch(jsonFile); 
        if (!response.ok) throw new Error(`Failed to load: ${jsonFile}`);
        movies = await response.json();
        
        // ถ้าเป็น erotic หรือ temp ให้อ่กรองเฉพาะที่มี category: "erotic" เท่านั้น
        if (categoryKey === 'erotic' || categoryKey === 'temp') {
            movies = movies.filter(movie => movie.category === 'erotic');
            console.log(`Filtered ${movies.length} erotic movies for VIP category`);
        }
        
    } catch (error) {
        console.error(`Error loading JSON for ${categoryKey}:`, error);
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
 * อัปเดต: ปรับปรุงการค้นหาและการแสดงผล
 */
function searchMovies() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (!query) {
        // ถ้าช่องค้นหาว่าง ให้กลับไปแสดงรายการทั้งหมด
        currentPage = 1;
        displayMovies(allMovies, CATEGORIES_FULL_NAME[currentCategory]);
        return;
    }
    
    // กรองรายการหนัง
    const filteredMovies = allMovies.filter(movie => {
        const name = (movie.name || '').toLowerCase();
        const info = (movie.info || '').toLowerCase();
        const category = (movie.category || '').toLowerCase();
        return name.includes(query) || info.includes(query) || category.includes(query);
    });
    
    // เมื่อค้นหา ให้เริ่มแสดงที่หน้า 1 ของผลลัพธ์การค้นหา
    currentPage = 1; 
    displayMovies(filteredMovies, `ผลการค้นหา "${query}" ใน ${CATEGORIES_FULL_NAME[currentCategory]}`);
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
});
