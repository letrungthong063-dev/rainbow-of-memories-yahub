import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { formatDate } from '../utils/formatDate'
import { validateImage } from '../utils/fileValidation'

export default function ProfilePage() {
  const { id } = useParams()
  const { user, profile: myProfile, fetchProfile, refreshProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [confirm, setConfirm] = useState(null)
  const avatarInputRef = useRef()
  const photoInputRef = useRef()

  const isOwner = user?.id === id

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    setLoading(true)
    const [{ data: profileData }, { data: photoData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('photo_library').select('*').eq('user_id', id).eq('status', 'approved').order('created_at')
    ])
    setProfile(profileData)
    setPhotos(photoData || [])
    setLoading(false)
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const err = validateImage(file)
    if (err) { setMessage(err); return }

    setUploading(true)
    setMessage('')

    try {
      // Xóa tất cả file pending cũ của user này
      const { data: oldFiles } = await supabase.storage
        .from('avatars')
        .list(`pending/${user.id}`)
      if (oldFiles && oldFiles.length > 0) {
        const toDelete = oldFiles.map(f => `pending/${user.id}/${f.name}`)
        await supabase.storage.from('avatars').remove(toDelete)
      }

      // Upload vào folder pending/
      const ext = file.name.split('.').pop().toLowerCase()
      const fileName = `${Date.now()}.${ext}`
      const path = `pending/${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file)

      if (uploadError) throw new Error('Lỗi upload: ' + uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      // Lưu URL pending vào database
      await supabase.from('profiles')
        .update({ avatar_pending: publicUrl })
        .eq('id', user.id)

      setMessage('✅ Ảnh đại diện đã được gửi, chờ admin duyệt.')
    } catch (err) {
      setMessage('Lỗi: ' + err.message)
    }

    setUploading(false)
    e.target.value = ''
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    const { count } = await supabase
      .from('photo_library')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count || 0) >= 4) {
      setMessage('Thư viện đã đủ 4 ảnh. Hãy xóa ảnh cũ trước.')
      return
    }

    const err = validateImage(file)
    if (err) { setMessage(err); return }

    setUploading(true)
    setMessage('')

    const photoId = crypto.randomUUID()
    const ext = file.name.split('.').pop().toLowerCase()
    const path = `${user.id}/${photoId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('photo-library')
      .upload(path, file)

    if (uploadError) { setMessage('Lỗi upload ảnh.'); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('photo-library')
      .getPublicUrl(path)

    await supabase.from('photo_library').insert({
      id: photoId,
      user_id: user.id,
      photo_url: publicUrl,
      status: 'pending'
    })

    setMessage('✅ Ảnh đã được gửi, chờ admin duyệt.')
    setUploading(false)
    fetchData()
  }

  function confirmDeletePhoto(photo) {
    setConfirm({
      message: 'Bạn có chắc muốn xóa ảnh này không?',
      onConfirm: async () => {
        await supabase.from('photo_library').delete().eq('id', photo.id)
        const urlParts = photo.photo_url.split('/photo-library/')
        if (urlParts[1]) await supabase.storage.from('photo-library').remove([decodeURIComponent(urlParts[1])])
        setPhotos(prev => prev.filter(p => p.id !== photo.id))
        setConfirm(null)
      }
    })
  }

  function getGenderLabel(gender) {
    if (gender === 'male') return 'Nam'
    if (gender === 'female') return 'Nữ'
    return gender || '—'
  }

  if (loading) return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header /><LoadingSpinner />
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <p className="text-[#67747e]">Không tìm thấy thành viên này.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      <main className="flex-grow w-full px-6 md:px-20 lg:px-40 flex flex-col items-center py-10">
        <div className="max-w-[800px] w-full flex flex-col gap-8">

          <div className="flex justify-start">
            <Link to="/class-list" className="inline-flex items-center gap-2 text-primary hover:text-accent-red font-semibold text-sm transition-colors group">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" style={{ fontSize: '20px' }}>arrow_back</span>
              Quay lại
            </Link>
          </div>

          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-accent-red border border-accent-red/20'}`}>
              {message}
            </div>
          )}

          {/* Profile Card */}
          <section className="w-full bg-white rounded-xl shadow-sm border border-[#d8dcdf] overflow-hidden p-8 md:p-12 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent-green/30 to-transparent rounded-bl-full -mr-10 -mt-10 opacity-60"></div>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 relative z-10">

              {/* Avatar */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-[#F5F4F0] shadow-md overflow-hidden bg-gray-100">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <span className="text-5xl font-black text-primary/40">{profile.full_name?.[0]}</span>
                    </div>
                  )}
                </div>
                {isOwner && (
                  <>
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploading}
                      className="text-xs text-primary hover:text-accent-red font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>photo_camera</span>
                      {uploading ? 'Đang tải...' : 'Đổi ảnh đại diện'}
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    {profile.avatar_pending && (
                      <p className="text-xs text-orange-500 font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                        Đang chờ duyệt
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Info */}
              <div className="flex-grow text-center md:text-left w-full">
                <div className="border-b border-[#f0f0f0] pb-5 mb-6">
                  <h2 className="text-[#121516] text-3xl md:text-4xl font-black tracking-tight">{profile.full_name}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-[#67747e] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>calendar_month</span>
                      Ngày sinh
                    </span>
                    <span className="text-lg font-medium text-[#121516]">{formatDate(profile.birthday) || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-[#67747e] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>wc</span>
                      Giới tính
                    </span>
                    <span className="text-lg font-medium text-[#121516]">{getGenderLabel(profile.gender)}</span>
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-xs font-bold text-[#67747e] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: '16px' }}>badge</span>
                      Chức vụ trong lớp
                    </span>
                    <div className="mt-1 flex justify-center md:justify-start">
                      <span className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 text-primary px-4 py-2 rounded-lg font-bold">
                        <span className="material-symbols-outlined text-accent-red" style={{ fontSize: '20px' }}>star</span>
                        {profile.class_role || 'Thành viên'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Photo Library */}
          <section className="w-full bg-white rounded-xl shadow-sm border border-[#d8dcdf] overflow-hidden p-8 md:p-12 relative">
            <div className="border-b border-[#f0f0f0] pb-5 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-accent-yellow/30 p-2 rounded-lg text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>photo_library</span>
                </div>
                <h3 className="text-[#121516] text-2xl font-bold tracking-tight">Thư viện ảnh</h3>
              </div>
              {isOwner && photos.length < 4 && (
                <>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-primary hover:bg-accent-red text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_photo_alternate</span>
                    Thêm ảnh
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden relative group">
                  <img src={photo.photo_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  {isOwner && (
                    <button
                      onClick={() => confirmDeletePhoto(photo)}
                      className="absolute top-2 right-2 bg-accent-red text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    </button>
                  )}
                </div>
              ))}
              {photos.length === 0 && (
                <div className="aspect-square rounded-lg bg-[#F5F4F0] border border-dashed border-primary/30 flex flex-col items-center justify-center text-primary/60">
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add_photo_alternate</span>
                  <span className="text-xs font-semibold mt-2">Chưa có ảnh</span>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
