import { NavLink, Outlet } from 'react-router-dom'
import Header from '../../components/common/Header'
import Footer from '../../components/common/Footer'

const NAV = [
  { to: '/admin', label: 'Tổng quan', icon: 'dashboard', end: true },
  { to: '/admin/users', label: 'Quản lý User', icon: 'manage_accounts' },
  { to: '/admin/events', label: 'Quản lý Sự kiện', icon: 'event' },
  { to: '/admin/media-review', label: 'Duyệt Ảnh/Video', icon: 'photo_library' },
  { to: '/admin/comment-review', label: 'Duyệt Lời nhắn', icon: 'chat' },
  { to: '/admin/profile-review', label: 'Duyệt Profile', icon: 'account_circle' },
]

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 gap-6">

        {/* Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f0f0f0] bg-primary/5">
              <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>admin_panel_settings</span>
                Trang Quản Trị
              </p>
            </div>
            <nav className="py-2">
              {NAV.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary border-r-2 border-primary' : 'text-[#67747e] hover:bg-[#f5f4f0] hover:text-primary'}`
                  }
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-grow min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
