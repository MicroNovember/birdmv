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
