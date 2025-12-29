<?php
// api/finalworks/delete.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получаем данные
$input = json_decode(file_get_contents('php://input'), true);
$id = (int)($input['final_id'] ?? 0);
//проверяем данные
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID итоговой работы обязателен']);
    exit;
}

try {
    //начало транзакции
    $pdo->beginTransaction();
    //выполняем запрос
    $stmt = $pdo->prepare("DELETE FROM finalworks WHERE final_id = ?");
    $stmt->execute([$id]);
    //коммит изменений
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка удаления итоговой работы']);
}