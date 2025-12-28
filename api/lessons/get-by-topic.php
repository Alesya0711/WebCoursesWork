<?php
// api/lessons/get-by-topic.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$topic_id = (int)($_GET['topic_id'] ?? 0);
if (!$topic_id) {
    http_response_code(400);
    echo json_encode(['error' => 'topic_id обязателен']);
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
        WHERE t.topic_id = ?
        ORDER BY l.lesson_date, l.lesson_number
    ");
    $stmt->execute([$topic_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки занятий']);
}