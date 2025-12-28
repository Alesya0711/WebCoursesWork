<?php
// api/students/get-by-group.php
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
            s.student_id,
            s.last_name || ' ' || s.first_name || ' ' || COALESCE(s.middle_name, '') AS full_name
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        JOIN student_groups sg ON s.student_id = sg.student_id
        WHERE sg.group_id = ? AND u.is_active = TRUE
        ORDER BY s.last_name
    ");
    $stmt->execute([$group_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Ошибка в students/get-by-group.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка загрузки студентов']);
}