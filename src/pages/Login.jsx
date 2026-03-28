import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-accent-yellow p-3 rounded-xl text-primary shadow-sm mb-4">
            <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>school</span>
          </div>
          <h1 className="text-primary text-2xl font-black tracking-tight">Rainbow of Memories</h1>
          <p className="text-[#67747e] text-sm mt-1">Đăng nhập để tiếp tục</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-[#d8dcdf] p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-red-50 border border-accent-red/30 text-accent-red text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#121516]">Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#67747e]" style={{ fontSize: '20px' }}>mail</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-[#d8dcdf] rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#121516]">Mật khẩu</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#67747e]" style={{ fontSize: '20px' }}>lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-10 py-3 border border-[#d8dcdf] rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#67747e] hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-accent-red text-white py-3 rounded-lg font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#67747e] text-xs mt-6">
          Quên mật khẩu? Liên hệ admin để được hỗ trợ.
        </p>
      </div>
    </div>
  )
}
