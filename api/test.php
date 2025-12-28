<?php
require_once 'config.php';

$stmt = $pdo->query("SELECT version()");
echo json_encode(['postgres' => $stmt->fetchColumn()]);