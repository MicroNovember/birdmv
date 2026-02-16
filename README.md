# MovieStream - เว็บไซต์สตรีมหนังและซีรีส์

เว็บไซต์สำหรับการดูหนังและซีรีส์ออนไลน์ สร้างด้วย HTML5, Tailwind CSS และ JavaScript

## 🎬 คุณสมบัณภิมะย์

- **รองรับทั้งหนังและซีรีส์** - แยกประเภทเนื้อหาได้ง่าย
- **Dark Mode สไตล์ Windsurf** - ธีมมืดเป็นค่าเริ่มต้น สวยงามสบายตา
- **ค้นหาขั้นสูง** - ค้นหาได้ทั้งชื่อเรื่อง ประเภท และคะแนน
- **จดจำการดู** - บันทึกว่าดูถึงไหนแล้ว ดูต่อได้ทันที
- **รายการโปรด** - บันทึกหนังและซีรีส์ที่อยากดู
- **Responsive Design** - รองรับทุกขนาดจอ มือถือถึงคอมพิวเตอร์
- **ภาษาไทย** - สนับสนุนใช้ภาษาไทยทั้งหมด

## 🚀 วิธีใช้งาน

### การติดตั้ง
1. Clone หรือ download โปรเจคต์นี้
2. เปิดไฟล์ `index.html` ในเว็บเบราว์เซอร์

### การเพิ่มหนัง/ซีรีส์
แก้ไขไฟล์ `data/content.json` โดยเพิ่มข้อมูลตามรูปแบบ:

```json
{
    "id": "unique-id",
    "type": "movie", // หรือ "series"
    "titleTh": "ชื่อไทย",
    "descriptionTh": "คำอธิบายภาษาไทย",
    "year": 2024,
    "genreTh": ["ประเภท", "อื่นๆ"],
    "rating": "8.5",
    "poster": "URL รูปโปสเตอร์",
    "videoUrl": "URL วิดีโอ",
    "duration": "2:15:00"
}
```

สำหรับซีรีส์:
```json
{
    "id": "series-id",
    "type": "series",
    "titleTh": "ชื่อซีรีส์",
    "seasons": [
        {
            "season": 1,
            "episodes": [
                {
                    "episode": 1,
                    "titleTh": "ชื่อตอน",
                    "descriptionTh": "คำอธิบายตอน",
                    "videoUrl": "URL วิดีโอตอน",
                    "duration": "45:00"
                }
            ]
        }
    ]
}
```

## 🎨 ฟีเจอร์

- **Dark Mode** - เป็นค่าเริ่มต้น สีมืดพร้อมสี accent ม่วง/น้ำเงิน
- **Light Mode** - สลับไปใช้ธีมสว่างได้
- **Responsive** - รองรับมือถือ (2 cols), แท็บเล็ต (3-4 cols), คอมพิวเตอร์ (5 cols)
- **Hover Effects** - การ์ดมีเอฟเฟกต์ hover สวยงาม
- **Smooth Transitions** - การเปลี่ยนหน้านุ่มนวล

## 📁 โครงสร้าง

```
movie-streaming-site/
├── index.html              # หน้าหลัก
├── css/
│   └── style.css          # สไตล์ Tailwind + custom
├── js/
│   └── main.js            # JavaScript หลัก
├── data/
│   └── content.json        # ข้อมูลหนังและซีรีส์
├── assets/
│   ├── images/
│   │   └── posters/       # โปสเตอร์หนัง
│   └── videos/            # วิดีโอไฟล์ (ถ้าต้องการ)
└── README.md               # ไฟล์นี้
```

## 🔧 เทคโนโลยีที่ใช้

- **HTML5** - โครงสร้างหน้าเพจ
- **Tailwind CSS** - CSS framework สำหรับสไตล์
- **Vanilla JavaScript** - ไม่ใช้ framework ใด้ๆ
- **LocalStorage** - บันทึกข้อมูลผู้ใช้ในเบราว์เซอร์

## 🌐 การ Deploy

### GitHub Pages
1. Upload โปรเจคต์ไปยัง GitHub repository
2. ไปที่ Settings > Pages
3. เลือก Source: Deploy from a branch
4. เลือก main branch และ Save
5. เว็บจะพร้อมใช้งานที่ `https://username.github.io/repository-name`

## 📝 License

MIT License - สามารถนำไปใช้งานและดัดแปลงได้

## 🤝 ขอบคุณ

ขอบคุณที่ใช้เว็บไซต์ MovieStream หวังใจว่าจะเป็นประโยชน์ในการดูหนังออนไลน์ของคุณ! 🍿
