<?php
// api/groups/update.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получение данных
$input = json_decode(file_get_contents('php://input'), true);
//преобразование данных
$group_id = (int)($input['group_id'] ?? 0);
$name = trim($input['group_name'] ?? '');
$desc = trim($input['description'] ?? '');
$course_id = (int)($input['course_id'] ?? 0);
//проверка всех полей
if (!$group_id || !$name || !$course_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID группы, название и курс обязательны']);
    exit;
}

try {
    //начало транзакции
    $pdo->beginTransaction();
    //вызов хранимой процедуры
    $stmt = $pdo->prepare("CALL update_group(?, ?, ?)");
    $stmt->execute([$group_id, $name, $desc ?: null]);
    //коммит изменений
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    //если ошибка, то откат транзакции
    $pdo->rollBack();
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    echo json_encode(['error' => $msg]);
}