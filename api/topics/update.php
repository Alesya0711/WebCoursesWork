<?php
// api/topics/update.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$topic_id = (int)($input['topic_id'] ?? 0);
$name = trim($input['topic_name'] ?? '');
$description = trim($input['topic_description'] ?? '');

if (!$topic_id || !$name) {
    http_response_code(400);
    echo json_encode(['error' => 'ID и название темы обязательны']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("CALL update_topic(?, ?, ?)");
    $stmt->execute([$topic_id, $name, $description ?: null]);
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