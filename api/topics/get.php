<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$course_id = (int)($_GET['course_id'] ?? 0);
if (!$course_id) {
    http_response_code(400);
    echo json_encode(['error' => 'course_id обязателен']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT topic_id, topic_name, topic_description
        FROM topics
        WHERE course_id = ?
        ORDER BY topic_name
    ");
    $stmt->execute([$course_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки тем']);
}