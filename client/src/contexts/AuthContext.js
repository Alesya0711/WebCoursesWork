// client/src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  const login = (userData) => {
  // Добавляем данные преподавателя в user
  if (userData.role === 'teacher') {
    userData.teacher = {
      teacher_id: userData.teacher_id,
      last_name: userData.last_name,
      first_name: userData.first_name,
      middle_name: userData.middle_name,
      email: userData.email
    };}
    
    if (userData.role === 'student') {
    userData.student = {
      student_id: userData.student_id,
      last_name: userData.last_name,
      first_name: userData.first_name,
      middle_name: userData.middle_name,
      email: userData.email
    };
  }
  
  sessionStorage.setItem('user', JSON.stringify(userData));
  setUser(userData);
  navigate('/', { replace: true });
};

  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}