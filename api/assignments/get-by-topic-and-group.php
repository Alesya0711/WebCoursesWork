<?php
// api/assignments/get-by-topic-and-group.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$topic_id = (int)($_GET['topic_id'] ?? 0);
$group_id = (int)($_GET['group_id'] ?? 0);

if (!$topic_id || !$group_id) {
    http_response_code(400);
    echo json_encode(['error' => 'topic_id и group_id обязательны']);
    exit;
}

try {
    $sql = "
        SELECT 
            ia.assignment_id,
            s.student_id,
            s.last_name || ' ' || s.first_name AS student_name,
            ia.assignment_name,
            ia.assignment_date, 
            ia.grade,
            ia.status
        FROM individualassignments ia
        JOIN students s ON ia.student_id = s.student_id
        JOIN student_groups sg ON s.student_id = sg.student_id
        JOIN users u ON s.user_id = u.user_id
        WHERE ia.topic_id = ? 
          AND sg.group_id = ? 
          AND u.is_active = TRUE
        ORDER BY s.last_name
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$topic_id, $group_id]);
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode($results, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки заданий']);
}