<?php
// api/topics/delete.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);
$topic_id = (int)($input['topic_id'] ?? 0);

if (!$topic_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID темы обязателен']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("DELETE FROM topics WHERE topic_id = ?");
    $stmt->execute([$topic_id]);
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