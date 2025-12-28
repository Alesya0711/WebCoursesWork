<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Только POST']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$teacher_id = (int)($input['teacher_id'] ?? 0);
$last_name = trim($input['last_name'] ?? '');
$first_name = trim($input['first_name'] ?? '');
$middle_name = trim($input['middle_name'] ?? '');
$email = trim($input['email'] ?? '');
$subject_id = !empty($input['subject_id']) ? (int)$input['subject_id'] : null;
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$teacher_id || !$last_name || !$first_name || !$username) {
    http_response_code(400);
    echo json_encode(['error' => 'Обязательные поля: Фамилия, Имя, Логин']);
    exit;
}

// Валидация email
if ($email && !preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некорректный email']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Получаем user_id преподавателя
    $stmt = $pdo->prepare("SELECT user_id FROM teachers WHERE teacher_id = ?");
    $stmt->execute([$teacher_id]);
    $user_id = $stmt->fetchColumn();
    if (!$user_id) {
        throw new Exception('Преподаватель не найден');
    }

    // Обновляем логин в users
    $stmt = $pdo->prepare("UPDATE users SET username = ? WHERE user_id = ?");
    $stmt->execute([$username, $user_id]);

    // Если задан пароль — обновляем хеш
    if (!empty($password)) {
        $salt = random_bytes(32);
        $passwordBytes = mb_convert_encoding($password, 'UTF-8');
        $salted = $passwordBytes . $salt;
        $hash = hash('sha256', $salted);
        $hashWithSalt = $hash . ':' . bin2hex($salt);
        $stmt = $pdo->prepare("UPDATE users SET hash_password = ? WHERE user_id = ?");
        $stmt->execute([$hashWithSalt, $user_id]);
    }

    // Обновляем данные в teachers
    $stmt = $pdo->prepare("
        UPDATE teachers 
        SET last_name = ?, first_name = ?, middle_name = ?, email = ?, subject_id = ?
        WHERE teacher_id = ?
    ");
    $stmt->execute([
        $last_name,
        $first_name,
        $middle_name ?: null,
        $email ?: null,
        $subject_id,
        $teacher_id
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