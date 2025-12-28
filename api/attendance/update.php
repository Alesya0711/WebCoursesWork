<?php
// api/attendance/update.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['attendance']) || !is_array($input['attendance'])) {
    http_response_code(400);
    echo json_encode(['error' => 'attendance обязателен и должен быть массивом']);
    exit;
}

try {
    $pdo->beginTransaction();
    $stmt = $pdo->prepare("INSERT INTO attendance (student_id, lesson_id, is_present) VALUES (?, ?, ?) ON CONFLICT (student_id, lesson_id) DO UPDATE SET is_present = EXCLUDED.is_present");
    
    foreach ($input['attendance'] as $record) {
        $student_id = (int)$record['student_id'];
        $lesson_id = (int)$record['lesson_id'];
        $is_present = isset($record['is_present']) ? (bool)$record['is_present'] : false;
        
        $stmt->execute([$student_id, $lesson_id, $is_present]);
    }
    
    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Ошибка в attendance/update.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка сохранения посещаемости']);
}