export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-accent-red" style={{ fontSize: '26px' }}>delete_forever</span>
          </div>
          <div>
            <h3 className="font-bold text-[#121516] text-lg">Xác nhận xóa</h3>
            <p className="text-[#67747e] text-sm mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#d8dcdf] text-[#67747e] font-semibold text-sm hover:bg-[#f5f4f0] transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-accent-red text-white font-bold text-sm hover:bg-red-600 transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}
