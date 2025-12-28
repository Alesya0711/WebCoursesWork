<?php
// api/finalworks/get-by-course-and-group.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$course_id = (int)($_GET['course_id'] ?? 0);
$group_id = (int)($_GET['group_id'] ?? 0);

if (!$course_id || !$group_id) {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $sql = "
        SELECT 
            fw.final_id,
            s.last_name || ' ' || s.first_name AS student_name,
            fw.ticket_number,
            fw.exam_date,
            fw.theory_grade,
            fw.practice_grade
        FROM finalworks fw
        JOIN students s ON fw.student_id = s.student_id
        JOIN student_groups sg ON s.student_id = sg.student_id
        WHERE fw.course_id = ?
          AND sg.group_id = ?
        ORDER BY s.last_name
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$course_id, $group_id]);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log("Ошибка в get-by-course-and-group.php: " . $e->getMessage());
    echo json_encode([], JSON_UNESCAPED_UNICODE);
}