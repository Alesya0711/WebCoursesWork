<?php
// api/schools/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['school_name'] ?? '');
$address = trim($input['address'] ?? '');
$director = trim($input['director'] ?? '');

if (!$name) {
    http_response_code(400);
    echo json_encode(['error' => 'Название школы обязательно']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("CALL create_school(?, ?, ?)");
    $stmt->execute([$name, $address ?: null, $director ?: null]);
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