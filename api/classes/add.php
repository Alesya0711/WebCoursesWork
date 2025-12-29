<?php
// api/classes/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получаем данные
$input = json_decode(file_get_contents('php://input'), true);
//преобразуем данные
$school_id = (int)($input['school_id'] ?? 0);
$className = trim($input['class_name'] ?? '');
$description = trim($input['description'] ?? '');
$homeroom = trim($input['homeroom_teacher'] ?? '');
//проверяем наличие данных
if (!$school_id || !$className) {
    http_response_code(400);
    echo json_encode(['error' => 'Школа и название класса обязательны']);
    exit;
}

try {
    //начало транзакции
    $pdo->beginTransaction();
    //вызываем хранимую процедуру
    $stmt = $pdo->prepare("CALL create_class(?, ?, ?, ?)");
    //передаем значения
    $stmt->execute([$school_id, $className, $description ?: null, $homeroom ?: null]);
    //коммитим измениния
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    //если есть ошибки, то откат транзакции
    $pdo->rollBack();
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    http_response_code(500);
    echo json_encode(['error' => $msg]);
}