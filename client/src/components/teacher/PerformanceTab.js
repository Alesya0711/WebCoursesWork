// client/src/components/teacher/PerformanceTab.js
import { useState, useEffect } from 'react';
import ConfirmationModal from '../ConfirmationModal';

const buttonGreen = '#2e7d32';
const buttonBlue = '#1565c0';
const buttonRed = '#c62828';
const buttonYellow = '#f57c00';
const mainBg = '#e8f5e9';
const headerBg = '#c8e6c9';
const selectedBg = '#a5d6a7';
const tableWidth = '900px';
const fontSize = '20px';

export default function PerformanceTab({ teacherId }) {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const [individualAssignments, setIndividualAssignments] = useState([]);
  const [finalWorks, setFinalWorks] = useState([]);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [selectedFinalWorkId, setSelectedFinalWorkId] = useState(null);

  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [showEditAssignment, setShowEditAssignment] = useState(false);
  const [showGradeAssignment, setShowGradeAssignment] = useState(false);
  const [showAddFinalWork, setShowAddFinalWork] = useState(false);
  const [showEditFinalWork, setShowEditFinalWork] = useState(false);

  const [confirmModal, setConfirmModal] = useState(null);

  const [newAssignment, setNewAssignment] = useState({
    topic_id: '',
    student_id: '',
    assignment_name: '',
    assignment_date: new Date().toISOString().split('T')[0]
  });
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [gradingAssignment, setGradingAssignment] = useState(null);

  const [newFinalWork, setNewFinalWork] = useState({
    student_id: '',
    ticket_number: '',
    exam_date: new Date().toISOString().split('T')[0],
    theory_grade: '',
    practice_grade: ''
  });
  const [editingFinalWork, setEditingFinalWork] = useState(null);

  const [studentsForAssignments, setStudentsForAssignments] = useState([]);
  const [studentsForFinalWork, setStudentsForFinalWork] = useState([]);
  const [hoveredButton, setHoveredButton] = useState(null); 
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`/api/teachers/courses.php?teacher_id=${teacherId}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setCourses(data) : setCourses([]))
      .catch(() => setCourses([]));
  }, [teacherId]);

  useEffect(() => {
    if (selectedCourseId) {
      fetch(`/api/groups/get-by-course.php?course_id=${selectedCourseId}`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setGroups(data) : setGroups([]))
        .catch(() => setGroups([]));
    } else {
      setGroups([]);
      setSelectedGroupId(null);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedGroupId) {
      fetch(`/api/topics/get-by-group.php?group_id=${selectedGroupId}`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setTopics(data) : setTopics([]))
        .catch(() => setTopics([]));
    } else {
      setTopics([]);
      setSelectedTopicId(null);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (selectedTopicId && selectedGroupId) {
      fetch(`/api/assignments/get-by-topic-and-group.php?topic_id=${selectedTopicId}&group_id=${selectedGroupId}`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setIndividualAssignments(data) : setIndividualAssignments([]))
        .catch(() => setIndividualAssignments([]));
    } else {
      setIndividualAssignments([]);
    }
  }, [selectedTopicId, selectedGroupId]);

  useEffect(() => {
    if (selectedGroupId && selectedCourseId) {
      fetch(`/api/finalworks/get-by-course-and-group.php?course_id=${selectedCourseId}&group_id=${selectedGroupId}`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setFinalWorks(data) : setFinalWorks([]))
        .catch(() => setFinalWorks([]));
    } else {
      setFinalWorks([]);
    }
  }, [selectedGroupId, selectedCourseId]);

  useEffect(() => {
    if (showAddAssignment && selectedGroupId) {
      fetch(`/api/students/get-by-group.php?group_id=${selectedGroupId}`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setStudentsForAssignments(data) : setStudentsForAssignments([]))
        .catch(() => setStudentsForAssignments([]));
    }
  }, [showAddAssignment, selectedGroupId]);

 useEffect(() => {
    if (showAddFinalWork && selectedGroupId) {
      fetch(`/api/students/get-by-group.php?group_id=${selectedGroupId}`)
        .then(r => r.json())
        .then(data => {
          console.log("Студенты для итоговой:", data); 
          Array.isArray(data) ? setStudentsForFinalWork(data) : setStudentsForFinalWork([]);
        })
        .catch(() => setStudentsForFinalWork([]));
    }
  }, [showAddFinalWork, selectedGroupId]);

  const showError = (message) => {
    setErrorMessage(message);
    setShowErrorModal(true);
  };

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

  const handleAddAssignment = () => {
    if (!selectedTopicId || !selectedGroupId) {
      showError('Выберите группу и тему');
      return;
    }
    setNewAssignment({
      topic_id: selectedTopicId,
      student_id: '',
      assignment_name: '',
      assignment_date: new Date().toISOString().split('T')[0]
    });
    setShowAddAssignment(true);
  };

  const handleSaveAssignment = async () => {
    if (!newAssignment.student_id || !newAssignment.assignment_name) {
      showError('Выберите студента и введите название');
      return;
    }
    try {
      const res = await fetch('/api/assignments/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment)
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddAssignment(false);
        refreshAssignments();
      } else {
        alert(data.error || 'Ошибка добавления задания');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const handleEditAssignment = () => {
    if (!selectedAssignmentId) {
      alert('Выберите задание для редактирования');
      return;
    }
    const assignment = individualAssignments.find(a => a.assignment_id === selectedAssignmentId);
    setEditingAssignment(assignment);
    setShowEditAssignment(true);
  };

  const handleSaveEditAssignment = async () => {
    if (!editingAssignment?.assignment_name) {
      alert('Название задания обязательно');
      return;
    }
    try {
      const res = await fetch('/api/assignments/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAssignment)
      });
      const data = await res.json();
      if (res.ok) {
        setShowEditAssignment(false);
        refreshAssignments();
      } else {
        alert(data.error || 'Ошибка обновления');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const handleDeleteAssignment = () => {
    if (!selectedAssignmentId) {
      alert('Выберите задание для удаления');
      return;
    }
    const assignment = individualAssignments.find(a => a.assignment_id === selectedAssignmentId);
    setConfirmModal({
      title: 'Удаление задания',
      message: `Удалить задание "${assignment.assignment_name}" для ${assignment.student_name}?`,
      action: 'deleteAssignment',
      id: selectedAssignmentId
    });
  };

  const handleSetGrade = () => {
    if (!selectedAssignmentId) {
      alert('Выберите задание для выставления оценки');
      return;
    }
    const assignment = individualAssignments.find(a => a.assignment_id === selectedAssignmentId);
    setGradingAssignment({ ...assignment, grade: assignment.grade || '' });
    setShowGradeAssignment(true);
  };

  const handleSaveGrade = async () => {
    try {
      if (!gradingAssignment.assignment_name) {
        alert("Ошибка: отсутствует название задания");
        return;
      }

      const res = await fetch('/api/assignments/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradingAssignment) 
      });

      const data = await res.json();

      if (res.ok) {
        setShowGradeAssignment(false);
        refreshAssignments(); 
      } else {
        alert(data.error || 'Ошибка обновления оценки');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Ошибка сети');
    }
  };

  const handleAddFinalWork = () => {
    if (!selectedCourseId || !selectedGroupId) {
      showError('Выберите курс и группу');
      return;
    }
    setNewFinalWork({
      student_id: '',
      ticket_number: '',
      exam_date: new Date().toISOString().split('T')[0],
      theory_grade: '',
      practice_grade: ''
    });
    setShowAddFinalWork(true);
  };

  const handleSaveFinalWork = async () => {
    if (!newFinalWork.student_id || !newFinalWork.ticket_number) {
      showError('Выберите студента и введите номер билета');
      return;
    }
    try {
      const res = await fetch('/api/finalworks/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFinalWork,
          course_id: selectedCourseId
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddFinalWork(false);
        refreshFinalWorks();
      } else {
        alert(data.error || 'Ошибка добавления итоговой работы');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const handleEditFinalWork = () => {
    if (!selectedFinalWorkId) {
      alert('Выберите итоговую работу для редактирования');
      return;
    }
    const fw = finalWorks.find(f => f.final_id === selectedFinalWorkId);
    setEditingFinalWork({ ...fw });
    setShowEditFinalWork(true);
  };

  const handleSaveEditFinalWork = async () => {
    try {
      const res = await fetch('/api/finalworks/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFinalWork)
      });
      const data = await res.json();
      if (res.ok) {
        setShowEditFinalWork(false);
        refreshFinalWorks();
      } else {
        showError(data.error || 'Оценка находится вне допустимого диапазонна');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const handleDeleteFinalWork = () => {
    if (!selectedFinalWorkId) {
      alert('Выберите итоговую работу для удаления');
      return;
    }
    const fw = finalWorks.find(f => f.final_id === selectedFinalWorkId);
    setConfirmModal({
      title: 'Удаление итоговой работы',
      message: `Удалить итоговую работу для ${fw.student_name}?`,
      action: 'deleteFinalWork',
      id: selectedFinalWorkId
    });
  };

  const handleConfirm = async () => {
    if (!confirmModal) return;
    if (confirmModal.action === 'deleteAssignment') {
      try {
        const res = await fetch('/api/assignments/delete.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignment_id: confirmModal.id })
        });
        if (res.ok) {
          setSelectedAssignmentId(null);
          refreshAssignments();
        } else {
          alert('Ошибка удаления задания');
        }
      } catch (err) {
        alert('Ошибка сети');
      }
    }
    if (confirmModal.action === 'deleteFinalWork') {
      try {
        const res = await fetch('/api/finalworks/delete.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ final_id: confirmModal.id })
        });
        if (res.ok) {
          setSelectedFinalWorkId(null);
          refreshFinalWorks();
        } else {
          alert('Ошибка удаления итоговой работы');
        }
      } catch (err) {
        alert('Ошибка сети');
      }
    }
    setConfirmModal(null);
  };

  const handleCancel = () => {
    setConfirmModal(null);
  };

  const refreshAssignments = () => {
    if (selectedTopicId && selectedGroupId) {
      fetch(`/api/assignments/get-by-topic-and-group.php?topic_id=${selectedTopicId}&group_id=${selectedGroupId}`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setIndividualAssignments(data) : setIndividualAssignments([]));
    }
  };

  const refreshFinalWorks = () => {
    if (selectedCourseId && selectedGroupId) {
      fetch(`/api/finalworks/get-by-course-and-group.php?course_id=${selectedCourseId}&group_id=${selectedGroupId}`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setFinalWorks(data) : setFinalWorks([]));
    }
  };

  const formatGrade = (value) => {
    if (value == null) return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) ? num.toFixed(2) : '—';
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
        <div style={{ width: tableWidth, margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold', marginBottom: '12px' }}>
              Управление успеваемостью
            </h3>

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
                  <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
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
                    <option key={g.group_id} value={g.group_id}>{g.group_name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedGroupId && (
              <div>
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
                    <option key={t.topic_id} value={t.topic_id}>{t.topic_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div style={{ width: tableWidth, margin: '30px auto 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
              Индивидуальные задания
            </h3>
              <div>
                <button
                  onMouseEnter={() => setHoveredButton('addAssign')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleAddAssignment}
                  style={buttonStyle(buttonGreen, false, hoveredButton === 'addAssign')}
                >
                  Добавить
                </button>
                <button
                  onMouseEnter={() => setHoveredButton('editAssign')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleEditAssignment}
                  style={buttonStyle(buttonBlue, !selectedAssignmentId, hoveredButton === 'editAssign')}
                  disabled={!selectedAssignmentId}
                >
                  Редактировать
                </button>
                <button
                  onMouseEnter={() => setHoveredButton('deleteAssign')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleDeleteAssignment}
                  style={buttonStyle(buttonRed, !selectedAssignmentId, hoveredButton === 'deleteAssign')}
                  disabled={!selectedAssignmentId}
                >
                  Удалить
                </button>
                <button
                  onMouseEnter={() => setHoveredButton('grade')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleSetGrade}
                  style={buttonStyle(buttonYellow, !selectedAssignmentId, hoveredButton === 'grade')}
                  disabled={!selectedAssignmentId}
                >
                  Выставить оценку
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
                  <th style={{ padding: '10px', textAlign: 'left', minWidth: '180px' }}>Учащийся</th>
                  <th style={{ padding: '10px', textAlign: 'left', minWidth: '200px' }}>Задание</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '100px' }}>Оценка</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '120px' }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {individualAssignments.length > 0 ? (
                  individualAssignments.map(row => (
                    <tr
                      key={row.assignment_id}
                      onClick={() => setSelectedAssignmentId(row.assignment_id)}
                      style={{
                        backgroundColor: selectedAssignmentId === row.assignment_id ? selectedBg : mainBg,
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{row.student_name}</td>
                      <td style={{ padding: '10px' }}>{row.assignment_name || '—'}</td>
                      <td style={{ padding: '10px' }}>{formatGrade(row.grade)}</td>
                      <td style={{ padding: '10px' }}>{row.status || 'не выдано'}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={4} message={selectedTopicId ? 'Нет заданий' : 'Выберите тему'} />
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ width: tableWidth, margin: '30px auto 0' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>
              Итоговая работа
            </h3>
              <div>
                <button
                  onMouseEnter={() => setHoveredButton('addFinal')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleAddFinalWork}
                  style={buttonStyle(buttonGreen, false, hoveredButton === 'addFinal')}
                >
                  Добавить
                </button>
                <button
                  onMouseEnter={() => setHoveredButton('editFinal')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleEditFinalWork}
                  style={buttonStyle(buttonBlue, !selectedFinalWorkId, hoveredButton === 'editFinal')}
                  disabled={!selectedFinalWorkId}
                >
                  Редактировать
                </button>
                <button
                  onMouseEnter={() => setHoveredButton('deleteFinal')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={handleDeleteFinalWork}
                  style={buttonStyle(buttonRed, !selectedFinalWorkId, hoveredButton === 'deleteFinal')}
                  disabled={!selectedFinalWorkId}
                >
                  Удалить
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
                  <th style={{ padding: '10px', textAlign: 'left', minWidth: '180px' }}>Учащийся</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '100px' }}>Билет</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '120px' }}>Дата экзамена</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '100px' }}>Теория</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '100px' }}>Практика</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '120px' }}>Средний балл</th>
                </tr>
              </thead>
              <tbody>
                {finalWorks.length > 0 ? (
                  finalWorks.map(fw => (
                    <tr
                      key={fw.final_id}
                      onClick={() => {
                        setSelectedFinalWorkId(fw.final_id);
                        setEditingFinalWork({ ...fw });
                      }}
                      style={{
                        backgroundColor: selectedFinalWorkId === fw.final_id ? selectedBg : mainBg,
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{fw.student_name}</td>
                      <td style={{ padding: '10px' }}>{fw.ticket_number || '—'}</td>
                      <td style={{ padding: '10px' }}>
                        {fw.exam_date ? new Date(fw.exam_date).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '10px' }}>{formatGrade(fw.theory_grade)}</td>
                      <td style={{ padding: '10px' }}>{formatGrade(fw.practice_grade)}</td>
                      <td style={{ padding: '10px' }}>
                        {fw.theory_grade && fw.practice_grade
                          ? ((fw.theory_grade * 0.4 + fw.practice_grade * 0.6).toFixed(2))
                          : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={6} message={selectedGroupId ? 'Нет итоговых работ' : 'Выберите группу'} />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddAssignment && (
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
            <h3>Новое индивидуальное задание</h3>
            <div style={{ marginBottom: '10px' }}>
              <select
                value={newAssignment.student_id}
                onChange={e => setNewAssignment({ ...newAssignment, student_id: e.target.value })}
                style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="">Выберите студента</option>
                {studentsForAssignments.map(s => (
                  <option key={s.student_id} value={s.student_id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={newAssignment.assignment_name}
                onChange={e => setNewAssignment({ ...newAssignment, assignment_name: e.target.value })}
                placeholder="Название задания"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="date"
                value={newAssignment.assignment_date}
                onChange={e => setNewAssignment({ ...newAssignment, assignment_date: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
              <button
                onClick={handleSaveAssignment}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowAddAssignment(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditAssignment && (
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
            <h3>Редактировать задание</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={editingAssignment?.assignment_name || ''}
                onChange={e => setEditingAssignment({ ...editingAssignment, assignment_name: e.target.value })}
                placeholder="Название задания"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>

            <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '12px', display: 'block' }}>Срок сдачи:</label>
                <input
                  type="date"
                  value={editingAssignment?.assignment_date?.split('T')[0] || ''}
                  onChange={e => setEditingAssignment({ ...editingAssignment, assignment_date: e.target.value })}
                  style={{ width: '97%', padding: '5px', fontSize: '14px' }}
                />
            </div>

            <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
              <button
                onClick={handleSaveEditAssignment}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowEditAssignment(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showGradeAssignment && (
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
            <h3>Выставить оценку</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="number"
                step="0.1"
                min="2"
                max="5"
                value={gradingAssignment?.grade}
                onChange={e => setGradingAssignment({ ...gradingAssignment, grade: e.target.value })}
                placeholder="Оценка (2–5)"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <select
                value={gradingAssignment?.status || 'оценено'}
                onChange={e => setGradingAssignment({ ...gradingAssignment, status: e.target.value })}
                style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="выдано">выдано</option>
                <option value="на проверке">на проверке</option>
                <option value="сдано">сдано</option>
                <option value="оценено">оценено</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
              <button
                onClick={handleSaveGrade}
                style={{
                  backgroundColor: buttonYellow,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowGradeAssignment(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddFinalWork && (
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
            <h3>Новая итоговая работа</h3>
            <div style={{ marginBottom: '10px' }}>
              <select
                value={newFinalWork.student_id}
                onChange={e => setNewFinalWork({ ...newFinalWork, student_id: e.target.value })}
                style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="">Выберите студента</option>
                {studentsForFinalWork.map(s => (
                  <option key={s.student_id} value={s.student_id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={newFinalWork.ticket_number}
                onChange={e => setNewFinalWork({ ...newFinalWork, ticket_number: e.target.value })}
                placeholder="Номер билета"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="date"
                value={newFinalWork.exam_date}
                onChange={e => setNewFinalWork({ ...newFinalWork, exam_date: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="number"
                min="1"
                max="5"
                value={newFinalWork.theory_grade}
                onChange={e => setNewFinalWork({ ...newFinalWork, theory_grade: e.target.value })}
                placeholder="Теория (1–5)"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="number"
                min="1"
                max="5"
                value={newFinalWork.practice_grade}
                onChange={e => setNewFinalWork({ ...newFinalWork, practice_grade: e.target.value })}
                placeholder="Практика (1–5)"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
              <button
                onClick={handleSaveFinalWork}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowAddFinalWork(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditFinalWork && editingFinalWork && (
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
            <h3>Редактировать итоговую работу</h3>
            <div style={{ marginBottom: '10px', padding: '5px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <strong>{editingFinalWork.student_name}</strong>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="text"
                value={editingFinalWork.ticket_number || ''}
                onChange={e => setEditingFinalWork({ ...editingFinalWork, ticket_number: e.target.value })}
                placeholder="Номер билета"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="date"
                value={editingFinalWork.exam_date?.split('T')[0] || ''}
                onChange={e => setEditingFinalWork({ ...editingFinalWork, exam_date: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="number"
                min="1"
                max="5"
                value={editingFinalWork.theory_grade || ''}
                onChange={e => setEditingFinalWork({ ...editingFinalWork, theory_grade: e.target.value })}
                placeholder="Теория (1–5)"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="number"
                min="1"
                max="5"
                value={editingFinalWork.practice_grade || ''}
                onChange={e => setEditingFinalWork({ ...editingFinalWork, practice_grade: e.target.value })}
                placeholder="Практика (1–5)"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
              <button
                onClick={handleSaveEditFinalWork}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowEditFinalWork(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal && (
        <ConfirmationModal
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
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