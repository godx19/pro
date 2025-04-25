<?php
header('Content-Type: application/json');
require_once '../db.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        if (isset($data['action'])) {
            switch ($data['action']) {
                case 'register':
                    // Register new user
                    $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
                    try {
                        $stmt->execute([$data['name'], $data['email'], password_hash($data['password'], PASSWORD_DEFAULT)]);
                        echo json_encode(['success' => true, 'message' => 'Registration successful']);
                    } catch(PDOException $e) {
                        echo json_encode(['success' => false, 'message' => 'Email already exists']);
                    }
                    break;

                case 'login':
                    // Login user
                    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
                    $stmt->execute([$data['email']]);
                    $user = $stmt->fetch();

                    if ($user && password_verify($data['password'], $user['password'])) {
                        // Start session
                        session_start();
                        $_SESSION['user_id'] = $user['id'];
                        $_SESSION['user_email'] = $user['email'];
                        
                        echo json_encode([
                            'success' => true,
                            'message' => 'Login successful',
                            'user' => [
                                'id' => $user['id'],
                                'name' => $user['name'],
                                'email' => $user['email']
                            ]
                        ]);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
                    }
                    break;

                case 'forgot_password':
                    // Check if email exists
                    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
                    $stmt->execute([$data['email']]);
                    if ($stmt->fetch()) {
                        // In a real app, you would send a password reset email here
                        echo json_encode(['success' => true, 'message' => 'Password reset instructions sent']);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Email not found']);
                    }
                    break;
            }
        }
        break;
}
?> 