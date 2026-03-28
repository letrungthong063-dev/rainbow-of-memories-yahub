-- =============================================
-- FIX: Cho phép admin xóa comment và media
-- Chạy trong Supabase SQL Editor
-- =============================================

-- ---- FIX comments ----
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

CREATE POLICY "Users or admin can delete comments" ON comments
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---- FIX event_media ----
DROP POLICY IF EXISTS "Users can delete own media" ON event_media;

CREATE POLICY "Users or admin can delete media" ON event_media
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---- FIX photo_library (admin xóa ảnh thư viện user) ----
DROP POLICY IF EXISTS "Users can delete own photos" ON photo_library;

CREATE POLICY "Users or admin can delete photos" ON photo_library
  FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
