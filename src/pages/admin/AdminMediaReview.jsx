import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDateTime } from '../../utils/formatDate'
import ConfirmDialog from '../../components/common/ConfirmDialog'

export default function AdminMediaReview() {
  const [tab, setTab] = useState('pending') // 'pending' | 'approved'
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from('event_media')
        .select('*, profiles(full_name, avatar_url), events(title)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
      supabase.from('event_media')
        .select('*, profiles(full_name, avatar_url), events(title)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
    ])
    setPending(p || [])
    setApproved(a || [])
    setLoading(false)
  }

  async function approve(item) {
    await supabase.from('event_media').update({ status: 'approved' }).eq('id', item.id)
    if (item.user_id) {
      await supabase.from('notifications').insert({
        user_id: item.user_id,
        type: 'media_approved',
        message: `Ảnh/video của bạn trong sự kiện "${item.events?.title}" đã được duyệt.`
      })
    }
    setPending(prev => prev.filter(i => i.id !== item.id))
    setApproved(prev => [{ ...item, status: 'approved' }, ...prev])
  }

  async function reject(item) {
    setConfirm({
      message: 'Từ chối và xóa ảnh/video này?',
      onConfirm: async () => {
        await supabase.from('event_media').delete().eq('id', item.id)
        const urlParts = item.media_url.split('/event-media/')
        if (urlParts[1]) await supabase.storage.from('event-media').remove([decodeURIComponent(urlParts[1])])
        setPending(prev => prev.filter(i => i.id !== item.id))
        setConfirm(null)
      }
    })
  }

  async function deleteApproved(item) {
    setConfirm({
      message: 'Xóa ảnh/video đã duyệt này? Hành động không thể hoàn tác.',
      onConfirm: async () => {
        await supabase.from('event_media').delete().eq('id', item.id)
        const urlParts = item.media_url.split('/event-media/')
        if (urlParts[1]) await supabase.storage.from('event-media').remove([decodeURIComponent(urlParts[1])])
        setApproved(prev => prev.filter(i => i.id !== item.id))
        setConfirm(null)
      }
    })
  }

  function UploaderName({ item }) {
    const name = item.profiles?.full_name || item.uploader_name || 'Người dùng đã xóa'
    const avatar = item.profiles?.avatar_url || item.uploader_avatar || null
    return (
      <div className="flex items-center gap-2">
        {avatar
          ? <img src={avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
          : <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{name[0]}</div>
        }
        <span className="text-sm font-medium text-[#121516]">{name}</span>
      </div>
    )
  }

  const items = tab === 'pending' ? pending : approved

  return (
    <div className="flex flex-col gap-6">
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <div>
        <h2 className="text-2xl font-black text-[#121516]">Quản lý Ảnh / Video</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#d8dcdf]">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${tab === 'pending' ? 'border-primary text-primary' : 'border-transparent text-[#67747e] hover:text-primary'}`}
        >
          Chờ duyệt
          {pending.length > 0 && (
            <span className="ml-2 bg-accent-red text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{pending.length}</span>
          )}
        </button>
        <button
          onClick={() => setTab('approved')}
          className={`px-4 py-2.5 text-sm font-bold transition-colors border-b-2 -mb-px ${tab === 'approved' ? 'border-primary text-primary' : 'border-transparent text-[#67747e] hover:text-primary'}`}
        >
          Đã duyệt
          <span className="ml-2 text-xs text-[#67747e] font-normal">({approved.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-[#67747e]">Đang tải...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#d8dcdf] text-[#67747e]">
          <span className="material-symbols-outlined text-4xl mb-2 block text-primary/30">
            {tab === 'pending' ? 'check_circle' : 'photo_library'}
          </span>
          {tab === 'pending' ? 'Không có gì cần duyệt' : 'Chưa có ảnh/video nào được duyệt'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm overflow-hidden">
              <div className="aspect-video bg-[#f0f0f0] overflow-hidden">
                {item.media_type === 'video'
                  ? <video src={item.media_url} className="w-full h-full object-cover" controls />
                  : <img src={item.media_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                }
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <UploaderName item={item} />
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${item.media_type === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-accent-green/50 text-green-700'}`}>
                    {item.media_type === 'video' ? 'Video' : 'Ảnh'}
                  </span>
                </div>
                <p className="text-xs text-[#67747e] mb-1">Sự kiện: <span className="font-medium">{item.events?.title}</span></p>
                <p className="text-xs text-[#67747e] mb-4">{formatDateTime(item.created_at)}</p>

                {tab === 'pending' ? (
                  <div className="flex gap-2">
                    <button onClick={() => approve(item)} className="flex-1 bg-primary hover:bg-green-600 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                      Duyệt
                    </button>
                    <button onClick={() => reject(item)} className="flex-1 bg-accent-red/10 hover:bg-accent-red text-accent-red hover:text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                      Từ chối
                    </button>
                  </div>
                ) : (
                  <button onClick={() => deleteApproved(item)} className="w-full bg-accent-red/10 hover:bg-accent-red text-accent-red hover:text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    Xóa
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
