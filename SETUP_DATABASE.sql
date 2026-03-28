-- =============================================
-- RAINBOW OF MEMORIES - FULL DATABASE SETUP
-- Chạy file này MỘT LẦN trong Supabase SQL Editor
-- =============================================

-- =============================================
-- PHẦN 1: TẠO BẢNG
-- =============================================

-- 1. Bảng profiles (liên kết với auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  gender text CHECK (gender IN ('male', 'female')),
  birthday date,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  class_role text,
  avatar_url text,
  avatar_pending text,
  created_at timestamptz DEFAULT now()
);

-- 2. Bảng photo_library
CREATE TABLE photo_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at timestamptz DEFAULT now()
);

-- 3. Bảng events
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_url text NOT NULL,
  school_year text NOT NULL CHECK (school_year IN ('class_10', 'class_11', 'class_12')),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- 4. Bảng event_media
CREATE TABLE event_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  uploader_name text,
  uploader_avatar text,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at timestamptz DEFAULT now()
);

-- 5. Bảng comments
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  commenter_name text,
  commenter_avatar text,
  content text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at timestamptz DEFAULT now()
);

-- 6. Bảng notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('media_approved', 'comment_approved', 'avatar_approved', 'photo_approved')),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =============================================
-- PHẦN 2: AUTO-CREATE PROFILE KHI CÓ USER MỚI
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Thành viên'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- PHẦN 3: BẬT ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PHẦN 4: RLS POLICIES
-- =============================================

-- PROFILES
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PHOTO LIBRARY
CREATE POLICY "photo_library_select" ON photo_library FOR SELECT USING (
  status = 'approved' OR user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "photo_library_insert" ON photo_library FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "photo_library_delete" ON photo_library FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "photo_library_update_admin" ON photo_library FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- EVENTS
CREATE POLICY "events_select" ON events FOR SELECT USING (true);
CREATE POLICY "events_insert_admin" ON events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "events_update_admin" ON events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "events_delete_admin" ON events FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- EVENT MEDIA
CREATE POLICY "event_media_select" ON event_media FOR SELECT USING (
  status = 'approved' OR user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "event_media_insert" ON event_media FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "event_media_delete" ON event_media FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "event_media_update_admin" ON event_media FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- COMMENTS
CREATE POLICY "comments_select" ON comments FOR SELECT USING (
  status = 'approved' OR user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "comments_update_admin" ON comments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- NOTIFICATIONS
CREATE POLICY "notifications_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_admin" ON notifications FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- PHẦN 5: STORAGE POLICIES
-- =============================================

-- avatars
CREATE POLICY "avatars_select" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "avatars_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- photo-library
CREATE POLICY "photo_library_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'photo-library');
CREATE POLICY "photo_library_storage_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'photo-library' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "photo_library_storage_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'photo-library' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- event-covers
CREATE POLICY "event_covers_select" ON storage.objects FOR SELECT USING (bucket_id = 'event-covers');
CREATE POLICY "event_covers_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'event-covers'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "event_covers_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'event-covers'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "event_covers_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'event-covers'
  AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- event-media
CREATE POLICY "event_media_storage_select" ON storage.objects FOR SELECT USING (bucket_id = 'event-media');
CREATE POLICY "event_media_storage_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'event-media' AND auth.role() = 'authenticated'
);
CREATE POLICY "event_media_storage_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'event-media'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

-- =============================================
-- PHẦN 6: BẬT REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
