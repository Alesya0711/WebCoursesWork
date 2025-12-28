<?php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
try {
    $stmt = $pdo->query("SELECT school_id, school_name FROM school ORDER BY school_name");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки школ']);
}