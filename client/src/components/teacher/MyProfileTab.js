// client/src/components/teacher/MyProfileTab.js
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const mainBg = '#e8f5e9';      
const headerBg = '#c8e6c9';         
const selectedBg = '#a5d6a7';       
const fontSize = '20px';            
const headerColor = '#1b5e20';      

export default function MyProfileTab() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);

  //загрузка курсов 
  useEffect(() => {
    if (user?.teacher_id) {
      fetch(`/api/teachers/courses.php?teacher_id=${user.teacher_id}`)
        .then(r => r.json())
        .then(setCourses)
        .catch(err => alert('Ошибка загрузки курсов'));
    }
  }, [user]);

  if (!user?.teacher) {
    return (
      <div
        style={{
          padding: '30px 0',
          backgroundColor: mainBg,
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <p>Загрузка...</p>
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
        <div
          style={{
            width: '900px',
            margin: '0 auto',
            padding: '24px',
            borderRadius: '8px'
          }}
        >
          <h2
            style={{
              margin: '0 0 20px 0',
              color: headerColor,
              fontSize: '30px',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Мой профиль
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ margin: '8px 0', fontSize: fontSize }}>
              <strong>ФИО:</strong>{' '}
              {user.teacher?.last_name || '—'}{' '}
              {user.teacher?.first_name || '—'}{' '}
              {user.teacher?.middle_name || '—'}
            </p>
            <p style={{ margin: '8px 0', fontSize: fontSize }}>
              <strong>Email:</strong> {user.teacher?.email || '—'}
            </p>
          </div>

          <h3
            style={{
              margin: '24px 0 12px 0',
              color: headerColor,
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            Мои курсы
          </h3>

          {courses.length > 0 ? (
            <ul style={{ paddingLeft: '24px', fontSize: fontSize, lineHeight: '1.6' }}>
              {courses.map(c => (
                <li key={c.course_id} style={{ marginBottom: '6px' }}>
                  {c.course_name}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: fontSize, color: '#666' }}>Нет назначенных курсов</p>
          )}
        </div>
      </div>
    </div>
  );
}