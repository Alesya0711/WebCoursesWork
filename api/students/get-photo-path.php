<?php
// api/students/get-photo-path.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$student_id = (int)($_GET['student_id'] ?? 0);
if (!$student_id) {
    echo json_encode(['error' => 'student_id обязателен']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT photo_path FROM students WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $path = $stmt->fetchColumn();

    echo json_encode([
        'photo_path' => $path
    ]);

} catch (Exception $e) {
    error_log("Ошибка получения photo_path: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка сервера']);
}