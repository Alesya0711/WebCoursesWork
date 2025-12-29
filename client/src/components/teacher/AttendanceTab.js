// client/src/components/teacher/AttendanceTab.js
import { useState, useEffect } from 'react';

const buttonGreen = '#2e7d32';
const mainBg = '#e8f5e9';
const headerBg = '#c8e6c9';
const selectedBg = '#a5d6a7';
const tableWidth = '900px';
const fontSize = '20px';

export default function AttendanceTab({ teacherId }) {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isSaveButtonHovered, setIsSaveButtonHovered] = useState(false);

  //Загрузка курсов преподавателя
  useEffect(() => {
    fetch(`/api/teachers/courses.php?teacher_id=${teacherId}`)
      .then(r => r.json())
      .then(setCourses)
      .catch(err => alert('Ошибка загрузки курсов'));
  }, [teacherId]);

  //Загрузка групп по курсу
  useEffect(() => {
    if (selectedCourseId) {
      fetch(`/api/groups/get-by-course.php?course_id=${selectedCourseId}`)
        .then(r => r.json())
        .then(setGroups)
        .catch(err => alert('Ошибка загрузки групп'));
    } else {
      setGroups([]);
      setSelectedGroupId(null);
    }
  }, [selectedCourseId]);

  //Загрузка тем по группе
  useEffect(() => {
    if (selectedGroupId) {
      fetch(`/api/topics/get-by-group.php?group_id=${selectedGroupId}`)
        .then(r => r.json())
        .then(setTopics)
        .catch(err => alert('Ошибка загрузки тем'));
    } else {
      setTopics([]);
      setSelectedTopicId(null);
    }
  }, [selectedGroupId]);

  //Загрузка занятий по теме
  useEffect(() => {
    if (selectedTopicId) {
      fetch(`/api/lessons/get-by-topic.php?topic_id=${selectedTopicId}`)
        .then(r => r.json())
        .then(setLessons)
        .catch(err => alert('Ошибка загрузки занятий'));
    } else {
      setLessons([]);
      setSelectedLessonId(null);
    }
  }, [selectedTopicId]);

  //Загрузка посещаемости по занятию и группе
  useEffect(() => {
    if (selectedLessonId && selectedGroupId) {
      fetch(`/api/attendance/get-by-lesson-and-group.php?lesson_id=${selectedLessonId}&group_id=${selectedGroupId}`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setAttendanceRecords(data) : setAttendanceRecords([]))
        .catch(err => alert('Ошибка загрузки посещаемости'));
    } else {
      setAttendanceRecords([]);
    }
  }, [selectedLessonId, selectedGroupId]);

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

  //кнопка сохранения посещаемости
  const handleSave = () => {
    if (!selectedLessonId || !selectedGroupId) {
      alert('Выберите группу и занятие');
      return;
    }

    const attendanceData = attendanceRecords.map(record => ({
      student_id: record.student_id,
      lesson_id: selectedLessonId,
      is_present: record.is_present
    }));

    fetch('/api/attendance/update.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance: attendanceData })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          alert('Посещаемость успешно сохранена');
        } else {
          alert(data.error || 'Ошибка сохранения');
        }
      })
      .catch(err => alert('Ошибка сети: ' + err.message));
  };

  const handleCheckboxChange = (studentId, isChecked) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.student_id === studentId
          ? { ...record, is_present: isChecked }
          : record
      )
    );
  };

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
        <div style={{ width: tableWidth, margin: '0 auto', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold' }}>
            Управление посещаемостью
          </h3>
        </div>

        {/*настройка посещаемости*/}
        <div style={{ width: tableWidth, margin: '0 auto' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Курс:</label>
            <select
              value={selectedCourseId || ''}
              onChange={e => setSelectedCourseId(e.target.value || null)}
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

          {selectedCourseId && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Группа:</label>
              <select
                value={selectedGroupId || ''}
                onChange={e => setSelectedGroupId(e.target.value || null)}
                style={{
                  padding: '6px',
                  fontSize: '14px',
                  minWidth: '200px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                disabled={!selectedCourseId}
              >
                <option value="">Выберите группу</option>
                {groups.map(g => (
                  <option key={g.group_id} value={g.group_id}>
                    {g.group_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedGroupId && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Тема:</label>
              <select
                value={selectedTopicId || ''}
                onChange={e => setSelectedTopicId(e.target.value || null)}
                style={{
                  padding: '6px',
                  fontSize: '14px',
                  minWidth: '200px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                disabled={!selectedGroupId}
              >
                <option value="">Выберите тему</option>
                {topics.map(t => (
                  <option key={t.topic_id} value={t.topic_id}>
                    {t.topic_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedTopicId && (
            <div>
              <label style={{ fontWeight: 'bold', marginRight: '8px' }}>Занятие:</label>
              <select
                value={selectedLessonId || ''}
                onChange={e => setSelectedLessonId(e.target.value || null)}
                style={{
                  padding: '6px',
                  fontSize: '14px',
                  minWidth: '300px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                disabled={!selectedTopicId}
              >
                <option value="">Выберите занятие</option>
                {lessons.map(l => (
                  <option key={l.lesson_id} value={l.lesson_id}>
                    {l.lesson_type} №{l.lesson_number} от {new Date(l.lesson_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ width: tableWidth, margin: '30px auto 0' }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '24px', fontWeight: 'bold' }}>
              Посещаемость
            </h3>
              <button
                onClick={handleSave}
                onMouseEnter={() => setIsSaveButtonHovered(true)}
                onMouseLeave={() => setIsSaveButtonHovered(false)}
                style={buttonStyle(buttonGreen, false, isSaveButtonHovered)}
              >
                Сохранить
              </button>
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
                  <th style={{ padding: '10px', textAlign: 'left', minWidth: '60px' }}>№</th>
                  <th style={{ padding: '10px', textAlign: 'left', minWidth: '180px' }}>ФИО</th>
                  <th style={{ padding: '10px', textAlign: 'left', minWidth: '200px' }}>Тема занятия</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '120px' }}>Тип занятия</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '120px' }}>Присутствие</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record, idx) => (
                    <tr key={record.student_id}>
                      <td style={{ padding: '10px' }}>{idx + 1}</td>
                      <td style={{ padding: '10px' }}>{record.full_name}</td>
                      <td style={{ padding: '10px' }}>{record.topic_name || '—'}</td>
                      <td style={{ padding: '10px' }}>{record.lesson_type || '—'}</td>
                      <td style={{ padding: '10px' }}>
                        <input
                          type="checkbox"
                          checked={record.is_present || false}
                          onChange={(e) => handleCheckboxChange(record.student_id, e.target.checked)}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                          }}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={5} message={selectedLessonId ? 'Нет данных' : 'Выберите занятие'} />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}