# SAMORN Movie - หลักการทำงานของระบบ

## 📋 ภาพรวมระบบ

SAMORN Movie เป็นเว็บไซต์สตรีมมิ่งหนังออนไลน์ที่พัฒนาด้วย HTML, CSS และ JavaScript บน PWA (Progressive Web App) พร้อมระบบ VIP Login และ Firebase Authentication

---

## 🏗️ โครงสร้างไฟล์หลัก

```
samorn-movie-1.0/
├── index.html                 # หน้าแรก (Netflix-style)
├── pages/
│   ├── category.html          # หน้าหมวดหมู่หนัง
│   ├── watch.html             # หน้าดูหนัง
│   └── admin.html             # หน้าจัดการ VIP Codes
├── assets/
│   ├── js/
│   │   ├── script.js          # หลักการทำงานหน้าแรก
│   │   ├── category.js        # หลักการทำงานหน้าหมวดหมู่
│   │   └── watch.js           # หลักการทำงานหน้าดูหนัง
│   ├── css/
│   │   ├── style.css          # สไตล์หลัก
│   │   ├── category-responsive.css  # สไตล์ responsive
│   │   ├── menu.css           # สไตล์เมนู
│   │   └── watch.css          # สไตล์หน้าดูหนัง
│   └── icons/                 # PWA Icons
├── data/playlist/             # ข้อมูลหนัง JSON
├── pwa/                       # PWA Configuration
└── README.md                  # คำอธิบายโปรเจค
```

---

## 🏠 หน้าแรก (index.html)

### 📝 หน้าที่หลัก
- แสดงหมวดหมู่หนังแบบ Netflix (horizontal scroll)
- แสดงหมวด VIP ถ้า login สำเร็จ
- ระบบค้นหาหนังทั่วทั้งเว็บไซต์
- Responsive design สำหรับทุกอุปกรณ์

### 🔧 หลักการทำงาน (script.js)

#### 1. **การโหลดหมวดหมู่**
```javascript
const MOVIE_CATEGORIES = [
    { key: 'thai', title: 'ไทย' },
    { key: 'korea', title: 'เกาหลี' },
    { key: 'temp', title: 'VIP', vip: true }, // VIP Category
];
```

#### 2. **การตรวจสอบสถานะ VIP**
```javascript
function getFilteredCategories() {
    const vipData = localStorage.getItem('vip_access');
    const userType = localStorage.getItem('user_type');
    
    // แสดงหมวด VIP เฉพาะถ้า login + VIP ถูกต้อง
    return (isLoggedIn && isVip) ? MOVIE_CATEGORIES : MOVIE_CATEGORIES.filter(cat => !cat.vip);
}
```

#### 3. **การโหลดหนัง**
```javascript
async function loadAllMovies() {
    for (const category of getFilteredCategories()) {
        // โหลดจาก temp.json สำหรับ VIP
        let jsonFile = category.key === 'temp' ? 'data/playlist/temp.json' : `data/playlist/${category.key}.json`;
        const response = await fetch(jsonFile);
        movies = await response.json();
        
        // สร้าง Movie Cards
        allSectionsHtml += createMovieSection(category.title, movies, category.key);
    }
}
```

#### 4. **การสร้าง Movie Card**
```javascript
function createMovieCard(movie) {
    // ขนาด 2:3 ratio (140x210px)
    // Overlay ปีและข้อมูลเสียง
    // ชื่อเรื่องแสดง 2 บรรทัด
    // Link ไปหน้าดูหนังพร้อมพารามิเตอร์
}
```

---

## 🎬 หน้าหมวดหมู่ (category.html)

### 📝 หน้าที่หลัก
- แสดงรายการหนังตามหมวดหมู่ที่เลือก
- รองรับการแบ่งหน้า (pagination)
- ค้นหาภายในหมวดหมู่
- ป้องกันการเข้าถึงหมวด VIP ถ้าไม่มีสิทธิ์

### 🔧 หลักการทำงาน (category.js)

#### 1. **การตรวจสอบสิทธิ์ VIP**
```javascript
async function loadCategory(categoryKey) {
    // ตรวจสอบสำหรับหมวด VIP
    if (categoryKey === 'erotic' || categoryKey === 'temp') {
        const isLoggedIn = userType === 'guest' || userType === 'vip';
        const isVip = expires && new Date(expires) > new Date();
        
        if (!isLoggedIn || !isVip) {
            // แสดงหน้า VIP Access Required
            return;
        }
    }
}
```

#### 2. **การโหลดข้อมูล**
```javascript
// โหลดจาก temp.json สำหรับ VIP categories
let jsonFile = (categoryKey === 'erotic' || categoryKey === 'temp') ? '../data/playlist/temp.json' : `../data/playlist/${categoryKey}.json`;

// แสดงทั้งหมดสำหรับ temp
if (categoryKey === 'temp') {
    console.log(`Loading ${movies.length} VIP movies from temp.json`);
}
// กรองเฉพาะ erotic สำหรับ erotic category
else if (categoryKey === 'erotic') {
    movies = movies.filter(movie => movie.category === 'erotic');
}
```

