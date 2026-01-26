// Authentication Check System
class AuthCheck {
    constructor() {
        this.init();
    }
    
    init() {
        // Check authentication on page load
        this.checkAuth();
    }
    
    checkAuth() {
        const userType = localStorage.getItem('user_type');
        const vipData = localStorage.getItem('vip_access');
        
        // If no user type, set as guest (don't force redirect on main page)
        if (!userType) {
            localStorage.setItem('user_type', 'guest');
            return;
        }
        
        // If VIP user, check if VIP is still valid
        if (userType === 'vip' && vipData) {
            const vip = JSON.parse(vipData);
            if (vip.expires && new Date(vip.expires) <= new Date()) {
                // VIP expired, remove VIP access and set as guest
                localStorage.removeItem('vip_access');
                localStorage.setItem('user_type', 'guest');
                this.showExpiredMessage();
            }
        }
    }
    
    showExpiredMessage() {
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg z-[80] transition-all duration-500';
        message.innerHTML = '⏰ VIP Access Expired! Now using Guest access.';
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 500);
        }, 5000);
    }
    
    // Get current user type
    getUserType() {
        return localStorage.getItem('user_type') || 'guest';
    }
    
    // Check if user is VIP
    isVip() {
        const userType = this.getUserType();
        if (userType !== 'vip') return false;
        
        const vipData = localStorage.getItem('vip_access');
        if (!vipData) return false;
        
        const vip = JSON.parse(vipData);
        return vip.expires && new Date(vip.expires) > new Date();
    }
    
    // Logout function
    logout() {
        localStorage.removeItem('user_type');
        localStorage.removeItem('vip_access');
        window.location.href = 'login.html';
    }
    
    // Switch between Guest and VIP
    switchToGuest() {
        localStorage.setItem('user_type', 'guest');
        localStorage.removeItem('vip_access');
        window.location.reload();
    }
    
    switchToVip() {
        if (window.vipAuth) {
            window.vipAuth.showVipModal();
        }
    }
}

// Global functions
function logout() {
    if (window.authCheck) {
        window.authCheck.logout();
    }
}

function switchToGuest() {
    if (window.authCheck) {
        window.authCheck.switchToGuest();
    }
}

function switchToVip() {
    if (window.authCheck) {
        window.authCheck.switchToVip();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authCheck = new AuthCheck();
});
