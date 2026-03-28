import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDateTime } from '../../utils/formatDate'
import ConfirmDialog from '../../components/common/ConfirmDialog'

export default function AdminCommentReview() {
  const [tab, setTab] = useState('pending')
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from('comments')
        .select('*, profiles(full_name, avatar_url), events(title)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true }),
      supabase.from('comments')
        .select('*, profiles(full_name, avatar_url), events(title)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
    ])
    setPending(p || [])
    setApproved(a || [])
    setLoading(false)
  }

  async function approve(item) {
    await supabase.from('comments').update({ status: 'approved' }).eq('id', item.id)
    if (item.user_id) {
      await supabase.from('notifications').insert({
        user_id: item.user_id,
        type: 'comment_approved',
        message: `Lời nhắn của bạn trong sự kiện "${item.events?.title}" đã được duyệt.`
      })
    }
    setPending(prev => prev.filter(i => i.id !== item.id))
    setApproved(prev => [{ ...item, status: 'approved' }, ...prev])
  }

  function rejectItem(item) {
    setConfirm({
      message: 'Từ chối và xóa lời nhắn này?',
      onConfirm: async () => {
        await supabase.from('comments').delete().eq('id', item.id)
        setPending(prev => prev.filter(i => i.id !== item.id))
        setConfirm(null)
      }
    })
  }

  function deleteApproved(item) {
    setConfirm({
      message: 'Xóa lời nhắn đã duyệt này?',
      onConfirm: async () => {
        await supabase.from('comments').delete().eq('id', item.id)
        setApproved(prev => prev.filter(i => i.id !== item.id))
        setConfirm(null)
      }
    })
  }

  function CommenterName({ item }) {
    const name = item.profiles?.full_name || item.commenter_name || 'Người dùng đã xóa'
    const avatar = item.profiles?.avatar_url || item.commenter_avatar || null
    const isDeleted = !item.user_id
    return (
      <div className="flex items-center gap-2">
        {avatar
          ? <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          : <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isDeleted ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'}`}>{isDeleted ? '?' : name[0]}</div>
        }
        <div>
          <p className={`text-sm font-bold ${isDeleted ? 'text-gray-400 italic' : 'text-[#121516]'}`}>{name}</p>
          <p className="text-xs text-primary">{item.events?.title}</p>
        </div>
      </div>
    )
  }

  const items = tab === 'pending' ? pending : approved

  return (
    <div className="flex flex-col gap-6">
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <div>
        <h2 className="text-2xl font-black text-[#121516]">Quản lý Lời nhắn</h2>
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
            {tab === 'pending' ? 'check_circle' : 'chat_bubble_outline'}
          </span>
          {tab === 'pending' ? 'Không có lời nhắn nào cần duyệt' : 'Chưa có lời nhắn nào được duyệt'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm p-5">
              <div className="flex items-start gap-3 mb-3">
                <CommenterName item={item} />
                <span className="ml-auto text-xs text-[#67747e] flex-shrink-0">{formatDateTime(item.created_at)}</span>
              </div>
              <p className="text-sm text-[#121516] leading-relaxed bg-[#f5f4f0] rounded-xl px-4 py-3 mb-3">{item.content}</p>

              {tab === 'pending' ? (
                <div className="flex gap-2 justify-end">
                  <button onClick={() => approve(item)} className="bg-primary hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                    Duyệt
                  </button>
                  <button onClick={() => rejectItem(item)} className="bg-accent-red/10 hover:bg-accent-red text-accent-red hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                    Từ chối
                  </button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button onClick={() => deleteApproved(item)} className="bg-accent-red/10 hover:bg-accent-red text-accent-red hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
