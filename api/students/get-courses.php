<?php
// api/students/get-courses.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$student_id = (int)($_GET['student_id'] ?? 0);

if (!$student_id) {
    http_response_code(400);
    echo json_encode(['error' => 'student_id обязателен']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT DISTINCT
            c.course_id,
            c.course_name,
            t.last_name || ' ' || t.first_name AS teacher_name
        FROM courses c
        JOIN topics tp ON c.course_id = tp.course_id
        JOIN lessons l ON tp.topic_id = l.topic_id
        JOIN attendance a ON l.lesson_id = a.lesson_id
        JOIN students s ON a.student_id = s.student_id
        JOIN teachers t ON c.teacher_id = t.teacher_id
        WHERE s.student_id = ?
        ORDER BY c.course_name
    ");
    $stmt->execute([$student_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log("Ошибка в get-courses.php: " . $e->getMessage());
    echo json_encode([]);
}