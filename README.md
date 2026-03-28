# 🌈 Rainbow of Memories

Web lưu giữ kỷ niệm lớp học — React + Vite + Tailwind + Supabase.

---

## 🚀 Cài đặt & Chạy (Termux)

```bash
# 1. Cài Node.js (nếu chưa có)
pkg update && pkg upgrade
pkg install nodejs

# 2. Giải nén và cài dependencies
unzip rainbow-of-memories.zip
cd rainbow-of-memories
npm install

# 3. Chạy dev server
npm run dev
# Truy cập: http://localhost:5173
```

---

## 🗄️ Cài đặt Supabase

### Bước 1: Tạo bảng
Vào **Supabase Dashboard > SQL Editor**, copy toàn bộ nội dung file `schema.sql` và chạy.

> Nếu đã chạy `schema.sql` từ phiên bản cũ hơn, hãy chạy thêm `migration.sql` để cập nhật.

### Bước 2: Tạo Storage Buckets
Vào **Supabase Dashboard > Storage**, tạo 4 bucket **(đặt là Public)**:
- `avatars`
- `photo-library`
- `event-covers`
- `event-media`

### Bước 3: Tạo tài khoản Admin đầu tiên
1. Vào **Supabase Dashboard > Authentication > Users**
2. Tạo user mới (email + password)
3. Vào **Table Editor > profiles**
4. Tìm user vừa tạo, đổi cột `role` thành `admin`
5. Điền thêm `full_name`, `gender`, `birthday`, `class_role`

---

## 🔧 Edge Functions (Tạo/đổi mật khẩu user)

Xem hướng dẫn chi tiết trong file `EDGE_FUNCTIONS.md`.

Nếu chưa deploy Edge Functions, admin vẫn có thể quản lý user trực tiếp tại:
**Supabase Dashboard → Authentication → Users**

---

## 📦 Deploy lên Render

1. Push code lên GitHub
2. Vào [render.com](https://render.com) → **New → Static Site**
3. Kết nối repo GitHub — Render tự đọc `render.yaml`
4. Vào **Environment** → thêm 2 biến môi trường:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

---

## 📁 Cấu trúc thư mục

```
src/
├── components/
│   ├── auth/           # ProtectedRoute
│   └── common/         # Header, Footer, MobileNav, LoadingSpinner
│                         NotificationBell, ConfirmDialog, ImageModal
│                         ErrorBoundary
├── context/            # AuthContext, NotificationContext
├── lib/                # supabase.js
├── pages/
│   ├── admin/          # Dashboard, Users, Events, Reviews
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── ClassList.jsx
│   ├── ProfilePage.jsx
│   ├── MemoryPage.jsx
│   ├── YearPage.jsx
│   ├── EventPage.jsx
│   └── NotFound.jsx
└── utils/              # formatDate, fileValidation
supabase/
└── functions/
    ├── admin-create-user/
    └── admin-update-password/
schema.sql              # Tạo database từ đầu
migration.sql           # Cập nhật nếu đã có schema cũ
render.yaml             # Config deploy Render
```

---

## 🔑 Tính năng

| Tính năng | User | Admin |
|---|---|---|
| Xem danh sách lớp | ✅ | ✅ |
| Xem profile người khác | ✅ | ✅ |
| Đổi avatar | ✅ (cần duyệt) | ✅ |
| Upload ảnh thư viện (tối đa 4) | ✅ (cần duyệt) | ✅ |
| Upload ảnh/video sự kiện | ✅ (cần duyệt) | ✅ |
| Comment sự kiện | ✅ (cần duyệt) | ✅ |
| Xóa nội dung của mình | ✅ | ✅ |
| Tạo/sửa/xóa sự kiện | ❌ | ✅ |
| Duyệt ảnh/video/comment/profile | ❌ | ✅ |
| Quản lý tài khoản | ❌ | ✅ |
| Thông báo khi được duyệt | ✅ | ❌ |

---

## 💡 Lưu ý

- Khi xóa tài khoản user, **ảnh và lời nhắn của họ vẫn được giữ lại** và hiển thị là *"Người dùng đã xóa"*
- Video tối đa **50MB**, ảnh không giới hạn
- Thư viện ảnh cá nhân tối đa **4 ảnh** (kể cả ảnh đang chờ duyệt)
# rainbow-of-memories-yahub
