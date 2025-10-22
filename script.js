// กำหนดหมวดหมู่ทั้งหมดที่คุณต้องการแสดงบนหน้าแรก
const CATEGORIES = [
    { key: 'thai', title: 'หนังไทย' },
    { key: 'korea', title: 'หนังเกาหลี' },
    { key: 'china', title: 'หนังจีน/ฮ่องกง' },
    { key: 'inter', title: 'หนังฝรั่ง/สากล' },
    { key: 'cartoon', title: 'การ์ตูน/อนิเมชั่น' },
    { key: 'india', title: 'หนังอินเดีย' },
];

const ITEMS_PER_ROW = 16; 
let allMoviesByTitle = {}; 
let originalSectionsHtml = ''; // เก็บ HTML หน้าหลักเดิม

// --- [ COMMON FUNCTIONS ] ---

/**
 * ฟังก์ชันสร้าง Movie Card HTML String (แนวตั้ง 150x225)
 * ปรับปรุง: เพิ่มการส่งค่า subtitle เข้าไปใน watchUrl
 */
function createMovieCard(movie) {
    const movieFile = movie.file || movie.url;
    const movieName = movie.name || '';
    const movieSubtitle = movie.subtitle; // ดึง URL ของ Subtitle

    // 1. สร้าง URL พื้นฐาน (File และ Name)
    let watchUrl = `watch.html?file=${encodeURIComponent(movieFile || '')}&name=${encodeURIComponent(movieName)}`;

    // 2. *** ส่วนที่ถูกแก้ไข: เพิ่ม Subtitle URL ถ้ามีค่า ***
    if (movieSubtitle && movieSubtitle.trim() !== '') {
        watchUrl += `&subtitle=${encodeURIComponent(movieSubtitle)}`;
    }
    // *******************************************************

    return `
        <div class="flex-shrink-0 w-[150px] bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-blue-500/30 transition duration-300 poster-card group cursor-pointer">
            <div class="relative">
                <a href="${watchUrl}">
                    <img src="${movie.logo || movie.image}"
                         onerror="this.onerror=null;this.src='https://via.placeholder.com/150x225?text=No+Image';"
                         alt="${movieName}"
                         class="w-full h-[225px] object-cover transition duration-500">
                </a>
            </div>
            <div class="p-2">
                <p class="text-sm font-semibold truncate" title="${movieName}">${movieName}</p>
                <p class="text-xs text-gray-400">${movie.info}</p>
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
    const limit = isSearch ? movies.length : ITEMS_PER_ROW;
    const limitedMovies = movies.slice(0, limit);
    // ไม่ต้องแก้ไข: ฟังก์ชันนี้เรียก createMovieCard() ที่ถูกแก้ไขแล้ว
    const cardsHtml = limitedMovies.map(createMovieCard).join(''); 
    
    const categoryUrl = `category.html?cat=${categoryKey}`;
    
    return `
        <section class="mb-10">
            <a href="${categoryUrl}" class="group block mb-6">
                <h3 class="text-3xl font-bold border-l-4 border-red-600 pl-3 transition duration-300 group-hover:text-red-500">
                    ${title} 
                    <span class="text-red-600 text-xl ml-2 group-hover:ml-3 transition-all duration-300">›</span>
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
    const searchResultContainer = document.getElementById('search-result-container');
    
    // ซ่อนผลลัพธ์การค้นหา
    searchResultContainer.innerHTML = '';
    searchResultContainer.style.display = 'none'; 
    container.style.display = 'block';

    container.innerHTML = '<p class="text-gray-400">กำลังโหลดรายการหนังทั้งหมด...</p>';
    let allSectionsHtml = '';
    allMoviesByTitle = {};
    
    for (const category of CATEGORIES) {
        let movies = [];
        try {
            const response = await fetch(`./playlist/${category.key}.json`); 
            if (!response.ok) {
                console.warn(`Skipping category ${category.key}: File not found or failed to load.`);
                continue; 
            }
            movies = await response.json();
        } catch (error) {
            console.error(`Error loading JSON for ${category.key}:`, error);
            continue; 
        }
        
        if (movies && movies.length > 0) {
            // ส่ง category.key เข้าไปใน createMovieSection
            allSectionsHtml += createMovieSection(category.title, movies, category.key); 
            
            movies.forEach(movie => {
                const nameKey = (movie.name || '').toLowerCase();
                if (!allMoviesByTitle[nameKey]) {
                    // เก็บข้อมูลหนังสำหรับใช้ในการค้นหา
                    allMoviesByTitle[nameKey] = movie; 
                }
            });
        }
    }

    if (allSectionsHtml) {
        container.innerHTML = allSectionsHtml;
        originalSectionsHtml = allSectionsHtml; // เก็บ HTML เดิมไว้
    } else {
        container.innerHTML = '<p class="text-blue-500">ไม่พบรายการหนังในทุกหมวดหมู่. โปรดตรวจสอบไฟล์ JSON ในโฟลเดอร์ **playlist/**</p>';
        originalSectionsHtml = '';
    }
}

/**
 * ฟังก์ชันค้นหารายการหนังทั้งหมด
 */
function searchMovies() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const container = document.getElementById('movie-sections-container');
    const searchResultContainer = document.getElementById('search-result-container');

    if (!query || query.length < 2) {
        // ถ้าช่องค้นหาว่าง ให้กลับไปแสดงรายการทั้งหมด
        searchResultContainer.innerHTML = '';
        searchResultContainer.style.display = 'none';
        container.style.display = 'block';
        if (originalSectionsHtml) {
             container.innerHTML = originalSectionsHtml;
        } else {
             loadAllMovies(); // โหลดใหม่ถ้าไม่มี Original HTML
        }
        return;
    }
    
    // ซ่อนหน้าหลัก
    container.style.display = 'none';
    searchResultContainer.style.display = 'block';
    
    const allMoviesArray = Object.values(allMoviesByTitle);
    
    const filteredMovies = allMoviesArray.filter(movie => {
        const name = (movie.name || '').toLowerCase();
        const info = (movie.info || '').toLowerCase();
        return name.includes(query) || info.includes(query);
    });

    // สร้าง Section ใหม่สำหรับผลลัพธ์การค้นหา
    if (filteredMovies.length > 0) {
        const searchTitle = `🔍 ผลการค้นหา "${document.getElementById('search-input').value}" (${filteredMovies.length} รายการ)`;
        // ใช้คีย์ 'search' เพื่อให้สร้างลิงก์ที่หัวข้อไม่ได้
        const searchSection = createMovieSection(searchTitle, filteredMovies, 'search', true);
        searchResultContainer.innerHTML = searchSection;
    } else {
        searchResultContainer.innerHTML = `<p class="text-blue-500 text-2xl mt-8">ไม่พบรายการหนังที่ตรงกับ "${document.getElementById('search-input').value}"</p>`;
    }
}

// เริ่มต้นโหลดรายการทั้งหมดเมื่อหน้าเว็บโหลดเสร็จ
document.addEventListener('DOMContentLoaded', () => {
    // โหลดเฉพาะใน index.html เท่านั้น (ป้องกันการโหลดซ้ำถ้าใช้ category.js ในหน้าอื่น)
    if (document.title.includes('หน้าหลัก')) {
        loadAllMovies(); 
    }
});
