<?php
// api/students/get-profile.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$student_id = (int)($_SESSION['user']['student_id'] ?? 0);
if (!$student_id) {
    http_response_code(403);
    echo json_encode(['error' => 'Не авторизован']);
    exit;
}

try {
    $stmt = $pdo->prepare("
    SELECT 
        s.last_name,
        s.first_name,
        s.middle_name,
        s.email
    FROM students s
    JOIN users u ON s.user_id = u.user_id
    WHERE s.student_id = ?
");
$stmt->execute([$student_id]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profile) {
    http_response_code(404);
    echo json_encode(['error' => 'Профиль не найден']);
    exit;
}

echo json_encode($profile, JSON_UNESCAPED_UNICODE);
}