import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function MobileNav() {
  const { user, isAdmin } = useAuth()
  if (!user) return null

  const navItems = [
    { to: '/', label: 'Trang chủ', icon: 'home', end: true },
    { to: '/class-list', label: 'Lớp', icon: 'groups' },
    { to: '/memory', label: 'Kỷ niệm', icon: 'photo_library' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: 'admin_panel_settings' }] : []),
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#d8dcdf] z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-[#67747e]'
              }`
            }
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
