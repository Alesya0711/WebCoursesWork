<?php
// api/groups/get-by-course.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получение данных
$course_id = (int)($_GET['course_id'] ?? 0);
//проверка данных
if (!$course_id) {
    http_response_code(400);
    echo json_encode(['error' => 'course_id обязателен']);
    exit;
}

try {
    //выполнение запроса
    $stmt = $pdo->prepare("
        SELECT 
            g.group_id,
            g.group_name,
            g.course_id  -- ← ДОБАВЬ ЭТО!
        FROM groups g
        WHERE g.course_id = ?
        ORDER BY g.group_name
    ");
    $stmt->execute([$course_id]);
    //передача данных в формате json
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Ошибка в groups/get-by-course.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка загрузки групп']);
}