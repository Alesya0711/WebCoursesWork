<?php
// api/assignments/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

//конвертируем json  в массив
$input = json_decode(file_get_contents('php://input'), true);

//делаем приведение типов
$topic_id = (int)($input['topic_id'] ?? 0);
$student_id = (int)($input['student_id'] ?? 0);
$name = trim($input['assignment_name'] ?? '');
$desc = trim($input['description'] ?? '');
$deadline = trim($input['assignment_date'] ?? '');

//проверяем все обязательные поля
if (!$topic_id || !$student_id || !$name || !$deadline) {
    http_response_code(400);
    echo json_encode(['error' => 'Все поля обязательны']);
    exit;
}

//проверяем формат даты
if (!DateTime::createFromFormat('Y-m-d', $deadline)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некорректная дата']);
    exit;
}

try {
    //начало транзакции
    $pdo->beginTransaction();
    //вызов хранимой процедуры
    $stmt = $pdo->prepare("CALL add_assignment(?, ?, ?, ?, ?)");
    //передача параметров
    $stmt->execute([$topic_id, $student_id, $name, $deadline, $desc]);
    //коммит изменеий
    $pdo->commit();
    echo json_encode(['success' => true]);
    exit;
} catch (Exception $e) {
    //если ошибки, то откат транзакции
    $pdo->rollBack();
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    http_response_code(500);
    echo json_encode(['error' => $msg]);
}