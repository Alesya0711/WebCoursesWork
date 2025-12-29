<?php
// api/students/upload-photo.php
header('Content-Type: application/json; charset=utf-8');
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Только POST']);
    exit;
}

$student_id = (int)($_POST['student_id'] ?? 0);
if (!$student_id || empty($_FILES['photo'])) {
    echo json_encode(['error' => 'Нет данных']);
    exit;
}

if (!in_array($_FILES['photo']['type'], ['image/jpeg', 'image/png'])) {
    echo json_encode(['error' => 'Только JPG/PNG']);
    exit;
}

try {
    // Генерируем имя файла
    $extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
    $filename = "student_{$student_id}.{$extension}";
    $upload_path = __DIR__ . '/../../uploads/' . $filename;

    // Сохраняем файл
    if (!move_uploaded_file($_FILES['photo']['tmp_name'], $upload_path)) {
        throw new Exception('Не удалось сохранить файл');
    }

    // Сохраняем путь в БД 
    $stmt = $pdo->prepare("UPDATE students SET photo_path = ? WHERE student_id = ?");
    $stmt->execute([$filename, $student_id]);

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    error_log("Ошибка загрузки фото: " . $e->getMessage());
    echo json_encode(['error' => 'Ошибка сохранения']);
}