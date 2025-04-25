<?php
require_once 'vendor/autoload.php';

// Database configuration
$host = 'localhost';
$dbname = 'mediguide';
$username = 'root';
$password = '';

// Google OAuth configuration
$clientID = 'YOUR_GOOGLE_CLIENT_ID';
$clientSecret = 'YOUR_GOOGLE_CLIENT_SECRET';
$redirectUri = 'http://localhost/backend/google-callback.php';

try {
    // Create Google Client
    $client = new Google_Client();
    $client->setClientId($clientID);
    $client->setClientSecret($clientSecret);
    $client->setRedirectUri($redirectUri);
    $client->addScope('email');
    $client->addScope('profile');

    // Get token
    if (isset($_GET['code'])) {
        $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);
        $client->setAccessToken($token);

        // Get user info
        $google_oauth = new Google_Service_Oauth2($client);
        $google_account_info = $google_oauth->userinfo->get();
        
        $email = $google_account_info->email;
        $name = $google_account_info->name;
        $google_id = $google_account_info->id;

        // Connect to database
        $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        
        if ($stmt->rowCount() == 0) {
            // Create new user
            $stmt = $pdo->prepare("INSERT INTO users (username, email, google_id) VALUES (?, ?, ?)");
            $stmt->execute([$name, $email, $google_id]);
        } else {
            // Update Google ID for existing user
            $stmt = $pdo->prepare("UPDATE users SET google_id = ? WHERE email = ?");
            $stmt->execute([$google_id, $email]);
        }

        // Start session and store user info
        session_start();
        $_SESSION['user_email'] = $email;
        $_SESSION['user_name'] = $name;
        $_SESSION['google_id'] = $google_id;

        // Redirect to dashboard or home page
        header('Location: ../frontend/dashboard.html');
        exit;
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Authentication error: ' . $e->getMessage()
    ]);
}
?> 