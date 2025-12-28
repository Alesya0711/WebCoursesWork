<?php
// api/students/get-all.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

try {
    $sql = "
        SELECT 
            s.student_id,
            s.last_name || ' ' || s.first_name || ' ' || COALESCE(s.middle_name, '') AS full_name,
            s.email,
            sch.school_name,
            c.class_name
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN class c ON s.class_id = c.class_id
        LEFT JOIN school sch ON c.school_id = sch.school_id
        WHERE u.is_active = TRUE
        ORDER BY s.last_name
    ";

    $stmt = $pdo->query($sql);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($students, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки студентов']);
}