// VIP Authentication System with Firebase Fallback
class VipAuth {
    constructor() {
        this.db = window.db;
        this.isFirebaseAvailable = this.checkFirebaseAvailability();
        this.isPageLoad = true;
        this.init();
    }

    // Check if Firebase is available
    checkFirebaseAvailability() {
        try {
            const isAvailable = !!(window.db && window.firebase && window.firebase.firestore);
            if (isAvailable) {
                console.log('✅ Firebase is available - Using online VIP mode');
            } else {
                console.log('❌ Firebase not available - VIP login unavailable');
            }
            return isAvailable;
        } catch (error) {
            console.warn('⚠️ Firebase check failed:', error);
            return false;
        }
    }

    init() {
        this.setupVipInputs();
        this.checkVipStatus();
        this.setupVipLinks();
        this.checkVipButtons();
    }

    // Setup VIP input fields
    setupVipInputs() {
        const inputs = document.querySelectorAll('.vip-input');
        
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                
                // Only allow numbers
                if (!/^\d*$/.test(value)) {
                    e.target.value = '';
                    return;
                }
                
                // Move to next input
                if (value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                // Handle backspace
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
                
                // Handle enter
                if (e.key === 'Enter' && index === inputs.length - 1) {
                    this.verifyVipCode();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text');
                const numbers = pastedData.replace(/\D/g, '').slice(0, 4);
                
                numbers.split('').forEach((num, i) => {
                    if (inputs[i]) {
                        inputs[i].value = num;
                    }
                });
                
                if (numbers.length === 4) {
                    this.verifyVipCode();
                }
            });
        });
    }

    // Check VIP status
    async checkVipStatus() {
        const vipData = localStorage.getItem('vip_access');
        
        if (vipData) {
            const data = JSON.parse(vipData);
            
            // Check if VIP is still valid
            if (data.expires && new Date(data.expires) > new Date()) {
                // VIP is valid
                this.enableVipMode();
            } else {
                // VIP expired
                localStorage.removeItem('vip_access');
                this.disableVipMode();
            }
        } else {
            // No VIP data
            this.disableVipMode();
        }
    }

    // Setup VIP links to show modal
    setupVipLinks() {
        const vipLinks = document.querySelectorAll('a[href*="erotic"]');
        
        vipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showVipModal();
            });
        });
    }

    // Show VIP modal
    showVipModal() {
        console.log('🔍 showVipModal called');
        console.log('🔍 Alert2 available:', typeof Alert2);
        console.log('🔍 Alert2.vipLogin available:', typeof Alert2?.vipLogin);
        
        // Use Alert2 VIP Login Modal instead of HTML modal
        if (typeof Alert2 !== 'undefined' && typeof Alert2.vipLogin === 'function') {
            console.log('✅ Calling Alert2.vipLogin()');
            Alert2.vipLogin().then((result) => {
                console.log('🔍 Alert2.vipLogin returned result:', result);
                console.log('🔍 Result type:', typeof result);
                console.log('🔍 Result.value:', result.value);
                
                // SweetAlert2 returns an object with .value property
                const code = result.value || result;
                console.log('🔍 Extracted code:', code);
                console.log('🔍 Code type:', typeof code);
                
                if (code && typeof code === 'string') {
                    this.verifyVipCode(code);
                } else {
                    console.error('❌ Invalid code format:', code);
                    Alert2.error('เกิดข้อผิดพลาด', 'รูปแบบรหัสไม่ถูกต้อง กรุณาลองใหม่');
                }
            }).catch((error) => {
                console.error('❌ Alert2.vipLogin error:', error);
                Alert2.error('เกิดข้อผิดพลาด', 'ไม่สามารถเปิดหน้าต่าง VIP กรุณาลองใหม่');
            });
        } else {
            console.error('❌ Alert2 or Alert2.vipLogin not available');
            Alert2.error('เกิดข้อผิดพลาด', 'ระบบ Alert2 ไม่พร้อมใช้งาน กรุณารีเฟรชหน้า');
        }
    }

    // Close VIP modal
    closeVipModal() {
        const modal = document.getElementById('vip-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            this.clearVipInputs();
            this.hideVipError();
        }
    }

    // Clear VIP inputs
    clearVipInputs() {
        const inputs = document.querySelectorAll('.vip-input');
        inputs.forEach(input => {
            input.value = '';
        });
    }

    // Show VIP error
    showVipError(message = 'รหัสไม่ถูกต้อง กรุณาลองใหม่') {
        const errorDiv = document.getElementById('vip-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }

    // Hide VIP error
    hideVipError() {
        const errorDiv = document.getElementById('vip-error');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }

    // Get VIP code from inputs
    getVipCode() {
        const inputs = document.querySelectorAll('.vip-input');
        let code = '';
        
        inputs.forEach(input => {
            code += input.value;
        });
        
        return code;
    }

    // Verify VIP code with fallback
    async verifyVipCode(code) {
        // Check if code is complete
        if (code.length !== 4) {
            await Alert2.error('รหัสไม่ครบถ้วน', 'กรุณาใส่รหัส VIP 4 ตัวให้ครบ');
            return;
        }

        // Only use Firebase verification - no offline mode
        if (this.isFirebaseAvailable) {
            await this.verifyVipCodeFirebase(code);
        } else {
            await Alert2.error('ไม่สามารถเชื่อมต่อระบบ', 'ไม่สามารถเชื่อมต่อระบบ VIP ได้ กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่');
        }
    }

    // Verify VIP code using Firebase
    async verifyVipCodeFirebase(code) {
        try {
            console.log('🔍 verifyVipCodeFirebase called with code:', code);
            console.log('🔍 Firebase db available:', !!this.db);
            
            const vipDoc = await this.db.collection('vip_codes').doc(code).get();
            console.log('🔍 Firebase doc exists:', vipDoc.exists);
            
            if (vipDoc.exists) {
                const vipData = vipDoc.data();
                console.log('🔍 VIP data:', vipData);
                
                // Check if code is active
                if (vipData.is_active === false) {
                    console.log('❌ Code is inactive');
                    await Alert2.error('รหัสถูกระงับ', 'รหัส VIP นี้ถูกระงับการใช้งาน');
                    return;
                }
                
                // Check expiration
                if (vipData.expires && new Date(vipData.expires) < new Date()) {
                    console.log('❌ Code expired');
                    await Alert2.error('รหัสหมดอายุ', 'รหัส VIP นี้หมดอายุแล้ว');
                    return;
                }
                
                // Check usage limit
                if (vipData.max_usage && vipData.usage_count >= vipData.max_usage) {
                    console.log('❌ Usage limit reached');
                    await Alert2.error('รหัสใช้ครบแล้ว', 'รหัส VIP นี้ถูกใช้งานครบแล้ว');
                    return;
                }
                
                console.log('✅ Code validation passed, calling grantVipAccess');
                // Success! Enable VIP mode
                this.grantVipAccess(code, vipData);
                
            } else {
                console.log('❌ Code not found in Firebase');
                await Alert2.error('รหัสไม่ถูกต้อง', 'รหัส VIP ไม่ถูกต้อง กรุณาลองใหม่');
            }
        } catch (error) {
            console.error('❌ Firebase error:', error);
            await Alert2.error('ไม่สามารถเชื่อมต่อระบบได้', 'กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่');
        }
    }

    // Grant VIP access (Firebase version)
    async grantVipAccess(code, vipData) {
        try {
            // Get user IP
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const userIP = ipData.ip;
            
            // Get expiration date
            let expires;
            if (vipData && vipData.expires) {
                if (vipData.expires.toDate) {
                    expires = vipData.expires.toDate();
                } else {
                    expires = new Date(vipData.expires);
                }
                
                if (isNaN(expires.getTime())) {
                    await Alert2.error('วันหมดอายุไม่ถูกต้อง', 'กรุณาติดต่อผู้ดูแลระบบเพื่อแก้ไข');
                    return;
                }
            } else {
                await Alert2.error('รหัสไม่มีวันหมดอายุกำหนด', 'กรุณาติดต่อผู้ดูแลระบบเพื่อแก้ไข');
                return;
            }
            
            // Format expiration date for display
            const formattedDate = expires.toLocaleDateString('th-TH', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Create session ID
            const sessionId = this.generateSessionId();
            
            // Save to localStorage
            const vipAccess = {
                code: code,
                expires: expires.toISOString(),
                verified: true,
                ip: userIP,
                sessionId: sessionId,
                deviceName: this.getDeviceName(),
                mode: 'firebase'
            };
            localStorage.setItem('vip_access', JSON.stringify(vipAccess));
            
            // Set user type as VIP
            localStorage.setItem('user_type', 'vip');
            
            // Mark as not page load
            this.isPageLoad = false;
            
            // Enable VIP mode
            this.enableVipMode();
            
            // Show success message with expiration date using alert2
            await Alert2.success(
                '🎉 VIP Access Granted!',
                `ยินดีต้อนอน VIP สำเร็จจแล้ว\n\nหมดอายุ: ${formattedDate}\nรหัส: ${code}`
            );
            
        } catch (error) {
            console.error('VIP Access Error:', error);
            await Alert2.error('เกิดข้อผิดพลาด', 'ไม่สามารถเข้าถึงระบบ VIP กรุณาลองใหม่');
        }
    }

    // Enable VIP mode
    enableVipMode() {
        console.log('🚀 Enabling VIP mode...');
        
        // Show VIP categories
        this.showVipCategories();
        
        // Update UI
        this.updateVipStatus(true);
        
        // Toggle buttons
        this.toggleVipButtons(true);
        
        console.log('✅ VIP mode enabled successfully');
    }

    // Disable VIP mode
    disableVipMode() {
        // Hide VIP categories
        this.hideVipCategories();
        
        // Update UI
        this.updateVipStatus(false);
        
        // Toggle buttons
        this.toggleVipButtons(false);
    }

    // Show VIP categories
    showVipCategories() {
        console.log('🔓 Showing VIP categories...');
        
        // Check if user is logged in
        const userType = localStorage.getItem('user_type');
        const isLoggedIn = userType === 'guest' || userType === 'vip';
        
        console.log('User type:', userType);
        console.log('Is logged in:', isLoggedIn);
        
        // For VIP users, we should show categories regardless of login status
        // since VIP authentication is the login method itself
        if (userType === 'vip') {
            console.log('✅ VIP user detected, showing categories');
            
            // Add VIP category links to desktop navigation
            this.addVipCategoryLinks();
            
            // Add VIP category links to mobile navigation
            this.addMobileVipCategoryLinks();
            
            // Show any existing VIP links
            const vipLinks = document.querySelectorAll('a[href*="erotic"], a[href*="temp"]');
            vipLinks.forEach(link => {
                link.style.display = 'flex';
                link.classList.remove('opacity-50', 'pointer-events-none');
            });
            
        } else {
            console.log('❌ Not a VIP user, hiding categories');
            this.hideVipCategories();
        }
    }
    
    // Add VIP category links to desktop navigation
    addVipCategoryLinks() {
        const desktopNav = document.querySelector('.nav-links');
        console.log('🔍 Desktop nav found:', !!desktopNav);
        
        if (desktopNav && !desktopNav.querySelector('.vip-category-link')) {
            // Check if VIP category links already exist (but not the VIP button)
            if (!desktopNav.querySelector('a[href*="temp"]')) {
                console.log('🔍 Adding VIP desktop categories...');
                
                // Determine correct path based on current page location
                const currentPath = window.location.pathname;
                let categoryPath = 'category.html?cat=temp';
                if (currentPath.includes('index.html') || currentPath === '/') {
                    categoryPath = 'pages/category.html?cat=temp';
                }
                
                // Add only ONE VIP category (pointing to temp.js for VIP movies)
                const vipLink = document.createElement('a');
                vipLink.href = categoryPath;
                vipLink.className = 'vip-category-link text-blue-400 hover:text-blue-300 transition';
                vipLink.innerHTML = 'VIP';
                
                desktopNav.appendChild(vipLink);
                
                console.log('✅ Added VIP category link to desktop navigation');
            } else {
                console.log('🔍 VIP desktop category already exist');
            }
        } else {
            console.log('🔍 Desktop nav not found or VIP category already exist');
        }
    }
    
    // Add VIP category links to mobile navigation
    addMobileVipCategoryLinks() {
        const mobileCategoriesGrid = document.querySelector('.categories-grid');
        console.log('🔍 Mobile categories grid found:', !!mobileCategoriesGrid);
        
        if (mobileCategoriesGrid && !mobileCategoriesGrid.querySelector('.vip-mobile-category')) {
            // Check if VIP mobile categories already exist
            if (!mobileCategoriesGrid.querySelector('a[href*="temp"]')) {
                console.log('🔍 Adding VIP mobile categories...');
                
                // Determine correct path based on current page location
                const currentPath = window.location.pathname;
                let categoryPath;
                
                if (currentPath.includes('/pages/')) {
                    // We're already in pages directory, use relative path
                    categoryPath = 'category.html?cat=temp';
                } else {
                    // We're in root directory, use pages/ prefix
                    categoryPath = 'pages/category.html?cat=temp';
                }
                
                // Add only ONE VIP mobile category (blue/silver theme)
                const vipMobile = document.createElement('a');
                vipMobile.href = categoryPath;
                vipMobile.className = 'vip-mobile-category category-item';
                vipMobile.innerHTML = `
                    <div class="category-icon" style="background: linear-gradient(135deg, #3b82f6, #94a3b8);">
                        <span>👑</span>
                    </div>
                    <span class="category-name" style="color: #3b82f6;">VIP</span>
                `;
                
                mobileCategoriesGrid.appendChild(vipMobile);
                
                console.log('✅ Added VIP category link to mobile navigation');
            } else {
                console.log('🔍 VIP mobile category already exist');
            }
        } else {
            console.log('🔍 Mobile categories grid not found or VIP category already exist');
            
            // Try to find alternative mobile navigation
            const mobileNav = document.querySelector('.mobile-bottom-nav');
            if (mobileNav) {
                console.log('🔍 Found mobile bottom nav, trying to add VIP link');
                // Add VIP link to mobile bottom nav if needed
            }
        }
    }

    // Hide VIP categories
    hideVipCategories() {
        console.log('🔒 Hiding VIP categories...');
        
        // Hide and remove VIP category links from desktop navigation
        const desktopVipLinks = document.querySelectorAll('.vip-category-link');
        desktopVipLinks.forEach(link => {
            link.remove();
        });
        
        // Hide and remove VIP category links from mobile navigation
        const mobileVipLinks = document.querySelectorAll('.vip-mobile-category');
        mobileVipLinks.forEach(link => {
            link.remove();
        });
        
        // Hide any existing VIP links with erotic/temp href
        const vipLinks = document.querySelectorAll('a[href*="erotic"], a[href*="temp"]');
        vipLinks.forEach(link => {
            if (!link.closest('.mobile-bottom-nav')) {
                link.style.display = 'none';
            }
        });
        
        console.log('✅ VIP categories hidden');
    }

    // Update VIP status in UI
    updateVipStatus(isVip) {
        // VIP MODE indicator removed - no longer showing "👑 VIP MODE (FIREBASE)"
        // This function now only handles internal status tracking
    }

    // Show success message
    showSuccessMessage(message = '✅ VIP Access Granted! Welcome to VIP Mode') {
        const existingMessage = document.querySelector('.vip-success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'vip-success-message fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[80] transition-all duration-500';
        messageDiv.innerHTML = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 500);
        }, 3000);
    }

    // Check VIP buttons on page load
    checkVipButtons() {
        const vipData = localStorage.getItem('vip_access');
        const isVip = vipData && JSON.parse(vipData).expires && new Date(JSON.parse(vipData).expires) > new Date();
        this.toggleVipButtons(isVip);
    }

    // Toggle VIP buttons
    toggleVipButtons(isVip) {
        // Desktop buttons
        const loginBtn = document.getElementById('vip-login-btn');
        const logoutBtn = document.getElementById('vip-logout-btn');
        
        // Desktop VIP buttons
        const desktopVipLoginBtn = document.querySelector('.vip-button:not(#desktop-vip-logout-btn)');
        const desktopVipLogoutBtn = document.getElementById('desktop-vip-logout-btn');
        
        // Mobile buttons
        const mobileLoginBtn = document.getElementById('mobile-vip-login-btn');
        const mobileLogoutBtn = document.getElementById('mobile-vip-logout-btn');
        
        // Update original VIP button to show expiration
        this.updateVipButtonWithExpiration(isVip);
        
        // Toggle desktop VIP buttons
        if (desktopVipLoginBtn && desktopVipLogoutBtn) {
            if (isVip) {
                desktopVipLoginBtn.classList.add('hidden');
                desktopVipLogoutBtn.classList.remove('hidden');
            } else {
                desktopVipLoginBtn.classList.remove('hidden');
                desktopVipLogoutBtn.classList.add('hidden');
            }
        }
        
        // Toggle desktop buttons (if they exist)
        if (loginBtn && logoutBtn) {
            if (isVip) {
                loginBtn.classList.add('hidden');
                logoutBtn.classList.remove('hidden');
            } else {
                loginBtn.classList.remove('hidden');
                logoutBtn.classList.add('hidden');
            }
        }
        
        // Toggle mobile buttons
        if (mobileLoginBtn && mobileLogoutBtn) {
            if (isVip) {
                mobileLoginBtn.classList.add('hidden');
                mobileLogoutBtn.classList.remove('hidden');
            } else {
                mobileLoginBtn.classList.remove('hidden');
                mobileLogoutBtn.classList.add('hidden');
            }
        }
    }
    
    // Update VIP button with expiration date
    updateVipButtonWithExpiration(isVip) {
        const vipButton = document.querySelector('.vip-button');
        if (vipButton) {
            if (isVip) {
                const vipData = localStorage.getItem('vip_access');
                if (vipData) {
                    try {
                        const data = JSON.parse(vipData);
                        if (data.expires) {
                            const expires = new Date(data.expires);
                            const formattedDate = expires.toLocaleDateString('th-TH', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            });
                            vipButton.innerHTML = `VIP (${formattedDate})`;
                            vipButton.style.background = 'linear-gradient(135deg, #3b82f6, #94a3b8)';
                            vipButton.onclick = () => this.showVipInfo();
                        } else {
                            vipButton.innerHTML = 'VIP';
                            vipButton.onclick = () => showVipModal();
                        }
                    } catch (error) {
                        vipButton.innerHTML = 'VIP';
                        vipButton.onclick = () => showVipModal();
                    }
                }
            } else {
                vipButton.innerHTML = 'VIP';
                vipButton.style.background = '';
                vipButton.onclick = () => showVipModal();
            }
        }
    }
    
    // Show VIP info modal
    showVipInfo() {
        const vipData = localStorage.getItem('vip_access');
        if (vipData) {
            try {
                const data = JSON.parse(vipData);
                const expires = new Date(data.expires);
                const formattedDate = expires.toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // Show success message with expiration info
                this.showSuccessMessage(`👑 VIP Active until: ${formattedDate}`);
            } catch (error) {
                this.showSuccessMessage('👑 VIP Active');
            }
        }
    }

    // Generate session ID
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    // Get device name
    getDeviceName() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
            return 'Mobile Device';
        } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
            return 'Tablet';
        } else {
            return 'Desktop';
        }
    }
    
    // Logout VIP
    async logoutVip() {
        const vipData = localStorage.getItem('vip_access');
        
        if (vipData) {
            try {
                const data = JSON.parse(vipData);
                let expirationInfo = '';
                
                if (data.expires) {
                    const expires = new Date(data.expires);
                    const formattedDate = expires.toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    expirationInfo = `หมดอายุ: ${formattedDate}`;
                }
                
                // Show confirmation dialog with alert2
                const result = await Alert2.confirm(
                    'ยืนยันการ Logout VIP',
                    `คุณต้องการ logout จากระบบ VIP ของคุณ${expirationInfo ? '\n\n' + expirationInfo : ''}`,
                    {
                        confirmButtonText: 'ยืนยัน Logout',
                        cancelButtonText: 'ยกเลิก',
                        confirmButtonColor: '#6b7280',
                        cancelButtonColor: '#4b5563',
                        icon: 'warning'
                    }
                );
                
                if (result.isConfirmed) {
                    // Remove VIP access
                    localStorage.removeItem('vip_access');
                    localStorage.removeItem('user_type');
                    this.disableVipMode();
                    
                    // Show success message
                    await Alert2.success(
                        'Logout VIP สำเร็จจ',
                        'คุณได้ logout จากระบบ VIP เรียบร้อยแล้ว'
                    );
                    
                    // Reload page after logout
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                }
            } catch (error) {
                console.error('Error parsing VIP data:', error);
                await Alert2.error('เกิดข้อผิดพลาด', 'ไม่สามารถอ่านข้อมูล VIP กรุณาลองใหม่');
            }
        } else {
            await Alert2.info('ไม่มีข้อมูล VIP', 'คุณไม่ได้ login VIP อยู่ในระบบ');
        }
    }
}

