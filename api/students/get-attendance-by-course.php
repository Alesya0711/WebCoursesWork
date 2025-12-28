<?php
// api/students/get-attendance-by-course.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$student_id = (int)($_GET['student_id'] ?? 0);
$course_id = (int)($_GET['course_id'] ?? 0);

if (!$student_id || !$course_id) {
    // Возвращаем пустой массив, а не ошибку!
    echo json_encode([]);
    exit;
}

try {
    $sql = "
        SELECT 
            t.topic_name,
            l.lesson_type,
            l.lesson_number,
            l.lesson_date,
            a.is_present
        FROM lessons l
        JOIN topics t ON l.topic_id = t.topic_id
        JOIN courses c ON t.course_id = c.course_id
        LEFT JOIN attendance a ON l.lesson_id = a.lesson_id AND a.student_id = ?
        WHERE c.course_id = ?
        ORDER BY l.lesson_date, l.lesson_number
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$student_id, $course_id]);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log("Ошибка в get-attendance-by-course.php: " . $e->getMessage());
    echo json_encode([]); // ← даже при ошибке — массив!
}