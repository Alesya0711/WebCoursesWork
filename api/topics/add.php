<?php
// api/topics/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$course_id = (int)($input['course_id'] ?? 0);
$name = trim($input['topic_name'] ?? '');
$description = trim($input['topic_description'] ?? '');

if (!$course_id || !$name) {
    http_response_code(400);
    echo json_encode(['error' => 'Курс и название темы обязательны']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("CALL add_topic(?, ?, ?)");
    $stmt->execute([$course_id, $name, $description ?: null]);
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