// Global functions for HTML onclick handlers
function showVipModal() {
    if (window.vipAuth) {
        window.vipAuth.showVipModal();
    }
}

function closeVipModal() {
    if (window.vipAuth) {
        window.vipAuth.closeVipModal();
    }
}

function verifyVipCode() {
    if (window.vipAuth) {
        window.vipAuth.verifyVipCode();
    }
}

function logoutVip() {
    if (window.vipAuth) {
        window.vipAuth.logoutVip();
    }
}

// Initialize VIP Auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vipAuth = new VipAuth();
    
    // Add test function for debugging
    window.testVipMode = function() {
        console.log('🧪 Testing VIP Mode...');
        
        // Test VIP categories
        console.log('📱 Testing VIP categories...');
        const desktopNav = document.querySelector('.nav-links');
        const mobileGrid = document.querySelector('.categories-grid');
        
        console.log('Desktop nav found:', !!desktopNav);
        console.log('Mobile grid found:', !!mobileGrid);
        
        const vipLinks = document.querySelectorAll('a[href*="erotic"], a[href*="temp"]');
        console.log('VIP links found:', vipLinks.length);
        
        // Force test VIP mode
        if (window.vipAuth) {
            console.log('🔧 Force testing VIP mode...');
            window.vipAuth.showVipCategories();
            window.vipAuth.toggleVipButtons(true);
            window.vipAuth.updateVipStatus(true);
        }
        
        if (!window.vipAuth.isFirebaseAvailable) {
            console.log('⚠️ Firebase is not available. VIP system is in secure offline mode.');
            console.log('📝 Note: No hardcoded VIP codes in production for security reasons.');
        } else {
            console.log('✅ Firebase is available. VIP system is fully functional.');
        }
        
        // Manual trigger for testing
        console.log('🔧 Manual test: run window.vipAuth.showVipCategories() to test category display');
    };
    
    // Auto-run test in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            console.log('🔧 Development mode detected. Run testVipMode() in console to test VIP system.');
        }, 2000);
    }
});
