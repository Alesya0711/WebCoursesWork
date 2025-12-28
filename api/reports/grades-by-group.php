<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$group_id = (int)($_GET['group_id'] ?? 0);
if (!$group_id) {
    http_response_code(400);
    echo json_encode(['error' => 'group_id обязателен']);
    exit;
}

try {
    $sql = "
        SELECT 
            s.last_name || ' ' || s.first_name AS student_name,
            AVG(ia.grade) AS avg_assignment_grade,
            (f.theory_grade * 0.4 + f.practice_grade * 0.6) AS final_work_grade,
            (AVG(ia.grade) * 0.4 + (f.theory_grade * 0.4 + f.practice_grade * 0.6) * 0.6) AS course_final_grade,
            COUNT(ia.assignment_id) AS total_assignments,
            COUNT(ia.grade) AS completed_assignments
        FROM students s
        JOIN users u ON s.user_id = u.user_id
        JOIN student_groups sg ON s.student_id = sg.student_id
        LEFT JOIN individualassignments ia ON s.student_id = ia.student_id
            AND ia.topic_id IN (
                SELECT t.topic_id FROM topics t
                JOIN courses c ON t.course_id = c.course_id
                WHERE c.course_id = (SELECT course_id FROM groups WHERE group_id = ?)
            )
        LEFT JOIN finalworks f ON s.student_id = f.student_id
            AND f.course_id = (SELECT course_id FROM groups WHERE group_id = ?)
        WHERE sg.group_id = ? AND u.is_active = TRUE
        GROUP BY s.student_id, s.last_name, s.first_name, f.theory_grade, f.practice_grade
        ORDER BY s.last_name
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$group_id, $group_id, $group_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Ошибка в grades-by-group.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка генерации отчёта']);
}