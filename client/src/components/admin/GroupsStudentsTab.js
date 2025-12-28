// client/src/components/admin/GroupsStudentsTab.js
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

export default function GroupsStudentsTab() {
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [showEditGroupList, setShowEditGroupList] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    course_name: '',
    course_description: '',
    teacher_id: ''
  });
  const [showAddNewStudentForm, setShowAddNewStudentForm] = useState(false);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newStudent, setNewStudent] = useState({
    last_name: '',
    first_name: '',
    middle_name: '',
    email: '',
    school_id: '',
    class_id: '',
    username: '',
    password: ''
  });
  const [showAddSchoolForm, setShowAddSchoolForm] = useState(false);
  const [newSchool, setNewSchool] = useState({
    school_name: '',
    address: '',
    director: ''
  });
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [newClass, setNewClass] = useState({
    school_id: '',
    class_name: '',
    description: '',
    homeroom_teacher: ''
  });

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hoveredButton, setHoveredButton] = useState(null); 

  // === Загрузка данных ===
  useEffect(() => {
    Promise.all([
      fetch('/api/courses/get.php').then(r => r.json()),
      fetch('/api/teachers/for-courses.php').then(r => r.json())
    ]).then(([coursesData, teachersData]) => {
      setCourses(coursesData);
      setTeachers(teachersData);
    });
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetch(`/api/groups/get.php?course_id=${selectedCourseId}`)
        .then(r => r.json())
        .then(setGroups);
    } else {
      setGroups([]);
      setStudents([]);
      setSelectedGroupId(null);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedGroupId) {
      fetch(`/api/students/get.php?group_id=${selectedGroupId}`)
        .then(r => r.json())
        .then(setStudents);
    } else {
      setStudents([]);
      setSelectedStudentId(null);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    if (showAddNewStudentForm) {
      fetch('/api/schools/get.php')
        .then(r => r.json())
        .then(setSchools);
    }
  }, [showAddNewStudentForm]);

  const handleAddCourse = () => {
    setShowAddCourseForm(true);
    setNewCourse({ course_name: '', course_description: '', teacher_id: '' });
  };

  const handleEditCourse = () => {
    if (!selectedCourseId) return alert('Выберите курс');
    const course = courses.find(c => c.course_id === selectedCourseId);
    setEditCourse({
      course_id: course.course_id,
      course_name: course.course_name,
      course_description: course.course_description || '',
      teacher_id: course.teacher_id || ''
    });
  };

  const handleDeleteCourse = () => {
    if (!selectedCourseId) return;
    const course = courses.find(c => c.course_id === selectedCourseId);
    setConfirmMessage(`Удалить курс «${course.course_name}»?`);
    setConfirmAction('deleteCourse');
  };

  const handleAddGroup = () => {
    if (!selectedCourseId) {
      alert('Сначала выберите курс.');
      return;
    }
    setShowAddGroupForm(true);
    setEditGroup({ group_name: '', description: '' });
  };

  const handleEditGroup = () => {
    if (!selectedGroupId) {
      alert('Выберите группу');
      return;
    }
    const group = groups.find(g => g.group_id === selectedGroupId);
    setEditGroup({
      group_id: group.group_id,
      group_name: group.group_name,
      description: group.description || ''
    });
    setShowAddGroupForm(true);
  };

  const handleDeleteGroup = () => {
    if (!selectedGroupId) return;
    const group = groups.find(g => g.group_id === selectedGroupId);
    setConfirmMessage(`Удалить группу «${group.group_name}»?`);
    setConfirmAction('deleteGroup');
  };

  const handleEditGroupList = () => {
    if (!selectedGroupId) {
      alert('Сначала выберите группу.');
      return;
    }
    fetch('/api/students/get-all.php')
      .then(r => r.json())
      .then(allStudents => {
        fetch(`/api/students/get.php?group_id=${selectedGroupId}`)
          .then(r => r.json())
          .then(groupStudents => {
            const groupStudentIds = new Set(groupStudents.map(s => s.student_id));
            const enriched = allStudents.map(s => ({
              ...s,
              is_in_group: groupStudentIds.has(s.student_id)
            }));
            setAllStudents(enriched);
            setShowEditGroupList(true);
          });
      });
  };

  const handleAddStudentToGroup = async (studentId) => {
    if (!selectedGroupId) return;
    try {
      const response = await fetch('/api/groups/add-student.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, group_id: selectedGroupId })
      });
      const data = await response.json();
      if (response.ok) {
        const updated = await fetch(`/api/students/get.php?group_id=${selectedGroupId}`).then(r => r.json());
        setStudents(updated);
        setAllStudents(prev => prev.map(s =>
          s.student_id === studentId ? { ...s, is_in_group: true } : s
        ));
        alert('Студент добавлен в группу.');
      } else {
  setErrorMessage(data.error || 'Ошибка добавления студента в группу');
  setShowErrorModal(true);
}
    } catch (err) {
  setErrorMessage('Ошибка сети');
  setShowErrorModal(true);
}
  };

  const handleRemoveStudent = () => {
  if (!selectedGroupId || !selectedStudentId) return;

  const student = students.find(s => s.student_id === selectedStudentId);
  if (!student) return;

  setConfirmMessage(`Исключить ${student.full_name} из группы?`);
  setConfirmAction('removeStudent');
};

  const handleSchoolChange = (schoolId) => {
    setNewStudent(prev => ({ ...prev, school_id: schoolId, class_id: '' }));
    setClasses([]);
    if (schoolId) {
      fetch(`/api/classes/get.php?school_id=${schoolId}`)
        .then(r => r.json())
        .then(setClasses);
    }
  };

  const handleAddSchool = () => {
    setShowEditGroupList(false);
    setShowAddSchoolForm(true);
  };

  const handleAddClass = () => {
    setShowEditGroupList(false);
    setShowAddClassForm(true);
  };

  // === Подтверждение действий ===
  const handleConfirm = () => {
    if (confirmAction === 'deleteCourse') {
      performDeleteCourse();
    } else if (confirmAction === 'deleteGroup') {
      performDeleteGroup();
    }
    setConfirmAction(null);
  };

  const handleCancel = () => {
    setConfirmAction(null);
  };

  const performDeleteCourse = async () => {
    try {
      const res = await fetch('/api/courses/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: selectedCourseId })
      });
      const data = await res.json();
      if (res.ok) {
        setCourses(courses.filter(c => c.course_id !== selectedCourseId));
        setSelectedCourseId(null);
      } else {
        alert(data.error || 'Ошибка удаления');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const performDeleteGroup = async () => {
    try {
      const res = await fetch('/api/groups/delete.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_id: selectedGroupId })
      });
      const data = await res.json();
      if (res.ok) {
        setGroups(groups.filter(g => g.group_id !== selectedGroupId));
        setSelectedGroupId(null);
      } else {
        alert(data.error || 'Ошибка удаления');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  // === Сохранение данных ===
  const handleSaveCourse = async () => {
    try {
      const res = await fetch('/api/courses/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse)
      });
      const data = await res.json();
      if (res.ok) {
  const updated = await fetch('/api/courses/get.php').then(r => r.json());
  setCourses(updated);
  setShowAddCourseForm(false);
} else {
  setErrorMessage(data.error || 'Ошибка добавления курса');
  setShowErrorModal(true);
}
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const handleSaveEditCourse = async () => {
    try {
      const res = await fetch('/api/courses/update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCourse)
      });
      const data = await res.json();
      if (res.ok) {
        const updated = await fetch('/api/courses/get.php').then(r => r.json());
        setCourses(updated);
        setEditCourse(null);
      } else {
        alert(data.error || 'Ошибка обновления курса');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const handleSaveGroup = async () => {
    if (!selectedCourseId) return;
    try {
      const url = editGroup.group_id
        ? '/api/groups/update.php'
        : '/api/groups/add.php';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editGroup,
          course_id: selectedCourseId
        })
      });
      const data = await res.json();
      if (res.ok) {
  const updated = await fetch(`/api/groups/get.php?course_id=${selectedCourseId}`).then(r => r.json());
  setGroups(updated);
  setEditGroup(null);
  setShowAddGroupForm(false);
} else {
  setErrorMessage(data.error || 'Ошибка сохранения группы');
  setShowErrorModal(true);
}
    } catch (err) {
      alert('Ошибка сети');
    }
  };

  const handleSaveNewStudent = async () => {
    if (!selectedGroupId) {
      alert('Группа не выбрана');
      return;
    }
    try {
      const res = await fetch('/api/students/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStudent,
          group_id: selectedGroupId,
          class_id: newStudent.class_id
        })
      });
      const data = await res.json();
     if (res.ok) {
  fetch(`/api/students/get.php?group_id=${selectedGroupId}`)
    .then(r => r.json())
    .then(setStudents);
  if (showEditGroupList) {
    handleEditGroupList();
  }
  setShowAddNewStudentForm(false);
  setNewStudent({
    last_name: '',
    first_name: '',
    middle_name: '',
    email: '',
    school_id: '',
    class_id: '',
    username: '',
    password: ''
  });
} else {
  setErrorMessage(data.error || 'Ошибка добавления');
  setShowErrorModal(true);
}
    } catch (err) {
  setErrorMessage('Ошибка сети');
  setShowErrorModal(true);
}
  };

  const handleSaveSchool = async () => {
  if (!newSchool.school_name.trim()) {
    setErrorMessage('Введите название школы.');
    setShowErrorModal(true);
    return;
  }

  try {
    const res = await fetch('/api/schools/add.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSchool)
    });
    const data = await res.json();
    if (res.ok) {
      setSuccessMessage('Школа успешно добавлена.');
      setShowSuccessModal(true);
      setShowAddSchoolForm(false);
      setNewSchool({ school_name: '', address: '', director: '' });
    } else {
      let msg = data.error || 'Ошибка добавления школы';
      if (msg.includes('address') || msg.includes('Адрес') || msg.includes('null value in column "address"')) {
        msg = 'Поле "Адрес" обязательно для заполнения.';
      }
      setErrorMessage(msg);
      setShowErrorModal(true);
    }
  } catch (err) {
    setErrorMessage('Ошибка сети: ' + err.message);
    setShowErrorModal(true);
  }
};

  const handleSaveClass = async () => {
        if (!newClass.school_id || !newClass.class_name.trim()) {
      setErrorMessage('Выберите школу и введите название класса.');
      setShowErrorModal(true);
      return;
    }

    try {
      const res = await fetch('/api/classes/add.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage('Класс успешно добавлен.');
        setShowSuccessModal(true);
        setShowAddClassForm(false);
        setNewClass({ school_id: '', class_name: '', description: '', homeroom_teacher: '' });
      } else {
        setErrorMessage(data.error || 'Ошибка добавления класса');
        setShowErrorModal(true);
      }
    } catch (err) {
      setErrorMessage('Ошибка сети: ' + err.message);
      setShowErrorModal(true);
    }
  };

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
        {/* === КУРСЫ === */}
        <div style={{ width: tableWidth, marginBottom: '40px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold', marginBottom: '12px' }}>
              Курсы
            </h3>
              <div>
                <button
                  onClick={handleAddCourse}
                  onMouseEnter={() => setHoveredButton('addCourse')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonGreen, false, hoveredButton === 'addCourse')}
                >
                  Добавить курс
                </button>
                <button
                  onClick={handleEditCourse}
                  onMouseEnter={() => setHoveredButton('editCourse')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonBlue, !selectedCourseId, hoveredButton === 'editCourse')}
                  disabled={!selectedCourseId}
                >
                  Редактировать
                </button>
                <button
                  onClick={handleDeleteCourse}
                  onMouseEnter={() => setHoveredButton('deleteCourse')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonRed, !selectedCourseId, hoveredButton === 'deleteCourse')}
                  disabled={!selectedCourseId}
                >
                  Удалить
                </button>
              </div>
          </div>
          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize, margin: '0 auto' }}>
              <thead>
                <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Название</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Преподаватель</th>
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

        {/* === ГРУППЫ === */}
        <div style={{ width: tableWidth, marginBottom: '40px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold', marginBottom: '12px' }}>
              Группы
            </h3>
              <div>
                <button
                  onClick={handleAddGroup}
                  onMouseEnter={() => setHoveredButton('addGroup')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonGreen, !selectedCourseId, hoveredButton === 'addGroup')}
                  disabled={!selectedCourseId}
                >
                  Добавить группу
                </button>
                <button
                  onClick={handleEditGroup}
                  onMouseEnter={() => setHoveredButton('editGroup')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonBlue, !selectedGroupId, hoveredButton === 'editGroup')}
                  disabled={!selectedGroupId}
                >
                  Редактировать
                </button>
                <button
                  onClick={handleDeleteGroup}
                  onMouseEnter={() => setHoveredButton('deleteGroup')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonRed, !selectedGroupId, hoveredButton === 'deleteGroup')}
                  disabled={!selectedGroupId}
                >
                  Удалить
                </button>
              </div>
          </div>
          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize, margin: '0 auto' }}>
              <thead>
                <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Название</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Студентов</th>
                </tr>
              </thead>
              <tbody>
                {groups.length > 0 ? (
                  groups.map((g) => (
                    <tr
                      key={g.group_id}
                      onClick={() => setSelectedGroupId(g.group_id)}
                      style={{
                        backgroundColor: selectedGroupId === g.group_id ? selectedBg : mainBg,
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{g.group_name}</td>
                      <td style={{ padding: '10px' }}>{g.student_count}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={2} message={selectedCourseId ? 'Нет групп' : 'Выберите курс'} />
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* === УЧАЩИЕСЯ === */}
        <div style={{ width: tableWidth, margin: '0 auto' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1b5e20', fontSize: '30px', fontWeight: 'bold', marginBottom: '12px' }}>
              Учащиеся
            </h3>
              <div>
                <button
                  onClick={handleEditGroupList}
                  onMouseEnter={() => setHoveredButton('editGroupList')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonGreen, !selectedGroupId, hoveredButton === 'editGroupList')}
                  disabled={!selectedGroupId}
                >
                  Редактировать список группы
                </button>
                <button
                  onClick={handleRemoveStudent}
                  onMouseEnter={() => setHoveredButton('removeStudent')}
                  onMouseLeave={() => setHoveredButton(null)}
                  style={buttonStyle(buttonRed, !selectedStudentId, hoveredButton === 'removeStudent')}
                  disabled={!selectedStudentId}
                >
                  Удалить
                </button>
              </div>
          </div>
          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'transparent' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fontSize, margin: '0 auto' }}>
              <thead>
                <tr style={{ backgroundColor: headerBg, fontWeight: 'bold' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>ФИО</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Логин</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((s) => (
                    <tr
                      key={s.student_id}
                      onClick={() => setSelectedStudentId(s.student_id)}
                      style={{
                        backgroundColor: selectedStudentId === s.student_id ? selectedBg : mainBg,
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{s.full_name}</td>
                      <td style={{ padding: '10px' }}>{s.email || '—'}</td>
                      <td style={{ padding: '10px' }}>{s.username}</td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={3} message={selectedGroupId ? 'Нет учащихся' : 'Выберите группу'} />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {confirmAction && (
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
            textAlign: 'center',
          }}
        >
          <h3 style={{ color: '#1b5e20', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
            Подтверждение
          </h3>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            {confirmMessage}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button
              onClick={handleConfirm}
              style={{
                backgroundColor: '#1b5e20',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Да
            </button>
            <button
              onClick={handleCancel}
              style={{
                backgroundColor: '#c62828',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Нет
            </button>
          </div>
        </div>
      </div>
    )}

      {showAddCourseForm && (
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
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Новый курс</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                placeholder="Название курса"
                value={newCourse.course_name}
                onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                placeholder="Описание"
                value={newCourse.course_description}
                onChange={(e) => setNewCourse({ ...newCourse, course_description: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px', height: '80px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <select
                value={newCourse.teacher_id}
                onChange={(e) => setNewCourse({ ...newCourse, teacher_id: e.target.value || '' })}
                style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="">Без преподавателя</option>
                {teachers.map((t) => (
                  <option key={t.teacher_id} value={t.teacher_id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveCourse}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Создать
              </button>
              <button
                onClick={() => setShowAddCourseForm(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {editCourse && (
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
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Редактировать курс</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                value={editCourse.course_name}
                onChange={(e) => setEditCourse({ ...editCourse, course_name: e.target.value })}
                placeholder="Название курса"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                value={editCourse.course_description}
                onChange={(e) => setEditCourse({ ...editCourse, course_description: e.target.value })}
                placeholder="Описание"
                style={{ width: '97%', padding: '5px', fontSize: '14px', height: '80px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <select
                value={editCourse.teacher_id}
                onChange={(e) => setEditCourse({ ...editCourse, teacher_id: e.target.value || null })}
                style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="">Без преподавателя</option>
                {teachers.map((t) => (
                  <option key={t.teacher_id} value={t.teacher_id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveEditCourse}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditCourse(null)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddGroupForm && (
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
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>
              {editGroup?.group_id ? 'Редактировать группу' : 'Новая группа'}
            </h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                value={editGroup?.group_name || ''}
                onChange={(e) => setEditGroup({ ...editGroup, group_name: e.target.value })}
                placeholder="Название группы"
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <textarea
                value={editGroup?.description || ''}
                onChange={(e) => setEditGroup({ ...editGroup, description: e.target.value })}
                placeholder="Описание"
                style={{ width: '97%', padding: '5px', fontSize: '14px', height: '60px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveGroup}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Сохранить
              </button>
              <button
                onClick={() => {
                  setEditGroup(null);
                  setShowAddGroupForm(false);
                }}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditGroupList && (
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
              width: '800px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Редактировать список группы</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
                <thead>
                  <tr style={{ backgroundColor: headerBg }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>ФИО</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Школа</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Класс</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {allStudents.map((s) => (
                    <tr key={s.student_id}>
                      <td style={{ padding: '8px' }}>{s.full_name}</td>
                      <td style={{ padding: '8px' }}>{s.email || '—'}</td>
                      <td style={{ padding: '8px' }}>{s.school_name || '—'}</td>
                      <td style={{ padding: '8px' }}>{s.class_name || '—'}</td>
                      <td style={{ padding: '8px' }}>
                        <button
                          onClick={() => handleAddStudentToGroup(s.student_id)}
                          disabled={s.is_in_group}
                          style={{
                            backgroundColor: s.is_in_group ? '#bdbdbd' : buttonGreen,
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            cursor: s.is_in_group ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {s.is_in_group ? 'В группе' : 'Добавить'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setShowEditGroupList(false);
                  setShowAddNewStudentForm(true);
                }}
                onMouseEnter={() => setHoveredButton('addNewStudent')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  backgroundColor: hoveredButton === 'addNewStudent' ? buttonGreen : buttonGreen,
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: hoveredButton === 'addNewStudent' ? '0 6px 16px rgba(0,0,0,0.3)' : 'none',
                  transition: 'box-shadow 0.25s ease-in-out',
                }}
              >
                Добавить учащегося
              </button>
              <button
                onClick={handleAddSchool}
                onMouseEnter={() => setHoveredButton('addSchool')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  backgroundColor: hoveredButton === 'addSchool' ? buttonGreen : buttonGreen,
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: hoveredButton === 'addSchool' ? '0 6px 16px rgba(0,0,0,0.3)' : 'none',
                  transition: 'box-shadow 0.25s ease-in-out',
                }}
              >
                Добавить школу
              </button>
              <button
                onClick={handleAddClass}
                onMouseEnter={() => setHoveredButton('addClass')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  backgroundColor: hoveredButton === 'addClass' ? buttonGreen : buttonGreen,
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: hoveredButton === 'addClass' ? '0 6px 16px rgba(0,0,0,0.3)' : 'none',
                  transition: 'box-shadow 0.25s ease-in-out',
                }}
              >
                Добавить класс
              </button>
              <button
                onClick={() => setShowEditGroupList(false)}
                onMouseEnter={() => setHoveredButton('closeGroupList')}
                onMouseLeave={() => setHoveredButton(null)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: hoveredButton === 'closeGroupList' ? '#e0e0e0' : 'transparent',
                  boxShadow: hoveredButton === 'closeGroupList' ? '0 6px 16px rgba(0,0,0,0.2)' : 'none',
                  transition: 'box-shadow 0.25s ease-in-out, background-color 0.15s ease',
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddNewStudentForm && (
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
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Новый студент</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                placeholder="Фамилия"
                value={newStudent.last_name}
                onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                placeholder="Имя"
                value={newStudent.first_name}
                onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                placeholder="Отчество"
                value={newStudent.middle_name}
                onChange={(e) => setNewStudent({ ...newStudent, middle_name: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <select
                value={newStudent.school_id}
                onChange={(e) => handleSchoolChange(e.target.value || '')}
                style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="">Выберите школу</option>
                {schools.map((s) => (
                  <option key={s.school_id} value={s.school_id}>
                    {s.school_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <select
                value={newStudent.class_id}
                onChange={(e) => setNewStudent({ ...newStudent, class_id: e.target.value || '' })}
                disabled={!newStudent.school_id}
                style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="">Выберите класс</option>
                {classes.map((c) => (
                  <option key={c.class_id} value={c.class_id}>
                    {c.class_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                placeholder="Логин"
                value={newStudent.username}
                onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input
                placeholder="Пароль"
                type="password"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveNewStudent}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Создать
              </button>
              <button
                onClick={() => setShowAddNewStudentForm(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddSchoolForm && (
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
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Новая школа</h3>
            <div style={{ marginBottom: '10px' }}>
              <input
                placeholder="Название школы *"
                value={newSchool.school_name}
                onChange={(e) => setNewSchool({ ...newSchool, school_name: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                placeholder="Адрес"
                value={newSchool.address}
                onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px', height: '60px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input
                placeholder="Директор"
                value={newSchool.director}
                onChange={(e) => setNewSchool({ ...newSchool, director: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveSchool}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Создать
              </button>
              <button
                onClick={() => setShowAddSchoolForm(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddClassForm && (
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
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>Новый класс</h3>
            <div style={{ marginBottom: '10px' }}>
              <select
                value={newClass.school_id}
                onChange={(e) => setNewClass({ ...newClass, school_id: e.target.value || '' })}
                style={{ width: '100%', padding: '5px', fontSize: '14px' }}
              >
                <option value="">Выберите школу *</option>
                {schools.map((s) => (
                  <option key={s.school_id} value={s.school_id}>
                    {s.school_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                placeholder="Название класса *"
                value={newClass.class_name}
                onChange={(e) => setNewClass({ ...newClass, class_name: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <textarea
                placeholder="Описание"
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px', height: '60px' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <input
                placeholder="Классный руководитель"
                value={newClass.homeroom_teacher}
                onChange={(e) => setNewClass({ ...newClass, homeroom_teacher: e.target.value })}
                style={{ width: '97%', padding: '5px', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveClass}
                style={{
                  backgroundColor: buttonGreen,
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Создать
              </button>
              <button
                onClick={() => setShowAddClassForm(false)}
                style={{
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
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
              textAlign: 'center',
            }}
          >
            <h3 style={{ color: '#1b5e20', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              Подтверждение
            </h3>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
              {confirmMessage}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={() => {
                  if (confirmAction === 'removeStudent') {
                    fetch('/api/groups/remove-student.php', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ student_id: selectedStudentId, group_id: selectedGroupId })
                    })
                      .then(r => r.json())
                      .then(data => {
                        if (data.success) {
                          fetch(`/api/students/get.php?group_id=${selectedGroupId}`)
                            .then(r => r.json())
                            .then(setStudents);
                          setSelectedStudentId(null);
                          alert('Студент исключён из группы.');
                        } else {
                          alert(data.error || 'Ошибка исключения');
                        }
                      })
                      .catch(err => alert('Ошибка сети'));
                  }
                  setConfirmAction(null);
                }}
                style={{
                  backgroundColor: '#1b5e20',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Да
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                style={{
                  backgroundColor: '#c62828',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Нет
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

      {showSuccessModal && (
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
            <h3 style={{ margin: 0, color: '#2e7d32', fontSize: '20px', fontWeight: 'bold' }}>
              Успешно
            </h3>
            <p style={{ margin: '12px 0', fontSize: '16px', color: '#333' }}>
              {successMessage}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSuccessModal(false)}
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