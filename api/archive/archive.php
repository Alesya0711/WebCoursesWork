<?php
// api/archive/archive.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);
$user_id = (int)($input['user_id'] ?? 0);

if (!$user_id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID пользователя обязателен']);
    exit;
}

try {
    //начало транзакции
    $pdo->beginTransaction();
    //получаем роль пользователя
    $stmt = $pdo->prepare("SELECT role FROM users WHERE user_id = ?");
    $stmt->execute([$user_id]);
    $role = $stmt->fetchColumn();

    //если препод, то проверяем его курсы
    if ($role === 'teacher') {
        $stmt = $pdo->prepare("
            SELECT 1 FROM courses 
            WHERE teacher_id = (SELECT teacher_id FROM teachers WHERE user_id = ?)
        ");
        $stmt->execute([$user_id]);
        //если курсы есть, то не архивируем
        if ($stmt->fetch()) {
            throw new Exception('Нельзя архивировать преподавателя, который ведёт хотя бы один курс.');
        }
    }

    //архивируем пользователя
    $stmt = $pdo->prepare("UPDATE users SET is_active = FALSE WHERE user_id = ?");
    $stmt->execute([$user_id]);
    //комитим транзакцию
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    //если ошибки, откатываем транзакцию
    $pdo->rollBack();
    echo json_encode(['error' => $e->getMessage()]);
}