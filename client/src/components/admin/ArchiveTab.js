// client/src/components/admin/ArchiveTab.js
import { useState, useEffect } from 'react';
import ConfirmationModal from '../ConfirmationModal';

const buttonGreen = '#2e7d32';
const buttonRed = '#c62828';
const mainBg = '#e8f5e9';
const headerBg = '#c8e6c9';
const selectedBg = '#a5d6a7';
const tableWidth = '900px';
const fontSize = '20px'; 

export default function ArchiveTab() {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedArchivedUserId, setSelectedArchivedUserId] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedActiveUserId, setSelectedActiveUserId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [hoveredButton, setHoveredButton] = useState(null); 

  // Загрузка архивированных пользователей
  const loadArchivedUsers = () => {
    fetch('/api/archive/get.php')
      .then(r => r.json())
      .then(setArchivedUsers)
      .catch(err => alert('Ошибка загрузки архива'));
  };

  // Загрузка активных пользователей
  const loadActiveUsers = () => {
    fetch('/api/archive/active-users.php')
      .then(r => r.json())
      .then(setActiveUsers)
      .catch(err => alert('Ошибка загрузки активных пользователей'));
  };

  useEffect(() => {
    loadArchivedUsers();
  }, []);

  // Восстановление
  const handleRestore = () => {
    if (!selectedArchivedUserId) {
      alert('Выберите профиль для восстановления.');
      return;
    }
    const user = archivedUsers.find(u => u.user_id === selectedArchivedUserId);
    setConfirmMessage(`Восстановить профиль «${user.full_name}»?`);
    setConfirmAction('restore');
    setShowConfirmModal(true);
  };

  // Архивация
  const handleArchive = () => {
    setShowArchiveModal(true);
    loadActiveUsers();
  };

  // Подтверждение
  const handleConfirm = async () => {
    if (confirmAction === 'restore') {
      try {
        const res = await fetch('/api/archive/restore.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: selectedArchivedUserId })
        });
        const data = await res.json();
        if (res.ok) {
          loadArchivedUsers();
          setSelectedArchivedUserId(null);
        } else {
          alert(data.error || 'Ошибка восстановления');
        }
      } catch (err) {
        alert('Ошибка сети');
      }
    } else if (confirmAction === 'archive') {
      try {
        const res = await fetch('/api/archive/archive.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: selectedActiveUserId })
        });
        const data = await res.json();
        if (res.ok) {
          setShowArchiveModal(false);
          loadArchivedUsers();
        } else {
          alert(data.error || 'Ошибка архивации');
        }
      } catch (err) {
        alert('Ошибка сети');
      }
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  // Архивация через модальное окно
  const handleArchiveFromModal = () => {
    if (!selectedActiveUserId) {
      alert('Выберите профиль для архивации.');
      return;
    }
    const user = activeUsers.find(u => u.user_id === selectedActiveUserId);
    setConfirmMessage(`Архивировать профиль «${user.full_name}»?\nОн больше не сможет входить в систему.`);
    setConfirmAction('archive');
    setShowConfirmModal(true);
  };

  const buttonStyle = (bgColor, disabled = false, isHovered = false) => ({
    backgroundColor: disabled ? '#bdbdbd' : bgColor,
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    marginRight: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: isHovered && !disabled
      ? '0 6px 16px rgba(0,0,0,0.3)'
      : 'none',
    outline: 'none',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'box-shadow 0.25s ease-in-out, background-color 0.15s ease',
  });

  const EmptyRow = ({ colSpan, message }) => (
    <tr>
      <td colSpan={colSpan} style={{ padding: '20px', textAlign: 'center', color: '#666', backgroundColor: mainBg }}>
        {message}
      </td>
    </tr>
  );

  return (
    <div
      style={{
        padding: '30px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: mainBg,
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          padding: '0 20px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: tableWidth, margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold', marginBottom: '12px' }}>
              Архив
            </h3>
            <div>
              <div>
                <button
                  onClick={handleRestore}
                  onMouseEnter={() => setHoveredButton('restore')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonGreen, !selectedArchivedUserId, hoveredButton === 'restore')}
                  disabled={!selectedArchivedUserId}
                >
                  Восстановить
                </button>
                <button
                  onClick={handleArchive}
                  onMouseEnter={() => setHoveredButton('archive')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonRed, false, hoveredButton === 'archive')}
                >
                  Архивировать
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'transparent' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: fontSize,
                margin: '0 auto',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Роль</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>ФИО</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Логин</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {archivedUsers.length > 0 ? (
                  archivedUsers.map(u => (
                    <tr
                      key={u.user_id}
                      onClick={() => setSelectedArchivedUserId(u.user_id)}
                      style={{
                        backgroundColor: selectedArchivedUserId === u.user_id ? selectedBg : mainBg,
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{u.role === 'teacher' ? 'Преподаватель' : 'Студент'}</td>
                      <td style={{ padding: '10px' }}>{u.full_name}</td>
                      <td style={{ padding: '10px' }}>{u.username}</td>
                      <td style={{ padding: '10px' }}>{u.email || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={4} message="Архив пуст" />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showArchiveModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '800px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#1b5e20', fontSize: '24px', fontWeight: 'bold' }}>
              Архивация профиля
            </h3>
            <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: mainBg, marginBottom: '16px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px', 
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>ФИО</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Логин</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Роль</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.length > 0 ? (
                    activeUsers.map(u => (
                      <tr
                        key={u.user_id}
                        onClick={() => setSelectedActiveUserId(u.user_id)}
                        style={{
                          backgroundColor: selectedActiveUserId === u.user_id ? selectedBg : mainBg,
                          cursor: 'pointer',
                        }}
                      >
                        <td style={{ padding: '8px' }}>{u.full_name}</td>
                        <td style={{ padding: '8px' }}>{u.email || '—'}</td>
                        <td style={{ padding: '8px' }}>{u.username}</td>
                        <td style={{ padding: '8px' }}>{u.role_label}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#666', backgroundColor: mainBg }}>
                        Нет активных пользователей
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowArchiveModal(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleArchiveFromModal}
                style={{
                  backgroundColor: buttonRed,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
                disabled={!selectedActiveUserId}
              >
                Подтвердить архивацию
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <ConfirmationModal
          title="Подтверждение"
          message={confirmMessage}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}