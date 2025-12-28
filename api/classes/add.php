<?php
// api/classes/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$school_id = (int)($input['school_id'] ?? 0);
$className = trim($input['class_name'] ?? '');
$description = trim($input['description'] ?? '');
$homeroom = trim($input['homeroom_teacher'] ?? '');

if (!$school_id || !$className) {
    http_response_code(400);
    echo json_encode(['error' => 'Школа и название класса обязательны']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("CALL create_class(?, ?, ?, ?)");
    $stmt->execute([$school_id, $className, $description ?: null, $homeroom ?: null]);
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