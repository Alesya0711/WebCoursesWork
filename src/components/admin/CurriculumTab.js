// client/src/components/admin/CurriculumTab.js
import { useState, useEffect } from 'react';
import ConfirmationModal from '../ConfirmationModal';

const buttonGreen = '#2e7d32';   
const buttonBlue = '#1565c0';    
const buttonRed = '#c62828';     
const mainBg = '#e8f5e9';    
const headerBg = '#c8e6c9';  
const selectedBg = '#a5d6a7';    
const tableWidth = '900px';
const fontSize = '20px'; 

export default function CurriculumTab() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [showAddTopicForm, setShowAddTopicForm] = useState(false);
  const [showEditTopicForm, setShowEditTopicForm] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [newTopic, setNewTopic] = useState({
    topic_name: '',
    topic_description: ''
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [showEditLessonForm, setShowEditLessonForm] = useState(false);
  const [newLesson, setNewLesson] = useState({
    topic_id: '',
    lesson_number: 1,
    lesson_date: '',
    lesson_type: 'Лекция'
  });
  const [editingLesson, setEditingLesson] = useState(null);
  const [showAddAssignmentForm, setShowAddAssignmentForm] = useState(false);
  const [showEditAssignmentForm, setShowEditAssignmentForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    topic_id: '',
    student_id: '',
    assignment_name: '',
    description: '',
    assignment_date: ''
  });
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hoveredButton, setHoveredButton] = useState(null); 

  // == Загрузка студентов ==
  const loadStudentsForTopic = (topicId) => {
    fetch(`/api/assignments/students-by-topic.php?topic_id=${topicId}`)
      .then(r => r.json())
      .then(setStudents)
      .catch(err => {
        console.error('Ошибка загрузки студентов:', err);
        alert('Не удалось загрузить студентов');
      });
  };

  // === Загрузка курсов ===
  useEffect(() => {
    fetch('/api/courses/get-all.php')
      .then(r => r.json())
      .then(setCourses)
      .catch(err => {
        console.error('Ошибка загрузки курсов:', err);
        alert('Не удалось загрузить курсы');
      });
  }, []);

  // === Загрузка тем при выборе курса ===
  useEffect(() => {
    if (selectedCourseId) {
      fetch(`/api/topics/get.php?course_id=${selectedCourseId}`)
        .then(r => r.json())
        .then(setTopics)
        .catch(err => {
          console.error('Ошибка загрузки тем:', err);
          alert('Не удалось загрузить темы');
        });
    } else {
      setTopics([]);
      setLessons([]);
      setAssignments([]);
      setSelectedTopicId(null);
      setSelectedLessonId(null);
      setSelectedAssignmentId(null);
    }
  }, [selectedCourseId]);

  // === Загрузка занятий и заданий при выборе темы ===
  useEffect(() => {
    if (selectedTopicId) {
      fetch(`/api/lessons/get.php?topic_id=${selectedTopicId}`)
        .then(r => r.json())
        .then(setLessons)
        .catch(err => {
          console.error('Ошибка загрузки занятий:', err);
          alert('Не удалось загрузить занятия');
        });
      fetch(`/api/assignments/get.php?topic_id=${selectedTopicId}`)
        .then(r => r.json())
        .then(setAssignments)
        .catch(err => {
          console.error('Ошибка загрузки заданий:', err);
          alert('Не удалось загрузить задания');
        });
    } else {
      setLessons([]);
      setAssignments([]);
      setSelectedLessonId(null);
      setSelectedAssignmentId(null);
    }
  }, [selectedTopicId]);

  // === Обработчики тем ===
  const handleAddTopic = () => {
    if (!selectedCourseId) {
      alert('Сначала выберите курс.');
      return;
    }
    setShowAddTopicForm(true);
    setNewTopic({ topic_name: '', topic_description: '' });
  };

  const handleSaveTopic = async () => {
   if (!selectedCourseId || !newTopic.topic_name.trim()) {
      setErrorMessage('Курс и название темы обязательны.');
      setShowErrorModal(true);
      return;
    }
    try {
      const res = await fetch('/api/topics/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: selectedCourseId,
          topic_name: newTopic.topic_name,
          topic_description: newTopic.topic_description
        })
      });
      const data = await res.json();
      if (res.ok) {
        const updated = await fetch(`/api/topics/get.php?course_id=${selectedCourseId}`).then(r => r.json());
        setTopics(updated);
        setShowAddTopicForm(false);
        setNewTopic({ topic_name: '', topic_description: '' });
      } else {
        alert(data.error || 'Ошибка добавления темы');
      }
    } catch (err) {
      alert('Ошибка сети: ' + err.message);
    }
  };

  const handleEditTopic = () => {
    if (!selectedTopicId) {
      setErrorMessage('Выберите тему');
      setShowErrorModal(true);
      return;
    }
    const topic = topics.find(t => t.topic_id === selectedTopicId);
    setEditingTopic(topic);
    setShowEditTopicForm(true);
  };

  const handleDeleteTopic = () => {
    if (!selectedTopicId) {
      setErrorMessage('Выберите тему');
      setShowErrorModal(true);
      return;
    }
    const topic = topics.find(t => t.topic_id === selectedTopicId);
    setConfirmMessage(`Удалить тему «${topic.topic_name}»?`);
    setConfirmAction('deleteTopic');
    setShowConfirmModal(true);
  };

  const handleSaveEditTopic = async () => {
    console.log('Отправляем данные:', editingLesson);
    if (!editingTopic?.topic_id || !editingTopic.topic_name.trim()) {
      setErrorMessage('Название темы обязательно.');
      setShowErrorModal(true);
      return;
    }
    try {
      const res = await fetch('/api/topics/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTopic)
      });
      const data = await res.json();
      if (res.ok) {
        const updated = await fetch(`/api/topics/get.php?course_id=${selectedCourseId}`).then(r => r.json());
        setTopics(updated);
        setShowEditTopicForm(false);
        setEditingTopic(null);
      } else {
        alert(data.error || 'Ошибка обновления темы');
      }
    } catch (err) {
      alert('Ошибка сети: ' + err.message);
    }
  };

  // === Обработчики занятий ===
  const handleAddLesson = () => {
    if (!selectedTopicId) {
      setErrorMessage('Сначала выберите тему.');
      setShowErrorModal(true);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setNewLesson({
      topic_id: selectedTopicId,
      lesson_number: 1,
      lesson_date: today,
      lesson_type: 'Лекция'
    });
    setShowAddLessonForm(true);
  };

  const handleEditLesson = () => {
    if (!selectedLessonId) {
      setErrorMessage('Выберите занятие');
      setShowErrorModal(true);
      return;
    }
    const lesson = lessons.find(l => l.lesson_id === selectedLessonId);
    if (!lesson) {
      setErrorMessage(`Занятие с ID ${selectedLessonId} не найдено.`);
      setShowErrorModal(true);
      return;
    }

    setEditingLesson({
      ...lesson,
      topic_id: lesson.topic_id 
    });
    setShowEditLessonForm(true);
  };

  const handleDeleteLesson = () => {
    if (!selectedLessonId) {
      setErrorMessage('Выберите занятие');
      setShowErrorModal(true);
      return;
    }
    const lesson = lessons.find(l => l.lesson_id === selectedLessonId);
    const lessonInfo = `«${lesson.lesson_type} №${lesson.lesson_number} от ${new Date(lesson.lesson_date).toLocaleDateString()}»`;
    setConfirmMessage(`Удалить занятие ${lessonInfo}?\nВсе данные о посещаемости будут удалены.`);
    setConfirmAction('deleteLesson');
    setShowConfirmModal(true);
  };

  const handleSaveLesson = async () => {
    try {
      const res = await fetch('/api/lessons/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLesson)
      });
      const data = await res.json();
      if (res.ok) {
        const updated = await fetch(`/api/lessons/get.php?topic_id=${selectedTopicId}`).then(r => r.json());
        setLessons(updated);
        setShowAddLessonForm(false);
      } else {
        setErrorMessage(data.error || 'Ошибка добавления занятия');
        setShowErrorModal(true);
      }
    } catch (err) {
      alert('Ошибка сети: ' + err.message);
    }
  };

  const handleSaveEditLesson = async() => {
    console.log('Отправляем данные:', editingLesson);
    if (
      !editingLesson?.lesson_id ||
      !editingLesson?.topic_id || 
      !editingLesson?.lesson_number ||
      !editingLesson?.lesson_date ||
      !editingLesson?.lesson_type
    ) {
      setErrorMessage('Все поля обязательны');
      setShowErrorModal(true);
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(editingLesson.lesson_date)) {
      setErrorMessage('Некорректный формат даты. Убедитесь, что дата выбрана из календаря.');
      setShowErrorModal(true);
      return;
    }

    try {
      const res = await fetch('/api/lessons/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingLesson)
      });
      const data = await res.json();
      if (res.ok) {
        const updated = await fetch(`/api/lessons/get.php?topic_id=${selectedTopicId}`).then(r => r.json());
        setLessons(updated);
        setShowEditLessonForm(false);
        setEditingLesson(null);
      } else {
        setErrorMessage(data.error || 'Ошибка обновления занятия');
        setShowErrorModal(true);
      }
    } catch (err) {
      alert('Ошибка сети: ' + err.message);
    }
  };

  // Добавление
  const handleAddAssignment = () => {
    if (!selectedTopicId) {
      setErrorMessage('Сначала выберите тему.');
      setShowErrorModal(true);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    setNewAssignment({
      topic_id: selectedTopicId,
      student_id: '',
      assignment_name: '',
      description: '',
      assignment_date: today
    });
    loadStudentsForTopic(selectedTopicId);
    setShowAddAssignmentForm(true);
  };

  // Редактирование
  const handleEditAssignment = () => {
    if (!selectedAssignmentId) {
      setErrorMessage('Выберите задание для редактирования.');
      setShowErrorModal(true);
      return;
    }

    const assignment = assignments.find(a => a.assignment_id === selectedAssignmentId);

    if (!assignment) {
      setErrorMessage(`Задание с ID ${selectedAssignmentId} не найдено.`);
      setShowErrorModal(true);
      return;
    }

    setEditingAssignment({
      assignment_id: assignment.assignment_id,
      assignment_name: assignment.assignment_name,
      description: assignment.description || '',
      assignment_date: assignment.assignment_date?.split('T')[0] || '',
      submission_date: assignment.submission_date?.split('T')[0] || '',
      grade: assignment.grade,
      status: assignment.status || 'выдано'
    });

    setShowEditAssignmentForm(true);
  };

  // Удаление
  const handleDeleteAssignment = () => {
    if (!selectedAssignmentId) {
      setErrorMessage('Выберите задание');
      setShowErrorModal(true);
      return;
    }
    const assignment = assignments.find(a => a.assignment_id === selectedAssignmentId);
    const assignmentInfo = `«${assignment.assignment_name}» для ${assignment.student_name}`;
    setConfirmMessage(`Удалить задание ${assignmentInfo}?`);
    setConfirmAction('deleteAssignment');
    setShowConfirmModal(true);
  };

const handleSaveAssignment = async () => {
  if (
    !newAssignment.topic_id ||
    !newAssignment.student_id ||
    !newAssignment.assignment_name?.trim() ||
    !newAssignment.assignment_date
  ) {
    setErrorMessage('Все поля обязательны для заполнения.');
    setShowErrorModal(true);
    return;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(newAssignment.assignment_date)) {
    setErrorMessage('Некорректный формат даты. Убедитесь, что дата выбрана из календаря.');
    setShowErrorModal(true);
    return;
  }

  try {
    const res = await fetch('/api/assignments/add.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignment),
    });

    const data = await res.json(); 

    if (res.ok) {

      setShowAddAssignmentForm(false); 

      const updated = await fetch(`/api/assignments/get.php?topic_id=${selectedTopicId}`).then(r => r.json());
      setAssignments(updated);

      setSelectedAssignmentId(null);
      
      console.log('Задание успешно добавлено');
    } else {
      let msg = data.error || 'Ошибка при добавлении задания';
      
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('уже существует')) {
        msg = 'У этого студента уже есть задание по этой теме.';
      }
      
      setErrorMessage(msg);
      setShowErrorModal(true);
    }

  } catch (err) {
    console.error('Ошибка сети:', err);
    let errorMsg = 'Не удалось подключиться к серверу. Проверьте соединение.';
    if (err.message && (err.message.includes('date') || err.message.includes('format'))) {
      errorMsg = 'Некорректный формат даты. Убедитесь, что дата выбрана из календаря.';
    }
    setErrorMessage(errorMsg);
    setShowErrorModal(true);
  }
};

