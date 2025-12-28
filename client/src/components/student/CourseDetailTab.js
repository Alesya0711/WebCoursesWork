// client/src/components/student/CourseDetailTab.js
import { useState, useEffect } from 'react';

const mainBg = '#e8f5e9';
const headerBg = '#c8e6c9';

export default function CourseDetailTab({ studentId, courseId, onBack }) {
  const [grades, setGrades] = useState({ assignments: [], final_work: null });
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    fetch(`/api/students/get-grades-by-course.php?course_id=${courseId}`)
      .then(r => r.json())
      .then(setGrades)
      .catch(err => alert('Ошибка загрузки успеваемости'));

    fetch(`/api/students/get-attendance-by-course.php?course_id=${courseId}`)
      .then(r => r.json())
      .then(setAttendance)
      .catch(err => alert('Ошибка загрузки посещаемости'));
  }, [courseId]);

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Детали курса</h2>
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#616161',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            borderRadius: '4px'
          }}
        >
          Назад к курсам
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Успеваемость</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: mainBg }}>
            <thead>
              <tr style={{ backgroundColor: headerBg }}>
                <th style={{ padding: '8px' }}>Задание</th>
                <th style={{ padding: '8px' }}>Оценка</th>
                <th style={{ padding: '8px' }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {grades.assignments.map((a, i) => (
                <tr key={i} style={{ backgroundColor: '#ffffff' }}>
                  <td style={{ padding: '8px' }}>{a.assignment_name}</td>
                  <td style={{ padding: '8px' }}>{a.grade?.toFixed(2) || '—'}</td>
                  <td style={{ padding: '8px' }}>{a.status || '—'}</td>
                </tr>
              ))}
              {grades.final_work && (
                <>
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <td style={{ padding: '8px' }}>Итоговая работа (теория)</td>
                    <td style={{ padding: '8px' }}>{grades.final_work.theory_grade?.toFixed(2) || '—'}</td>
                    <td style={{ padding: '8px' }}>оценено</td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffffff' }}>
                    <td style={{ padding: '8px' }}>Итоговая работа (практика)</td>
                    <td style={{ padding: '8px' }}>{grades.final_work.practice_grade?.toFixed(2) || '—'}</td>
                    <td style={{ padding: '8px' }}>оценено</td>
                  </tr>
                </>
              )}
              {grades.assignments.length === 0 && !grades.final_work && (
                <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>Нет данных</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3>Посещаемость</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: mainBg }}>
            <thead>
              <tr style={{ backgroundColor: headerBg }}>
                <th style={{ padding: '8px' }}>Тема</th>
                <th style={{ padding: '8px' }}>Тип</th>
                <th style={{ padding: '8px' }}>№</th>
                <th style={{ padding: '8px' }}>Дата</th>
                <th style={{ padding: '8px' }}>Статус</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((att, i) => (
                <tr key={i} style={{ backgroundColor: '#ffffff' }}>
                  <td style={{ padding: '8px' }}>{att.topic_name || '—'}</td>
                  <td style={{ padding: '8px' }}>{att.lesson_type || '—'}</td>
                  <td style={{ padding: '8px' }}>{att.lesson_number || '—'}</td>
                  <td style={{ padding: '8px' }}>{new Date(att.lesson_date).toLocaleDateString()}</td>
                  <td style={{ padding: '8px' }}>{att.is_present ? '✅ Был' : '❌ Не был'}</td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Нет данных</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}