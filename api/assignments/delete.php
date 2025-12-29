<?php
// api/assignments/delete.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

//получаем данные
$input = json_decode(file_get_contents('php://input'), true);
$id = (int)($input['assignment_id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID задания обязателен']);
    exit;
}

try {
    //начинам транзакци.
    $pdo->beginTransaction();
    //выполняем запрос
    $stmt = $pdo->prepare("DELETE FROM individualassignments WHERE assignment_id = ?");
    $stmt->execute([$id]);
    //коммитим изменеия
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    //если ошибки, то откатываем изменения
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка удаления задания']);
}