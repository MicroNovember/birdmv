// Movie Cards & Grid System - Netflix Standard

// Configuration
const MOVIE_CARDS_CONFIG = {
    // Index Page - Horizontal Slide
    indexPage: {
        moviesPerRow: 10, // 10-12 movies per category
        cardWidths: {
            mobile: 110,  // 110px x 165px (2:3 ratio)
            sm: 130,      // 130px x 195px
            md: 150,      // 150px x 225px
            lg: 180,      // 180px x 270px
            xl: 200       // 200px x 300px
        }
    },
    
    // Category Page - Grid System
    categoryPage: {
        paginationOptions: [12, 24, 48, 64], // Numbers divisible by 2,3,4,6
        gridColumns: {
            mobile: 2,    // 2 columns on mobile
            sm: 3,        // 3 columns on small tablets
            md: 4,        // 4 columns on large tablets
            lg: 6,        // 6 columns on desktop
            xl: 8         // 8 columns on large desktop
        }
    }
};

// Create Movie Card HTML - Netflix Standard
function createMovieCard(movie, options = {}) {
    const {
        showBadge = true,
        showInfo = false,
        lazyLoad = true,
        cardSize = 'auto'
    } = options;
    
    // Extract movie data
    const movieName = movie.name || movie.title || 'Unknown';
    const movieYear = movie.year || '';
    const movieLogo = movie.logo || movie.poster || movie['video-audio1'] || '';
    const movieInfo = movie.info || movie.quality || '';
    const isVip = movie.vip || false;
    const isHd = movie.hd || true;
    const isNew = movie.new || false;
    
    // Generate watch URL with correct parameters for watch.js
    const movieFile = movie['video-audio1'] || movie.file || movie.url;
    const movieDescription = movie.description || movie.info || '';
    const movieCategory = movie.category || '';
    
    // ใช้ absolute path เพื่อป้องกันปัญหา pages/pages/
    const watchUrl = `pages/watch-simple.html?video1=${encodeURIComponent(movieFile)}&name=${encodeURIComponent(movieName)}&year=${movieYear}&description=${encodeURIComponent(movieDescription)}&category=${encodeURIComponent(movieCategory)}&t=${Date.now()}`;
    
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
    
    console.log('🎯 Final URL to use:', finalUrl);
    
    // Determine card width based on screen size
    const cardWidth = getCardWidth(cardSize);
    
    // Generate badges
    let badgesHtml = '';
    if (showBadge) {
        if (isVip) {
            badgesHtml += `<span class="absolute top-2 left-2 bg-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold">VIP</span>`;
        }
        if (isHd) {
            badgesHtml += `<span class="absolute top-2 left-2 bg-blue-600 text-[10px] px-1.5 py-0.5 rounded font-bold">HD</span>`;
        }
        if (isNew) {
            badgesHtml += `<span class="absolute top-2 left-2 bg-green-600 text-[10px] px-1.5 py-0.5 rounded font-bold">NEW</span>`;
        }
    }
    
    // Generate loading attribute
    const loadingAttr = lazyLoad ? 'loading="lazy"' : '';
    
    return `
        <div class="movie-card group relative overflow-hidden rounded-lg bg-gray-900 shadow-lg" onclick="window.location.href='${finalUrl}'">
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
        </div>
    `;
}

// Get card width based on screen size
function getCardWidth(size = 'auto') {
    if (size !== 'auto') {
        return MOVIE_CARDS_CONFIG.indexPage.cardWidths[size] || 110;
    }
    
    // Auto-detect based on screen width
    const width = window.innerWidth;
    if (width >= 1280) return MOVIE_CARDS_CONFIG.indexPage.cardWidths.xl;
    if (width >= 1024) return MOVIE_CARDS_CONFIG.indexPage.cardWidths.lg;
    if (width >= 768) return MOVIE_CARDS_CONFIG.indexPage.cardWidths.md;
    if (width >= 640) return MOVIE_CARDS_CONFIG.indexPage.cardWidths.sm;
    return MOVIE_CARDS_CONFIG.indexPage.cardWidths.mobile;
}

// [TAG: โครงสร้างที่ถูกต้องเพื่อให้หัวข้ออยู่ด้านบนและรูปอยู่ด้านล่าง]
function createMovieRow({ title, movies, categoryKey, options = {} }) {
    // ตรวจสอบว่ามี movies หรือไม่
    if (!movies || !Array.isArray(movies)) {
        console.warn('No movies provided for createMovieRow:', { title, movies, categoryKey });
        return '';
    }
    
    const limitedMovies = movies.slice(0, 10);
    const cardsHtml = limitedMovies.map(movie => createMovieCard(movie, options)).join('');
    const categoryId = `row-${categoryKey || Date.now()}`;
    
    return `
    <section class="netflix-row mb-8 px-4" id="${categoryId}">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg md:text-xl font-bold text-white border-l-4 border-blue-600 pl-3">
                ${title}
            </h2>
            ${categoryKey ? `<a href="pages/category.html?cat=${categoryKey}" class="text-gray-400 hover:text-white text-sm transition">
                ดูทั้งหมด ›
            </a>` : ''}
        </div>

        <div class="relative group">
            <div class="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide scroll-smooth" id="${categoryId}-container">
                ${cardsHtml}
            </div>
            
            <button onclick="scrollRow('${categoryId}-container', 'left')" class="absolute left-0 top-0 bottom-4 w-10 bg-black/60 opacity-0 group-hover:opacity-100 transition z-10 flex items-center justify-center text-white">‹</button>
            <button onclick="scrollRow('${categoryId}-container', 'right')" class="absolute right-0 top-0 bottom-4 w-10 bg-black/60 opacity-0 group-hover:opacity-100 transition z-10 flex items-center justify-center text-white">›</button>
        </div>
    </section>
    `;
}

