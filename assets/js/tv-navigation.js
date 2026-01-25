// Android TV & Remote Control Navigation Support
class TVNavigation {
    constructor() {
        this.isTV = this.detectTV();
        this.currentFocusIndex = 0;
        this.focusableElements = [];
        this.hintTimeout = null;
        this.scrollIndicatorTimeout = null;
        
        if (this.isTV) {
            this.initTVNavigation();
        }
    }
    
    detectTV() {
        // Detect TV browsers
        const userAgent = navigator.userAgent.toLowerCase();
        const isTV = /tv|television|tizen|webos|android.*tv|chromecast|roku|fire.*tv/i.test(userAgent);
        const hasBigScreen = window.innerWidth >= 1920 && window.innerHeight >= 1080;
        const hasRemote = 'ontouchstart' in window === false && navigator.maxTouchPoints === 0;
        
        return isTV || (hasBigScreen && hasRemote);
    }
    
    initTVNavigation() {
        console.log('📺 TV Navigation Mode Activated');
        
        // Add TV class to body
        document.body.classList.add('tv-browser');
        
        // Initialize focus management
        this.initFocusManagement();
        
        // Add keyboard navigation
        this.initKeyboardNavigation();
        
        // Add TV hints
        this.showTVHints();
        
        // Optimize performance
        this.optimizeForTV();
        
        // Add scroll indicators
        this.initScrollIndicators();
        
        // Handle TV-specific events
        this.initTVEvents();
    }
    
    initFocusManagement() {
        // Find all focusable elements
        this.updateFocusableElements();
        
        // Set initial focus
        const firstElement = this.focusableElements[0];
        if (firstElement) {
            firstElement.focus();
        }
        
        // Update focusable elements when DOM changes
        const observer = new MutationObserver(() => {
            this.updateFocusableElements();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });
    }
    
