import { useState } from 'react'
import { useNotification } from '../../context/NotificationContext'
import { formatDateTime } from '../../utils/formatDate'

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotification()
  const [open, setOpen] = useState(false)

  function toggle() {
    setOpen(prev => !prev)
  }

  async function handleOpen() {
    toggle()
  }

  function getIcon(type) {
    switch (type) {
      case 'media_approved': return 'photo_library'
      case 'comment_approved': return 'chat'
      case 'avatar_approved': return 'account_circle'
      case 'photo_approved': return 'image'
      default: return 'notifications'
    }
  }

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative text-[#67747e] hover:text-primary transition-colors">
        <span className="material-symbols-outlined" style={{fontSize:'24px'}}>notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border border-[#d8dcdf] z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
            <h3 className="font-bold text-[#121516]">Thông báo</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:text-accent-red font-medium transition-colors">
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-[#67747e] text-sm">
                <span className="material-symbols-outlined text-3xl mb-2 block">notifications_none</span>
                Không có thông báo mới
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="px-4 py-3 hover:bg-background-light transition-colors border-b border-[#f0f0f0] last:border-0">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5" style={{fontSize:'20px'}}>{getIcon(n.type)}</span>
                    <div>
                      <p className="text-sm text-[#121516]">{n.message}</p>
                      <p className="text-xs text-[#67747e] mt-1">{formatDateTime(n.created_at)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button onClick={() => setOpen(false)} className="w-full py-2 text-xs text-[#67747e] hover:text-primary transition-colors border-t border-[#f0f0f0]">
            Đóng
          </button>
        </div>
      )}
    </div>
  )
}
