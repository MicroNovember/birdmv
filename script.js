// SAMORN Flix JavaScript - Clean Version
// Netflix Edition with Proper Pagination & Mobile Support

// Constants
const ITEMS_PER_PAGE = 24;
let allMovies = [];
let filteredMovies = [];
let currentPage = 1;
let isLoading = false;

// DOM Elements
const moviesContainer = document.getElementById('moviesContainer');
const paginationContainer = document.getElementById('paginationContainer');
const searchInput = document.getElementById('searchInput');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 SAMORN Flix initializing...');
    
    // Start app directly (no age verification)
    initializeApp();
    
    console.log('✅ SAMORN Flix initialized');
});

function initializeApp() {
    // Check DOM elements
    const moviesContainer = document.getElementById('moviesContainer');
    const paginationContainer = document.getElementById('paginationContainer');
    const searchInput = document.getElementById('searchInput');
    
    console.log('📦 DOM elements found:', {
        moviesContainer: !!moviesContainer,
        paginationContainer: !!paginationContainer,
        searchInput: !!searchInput
    });
    
    // Start app
    fetchMovies();
    setupSearch();
    setupHeaderScroll();
    
    console.log('✅ SAMORN Flix app started');
}

// Fetch all movies from JSON
async function fetchMovies() {
    if (isLoading) return;
    
    isLoading = true;
    console.log('📦 Starting to fetch movies...');
    
    try {
        // Show loading state
        if (moviesContainer) {
            moviesContainer.innerHTML = `
                <div class="netflix-loading">
                    <div class="loading-spinner"></div>
                    <div>กำลังโหลดข้อมูล...</div>
                    <div class="loading-tips">📦 โหลดหนังทั้งหมดจาก JSON</div>
                </div>
            `;
        } else {
            console.error('❌ moviesContainer not found!');
            return;
        }
        
        // Try localStorage first
        const cachedData = localStorage.getItem('samorn_movies_cache');
        const cacheTimestamp = localStorage.getItem('samorn_movies_cache_timestamp');
        
        if (cachedData && cacheTimestamp) {
            const cacheAge = Date.now() - parseInt(cacheTimestamp);
            const thirtyMinutes = 30 * 60 * 1000;
            
            if (cacheAge < thirtyMinutes) {
                console.log('📦 Using cached movies data');
                const data = JSON.parse(cachedData);
                allMovies = data.movies || [];
                filteredMovies = [...allMovies];
                currentPage = 1;
                console.log(`✅ Loaded ${allMovies.length} movies from cache`);
                renderMovies();
                return;
            }
        }
        
        // Fetch from protected JSON endpoint
        console.log('📦 Loading movies from JSON...');
        const response = await fetch('/movies.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 JSON response received:', data);
        
        // Check if data is protected
        if (data._protected) {
            console.log('🔒 Protected JSON data received');
            allMovies = data.movies || [];
        } else {
            console.log('📦 Regular JSON data received');
            allMovies = data.movies || [];
        }
        
        filteredMovies = [...allMovies];
        currentPage = 1;
        
        // Cache in localStorage
        localStorage.setItem('samorn_movies_cache', JSON.stringify({ movies: allMovies }));
        localStorage.setItem('samorn_movies_cache_timestamp', Date.now().toString());
        
        console.log(`✅ Loaded ${allMovies.length} movies from JSON`);
        renderMovies();
        
    } catch (error) {
        console.error('❌ Error loading movies:', error);
        if (moviesContainer) {
            moviesContainer.innerHTML = `
                <div class="netflix-error">
                    <div class="error-icon">❌</div>
                    <div>โหลดข้อมูลล้มเหลว</div>
                    <div class="error-message">${error.message}</div>
                    <button class="retry-btn" onclick="fetchMovies()">ลองใหม่</button>
                </div>
            `;
        }
    } finally {
        isLoading = false;
    }
}

