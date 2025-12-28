// client/src/components/admin/ReportsTab.js
import { useState, useEffect } from 'react';

const buttonGreen = '#2e7d32';
const buttonBlue = '#1565c0';
const buttonRed = '#c62828';
const mainBg = '#e8f5e9';
const headerBg = '#c8e6c9';
const selectedBg = '#a5d6a7';
const tableWidth = '900px';
const fontSize = '20px'; 

export default function ReportsTab() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedGroupGrades, setSelectedGroupGrades] = useState(null);
  const [selectedStudentGrades, setSelectedStudentGrades] = useState(null);
  const [gradesReport, setGradesReport] = useState([]);

   const [selectedGroupAttendance, setSelectedGroupAttendance] = useState(null);
  const [selectedStudentAttendance, setSelectedStudentAttendance] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [hoveredButton, setHoveredButton] = useState(null); 

  // Загрузка данных
  useEffect(() => {
    fetch('/api/groups/get-all.php')
      .then(r => r.json())
      .then(setGroups)
      .catch(err => alert('Ошибка загрузки групп'));

    fetch('/api/students/get-all.php')
      .then(r => r.json())
      .then(setStudents)
      .catch(err => alert('Ошибка загрузки студентов'));
  }, []);

  const handleGradesByGroup = () => {
    if (!selectedGroupGrades) {
      alert('Выберите группу');
      return;
    }
    fetch(`/api/reports/grades-by-group.php?group_id=${selectedGroupGrades}`)
      .then(r => r.json())
      .then(setGradesReport)
      .catch(err => alert('Ошибка загрузки отчёта'));
  };

  const handleGradesByStudent = () => {
    if (!selectedStudentGrades) {
      alert('Выберите студента');
      return;
    }
    fetch(`/api/reports/grades-by-student.php?student_id=${selectedStudentGrades}`)
      .then(r => r.json())
      .then(setGradesReport)
      .catch(err => alert('Ошибка загрузки отчёта'));
  };

  const handleAttendanceByGroup = () => {
    if (!selectedGroupAttendance) {
      alert('Выберите группу');
      return;
    }
    fetch(`/api/reports/attendance-by-group.php?group_id=${selectedGroupAttendance}`)
      .then(r => r.json())
      .then(setAttendanceReport)
      .catch(err => alert('Ошибка загрузки отчёта'));
  };

  const handleAttendanceByStudent = () => {
    if (!selectedStudentAttendance) {
      alert('Выберите студента');
      return;
    }
    fetch(`/api/reports/attendance-by-student.php?student_id=${selectedStudentAttendance}`)
      .then(r => r.json())
      .then(setAttendanceReport)
      .catch(err => alert('Ошибка загрузки отчёта'));
  };

  const buttonStyle = (bgColor, disabled = false, isHovered = false) => ({
    backgroundColor: disabled ? '#bdbdbd' : bgColor,
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    marginRight: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    boxShadow: isHovered && !disabled
      ? '0 6px 16px rgba(0,0,0,0.3)'
      : 'none',
    transition: 'box-shadow 0.25s ease-in-out, background-color 0.15s ease',
  });

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
        {/* === УСПЕВАЕМОСТЬ === */}
        <div style={{ width: tableWidth, marginBottom: '40px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold' }}>
              Успеваемость
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
            <select
              value={selectedGroupGrades || ''}
              onChange={e => setSelectedGroupGrades(e.target.value || null)}
              style={{ padding: '6px', fontSize: '14px', minWidth: '200px' }}
            >
              <option value="">Выберите группу</option>
              {groups.map(g => (
                <option key={g.group_id} value={g.group_id}>{g.group_name}</option>
              ))}
            </select>
            <button
              onClick={handleGradesByGroup}
              onMouseEnter={() => setHoveredButton('gradesGroup')}
              onMouseLeave={() => setHoveredButton(null)}
              style={buttonStyle(buttonGreen, !selectedGroupGrades, hoveredButton === 'gradesGroup')}
            >
              Отчёт по группе
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
            <select
              value={selectedStudentGrades || ''}
              onChange={e => setSelectedStudentGrades(e.target.value || null)}
              style={{ padding: '6px', fontSize: '14px', minWidth: '200px' }}
            >
              <option value="">Выберите студента</option>
              {students.map(s => (
                <option key={s.student_id} value={s.student_id}>{s.full_name}</option>
              ))}
            </select>
            <button
              onClick={handleGradesByStudent}
              onMouseEnter={() => setHoveredButton('gradesStudent')}
              onMouseLeave={() => setHoveredButton(null)}
              style={buttonStyle(buttonGreen, !selectedStudentGrades, hoveredButton === 'gradesStudent')}
            >
              Отчёт по студенту
            </button>
          </div>

          <div style={{ backgroundColor: mainBg, padding: '10px', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize }}>
              <thead>
                <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                  {gradesReport.length > 0 && Object.keys(gradesReport[0]).map(key => (
                    <th key={key} style={{ padding: '6px', textAlign: 'left' }}>
                      {key === 'student_name' ? 'Студент' :
                      key === 'avg_assignment_grade' ? 'Средний по заданиям' :
                      key === 'final_work_grade' ? 'Итоговая работа' :
                      key === 'course_final_grade' ? 'Оценка за курс' :
                      key === 'total_assignments' ? 'Всего заданий' :
                      key === 'completed_assignments' ? 'Сдано' :
                      key === 'course_name' ? 'Курс' :
                      key === 'assignment_name' ? 'Задание' :
                      key === 'grade' ? 'Оценка' :
                      key === 'status' ? 'Статус' : key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gradesReport.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: mainBg }}>
                    {Object.entries(row).map(([key, val], i) => {
                      const isNumericColumn = [
                        'avg_assignment_grade',
                        'final_work_grade',
                        'course_final_grade',
                        'total_assignments',
                        'completed_assignments',
                        'grade'
                      ].includes(key);

                      let displayValue;
                      if (isNumericColumn && (typeof val === 'string' || typeof val === 'number')) {
                        const num = parseFloat(val);
                        displayValue = isNaN(num) ? val : num.toFixed(2);
                      } else {
                        displayValue = val || '—';
                      }

                      return (
                        <td key={i} style={{ padding: '6px' }}>
                          {displayValue}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {gradesReport.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666', backgroundColor: mainBg }}>
                      Выберите группу или студента
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* === ПОСЕЩАЕМОСТЬ === */}
        <div style={{ width: tableWidth, margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold' }}>
              Посещаемость
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
            <select
              value={selectedGroupAttendance || ''}
              onChange={e => setSelectedGroupAttendance(e.target.value || null)}
              style={{ padding: '6px', fontSize: '14px', minWidth: '200px' }}
            >
              <option value="">Выберите группу</option>
              {groups.map(g => (
                <option key={g.group_id} value={g.group_id}>{g.group_name}</option>
              ))}
            </select>
            <button
              onClick={handleAttendanceByGroup}
              onMouseEnter={() => setHoveredButton('attGroup')}
              onMouseLeave={() => setHoveredButton(null)}
              style={buttonStyle(buttonGreen, !selectedGroupAttendance, hoveredButton === 'attGroup')}
            >
              Отчёт по группе
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
            <select
              value={selectedStudentAttendance || ''}
              onChange={e => setSelectedStudentAttendance(e.target.value || null)}
              style={{ padding: '6px', fontSize: '14px', minWidth: '200px' }}
            >
              <option value="">Выберите студента</option>
              {students.map(s => (
                <option key={s.student_id} value={s.student_id}>{s.full_name}</option>
              ))}
            </select>
            <button
              onClick={handleAttendanceByStudent}
              onMouseEnter={() => setHoveredButton('attStudent')}
              onMouseLeave={() => setHoveredButton(null)}
              style={buttonStyle(buttonGreen, !selectedStudentAttendance, hoveredButton === 'attStudent')}
            >
              Отчёт по студенту
            </button>
          </div>

          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'transparent' }}>
            {Array.isArray(attendanceReport) && attendanceReport.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize, margin: '0 auto' }}>
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px', margin: '0 auto' }}>
                <thead>
                  <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                    <th style={{ padding: '8px', textAlign: 'left', position: 'sticky', left: 0, backgroundColor: headerBg }}>
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
                    const attended = attendanceReport.lessons.filter(l =>
                      attendanceReport.attendance[`${s.student_id}_${l.lesson_id}`]
                    ).length;
                    const rate = Math.round((attended / attendanceReport.lessons.length) * 100);
                    return (
                      <tr key={s.student_id} style={{ backgroundColor: mainBg }}>
                        <td style={{ padding: '8px', textAlign: 'left', position: 'sticky', left: 0, backgroundColor: mainBg }}>
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
    </div>
  );
}