<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$group_id = (int)($_GET['group_id'] ?? 0);
if (!$group_id) {
    http_response_code(400);
    echo json_encode(['error' => 'group_id обязателен']);
    exit;
}

try {
    // Занятия
    $lessons = $pdo->prepare("
        SELECT 
            l.lesson_id,
            l.lesson_number,
            l.lesson_date,
            t.topic_name,
            l.lesson_type
        FROM lessons l
        JOIN topics t ON l.topic_id = t.topic_id
        JOIN courses c ON t.course_id = c.course_id
        WHERE c.course_id = (SELECT course_id FROM groups WHERE group_id = ?)
        ORDER BY l.lesson_date
    ");
    $lessons->execute([$group_id]);
    $lessonList = $lessons->fetchAll(PDO::FETCH_ASSOC);

    // Студенты
    $students = $pdo->prepare("
        SELECT s.student_id, s.last_name || ' ' || s.first_name AS full_name
        FROM students s
        JOIN student_groups sg ON s.student_id = sg.student_id
        JOIN users u ON s.user_id = u.user_id
        WHERE sg.group_id = ? AND u.is_active = TRUE
        ORDER BY s.last_name
    ");
    $students->execute([$group_id]);
    $studentList = $students->fetchAll(PDO::FETCH_ASSOC);

    // Посещаемость
    $attendance = $pdo->prepare("
        SELECT student_id, lesson_id, is_present
        FROM attendance
        WHERE student_id IN (SELECT student_id FROM student_groups WHERE group_id = ?)
          AND lesson_id IN (
              SELECT l.lesson_id
              FROM lessons l
              JOIN topics t ON l.topic_id = t.topic_id
              JOIN courses c ON t.course_id = c.course_id
              WHERE c.course_id = (SELECT course_id FROM groups WHERE group_id = ?)
          )
    ");
    $attendance->execute([$group_id, $group_id]);
    $attendanceMap = [];
    while ($row = $attendance->fetch()) {
        $attendanceMap[$row['student_id'] . '_' . $row['lesson_id']] = $row['is_present'];
    }

    echo json_encode([
        'lessons' => $lessonList,
        'students' => $studentList,
        'attendance' => $attendanceMap
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки посещаемости']);
}