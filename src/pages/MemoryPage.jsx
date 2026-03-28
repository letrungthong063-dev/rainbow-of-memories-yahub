import { Link } from 'react-router-dom'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'

const YEARS = [
  { key: 'class_10', label: 'Lớp 10', icon: 'looks_one', color: 'bg-accent-yellow', desc: 'Năm học đầu tiên — bắt đầu hành trình' },
  { key: 'class_11', label: 'Lớp 11', icon: 'looks_two', color: 'bg-accent-green', desc: 'Năm học thứ hai — những kỷ niệm khó quên' },
  { key: 'class_12', label: 'Lớp 12', icon: 'looks_3', color: 'bg-primary/20', desc: 'Năm cuối — ký ức mãi đẹp trong tim' },
]

export default function MemoryPage() {
  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      <main className="flex-grow w-full px-6 md:px-20 lg:px-40 flex flex-col items-center py-10">
        <div className="max-w-[960px] w-full flex flex-col gap-8">

          <div className="flex justify-start">
            <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-accent-red font-semibold text-sm transition-colors group">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" style={{ fontSize: '20px' }}>arrow_back</span>
              Quay lại
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[#121516] text-3xl font-black tracking-tight">Góc Kỷ Niệm</h2>
            <p className="text-[#67747e]">Chọn năm học để xem các sự kiện</p>
            <div className="w-16 h-1 bg-accent-red rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {YEARS.map(year => (
              <Link
                key={year.key}
                to={`/memory/${year.key}`}
                className="group flex flex-col items-start gap-5 p-8 rounded-xl bg-white border border-[#d8dcdf] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-20 h-20 ${year.color} rounded-bl-full -mr-4 -mt-4 opacity-40 group-hover:scale-110 transition-transform`}></div>
                <div className={`flex items-center justify-center w-14 h-14 rounded-full ${year.color} text-primary z-10 shadow-sm`}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{year.icon}</span>
                </div>
                <div className="flex flex-col gap-2 z-10">
                  <h3 className="text-xl font-bold text-[#121516] group-hover:text-primary transition-colors">{year.label}</h3>
                  <p className="text-[#67747e] text-sm leading-relaxed">{year.desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-1 text-primary text-sm font-semibold z-10 group-hover:gap-2 transition-all">
                  Xem sự kiện
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
