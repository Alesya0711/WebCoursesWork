<?php
// api/archive/get.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

try {
    $sql = "
        SELECT 
            u.user_id,
            u.role,
            COALESCE(
                s.last_name || ' ' || s.first_name || ' ' || COALESCE(s.middle_name, ''),
                t.last_name || ' ' || t.first_name || ' ' || COALESCE(t.middle_name, '')
            ) AS full_name,
            u.username,
            COALESCE(s.email, t.email) AS email
        FROM users u
        LEFT JOIN students s ON u.user_id = s.user_id
        LEFT JOIN teachers t ON u.user_id = t.user_id
        WHERE u.is_active = FALSE
        ORDER BY u.role, full_name
    ";
    $stmt = $pdo->query($sql);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки архива']);
}