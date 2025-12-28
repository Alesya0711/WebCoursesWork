<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

try {
    $stmt = $pdo->query("
        SELECT 
            c.course_id,
            c.course_name,
            c.course_description,
            COALESCE(t.last_name || ' ' || t.first_name, '—') AS teacher_name
        FROM courses c
        LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
        ORDER BY c.course_name
    ");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки курсов']);
}