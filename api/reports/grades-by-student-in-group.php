<?php
// api/reports/grades-by-student-in-group.php
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

    // Задания
    $stmt = $pdo->prepare("
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
    $finalWork = $stmt->fetch(PDO::FETCH_ASSOC);

    // Формируем результат
    $result = [];
    
    // Сначала задания
    foreach ($assignments as $a) {
        $result[] = [
            'course_name' => $a['course_name'],
            'assignment_name' => $a['assignment_name'],
            'grade' => $a['grade'],
            'status' => $a['status'],
            'is_final_work' => false
        ];
    }

    // Потом итоговая работа (если есть)
    if ($finalWork) {
        $result[] = [
            'course_name' => $assignments[0]['course_name'] ?? '',
            'assignment_name' => 'Итоговая работа (теория)',
            'grade' => $finalWork['theory_grade'],
            'status' => 'оценено',
            'is_final_work' => true
        ];
        $result[] = [
            'course_name' => $assignments[0]['course_name'] ?? '',
            'assignment_name' => 'Итоговая работа (практика)',
            'grade' => $finalWork['practice_grade'],
            'status' => 'оценено',
            'is_final_work' => true
        ];
    }

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Ошибка в grades-by-student-in-group.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка загрузки данных']);
}