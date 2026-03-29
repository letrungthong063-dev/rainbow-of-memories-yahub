import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/formatDate'

export default function ClassList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [])

  async function fetchStudents() {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, class_role, gender, birthday')
      .order('full_name')
    setStudents(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      <main className="flex-grow w-full px-6 md:px-20 lg:px-40 flex flex-col items-center py-10">
        <div className="max-w-[960px] w-full flex flex-col gap-8">

          {/* Back + Title */}
          <div className="flex justify-start">
            <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-accent-red font-semibold text-sm transition-colors group">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" style={{ fontSize: '20px' }}>arrow_back</span>
              Quay lại
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[#121516] text-3xl font-black tracking-tight">Danh Sách Lớp</h2>
            <p className="text-[#67747e]">{students.length} thành viên</p>
            <div className="w-16 h-1 bg-accent-red rounded-full"></div>
          </div>

          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {students.map(student => (
                <Link
                  key={student.id}
                  to={`/profile/${student.id}`}
                  className="group bg-white rounded-xl border border-[#d8dcdf] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-square overflow-hidden rounded-t-xl bg-[#f0f0f0]">
                    {student.avatar_url ? (
                      <img
                        src={student.avatar_url}
                        alt={student.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-4xl font-black text-primary/40">{student.full_name?.[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-[#121516] text-sm truncate group-hover:text-primary transition-colors">{student.full_name}</p>
                    <p className="text-xs text-[#67747e] mt-0.5">{student.class_role || 'Thành viên'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
                    }
                  