// Scroll row left or right
function scrollRow(containerId, direction) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scrollAmount = 250; // Adjust based on card width + gap
    const currentScroll = container.scrollLeft;
    
    if (direction === 'left') {
        container.scrollTo({
            left: Math.max(0, currentScroll - scrollAmount),
            behavior: 'smooth'
        });
    } else {
        container.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
        });
    }
    
    // Update arrow states
    updateRowArrows(containerId);
}

// Update row arrow states
function updateRowArrows(containerId) {
    const container = document.getElementById(containerId);
    const row = container.closest('.netflix-row');
    const leftArrow = row.querySelector('.netflix-row-arrow:first-child');
    const rightArrow = row.querySelector('.netflix-row-arrow:last-child');
    
    // Disable left arrow if at start
    leftArrow.disabled = container.scrollLeft <= 0;
    
    // Disable right arrow if at end
    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
    rightArrow.disabled = isAtEnd;
}

// Create Movie Grid (Category Page)
function createMovieGrid(movies, currentPage = 1, itemsPerPage = 24) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMovies = movies.slice(startIndex, endIndex);
    
    const cardsHtml = paginatedMovies.map(movie => createMovieCard(movie, { 
        showInfo: true,
        cardSize: 'auto'
    })).join('');
    
    return `
        <div class="movie-grid">
            ${cardsHtml}
        </div>
    `;
}

