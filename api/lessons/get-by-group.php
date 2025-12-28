<?php
// api/lessons/get-by-group.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$group_id = (int)($_GET['group_id'] ?? 0);
if (!$group_id) {
    http_response_code(400);
    echo json_encode(['error' => 'group_id обязателен']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            l.lesson_id,
            l.lesson_number,
            l.lesson_date,
            l.lesson_type,
            t.topic_name
        FROM lessons l
        JOIN topics t ON l.topic_id = t.topic_id
        JOIN courses c ON t.course_id = c.course_id
        WHERE c.course_id = (SELECT course_id FROM groups WHERE group_id = ?)
        ORDER BY l.lesson_date, l.lesson_number
    ");
    $stmt->execute([$group_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Ошибка в lessons/get-by-group.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка загрузки занятий']);
}