<?php
// api/archive/restore.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);
$user_id = (int)($input['user_id'] ?? 0);

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID пользователя обязателен']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("UPDATE users SET is_active = TRUE WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['error' => 'Ошибка восстановления']);
}