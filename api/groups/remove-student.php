<?php
// api/groups/remove-student.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получение и преобразование данных
$input = json_decode(file_get_contents('php://input'), true);
$student_id = (int)($input['student_id'] ?? 0);
$group_id = (int)($input['group_id'] ?? 0);
//проверка обязательнвх полей
if (!$student_id || !$group_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID студента и группы обязательны']);
    exit;
}

try {
    //начало транзакции
    $pdo->beginTransaction();
    //выполнение запроса удаления
    $stmt = $pdo->prepare("DELETE FROM student_groups WHERE student_id = ? AND group_id = ?");
    $stmt->execute([$student_id, $group_id]);
    //коммит изменений
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка удаления студента из группы']);
}