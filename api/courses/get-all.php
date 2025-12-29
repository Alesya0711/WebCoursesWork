<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

try {
    //выполняем запрос
    $stmt = $pdo->query("
        SELECT 
            c.course_id,
            c.course_name,
            COALESCE(t.last_name || ' ' || t.first_name, '—') AS teacher_name
        FROM courses c
        LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
        ORDER BY c.course_name
    ");
    //отправляем данные в формате json
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки курсов']);
}