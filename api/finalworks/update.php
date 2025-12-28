<?php
// api/finalworks/update.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

$input = json_decode(file_get_contents('php://input'), true);

$id = (int)($input['final_id'] ?? 0);
$ticket = trim($input['ticket_number'] ?? ''); 
$theory_grade = (float)($input['theory_grade'] ?? 0);
$practice_grade = (float)($input['practice_grade'] ?? 0);
$exam_date = trim($input['exam_date'] ?? '');

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID итоговой работы обязателен']);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        UPDATE finalworks
        SET theory_grade = ?, 
            practice_grade = ?, 
            exam_date = ?, 
            ticket_number = ?
        WHERE final_id = ?
    ");
    
    $stmt->execute([$theory_grade, $practice_grade, $exam_date, $ticket, $id]);
    
    $pdo->commit();
    echo json_encode(['success' => true]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    $msg = $e->getMessage();
    if (preg_match('/ERROR:\s*(.+)/', $msg, $m)) {
        $msg = trim($m[1]);
    } else {
        $msg = 'Ошибка обновления итоговой работы';
    }

    http_response_code(500);
    echo json_encode(['error' => $msg]);
}