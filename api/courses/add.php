<?php
// api/courses/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['course_name'] ?? '');
$desc = trim($input['course_description'] ?? '');
$teacher_id = !empty($input['teacher_id']) ? (int)$input['teacher_id'] : null;

if (!$name) {
    http_response_code(400);
    echo json_encode(['error' => 'Название курса обязательно']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("CALL add_course(?, ?, ?)");
    $stmt->execute([$name, $desc ?: null, $teacher_id]);
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    http_response_code(500);
    echo json_encode(['error' => $msg]);
}