#### 3. **การแบ่งหน้า**
```javascript
function displayMovies(movies, categoryName) {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedMovies = movies.slice(startIndex, endIndex);
    
    // แสดง Movie Cards
    // แสดง Pagination
}
```

---

## 📺 หน้าดูหนัง (watch.html)

### 📝 หน้าที่หลัก
- สตรีมวิดีโอ HLS (.m3u8)
- แสดงข้อมูลหนัง (poster, ชื่อ, ปี, คำอธิบาย)
- รองรับหลายภาษา (audio1, audio2, subtitle1, subtitle2)
- ป้องกันการเข้าถึงถ้าไม่มีสิทธิ์

### 🔧 หลักการทำงาน (watch.js)

#### 1. **การดึงพารามิเตอร์**
```javascript
function getMovieFromURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        video1: params.get('video1'),
        video2: params.get('video2'),
        subtitle1: params.get('subtitle1'),
        subtitle2: params.get('subtitle2'),
        name: params.get('name'),
        poster: params.get('poster'),
        // ... อื่นๆ
    };
}
```

#### 2. **การตั้งค่า Video Player**
```javascript
function setupVideoPlayer(videoUrl, subtitles = []) {
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        
        // เพิ่ม subtitle tracks
        subtitles.forEach(sub => {
            video.addTextTrack('subtitles', sub.label, sub.lang, sub.src);
        });
    }
}
```

#### 3. **การตรวจสอบสิทธิ์**
```javascript
function checkVipAccess() {
    // ตรวจสอบว่าหนังนี้ต้องการ VIP หรือไม่
    // ถ้าต้องการ ให้ตรวจสอบสถานะ
    // ถ้าไม่มีสิทธิ์ ให้ redirect ไปหน้า login
}
```

---

## ⚙️ หน้าจัดการ (admin.html)

### 📝 หน้าที่หลัก
- Login ด้วย Firebase Authentication
- จัดการ VIP Codes (CRUD)
- ดูสถิติการใช้งาน
- ตรวจสอบ log การเข้าใช้

### 🔧 หลักการทำงาน

#### 1. **Admin Login**
```javascript
function adminLogin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // เข้าสู่ระบบสำเร็จ
            showAdminDashboard();
        })
        .catch((error) => {
            // แสดงข้อผิดพลาด
        });
}
```

#### 2. **การจัดการ VIP Codes**
```javascript
// เพิ่ม VIP Code
function addVipCode(code, expiry) {
    db.collection('vip_codes').add({
        code: code,
        expiry: expiry,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        used: false
    });
}

// ดึงรายการ VIP Codes
function getVipCodes() {
    db.collection('vip_codes').get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                // แสดงในตาราง
            });
        });
}
```

---

## 🔐 ระบบ VIP Login

### 📝 หลักการทำงาน

#### 1. **การ Login**
```javascript
function loginVip(code) {
    // ตรวจสอบ VIP Code ใน Firebase
    db.collection('vip_codes').where('code', '==', code).get()
        .then((snapshot) => {
            if (snapshot.empty) {
                showError('รหัสไม่ถูกต้อง');
                return;
            }
            
            const vipData = snapshot.docs[0].data();
            if (vipData.used) {
                showError('รหัสนี้ถูกใช้แล้ว');
                return;
            }
            
            // บันทึกการใช้รหัส
            updateVipCodeUsage(doc.id);
            
            // บันทึกสถานะ VIP ใน localStorage
            localStorage.setItem('vip_access', JSON.stringify({
                code: code,
                expires: vipData.expiry,
                loginTime: new Date().toISOString()
            }));
            
            // บันทึกประเภทผู้ใช้
            localStorage.setItem('user_type', 'vip');
            
            // รีโหลดหน้าเว็บ
            location.reload();
        });
}
```

#### 2. **การตรวจสอบสถานะ**
```javascript
function checkVipStatus() {
    const vipData = localStorage.getItem('vip_access');
    
    if (vipData) {
        const { expires } = JSON.parse(vipData);
        const isExpired = new Date(expires) < new Date();
        
        if (isExpired) {
            // ลบข้อมูล VIP ที่หมดอายุ
            localStorage.removeItem('vip_access');
            localStorage.removeItem('user_type');
            return false;
        }
        
        return true;
    }
    
    return false;
}
```

#### 3. **การ Logout**
```javascript
function logoutVip() {
    localStorage.removeItem('vip_access');
    localStorage.removeItem('user_type');
    location.reload();
}
```

---

## 📱 ระบบ Responsive Design

### 📐 อัตราส่วนการ์ดหนัง (2:3)
- **Mobile:** 130x195px
- **Tablet:** 155x233px  
- **Desktop:** 170x255px
- **TV:** 190x285px

