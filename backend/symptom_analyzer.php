<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Define diseases and their symptoms
$diseases = [
    'Common Cold' => [
        'symptoms' => ['cough', 'sore throat', 'runny nose', 'congestion', 'sneezing', 'fever', 'headache', 'fatigue'],
        'medicines' => [
            [
                'name' => 'Paracetamol',
                'description' => 'Pain reliever and fever reducer',
                'dosage' => '500-1000 mg every 4-6 hours',
                'side_effects' => 'Nausea, stomach pain, liver damage (with overdose)',
                'precautions' => 'Do not exceed 4000 mg per day'
            ],
            [
                'name' => 'Cetirizine',
                'description' => 'Antihistamine for allergy relief',
                'dosage' => '10 mg once daily',
                'side_effects' => 'Drowsiness, dry mouth, fatigue',
                'precautions' => 'Avoid alcohol, may cause drowsiness'
            ]
        ]
    ],
    'Influenza' => [
        'symptoms' => ['fever', 'cough', 'sore throat', 'body aches', 'headache', 'fatigue', 'chills', 'runny nose'],
        'medicines' => [
            [
                'name' => 'Oseltamivir',
                'description' => 'Antiviral medication for influenza',
                'dosage' => '75 mg twice daily for 5 days',
                'side_effects' => 'Nausea, vomiting, headache',
                'precautions' => 'Start within 48 hours of symptoms'
            ],
            [
                'name' => 'Ibuprofen',
                'description' => 'Pain reliever and fever reducer',
                'dosage' => '200-400 mg every 4-6 hours',
                'side_effects' => 'Stomach pain, heartburn, dizziness',
                'precautions' => 'Take with food, avoid alcohol'
            ]
        ]
    ],
    'Allergic Rhinitis' => [
        'symptoms' => ['sneezing', 'runny nose', 'itchy eyes', 'congestion', 'postnasal drip', 'watery eyes'],
        'medicines' => [
            [
                'name' => 'Loratadine',
                'description' => 'Antihistamine for allergy relief',
                'dosage' => '10 mg once daily',
                'side_effects' => 'Headache, dry mouth, fatigue',
                'precautions' => 'May cause drowsiness'
            ],
            [
                'name' => 'Fluticasone',
                'description' => 'Nasal spray for allergy symptoms',
                'dosage' => '2 sprays in each nostril once daily',
                'side_effects' => 'Nasal irritation, headache',
                'precautions' => 'Shake well before use'
            ]
        ]
    ],
    'Gastroenteritis' => [
        'symptoms' => ['diarrhea', 'nausea', 'vomiting', 'stomach pain', 'fever', 'loss of appetite'],
        'medicines' => [
            [
                'name' => 'Loperamide',
                'description' => 'Anti-diarrheal medication',
                'dosage' => '2 mg after each loose stool',
                'side_effects' => 'Constipation, dizziness',
                'precautions' => 'Stay hydrated'
            ],
            [
                'name' => 'Oral Rehydration Solution',
                'description' => 'Electrolyte replacement',
                'dosage' => 'As needed to maintain hydration',
                'side_effects' => 'None',
                'precautions' => 'Follow package instructions'
            ]
        ]
    ],
    'Migraine' => [
        'symptoms' => ['severe headache', 'nausea', 'vomiting', 'sensitivity to light', 'sensitivity to sound', 'aura'],
        'medicines' => [
            [
                'name' => 'Sumatriptan',
                'description' => 'Migraine-specific pain reliever',
                'dosage' => '50-100 mg at onset of migraine',
                'side_effects' => 'Dizziness, chest tightness',
                'precautions' => 'Do not exceed 200 mg in 24 hours'
            ],
            [
                'name' => 'Naproxen',
                'description' => 'Anti-inflammatory pain reliever',
                'dosage' => '500 mg at onset, then 250 mg every 6-8 hours',
                'side_effects' => 'Stomach pain, heartburn',
                'precautions' => 'Take with food'
            ]
        ]
    ]
];

// Function to preprocess symptoms
function preprocessSymptoms($symptoms) {
    // Convert to lowercase and remove special characters
    $symptoms = strtolower($symptoms);
    $symptoms = preg_replace('/[^a-z\s]/', '', $symptoms);
    
    // Split into array and remove empty values
    $symptoms = array_filter(explode(' ', $symptoms));
    
    // Remove common stop words
    $stopWords = ['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
    $symptoms = array_diff($symptoms, $stopWords);
    
    return array_values($symptoms);
}

// Function to calculate symptom match score
function calculateMatchScore($userSymptoms, $diseaseSymptoms) {
    $score = 0;
    foreach ($userSymptoms as $symptom) {
        if (in_array($symptom, $diseaseSymptoms)) {
            $score++;
        }
    }
    return $score;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['symptoms']) || empty($data['symptoms'])) {
    echo json_encode([
        'error' => true,
        'message' => 'Please provide symptoms'
    ]);
    exit;
}

// Preprocess user symptoms
$userSymptoms = preprocessSymptoms($data['symptoms']);

// Find best matching disease
$bestMatch = null;
$bestScore = 0;

foreach ($diseases as $diseaseName => $diseaseData) {
    $score = calculateMatchScore($userSymptoms, $diseaseData['symptoms']);
    if ($score > $bestScore) {
        $bestScore = $score;
        $bestMatch = [
            'disease' => $diseaseName,
            'symptoms' => $diseaseData['symptoms'],
            'medicines' => $diseaseData['medicines']
        ];
    }
}

// Prepare response
if ($bestScore > 0) {
    echo json_encode([
        'error' => false,
        'match_score' => $bestScore,
        'disease' => $bestMatch['disease'],
        'matched_symptoms' => array_intersect($userSymptoms, $bestMatch['symptoms']),
        'medicines' => $bestMatch['medicines']
    ]);
} else {
    echo json_encode([
        'error' => true,
        'message' => 'No matching disease found for the provided symptoms. Please consult a healthcare professional.'
    ]);
}
?> 