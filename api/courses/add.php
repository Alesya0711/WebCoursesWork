<?php
// api/courses/add.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получаем данные
$input = json_decode(file_get_contents('php://input'), true);
//преобразуем данные
$name = trim($input['course_name'] ?? '');
$desc = trim($input['course_description'] ?? '');
$teacher_id = !empty($input['teacher_id']) ? (int)$input['teacher_id'] : null;
//проверяем наличие данных
if (!$name) {
    http_response_code(400);
    echo json_encode(['error' => 'Название курса обязательно']);
    exit;
}

try {
    //начало транзакции
    $pdo->beginTransaction();
    //вызываем хранимую процедуру
    $stmt = $pdo->prepare("CALL add_course(?, ?, ?)");
    $stmt->execute([$name, $desc ?: null, $teacher_id]);
    //коммитим изменения
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    //если ошибка, то откат транзакции
    $pdo->rollBack();
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    http_response_code(500);
    echo json_encode(['error' => $msg]);
}