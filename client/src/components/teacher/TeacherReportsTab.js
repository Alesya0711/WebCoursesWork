// client/src/components/teacher/TeacherReportsTab.js
import { useState, useEffect } from 'react';

const buttonGreen = '#2e7d32';
const buttonExport = '#4caf50';
const mainBg = '#e8f5e9';
const headerBg = '#c8e6c9';
const selectedBg = '#a5d6a7';
const tableWidth = '900px';
const fontSize = '20px'; 

//Утилита для отображения оценок
const formatGrade = (value) => {
  if (value == null) return '—';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) ? num.toFixed(2) : '—';
};

export default function TeacherReportsTab({ teacherId }) {
  //стейты для выбора
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  //стейты для успеваемости
  const [courseGrades, setCourseGrades] = useState(null);
  const [groupGrades, setGroupGrades] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [gradesReport, setGradesReport] = useState([]);
  //стейты для посещаемости
  const [courseAttendance, setCourseAttendance] = useState(null);
  const [groupAttendance, setGroupAttendance] = useState(null);
  const [selectedAttendanceStudentId, setSelectedAttendanceStudentId] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [hoveredButton, setHoveredButton] = useState(null); 
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  //Загрузка курсов преподавателя
  useEffect(() => {
    fetch(`/api/teachers/courses.php?teacher_id=${teacherId}`)
      .then(r => r.json())
      .then(setCourses)
      .catch(err => alert('Ошибка загрузки курсов'));
  }, [teacherId]);

  //Загрузка групп (для успеваемости)
  useEffect(() => {
    if (courseGrades) {
      fetch(`/api/groups/get-by-course.php?course_id=${courseGrades}`)
        .then(r => r.json())
        .then(setGroups)
        .catch(err => alert('Ошибка загрузки групп'));
    } else {
      setGroups([]);
      setGroupGrades(null);
      setSelectedStudentId(null);
    }
  }, [courseGrades]);

  useEffect(() => {
    loadStudentsByGroup(groupGrades, false);
  }, [groupGrades]);

  //Загрузка групп (для посещаемости)
  useEffect(() => {
    if (courseAttendance) {
      fetch(`/api/groups/get-by-course.php?course_id=${courseAttendance}`)
        .then(r => r.json())
        .then(setGroups)
        .catch(err => alert('Ошибка загрузки групп'));
    } else {
      setGroups([]);
      setGroupAttendance(null);
      setSelectedAttendanceStudentId(null);
    }
  }, [courseAttendance]);

  useEffect(() => {
    loadStudentsByGroup(groupAttendance, true);
  }, [groupAttendance]);

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  //Загрузка студентов по группе
  const loadStudentsByGroup = (groupId, isForAttendance = false) => {
    if (!groupId) {
      setStudents([]);
      if (isForAttendance) {
        setSelectedAttendanceStudentId(null);
      } else {
        setSelectedStudentId(null);
      }
      return;
    }

    fetch(`/api/students/get-by-group.php?group_id=${groupId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          setStudents([]);
          alert('Ошибка: сервер вернул некорректный список студентов');
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки студентов:', err);
        setStudents([]);
        alert('Ошибка загрузки студентов');
      });
  };
  // Обработчик кнопоки отчётов по успеваемости по группе
  const handleGradesByGroup = () => {
    if (!groupGrades) {
      showError('Выберите группу');
      return;
    }
    fetch(`/api/reports/grades-by-group.php?group_id=${groupGrades}`)
      .then(r => r.json())
      .then(setGradesReport)
      .catch(err => alert('Ошибка загрузки отчёта'));
  };

    // Обработчик кнопоки отчётов по успеваемости по студенту
  const handleGradesByStudent = () => {
    if (!selectedStudentId) {
      showError('Выберите студента');
      return;
    }
    fetch(`/api/reports/grades-by-student-in-group.php?student_id=${selectedStudentId}&group_id=${groupGrades}`)
      .then(r => r.json())
      .then(setGradesReport)
      .catch(err => alert('Ошибка загрузки отчёта'));
  };

  // Обработчик кнопоки отчётов по посещаемости по группе
  const handleAttendanceByGroup = () => {
    if (!groupAttendance) {
      showError('Выберите группу');
      return;
    }
    fetch(`/api/reports/attendance-by-group.php?group_id=${groupAttendance}`)
      .then(r => r.json())
      .then(setAttendanceReport)
      .catch(err => alert('Ошибка загрузки отчёта'));
  };
  // Обработчик кнопоки отчётов по посещаемости по студенту
  const handleAttendanceByStudent = () => {
    if (!selectedAttendanceStudentId) {
      showError('Выберите студента');
      return;
    }
    fetch(`/api/reports/attendance-by-student-in-group.php?student_id=${selectedAttendanceStudentId}&group_id=${groupAttendance}`)
      .then(r => r.json())
      .then(setAttendanceReport)
      .catch(err => alert('Ошибка загрузки отчёта'));
  };

  //стиль кнопки
  const buttonStyle = (bgColor, disabled = false, isHovered = false) => ({
    backgroundColor: disabled ? '#bdbdbd' : bgColor,
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    marginRight: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: isHovered && !disabled ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
    outline: 'none',
    fontSize: '18px',
    fontWeight: 'bold',
    transition: 'box-shadow 0.2s ease',
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
        <div style={{ width: tableWidth, margin: '0 auto', marginBottom: '40px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold', marginBottom: '20px' }}>
            Успеваемость
          </h3>
          {/*настройка отчета*/}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontWeight: 'bold', minWidth: '80px' }}>Курс:</label>
              <select
                value={courseGrades || ''}
                onChange={e => setCourseGrades(e.target.value || null)}
                style={{
                  padding: '6px',
                  fontSize: '14px',
                  minWidth: '200px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Выберите курс</option>
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontWeight: 'bold', minWidth: '80px' }}>Группа:</label>
              <select
                value={groupGrades || ''}
                onChange={e => setGroupGrades(e.target.value || null)}
                style={{
                  padding: '6px',
                  fontSize: '14px',
                  minWidth: '200px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                disabled={!courseGrades}
              >
                <option value="">Выберите группу</option>
                {groups.map(g => (
                  <option key={g.group_id} value={g.group_id}>
                    {g.group_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontWeight: 'bold', minWidth: '80px' }}>Студент:</label>
              <select
                value={selectedStudentId || ''}
                onChange={e => setSelectedStudentId(e.target.value || null)}
                style={{
                  padding: '6px',
                  fontSize: '14px',
                  minWidth: '200px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                disabled={!groupGrades}
              >
                <option value="">Выберите студента</option>
                {students.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onMouseEnter={() => setHoveredButton('gradesGroup')}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={handleGradesByGroup}
                style={buttonStyle(buttonGreen, false, hoveredButton === 'gradesGroup')}
              >
                Отчёт по группе
              </button>
              <button
                onMouseEnter={() => setHoveredButton('gradesStudent')}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={handleGradesByStudent}
                style={buttonStyle(buttonGreen, !selectedStudentId, hoveredButton === 'gradesStudent')}
                disabled={!selectedStudentId}
              >
                Отчёт по студенту
              </button>
            </div>
          </div>
          
          {/*настройка таблиц для отображения данных*/}
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
                  {gradesReport.length > 0 && (
                    <>
                      {gradesReport[0].assignment_name ? (
                        <>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Курс</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Задание</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Оценка</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Статус</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Итоговая работа</th>
                        </>
                      ) : (
                        <>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Студент</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Средний по заданиям</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Итоговая работа</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Оценка за курс</th>
                          <th style={{ padding: '10px', textAlign: 'left' }}>Всего заданий / Сдано</th>
                        </>
                      )}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {gradesReport.length > 0 ? (
                  gradesReport.map((row, idx) => (
                    <tr key={idx} style={{ backgroundColor: mainBg }}>
                      {row.assignment_name ? (
                        <>
                          <td style={{ padding: '10px' }}>{row.course_name || '—'}</td>
                          <td style={{ padding: '10px' }}>{row.assignment_name || '—'}</td>
                          <td style={{ padding: '10px' }}>{formatGrade(row.grade)}</td>
                          <td style={{ padding: '10px' }}>{row.status || '—'}</td>
                          <td style={{ padding: '10px' }}>
                            {row.is_final_work ? '✅' : '—'}
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: '10px' }}>{row.student_name || '—'}</td>
                          <td style={{ padding: '10px' }}>{formatGrade(row.avg_assignment_grade)}</td>
                          <td style={{ padding: '10px' }}>{formatGrade(row.final_work_grade)}</td>
                          <td style={{ padding: '10px' }}>{formatGrade(row.course_final_grade)}</td>
                          <td style={{ padding: '10px' }}>
                            {row.total_assignments || '—'} / {row.completed_assignments || '—'}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={5} message="Выберите группу или студента" />
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ width: tableWidth, margin: '0 auto' }}>
          <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold', marginBottom: '20px' }}>
            Посещаемость
          </h3>
          {/*настройка отчета*/}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontWeight: 'bold', minWidth: '80px' }}>Курс:</label>
              <select
                value={courseAttendance || ''}
                onChange={e => setCourseAttendance(e.target.value || null)}
                style={{
                  padding: '6px',
                  fontSize: '14px',
                  minWidth: '200px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              >
                <option value="">Выберите курс</option>
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontWeight: 'bold', minWidth: '80px' }}>Группа:</label>
              <select
                value={groupAttendance || ''}
                onChange={e => setGroupAttendance(e.target.value || null)}
                style={{
                  padding: '6px',
                  fontSize: '14px',
                  minWidth: '200px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                disabled={!courseAttendance}
              >
                <option value="">Выберите группу</option>
                {groups.map(g => (
                  <option key={g.group_id} value={g.group_id}>
                    {g.group_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontWeight: 'bold', minWidth: '80px' }}>Студент:</label>
              <select
                value={selectedAttendanceStudentId || ''}
                onChange={e => setSelectedAttendanceStudentId(e.target.value || null)}
                style={{
                  padding: '6px',
                  fontSize: '14px',
                  minWidth: '200px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                disabled={!groupAttendance}
              >
                <option value="">Выберите студента</option>
                {students.map(s => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onMouseEnter={() => setHoveredButton('attGroup')}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={handleAttendanceByGroup}
                style={buttonStyle(buttonGreen, false, hoveredButton === 'attGroup')}
              >
                Отчёт по группе
              </button>
              <button
                onMouseEnter={() => setHoveredButton('attStudent')}
                onMouseLeave={() => setHoveredButton(null)}
                onClick={handleAttendanceByStudent}
                style={buttonStyle(buttonGreen, !selectedAttendanceStudentId, hoveredButton === 'attStudent')}
                disabled={!selectedAttendanceStudentId}
              >
                Отчёт по студенту
              </button>
            </div>
          </div>
          {/*настройка таблиц для отображения данных*/}
          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'transparent' }}>
            {Array.isArray(attendanceReport) && attendanceReport.length > 0 ? (
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
                    <th style={{ padding: '10px', textAlign: 'left' }}>Курс</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Тема</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>№</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Дата</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Присутствовал</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceReport.map((row, idx) => (
                    <tr key={idx} style={{ backgroundColor: mainBg }}>
                      <td style={{ padding: '10px' }}>{row.course_name}</td>
                      <td style={{ padding: '10px' }}>{row.topic_name}</td>
                      <td style={{ padding: '10px' }}>{row.lesson_number}</td>
                      <td style={{ padding: '10px' }}>{new Date(row.lesson_date).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>{row.is_present ? '✅ Да' : '❌ Нет'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : attendanceReport.lessons ? (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '16px',
                  margin: '0 auto',
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                    <th
                      style={{
                        padding: '8px',
                        textAlign: 'left',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: headerBg,
                      }}
                    >
                      Студент
                    </th>
                    {attendanceReport.lessons.map(l => (
                      <th key={l.lesson_id} style={{ padding: '8px', textAlign: 'center' }}>
                        {l.lesson_number}
                        <br />
                        {new Date(l.lesson_date).toLocaleDateString()}
                      </th>
                    ))}
                    <th style={{ padding: '8px', textAlign: 'center', backgroundColor: headerBg }}>%</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceReport.students.map(s => {
                    const attended = attendanceReport.lessons.filter(
                      l => attendanceReport.attendance[`${s.student_id}_${l.lesson_id}`]
                    ).length;
                    const rate = Math.round((attended / attendanceReport.lessons.length) * 100);
                    return (
                      <tr key={s.student_id} style={{ backgroundColor: mainBg }}>
                        <td
                          style={{
                            padding: '8px',
                            textAlign: 'left',
                            position: 'sticky',
                            left: 0,
                            backgroundColor: mainBg,
                          }}
                        >
                          {s.full_name}
                        </td>
                        {attendanceReport.lessons.map(l => (
                          <td key={l.lesson_id} style={{ padding: '8px', textAlign: 'center' }}>
                            {attendanceReport.attendance[`${s.student_id}_${l.lesson_id}`] ? '✅' : '❌'}
                          </td>
                        ))}
                        <td style={{ padding: '8px', textAlign: 'center' }}>{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', color: '#666', padding: '30px', backgroundColor: mainBg }}>
                Выберите группу или студента
              </p>
            )}
          </div>
        </div>
      </div>
      {/*кастомное окно ошибки*/}
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
              Уведомление от сайта localhost
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