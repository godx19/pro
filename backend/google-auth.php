<?php
require_once 'vendor/autoload.php';

// Google OAuth configuration
$clientID = 'YOUR_GOOGLE_CLIENT_ID';
$clientSecret = 'YOUR_GOOGLE_CLIENT_SECRET';
$redirectUri = 'http://localhost/backend/google-callback.php';

// Create Google Client
$client = new Google_Client();
$client->setClientId($clientID);
$client->setClientSecret($clientSecret);
$client->setRedirectUri($redirectUri);
$client->addScope('email');
$client->addScope('profile');

// Generate authentication URL
$authUrl = $client->createAuthUrl();

// Redirect to Google's consent screen
header('Location: ' . $authUrl);
exit;
?> 