<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получаем данные
$input = json_decode(file_get_contents('php://input'), true);
//преобразуем значения
$course_id = (int)($input['course_id'] ?? 0);
//проверяем значения
if (!$course_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID курса обязателен']);
    exit;
}

try {
    //начало транзакции
    $pdo->beginTransaction();
    //выполняем запрос
    $stmt = $pdo->prepare("DELETE FROM courses WHERE course_id = ?");
    $stmt->execute([$course_id]);
    //коммитим изменения
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    //если ошибка, то откат транзакции
    $pdo->rollBack();
    http_response_code(500);
    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    }
    echo json_encode(['error' => $msg]);
}