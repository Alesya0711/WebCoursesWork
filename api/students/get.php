<?php
// api/students/get.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$group_id = isset($_GET['group_id']) ? (int)$_GET['group_id'] : 0;

if (!$group_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Параметр group_id обязателен']);
    exit;
}

try {
    $sql = "
        SELECT 
            s.student_id,
            s.last_name || ' ' || s.first_name || ' ' || COALESCE(s.middle_name, '') AS full_name,
            s.email,
            u.username
        FROM students s
        JOIN student_groups sg ON s.student_id = sg.student_id
        JOIN users u ON s.user_id = u.user_id
        WHERE sg.group_id = ? AND u.is_active = TRUE
        ORDER BY s.last_name
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$group_id]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($students, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки студентов: ' . $e->getMessage()]);
}