// Render movies for current page
function renderMovies() {
    if (!moviesContainer) return;
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageMovies = filteredMovies.slice(startIndex, endIndex);
    
    // Clear container
    moviesContainer.innerHTML = '';
    
    if (pageMovies.length === 0) {
        moviesContainer.innerHTML = `
            <div class="netflix-error">
                <div class="error-icon">🔍</div>
                <div>ไม่พบหนังที่ค้นหา</div>
                <div class="error-message">ลองค้นหาด้วยคำอื่น</div>
            </div>
        `;
        return;
    }
    
    // Create movie cards
    pageMovies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesContainer.appendChild(movieCard);
    });
    
    // Update pagination
    renderPagination();
    updateStats();
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'netflix-card';
    card.onclick = () => openVideoPage(movie);
    
    // Get poster URL - try multiple fields
    let posterUrl = movie.preview || 
                   movie.poster || 
                   movie.image || 
                   movie.thumbnail || 
                   'https://placehold.co/300x450/141414/e50914?text=No+Poster';
    
    // Convert S3 to CloudFront for better performance
    if (posterUrl.includes('s3.ap-southeast-1.amazonaws.com')) {
        posterUrl = posterUrl.replace(
            'https://av24flix.s3.ap-southeast-1.amazonaws.com',
            'https://d1mx0ftvclwh0x.cloudfront.net'
        );
        console.log('🖼️ Converted to CloudFront URL:', posterUrl);
    }
    
    // Get title
    const title = movie.title || movie.name || 'Unknown Title';
    
    // Create card HTML
    card.innerHTML = `
        <img src="${posterUrl}" alt="${escapeHtml(title)}" loading="lazy" 
             onerror="this.src='https://placehold.co/300x450/141414/e50914?text=No+Poster'">
        <div class="netflix-card-overlay">
            <div class="netflix-card-title">${escapeHtml(title)}</div>
        </div>
    `;
    
    return card;
}

// Render pagination controls
function renderPagination() {
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${prevDisabled}>← ก่อนหน้า</button>`;
    
    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Adjust start page if needed
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    // First page and ellipsis
    if (startPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            html += `<span style="color: #666;">...</span>`;
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        html += `<button class="page-btn ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
    }
    
    // Last page and ellipsis
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span style="color: #666;">...</span>`;
        }
        html += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${nextDisabled}>ถัดไป →</button>`;
    
    paginationContainer.innerHTML = html;
}

// Go to specific page
function goToPage(page) {
    const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderMovies();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Filter movies by search term
function filterMoviesBySearch(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        filteredMovies = [...allMovies];
    } else {
        const term = searchTerm.toLowerCase().trim();
        filteredMovies = allMovies.filter(movie => {
            const title = (movie.title || movie.name || '').toLowerCase();
            const description = (movie.description || '').toLowerCase();
            const category = (movie.category || '').toLowerCase();
            
            return title.includes(term) || 
                   description.includes(term) || 
                   category.includes(term);
        });
    }
    
    currentPage = 1;
    renderMovies();
}

// Setup search functionality
function setupSearch() {
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filterMoviesBySearch(e.target.value);
        }, 300);
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterMoviesBySearch(e.target.value);
        }
    });
}

// Update statistics display
function updateStats() {
    const statsElements = document.querySelectorAll('.stats');
    statsElements.forEach(element => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
        const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredMovies.length);
        element.textContent = `แสดง ${startIndex}-${endIndex} จาก ${filteredMovies.length} เรื่อง`;
    });
}

// Open video page
function openVideoPage(movie) {
    // Store movie data in localStorage
    localStorage.setItem('samorn_current_movie', JSON.stringify(movie));
    
    // Use clean URL with just movieId
    const movieId = movie.movieId || movie.id || Date.now();
    const videoUrl = `video.html?movieId=${movieId}`;
    
    // Open in same tab
    window.location.href = videoUrl;
}

// Setup header scroll effect
function setupHeaderScroll() {
    const header = document.querySelector('.netflix-header');
    if (!header) return;
    
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    });
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
    });
}