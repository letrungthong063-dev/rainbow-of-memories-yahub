import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import MobileNav from './components/common/MobileNav'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import ClassList from './pages/ClassList'
import ProfilePage from './pages/ProfilePage'
import MemoryPage from './pages/MemoryPage'
import YearPage from './pages/YearPage'
import EventPage from './pages/EventPage'
import NotFound from './pages/NotFound'

// Admin
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminEvents from './pages/admin/AdminEvents'
import AdminMediaReview from './pages/admin/AdminMediaReview'
import AdminCommentReview from './pages/admin/AdminCommentReview'
import AdminProfileReview from './pages/admin/AdminProfileReview'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Protected */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/class-list" element={<ProtectedRoute><ClassList /></ProtectedRoute>} />
            <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/memory" element={<ProtectedRoute><MemoryPage /></ProtectedRoute>} />
            <Route path="/memory/:year" element={<ProtectedRoute><YearPage /></ProtectedRoute>} />
            <Route path="/event/:id" element={<ProtectedRoute><EventPage /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="media-review" element={<AdminMediaReview />} />
              <Route path="comment-review" element={<AdminCommentReview />} />
              <Route path="profile-review" element={<AdminProfileReview />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Mobile bottom nav */}
          <MobileNav />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
