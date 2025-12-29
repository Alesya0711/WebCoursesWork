<?php
// api/students/get-grades-by-course.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$student_id = (int)($_SESSION['user']['student_id'] ?? 0);
$course_id = (int)($_GET['course_id'] ?? 0);

//получаем student_id из GET
$student_id = (int)($_GET['student_id'] ?? 0);
$course_id = (int)($_GET['course_id'] ?? 0);

if (!$student_id || !$course_id) {
    http_response_code(400);
    echo json_encode(['assignments' => [], 'final_work' => null]);
    exit;
}

try {
    // Индивидуальные задания
    $stmt = $pdo->prepare("
        SELECT 
            ia.assignment_name,
            ia.grade,
            ia.status
        FROM individualassignments ia
        JOIN topics t ON ia.topic_id = t.topic_id
        WHERE ia.student_id = ? AND t.course_id = ?
        ORDER BY ia.assignment_date
    ");
    $stmt->execute([$student_id, $course_id]);
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Итоговая работа
    $stmt = $pdo->prepare("
        SELECT theory_grade, practice_grade
        FROM finalworks
        WHERE student_id = ? AND course_id = ?
    ");
    $stmt->execute([$student_id, $course_id]);
    $final = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'assignments' => $assignments,
        'final_work' => $final
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log("Ошибка в get-grades-by-course.php: " . $e->getMessage());
    echo json_encode(['assignments' => [], 'final_work' => null]);
}