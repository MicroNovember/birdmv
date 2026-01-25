// Admin Dashboard System
class AdminDashboard {
    constructor() {
        this.db = window.db;
        this.auth = window.auth;
        this.currentUser = null;
        
        // Check if Firebase is available
        if (!this.db || !this.auth) {
            console.error('Firebase not initialized');
            return;
        }
        
        this.init();
    }

    init() {
        this.checkAuthState();
    }

    // Check authentication state
    checkAuthState() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.showDashboard();
                this.loadVipCodes();
            } else {
                this.showLoginModal();
            }
        });
    }

    // Show login modal
    showLoginModal() {
        document.getElementById('admin-login-modal').classList.remove('hidden');
        document.getElementById('admin-dashboard').classList.add('hidden');
    }

    // Show dashboard
    showDashboard() {
        document.getElementById('admin-login-modal').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        
        const adminUserElement = document.getElementById('admin-user');
        if (adminUserElement && this.currentUser && this.currentUser.email) {
            adminUserElement.textContent = this.currentUser.email;
        }
    }

    // Admin login
    async adminLogin() {
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const errorDiv = document.getElementById('admin-error');

        if (!email || !password) {
            this.showAdminError('กรุณากรอกอีเมลและรหัสผ่าน');
            return;
        }

        try {
            await this.auth.signInWithEmailAndPassword(email, password);
            // Auth state change will handle showing dashboard
        } catch (error) {
            console.error('Login error:', error);
            this.showAdminError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        }
    }

    // Show admin error
    showAdminError(message) {
        const errorDiv = document.getElementById('admin-error');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    }

    // Admin logout
    async adminLogout() {
        try {
            await this.auth.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Load VIP codes
    async loadVipCodes() {
        try {
            const snapshot = await this.db.collection('vip_codes').get();
            const codes = [];
            
            snapshot.forEach(doc => {
                codes.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.updateStats(codes);
            this.displayCodes(codes);
        } catch (error) {
            console.error('Error loading VIP codes:', error);
            this.displayCodes([]);
        }
    }

    // Update statistics
    updateStats(codes) {
        const total = codes.length;
        const active = codes.filter(code => code.is_active !== false && (!code.expires || new Date(code.expires) > new Date())).length;
        const expired = codes.filter(code => code.expires && new Date(code.expires) <= new Date()).length;
        const totalUsage = codes.reduce((sum, code) => sum + (code.usage_count || 0), 0);

        document.getElementById('total-codes').textContent = total;
        document.getElementById('active-codes').textContent = active;
        document.getElementById('expired-codes').textContent = expired;
        document.getElementById('total-usage').textContent = totalUsage;
    }

    // Display VIP codes in table
    displayCodes(codes) {
        const tbody = document.getElementById('vip-codes-table');
        
        if (codes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-400">
                        No VIP codes found. Add your first code to get started.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = codes.map(code => {
            const isActive = code.is_active !== false && (!code.expires || new Date(code.expires) > new Date());
            const statusBadge = isActive 
                ? '<span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">Active</span>'
                : '<span class="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">Inactive</span>';
            
            const usage = `${code.usage_count || 0}${code.max_usage ? `/${code.max_usage}` : ''}`;
            const expires = code.expires ? new Date(code.expires).toLocaleDateString('th-TH') : 'Never';
            const lastUsed = code.last_used ? new Date(code.last_used).toLocaleDateString('th-TH') : 'Never';

            return `
                <tr class="border-b border-gray-700 hover:bg-gray-700/50 transition">
                    <td class="py-3 px-4 font-mono font-bold text-white">${code.id}</td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-gray-300">${usage}</td>
                    <td class="py-3 px-4 text-gray-300">${expires}</td>
                    <td class="py-3 px-4 text-gray-300">${lastUsed}</td>
                    <td class="py-3 px-4">
                        <div class="flex space-x-2">
                            <button onclick="adminDashboard.toggleCodeStatus('${code.id}', ${code.is_active !== false})" class="px-3 py-1 ${isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded text-sm transition">
                                ${isActive ? 'Disable' : 'Enable'}
                            </button>
                            <button onclick="adminDashboard.deleteCode('${code.id}')" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition">
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Toggle code status
    async toggleCodeStatus(codeId, currentStatus) {
        try {
            await this.db.collection('vip_codes').doc(codeId).update({
                is_active: !currentStatus
            });
            
            // Reload codes
            this.loadVipCodes();
        } catch (error) {
            console.error('Error toggling code status:', error);
            alert2('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ', 'error');
        }
    }

    // Delete code
    async deleteCode(codeId) {
        if (!confirm('คุณแน่ใจหรือไม่ที่จะลบรหัสนี้?')) {
            return;
        }

        try {
            await this.db.collection('vip_codes').doc(codeId).delete();
            
            // Reload codes
            this.loadVipCodes();
        } catch (error) {
            console.error('Error deleting code:', error);
            alert2('เกิดข้อผิดพลาดในการลบรหัส', 'error');
        }
    }
}

// Add Code Modal Functions
function showAddCodeModal() {
    document.getElementById('add-code-modal').classList.remove('hidden');
}

function hideAddCodeModal() {
    document.getElementById('add-code-modal').classList.add('hidden');
    // Clear form
    document.getElementById('new-code').value = '';
    document.getElementById('max-usage').value = '';
    document.getElementById('expiration-date').value = '';
}

async function addVipCode() {
    const code = document.getElementById('new-code').value;
    const maxUsage = document.getElementById('max-usage').value;
    const expirationDate = document.getElementById('expiration-date').value;

    if (!code || code.length !== 4) {
        alert2('กรุณาใส่รหัส VIP 4 ตัว', 'warning');
        return;
    }

    if (!/^\d{4}$/.test(code)) {
        alert2('รหัสต้องเป็นตัวเลข 4 ตัวเท่านั้น', 'warning');
        return;
    }

    try {
        const codeData = {
            is_active: true,
            created_at: new Date(),
            usage_count: 0
        };

        if (maxUsage) {
            codeData.max_usage = parseInt(maxUsage);
        }

        if (expirationDate) {
            codeData.expires = new Date(expirationDate);
        }

        await window.db.collection('vip_codes').doc(code).set(codeData);
        
        hideAddCodeModal();
        adminDashboard.loadVipCodes();
        
        alert2('เพิ่มรหัส VIP สำเร็จ!', 'success');
    } catch (error) {
        console.error('Error adding VIP code:', error);
        alert2('เกิดข้อผิดพลาดในการเพิ่มรหัส', 'error');
    }
}

// Global functions for HTML onclick handlers
function adminLogin() {
    if (window.adminDashboard) {
        window.adminDashboard.adminLogin();
    }
}

function adminLogout() {
    if (window.adminDashboard) {
        window.adminDashboard.adminLogout();
    }
}

// Initialize Admin Dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Firebase to initialize
    setTimeout(() => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            window.adminDashboard = new AdminDashboard();
        } else {
            console.error('Firebase not loaded properly');
            // Show error to user
            document.getElementById('admin-error').textContent = 'Firebase โหลดไม่สำเร็จ กรุณารีเฟรชหน้า';
            document.getElementById('admin-error').classList.remove('hidden');
        }
    }, 1000);
});

// Create default admin user and VIP code for testing
async function setupTestData() {
    try {
        // Create admin user (you'll need to do this in Firebase Console)
        // Email: admin@samorn.com
        // Password: admin123
        
        // Create default VIP code
        await window.db.collection('vip_codes').doc('1234').set({
            is_active: true,
            created_at: new Date(),
            usage_count: 0,
            max_usage: null,
            expires: null
        });
        
        console.log('Test data created successfully');
    } catch (error) {
        console.error('Error creating test data:', error);
    }
}
