// client/src/components/admin/AdminPanel.js
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import TeachersTab from './TeachersTab';
import GroupsStudentsTab from './GroupsStudentsTab';
import CurriculumTab from './CurriculumTab';
import ReportsTab from './ReportsTab';
import ArchiveTab from './ArchiveTab';

export default function AdminPanel() {
  const { user, logout } = useAuth(); 
  const [activeTab, setActiveTab] = useState('teachers');

  const bgColor = '#e8f5e9';
  const headerColor = '#1b5e20';
  const tabActiveColor = '#2e7d32';
  const tabInactiveColor = '#388e3c';

  return (
    <div style={{ backgroundColor: bgColor, minHeight: '100vh' }}>
      <div style={{
        backgroundColor: headerColor,
        color: 'white',
        padding: '15px 25px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Панель администратора</h1>
        <button
          onClick={logout} 
          style={{
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Выйти
        </button>
      </div>

      <div style={{ padding: '10px 25px', textAlign: 'right' }}>
        <button
          onClick={() => setActiveTab('teachers')}
          style={{
            backgroundColor: activeTab === 'teachers' ? tabActiveColor : tabInactiveColor,
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            margin: '0 4px',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        >
          Преподаватели
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          style={{
            backgroundColor: activeTab === 'groups' ? tabActiveColor : tabInactiveColor,
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            margin: '0 4px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Группы и Учащиеся
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          style={{
            backgroundColor: activeTab === 'curriculum' ? tabActiveColor : tabInactiveColor,
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            margin: '0 4px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Учебные планы
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          style={{
            backgroundColor: activeTab === 'reports' ? tabActiveColor : tabInactiveColor,
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            margin: '0 4px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Отчёты
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          style={{
            backgroundColor: activeTab === 'archive' ? tabActiveColor : tabInactiveColor,
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            margin: '0 4px',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Архив
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {activeTab === 'teachers' && <TeachersTab />}
        {activeTab === 'groups' && <GroupsStudentsTab />}
        {activeTab === 'curriculum' && <CurriculumTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'archive' && <ArchiveTab />}
      </div>
    </div>
  );
}