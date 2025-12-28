<?php
// api/reports/grades-by-student-and-course.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$student_id = (int)($_GET['student_id'] ?? 0);
$course_id = (int)($_GET['course_id'] ?? 0);

if (!$student_id || !$course_id) {
    http_response_code(400);
    echo json_encode(['error' => 'student_id и course_id обязательны']);
    exit;
}

try {
    $sql = "
        SELECT 
            c.course_name,
            ia.assignment_name,
            ia.grade,
            ia.status
        FROM individualassignments ia
        JOIN topics t ON ia.topic_id = t.topic_id
        JOIN courses c ON t.course_id = c.course_id
        WHERE ia.student_id = ? AND c.course_id = ?
        ORDER BY ia.assignment_date
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$student_id, $course_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Ошибка в grades-by-student-and-course.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка загрузки заданий']);
}