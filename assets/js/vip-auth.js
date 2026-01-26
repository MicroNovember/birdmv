// VIP Authentication System
class VipAuth {
    constructor() {
        this.db = window.db;
        this.isPageLoad = true;
        this.init();
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
                // Check if session still exists in Firebase (only if Firebase is available)
                if (data.sessionId && this.db) {
                    try {
                        const sessionDoc = await this.db.collection('vip_sessions').doc(data.sessionId).get();
                        if (!sessionDoc.exists) {
                            // Session was removed from Firebase, remove local access
                            localStorage.removeItem('vip_access');
                            this.disableVipMode();
                            return;
                        }
                    } catch (error) {
                        console.error('Error checking session:', error);
                    }
                }
                
                // VIP is valid
                this.enableVipMode();
            } else {
                // VIP expired
                if (data.sessionId && this.db) {
                    await this.removeVipSession(data.sessionId);
                }
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
        const modal = document.getElementById('vip-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Focus first input
            setTimeout(() => {
                const firstInput = document.querySelector('.vip-input');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
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

    // Verify VIP code
    async verifyVipCode() {
        const code = this.getVipCode();
        
        // Check if code is complete
        if (code.length !== 4) {
            this.showVipError('กรุณาใส่รหัสให้ครบ 4 ตัว');
            return;
        }

        try {
            // Check in Firebase
            const vipDoc = await this.db.collection('vip_codes').doc(code).get();
            
            if (vipDoc.exists) {
                const vipData = vipDoc.data();
                
                // Check if code is active
                if (vipData.is_active === false) {
                    this.showVipError('รหัสนี้ถูกระงับการใช้งาน');
                    return;
                }
                
                // Check expiration
                if (vipData.expires && new Date(vipData.expires) < new Date()) {
                    this.showVipError('รหัสนี้หมดอายุแล้ว');
                    return;
                }
                
                // Check usage limit
                if (vipData.max_usage && vipData.usage_count >= vipData.max_usage) {
                    this.showVipError('รหัสนี้ถูกใช้งานครบแล้ว');
                    return;
                }
                
                // Success! Enable VIP mode
                this.grantVipAccess(code, vipData);
                
            } else {
                this.showVipError('รหัสไม่ถูกต้อง กรุณาลองใหม่');
            }
        } catch (error) {
            console.error('Error verifying VIP code:', error);
            this.showVipError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
    }

    // Grant VIP access
    async grantVipAccess(code, vipData) {
        try {
            // Get user IP
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            const userIP = ipData.ip;
            
            // Check existing VIP sessions for this IP
            const existingSessions = await this.checkIPSessions(userIP);
            
            if (existingSessions.length >= 3) {
                this.showVipError('IP นี้ล็อกอิน VIP ครบ 3 อุปกรณ์แล้ว');
                return;
            }
            
            // Get expiration date from Firebase (required)
            let expires;
            if (vipData && vipData.expires) {
                // Use expiration date from Firebase
                expires = new Date(vipData.expires);
            } else {
                // No expiration date provided - reject access
                this.showVipError('รหัสไม่มีวันหมดอายุกำหนด กรุณาติดต่อผู้ดูแลระบบ');
                return;
            }
            
            // Create session ID
            const sessionId = this.generateSessionId();
            
            // Save to localStorage with IP and session ID
            localStorage.setItem('vip_access', JSON.stringify({
                code: code,
                expires: expires.toISOString(),
                verified: true,
                ip: userIP,
                sessionId: sessionId,
                deviceName: this.getDeviceName()
            }));
            
            // Save session to Firebase
            await this.saveVipSession(userIP, sessionId, code, expires);
            
            // Set user type as VIP
            localStorage.setItem('user_type', 'vip');
            
            // Update usage count in Firebase
            this.updateUsageCount(code);
            
            // Mark as not page load (user action)
            this.isPageLoad = false;
            
            // Enable VIP mode
            this.enableVipMode();
            
            // Close modal
            this.closeVipModal();
            
            // Show success message with device count
            const deviceCount = existingSessions.length + 1;
            this.showSuccessMessage(`VIP Access Granted! Device ${deviceCount}/3`);
            
            console.error('VIP Access granted, user_type set to vip');
            
        } catch (error) {
            console.error('VIP Access Error:', error);
            this.showVipError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        }
    }

    // Update usage count in Firebase
    async updateUsageCount(code) {
        try {
            if (!this.db) {
                console.error('Firebase not available, skipping usage count update');
                return;
            }
            
            await this.db.collection('vip_codes').doc(code).update({
                usage_count: firebase.firestore.FieldValue.increment(1),
                last_used: new Date()
            });
        } catch (error) {
            console.error('Error updating usage count:', error);
        }
    }

    // Enable VIP mode
    enableVipMode() {
        // Show VIP categories
        this.showVipCategories();
        
        // Update UI
        this.updateVipStatus(true);
        
        // Toggle buttons
        this.toggleVipButtons(true);
        
        // Reload movies to show VIP category (only if not on page load)
        if (!this.isPageLoad) {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
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
        // Check if user is logged in
        const userType = localStorage.getItem('user_type');
        const isLoggedIn = userType === 'guest' || userType === 'vip';
        
        if (!isLoggedIn) {
            console.error('User not logged in, hiding VIP categories');
            return;
        }
        
        // Show VIP links in sidebar
        const vipLinks = document.querySelectorAll('a[href*="erotic"]');
        vipLinks.forEach(link => {
            link.style.display = 'flex';
            link.classList.remove('opacity-50', 'pointer-events-none');
        });
        
        // Show VIP in mobile nav
        const mobileVip = document.querySelector('a[href*="erotic"].nav-vip');
        if (mobileVip) {
            mobileVip.style.display = 'flex';
        }
        
        // Show VIP in mobile categories
        const mobileVipCategory = document.querySelector('a[href*="erotic"].bg-red-600\\/20');
        if (mobileVipCategory) {
            mobileVipCategory.style.display = 'block';
        }
    }

    // Hide VIP categories
    hideVipCategories() {
        // Hide VIP links in sidebar
        const vipLinks = document.querySelectorAll('a[href*="erotic"]');
        vipLinks.forEach(link => {
            if (!link.closest('.mobile-bottom-nav')) {
                link.style.display = 'none';
            }
        });
        
        // Hide VIP in mobile nav (show as locked)
        const mobileVip = document.querySelector('a[href*="erotic"].nav-vip');
        if (mobileVip) {
            mobileVip.style.display = 'flex';
            mobileVip.classList.add('opacity-50', 'pointer-events-none');
        }
        
        // Hide VIP in mobile categories (show as locked)
        const mobileVipCategory = document.querySelector('a[href*="erotic"].bg-red-600\\/20');
        if (mobileVipCategory) {
            mobileVipCategory.style.display = 'block';
            mobileVipCategory.classList.add('opacity-50', 'pointer-events-none');
        }
    }

    // Update VIP status in UI
    updateVipStatus(isVip) {
        // Add/remove VIP status indicator
        let statusIndicator = document.getElementById('vip-status');
        
        if (isVip) {
            if (!statusIndicator) {
                statusIndicator = document.createElement('div');
                statusIndicator.id = 'vip-status';
                statusIndicator.className = 'fixed top-20 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold z-50';
                statusIndicator.innerHTML = '👑 VIP MODE';
                document.body.appendChild(statusIndicator);
            }
        } else {
            if (statusIndicator) {
                statusIndicator.remove();
            }
        }
    }

    // Show success message
    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[80] transition-all duration-500';
        message.innerHTML = '✅ VIP Access Granted! Welcome to VIP Mode';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 500);
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
        const loginBtn = document.getElementById('vip-login-btn');
        const logoutBtn = document.getElementById('vip-logout-btn');
        
        if (loginBtn && logoutBtn) {
            if (isVip) {
                loginBtn.classList.add('hidden');
                logoutBtn.classList.remove('hidden');
            } else {
                loginBtn.classList.remove('hidden');
                logoutBtn.classList.add('hidden');
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
    
    // Check existing IP sessions
    async checkIPSessions(ip) {
        try {
            if (!this.db) {
                console.error('Firebase not available, skipping IP session check');
                return [];
            }
            
            const now = new Date();
            const sessions = await this.db.collection('vip_sessions')
                .where('ip', '==', ip)
                .where('expires', '>', now)
                .get();
            
            return sessions.docs.map(doc => doc.data());
        } catch (error) {
            console.error('Error checking IP sessions:', error);
            return [];
        }
    }
    
    // Save VIP session to Firebase
    async saveVipSession(ip, sessionId, code, expires) {
        try {
            if (!this.db) {
                console.error('Firebase not available, skipping session save');
                return;
            }
            
            await this.db.collection('vip_sessions').doc(sessionId).set({
                ip: ip,
                sessionId: sessionId,
                code: code,
                expires: expires,
                deviceName: this.getDeviceName(),
                userAgent: navigator.userAgent,
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Error saving VIP session:', error);
        }
    }
    
    // Remove VIP session from Firebase
    async removeVipSession(sessionId) {
        try {
            if (!this.db) {
                console.error('Firebase not available, skipping session removal');
                return;
            }
            
            await this.db.collection('vip_sessions').doc(sessionId).delete();
        } catch (error) {
            console.error('Error removing VIP session:', error);
        }
    }
    
    // Logout VIP
    async logoutVip() {
        const vipData = localStorage.getItem('vip_access');
        if (vipData) {
            const vip = JSON.parse(vipData);
            if (vip.sessionId) {
                await this.removeVipSession(vip.sessionId);
            }
        }
        
        localStorage.removeItem('vip_access');
        this.disableVipMode();
        this.showSuccessMessage('VIP Access Removed');
        
        // Reload page after logout
        setTimeout(() => {
            window.location.reload();
        }, 1000);
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
});
