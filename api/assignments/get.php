<?php
// api/assignments/get.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';
//получаем данные и проверяем их
$topic_id = (int)($_GET['topic_id'] ?? 0);
if (!$topic_id) {
    http_response_code(400);
    echo json_encode(['error' => 'topic_id обязателен']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            ia.assignment_id,
            s.last_name || ' ' || s.first_name AS student_name,
            ia.assignment_name,
            ia.grade,
            ia.status,
            ia.assignment_date,
            ia.submission_date
        FROM individualassignments ia
        JOIN students s ON ia.student_id = s.student_id
        JOIN users u ON s.user_id = u.user_id
        WHERE ia.topic_id = ? AND u.is_active = TRUE
        ORDER BY s.last_name
    ");
    //выполняем запрос
    $stmt->execute([$topic_id]);
    //получаем данные и преобразуем их в json
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log("Ошибка в assignments/get.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка загрузки заданий']);
}