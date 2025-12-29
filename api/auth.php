<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'config.php';
//проверка http метода
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешён']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Логин и пароль обязательны']);
    exit;
}

try {
    // Сначала получаем пользователя из users
    $stmt = $pdo->prepare("
        SELECT 
            u.user_id,
            u.role,
            u.hash_password
        FROM users u
        WHERE u.username = ? AND u.is_active = TRUE
    ");
    $stmt->execute([$username]);
    $userData = $stmt->fetch();

    //проверяем пароль
    if (!$userData || !verifyPassword($password, $userData['hash_password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Неверный логин или пароль']);
        exit;
    }

    $user_id = (int)$userData['user_id'];
    $role = $userData['role'];

    // По умолчанию — нет данных в ответе
    $response = [
        'user_id' => $user_id,
        'role' => $role,
        'teacher_id' => null,
        'student_id' => null,
        'last_name' => null,
        'first_name' => null,
        'middle_name' => null,
        'email' => null
    ];

    // Если преподаватель — читаем из teachers
    if ($role === 'teacher') {
        $stmt = $pdo->prepare("
            SELECT 
                teacher_id, last_name, first_name, middle_name, email
            FROM teachers
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($teacher) {
            $response['teacher_id'] = (int)$teacher['teacher_id'];
            $response['last_name'] = $teacher['last_name'];
            $response['first_name'] = $teacher['first_name'];
            $response['middle_name'] = $teacher['middle_name'];
            $response['email'] = $teacher['email'];
        }
    }
    // Если студент — читаем из students
    elseif ($role === 'student') {
        $stmt = $pdo->prepare("
            SELECT 
                student_id, last_name, first_name, middle_name, email
            FROM students
            WHERE user_id = ?
        ");
        $stmt->execute([$user_id]);
        $student = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($student) {
            $response['student_id'] = (int)$student['student_id'];
            $response['last_name'] = $student['last_name'];
            $response['first_name'] = $student['first_name'];
            $response['middle_name'] = $student['middle_name'];
            $response['email'] = $student['email'];
        }
    }
    // Если админ
    elseif ($role === 'admin') {
        $response['email'] = null;
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // Логируем ошибку в файл
    error_log("Auth error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Внутренняя ошибка сервера']);
}

//проверка пароля
function verifyPassword($password, $storedHash) {
    if (empty($password) || empty($storedHash)) return false;
    $parts = explode(':', $storedHash);
    if (count($parts) !== 2) return false;
    $storedHashHex = $parts[0];
    $saltHex = $parts[1];
    $salt = hex2bin($saltHex);
    if ($salt === false) return false;
    $passwordBytes = mb_convert_encoding($password, 'UTF-8');
    $salted = $passwordBytes . $salt;
    $computedHash = hash('sha256', $salted);
    return hash_equals($storedHashHex, $computedHash);
}