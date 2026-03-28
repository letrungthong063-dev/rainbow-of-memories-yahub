import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      <main className="flex-grow w-full px-6 md:px-20 lg:px-40 flex flex-col items-center py-10">
        <div className="max-w-[960px] w-full flex flex-col gap-12">

          {/* Hero */}
          <section className="flex flex-col gap-4 text-center items-center max-w-2xl mx-auto pt-8">
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-[#121516] text-3xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                Chào mừng đến đây
              </h2>
              <div className="w-24 h-1.5 bg-accent-red rounded-full mt-2"></div>
            </div>
            <p className="text-primary/80 text-lg font-medium leading-relaxed max-w-xl mt-4">
              Nơi lưu giữ những ký ức đẹp nhất của tuổi học trò. <br className="hidden md:block" />
              Hãy cùng nhau nhìn lại chặng đường đã qua và kết nối lại tình bạn.
            </p>
            {!user && (
              <Link
                to="/login"
                className="mt-4 bg-primary hover:bg-accent-red text-white px-8 py-3 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-md"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                Đăng nhập ngay
              </Link>
            )}
          </section>

          {/* Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 w-full">
            {/* Góc kỷ niệm */}
            <div className="group flex flex-col items-start gap-6 p-8 rounded-xl bg-white border border-[#d8dcdf] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-yellow/30 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-yellow text-primary z-10 shadow-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>photo_library</span>
              </div>
              <div className="flex flex-col gap-3 z-10">
                <h3 className="text-2xl font-bold text-[#121516] group-hover:text-[#3e5366] transition-colors">Góc Kỷ Niệm</h3>
                <p className="text-[#67747e] text-base leading-relaxed">
                  Tổng hợp hình ảnh, video và những câu chuyện đáng nhớ từ những ngày tháng còn ngồi trên ghế nhà trường.
                </p>
              </div>
              <Link
                to="/memory"
                className="mt-auto bg-primary hover:bg-accent-red text-white px-6 py-3 rounded-lg font-bold text-sm tracking-wide transition-colors flex items-center gap-2 z-10 shadow-md hover:shadow-lg"
              >
                <span>Xem Thư Viện</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </Link>
            </div>

            {/* Thành viên lớp */}
            <div className="group flex flex-col items-start gap-6 p-8 rounded-xl bg-white border border-[#d8dcdf] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-green/40 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent-green text-primary z-10 shadow-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>groups</span>
              </div>
              <div className="flex flex-col gap-3 z-10">
                <h3 className="text-2xl font-bold text-[#121516] group-hover:text-[#3e5366] transition-colors">Thành Viên Lớp</h3>
                <p className="text-[#67747e] text-base leading-relaxed">
                  Danh sách đầy đủ thành viên trong lớp, thông tin cá nhân và chức vụ mỗi thành viên.
                </p>
              </div>
              <Link
                to="/class-list"
                className="mt-auto bg-primary hover:bg-accent-red text-white px-6 py-3 rounded-lg font-bold text-sm tracking-wide transition-colors flex items-center gap-2 z-10 shadow-md hover:shadow-lg"
              >
                <span>Xem Danh Sách</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
