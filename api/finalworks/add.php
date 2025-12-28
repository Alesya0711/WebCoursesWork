<?php
// api/finalworks/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$student_id = (int)($input['student_id'] ?? 0);
$course_id = (int)($input['course_id'] ?? 0);
$theory_grade = (float)($input['theory_grade'] ?? 0);
$practice_grade = (float)($input['practice_grade'] ?? 0);
$exam_date = trim($input['exam_date'] ?? '');

if (!$student_id || !$course_id || !$exam_date) {
    http_response_code(400);
    echo json_encode(['error' => 'Студент, курс и дата экзамена обязательны']);
    exit;
}

try {
    $pdo->beginTransaction();

    $checkStmt = $pdo->prepare("
        SELECT COUNT(*) FROM finalworks 
        WHERE student_id = ? AND course_id = ?
    ");
    $checkStmt->execute([$student_id, $course_id]);

    if ($checkStmt->fetchColumn() > 0) {
        throw new Exception("ERROR: У этого студента уже есть итоговая работа по данному курсу");
    }

    $stmt = $pdo->prepare("
        INSERT INTO finalworks (student_id, course_id, theory_grade, practice_grade, exam_date)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$student_id, $course_id, $theory_grade, $practice_grade, $exam_date]);
    
    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }

    http_response_code(500);
    echo json_encode(['error' => $msg]);
}