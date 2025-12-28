// client/src/components/student/StudentProfileTab.js
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const buttonGreen = '#2e7d32';
const mainBg = '#e8f5e9';
const headerBg = '#c8e6c9';
const selectedBg = '#a5d6a7';
const tableWidth = '900px';
const fontSize = '20px';

export default function StudentProfileTab() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [grades, setGrades] = useState({ assignments: [], final_work: null });
  const [attendance, setAttendance] = useState([]);

  const [photoUrl, setPhotoUrl] = useState('');
  const profile = user?.student || {};
  const [hoveredCourseId, setHoveredCourseId] = useState(null);

  // Загрузка фото и курсов
  useEffect(() => {
    if (user?.student?.student_id) {
      // Фото
      fetch(`/api/students/get-photo-path.php?student_id=${user.student.student_id}`)
        .then(r => r.json())
        .then(data => {
          if (data.photo_path) {
            setPhotoUrl(`/uploads/${data.photo_path}`);
          }
        })
        .catch(err => alert('Ошибка загрузки фото'));

      // Курсы
      fetch(`/api/students/get-courses.php?student_id=${user.student.student_id}`)
        .then(r => r.json())
        .then(setCourses)
        .catch(err => alert('Ошибка загрузки курсов'));
    }
  }, [user]);

  // Загрузка данных по курсу
  useEffect(() => {
    if (selectedCourseId && user?.student?.student_id) {
      const studentId = user.student.student_id;
      const courseId = selectedCourseId;

      // Успеваемость
      fetch(`/api/students/get-grades-by-course.php?course_id=${courseId}&student_id=${studentId}`)
        .then(r => r.json())
        .then(data => {
          setGrades({
            assignments: Array.isArray(data.assignments) ? data.assignments : [],
            final_work: data.final_work || null
          });
        })
        .catch(err => setGrades({ assignments: [], final_work: null }));

      // Посещаемость
      fetch(`/api/students/get-attendance-by-course.php?course_id=${courseId}&student_id=${studentId}`)
        .then(r => r.json())
        .then(data => setAttendance(Array.isArray(data) ? data : []))
        .catch(err => setAttendance([]));
    }
  }, [selectedCourseId, user]);

  const handleCourseClick = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const formatGrade = (value) => {
    if (value == null) return '—';
    return typeof value === 'number' ? value.toFixed(2) : value;
  };

  const handlePhotoUpload = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    fetch('/api/students/upload-photo.php', {
      method: 'POST',
      body: formData
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          fetch(`/api/students/get-photo-path.php?student_id=${profile.student_id}`)
            .then(r => r.json())
            .then(data => {
              if (data.photo_path) {
                setPhotoUrl(`/uploads/${data.photo_path}`);
                alert('Фото успешно загружено');
              }
            });
        } else {
          alert('Ошибка: ' + data.error);
        }
      })
      .catch(err => alert('Ошибка сети: ' + err.message));
  };

  const buttonStyle = (bgColor, disabled = false, isHovered = false) => ({
    backgroundColor: disabled ? '#bdbdbd' : bgColor,
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    marginRight: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: isHovered ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
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

  if (!user?.student) {
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
        <div style={{ width: tableWidth, margin: '0 auto', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold' }}>
            Мой профиль
          </h3>
        </div>

        <div style={{ width: tableWidth, margin: '0 auto', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid #c8e6c9',
                flexShrink: 0,
              }}
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Фото профиля"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.src =
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" fill="%23e0e0e0"/><text x="50%" y="50%" fill="%23999" font-size="14" text-anchor="middle" dominant-baseline="middle">Нет фото</text></svg>';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  Загрузка...
                </div>
              )}
            </div>

            <div style={{ flexGrow: 1, minWidth: '250px' }}>
              <p style={{ margin: '4px 0', fontSize: fontSize }}>
                <strong>ФИО:</strong> {profile.last_name || '—'} {profile.first_name || '—'} {profile.middle_name || '—'}
              </p>
              <p style={{ margin: '4px 0', fontSize: fontSize }}>
                <strong>Email:</strong> {profile.email || '—'}
              </p>

              <form onSubmit={handlePhotoUpload} style={{ marginTop: '16px' }}>
                <input type="hidden" name="student_id" value={profile.student_id} />
                <div style={{ marginBottom: '6px' }}>
                  <input
                    type="file"
                    name="photo"
                    accept="image/jpeg,image/png"
                    required
                    style={{
                      width: '100%',
                      padding: '4px',
                      fontSize: '14px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    backgroundColor: buttonGreen,
                    color: 'white',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }}
                >
                  Загрузить фото
                </button>
              </form>
            </div>
          </div>
        </div>

        <div style={{ width: tableWidth, margin: '0 auto', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
            Мои курсы
          </h3>
          {courses.length > 0 ? (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {courses.map(course => (
                <button
                  key={course.course_id}
                  onClick={() => handleCourseClick(course.course_id)}
                  onMouseEnter={() => setHoveredCourseId(course.course_id)}
                  onMouseLeave={() => setHoveredCourseId(null)}
                  style={buttonStyle(
                    selectedCourseId === course.course_id ? '#1b5e20' : buttonGreen,
                    false,
                    hoveredCourseId === course.course_id
                  )}
                >
                  {course.course_name}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: fontSize, color: '#666' }}>Нет записанных курсов</p>
          )}
        </div>

        {selectedCourseId && (
          <>
            <div style={{ width: tableWidth, margin: '0 auto', marginBottom: '30px' }}>
              <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                Успеваемость
              </h3>
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
                      <th style={{ padding: '10px', textAlign: 'left' }}>Задание</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Оценка</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.assignments.length > 0 ? (
                      grades.assignments.map((a, i) => (
                        <tr key={i} style={{ backgroundColor: mainBg }}>
                          <td style={{ padding: '10px' }}>{a.assignment_name || '—'}</td>
                          <td style={{ padding: '10px' }}>{formatGrade(a.grade)}</td>
                          <td style={{ padding: '10px' }}>{a.status || '—'}</td>
                        </tr>
                      ))
                    ) : null}

                    {grades.final_work && (
                      <>
                        <tr style={{ backgroundColor: mainBg }}>
                          <td style={{ padding: '10px' }}>Итоговая работа (теория)</td>
                          <td style={{ padding: '10px' }}>{formatGrade(grades.final_work.theory_grade)}</td>
                          <td style={{ padding: '10px' }}>оценено</td>
                        </tr>
                        <tr style={{ backgroundColor: mainBg }}>
                          <td style={{ padding: '10px' }}>Итоговая работа (практика)</td>
                          <td style={{ padding: '10px' }}>{formatGrade(grades.final_work.practice_grade)}</td>
                          <td style={{ padding: '10px' }}>оценено</td>
                        </tr>
                      </>
                    )}

                    {grades.assignments.length === 0 && !grades.final_work && (
                      <EmptyRow colSpan={3} message="Нет данных об успеваемости" />
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ width: tableWidth, margin: '0 auto' }}>
              <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
                Посещаемость
              </h3>
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
                      <th style={{ padding: '10px', textAlign: 'left' }}>Тема</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Тип</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>№</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Дата</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.length > 0 ? (
                      attendance.map((att, i) => (
                        <tr key={i} style={{ backgroundColor: mainBg }}>
                          <td style={{ padding: '10px' }}>{att.topic_name || '—'}</td>
                          <td style={{ padding: '10px' }}>{att.lesson_type || '—'}</td>
                          <td style={{ padding: '10px' }}>{att.lesson_number || '—'}</td>
                          <td style={{ padding: '10px' }}>{new Date(att.lesson_date).toLocaleDateString()}</td>
                          <td style={{ padding: '10px' }}>
                            {att.is_present ? '✅ Был' : '❌ Не был'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <EmptyRow colSpan={5} message="Нет данных о посещаемости" />
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}