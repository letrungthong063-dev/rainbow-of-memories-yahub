import { useEffect } from 'react'

export default function ImageModal({ url, onClose }) {
  // Đóng khi nhấn ESC
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Image */}
      <div className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
        <img
          src={url}
          alt=""
          className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
        />
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
        </button>
      </div>
    </div>
  )
}
