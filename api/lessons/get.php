<?php
// api/lessons/get.php
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
            lesson_id, 
            lesson_number, 
            lesson_date, 
            lesson_type,
            topic_id 
        FROM lessons
        WHERE topic_id = ?
        ORDER BY lesson_number
    ");
    $stmt->execute([$topic_id]);
    $lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($lessons, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log("Ошибка в lessons/get.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки занятий']);
}