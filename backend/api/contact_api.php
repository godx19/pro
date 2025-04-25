<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        echo json_encode(['success' => false, 'message' => 'Invalid data']);
        exit;
    }

    $name = filter_var($data['name'], FILTER_SANITIZE_STRING);
    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $subject = filter_var($data['subject'], FILTER_SANITIZE_STRING);
    $message = filter_var($data['message'], FILTER_SANITIZE_STRING);
    $newsletter = isset($data['newsletter']) ? 1 : 0;

    if (!$name || !$email || !$subject || !$message) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, subject, message, newsletter, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$name, $email, $subject, $message, $newsletter]);
        
        // Send email notification
        $to = "mediguide1@gmail.com";
        $headers = "From: $email\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        
        $emailBody = "
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Subject:</strong> $subject</p>
            <p><strong>Message:</strong></p>
            <p>$message</p>
            <p><strong>Newsletter Subscription:</strong> " . ($newsletter ? 'Yes' : 'No') . "</p>
        ";
        
        mail($to, "New Contact Form Submission: $subject", $emailBody, $headers);
        
        echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Database error occurred']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
} 