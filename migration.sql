-- =============================================
-- MIGRATION: Hỗ trợ "Người dùng đã xóa"
-- Chạy file này nếu đã chạy schema.sql trước đó
-- Nếu chưa chạy schema.sql thì BỎ QUA file này
-- =============================================

-- Thêm cột lưu tên/avatar lúc upload vào event_media
ALTER TABLE event_media
  ADD COLUMN IF NOT EXISTS uploader_name text,
  ADD COLUMN IF NOT EXISTS uploader_avatar text;

-- Thêm cột lưu tên/avatar lúc comment
ALTER TABLE comments
  ADD COLUMN IF NOT EXISTS commenter_name text,
  ADD COLUMN IF NOT EXISTS commenter_avatar text;

-- Đổi ON DELETE CASCADE → SET NULL cho event_media.user_id
ALTER TABLE event_media
  DROP CONSTRAINT IF EXISTS event_media_user_id_fkey;
ALTER TABLE event_media
  ADD CONSTRAINT event_media_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Đổi ON DELETE CASCADE → SET NULL cho comments.user_id
ALTER TABLE comments
  DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments
  ADD CONSTRAINT comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Cập nhật RLS policy cho event_media (user_id có thể null)
DROP POLICY IF EXISTS "Users can delete own media" ON event_media;
CREATE POLICY "Users can delete own media" ON event_media
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Cập nhật RLS policy cho comments (user_id có thể null)
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
