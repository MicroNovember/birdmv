// Menu functionality for desktop/mobile switching

// Toggle mobile search overlay
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

// Toggle mobile categories overlay
function toggleMobileCategories() {
    const overlay = document.getElementById('mobile-categories-overlay');
    if (overlay) {
        // Use proper class toggle for show/hide
        if (overlay.classList.contains('hidden')) {
            overlay.classList.remove('hidden');
            overlay.classList.add('show');
            // Add animation class
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
        } else {
            overlay.classList.remove('show');
            overlay.style.opacity = '0';
            // Hide after transition
            setTimeout(() => {
                overlay.classList.add('hidden');
            }, 300);
        }
    }
}

// Set active menu item based on current page
function setActiveMenuItem() {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    
    // Get all navigation links from both desktop and mobile
    const navLinks = document.querySelectorAll('aside a, .mobile-bottom-nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkPath = href.split('?')[0];
        const linkSearch = href.includes('?') ? '?' + href.split('?')[1] : '';
        
        // Remove active classes
        link.classList.remove('nav-active', 'text-blue-400', 'bg-white/10');
        link.classList.add('nav-inactive', 'text-gray-400');
        
        // Check if this is the active page
        if (currentPath.endsWith(linkPath)) {
            if (linkSearch && currentSearch) {
                // Both have search parameters, check if they match
                if (linkSearch === currentSearch) {
                    link.classList.remove('nav-inactive', 'text-gray-400');
                    link.classList.add('nav-active', 'text-blue-400');
                    // For desktop sidebar, add background
                    if (link.closest('aside')) {
                        link.classList.add('bg-white/10');
                    }
                }
            } else if (!linkSearch && !currentSearch) {
                // Both have no search parameters
                link.classList.remove('nav-inactive', 'text-gray-400');
                link.classList.add('nav-active', 'text-blue-400');
                // For desktop sidebar, add background
                if (link.closest('aside')) {
                    link.classList.add('bg-white/10');
                }
            }
        }
    });
    
    // Special handling for VIP links
    const vipLinks = document.querySelectorAll('a[href*="erotic"]');
    vipLinks.forEach(link => {
        link.classList.add('nav-vip');
        if (link.classList.contains('nav-active')) {
            link.style.backgroundColor = '#6b7280';
        }
    });
}

// Initialize menu when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setActiveMenuItem();
    
    // Handle window resize for menu switching
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            setActiveMenuItem();
        }, 250);
    });
    
    // Close mobile search when clicking outside
    document.addEventListener('click', function(event) {
        const searchOverlay = document.getElementById('mobile-search-overlay');
        const categoriesOverlay = document.getElementById('mobile-categories-overlay');
        const searchButton = event.target.closest('button[onclick="toggleSearch()"]');
        const categoriesButton = event.target.closest('button[onclick="toggleMobileCategories()"]');
        const searchOverlayElement = event.target.closest('#mobile-search-overlay');
        const categoriesOverlayElement = event.target.closest('#mobile-categories-overlay');
        
        // Close search overlay
        if (searchOverlay && !searchOverlay.classList.contains('hidden') && 
            !searchButton && !searchOverlayElement) {
            searchOverlay.style.opacity = '0';
            setTimeout(() => {
                searchOverlay.classList.add('hidden');
            }, 300);
        }
        
        // Close categories overlay
        if (categoriesOverlay && !categoriesOverlay.classList.contains('hidden') && 
            !categoriesButton && !categoriesOverlayElement) {
            categoriesOverlay.classList.remove('show');
            categoriesOverlay.style.opacity = '0';
            setTimeout(() => {
                categoriesOverlay.classList.add('hidden');
            }, 300);
        }
    });
    
    // Handle escape key to close overlays
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const searchOverlay = document.getElementById('mobile-search-overlay');
            const categoriesOverlay = document.getElementById('mobile-categories-overlay');
            
            if (searchOverlay && !searchOverlay.classList.contains('hidden')) {
                searchOverlay.style.opacity = '0';
                setTimeout(() => {
                    searchOverlay.classList.add('hidden');
                }, 300);
            }
            
            if (categoriesOverlay && !categoriesOverlay.classList.contains('hidden')) {
                categoriesOverlay.classList.remove('show');
                categoriesOverlay.style.opacity = '0';
                setTimeout(() => {
                    categoriesOverlay.classList.add('hidden');
                }, 300);
            }
        }
    });
    
    // Initialize mobile search listeners
    const mobileSearchInput = document.getElementById('mobile-search-input');
    if (mobileSearchInput) {
        let searchTimeout;
        
        mobileSearchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    mobileSearchMovies();
                }, 300);
            } else if (query.length === 0) {
                const searchResult = document.getElementById('mobile-search-result-grid');
                if (searchResult) {
                    searchResult.innerHTML = '<p class="text-gray-400 text-center col-span-full">กรุณาพิมพ์เพื่อค้นหาหนัง</p>';
                }
            }
        });
        
        mobileSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                mobileSearchMovies();
            }
        });
    }
    
    // Initialize search system if available
    if (typeof initializeSearchSystem === 'function') {
        initializeSearchSystem();
    }
});

// Mobile search functionality
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
    
    // Fallback to desktop search
    if (typeof searchMovies === 'function') {
        // Temporarily set the desktop search input value
        const desktopInput = document.getElementById('search-input');
        const originalValue = desktopInput ? desktopInput.value : '';
        
        if (desktopInput) {
            desktopInput.value = query;
            searchMovies();
            
            // Copy results to mobile search
            const movieGrid = document.getElementById('movie-list-grid');
            if (movieGrid) {
                searchResult.innerHTML = movieGrid.innerHTML;
            }
            
            // Restore original value
            desktopInput.value = originalValue;
        }
    } else {
        searchResult.innerHTML = '<p class="text-gray-400 text-center col-span-full">ฟังก์ชันค้นหาไม่พร้อมใช้งาน</p>';
    }
}
