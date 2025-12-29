<?php
// api/assignments/update.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получаем данные
$input = json_decode(file_get_contents('php://input'), true);
//преобразуем форматы
$id = (int)($input['assignment_id'] ?? 0);
$name = trim($input['assignment_name'] ?? '');
$desc = trim($input['description'] ?? '');
$deadline = !empty($input['assignment_date']) ? trim($input['assignment_date']) : null;
$sub_date = !empty($input['submission_date']) ? trim($input['submission_date']) : null;
$grade = !is_null($input['grade']) ? (float)$input['grade'] : null;
$status = trim($input['status'] ?? '');
//проверяем значения
if (!$id || !$name) {
    http_response_code(400);
    echo json_encode(['error' => 'ID и название задания обязательны']);
    exit;
}

try {
    //начало транзакции
    $pdo->beginTransaction();
    //вызываем хранимую процедуру
    $stmt = $pdo->prepare("CALL update_assignment(?, ?, ?, ?, ?, ?, ?)");
    //передаем значения
    $stmt->execute([$id, $name, $deadline, $desc, $sub_date, $grade, $status]);
    //коммитим изменения
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    //если ошибки, то откатываем транзакцию
    $pdo->rollBack();
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    http_response_code(500);
    echo json_encode(['error' => $msg]);
}