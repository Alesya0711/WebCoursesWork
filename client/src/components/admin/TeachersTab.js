
// client/src/components/admin/TeachersTab.js
import { useState, useEffect } from 'react';

const buttonGreen = '#2e7d32';
const buttonBlue = '#1565c0';
const buttonRed = '#c62828';
const mainBg = '#e8f5e9';
const headerBg = '#c8e6c9';
const selectedBg = '#a5d6a7';
const tableWidth = '900px';
const fontSize = '20px';

export default function TeachersTab() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    last_name: '',
    first_name: '',
    middle_name: '',
    email: '',
    subject_id: '',
    username: '',
    password: ''
  });

  const [editingTeacher, setEditingTeacher] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hoveredButton, setHoveredButton] = useState(null); 

  // === Загрузка данных ===
  useEffect(() => {
    Promise.all([
      fetch('/api/teachers.php').then(r => r.json()),
      fetch('/api/subjects.php').then(r => r.json())
    ])
      .then(([teachersData, subjectsData]) => {
        if (Array.isArray(teachersData)) setTeachers(teachersData);
        if (Array.isArray(subjectsData)) setSubjects(subjectsData);
        setLoading(false);
      })
      .catch(err => {
        setError('Ошибка загрузки данных');
        setLoading(false);
      });
  }, []);

  // === Обработчики ===
  const handleAddTeacher = () => {
    setShowAddForm(true);
    setForm({
      last_name: '',
      first_name: '',
      middle_name: '',
      email: '',
      subject_id: '',
      username: '',
      password: ''
    });
  };

  const handleEditTeacher = () => {
    if (!selectedTeacherId) {
      alert('Выберите преподавателя для редактирования.');
      return;
    }
    const teacher = teachers.find(t => t.teacher_id === selectedTeacherId);
    setEditingTeacher({
      teacher_id: teacher.teacher_id,
      last_name: teacher.last_name || '',
      first_name: teacher.first_name || '',
      middle_name: teacher.middle_name || '',
      email: teacher.email || '',
      subject_id: teacher.subject_id || '',
      username: teacher.username || '',
      password: ''
    });
  };

  const handleSave = async () => {
    const res = await fetch('/api/teachers/add.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();

    if (res.ok) {
      const updated = await fetch('/api/teachers.php').then(r => r.json());
      setTeachers(updated);
      setShowAddForm(false);
    } else {
      setErrorMessage(data.error || 'Ошибка добавления');
      setShowErrorModal(true);
    }
  };

  const handleSaveEdit = async () => {
    const res = await fetch('/api/teachers/update.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingTeacher)
    });
    const data = await res.json();

    if (res.ok) {
      const updated = await fetch('/api/teachers.php').then(r => r.json());
      setTeachers(updated);
      setEditingTeacher(false);
    } else {
      setErrorMessage(data.error || 'Ошибка добавления');
      setShowErrorModal(true);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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

  if (loading) {
    return (
      <div style={{ padding: '30px 0', backgroundColor: mainBg, display: 'flex', justifyContent: 'center' }}>
        <p>Загрузка...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ padding: '30px 0', backgroundColor: mainBg, display: 'flex', justifyContent: 'center' }}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

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
        {/* === СПИСОК ПРЕПОДАВАТЕЛЕЙ === */}
        <div style={{ width: tableWidth, margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold', marginBottom: '12px' }}>
              Список преподавателей
            </h3>
              <div>
                <button
                  onClick={handleAddTeacher}
                  onMouseEnter={() => setHoveredButton('add')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonGreen, false, hoveredButton === 'add')}
                >
                  Добавить преподавателя
                </button>
                <button
                  onClick={handleEditTeacher}
                  onMouseEnter={() => setHoveredButton('edit')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonGreen, !selectedTeacherId, hoveredButton === 'edit')}
                  disabled={!selectedTeacherId}
                >
                  Редактировать
                </button>
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
                  <th style={{ padding: '10px', textAlign: 'left' }}>ФИО</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Предмет</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Логин</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length > 0 ? (
                  teachers.map(t => (
                    <tr
                      key={t.teacher_id}
                      onClick={() => setSelectedTeacherId(t.teacher_id)}
                      style={{
                        backgroundColor: selectedTeacherId === t.teacher_id ? selectedBg : mainBg,
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{t.full_name}</td>
                      <td style={{ padding: '10px' }}>{t.email || '—'}</td>
                      <td style={{ padding: '10px' }}>{t.specialization || '—'}</td>
                      <td style={{ padding: '10px' }}>{t.username}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={4} message="Нет преподавателей" />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddForm && (
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
              width: '400px',
            }}
          >
            <h3>Добавить преподавателя</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleFormChange}
                placeholder="Фамилия"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleFormChange}
                placeholder="Имя"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                name="middle_name"
                value={form.middle_name}
                onChange={handleFormChange}
                placeholder="Отчество (необязательно)"
                style={{ width: '97%', padding: '5px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                name="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="Email"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <select
                name="subject_id"
                value={form.subject_id}
                onChange={handleFormChange}
                style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="">Выберите предмет</option>
                {subjects.map(s => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.subject_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                name="username"
                value={form.username}
                onChange={handleFormChange}
                placeholder="Логин"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleFormChange}
                placeholder="Пароль"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
              <button
                onClick={handleSave}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTeacher && (
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
              width: '400px',
            }}
          >
            <h3>Редактировать преподавателя</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                name="last_name"
                placeholder="Фамилия"
                value={editingTeacher.last_name || ''}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, last_name: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                name="first_name"
                placeholder="Имя"
                value={editingTeacher.first_name || ''}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, first_name: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                name="middle_name"
                placeholder="Отчество"
                value={editingTeacher.middle_name || ''}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, middle_name: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                name="email"
                placeholder="Email"
                value={editingTeacher.email || ''}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <select
                name="subject_id"
                value={editingTeacher.subject_id || ''}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, subject_id: e.target.value || null })}
               style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="">Выберите предмет</option>
                {subjects.map(s => (
                  <option key={s.subject_id} value={s.subject_id}>
                    {s.subject_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                name="username"
                placeholder="Логин"
                value={editingTeacher.username || ''}
                onChange={(e) => setEditingTeacher({ ...editingTeacher, username: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input
                name="password"
                type="password"
                placeholder="Новый пароль (оставьте пустым, чтобы не менять)"
                onChange={(e) => setEditingTeacher({ ...editingTeacher, password: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditingTeacher(null)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
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
              width: '400px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <h3 style={{ margin: 0, color: '#c62828', fontSize: '20px', fontWeight: 'bold' }}>
              Ошибка
            </h3>
            <p style={{ margin: '12px 0', fontSize: '16px', color: '#333' }}>
              {errorMessage}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowErrorModal(false)}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}