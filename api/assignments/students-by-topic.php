<?php
// api/assignments/students-by-topic.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$topic_id = (int)($_GET['topic_id'] ?? 0);
if (!$topic_id) {
    http_response_code(400);
    echo json_encode(['error' => 'topic_id обязателен']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT course_id FROM topics WHERE topic_id = ?");
    $stmt->execute([$topic_id]);
    $course_id = $stmt->fetchColumn();
    if (!$course_id) {
        echo json_encode([]);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT s.student_id, s.last_name || ' ' || s.first_name AS full_name
        FROM students s
        JOIN student_groups sg ON s.student_id = sg.student_id
        JOIN groups g ON sg.group_id = g.group_id
        JOIN users u ON s.user_id = u.user_id
        WHERE g.course_id = ? AND u.is_active = TRUE
        ORDER BY s.last_name
    ");
    $stmt->execute([$course_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки студентов']);
}