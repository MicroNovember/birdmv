// Alert2 System - Beautiful alerts using SweetAlert2
// Replace all alert() calls with beautiful Swal alerts

class Alert2 {
    // Success alert
    static success(title, message = '', options = {}) {
        return Swal.fire({
            icon: 'success',
            title: title,
            text: message,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'ตกลง',
            ...options
        });
    }

    // Error alert
    static error(title, message = '', options = {}) {
        return Swal.fire({
            icon: 'error',
            title: title,
            text: message,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ตกลง',
            ...options
        });
    }

    // Warning alert
    static warning(title, message = '', options = {}) {
        return Swal.fire({
            icon: 'warning',
            title: title,
            text: message,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'ตกลง',
            ...options
        });
    }

    // Info alert
    static info(title, message = '', options = {}) {
        return Swal.fire({
            icon: 'info',
            title: title,
            text: message,
            confirmButtonColor: '#3b82f6',
            confirmButtonText: 'ตกลง',
            ...options
        });
    }

    // Question alert
    static question(title, message = '', options = {}) {
        return Swal.fire({
            icon: 'question',
            title: title,
            text: message,
            confirmButtonColor: '#8b5cf6',
            confirmButtonText: 'ตกลง',
            ...options
        });
    }

    // Toast notification (top-right)
    static toast(message, type = 'info', duration = 3000) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: duration,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        const icons = {
            success: 'success',
            error: 'error', 
            warning: 'warning',
            info: 'info',
            question: 'question'
        };

