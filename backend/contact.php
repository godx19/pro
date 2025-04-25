<?php
header('Content-Type: application/json');

// Database configuration
$host = 'localhost';
$dbname = 'mediguide';
$username = 'root';
$password = '';

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
        echo json_encode([
            'success' => false,
            'message' => 'All fields are required'
        ]);
        exit;
    }
    
    // Validate email format
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email format'
        ]);
        exit;
    }
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Email already registered'
        ]);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->execute([$data['username'], $data['email'], $hashedPassword]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful'
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 