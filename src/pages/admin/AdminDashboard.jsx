import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, events: 0, pendingMedia: 0, pendingComments: 0, pendingProfiles: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const [
      { count: users },
      { count: events },
      { count: pendingMedia },
      { count: pendingComments },
      { count: pendingAvatars },
      { count: pendingPhotos }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('event_media').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).not('avatar_pending', 'is', null),
      supabase.from('photo_library').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ])
    setStats({
      users: users || 0,
      events: events || 0,
      pendingMedia: pendingMedia || 0,
      pendingComments: pendingComments || 0,
      pendingProfiles: (pendingAvatars || 0) + (pendingPhotos || 0)
    })
    setLoading(false)
  }

  const cards = [
    { label: 'Tổng User', value: stats.users, icon: 'group', color: 'bg-primary/10 text-primary' },
    { label: 'Sự kiện', value: stats.events, icon: 'event', color: 'bg-accent-yellow/50 text-yellow-700' },
    { label: 'Chờ duyệt Ảnh/Video', value: stats.pendingMedia, icon: 'photo_library', color: 'bg-accent-green/50 text-green-700' },
    { label: 'Chờ duyệt Lời nhắn', value: stats.pendingComments, icon: 'chat', color: 'bg-orange-100 text-orange-700' },
    { label: 'Chờ duyệt Profile', value: stats.pendingProfiles, icon: 'account_circle', color: 'bg-purple-100 text-purple-700' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-black text-[#121516]">Tổng quan</h2>
        <p className="text-[#67747e] text-sm mt-1">Xin chào Admin!</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#d8dcdf] p-5 animate-pulse h-24"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{card.icon}</span>
              </div>
              <div>
                <p className="text-2xl font-black text-[#121516]">{card.value}</p>
                <p className="text-xs text-[#67747e] font-medium">{card.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
