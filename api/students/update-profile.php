<?php
// api/students/update-profile.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);
$student_id = (int)($input['student_id'] ?? 0);
$email = trim($input['email'] ?? '');

if (!$student_id || !$email) {
    http_response_code(400);
    echo json_encode(['error' => 'student_id и email обязательны']);
    exit;
}

// Валидация email: должен содержать @ и заканчиваться на .com
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/\.com$/i', $email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email должен быть в формате user@domain.com']);
    exit;
}

try {
    $stmt = $pdo->prepare("UPDATE students SET email = ? WHERE student_id = ?");
    $stmt->execute([$email, $student_id]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    error_log("Ошибка обновления email: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сохранения']);
}