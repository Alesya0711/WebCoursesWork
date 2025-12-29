<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Только POST-запросы']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Валидация
$last_name = trim($input['last_name'] ?? '');
$first_name = trim($input['first_name'] ?? '');
$middle_name = trim($input['middle_name'] ?? '');
$email = trim($input['email'] ?? '');
$subject_id = !empty($input['subject_id']) ? (int)$input['subject_id'] : null;
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$last_name || !$first_name || !$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Фамилия, имя, логин и пароль обязательны']);
    exit;
}

// Валидация email
if ($email && !preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некорректный email']);
    exit;
}

// Генерация хеша пароля
function hashPassword($password) {
    $salt = random_bytes(32);
    $passwordBytes = mb_convert_encoding($password, 'UTF-8');
    $salted = $passwordBytes . $salt;
    $hash = hash('sha256', $salted);
    return $hash . ':' . bin2hex($salt);
}

try {
    $pdo->beginTransaction();

    // Вызов хранимой процедуры add_teacher
    $stmt = $pdo->prepare("CALL add_teacher(?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $last_name,
        $first_name,
        $middle_name ?: null,
        $email ?: null,
        $subject_id,
        $username,
        hashPassword($password)
    ]);

    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    echo json_encode(['error' => $msg]);
}