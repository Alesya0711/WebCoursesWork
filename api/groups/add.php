<?php
// api/groups/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получаем данные
$input = json_decode(file_get_contents('php://input'), true);
//преобразуем их
$name = trim($input['group_name'] ?? '');
$desc = trim($input['description'] ?? '');
$course_id = (int)($input['course_id'] ?? 0);
//проверяем обязательные
if (!$name || !$course_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Название группы и курс обязательны']);
    exit;
}

try {
    //начало транзакции
    $pdo->beginTransaction();
    //вызываем хранимую процедуру
    $stmt = $pdo->prepare("CALL add_group(?, ?, ?)");
    $stmt->execute([$name, $course_id, $desc ?: null]);
    //коммитим изменения
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    //если ошибки, то откат транзакции
    $pdo->rollBack();
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    echo json_encode(['error' => $msg]);
}