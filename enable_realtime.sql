-- =============================================
-- BẬT REALTIME cho bảng profiles
-- Chạy trong Supabase SQL Editor
-- =============================================

-- Bật realtime để tự động cập nhật avatar khi admin duyệt
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
