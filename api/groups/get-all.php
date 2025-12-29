<?php
// api/groups/get-all.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

try {
    $sql = "
        SELECT 
            g.group_id,
            g.group_name,
            c.course_name
        FROM groups g
        JOIN courses c ON g.course_id = c.course_id
        ORDER BY c.course_name, g.group_name
    ";
    //выполняем запрос
    $stmt = $pdo->query($sql);
    //возвращаем данные в формате json
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Ошибка в groups/get-all.php: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка загрузки групп']);
}