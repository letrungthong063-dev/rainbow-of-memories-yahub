# 🔧 Hướng dẫn Deploy Edge Functions

Edge Functions cho phép admin tạo tài khoản và đổi mật khẩu user từ giao diện web.

---

## Bước 1: Cài Supabase CLI

```bash
# Trên Termux
pkg install nodejs
npm install -g supabase
```

---

## Bước 2: Đăng nhập Supabase CLI

```bash
supabase login
```
Trình duyệt sẽ mở ra, đăng nhập vào tài khoản Supabase.

---

## Bước 3: Liên kết project

```bash
cd rainbow-of-memories
supabase link --project-ref nqrwrbqbhjvrclisrrjv
```

---

## Bước 4: Deploy Edge Functions

```bash
supabase functions deploy admin-create-user
supabase functions deploy admin-update-password
```

---

## Bước 5: Kiểm tra

Vào **Supabase Dashboard > Edge Functions**, kiểm tra 2 function đã xuất hiện chưa.

---

## ⚠️ Lưu ý quan trọng

Supabase tự động inject `SUPABASE_SERVICE_ROLE_KEY` vào Edge Functions,
bạn **không cần** thêm tay — chỉ cần deploy là dùng được.

---

## Nếu không muốn dùng Edge Functions

Admin vẫn có thể quản lý user trực tiếp tại:
**Supabase Dashboard → Authentication → Users**
- Tạo user mới bằng nút **"Add user"**
- Đổi mật khẩu bằng nút **"Send password reset"** hoặc chỉnh trực tiếp
- Sau khi tạo, vào **Table Editor → profiles** để điền thêm thông tin
