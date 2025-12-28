<?php
// api/archive/active-users.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

try {
    $sql = "
        SELECT 
            u.user_id,
            'Студент' AS role_label,
            s.last_name || ' ' || s.first_name || ' ' || COALESCE(s.middle_name, '') AS full_name,
            s.email,
            u.username
        FROM users u
        JOIN students s ON u.user_id = s.user_id
        WHERE u.is_active = TRUE AND u.role = 'student'
        UNION ALL
        SELECT 
            u.user_id,
            'Преподаватель' AS role_label,
            t.last_name || ' ' || t.first_name || ' ' || COALESCE(t.middle_name, '') AS full_name,
            t.email,
            u.username
        FROM users u
        JOIN teachers t ON u.user_id = t.user_id
        WHERE u.is_active = TRUE AND u.role = 'teacher'
        ORDER BY role_label, full_name
    ";
    $stmt = $pdo->query($sql);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки активных пользователей']);
}