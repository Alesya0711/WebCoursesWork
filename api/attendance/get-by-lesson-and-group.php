<?php
// api/attendance/get-by-lesson-and-group.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получаем данные
$lesson_id = (int)($_GET['lesson_id'] ?? 0);
$group_id = (int)($_GET['group_id'] ?? 0);

if (!$lesson_id || !$group_id) {
    http_response_code(400);
    echo json_encode(['error' => 'lesson_id и group_id обязательны']);
    exit;
}

try {
    //получам тип и название занятия
    $stmt = $pdo->prepare("
        SELECT 
            l.lesson_type,
            t.topic_name
        FROM lessons l
        JOIN topics t ON l.topic_id = t.topic_id
        WHERE l.lesson_id = ?
    ");
    $stmt->execute([$lesson_id]);
    $lessonData = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$lessonData) {
        echo json_encode([]);
        exit;
    }

    //получаем активвных студентов
    $stmt = $pdo->prepare("
        SELECT s.student_id, s.last_name || ' ' || s.first_name AS full_name
        FROM students s
        JOIN student_groups sg ON s.student_id = sg.student_id
        JOIN users u ON s.user_id = u.user_id
        WHERE sg.group_id = ? AND u.is_active = TRUE
        ORDER BY s.last_name
    ");
    $stmt->execute([$group_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    //получам посещаемость
    $stmt = $pdo->prepare("
        SELECT student_id, is_present
        FROM attendance
        WHERE lesson_id = ?
    ");
    $stmt->execute([$lesson_id]);
    //создаем массив ключ-значение
    $attendanceMap = [];
    while ($row = $stmt->fetch()) {
        $attendanceMap[$row['student_id']] = $row['is_present'];
    }

    //заполняем значениями
    $result = [];
    foreach ($students as $s) {
        $result[] = [
            'student_id' => $s['student_id'],
            'full_name' => $s['full_name'],
            'is_present' => $attendanceMap[$s['student_id']] ?? false,
            'topic_name' => $lessonData['topic_name'],    
            'lesson_type' => $lessonData['lesson_type']   
        ];
    }

    //отправляем json
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Ошибка в attendance/get-by-lesson-and-group.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка загрузки посещаемости']);
}