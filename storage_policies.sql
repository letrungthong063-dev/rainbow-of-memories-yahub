-- =============================================
-- STORAGE POLICIES
-- Chạy file này trong Supabase SQL Editor
-- =============================================

-- ---- BUCKET: avatars ----
CREATE POLICY "Avatar public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Avatar upload by owner" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatar update by owner" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatar delete by owner" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---- BUCKET: photo-library ----
CREATE POLICY "Photo library public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'photo-library');

CREATE POLICY "Photo library upload by owner" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'photo-library'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Photo library delete by owner" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'photo-library'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---- BUCKET: event-covers ----
CREATE POLICY "Event covers public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-covers');

CREATE POLICY "Event covers upload by admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-covers'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Event covers update by admin" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-covers'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Event covers delete by admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-covers'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ---- BUCKET: event-media ----
CREATE POLICY "Event media public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-media');

CREATE POLICY "Event media upload by authenticated" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-media'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Event media delete by uploader or admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'event-media'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- =============================================
-- FIX: Cho phép admin copy file avatar (pending → approved)
-- =============================================

-- Admin đọc tất cả file trong avatars (để copy)
CREATE POLICY "Admin can read all avatars" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin upload vào folder approved/
CREATE POLICY "Admin can upload approved avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin xóa file avatar bất kỳ
CREATE POLICY "Admin can delete any avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
