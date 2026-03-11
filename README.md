# 🏭 VisitorPass — ระบบลงทะเบียนบุคคลภายนอก

## วิธี Deploy บน Vercel (ง่ายที่สุด — ฟรี!)

### ขั้นตอนที่ 1: ติดตั้ง dependencies
```bash
npm install
```

### ขั้นตอนที่ 2: ทดสอบในเครื่องก่อน
```bash
npm run dev
```
เปิด http://localhost:5173

### ขั้นตอนที่ 3: Build
```bash
npm run build
```

### ขั้นตอนที่ 4: Deploy บน Vercel
1. อัปโหลดโฟลเดอร์นี้ขึ้น GitHub
2. ไปที่ vercel.com → Import project
3. กด Deploy → ได้ลิงก์เลย!

---

## โครงสร้างไฟล์
```
visitorpass/
├── index.html          ← HTML หลัก
├── package.json        ← dependencies
├── vite.config.js      ← config
└── src/
    ├── main.jsx        ← entry point
    └── App.jsx         ← แอปทั้งหมด
```

## ฟีเจอร์
- 📝 ฟอร์มกรอกข้อมูลบุคคลภายนอก
- 🔑 หน้า Approve/Reject ของหัวหน้า
- 📊 Admin Dashboard + ค้นหา/กรอง
- 💾 บันทึกข้อมูลใน localStorage
- 📧 ตัวอย่างอีเมลรายงานเช้า

## เชื่อม Email (Google Apps Script)
ดูคู่มือในไฟล์ `visitor-email-setup-guide.html`
