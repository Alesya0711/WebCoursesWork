<?php
// api/lessons/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$topic_id = (int)($input['topic_id'] ?? 0);
$number = (int)($input['lesson_number'] ?? 0);
$date = trim($input['lesson_date'] ?? '');
$type = trim($input['lesson_type'] ?? '');

if (!$topic_id || !$number || !$date || !$type) {
    http_response_code(400);
    echo json_encode(['error' => 'Все поля обязательны']);
    exit;
}

// Валидация даты
if (!DateTime::createFromFormat('Y-m-d', $date)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некорректная дата']);
    exit;
}

if (!in_array($type, ['Лекция', 'Практика'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Тип занятия: Лекция или Практика']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("CALL add_lesson(?, ?, ?, ?)");
    $stmt->execute([$topic_id, $number, $date, $type]);
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