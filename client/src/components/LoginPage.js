// client/src/components/LoginPage.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  //стейты введенного имя, пароля, ошибка
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      //отправка данных на сервер
      const res = await fetch('/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      //обработка ответа
      const data = await res.json();

      if (res.ok) {
        //сохраняем данные
        login(data);
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Не удалось подключиться к серверу');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#e8f5e9', 
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        color: '#333'
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
          width: '360px',
          textAlign: 'center',
          border: '1px solid #c8e6c9'
        }}
      >
        <h1
          style={{
            color: '#1b5e20', 
            marginBottom: '5px',
            fontSize: '26px',
            fontWeight: 'bold'
          }}
        >
          Учебные курсы
        </h1>

        <h2
          style={{
            color: '#388e3c',
            marginBottom: '20px',
            fontSize: '20px',
            fontWeight: 'normal'
          }}
        >
          Вход в систему
        </h2>

        {error && <div style={{ color: '#d32f2f', marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '18px' }}>
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '94%',
                padding: '10px 12px',
                border: '1px solid #a5d6a7',
                borderRadius: '6px',
                fontSize: '15px',
                backgroundColor: '#f1f8e9'
              }}
            />
          </div>
          <div style={{ marginBottom: '22px' }}>
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '94%',
                padding: '10px 12px',
                border: '1px solid #a5d6a7',
                borderRadius: '6px',
                fontSize: '15px',
                backgroundColor: '#f1f8e9'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '11px',
              backgroundColor: '#1b5e20', 
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '17px',
              fontWeight: '600',
              transition: 'background 0.25s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2e7d32'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1b5e20'}
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}