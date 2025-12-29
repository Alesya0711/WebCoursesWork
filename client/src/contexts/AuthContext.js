// client/src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 

//создаем контекст
const AuthContext = createContext();
//Компонент-обёртка, который предоставляет данные всем дочерним компонентам
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); 

  //восстановление пользователя
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
  //добавляем данные студента  
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

  //переход на страницу входа
  const logout = () => {
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
  };
//Передаёт в контекст: user, login, logout.
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
//хук для доступа к контексту
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}