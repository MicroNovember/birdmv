// TV Browser Detection & Optimization
class TVDetection {
    constructor() {
        this.isTV = this.detectTV();
        this.tvType = this.getTVType();
        this.hasRemote = this.detectRemote();
        
        if (this.isTV) {
            this.applyTVOptimizations();
        }
    }
    
    detectTV() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // TV-specific user agent patterns
        const tvPatterns = [
            /tv|television/i,
            /tizen/i,           // Samsung Tizen
            /webos/i,           // LG webOS
            /android.*tv/i,    // Android TV
            /chromecast/i,      // Chromecast
            /roku/i,            // Roku
            /fire.*tv/i,        // Fire TV
            /apple.*tv/i,       // Apple TV
            /nvidia.*shield/i,  // NVIDIA Shield
            /xbox/i,            // Xbox
            /playstation/i,     // PlayStation
            /bravia/i,          // Sony Bravia
            /viera/i,           // Panasonic Viera
            /smart.*tv/i        // Generic Smart TV
        ];
        
        const isTVBrowser = tvPatterns.some(pattern => pattern.test(userAgent));
        
        // Screen size detection (most TVs are 1920x1080 or larger)
        const hasBigScreen = window.innerWidth >= 1280 && window.innerHeight >= 720;
        
        // No touch support (most TVs don't have touch screens)
        const hasNoTouch = 'ontouchstart' in window === false && navigator.maxTouchPoints === 0;
        
        // Pointer detection (TVs usually have coarse pointer)
        const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
        
