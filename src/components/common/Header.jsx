import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from './NotificationBell'

export default function Header() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="w-full px-6 py-4 md:px-20 lg:px-40 flex justify-center bg-background-light border-b border-[#d8dcdf]">
      <div className="max-w-[960px] w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="bg-accent-yellow p-2 rounded-lg text-primary shadow-sm hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined" style={{fontSize:'28px'}}>school</span>
          </div>
          <h1 className="text-primary text-xl font-bold tracking-tight">Rainbow of Memories</h1>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-[#67747e]">
                <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                <Link to="/class-list" className="hover:text-primary transition-colors">Danh sách lớp</Link>
                <Link to="/memory" className="hover:text-primary transition-colors">Kỷ niệm</Link>
                {isAdmin && (
                  <Link to="/admin" className="hover:text-accent-red text-accent-red font-bold transition-colors">Admin</Link>
                )}
              </nav>
              <NotificationBell />
              <Link to={`/profile/${profile?.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-primary/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {profile?.full_name?.[0] || '?'}
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-[#121516]">{profile?.full_name}</span>
              </Link>
              <button onClick={handleSignOut} className="text-[#67747e] hover:text-accent-red transition-colors" title="Đăng xuất">
                <span className="material-symbols-outlined" style={{fontSize:'22px'}}>logout</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-primary hover:bg-accent-red text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
