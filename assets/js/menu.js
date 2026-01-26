// Menu functionality for desktop/mobile switching

// Toggle mobile search overlay
function toggleSearch() {
    const overlay = document.getElementById('mobile-search-overlay');
    if (overlay) {
        overlay.classList.toggle('hidden');
        if (!overlay.classList.contains('hidden')) {
            // Focus search input when opened
            const searchInput = document.getElementById('mobile-search-input');
            if (searchInput) {
                setTimeout(() => searchInput.focus(), 100);
            }
        }
    }
}

// Toggle mobile categories overlay
function toggleMobileCategories() {
    const overlay = document.getElementById('mobile-categories-overlay');
    if (overlay) {
        overlay.classList.toggle('hidden');
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
            link.style.backgroundColor = '#dc2626';
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
            searchOverlay.classList.add('hidden');
        }
        
        // Close categories overlay
        if (categoriesOverlay && !categoriesOverlay.classList.contains('hidden') && 
            !categoriesButton && !categoriesOverlayElement) {
            categoriesOverlay.classList.add('hidden');
        }
    });
    
    // Handle escape key to close overlays
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const searchOverlay = document.getElementById('mobile-search-overlay');
            const categoriesOverlay = document.getElementById('mobile-categories-overlay');
            
            if (searchOverlay && !searchOverlay.classList.contains('hidden')) {
                searchOverlay.classList.add('hidden');
            }
            
            if (categoriesOverlay && !categoriesOverlay.classList.contains('hidden')) {
                categoriesOverlay.classList.add('hidden');
            }
        }
    });
});

// Mobile search functionality
function mobileSearchMovies() {
    const searchInput = document.getElementById('mobile-search-input');
    const searchResult = document.getElementById('mobile-search-result');
    
    if (!searchInput || !searchResult) return;
    
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length < 2) {
        searchResult.innerHTML = '<p class="text-gray-400 text-center">กรุณาพิมพ์อย่างน้อย 2 ตัวอักษร</p>';
        return;
    }
    
    // Use the same search function as desktop
    if (typeof searchMovies === 'function') {
        // Temporarily set the desktop search input value
        const desktopInput = document.getElementById('search-input');
        const originalValue = desktopInput ? desktopInput.value : '';
        
        if (desktopInput) {
            desktopInput.value = query;
            searchMovies();
            
            // Copy results to mobile search
            const desktopResults = document.getElementById('search-result-container');
            if (desktopResults) {
                searchResult.innerHTML = desktopResults.innerHTML;
            }
            
            // Restore original value
            desktopInput.value = originalValue;
        }
    } else {
        searchResult.innerHTML = '<p class="text-gray-400 text-center">ฟังก์ชันค้นหาไม่พร้อมใช้งาน</p>';
    }
}
