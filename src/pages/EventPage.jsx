import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import LoadingSpinner from '../components/common/LoadingSpinner'
import ConfirmDialog from '../components/common/ConfirmDialog'
import ImageModal from '../components/common/ImageModal'
import { formatDate, formatDateTime } from '../utils/formatDate'
import { validateImage, validateVideo } from '../utils/fileValidation'

const YEAR_LABELS = { class_10: 'Lớp 10', class_11: 'Lớp 11', class_12: 'Lớp 12' }

function UploaderInfo({ item }) {
  const name = item.profiles?.full_name || item.uploader_name || 'Người dùng đã xóa'
  const avatar = item.profiles?.avatar_url || item.uploader_avatar || null
  const isDeleted = !item.user_id
  return (
    <div className="flex items-center gap-2">
      {avatar ? (
        <img src={avatar} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDeleted ? 'bg-gray-200 text-gray-400' : 'bg-white/30 text-white'}`}>
          {isDeleted ? '?' : name?.[0]}
        </div>
      )}
      <span className={`text-xs font-medium truncate ${isDeleted ? 'italic text-gray-300' : 'text-white'}`}>{name}</span>
    </div>
  )
}

export default function EventPage() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const [event, setEvent] = useState(null)
  const [media, setMedia] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [commentMsg, setCommentMsg] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [imageModal, setImageModal] = useState(null)
  const mediaInputRef = useRef()

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    setLoading(true)
    const [{ data: eventData }, { data: mediaData }, { data: commentData }] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('event_media')
        .select('*, profiles(full_name, avatar_url)')
        .eq('event_id', id).eq('status', 'approved')
        .order('created_at', { ascending: false }),
      supabase.from('comments')
        .select('*, profiles(full_name, avatar_url)')
        .eq('event_id', id).eq('status', 'approved')
        .order('created_at', { ascending: false })
    ])
    setEvent(eventData)
    setMedia(mediaData || [])
    setComments(commentData || [])
    setLoading(false)
  }

  async function handleMediaUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadMsg('')
    const isVideo = file.type.startsWith('video/')
    const err = isVideo ? validateVideo(file) : validateImage(file)
    if (err) { setUploadMsg(err); return }

    setUploading(true)
    const mediaId = crypto.randomUUID()
    const ext = file.name.split('.').pop()
    const path = `${id}/${mediaId}.${ext}`

    const { error: uploadError } = await supabase.storage.from('event-media').upload(path, file)
    if (uploadError) { setUploadMsg('Lỗi upload file. Vui lòng thử lại.'); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('event-media').getPublicUrl(path)

    await supabase.from('event_media').insert({
      id: mediaId,
      event_id: id,
      user_id: user.id,
      uploader_name: profile?.full_name || '',
      uploader_avatar: profile?.avatar_url || null,
      media_url: publicUrl,
      media_type: isVideo ? 'video' : 'image',
      status: 'pending'
    })

    setUploadMsg('✅ File đã được gửi, chờ admin duyệt.')
    setUploading(false)
    e.target.value = ''
  }

  function confirmDeleteMedia(item) {
    setConfirm({
      message: 'Bạn có chắc muốn xóa ảnh/video này không?',
      onConfirm: async () => {
        await supabase.from('event_media').delete().eq('id', item.id)
        const urlParts = item.media_url.split('/event-media/')
        if (urlParts[1]) await supabase.storage.from('event-media').remove([decodeURIComponent(urlParts[1])])
        setMedia(prev => prev.filter(m => m.id !== item.id))
        setConfirm(null)
      }
    })
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    setCommentMsg('')
    await supabase.from('comments').insert({
      event_id: id,
      user_id: user.id,
      commenter_name: profile?.full_name || '',
      commenter_avatar: profile?.avatar_url || null,
      content: commentText.trim(),
      status: 'pending'
    })
    setCommentText('')
    setCommentMsg('✅ Lời nhắn đã được gửi, chờ admin duyệt.')
    setSubmitting(false)
  }

  function confirmDeleteComment(comment) {
    setConfirm({
      message: 'Bạn có chắc muốn xóa lời nhắn này không?',
      onConfirm: async () => {
        await supabase.from('comments').delete().eq('id', comment.id)
        setComments(prev => prev.filter(c => c.id !== comment.id))
        setConfirm(null)
      }
    })
  }

  if (loading) return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      <LoadingSpinner />
    </div>
  )

  if (!event) return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center flex-col gap-3 text-[#67747e]">
        <span className="material-symbols-outlined text-5xl text-primary/30">event_busy</span>
        <p>Không tìm thấy sự kiện.</p>
        <Link to="/memory" className="text-primary text-sm font-semibold hover:text-accent-red">Quay lại</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header />

      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      {imageModal && <ImageModal url={imageModal} onClose={() => setImageModal(null)} />}

      <main className="flex-grow w-full px-6 md:px-20 lg:px-40 flex flex-col items-center py-10">
        <div className="max-w-[960px] w-full flex flex-col gap-8">

          <Link to={`/memory/${event.school_year}`} className="inline-flex items-center gap-2 text-primary hover:text-accent-red font-semibold text-sm transition-colors group w-fit">
            <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform" style={{ fontSize: '20px' }}>arrow_back</span>
            {YEAR_LABELS[event.school_year] || 'Quay lại'}
          </Link>

          {/* Cover */}
          <div className="w-full h-56 md:h-80 rounded-xl overflow-hidden shadow-sm">
            <img src={event.cover_url} alt={event.title} className="w-full h-full object-cover" />
          </div>

          {/* Title */}
          <div className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{YEAR_LABELS[event.school_year]}</span>
            </div>
            <h2 className="text-[#121516] text-2xl md:text-3xl font-black tracking-tight mt-2">{event.title}</h2>
            {event.description && <p className="text-[#67747e] mt-3 leading-relaxed">{event.description}</p>}
            <p className="text-xs text-[#67747e] mt-4 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_month</span>
              {formatDate(event.created_at)}
            </p>
          </div>

          {/* Media Section */}
          <section className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-accent-yellow/30 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>photo_library</span>
                </div>
                <h3 className="text-xl font-bold text-[#121516]">Ảnh & Video</h3>
                <span className="text-sm text-[#67747e] font-medium">({media.length})</span>
              </div>
              {user && (
                <>
                  <button onClick={() => mediaInputRef.current?.click()} disabled={uploading}
                    className="flex items-center gap-2 bg-primary hover:bg-accent-red text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                    <span className="hidden sm:inline">{uploading ? 'Đang tải...' : 'Tải lên'}</span>
                  </button>
                  <input ref={mediaInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                </>
              )}
            </div>

            {uploadMsg && (
              <div className={`mb-5 px-4 py-3 rounded-lg text-sm flex items-start gap-2 ${uploadMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-accent-red border border-accent-red/20'}`}>
                <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: '18px' }}>{uploadMsg.startsWith('✅') ? 'check_circle' : 'error'}</span>
                {uploadMsg.replace('✅ ', '')}
              </div>
            )}

            {media.length === 0 ? (
              <div className="text-center py-14 text-[#67747e]">
                <span className="material-symbols-outlined text-5xl mb-3 block text-primary/20">photo_library</span>
                <p className="font-medium">Chưa có ảnh hay video nào</p>
                <p className="text-sm mt-1 text-[#67747e]/70">Hãy là người đầu tiên chia sẻ kỷ niệm!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {media.map(item => (
                  <div key={item.id} className="relative group rounded-xl overflow-hidden bg-[#f0f0f0] aspect-square shadow-sm">
                    {item.media_type === 'video' ? (
                      <video src={item.media_url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={item.media_url} alt="" loading="lazy"
                        className="w-full h-full object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                        onClick={() => setImageModal(item.media_url)} />
                    )}
                    {/* Uploader overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      <UploaderInfo item={item} />
                    </div>
                    {/* Delete */}
                    {user?.id === item.user_id && (
                      <button onClick={() => confirmDeleteMedia(item)}
                        className="absolute top-2 right-2 bg-accent-red text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Comments Section */}
          <section className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 border-b border-[#f0f0f0] pb-5 mb-6">
              <div className="bg-accent-green/30 p-2 rounded-lg">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '22px' }}>chat</span>
              </div>
              <h3 className="text-xl font-bold text-[#121516]">Lời nhắn</h3>
              <span className="text-sm text-[#67747e] font-medium">({comments.length})</span>
            </div>

            {user ? (
              <form onSubmit={handleComment} className="mb-7">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {profile?.full_name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col gap-2">
                    <textarea value={commentText} onChange={e => setCommentText(e.target.value)}
                      placeholder="Viết lời nhắn..." rows={3}
                      className="w-full border border-[#d8dcdf] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none" />
                    <div className="flex items-center justify-between">
                      {commentMsg ? (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                          {commentMsg.replace('✅ ', '')}
                        </p>
                      ) : <span />}
                      <button type="submit" disabled={submitting || !commentText.trim()}
                        className="bg-primary hover:bg-accent-red text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
                        Gửi
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-[#f5f4f0] rounded-xl text-sm text-[#67747e] text-center border border-dashed border-[#d8dcdf]">
                <Link to="/login" className="text-primary font-semibold hover:text-accent-red">Đăng nhập</Link> để viết lời nhắn
              </div>
            )}

            {comments.length === 0 ? (
              <div className="text-center py-10 text-[#67747e]">
                <span className="material-symbols-outlined text-5xl mb-3 block text-primary/20">chat_bubble_outline</span>
                <p className="font-medium">Chưa có lời nhắn nào</p>
                <p className="text-sm mt-1 text-[#67747e]/70">Hãy để lại lời nhắn đầu tiên!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {comments.map(comment => {
                  const name = comment.profiles?.full_name || comment.commenter_name || 'Người dùng đã xóa'
                  const avatar = comment.profiles?.avatar_url || comment.commenter_avatar || null
                  const isDeleted = !comment.user_id
                  return (
                    <div key={comment.id} className="flex gap-3 group">
                      <div className="flex-shrink-0">
                        {avatar ? (
                          <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${isDeleted ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'}`}>
                            {isDeleted ? '?' : name?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="bg-[#f5f4f0] rounded-xl px-4 py-3">
                          <p className={`text-sm font-bold ${isDeleted ? 'text-gray-400 italic' : 'text-[#121516]'}`}>{name}</p>
                          <p className="text-sm text-[#67747e] mt-1 leading-relaxed break-words">{comment.content}</p>
                        </div>
                        <div className="flex items-center justify-between mt-1 px-1">
                          <p className="text-xs text-[#67747e]">{formatDateTime(comment.created_at)}</p>
                          {user?.id === comment.user_id && (
                            <button onClick={() => confirmDeleteComment(comment)}
                              className="text-xs text-accent-red hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
