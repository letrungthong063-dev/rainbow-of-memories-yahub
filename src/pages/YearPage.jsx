import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/formatDate'

const YEAR_LABELS = {
  class_10: 'Lớp 10',
  class_11: 'Lớp 11',
  class_12: 'Lớp 12',
}

export default function YearPage() {
  const { year } = useParams()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [year])

  async function fetchEvents() {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('school_year', year)
      .order('created_at', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      <main className="flex-grow w-full px-6 md:px-20 lg:px-40 flex flex-col items-center py-10">
        <div className="max-w-[960px] w-full flex flex-col gap-8">

          <div className="flex justify-start">
            <Link to="/memory" className="inline-flex items-center gap-2 text-primary hover:text-accent-red font-semibold text-sm transition-colors group">
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" style={{ fontSize: '20px' }}>arrow_back</span>
              Quay lại
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-[#121516] text-3xl font-black tracking-tight">{YEAR_LABELS[year] || year}</h2>
            <p className="text-[#67747e]">{events.length} sự kiện</p>
            <div className="w-16 h-1 bg-accent-red rounded-full"></div>
          </div>

          {loading ? <LoadingSpinner /> : events.length === 0 ? (
            <div className="text-center py-16 text-[#67747e]">
              <span className="material-symbols-outlined text-5xl mb-3 block text-primary/30">event_busy</span>
              Chưa có sự kiện nào
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map(event => (
                <Link
                  key={event.id}
                  to={`/event/${event.id}`}
                  className="group bg-white rounded-xl border border-[#d8dcdf] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="h-48 overflow-hidden bg-[#f0f0f0]">
                    {event.cover_url ? (
                      <img src={event.cover_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <span className="material-symbols-outlined text-primary/30" style={{ fontSize: '48px' }}>image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#121516] text-lg group-hover:text-primary transition-colors">{event.title}</h3>
                    {event.description && (
                      <p className="text-[#67747e] text-sm mt-2 line-clamp-2">{event.description}</p>
                    )}
                    <p className="text-xs text-[#67747e] mt-3 flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_month</span>
                      {formatDate(event.created_at)}
                    </p>
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
