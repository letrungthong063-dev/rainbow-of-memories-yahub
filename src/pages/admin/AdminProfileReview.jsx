import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ConfirmDialog from '../../components/common/ConfirmDialog'

export default function AdminProfileReview() {
  const [pendingAvatars, setPendingAvatars] = useState([])
  const [pendingPhotos, setPendingPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => { fetchPending() }, [])

  async function fetchPending() {
    setLoading(true)
    const [{ data: avatars }, { data: photos }] = await Promise.all([
      supabase.from('profiles')
        .select('id, full_name, avatar_url, avatar_pending')
        .not('avatar_pending', 'is', null),
      supabase.from('photo_library')
        .select('*, profiles(full_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
    ])
    setPendingAvatars(avatars || [])
    setPendingPhotos(photos || [])
    setLoading(false)
  }

  async function approveAvatar(user) {
    try {
      // Lấy path của file pending từ URL
      // URL dạng: .../avatars/pending/{userId}/{fileName}
      const pendingUrl = user.avatar_pending
      const match = pendingUrl.match(/\/avatars\/(pending\/.+)$/)
      if (!match) throw new Error('Không lấy được path file')

      const pendingPath = decodeURIComponent(match[1])
      // Đổi path: pending/{userId}/xxx → approved/{userId}/xxx
      const approvedPath = pendingPath.replace('pending/', 'approved/')

      // Copy file từ pending sang approved
      const { error: copyError } = await supabase.storage
        .from('avatars')
        .copy(pendingPath, approvedPath)

      if (copyError) throw new Error('Lỗi copy file: ' + copyError.message)

      // Lấy URL mới của file approved
      const { data: { publicUrl: approvedUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(approvedPath)

      // Cập nhật avatar_url = URL mới, avatar_pending = null
      await supabase.from('profiles')
        .update({ avatar_url: approvedUrl, avatar_pending: null })
        .eq('id', user.id)

      // Xóa file pending cũ
      await supabase.storage.from('avatars').remove([pendingPath])

      // Xóa avatar approved cũ nếu có (trừ file vừa copy)
      const { data: approvedFiles } = await supabase.storage
        .from('avatars')
        .list(`approved/${user.id}`)
      if (approvedFiles && approvedFiles.length > 1) {
        const newFileName = approvedPath.split('/').pop()
        const toDelete = approvedFiles
          .filter(f => f.name !== newFileName)
          .map(f => `approved/${user.id}/${f.name}`)
        if (toDelete.length > 0) {
          await supabase.storage.from('avatars').remove(toDelete)
        }
      }

      // Gửi thông báo
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'avatar_approved',
        message: 'Ảnh đại diện của bạn đã được duyệt.'
      })

      setPendingAvatars(prev => prev.filter(u => u.id !== user.id))
    } catch (err) {
      alert('Lỗi khi duyệt avatar: ' + err.message)
    }
  }

  function rejectAvatarConfirm(user) {
    setConfirm({
      message: `Từ chối ảnh đại diện của ${user.full_name}?`,
      onConfirm: async () => {
        // Xóa file pending
        const match = user.avatar_pending.match(/\/avatars\/(pending\/.+)$/)
        if (match) {
          await supabase.storage.from('avatars').remove([decodeURIComponent(match[1])])
        }
        await supabase.from('profiles')
          .update({ avatar_pending: null })
          .eq('id', user.id)
        setPendingAvatars(prev => prev.filter(u => u.id !== user.id))
        setConfirm(null)
      }
    })
  }

  async function approvePhoto(photo) {
    await supabase.from('photo_library').update({ status: 'approved' }).eq('id', photo.id)
    await supabase.from('notifications').insert({
      user_id: photo.user_id,
      type: 'photo_approved',
      message: 'Ảnh thư viện của bạn đã được duyệt.'
    })
    setPendingPhotos(prev => prev.filter(p => p.id !== photo.id))
  }

  function rejectPhotoConfirm(photo) {
    setConfirm({
      message: 'Từ chối và xóa ảnh thư viện này?',
      onConfirm: async () => {
        await supabase.from('photo_library').delete().eq('id', photo.id)
        const urlParts = photo.photo_url.split('/photo-library/')
        if (urlParts[1]) await supabase.storage.from('photo-library').remove([decodeURIComponent(urlParts[1])])
        setPendingPhotos(prev => prev.filter(p => p.id !== photo.id))
        setConfirm(null)
      }
    })
  }

  const total = pendingAvatars.length + pendingPhotos.length

  return (
    <div className="flex flex-col gap-6">
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <div>
        <h2 className="text-2xl font-black text-[#121516]">Duyệt Profile</h2>
        <p className="text-[#67747e] text-sm mt-1">{total} mục chờ duyệt</p>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[#67747e]">Đang tải...</div>
      ) : total === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#d8dcdf] text-[#67747e]">
          <span className="material-symbols-outlined text-4xl mb-2 block text-primary/30">check_circle</span>
          Không có gì cần duyệt
        </div>
      ) : (
        <>
          {/* Pending Avatars */}
          {pendingAvatars.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#121516] flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>account_circle</span>
                Ảnh đại diện ({pendingAvatars.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAvatars.map(user => (
                  <div key={user.id} className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm p-5">
                    <p className="font-bold text-[#121516] mb-4">{user.full_name}</p>
                    <div className="flex items-center gap-6 mb-5">
                      {/* Ảnh hiện tại */}
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-xs text-[#67747e]">Hiện tại</p>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-[#d8dcdf]" />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                            {user.full_name?.[0]}
                          </div>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-[#67747e]" style={{ fontSize: '24px' }}>arrow_forward</span>
                      {/* Ảnh mới */}
                      <div className="flex flex-col items-center gap-1">
                        <p className="text-xs text-primary font-semibold">Ảnh mới</p>
                        <img src={user.avatar_pending} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-primary/40" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => approveAvatar(user)}
                        className="flex-1 bg-primary hover:bg-green-600 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                        Duyệt
                      </button>
                      <button onClick={() => rejectAvatarConfirm(user)}
                        className="flex-1 bg-accent-red/10 hover:bg-accent-red text-accent-red hover:text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Photos */}
          {pendingPhotos.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="font-bold text-[#121516] flex items-center gap-2">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>photo_library</span>
                Ảnh thư viện cá nhân ({pendingPhotos.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pendingPhotos.map(photo => (
                  <div key={photo.id} className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm overflow-hidden">
                    <div className="aspect-square overflow-hidden bg-[#f0f0f0]">
                      <img src={photo.photo_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-[#121516] mb-3">{photo.profiles?.full_name}</p>
                      <div className="flex gap-2">
                        <button onClick={() => approvePhoto(photo)}
                          className="flex-1 bg-primary hover:bg-green-600 text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                          Duyệt
                        </button>
                        <button onClick={() => rejectPhotoConfirm(photo)}
                          className="flex-1 bg-accent-red/10 hover:bg-accent-red text-accent-red hover:text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                          Từ chối
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