        return isTVBrowser || (hasBigScreen && hasNoTouch && hasCoarsePointer);
    }
    
    getTVType() {
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (/tizen/i.test(userAgent)) return 'samsung-tizen';
        if (/webos/i.test(userAgent)) return 'lg-webos';
        if (/android.*tv/i.test(userAgent)) return 'android-tv';
        if (/chromecast/i.test(userAgent)) return 'chromecast';
        if (/roku/i.test(userAgent)) return 'roku';
        if (/fire.*tv/i.test(userAgent)) return 'fire-tv';
        if (/apple.*tv/i.test(userAgent)) return 'apple-tv';
        if (/xbox/i.test(userAgent)) return 'xbox';
        if (/playstation/i.test(userAgent)) return 'playstation';
        if (/nvidia.*shield/i.test(userAgent)) return 'nvidia-shield';
        
        return 'unknown-tv';
    }
    
    detectRemote() {
        // Check if device likely has a remote control
        const hasNoTouch = 'ontouchstart' in window === false;
        const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
        const hasKeyboard = navigator.keyboard || navigator.userAgent.includes('TV');
        
        return hasNoTouch && (hasCoarsePointer || hasKeyboard);
    }
    
    applyTVOptimizations() {
        console.log(`📺 TV Detected: ${this.tvType}`);
        console.log(`🎮 Remote Control: ${this.hasRemote ? 'Yes' : 'No'}`);
        
        // Add TV class to body
        document.body.classList.add('tv-browser');
        document.body.classList.add(`tv-${this.tvType}`);
        
        // Apply TV-specific optimizations
        this.optimizeLayout();
        this.optimizePerformance();
        this.setupTVSpecificFeatures();
        this.addTVUserInterface();
    }
    
    optimizeLayout() {
        // Increase font sizes for TV viewing
        document.documentElement.style.fontSize = '18px';
        
        // Increase touch targets for remote control
        const style = document.createElement('style');
        style.textContent = `
            .tv-browser button,
            .tv-browser a,
            .tv-browser input,
            .tv-browser select {
                min-height: 60px !important;
                min-width: 120px !important;
                font-size: 1.2em !important;
                padding: 15px 30px !important;
                margin: 8px !important;
            }
            
            .tv-browser .movie-card,
            .tv-browser .poster-card {
                min-height: 280px !important;
                min-width: 200px !important;
                margin: 10px !important;
            }
            
            .tv-browser .grid {
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
                gap: 20px !important;
                padding: 20px !important;
            }
            
            .tv-browser .modal {
                max-width: 90vw !important;
                max-height: 90vh !important;
            }
            
            .tv-browser .search-input {
                min-height: 50px !important;
                font-size: 1.2em !important;
                padding: 15px !important;
            }
            
            .tv-browser .loading {
                width: 60px !important;
                height: 60px !important;
                border-width: 6px !important;
            }
            
            /* TV-specific responsive design */
            @media (min-width: 1920px) {
                .tv-browser .grid {
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
                }
                
                .tv-browser .movie-card,
                .tv-browser .poster-card {
                    min-height: 350px !important;
                    min-width: 250px !important;
                }
            }
            
            /* Safe area for notched TVs */
            .tv-browser {
                padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
            }
        `;
        document.head.appendChild(style);
    }
    
    optimizePerformance() {
        // Optimize for TV hardware
        const style = document.createElement('style');
        style.textContent = `
            .tv-browser * {
                will-change: transform;
                backface-visibility: hidden;
                perspective: 1000px;
            }
            
            .tv-browser img,
            .tv-browser video {
                transform: translateZ(0);
                -webkit-transform: translateZ(0);
            }
            
            /* Reduce animations for better performance */
            .tv-browser * {
                animation-duration: 0.2s !important;
                transition-duration: 0.2s !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupTVSpecificFeatures() {
        // Add TV-specific event listeners
        this.setupTVKeyboardEvents();
        this.setupTVGestureEvents();
        this.setupTVFocusManagement();
    }
    
    setupTVKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // TV-specific key codes
            const tvKeys = {
                10009: 'Back',      // Android TV Back
                13: 'Enter',        // Enter/OK
                37: 'ArrowLeft',    // Left
                38: 'ArrowUp',      // Up
                39: 'ArrowRight',   // Right
                40: 'ArrowDown',    // Down
                415: 'Play',        // Play
                19: 'Pause',        // Pause
                413: 'Stop',        // Stop
                417: 'FastForward', // Fast Forward
                412: 'Rewind'       // Rewind
            };
            
            const keyName = tvKeys[e.keyCode] || e.key;
            
            // Dispatch custom TV event
            const tvEvent = new CustomEvent('tvkey', {
                detail: { key: keyName, originalEvent: e }
            });
            document.dispatchEvent(tvEvent);
        });
    }
    
    setupTVGestureEvents() {
        // Handle TV-specific gestures (if supported)
        if ('ongesturestart' in window) {
            document.addEventListener('gesturestart', (e) => {
                console.log('TV Gesture detected:', e);
            });
        }
    }
    
    setupTVFocusManagement() {
        // Improve focus management for TV
        let focusTimeout;
        
        document.addEventListener('focusin', (e) => {
            clearTimeout(focusTimeout);
            
            // Add TV focus class
            e.target.classList.add('tv-focus');
            
            // Scroll element into view
            setTimeout(() => {
                e.target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }, 100);
        });
        
        document.addEventListener('focusout', (e) => {
            // Remove TV focus class with delay
            focusTimeout = setTimeout(() => {
                e.target.classList.remove('tv-focus');
            }, 200);
        });
    }
    
    addTVUserInterface() {
        // Add TV-specific UI elements
        this.addTVNavigationHints();
        this.addTVScrollIndicator();
        this.addTVStatusIndicator();
    }
    
    addTVNavigationHints() {
        const hints = document.createElement('div');
        hints.className = 'tv-hint';
        hints.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">📺 การควบคุมด้วยรีโมท</div>
            <div>↑↓←→ : เลือก</div>
            <div>Enter/OK : ยืนยัน</div>
            <div>Back/Escape : ย้อนกลับ</div>
            <div>Play/Pause : เล่น/หยุด</div>
            <div style="margin-top: 10px; font-size: 0.8em;">เคล็ดลับ: ใช้ปุ่มลูกศรเพื่อนำทาง</div>
        `;
        
        document.body.appendChild(hints);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            hints.style.transition = 'opacity 0.5s';
            hints.style.opacity = '0';
            setTimeout(() => hints.remove(), 500);
        }, 10000);
    }
    
    addTVScrollIndicator() {
        let indicator = document.createElement('div');
        indicator.className = 'tv-scroll-indicator';
        indicator.textContent = 'ใช้ปุ่มลูกศรเพื่อเลื่อน';
        indicator.style.opacity = '0';
        
        document.body.appendChild(indicator);
        
        // Show indicator when scrolling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            indicator.style.opacity = '1';
            
            scrollTimeout = setTimeout(() => {
                indicator.style.opacity = '0';
            }, 2000);
        });
    }
    
    addTVStatusIndicator() {
        const status = document.createElement('div');
        status.className = 'tv-status';
        status.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 5px;
            font-size: 0.9em;
            z-index: 1000;
        `;
        status.innerHTML = `📺 ${this.tvType.replace('-', ' ').toUpperCase()}`;
        
        document.body.appendChild(status);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            status.style.transition = 'opacity 0.5s';
            status.style.opacity = '0';
            setTimeout(() => status.remove(), 500);
        }, 5000);
    }
    
    // Public methods
    isTVDevice() {
        return this.isTV;
    }
    
    getTVDeviceInfo() {
        return {
            isTV: this.isTV,
            type: this.tvType,
            hasRemote: this.hasRemote,
            userAgent: navigator.userAgent,
            screen: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
    
    enableTVMode() {
        if (!this.isTV) {
            this.isTV = true;
            this.applyTVOptimizations();
        }
    }
    
    disableTVMode() {
        if (this.isTV) {
            this.isTV = false;
            document.body.classList.remove('tv-browser');
            document.body.classList.remove(`tv-${this.tvType}`);
        }
    }
}

// Initialize TV Detection
document.addEventListener('DOMContentLoaded', () => {
    window.tvDetection = new TVDetection();
    
    // Log TV info for debugging
    console.log('TV Device Info:', window.tvDetection.getTVDeviceInfo());
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TVDetection;
}