const handleSaveEditAssignment = async () => {
  if (!editingAssignment?.assignment_id || !editingAssignment.assignment_name) {
    setErrorMessage('Название задания обязательно.');
    setShowErrorModal(true);
    return;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (editingAssignment.assignment_date && !dateRegex.test(editingAssignment.assignment_date)) {
    setErrorMessage('Некорректный формат даты. Убедитесь, что дата выбрана из календаря.');
    setShowErrorModal(true);
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
      const updated = await fetch(`/api/assignments/get.php?topic_id=${selectedTopicId}`).then(r => r.json());
      setAssignments(updated);
      setShowEditAssignmentForm(false);
      setEditingAssignment(null);
    } else {
      let msg = data.error || 'Ошибка обновления задания';
      if (
        msg.toLowerCase().includes('duplicate') ||
        msg.toLowerCase().includes('уже существует')
      ) {
        msg = 'У этого студента уже есть задание по этой теме. Удалите старое задание перед созданием нового.';
      }
      setErrorMessage(msg);
      setShowErrorModal(true);
    }
  } catch (err) {
    let errorMsg = 'Ошибка сети: ' + err.message;
    if (err.message && (err.message.includes('date') || err.message.includes('format'))) {
      errorMsg = 'Некорректный формат даты. Убедитесь, что дата выбрана из календаря.';
    }
    setErrorMessage(errorMsg);
    setShowErrorModal(true);
  }
};

  // === Подтверждение ===
  const handleConfirm = async () => {
    if (confirmAction === 'deleteTopic') {
      try {
        const response = await fetch('/api/topics/delete.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic_id: selectedTopicId })
        });
        const data = await response.json();
        if (response.ok) {
          const updated = topics.filter(t => t.topic_id !== selectedTopicId);
          setTopics(updated);
          setSelectedTopicId(null);
          setLessons([]);
          setAssignments([]);
        } else {
          alert(data.error || 'Ошибка удаления темы');
        }
      } catch (err) {
        alert('Ошибка сети: ' + err.message);
      }
    } else if (confirmAction === 'deleteLesson') {
      try {
        const response = await fetch('/api/lessons/delete.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lesson_id: selectedLessonId })
        });
        const data = await response.json();
        if (response.ok) {
          const updated = lessons.filter(l => l.lesson_id !== selectedLessonId);
          setLessons(updated);
          setSelectedLessonId(null);
        } else {
          alert(data.error || 'Ошибка удаления занятия');
        }
      } catch (err) {
        alert('Ошибка сети: ' + err.message);
      }
    } else if (confirmAction === 'deleteAssignment') {
      try {
        const res = await fetch('/api/assignments/delete.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assignment_id: selectedAssignmentId })
        });
        const data = await res.json();
        if (res.ok) {
          const updated = assignments.filter(a => a.assignment_id !== selectedAssignmentId);
          setAssignments(updated);
          setSelectedAssignmentId(null);
        } else {
          alert(data.error || 'Ошибка удаления задания');
        }
      } catch (err) {
        alert('Ошибка сети: ' + err.message);
      }
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  // === Вспомогательные компоненты ===
  const EmptyRow = ({ colSpan, message }) => (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          padding: '20px',
          textAlign: 'center',
          color: '#666',
          backgroundColor: mainBg,
          fontWeight: 'normal',
        }}
      >
        {message}
      </td>
    </tr>
  );

  const buttonStyle = (bgColor, disabled = false, isHovered = false) => ({
    backgroundColor: disabled ? '#bdbdbd' : bgColor,
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    marginRight: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: isHovered && !disabled
      ? '0 6px 16px rgba(0,0,0,0.3)'
      : 'none',
    outline: 'none',
    fontSize: '18px',
    fontWeight: 'bold',
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
        {/* === КУРСЫ === */}
        <div style={{ width: tableWidth, marginBottom: '40px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold' }}>Курсы</h3>
          </div>
          <div style={{ padding: '12px', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize }}>
              <thead>
                <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                  <th style={{ padding: '10px', textAlign: 'left', width: '70%' }}>Название курса</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '30%' }}>Преподаватель</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <tr
                      key={c.course_id}
                      onClick={() => setSelectedCourseId(c.course_id)}
                      style={{
                        backgroundColor: selectedCourseId === c.course_id ? selectedBg : mainBg,
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{c.course_name}</td>
                      <td style={{ padding: '10px' }}>{c.teacher_name}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={2} message="Нет курсов" />
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* === ТЕМЫ === */}
        <div style={{ width: tableWidth, marginBottom: '40px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 10, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold' }}>Темы</h3>
            <div>
              <button
                onClick={handleAddTopic}
                onMouseEnter={() => setHoveredButton('addTopic')}
                onMouseLeave={() => setHoveredButton(null)}
                style={buttonStyle(buttonGreen, false, hoveredButton === 'addTopic')}
              >
                Добавить
              </button>
              <button
                onClick={handleEditTopic}
                onMouseEnter={() => setHoveredButton('editTopic')}
                onMouseLeave={() => setHoveredButton(null)}
                style={buttonStyle(buttonBlue, !selectedTopicId, hoveredButton === 'editTopic')}
                disabled={!selectedTopicId}
              >
                Редактировать
              </button>
              <button
                onClick={handleDeleteTopic}
                onMouseEnter={() => setHoveredButton('deleteTopic')}
                onMouseLeave={() => setHoveredButton(null)}
                style={buttonStyle(buttonRed, !selectedTopicId, hoveredButton === 'deleteTopic')}
                disabled={!selectedTopicId}
              >
                Удалить
              </button>
            </div>
          </div>
          <div style={{ padding: '12px', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize }}>
              <thead>
                <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Название темы</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Описание</th>
                </tr>
              </thead>
              <tbody>
                {topics.length > 0 ? (
                  topics.map((t) => (
                    <tr
                      key={t.topic_id}
                      onClick={() => setSelectedTopicId(t.topic_id)}
                      style={{
                        backgroundColor: selectedTopicId === t.topic_id ? selectedBg : mainBg,
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{t.topic_name}</td>
                      <td style={{ padding: '10px' }}>{t.topic_description || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={2} message={selectedCourseId ? 'Нет тем' : 'Выберите курс'} />
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* === ЗАНЯТИЯ === */}
        <div style={{ width: tableWidth, marginBottom: '40px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 10, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold' }}>Занятия</h3>
            <div>
              <button
                onClick={handleAddLesson}
                onMouseEnter={() => setHoveredButton('addLesson')}
                onMouseLeave={() => setHoveredButton(null)}
                style={buttonStyle(buttonGreen, !selectedTopicId, hoveredButton === 'addLesson')}
                disabled={!selectedTopicId}
              >
                Добавить
              </button>
              <button
                onClick={handleEditLesson}
                onMouseEnter={() => setHoveredButton('editLesson')}
                onMouseLeave={() => setHoveredButton(null)}
                style={buttonStyle(buttonBlue, !selectedLessonId, hoveredButton === 'editLesson')}
                disabled={!selectedLessonId}
              >
                Редактировать
              </button>
              <button
                onClick={handleDeleteLesson}
                onMouseEnter={() => setHoveredButton('deleteLesson')}
                onMouseLeave={() => setHoveredButton(null)}
                style={buttonStyle(buttonRed, !selectedLessonId, hoveredButton === 'deleteLesson')}
                disabled={!selectedLessonId}
              >
                Удалить
              </button>
            </div>
          </div>
          <div style={{ padding: '12px', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize }}>
              <thead>
                <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                  <th style={{ padding: '10px', textAlign: 'left', width: '10%' }}>№</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '20%' }}>Дата</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '70%' }}>Тип</th>
                </tr>
              </thead>
              <tbody>
                {lessons.length > 0 ? (
                  lessons.map((l) => (
                    <tr
                      key={l.lesson_id}
                      onClick={() => setSelectedLessonId(l.lesson_id)}
                      style={{
                        backgroundColor: selectedLessonId === l.lesson_id ? selectedBg : mainBg,
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{l.lesson_number}</td>
                      <td style={{ padding: '10px' }}>{new Date(l.lesson_date).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>{l.lesson_type}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={3} message={selectedTopicId ? 'Нет занятий' : 'Выберите тему'} />
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* === ИНДИВИДУАЛЬНЫЕ ЗАДАНИЯ === */}
        <div style={{ width: tableWidth, margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 10, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold' }}>Индивидуальные задания</h3>
            <div>
              <div>
                <button
                  onClick={handleAddAssignment}
                  onMouseEnter={() => setHoveredButton('addAssignment')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonGreen, !selectedTopicId, hoveredButton === 'addAssignment')}
                  disabled={!selectedTopicId}
                >
                  Добавить
                </button>
                <button
                  onClick={handleEditAssignment}
                  onMouseEnter={() => setHoveredButton('editAssignment')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonBlue, !selectedAssignmentId, hoveredButton === 'editAssignment')}
                  disabled={!selectedAssignmentId}
                >
                  Редактировать
                </button>
                <button
                  onClick={handleDeleteAssignment}
                  onMouseEnter={() => setHoveredButton('deleteAssignment')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonRed, !selectedAssignmentId, hoveredButton === 'deleteAssignment')}
                  disabled={!selectedAssignmentId}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize }}>
              <thead>
                <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                  <th style={{ padding: '10px', textAlign: 'left', width: '25%' }}>Студент</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '30%' }}>Задание</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '10%' }}>Оценка</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '20%' }}>Статус</th>
                  <th style={{ padding: '10px', textAlign: 'left', width: '15%' }}>Срок</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length > 0 ? (
                  assignments.map((a) => (
                    <tr
                      key={a.assignment_id}
                      onClick={() => setSelectedAssignmentId(a.assignment_id)}
                      style={{
                        backgroundColor: selectedAssignmentId === a.assignment_id ? selectedBg : mainBg,
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{a.student_name}</td>
                      <td style={{ padding: '10px' }}>{a.assignment_name}</td>
                      <td style={{ padding: '10px' }}>{a.grade || '—'}</td>
                      <td style={{ padding: '10px' }}>{a.status}</td>
                      <td style={{ padding: '10px' }}>{a.assignment_date ? new Date(a.assignment_date).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={5} message={selectedTopicId ? 'Нет заданий' : 'Выберите тему'} />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAddTopicForm && (
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
              width: '500px',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#1b5e20', fontSize: '24px' }}>Новая тема</h3>
            <div style={{ marginBottom: '12px' }}>
              <input
                placeholder="Название темы *"
                value={newTopic.topic_name}
                onChange={(e) => setNewTopic({ ...newTopic, topic_name: e.target.value })}
                style={{ width: '97%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <textarea
                placeholder="Описание"
                value={newTopic.topic_description}
                onChange={(e) => setNewTopic({ ...newTopic, topic_description: e.target.value })}
                style={{ width: '97%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', height: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveTopic}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Создать
              </button>
              <button
                onClick={() => setShowAddTopicForm(false)}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditTopicForm && (
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
              width: '500px',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#1b5e20', fontSize: '24px' }}>Редактировать тему</h3>
            <div style={{ marginBottom: '12px' }}>
              <input
                placeholder="Название темы *"
                value={editingTopic?.topic_name || ''}
                onChange={(e) => setEditingTopic({ ...editingTopic, topic_name: e.target.value })}
                style={{ width: '97%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <textarea
                placeholder="Описание"
                value={editingTopic?.topic_description || ''}
                onChange={(e) => setEditingTopic({ ...editingTopic, topic_description: e.target.value })}
                style={{ width: '97%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', height: '80px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveEditTopic}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setShowEditTopicForm(false);
                  setEditingTopic(null);
                }}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddLessonForm && (
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
              width: '500px',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#1b5e20', fontSize: '24px' }}>Новое занятие</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Тип занятия</label>
              <select
                value={newLesson.lesson_type}
                onChange={(e) => setNewLesson({ ...newLesson, lesson_type: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="Лекция">Лекция</option>
                <option value="Практика">Практика</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Номер занятия</label>
              <input
                type="number"
                min="1"
                value={newLesson.lesson_number}
                onChange={(e) => setNewLesson({ ...newLesson, lesson_number: e.target.valueAsNumber })}
                style={{ width: '97%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Дата занятия</label>
              <input
                type="date"
                value={newLesson.lesson_date}
                onChange={(e) => setNewLesson({ ...newLesson, lesson_date: e.target.value })}
                style={{ width: '97%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveLesson}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Создать
              </button>
              <button
                onClick={() => setShowAddLessonForm(false)}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditLessonForm && (
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
              width: '500px',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#1b5e20', fontSize: '24px' }}>Редактировать занятие</h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Тип занятия</label>
              <select
                value={editingLesson?.lesson_type || 'Лекция'}
                onChange={(e) => setEditingLesson({ ...editingLesson, lesson_type: e.target.value })}
                style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="Лекция">Лекция</option>
                <option value="Практика">Практика</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Номер занятия</label>
              <input
                type="number"
                min="1"
                value={editingLesson?.lesson_number || 1}
                onChange={(e) => setEditingLesson({ ...editingLesson, lesson_number: e.target.valueAsNumber })}
                style={{ width: '97%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Дата занятия</label>
              <input
                type="date"
                value={editingLesson?.lesson_date?.split('T')[0] || ''}
                onChange={(e) => setEditingLesson({ ...editingLesson, lesson_date: e.target.value })}
                style={{ width: '97%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveEditLesson}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowEditLessonForm(false)}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <ConfirmationModal
          title="Подтверждение"
          message={confirmMessage}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {showAddAssignmentForm && (
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
              padding: '24px',
              borderRadius: '10px',
              width: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#1b5e20', fontSize: '24px' }}>
              Новое индивидуальное задание
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Студент *</label>
              <select
                value={newAssignment.student_id}
                onChange={(e) => setNewAssignment({ ...newAssignment, student_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                }}
              >
                <option value="">Выберите студента</option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Название задания *</label>
              <input
                type="text"
                placeholder="Введите название"
                value={newAssignment.assignment_name}
                onChange={(e) => setNewAssignment({ ...newAssignment, assignment_name: e.target.value })}
                style={{
                  width: '97%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Описание</label>
              <textarea
                placeholder="Описание задания"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                style={{
                  width: '97%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  minHeight: '60px',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Срок сдачи *</label>
              <input
                type="date"
                value={newAssignment.assignment_date}
                onChange={(e) => setNewAssignment({ ...newAssignment, assignment_date: e.target.value })}
                required
                style={{
                  width: '97%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddAssignmentForm(false)}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleSaveAssignment}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditAssignmentForm && (
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
              padding: '24px',
              borderRadius: '10px',
              width: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#1b5e20', fontSize: '24px' }}>
              Редактировать задание
            </h3>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Название *</label>
              <input
                type="text"
                value={editingAssignment?.assignment_name || ''}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, assignment_name: e.target.value })}
                style={{
                  width: '97%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Описание</label>
              <textarea
                value={editingAssignment?.description || ''}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                style={{
                  width: '97%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  minHeight: '60px',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Срок выдачи</label>
              <input
                type="date"
                value={editingAssignment?.assignment_date || ''}
                onChange={(e) =>
                  setEditingAssignment({ ...editingAssignment, assignment_date: e.target.value })
                }
                style={{
                  width: '97%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Дата сдачи</label>
              <input
                type="date"
                value={editingAssignment?.submission_date || ''}
                onChange={(e) =>
                  setEditingAssignment({ ...editingAssignment, submission_date: e.target.value })
                }
                style={{
                  width: '97%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Оценка</label>
              <input
                type="number"
                step="0.1"
                placeholder="Оценка"
                value={editingAssignment?.grade || ''}
                onChange={(e) =>
                  setEditingAssignment({
                    ...editingAssignment,
                    grade: e.target.value ? parseFloat(e.target.value) : null,
                  })
                }
                style={{
                  width: '97%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>Статус</label>
              <select
                value={editingAssignment?.status || 'выдано'}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                }}
              >
                <option value="выдано">выдано</option>
                <option value="на проверке">на проверке</option>
                <option value="сдано">сдано</option>
                <option value="оценено">оценено</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditAssignmentForm(false)}
                style={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  border: '1px solid #ccc',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleSaveEditAssignment}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
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
              Ошибка
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