<?php
// api/students/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$last_name = trim($input['last_name'] ?? '');
$first_name = trim($input['first_name'] ?? '');
$middle_name = trim($input['middle_name'] ?? '');
$email = trim($input['email'] ?? '');
$group_id = (int)($input['group_id'] ?? 0);
$class_id = (int)($input['class_id'] ?? 0);
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

// Валидация
if (!$last_name || !$first_name || !$username || !$password || !$group_id || !$class_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Все поля обязательны']);
    exit;
}

if ($email && !preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некорректный email']);
    exit;
}

// Хеширование пароля (как в C#)
function hashPassword($password) {
    $salt = random_bytes(32);
    $passwordBytes = mb_convert_encoding($password, 'UTF-8');
    $salted = $passwordBytes . $salt;
    $hash = hash('sha256', $salted);
    return $hash . ':' . bin2hex($salt);
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("CALL add_student(?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $last_name,
        $first_name,
        $username,
        hashPassword($password),
        $class_id,
        $group_id,
        $middle_name ?: null,
        null, // phone (у тебя не используется)
        $email ?: null
    ]);
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