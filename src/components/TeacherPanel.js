// client/src/components/TeacherPanel.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MyProfileTab from './teacher/MyProfileTab';
import PerformanceTab from './teacher/PerformanceTab';
import AttendanceTab from './teacher/AttendanceTab';
import TeacherReportsTab from './teacher/TeacherReportsTab';

// Цвета
const primaryGreen = '#1b5e20';
const lightGreen = '#e8f5e9'; // ← фон
const buttonGreen = '#388e3c';

export default function TeacherPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: lightGreen }}>
      <div style={{
        backgroundColor: primaryGreen,
        color: 'white',
        padding: '15px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          Здравствуйте{user?.teacher?.first_name ? `, ${user.teacher.first_name} ${user.teacher.middle_name || ''}` : ''}!
        </h1>
        <button
          onClick={logout}
          style={{
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Выйти
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          {['profile', 'performance', 'attendance', 'reports'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                backgroundColor: activeTab === tab ? buttonGreen : '#c8e6c9', 
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {{
                profile: 'Мой профиль',
                performance: 'Успеваемость',
                attendance: 'Посещаемость',
                reports: 'Отчёты'
              }[tab]}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: lightGreen, padding: '20px', borderRadius: '8px' }}>
          {activeTab === 'profile' && <MyProfileTab />}
          {activeTab === 'performance' && user?.teacher?.teacher_id && <PerformanceTab teacherId={user.teacher.teacher_id} />}
          {activeTab === 'attendance' && user?.teacher?.teacher_id && <AttendanceTab teacherId={user.teacher.teacher_id} />}
          {activeTab === 'reports' && user?.teacher?.teacher_id && <TeacherReportsTab teacherId={user.teacher.teacher_id} />}
        </div>
      </div>
    </div>
  );
}