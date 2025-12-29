// client/src/components/LogoutButton.js
import { useNavigate } from 'react-router-dom';

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    navigate('/login', { replace: true });
  };
  //стиль для кнопки выйти
  return (
    <button
      onClick={handleLogout}
      style={{
        position: 'absolute',
        top: '15px',
        right: '20px',
        padding: '6px 12px',
        backgroundColor: '#d32f2f',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      Выйти
    </button>
  );
}