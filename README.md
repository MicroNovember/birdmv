# SAMORN Movie - VIP Streaming Platform (Organized Structure)

โปรเจกต์ SAMORN Movie สำหรับการสตรีมหนัง VIP พร้อมระบบ PWA โครงสร้างไฟล์ที่เป็นระเบียบ

## 📁 โครงสร้างไฟล์ใหม่ (Organized Structure)

```
samorn-movie-1.0/
├── index.html                    # 🏠 หน้าหลัก (Root level)
├── README.md                     # 📖 คำอธิบายโปรเจกต์
│
├── 📂 assets/                    # 🎨 ไฟล์สินค้าและไอคอน
│   ├── 📂 css/                   # 🎨 ไฟล์สไตล์ชีต
│   │   ├── style.css            # สไตล์หลัก
│   │   ├── menu.css             # สไตล์เมนู
│   │   ├── watch.css            # สไตล์หน้าดูหนัง
│   │   └── category-responsive.css # สไตล์ responsive
│   │
│   ├── 📂 js/                    # ⚡ ไฟล์จาวาสคริปต์
│   │   ├── script.js            # สคริปต์หลัก
│   │   ├── menu.js              # สคริปต์เมนู
│   │   ├── category.js          # สคริปต์หมวดหมู่
│   │   ├── watch.js             # สคริปต์ดูหนัง
│   │   ├── auth-check.js        # ตรวจสอบการยืนยันตัวตน
│   │   ├── vip-auth.js          # ระบบ VIP
│   │   ├── firebase-setup.js    # ตั้งค่า Firebase
│   │   ├── tv-detection.js      # ตรวจจับ TV
│   │   ├── tv-navigation.js     # การนำทาง TV
│   │   └── admin.js             # สคริปต์แอดมิน
│   │
│   ├── 📂 icons/                 # 🖼️ ไอคอนและ favicon
│   │   ├── favicon-16.png       # Favicon 16x16
│   │   ├── favicon-32.png       # Favicon 32x32
│   │   ├── favicon.ico          # Favicon ICO
│   │   ├── icon-192.png         # PWA Icon 192x192
│   │   └── icon-512.png         # PWA Icon 512x512
│   │
│   └── 📂 images/                # 📷 รูปภาพ (ว่างไว้สำหรับอนาคต)
│
├── 📄 login.html                 # 📝 หน้าเข้าสู่ระบบ (ย้ายมา root)
├── 📂 pages/                     # 📄 หน้าเพจต่างๆ
│   ├── category.html            # หน้าหมวดหมู่หนัง
│   ├── watch.html               # หน้าดูหนัง
│   └── admin.html               # หน้าจัดการระบบ
│
├── 📂 data/                      # 💾 ข้อมูลและฐานข้อมูล
│   └── 📂 playlist/              # 📋 ข้อมูลหนัง
│       ├── thai.json            # หนังไทย
│       ├── korea.json           # หนังเกาหลี
│       ├── china.json           # หนังจีน
│       ├── inter.json           # หนังสากล
│       ├── cartoon.json         # การ์ตูน
│       ├── india.json           # หนังอินเดีย
│       ├── asia.json            # หนังเอเซีย
│       ├ 
│       └── video.json           # ข้อมูลวิดีโอ
│
└── 📂 pwa/                       # 📱 ไฟล์ PWA
    ├── manifest.json            # PWA Manifest
    ├── sw.js                    # Service Worker
    └── browserconfig.xml        # Browser Config
```

## ✨ คุณสมบัติ

- ✅ **PWA (Progressive Web App)** - ติดตั้งได้บนมือถือ
- ✅ **ระบบ VIP Login** - ระบบสมาชิกพรีเมียม
- ✅ **รองรับ TV และ Mobile** - ทำงานได้ทุกอุปกรณ์
- ✅ **Firebase Authentication** - ระบบยืนยันตัวตน
- ✅ **Service Worker Cache** - เพิ่มความเร็วในการโหลด
- ✅ **Responsive Design** - รองรับทุกขนาดหน้าจอ
- ✅ **หมวดหมู่หนังครบถ้วน** - ทุกประเภทหนัง

## 🚀 การติดตั้งและใช้งาน

### การติดตั้ง
1. Clone หรือดาวน์โหลดโปรเจกต์
2. ใช้เว็บเซิร์ฟเวอร์ (Apache, Nginx, หรือ Python http.server)
3. เข้าถึงผ่านเบราว์เซอร์ที่ `http://localhost:8000`

### การใช้งาน
- **หน้าหลัก**: `index.html` - แสดงหนังล่าสุดและหมวดหมู่
- **เข้าสู่ระบบ VIP**: คลิกปุ่ม VIP และใส่รหัส
- **ดูหนัง**: เลือกหมวดหมู่แล้วเลือกเรื่องที่ต้องการ
- **ติดตั้ง PWA**: ใช้งานผ่านเบราว์เซอร์ที่รองรับ PWA

## 🔧 Firebase Config

โปรเจกต์นี้ใช้ Firebase สำหรับ:
- **Authentication** - ระบบยืนยันตัวตนผู้ใช้
- **Firestore Database** - ฐานข้อมูลหนังและผู้ใช้
- **Storage** - จัดเก็บไฟล์สื่อ

## 🌐 Deployment

พร้อมสำหรับการ Deploy บน:
- **GitHub Pages** - ฟรีสำหรับโอเพนซอร์ส
- **Netlify** - ฟรีสำหรับโปรเจกต์ส่วนตัว
- **Vercel** - ฟรีสำหรับนักพัฒนา
- **Firebase Hosting** - ฟรีสำหรับโปรเจกต์ขนาดเล็ก

## 📝 หมายเหตุ

- ทุกไฟล์ใช้ **relative paths** สามารถ deploy ได้ทันที
- โครงสร้างใหม่เป็นระเบียบและง่ายต่อการดูแล
- แยกส่วนต่างๆ ตามหน้าที่การใช้งาน
- พร้อมสำหรับการพัฒนาต่อยอด

## 🔄 การอัปเดตจากโครงสร้างเก่า

- ย้ายไฟล์ทั้งหมดเข้าสู่โฟลเดอร์ที่เหมาะสม
- อัปเดตพาธทั้งหมดเป็น relative paths
- แยก PWA files ไว้ในโฟลเดอร์ `pwa/`
- จัดระเบียบ CSS/JS ไว้ใน `assets/`
- จัดการข้อมูลหนังไว้ใน `data/playlist/`

---

🎬 **SAMORN Movie** - แพลตฟอร์มสตรีมหนัง VIP ที่ทันสมัยและใช้งานง่าย
