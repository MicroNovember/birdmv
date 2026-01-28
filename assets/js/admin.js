// Admin Dashboard System
class AdminDashboard {
    constructor() {
        this.db = window.db;
        this.auth = window.auth;
        this.currentUser = null;
        
        // Check if Firebase is available
        if (!this.db || !this.auth) {
            console.error('Firebase not initialized');
            Alert2.error('ระบบไม่พร้อม', 'ไม่สามารถเชื่อมต่อ Firebase ได้');
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
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                codes.push({
                    id: doc.id,
                    ...data,
                    created_at: data.created_at?.toDate() || new Date(),
                    expires: data.expires?.toDate() || null,
                    last_used: data.last_used?.toDate() || null
                });
            });
            
            this.displayVipCodes(codes);
            this.updateStats(codes);
        } catch (error) {
            console.error('Error loading VIP codes:', error);
            
            // Handle Firebase network errors
            if (error.message && error.message.includes('blocked')) {
                Alert2.error('การเชื่อมต่อถูกบล็อก', 'กรุณาปิด adblocker หรือตรวจสอบการเชื่อมต่อเครือข่าย');
            } else {
                Alert2.error('ไม่สามารถโหลดข้อมูล', 'กรุณาลองใหม่ภายหลัง');
            }
        }
    }

    // Update statistics
    updateStats(codes) {
        const total = codes.length;
        const active = codes.filter(code => code.is_active !== false && (!code.expires || new Date(code.expires) > new Date())).length;
        const expired = codes.filter(code => code.expires && new Date(code.expires) <= new Date()).length;
        const totalUsage = codes.reduce((sum, code) => sum + (code.usage_count || 0), 0);
        
        // Calculate expiring soon (within 7 days)
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const expiringSoon = codes.filter(code => {
            if (!code.expires || code.is_active === false) return false;
            const expiryDate = new Date(code.expires);
            return expiryDate > new Date() && expiryDate <= sevenDaysFromNow;
        }).length;

        document.getElementById('total-codes').textContent = total;
        document.getElementById('active-codes').textContent = active;
        document.getElementById('expired-codes').textContent = expired;
        document.getElementById('expiring-codes').textContent = expiringSoon;
        document.getElementById('total-usage').textContent = totalUsage;
    }

    // Display VIP codes in table
    displayVipCodes(codes) {
        const tbody = document.getElementById('vip-codes-table');
        
        if (codes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-8 text-gray-400">
                        ไม่พบรหัส VIP กรุณาเพิ่มรหัสแรก
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
            const expires = code.expires ? new Date(code.expires).toLocaleDateString('th-TH') : 'ไม่มีกำหนด';
            const lastUsed = code.last_used ? new Date(code.last_used).toLocaleDateString('th-TH') : 'ไม่เคยใช้';

            return `
                <tr class="border-b border-gray-700 hover:bg-gray-700/50 transition">
                    <td class="py-3 px-4 font-mono font-bold text-white">${code.id}</td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 text-gray-300">${usage}</td>
                    <td class="py-3 px-4 text-gray-300">${expires}</td>
                    <td class="py-3 px-4 text-gray-300">${lastUsed}</td>
                    <td class="py-3 px-4">
                        <div class="flex space-x-2">
                            <button onclick="toggleCodeStatus('${code.id}', ${code.is_active !== false})" class="px-3 py-1 ${isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded text-sm transition">
                                ${isActive ? 'ปิดใช้' : 'เปิดใช้'}
                            </button>
                            <button onclick="deleteCode('${code.id}')" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition">
                                ลบ
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
            Alert2.error('เกิดข้อผิดพลาด', 'ในการเปลี่ยนสถานะ');
        }
    }

    // Delete code
    async deleteCode(codeId) {
        const result = await Alert2.confirm(
            'ยืนยันการลบรหัส',
            'คุณแน่ใจหรือไม่ที่จะลบรหัส VIP นี้? การดำเนินการนี้ไม่สามารถยกเลิกได้'
        );
        
        if (!result.isConfirmed) {
            return;
        }

        try {
            // Show loading
            Alert2.loading('กำลังลบรหัส...');
            
            await this.db.collection('vip_codes').doc(codeId).delete();
            
            // Close loading and show success
            Alert2.close();
            Alert2.success('ลบรหัสสำเร็จ', `รหัส ${codeId} ถูกลบแล้ว`);
            
            // Reload codes
            this.loadVipCodes();
        } catch (error) {
            console.error('Error deleting code:', error);
            Alert2.close();
            
            // Handle Firebase errors
            if (error.message && error.message.includes('blocked')) {
                Alert2.error('การเชื่อมต่อถูกบล็อก', 'กรุณาปิด adblocker และลองใหม่');
            } else if (error.message && error.message.includes('permission-denied')) {
                Alert2.error('ไม่มีสิทธิ์', 'คุณไม่มีสิทธิ์ลบรหัสนี้');
            } else {
                Alert2.error('เกิดข้อผิดพลาด', 'ไม่สามารถลบรหัสได้ กรุณาลองใหม่');
            }
        }
    }

    // Add new VIP code
    async addVipCode(code) {
        try {
            // Validate code
            if (!code || code.length !== 4) {
                Alert2.warning('กรุณาใส่รหัส VIP 4 ตัว');
                return;
            }
            
            if (!/^\d{4}$/.test(code)) {
                Alert2.warning('รหัสต้องเป็นตัวเลข 4 ตัวเท่านั้น');
                return;
            }
            
            // Check if code already exists
            const docRef = this.db.collection('vip_codes').doc(code);
            const doc = await docRef.get();
            
            if (doc.exists) {
                Alert2.error('รหัสนี้มีอยู่แล้ว', `รหัส ${code} ถูกสร้างไว้เมื่อ ${doc.data().created_at?.toDate().toLocaleDateString('th-TH') || 'ไม่ทราบ'}`);
                return;
            }
            
            // Get form values
            const maxUsage = document.getElementById('max-usage').value ? parseInt(document.getElementById('max-usage').value) : null;
            const expirationDate = document.getElementById('expiration-date').value;
            
            // Prepare data
            const codeData = {
                is_active: true,
                created_at: new Date(),
                usage_count: 0,
                max_usage: maxUsage,
                last_used: null
            };
            
            // Add expiration date if provided
            if (expirationDate) {
                // Set to end of day (23:59:59) in Thailand timezone
                const expiryDate = new Date(expirationDate);
                expiryDate.setHours(23, 59, 59, 999);
                codeData.expires = expiryDate;
            } else {
                codeData.expires = null;
            }
            
            // Add new code
            await docRef.set(codeData);
            
            Alert2.success('เพิ่มรหัส VIP สำเร็จ!', `รหัส ${code} ถูกเพิ่มเรียบร้อย`);
            
            // Close modal and reload codes
            hideAddCodeModal();
            this.loadVipCodes();
            
        } catch (error) {
            console.error('Error adding VIP code:', error);
            Alert2.close();
            
            // Handle Firebase errors
            if (error.message && error.message.includes('blocked')) {
                Alert2.error('การเชื่อมต่อถูกบล็อก', 'กรุณาปิด adblocker และลองใหม่');
            } else if (error.message && error.message.includes('permission-denied')) {
                Alert2.error('ไม่มีสิทธิ์', 'คุณไม่มีสิทธิ์เพิ่มรหัส VIP');
            } else {
                Alert2.error('เกิดข้อผิดพลาด', 'ไม่สามารถเพิ่มรหัสได้ กรุณาลองใหม่');
            }
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

function adminLogout() {
    if (window.adminDashboard) {
        window.adminDashboard.adminLogout();
    }
}

// Global delete function for reliability
async function deleteCode(codeId) {
    if (window.adminDashboard) {
        await window.adminDashboard.deleteCode(codeId);
    } else {
        Alert2.error('ระบบไม่พร้อม', 'กรุณารีเฟรชหน้าเว็บและลองใหม่');
    }
}

// Global toggle function for reliability
async function toggleCodeStatus(codeId, currentStatus) {
    if (window.adminDashboard) {
        await window.adminDashboard.toggleCodeStatus(codeId, currentStatus);
    } else {
        Alert2.error('ระบบไม่พร้อม', 'กรุณารีเฟรชหน้าเว็บและลองใหม่');
    }
}

// Global add function for reliability
async function addVipCode(code) {
    if (window.adminDashboard) {
        await window.adminDashboard.addVipCode(code);
    } else {
        Alert2.error('ระบบไม่พร้อม', 'กรุณารีเฟรชหน้าเว็บและลองใหม่');
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