        return Toast.fire({
            icon: icons[type] || 'info',
            title: message
        });
    }

    // Confirm dialog
    static confirm(title, message = '', options = {}) {
        return Swal.fire({
            title: title,
            text: message,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'ใช่',
            cancelButtonText: 'ไม่',
            ...options
        });
    }

    // Loading alert
    static loading(title = 'กำลังโหลด...', message = '') {
        return Swal.fire({
            title: title,
            text: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    // Close current alert
    static close() {
        Swal.close();
    }

    // VIP Login Modal
    static vipLogin() {
        return Swal.fire({
            title: 'VIP Access',
            html: `
                <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                    </div>
                    <p class="text-gray-600 text-sm mb-4">กรุณาใส่รหัส VIP 4 ตัวเพื่อเข้าใช้งาน</p>
                    <div class="flex justify-center space-x-2 mb-4">
                        <input type="text" maxlength="1" class="vip-input w-12 h-12 bg-gray-100 border border-gray-300 rounded-lg text-center text-xl font-bold focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition" data-index="0">
                        <input type="text" maxlength="1" class="vip-input w-12 h-12 bg-gray-100 border border-gray-300 rounded-lg text-center text-xl font-bold focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition" data-index="1">
                        <input type="text" maxlength="1" class="vip-input w-12 h-12 bg-gray-100 border border-gray-300 rounded-lg text-center text-xl font-bold focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition" data-index="2">
                        <input type="text" maxlength="1" class="vip-input w-12 h-12 bg-gray-100 border border-gray-300 rounded-lg text-center text-xl font-bold focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition" data-index="3">
                    </div>
                    <div id="vip-error" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm"></div>
                </div>
            `,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'เข้าสู่ระบบ',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#f59e0b',
            cancelButtonColor: '#6b7280',
            preConfirm: () => {
                const inputs = document.querySelectorAll('.vip-input');
                const code = Array.from(inputs).map(input => input.value).join('');
                
                if (code.length !== 4) {
                    Swal.showValidationMessage('กรุณาใส่รหัส VIP 4 ตัวให้ครบ');
                    return false;
                }
                
                return code;
            },
            didOpen: () => {
                // Setup VIP input behavior
                const inputs = document.querySelectorAll('.vip-input');
                
                inputs.forEach((input, index) => {
                    input.addEventListener('input', (e) => {
                        if (e.target.value.length === 1) {
                            if (index < inputs.length - 1) {
                                inputs[index + 1].focus();
                            }
                        }
                    });
                    
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                            inputs[index - 1].focus();
                        }
                    });
                    
                    input.addEventListener('paste', (e) => {
                        e.preventDefault();
                        const pastedData = e.clipboardData.getData('text').slice(0, 4);
                        const chars = pastedData.split('');
                        
                        chars.forEach((char, i) => {
                            if (inputs[index + i]) {
                                inputs[index + i].value = char;
                            }
                        });
                        
                        if (inputs[index + Math.min(chars.length, 4)]) {
                            inputs[index + Math.min(chars.length, 4)].focus();
                        }
                    });
                });
                
                // Focus first input
                inputs[0].focus();
            }
        });
    }

    // Admin Login Modal
    static adminLogin() {
        return Swal.fire({
            title: 'Admin Login',
            html: `
                <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                        </svg>
                    </div>
                    <p class="text-gray-600 text-sm mb-4">กรุณาเข้าสู่ระบบเพื่อจัดการ VIP Codes</p>
                    <div class="space-y-3">
                        <input type="email" id="swal-email" class="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" placeholder="admin@email.com">
                        <input type="password" id="swal-password" class="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" placeholder="••••••••">
                    </div>
                    <div id="admin-error" class="hidden bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm mt-3"></div>
                </div>
            `,
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'เข้าสู่ระบบ',
            cancelButtonText: 'กลับหน้าหลัก',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            preConfirm: () => {
                const email = document.getElementById('swal-email').value;
                const password = document.getElementById('swal-password').value;
                
                if (!email || !password) {
                    Swal.showValidationMessage('กรุณากรอกอีเมลและรหัสผ่าน');
                    return false;
                }
                
                return { email, password };
            }
        });
    }

    // Mobile Categories
    static mobileCategories() {
        return Swal.fire({
            title: 'หมวดหมู่หนัง',
            html: `
                <div class="grid grid-cols-2 gap-3">
                    <a href="pages/category.html?cat=thai" class="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center transition block">
                        <div class="text-2xl mb-2">🇹🇭</div>
                        <div class="text-sm font-medium text-white">ไทย</div>
                    </a>
                    <a href="pages/category.html?cat=korea" class="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center transition block">
                        <div class="text-2xl mb-2">🇰🇷</div>
                        <div class="text-sm font-medium text-white">เกาหลี</div>
                    </a>
                    <a href="pages/category.html?cat=china" class="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center transition block">
                        <div class="text-2xl mb-2">🇨🇳</div>
                        <div class="text-sm font-medium text-white">จีน/ฮ่องกง</div>
                    </a>
                    <a href="pages/category.html?cat=inter" class="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center transition block">
                        <div class="text-2xl mb-2">🌍</div>
                        <div class="text-sm font-medium text-white">สากล</div>
                    </a>
                    <a href="pages/category.html?cat=cartoon" class="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center transition block">
                        <div class="text-2xl mb-2">🎨</div>
                        <div class="text-sm font-medium text-white">การ์ตูน</div>
                    </a>
                    <a href="pages/category.html?cat=india" class="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center transition block">
                        <div class="text-2xl mb-2">🇮🇳</div>
                        <div class="text-sm font-medium text-white">อินเดีย</div>
                    </a>
                    <a href="pages/category.html?cat=asia" class="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center transition block">
                        <div class="text-2xl mb-2">🏯</div>
                        <div class="text-sm font-medium text-white">เอเซีย</div>
                    </a>
                    <button onclick="Alert2.vipLogin()" class="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 p-4 rounded-xl text-center transition">
                        <div class="text-2xl mb-2">⭐</div>
                        <div class="text-sm font-medium text-white">VIP</div>
                    </button>
                </div>
            `,
            showConfirmButton: false,
            showCloseButton: true,
            width: '90%',
            maxWidth: '500px'
        });
    }
}

// Make Alert2 available globally
window.Alert2 = Alert2;

// Auto-replace alert() calls (optional)
if (typeof window.alert === 'function') {
    const originalAlert = window.alert;
    window.alert = function(message) {
        Alert2.info('แจ้งเตือน', message);
    };
}
