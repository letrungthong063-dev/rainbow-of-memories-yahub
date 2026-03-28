import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background-light flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-accent-yellow p-4 rounded-2xl text-primary shadow-sm mb-6">
        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>search_off</span>
      </div>
      <h1 className="text-6xl font-black text-primary mb-3">404</h1>
      <p className="text-[#121516] text-xl font-bold mb-2">Trang không tồn tại</p>
      <p className="text-[#67747e] mb-8">Trang bạn tìm kiếm đã bị xóa hoặc không tồn tại.</p>
      <Link
        to="/"
        className="bg-primary hover:bg-accent-red text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>home</span>
        Về trang chủ
      </Link>
    </div>
  )
}
