<?php
// api/groups/get.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$course_id = isset($_GET['course_id']) ? (int)$_GET['course_id'] : 0;

if (!$course_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Параметр course_id обязателен']);
    exit;
}

try {
    $sql = "
        SELECT 
            g.group_id,
            g.group_name,
            COUNT(sg.student_id) AS student_count
        FROM groups g
        LEFT JOIN student_groups sg ON g.group_id = sg.group_id
        LEFT JOIN students s ON sg.student_id = s.student_id
        LEFT JOIN users u ON s.user_id = u.user_id AND u.is_active = TRUE
        WHERE g.course_id = ?
        GROUP BY g.group_id, g.group_name
        ORDER BY g.group_name
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$course_id]);
    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($groups, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки групп: ' . $e->getMessage()]);
}