import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate, formatDateTime } from '../../utils/formatDate'
import ConfirmDialog from '../../components/common/ConfirmDialog'

// Hàm lấy token xác thực từ session hiện tại của Supabase
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || ''
}

const EMPTY_FORM = { email: '', password: '', full_name: '', gender: 'male', birthday: '', class_role: '' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [confirm, setConfirm] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  // Lấy danh sách người dùng từ bảng 'profiles'
  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name')
    setUsers(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditUser(null)
    setForm(EMPTY_FORM)
    setMsg('')
    setShowForm(true)
  }

  function openEdit(user) {
    setEditUser(user)
    setForm({
      email: '',
      password: '',
      full_name: user.full_name || '',
      gender: user.gender || 'male',
      birthday: user.birthday || '',
      class_role: user.class_role || ''
    })
    setMsg('')
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')

    if (editUser) {
      // Cập nhật thông tin profile
      const updates = {
        full_name: form.full_name,
        gender: form.gender,
        birthday: form.birthday || null,
        class_role: form.class_role
      }
      const { error } = await supabase.from('profiles').update(updates).eq('id', editUser.id)
      if (error) { setMsg('Lỗi cập nhật: ' + error.message); setSaving(false); return }

      // Cập nhật mật khẩu nếu có nhập mới qua Edge Function
      if (form.password) {
        const token = await getAuthToken()
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-update-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: editUser.id, password: form.password })
        })
        if (!res.ok) { setMsg('Lỗi đổi mật khẩu.'); setSaving(false); return }
      }

      setMsg('✅ Cập nhật thành công!')
      fetchUsers()
    } else {
      // Tạo người dùng mới qua Supabase Auth Admin API (Edge Function)
      const token = await getAuthToken()
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          gender: form.gender,
          birthday: form.birthday || null,
          class_role: form.class_role
        })
      })
      const result = await res.json()
      if (!res.ok) { setMsg('Lỗi tạo tài khoản: ' + (result.error || '')); setSaving(false); return }
      setMsg('✅ Tạo tài khoản thành công!')
      fetchUsers()
    }
    setSaving(false)
  }

  function handleDelete(userId) {
    setConfirm({
      message: 'Bạn có chắc muốn xóa tài khoản này không? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        await supabase.from('profiles').delete().eq('id', userId)
        setUsers(prev => prev.filter(u => u.id !== userId))
        setConfirm(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#121516]">Quản lý User</h2>
          <p className="text-[#67747e] text-sm mt-1">{users.length} tài khoản</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary hover:bg-accent-red text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
          Tạo tài khoản
        </button>
      </div>

      {/* Form tạo mới/chỉnh sửa */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm p-6">
          <h3 className="font-bold text-[#121516] mb-4">{editUser ? `Chỉnh sửa: ${editUser.full_name}` : 'Tạo tài khoản mới'}</h3>
          {msg && (
            <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-accent-red border border-accent-red/20'}`}>
              {msg}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editUser && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[#67747e] uppercase">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className="border border-[#d8dcdf] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#67747e] uppercase">{editUser ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu *'}</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required={!editUser} className="border border-[#d8dcdf] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#67747e] uppercase">Họ và tên *</label>
              <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} required className="border border-[#d8dcdf] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#67747e] uppercase">Giới tính</label>
              <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="border border-[#d8dcdf] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#67747e] uppercase">Ngày sinh</label>
              <input type="date" value={form.birthday} onChange={e => setForm(p => ({ ...p, birthday: e.target.value }))} className="border border-[#d8dcdf] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#67747e] uppercase">Chức vụ</label>
              <input type="text" value={form.class_role} onChange={e => setForm(p => ({ ...p, class_role: e.target.value }))} placeholder="Lớp trưởng, Thành viên..." className="border border-[#d8dcdf] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div className="md:col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-[#67747e] hover:text-primary transition-colors">Hủy</button>
              <button type="submit" disabled={saving} className="bg-primary hover:bg-accent-red text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                {saving ? 'Đang lưu...' : (editUser ? 'Cập nhật' : 'Tạo tài khoản')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách User */}
      <div className="bg-white rounded-xl border border-[#d8dcdf] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-[#67747e]">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-[#67747e]">Chưa có tài khoản nào</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f5f4f0] border-b border-[#d8dcdf]">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-[#67747e] text-xs uppercase">Thành viên</th>
                <th className="text-left px-4 py-3 font-bold text-[#67747e] text-xs uppercase hidden md:table-cell">Ngày sinh</th>
                <th className="text-left px-4 py-3 font-bold text-[#67747e] text-xs uppercase hidden md:table-cell">Chức vụ</th>
                <th className="text-left px-4 py-3 font-bold text-[#67747e] text-xs uppercase hidden lg:table-cell">Đăng nhập gần nhất</th>
                <th className="text-left px-4 py-3 font-bold text-[#67747e] text-xs uppercase">Role</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f0]">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[#fafafa] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {user.full_name?.[0]}
                        </div>
                      )}
                      <span className="font-medium text-[#121516]">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#67747e] hidden md:table-cell">{formatDate(user.birthday) || '—'}</td>
                  <td className="px-4 py-3 text-[#67747e] hidden md:table-cell">{user.class_role || '—'}</td>
                  <td className="px-4 py-3 text-[#67747e] hidden lg:table-cell text-xs">
                    {user.last_sign_in_at ? formatDateTime(user.last_sign_in_at) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-accent-red/10 text-accent-red' : 'bg-primary/10 text-primary'}`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(user)} className="text-primary hover:text-accent-red transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="text-[#67747e] hover:text-accent-red transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
