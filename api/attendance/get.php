<?php
// api/attendance/get.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$lesson_id = (int)($_GET['lesson_id'] ?? 0);
if (!$lesson_id) {
    http_response_code(400);
    echo json_encode(['error' => 'lesson_id обязателен']);
    exit;
}

try {
    // Сначала получаем группу по занятию
    $stmt = $pdo->prepare("
        SELECT g.group_id
        FROM lessons l
        JOIN topics t ON l.topic_id = t.topic_id
        JOIN courses c ON t.course_id = c.course_id
        JOIN groups g ON c.course_id = g.course_id
        WHERE l.lesson_id = ?
        LIMIT 1
    ");
    $stmt->execute([$lesson_id]);
    $group_id = $stmt->fetchColumn();

    if (!$group_id) {
        echo json_encode([]);
        exit;
    }

    // Получаем всех студентов группы
    $stmt = $pdo->prepare("
        SELECT 
            s.student_id,
            s.last_name || ' ' || s.first_name || ' ' || COALESCE(s.middle_name, '') AS full_name
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        JOIN student_groups sg ON s.student_id = sg.student_id
        WHERE sg.group_id = ? AND u.is_active = TRUE
        ORDER BY s.last_name
    ");
    $stmt->execute([$group_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Получаем посещаемость
    $stmt = $pdo->prepare("
        SELECT student_id, is_present
        FROM attendance
        WHERE lesson_id = ?
    ");
    $stmt->execute([$lesson_id]);
    $attendanceMap = [];
    while ($row = $stmt->fetch()) {
        $attendanceMap[$row['student_id']] = $row['is_present'];
    }

    // Формируем результат
    $result = [];
    foreach ($students as $s) {
        $result[] = [
            'student_id' => $s['student_id'],
            'full_name' => $s['full_name'],
            'is_present' => $attendanceMap[$s['student_id']] ?? false
        ];
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Ошибка в attendance/get.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка загрузки посещаемости']);
}