<?php
// api/groups/update.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$group_id = (int)($input['group_id'] ?? 0);
$name = trim($input['group_name'] ?? '');
$desc = trim($input['description'] ?? '');
$course_id = (int)($input['course_id'] ?? 0);

if (!$group_id || !$name || !$course_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID группы, название и курс обязательны']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("CALL update_group(?, ?, ?)");
    $stmt->execute([$group_id, $name, $desc ?: null]);
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    echo json_encode(['error' => $msg]);
}