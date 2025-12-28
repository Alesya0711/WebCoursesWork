<?php
// api/lessons/delete.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);
$lesson_id = (int)($input['lesson_id'] ?? 0);

if (!$lesson_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID занятия обязателен']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("CALL delete_lesson(?)");
    $stmt->execute([$lesson_id]);
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