import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/formatDate'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const YEAR_LABELS = { class_10: 'Lớp 10', class_11: 'Lớp 11', class_12: 'Lớp 12' }
const EMPTY_FORM = { title: '', description: '', school_year: 'class_10', cover: null }

export default function AdminEvents() {
  const { profile } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editEvent, setEditEvent] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [preview, setPreview] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const coverRef = useRef()

  useEffect(() => { fetchEvents() }, [])

  async function fetchEvents() {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditEvent(null)
    setForm(EMPTY_FORM)
    setPreview(null)
    setMsg('')
    setShowForm(true)
  }

  function openEdit(event) {
    setEditEvent(event)
    setForm({ title: event.title, description: event.description || '', school_year: event.school_year, cover: null })
    setPreview(event.cover_url)
    setMsg('')
    setShowForm(true)
  }

  function handleCoverChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setForm(p => ({ ...p, cover: file }))
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!editEvent && !form.cover) { setMsg('Vui lòng chọn ảnh nền.'); return }
    setSaving(true)
    setMsg('')

    let coverUrl = editEvent?.cover_url || ''

    if (form.cover) {
      const eventId = editEvent?.id || crypto.randomUUID()
      const ext = form.cover.name.split('.').pop()
      const path = `${eventId}/cover.${ext}`
      const { error } = await supabase.storage.from('event-covers').upload(path, form.cover, { upsert: true })
      if (error) { setMsg('Lỗi upload ảnh bìa.'); setSaving(false); return }
      const { data: { publicUrl } } = supabase.storage.from('event-covers').getPublicUrl(path)
      coverUrl = publicUrl
    }

    if (editEvent) {
      await supabase.from('events').update({
        title: form.title,
        description: form.description,
        school_year: form.school_year,
        cover_url: coverUrl
      }).eq('id', editEvent.id)
      setMsg('✅ Cập nhật sự kiện thành công!')
    } else {
      await supabase.from('events').insert({
        title: form.title,
        description: form.description,
        school_year: form.school_year,
        cover_url: coverUrl,
        created_by: profile.id
      })
      setMsg('✅ Tạo sự kiện thành công!')
    }

    setSaving(false)
    fetchEvents()
  }

  function handleDelete(event) {
    setConfirm({
      message: `Bạn có chắc muốn xóa sự kiện "${event.title}"? Tất cả ảnh/video và lời nhắn trong sự kiện cũng sẽ bị xóa.`,
      onConfirm: async () => {
        await supabase.from('events').delete().eq('id', event.id)
        setEvents(prev => prev.filter(e => e.id !== event.id))
        setConfirm(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#121516]">Quản lý Sự kiện</h2>
          <p className="text-[#67747e] text-sm mt-1">{events.length} sự kiện</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-accent-red text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          Tạo sự kiện
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm p-6">
          <h3 className="font-bold text-[#121516] mb-4">{editEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</h3>
          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-accent-red border border-accent-red/20'}`}>
              {msg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#67747e] uppercase">Tên sự kiện *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required className="border border-[#d8dcdf] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#67747e] uppercase">Năm học *</label>
                <select value={form.school_year} onChange={e => setForm(p => ({ ...p, school_year: e.target.value }))} className="border border-[#d8dcdf] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="class_10">Lớp 10</option>
                  <option value="class_11">Lớp 11</option>
                  <option value="class_12">Lớp 12</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#67747e] uppercase">Ghi chú</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="border border-[#d8dcdf] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#67747e] uppercase">Ảnh nền {!editEvent && '*'}</label>
              <div className="flex items-start gap-4">
                {preview && <img src={preview} alt="" className="w-32 h-20 object-cover rounded-lg border border-[#d8dcdf]" />}
                <button type="button" onClick={() => coverRef.current?.click()} className="flex items-center gap-2 border border-dashed border-primary/40 text-primary px-4 py-2 rounded-lg text-sm hover:bg-primary/5 transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                  {preview ? 'Đổi ảnh' : 'Chọn ảnh'}
                </button>
                <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-[#67747e] hover:text-primary transition-colors">Hủy</button>
              <button type="submit" disabled={saving} className="bg-primary hover:bg-accent-red text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                {saving ? 'Đang lưu...' : (editEvent ? 'Cập nhật' : 'Tạo sự kiện')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Event List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-8 text-[#67747e]">Đang tải...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-10 text-[#67747e] bg-white rounded-xl border border-[#d8dcdf]">Chưa có sự kiện nào</div>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm p-4 flex items-center gap-4">
              <img src={event.cover_url} alt={event.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-grow min-w-0">
                <p className="font-bold text-[#121516] truncate">{event.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded">{YEAR_LABELS[event.school_year]}</span>
                  <span className="text-xs text-[#67747e]">{formatDate(event.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => openEdit(event)} className="text-primary hover:text-accent-red transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                </button>
                <button onClick={() => handleDelete(event)} className="text-[#67747e] hover:text-accent-red transition-colors">
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