// Create Pagination
function createPagination(currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) return '';
    
    let paginationHtml = '<div class="pagination-container">';
    
    // Previous button
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    paginationHtml += `
        <button class="pagination-btn" onclick="changePage(${currentPage - 1})" ${prevDisabled}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
        </button>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHtml += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHtml += `<span class="pagination-info">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHtml += `<button class="pagination-btn ${activeClass}" onclick="changePage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHtml += `<span class="pagination-info">...</span>`;
        }
        paginationHtml += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    paginationHtml += `
        <button class="pagination-btn" onclick="changePage(${currentPage + 1})" ${nextDisabled}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        </button>
    `;
    
    paginationHtml += '</div>';
    return paginationHtml;
}

// Create Items Per Page Selector
function createItemsPerPageSelector(currentItemsPerPage, onItemsPerPageChange) {
    const options = MOVIE_CARDS_CONFIG.categoryPage.paginationOptions;
    
    let selectorHtml = `
        <div class="items-per-page-container">
            <span class="items-per-page-label">แสดง:</span>
            <select class="items-per-page-select" onchange="changeItemsPerPage(this.value)">
    `;
    
    options.forEach(option => {
        const selected = option === currentItemsPerPage ? 'selected' : '';
        selectorHtml += `<option value="${option}" ${selected}>${option} รายการ</option>`;
    });
    
    selectorHtml += `
            </select>
            <span class="items-per-page-label" id="total-items">ทั้งหมด: 0 รายการ</span>
        </div>
    `;
    
    return selectorHtml;
}

// Create Loading State
function createLoadingState(type = 'grid') {
    if (type === 'row') {
        return `
            <div class="netflix-row">
                <div class="flex items-center justify-between px-4 mb-4">
                    <h2 class="text-xl font-bold text-white">กำลังโหลด...</h2>
                </div>
                <div class="netflix-row-container">
                    ${Array(5).fill().map(() => `
                        <div class="movie-card-skeleton" style="width: 150px;"></div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        return `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">กำลังโหลดหนัง...</p>
            </div>
        `;
    }
}

// Create Error State
function createErrorState(message = 'เกิดข้อผิดพลาดในการโหลดข้อมูล', onRetry) {
    return `
        <div class="error-container">
            <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 class="error-title">ไม่สามารถโหลดข้อมูลได้</h3>
            <p class="error-message">${message}</p>
            <button class="error-retry-btn" onclick="${onRetry}">ลองใหม่</button>
        </div>
    `;
}

// Create Empty State
function createEmptyState(message = 'ไม่พบหนังที่ค้นหา') {
    return `
        <div class="empty-container">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4"></path>
            </svg>
            <h3 class="empty-title">ไม่พบข้อมูล</h3>
            <p class="empty-message">${message}</p>
        </div>
    `;
}

// Initialize movie cards functionality
function initializeMovieCards() {
    // Add scroll event listeners for horizontal rows
    document.querySelectorAll('.netflix-row-container').forEach(container => {
        container.addEventListener('scroll', () => {
            updateRowArrows(container.id);
        });
        
        // Initialize arrow states
        updateRowArrows(container.id);
    });
    
    // Add keyboard navigation for movie cards
    document.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('movie-card')) {
            handleCardKeyboardNavigation(e);
        }
    });
}

// Handle keyboard navigation for movie cards
function handleCardKeyboardNavigation(e) {
    const currentCard = e.target;
    const row = currentCard.closest('.netflix-row-container') || currentCard.closest('.movie-grid');
    
    if (!row) return;
    
    let nextCard = null;
    
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            nextCard = currentCard.previousElementSibling;
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextCard = currentCard.nextElementSibling;
            break;
        case 'ArrowUp':
            e.preventDefault();
            // Handle grid navigation up
            if (row.classList.contains('movie-grid')) {
                const cards = Array.from(row.children);
                const currentIndex = cards.indexOf(currentCard);
                const columns = getGridColumns();
                const prevIndex = currentIndex - columns;
                if (prevIndex >= 0) {
                    nextCard = cards[prevIndex];
                }
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            // Handle grid navigation down
            if (row.classList.contains('movie-grid')) {
                const cards = Array.from(row.children);
                const currentIndex = cards.indexOf(currentCard);
                const columns = getGridColumns();
                const nextIndex = currentIndex + columns;
                if (nextIndex < cards.length) {
                    nextCard = cards[nextIndex];
                }
            }
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            currentCard.querySelector('a').click();
            return;
    }
    
    if (nextCard) {
        nextCard.focus();
    }
}

// Get current grid columns based on screen size
function getGridColumns() {
    const width = window.innerWidth;
    if (width >= 1280) return 8;
    if (width >= 1024) return 6;
    if (width >= 768) return 4;
    if (width >= 640) return 3;
    return 2;
}

// Global functions for onclick handlers
window.changePage = function(page) {
    if (typeof window.onPageChange === 'function') {
        window.onPageChange(page);
    }
};

window.changeItemsPerPage = function(itemsPerPage) {
    if (typeof window.onItemsPerPageChange === 'function') {
        window.onItemsPerPageChange(parseInt(itemsPerPage));
    }
};

window.scrollRow = scrollRow;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initializeMovieCards);

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createMovieCard,
        createMovieRow,
        createMovieGrid,
        createPagination,
        createItemsPerPageSelector,
        createLoadingState,
        createErrorState,
        createEmptyState,
        MOVIE_CARDS_CONFIG
    };
}

// [TAG: Index Page Functions]
// โหลดหนังแนะนำ (Featured Movies)
function loadFeaturedMovies() {
    const container = document.getElementById('movie-sections-container');
    if (!container) {
        console.error('Movie sections container not found');
        return;
    }

    // ดึงหนังจากหมวดหมู่ต่างๆมาเป็น featured
    const thaiMovies = (window.thai || []).slice(0, 3);
    const koreaMovies = (window.korea || []).slice(0, 3);
    const interMovies = (window.inter || []).slice(0, 2);
    const cartoonMovies = (window.cartoon || []).slice(0, 2);
    
    const featuredMovies = [...thaiMovies, ...koreaMovies, ...interMovies, ...cartoonMovies];

    if (featuredMovies.length === 0) {
        console.warn('No movies found for featured section');
        return;
    }

    // สร้าง Featured Section
    const featuredSection = createMovieRow({
        title: '🔥 แนะนำสำหรับคุณ',
        movies: featuredMovies,
        categoryKey: null, // ไม่มีหมวดหมู่สำหรับ featured
        options: {
            showBadge: true,
            showInfo: false,
            lazyLoad: true,
            cardSize: 'featured'
        }
    });

    container.insertAdjacentHTML('beforeend', featuredSection);
}

// โหลดหมวดหมู่หนัง
function loadMovieRows(categories) {
    const container = document.getElementById('movie-sections-container');
    if (!container) {
        console.error('Movie sections container not found');
        return;
    }

    categories.forEach(({ category, title, limit = 8 }) => {
        // ตรวจสอบว่ามีข้อมูลหนังหรือไม่
        const movieData = window[category] || [];
        const movies = movieData.slice(0, limit);

        if (movies.length === 0) {
            console.warn(`No movies found for category: ${category}`);
            return;
        }

        // สร้าง Movie Row
        const movieRow = createMovieRow({
            title: title,
            movies: movies,
            options: {
                showBadge: true,
                showInfo: false,
                lazyLoad: true,
                cardSize: 'auto'
            }
        });

        container.insertAdjacentHTML('beforeend', movieRow);
    });
}

// ให้ฟังก์ชันสามารถเรียกใช้จากภายนอกได้
window.loadFeaturedMovies = loadFeaturedMovies;
window.loadMovieRows = loadMovieRows;
