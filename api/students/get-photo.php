<?php
// api/students/get-photo.php
require_once '../config.php';

$student_id = (int)($_GET['student_id'] ?? 0);
if (!$student_id) {
    http_response_code(400);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT photo_path FROM students WHERE student_id = ?");
    $stmt->execute([$student_id]);
    $filename = $stmt->fetchColumn();

    if ($filename && file_exists('../uploads/' . $filename)) {
        // Определяем тип по расширению
        $ext = pathinfo($filename, PATHINFO_EXTENSION);
        if ($ext === 'png') {
            header('Content-Type: image/png');
        } else {
            header('Content-Type: image/jpeg');
        }
        readfile('../uploads/' . $filename);
    } else {
        // Заглушка — серый квадрат
        header('Content-Type: image/svg+xml');
        echo '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#e0e0e0"/>
              </svg>';
    }

} catch (Exception $e) {
    http_response_code(500);
    exit;
}