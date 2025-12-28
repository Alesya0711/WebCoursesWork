// client/src/App.js
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/admin/AdminPanel';
import TeacherPanel from './components/TeacherPanel';
import StudentPanel from './components/StudentPanel';

function AppContent() {
  const { user } = useAuth(); // ← теперь это работает

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      {user.role === 'admin' && <Route path="/" element={<AdminPanel user={user} />} />}
      {user.role === 'teacher' && <Route path="/" element={<TeacherPanel user={user} />} />}
      {user.role === 'student' && <Route path="/" element={<StudentPanel user={user} />} />}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppContent;