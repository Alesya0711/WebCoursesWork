<?php
header('Content-Type: application/json; charset=utf-8');
require_once 'config.php';

try {
    $stmt = $pdo->query("
        SELECT 
            t.teacher_id,
            t.last_name || ' ' || t.first_name || ' ' || COALESCE(t.middle_name, '') AS full_name,
            t.last_name,
            t.first_name,
            t.middle_name,
            t.email,
            t.subject_id,
            s.subject_name AS specialization,
            u.username,
            u.user_id
        FROM teachers t
        JOIN users u ON t.user_id = u.user_id
        LEFT JOIN subjects s ON t.subject_id = s.subject_id
        WHERE u.is_active = TRUE
        ORDER BY t.last_name
    ");
    $teachers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($teachers, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки преподавателей']);
}