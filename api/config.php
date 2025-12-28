<?php
// config.php

header('Content-Type: text/html; charset=utf-8');

$host = 'localhost';
$port = '5432';
$db   = 'coursesWork';
$user = 'postgres';
$pass = '12345';

try {
    $pdo = new PDO(
        "pgsql:host={$host};port={$port};dbname={$db};options='--client_encoding=UTF8'",
        $user,
        $pass,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
            
            // Отключаем подготовленные выражения для совместимости
            PDO::PGSQL_ATTR_DISABLE_PREPARES => true,
        ]
    );

    // Устанавливаем кодировку соединения
    $pdo->exec("SET NAMES 'UTF8'");
    
} catch (Exception $e) {
    error_log("Ошибка подключения к БД: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к БД']);
    exit;
}