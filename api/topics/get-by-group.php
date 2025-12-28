<?php
// api/topics/get-by-group.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$group_id = (int)($_GET['group_id'] ?? 0);
if (!$group_id) {
    http_response_code(400);
    echo json_encode(['error' => 'group_id обязателен']);
    exit;
}

try {
    $sql = "
        SELECT 
            t.topic_id,
            t.topic_name,
            t.topic_description
        FROM topics t
        JOIN courses c ON t.course_id = c.course_id
        WHERE c.course_id = (SELECT course_id FROM groups WHERE group_id = ?)
        ORDER BY t.topic_name
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$group_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки тем']);
}