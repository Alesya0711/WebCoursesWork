<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
$school_id = (int)($_GET['school_id'] ?? 0);
if (!$school_id) {
    http_response_code(400);
    echo json_encode(['error' => 'school_id обязателен']);
    exit;
}
try {
    $stmt = $pdo->prepare("SELECT class_id, class_name FROM class WHERE school_id = ? ORDER BY class_name");
    $stmt->execute([$school_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки классов']);
}