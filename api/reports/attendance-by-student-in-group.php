<?php
// api/reports/attendance-by-student-in-group.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$student_id = (int)($_GET['student_id'] ?? 0);
$group_id = (int)($_GET['group_id'] ?? 0);

if (!$student_id || !$group_id) {
    http_response_code(400);
    echo json_encode(['error' => 'student_id и group_id обязательны']);
    exit;
}

try {
    // Получаем course_id по group_id
    $stmt = $pdo->prepare("SELECT course_id FROM groups WHERE group_id = ?");
    $stmt->execute([$group_id]);
    $course_id = $stmt->fetchColumn();

    if (!$course_id) {
        echo json_encode([]);
        exit;
    }

    $sql = "
        SELECT 
            c.course_name,
            t.topic_name,
            l.lesson_number,
            l.lesson_date,
            a.is_present
        FROM attendance a
        JOIN lessons l ON a.lesson_id = l.lesson_id
        JOIN topics t ON l.topic_id = t.topic_id
        JOIN courses c ON t.course_id = c.course_id
        WHERE a.student_id = ? AND c.course_id = ?
        ORDER BY c.course_name, t.topic_name, l.lesson_date
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$student_id, $course_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Ошибка в attendance-by-student-in-group.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка загрузки посещаемости']);
}