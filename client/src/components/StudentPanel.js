// client/src/components/student/StudentPanel.js
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StudentProfileTab from './student/StudentProfileTab';
import CourseDetailTab from './student/CourseDetailTab';

const primaryGreen = '#1b5e20';
const lightGreen = '#e8f5e9';
const buttonGreen = '#388e3c';

//состояние компонентов: загрузка профиля и загрузка курсов
export default function StudentPanel() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const displayName = user?.student?.first_name
  ? `${user.student.first_name} ${user.student.middle_name || ''}`
  : 'Студент';

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
         {/*приветствие*/}
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          Здравствуйте, {displayName}!
        </h1>
         {/*кнопка выйти*/}
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
        {activeTab === 'profile' && (
          <StudentProfileTab onCourseSelect={setSelectedCourseId} />
        )}
        {activeTab === 'course' && selectedCourseId && (
          <CourseDetailTab 
            studentId={user.student.student_id} 
            courseId={selectedCourseId} 
            onBack={() => setActiveTab('profile')} 
          />
        )}
      </div>
    </div>
  );
}