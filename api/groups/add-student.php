<?php
// api/groups/add-student.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получаем данные и преобразкем их
$input = json_decode(file_get_contents('php://input'), true);
$student_id = (int)($input['student_id'] ?? 0);
$group_id = (int)($input['group_id'] ?? 0);
//проверяем все обязательные поля
if (!$student_id || !$group_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID студента и группы обязательны']);
    exit;
}

try {
    // Проверяем, не в группе ли уже
    $stmt = $pdo->prepare("SELECT 1 FROM student_groups WHERE student_id = ? AND group_id = ?");
    $stmt->execute([$student_id, $group_id]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Студент уже в группе']);
        exit;
    }

    // Добавляем
    $stmt = $pdo->prepare("INSERT INTO student_groups (student_id, group_id) VALUES (?, ?)");
    $stmt->execute([$student_id, $group_id]);

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка добавления студента в группу']);
}