### 🎨 TailwindCSS Classes
```css
/* Movie Card */
.poster-card {
    width: 140px; /* 2:3 ratio */
    height: 210px;
    border-radius: 0.75rem;
}

/* Text Truncation */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

---

## 🔗 ระบบ PWA

### 📱 PWA Manifest
```json
{
    "name": "SAMORN Movie",
    "short_name": "SAMORN",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#111827",
    "theme_color": "#dc2626"
}
```

### 🛠️ Service Worker
```javascript
// การ cache ไฟล์สำคัญ
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('samorn-movie-v1')
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// การ serve ไฟล์จาก cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
    );
});
```

---

## 🗄️ โครงสร้างข้อมูลหนัง (JSON)

### 📝 รูปแบบข้อมูล
```json
{
    "name": "ชื่อหนัง (ปี) ชื่อไทย",
    "info": "พากย์ไทย/ซับไทย/SoundTrack",
    "category": "หมวดหมู่",
    "release_year": "2025",
    "logo": "https://example.com/poster.jpg",
    "description": "คำอธิบายหนัง",
    "video-audio1": "https://example.com/video1.m3u8",
    "video-audio2": "https://example.com/video2.m3u8",
    "subtitle1": "https://example.com/sub1.vtt",
    "subtitle2": "https://example.com/sub2.vtt"
}
```

### 📂 ไฟล์ข้อมูล
- `thai.json` - หนังไทย
- `korea.json` - หนังเกาหลี
- `china.json` - หนังจีน/ฮ่องกง
- `inter.json` - หนังสากล
- `cartoon.json` - การ์ตูน/อนิเมชั่น
- `india.json` - หนังอินเดีย
- `asia.json` - หนังเอเซีย
- `temp.json` - หนัง VIP (ทั้งหมด)

---

## 🔍 ระบบค้นหา

### 📝 หลักการทำงาน
```javascript
function searchMovies() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    
    if (query.length < 2) {
        // กลับไปแสดงรายการทั้งหมด
        return;
    }
    
    // ค้นหาใน moviesDatabase
    const results = Object.values(moviesDatabase).filter(movie => {
        const name = movie.name.toLowerCase();
        const info = (movie.info || '').toLowerCase();
        const year = (movie.release_year || '').toString();
        
        return name.includes(query) || 
               info.includes(query) || 
               year.includes(query);
    });
    
    // แสดงผลลัพธ์
    displaySearchResults(results, query);
}
```

---

## 🚀 การ Deploy

### 📦 ขั้นตอนการ Deploy
1. **Build Project** - คอมไพล์ไฟล์ทั้งหมด
2. **Upload to Server** - อัปโหลดไปยัง hosting
3. **Configure HTTPS** - ตั้งค่า SSL Certificate
4. **Setup Firebase** - คอนฟิก Firebase project
5. **Test PWA** - ทดสอบการติดตั้ง PWA
6. **Update DNS** - ตั้งค่า DNS records

### 🔧 Environment Variables
```javascript
// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSy...",
    authDomain: "samorn-mv.firebaseapp.com",
    projectId: "samorn-mv",
    // ... อื่นๆ
};
```

---

## 🐛 การแก้ไขปัญหา

### 🔍 Common Issues
1. **Video not playing** - ตรวจสอบ HLS URL และ CORS
2. **VIP not working** - ตรวจสอบ localStorage และ Firebase
3. **Responsive issues** - ตรวจสอบ CSS media queries
4. **PWA not installing** - ตรวจสอบ manifest.json และ service worker

### 🛠️ Debug Tools
- **Browser Console** - ตรวจสอบ JavaScript errors
- **Network Tab** - ตรวจสอบการโหลดไฟล์
- **Application Tab** - ตรวจสอบ localStorage และ service worker
- **Firebase Console** - ตรวจสอบ database และ authentication

---

## 📈 การพัฒนาต่อ

### 🎯 Features ที่จะเพิ่ม
- [ ] ระบบ Favorite Movies
- [ ] ระบบ Rating และ Review
- [ ] ระบบ Download สำหรับ VIP
- [ ] ระบบ Chromecast/AirPlay
- [ ] ระบบ Multi-language UI
- [ ] ระบบ Analytics และ Reporting

### 🔧 Technical Improvements
- [ ] ใช้ TypeScript แทน JavaScript
- [ ] ใช้ React/Vue สำหรับ SPA
- [ ] ใช้ Node.js Backend
- [ ] ใช้ Database แทน JSON files
- [ ] ใช้ CDN สำหรับ static files
- [ ] ใช้ Docker สำหรับ deployment

---

## 📞 ติดต่อ

**Developer:** SAMORN Movie Team  
**Repository:** https://github.com/MicroNovember/birdmv  
**License:** Private Project  

---

*อัปเดตล่าสุด: 25 มกราคม 2026*
