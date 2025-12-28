<?php
// api/teachers/courses.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$teacher_id = (int)($_GET['teacher_id'] ?? 0);
if (!$teacher_id) {
    http_response_code(400);
    echo json_encode(['error' => 'teacher_id обязателен']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            c.course_id,
            c.course_name
        FROM courses c
        WHERE c.teacher_id = ?
        ORDER BY c.course_name
    ");
    $stmt->execute([$teacher_id]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($courses, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки курсов']);
}