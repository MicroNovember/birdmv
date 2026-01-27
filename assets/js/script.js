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

const MOVIES_PER_ROW = 16; 
let moviesDatabase = {}; 
let originalSectionsHtml = ''; // เก็บ HTML หน้าหลักเดิม

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
    let watchUrl = `pages/watch.html?video1=${encodeURIComponent(movieFile)}&name=${encodeURIComponent(movieName)}`;
    
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
    
    // เพิ่มข้อมูลหนังอื่นๆ สำหรับการ์ดข้อมูล
    if (movieLogo && movieLogo.trim() !== '') {
        watchUrl += `&poster=${encodeURIComponent(movieLogo)}`;
    }
    
    if (movie.description && movie.description.trim() !== '') {
        watchUrl += `&description=${encodeURIComponent(movie.description)}`;
    }
    
    if (movie.category && movie.category.trim() !== '') {
        watchUrl += `&category=${encodeURIComponent(movie.category)}`;
    }
    
    if (movie.release_year && movie.release_year.trim() !== '') {
        watchUrl += `&year=${encodeURIComponent(movie.release_year)}`;
    }
    
    if (movie.info && movie.info.trim() !== '') {
        watchUrl += `&info=${encodeURIComponent(movie.info)}`;
    }
    
    // เพิ่มข้อมูลเพิ่มเติม (ถ้ามี)
    if (movie.duration && movie.duration.trim() !== '') {
        watchUrl += `&duration=${encodeURIComponent(movie.duration)}`;
    }
    
    if (movie.actors && movie.actors.trim() !== '') {
        watchUrl += `&actors=${encodeURIComponent(movie.actors)}`;
    }
    
    if (movie.director && movie.director.trim() !== '') {
        watchUrl += `&director=${encodeURIComponent(movie.director)}`;
    }
    
    if (movie.quality && movie.quality.trim() !== '') {
        watchUrl += `&quality=${encodeURIComponent(movie.quality)}`;
    }

    // Extract year from movie name if available
    const movieYear = movie.year || (movie.name.match(/\((\d{4})\)/) ? movie.name.match(/\((\d{4})\)/)[1] : '');
    
    return `
        <div class="mx-auto flex-shrink-0 w-[150px] bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/30 transition duration-300 poster-card group cursor-pointer">
            <div class="relative">
                <a href="${watchUrl}">
                    <img src="${movieLogo}"
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/150x225?text=No+Image';"
                         alt="${movieName}"
                         class="w-full h-[225px] object-cover transition duration-500">
                    ${movieYear ? `<div class="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">${movieYear}</div>` : ''}
                    ${movieInfo ? `<div class="absolute bottom-2 right-2 bg-transparent text-white text-xs px-2 py-1 rounded font-medium" style="background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);">${movieInfo}</div>` : ''}
                </a>
            </div>
            <div class="p-2">
                <p class="text-sm font-semibold truncate" title="${movieName}">${movieName}</p>
            </div>
        </div>
    `;
}

// --- [ INDEX.HTML LOGIC ] ---

/**
 * ฟังก์ชันสร้าง Section รายการหนังแบบเลื่อนได้ (Netflix Style)
 * ปรับปรุง: เพิ่มลิงก์ที่หัวข้อ h3 ไปยัง category.html
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
    
    const cardsHtml = limitedMovies.map(createMovieCard).join(''); 
    
    const categoryUrl = categoryKey === 'temp' ? 'pages/category.html?cat=temp' : `pages/category.html?cat=${categoryKey}`;
    
    return `
        <section class="mb-10">
            <a href="${categoryUrl}" class="group block mb-6">
                <h3 class="text-3xl font-bold border-l-4 border-blue-600 pl-3 transition duration-300 group-hover:text-blue-500">
                    ${title} 
                    <span class="text-blue-600 text-xl ml-2 group-hover:ml-3 transition-all duration-300">›</span>
                </h3>
            </a>
            
            <div class="horizontal-scroll-container flex space-x-2 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                ${cardsHtml}
            </div>
        </section>
    `;
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
    // Search functionality removed from index page
    console.log('Search functionality removed from index page');
}

/**
 * ฟังก์ชันค้นหาสำหรับ Mobile
 * อัปเดต: ใช้ displaySearchResultPage สำหรับผลลัพธ์เต็ม
 */
function mobileSearchMovies() {
    // Search functionality removed from index page
    console.log('Mobile search functionality removed from index page');
}

/**
 * ฟังก์ชันแสดงผลการค้นหาเต็มจาก Mobile
 */
function showFullSearchResults(encodedQuery) {
    // Search functionality removed from index page
    console.log('Full search results functionality removed from index page');
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
});
