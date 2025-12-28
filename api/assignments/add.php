<?php
// api/assignments/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$topic_id = (int)($input['topic_id'] ?? 0);
$student_id = (int)($input['student_id'] ?? 0);
$name = trim($input['assignment_name'] ?? '');
$desc = trim($input['description'] ?? '');
$deadline = trim($input['assignment_date'] ?? '');

if (!$topic_id || !$student_id || !$name || !$deadline) {
    http_response_code(400);
    echo json_encode(['error' => 'Все поля обязательны']);
    exit;
}

if (!DateTime::createFromFormat('Y-m-d', $deadline)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некорректная дата']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("CALL add_assignment(?, ?, ?, ?, ?)");
    $stmt->execute([$topic_id, $student_id, $name, $deadline, $desc]);
    $pdo->commit();
    echo json_encode(['success' => true]);
    exit;
} catch (Exception $e) {
    $pdo->rollBack();
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    http_response_code(500);
    echo json_encode(['error' => $msg]);
}