    updateFocusableElements() {
        const selector = [
            'button:not([disabled])',
            'a[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '.movie-card',
            '.poster-card',
            '.vip-input'
        ].join(', ');
        
        this.focusableElements = Array.from(document.querySelectorAll(selector))
            .filter(el => {
                // Filter out hidden elements
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0';
            });
    }
    
    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (!this.isTV) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateVertical(-1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateVertical(1);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.navigateHorizontal(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.navigateHorizontal(1);
                    break;
                case 'Enter':
                case 'OK':
                case 'Select':
                    e.preventDefault();
                    this.activateCurrentElement();
                    break;
                case 'Back':
                case 'Escape':
                    e.preventDefault();
                    this.goBack();
                    break;
                case 'MediaPlayPause':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'MediaFastForward':
                    e.preventDefault();
                    this.fastForward();
                    break;
                case 'MediaRewind':
                    e.preventDefault();
                    this.rewind();
                    break;
            }
        });
    }
    
    navigateVertical(direction) {
        const currentElement = document.activeElement;
        if (!currentElement) return;
        
        const currentIndex = this.focusableElements.indexOf(currentElement);
        if (currentIndex === -1) return;
        
        const currentRect = currentElement.getBoundingClientRect();
        let bestElement = null;
        let bestDistance = Infinity;
        
        this.focusableElements.forEach((element, index) => {
            if (index === currentIndex) return;
            
            const rect = element.getBoundingClientRect();
            const isVertical = direction < 0 ? 
                rect.top < currentRect.top - 10 : 
                rect.top > currentRect.top + 10;
            
            if (isVertical) {
                const horizontalOverlap = Math.max(0, 
                    Math.min(currentRect.right, rect.right) - 
                    Math.max(currentRect.left, rect.left)
                );
                
                const verticalDistance = Math.abs(rect.top - currentRect.top);
                const horizontalDistance = Math.max(0, 
                    Math.min(currentRect.left, rect.left) - 
                    Math.max(currentRect.right, rect.right)
                );
                
                const distance = verticalDistance + horizontalDistance * 2;
                
                if (distance < bestDistance && horizontalOverlap > 0) {
                    bestDistance = distance;
                    bestElement = element;
                }
            }
        });
        
        if (bestElement) {
            bestElement.focus();
            this.scrollToElement(bestElement);
        }
    }
    
    navigateHorizontal(direction) {
        const currentElement = document.activeElement;
        if (!currentElement) return;
        
        const currentIndex = this.focusableElements.indexOf(currentElement);
        if (currentIndex === -1) return;
        
        const currentRect = currentElement.getBoundingClientRect();
        let bestElement = null;
        let bestDistance = Infinity;
        
        this.focusableElements.forEach((element, index) => {
            if (index === currentIndex) return;
            
            const rect = element.getBoundingClientRect();
            const isHorizontal = direction < 0 ? 
                rect.left < currentRect.left - 10 : 
                rect.left > currentRect.left + 10;
            
            if (isHorizontal) {
                const verticalOverlap = Math.max(0, 
                    Math.min(currentRect.bottom, rect.bottom) - 
                    Math.max(currentRect.top, rect.top)
                );
                
                const horizontalDistance = Math.abs(rect.left - currentRect.left);
                const verticalDistance = Math.max(0, 
                    Math.min(currentRect.top, rect.top) - 
                    Math.max(currentRect.bottom, rect.bottom)
                );
                
                const distance = horizontalDistance + verticalDistance * 2;
                
                if (distance < bestDistance && verticalOverlap > 0) {
                    bestDistance = distance;
                    bestElement = element;
                }
            }
        });
        
        if (bestElement) {
            bestElement.focus();
            this.scrollToElement(bestElement);
        }
    }
    
    activateCurrentElement() {
        const currentElement = document.activeElement;
        if (currentElement) {
            currentElement.click();
        }
    }
    
    goBack() {
        // Try to close modals first
        const modals = document.querySelectorAll('.modal, [id$="-modal"], [id$="-overlay"]');
        for (const modal of modals) {
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                return;
            }
        }
        
        // Go back in history
        if (window.history.length > 1) {
            window.history.back();
        }
    }
    
    togglePlayPause() {
        const video = document.querySelector('video');
        if (video) {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }
    }
    
    fastForward() {
        const video = document.querySelector('video');
        if (video) {
            video.currentTime += 10;
        }
    }
    
    rewind() {
        const video = document.querySelector('video');
        if (video) {
            video.currentTime -= 10;
        }
    }
    
    scrollToElement(element) {
        const rect = element.getBoundingClientRect();
        const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight;
        
        if (!isInView) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
            
            this.showScrollIndicator();
        }
    }
    
    showTVHints() {
        // Create TV hints element
        const hints = document.createElement('div');
        hints.className = 'tv-hint';
        hints.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">📺 การควบคุมด้วยรีโมท</div>
            <div>↑↓←→ : เลือก</div>
            <div>Enter/OK : ยืนยัน</div>
            <div>Back/Escape : ย้อนกลับ</div>
            <div>Play/Pause : เล่น/หยุด</div>
        `;
        
        document.body.appendChild(hints);
        
        // Auto-hide hints after 10 seconds
        setTimeout(() => {
            hints.style.opacity = '0';
            setTimeout(() => hints.remove(), 500);
        }, 10000);
    }
    
    showScrollIndicator() {
        // Clear existing timeout
        if (this.scrollIndicatorTimeout) {
            clearTimeout(this.scrollIndicatorTimeout);
        }
        
        // Create or update scroll indicator
        let indicator = document.querySelector('.tv-scroll-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'tv-scroll-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = 'กำลังเลื่อน...';
        indicator.style.opacity = '1';
        
        // Hide after 2 seconds
        this.scrollIndicatorTimeout = setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }
    
    optimizeForTV() {
        // Add TV-optimized classes
        const movieCards = document.querySelectorAll('.movie-card, .poster-card');
        movieCards.forEach(card => {
            card.classList.add('tv-movie-card', 'tv-optimized');
        });
        
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.add('tv-button');
        });
        
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.add('tv-search-input');
        });
        
        const modals = document.querySelectorAll('.modal, [id$="-modal"]');
        modals.forEach(modal => {
            modal.classList.add('tv-modal');
        });
        
        // Optimize grid layouts
        const grids = document.querySelectorAll('.grid, .movie-grid');
        grids.forEach(grid => {
            grid.classList.add('tv-grid');
        });
        
        // Add safe area padding
        document.body.classList.add('tv-safe-area');
    }
    
    initTVEvents() {
        // Handle TV-specific events
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause videos when app is hidden
                const videos = document.querySelectorAll('video');
                videos.forEach(video => video.pause());
            }
        });
        
        // Handle orientation changes (some TVs support rotation)
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateFocusableElements();
            }, 100);
        });
        
        // Add touch feedback for touch-enabled TVs
        if ('ontouchstart' in window) {
            document.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element && this.focusableElements.includes(element)) {
                    element.focus();
                }
            });
        }
    }
    
    // Public methods
    setFocus(index) {
        if (index >= 0 && index < this.focusableElements.length) {
            this.focusableElements[index].focus();
            this.currentFocusIndex = index;
        }
    }
    
    getNextFocus(direction = 1) {
        const currentElement = document.activeElement;
        const currentIndex = this.focusableElements.indexOf(currentElement);
        
        if (currentIndex === -1) return 0;
        
        let nextIndex = currentIndex + direction;
        
        // Wrap around
        if (nextIndex >= this.focusableElements.length) {
            nextIndex = 0;
        } else if (nextIndex < 0) {
            nextIndex = this.focusableElements.length - 1;
        }
        
        return nextIndex;
    }
    
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    }
}

// Initialize TV Navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tvNavigation = new TVNavigation();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TVNavigation;
}
