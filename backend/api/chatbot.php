<?php
header('Content-Type: application/json');
require_once '../db.php';

// Function to analyze symptoms and provide response
function analyzeSymptoms($symptoms) {
    // Convert symptoms to lowercase for better matching
    $symptoms = strtolower($symptoms);
    
    // Common symptoms and their possible conditions
    $symptomPatterns = [
        'fever' => [
            'condition' => 'Fever',
            'severity' => 'moderate',
            'advice' => 'Monitor your temperature. If it exceeds 38°C (100.4°F) or persists for more than 3 days, consult a doctor.',
            'medications' => ['Paracetamol', 'Ibuprofen'],
            'precautions' => ['Stay hydrated', 'Get plenty of rest', 'Use a cold compress']
        ],
        'headache' => [
            'condition' => 'Headache',
            'severity' => 'mild',
            'advice' => 'Rest in a quiet, dark room. If pain persists or worsens, seek medical attention.',
            'medications' => ['Paracetamol', 'Ibuprofen'],
            'precautions' => ['Stay hydrated', 'Avoid bright lights', 'Reduce screen time']
        ],
        'cough' => [
            'condition' => 'Cough',
            'severity' => 'mild',
            'advice' => 'If cough persists for more than 2 weeks or is accompanied by fever, consult a doctor.',
            'medications' => ['Cough syrup', 'Honey and lemon'],
            'precautions' => ['Stay hydrated', 'Use a humidifier', 'Avoid irritants']
        ],
        'stomach pain' => [
            'condition' => 'Stomach Pain',
            'severity' => 'moderate',
            'advice' => 'If pain is severe or accompanied by vomiting/diarrhea, seek medical attention.',
            'medications' => ['Antacids', 'Pepto-Bismol'],
            'precautions' => ['Eat light foods', 'Stay hydrated', 'Avoid spicy foods']
        ]
    ];

    // Check for emergency keywords
    $emergencyKeywords = ['chest pain', 'difficulty breathing', 'severe pain', 'unconscious', 'bleeding'];
    foreach ($emergencyKeywords as $keyword) {
        if (strpos($symptoms, $keyword) !== false) {
            return [
                'type' => 'emergency',
                'message' => 'This appears to be an emergency. Please call emergency services immediately or go to the nearest hospital.',
                'condition' => 'Emergency',
                'severity' => 'critical',
                'advice' => 'Seek immediate medical attention.',
                'medications' => [],
                'precautions' => ['Call emergency services', 'Stay calm', 'Follow emergency operator instructions']
            ];
        }
    }

    // Match symptoms with known patterns
    $matchedConditions = [];
    foreach ($symptomPatterns as $pattern => $data) {
        if (strpos($symptoms, $pattern) !== false) {
            $matchedConditions[] = $data;
        }
    }

    if (empty($matchedConditions)) {
        return [
            'type' => 'general',
            'message' => 'I understand you\'re experiencing symptoms. Could you please provide more details about your symptoms?',
            'condition' => 'Unknown',
            'severity' => 'unknown',
            'advice' => 'Please provide more specific symptoms for better analysis.',
            'medications' => [],
            'precautions' => []
        ];
    }

    // If multiple conditions are matched, combine the information
    $response = [
        'type' => 'analysis',
        'message' => 'Based on your symptoms, here\'s what I found:',
        'conditions' => $matchedConditions,
        'general_advice' => 'Monitor your symptoms and seek medical attention if they worsen.',
        'precautions' => ['Stay hydrated', 'Get plenty of rest', 'Monitor symptoms']
    ];

    return $response;
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['message'])) {
        echo json_encode(['error' => 'No message provided']);
        exit;
    }

    $userMessage = $data['message'];
    $response = analyzeSymptoms($userMessage);

    // Log the interaction in the database
    try {
        $stmt = $pdo->prepare("INSERT INTO chat_logs (user_message, bot_response, created_at) VALUES (?, ?, NOW())");
        $stmt->execute([$userMessage, json_encode($response)]);
    } catch (PDOException $e) {
        // Log error but don't fail the request
        error_log("Database error: " . $e->getMessage());
    }

    echo json_encode($response);
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?> 