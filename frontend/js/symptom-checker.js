// DOM Elements
const symptomForm = document.getElementById('symptom-form');
const symptomsInput = document.getElementById('symptoms-input');
const suggestionsContainer = document.getElementById('suggestions-container');
const chronicDiseasesCheckbox = document.getElementById('chronic-diseases');
const allergiesCheckbox = document.getElementById('allergies');
const loader = document.getElementById('loader');
const results = document.getElementById('results');
const conditionResult = document.getElementById('condition-result');
const medicinesResult = document.getElementById('medicines-result');
const precautionsResult = document.getElementById('precautions-result');
const alternativeResult = document.getElementById('alternative-result');
const saveResultsBtn = document.getElementById('save-results');
const shareResultsBtn = document.getElementById('share-results');
const issueCards = document.querySelectorAll('.issue-card');

// Common symptoms for autocomplete suggestions
const commonSymptoms = [
    'fever', 'headache', 'cough', 'sore throat', 'runny nose', 'fatigue',
    'chest pain', 'shortness of breath', 'abdominal pain', 'nausea', 'vomiting',
    'diarrhea', 'constipation', 'back pain', 'joint pain', 'muscle ache',
    'dizziness', 'fainting', 'rash', 'itching', 'swelling', 'numbness',
    'tingling', 'blurred vision', 'ear pain', 'nasal congestion', 'dry mouth',
    'excessive thirst', 'frequent urination', 'blood in urine', 'blood in stool',
    'weight loss', 'weight gain', 'loss of appetite', 'increased appetite',
    'insomnia', 'excessive sleepiness', 'anxiety', 'depression', 'mood swings'
];

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Set up input event listener for autocomplete
    if (symptomsInput) {
        symptomsInput.addEventListener('input', showSuggestions);
        symptomsInput.addEventListener('focus', showSuggestions);
        document.addEventListener('click', function(e) {
            if (e.target !== symptomsInput && e.target !== suggestionsContainer) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }
    
    // Form submission
    if (symptomForm) {
        symptomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            analyzeSymptoms();
        });
    }
    
    // Common issue cards
    issueCards.forEach(card => {
        const issueLink = card.querySelector('.issue-link');
        issueLink.addEventListener('click', function(e) {
            e.preventDefault();
            const symptom = card.getAttribute('data-symptom');
            symptomsInput.value = symptom;
            analyzeSymptoms();
            // Scroll to results section
            setTimeout(() => {
                results.scrollIntoView({ behavior: 'smooth' });
            }, 2500);
        });
    });
    
    // Save and share buttons
    if (saveResultsBtn) {
        saveResultsBtn.addEventListener('click', saveResults);
    }
    
    if (shareResultsBtn) {
        shareResultsBtn.addEventListener('click', shareResults);
    }
    
    // Check for stored search term from home page
    const searchTerm = sessionStorage.getItem('searchTerm');
    if (searchTerm) {
        symptomsInput.value = searchTerm;
        // Auto-submit if coming from search
        setTimeout(() => {
            analyzeSymptoms();
        }, 500);
        sessionStorage.removeItem('searchTerm');
    }
});

// Show autocomplete suggestions based on input
function showSuggestions() {
    const input = symptomsInput.value.toLowerCase();
    suggestionsContainer.innerHTML = '';
    
    if (input.length < 2) {
        suggestionsContainer.style.display = 'none';
        return;
    }
    
    const matchingSymptoms = commonSymptoms.filter(symptom => 
        symptom.toLowerCase().includes(input)
    ).slice(0, 5); // Limit to 5 suggestions
    
    if (matchingSymptoms.length > 0) {
        matchingSymptoms.forEach(symptom => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = symptom;
            
            suggestionItem.addEventListener('click', () => {
                symptomsInput.value = symptom;
                suggestionsContainer.style.display = 'none';
            });
            
            suggestionsContainer.appendChild(suggestionItem);
        });
        
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
}

// Analyze symptoms and get recommendations
function analyzeSymptoms() {
    const symptoms = symptomsInput.value.trim();
    
    if (!symptoms) {
        showNotification('Please enter your symptoms', 'error');
        return;
    }
    
    // Show loader and hide results
    loader.style.display = 'flex';
    results.style.display = 'none';
    
    // Simulate API call with a delay
    setTimeout(() => {
        // Get additional health information
        const hasChronicDiseases = chronicDiseasesCheckbox.checked;
        const hasAllergies = allergiesCheckbox.checked;
        
        // Get diagnosis from our "AI" (simulated)
        const diagnosis = getDiagnosis(symptoms, hasChronicDiseases, hasAllergies);
        
        // Display results
        displayResults(diagnosis);
        
        // Hide loader and show results
        loader.style.display = 'none';
        results.style.display = 'block';
        
        // Scroll to results
        results.scrollIntoView({ behavior: 'smooth' });
    }, 2000);
}

// Determine diagnosis based on symptoms (simulated AI analysis)
function getDiagnosis(symptoms, hasChronicDiseases, hasAllergies) {
    const symptomsLower = symptoms.toLowerCase();
    let condition = '';
    let medicines = [];
    let precautions = [];
    let alternatives = [];
    
    // Common Cold symptoms matching
    if (symptomsLower.includes('cold') || 
        (symptomsLower.includes('cough') && (symptomsLower.includes('runny nose') || symptomsLower.includes('congestion'))) ||
        (symptomsLower.includes('sore throat') && symptomsLower.includes('congestion'))) {
        
        condition = 'Common Cold';
        medicines = [
            { name: 'Paracetamol', dosage: '500-1000 mg every 4-6 hours', info: 'For fever and pain relief' },
            { name: 'Cetirizine', dosage: '10 mg once daily', info: 'For nasal congestion and runny nose' },
            { name: 'Throat lozenges', dosage: 'As needed', info: 'For sore throat relief' }
        ];
        precautions = [
            'Rest and stay hydrated',
            'Avoid spreading germs by washing hands frequently',
            'Use tissues when sneezing or coughing',
            'Consult a doctor if symptoms worsen or last longer than a week'
        ];
        alternatives = [
            'Honey and warm lemon water for sore throat',
            'Steam inhalation for congestion',
            'Saltwater gargle for throat irritation',
            'Hot chicken soup can help with nasal congestion'
        ];
    }
    // Headache/Migraine
    else if (symptomsLower.includes('headache') || symptomsLower.includes('migraine')) {
        condition = 'Tension Headache/Migraine';
        medicines = [
            { name: 'Ibuprofen', dosage: '400 mg every 4-6 hours', info: 'Anti-inflammatory pain reliever' },
            { name: 'Paracetamol', dosage: '500-1000 mg every 4-6 hours', info: 'For pain relief' },
            { name: 'Sumatriptan', dosage: '50 mg at onset (for diagnosed migraines)', info: 'For migraine-specific relief' }
        ];
        precautions = [
            'Rest in a quiet, dark room',
            'Apply cold compress to forehead',
            'Maintain regular sleep schedule',
            'Avoid known triggers (certain foods, stress, etc.)',
            'Seek medical attention for severe or recurring headaches'
        ];
        alternatives = [
            'Peppermint oil applied to temples',
            'Meditation and deep breathing exercises',
            'Regular exercise to reduce frequency',
            'Acupressure or massage therapy'
        ];
    }
    // Fever
    else if (symptomsLower.includes('fever') || symptomsLower.includes('high temperature')) {
        condition = 'Fever';
        medicines = [
            { name: 'Paracetamol', dosage: '500-1000 mg every 4-6 hours', info: 'Reduces fever and relieves pain' },
            { name: 'Ibuprofen', dosage: '400 mg every 6-8 hours', info: 'Anti-inflammatory, reduces fever' }
        ];
        precautions = [
            'Stay hydrated by drinking plenty of fluids',
            'Rest and avoid strenuous activity',
            'Use light clothing and bedding',
            'Take lukewarm baths or use cold compresses',
            'Seek medical attention for fever above 103°F (39.4°C) or lasting more than 3 days'
        ];
        alternatives = [
            'Stay well-hydrated with water and electrolyte drinks',
            'Herbal teas like ginger or chamomile',
            'Lukewarm sponge bath to reduce temperature',
            'Resting in a comfortable, cool environment'
        ];
    }
    // Digestive issues
    else if (symptomsLower.includes('stomach') || 
             symptomsLower.includes('nausea') || 
             symptomsLower.includes('vomiting') || 
             symptomsLower.includes('diarrhea') || 
             symptomsLower.includes('constipation') || 
             symptomsLower.includes('indigestion')) {
        
        condition = 'Digestive Discomfort';
        medicines = [
            { name: 'Omeprazole', dosage: '20 mg once daily', info: 'For acid reflux and indigestion' },
            { name: 'Loperamide', dosage: '2 mg after each loose stool (max 8 mg/day)', info: 'For diarrhea' },
            { name: 'Bismuth subsalicylate', dosage: '30 ml or 2 tablets every 30-60 min as needed', info: 'For nausea and upset stomach' }
        ];
        precautions = [
            'Stay hydrated, especially with diarrhea or vomiting',
            'Eat small, bland meals',
            'Avoid spicy, fatty, or dairy-rich foods',
            'Seek medical attention for severe pain, blood in stool, or symptoms lasting more than 48 hours'
        ];
        alternatives = [
            'Ginger tea for nausea',
            'Peppermint tea for indigestion',
            'BRAT diet (Bananas, Rice, Applesauce, Toast) for diarrhea',
            'Probiotic-rich foods like yogurt',
            'Fiber-rich foods for constipation'
        ];
    }
    // Allergies
    else if (symptomsLower.includes('allergy') || 
             symptomsLower.includes('itching') || 
             symptomsLower.includes('rash') || 
             (symptomsLower.includes('runny nose') && symptomsLower.includes('itchy eyes'))) {
        
        condition = 'Allergic Reaction';
        medicines = [
            { name: 'Cetirizine', dosage: '10 mg once daily', info: 'Non-drowsy antihistamine' },
            { name: 'Diphenhydramine', dosage: '25-50 mg every 4-6 hours', info: 'May cause drowsiness' },
            { name: 'Hydrocortisone cream', dosage: 'Apply to affected areas 2-3 times daily', info: 'For skin rashes and itching' }
        ];
        precautions = [
            'Identify and avoid the allergen if possible',
            'Keep track of symptoms and potential triggers',
            'Use air purifiers for indoor allergies',
            'Seek immediate medical attention for severe reactions, difficulty breathing, or facial swelling'
        ];
        alternatives = [
            'Saline nasal rinse for nasal allergies',
            'Cold compress for itchy eyes or skin',
            'Oatmeal bath for skin irritation',
            'Local honey for seasonal allergies (controversial)'
        ];
    }
    // Anxiety/Stress
    else if (symptomsLower.includes('anxiety') || 
             symptomsLower.includes('stress') || 
             symptomsLower.includes('panic') || 
             symptomsLower.includes('worried')) {
        
        condition = 'Anxiety/Stress';
        medicines = [
            { name: 'Note:', dosage: '', info: 'Medication for anxiety should only be taken under professional supervision' },
            { name: 'Chamomile tea', dosage: '1-2 cups as needed', info: 'Mild natural calming effect' },
            { name: 'Valerian root supplement', dosage: 'As directed on package', info: 'Natural remedy for anxiety and insomnia' }
        ];
        precautions = [
            'Practice regular stress management techniques',
            'Maintain regular sleep schedule',
            'Consider professional counseling or therapy',
            'Avoid excessive caffeine and alcohol',
            'Consult a healthcare provider for persistent anxiety'
        ];
        alternatives = [
            'Deep breathing exercises',
            'Progressive muscle relaxation',
            'Regular physical exercise',
            'Mindfulness meditation',
            'Spending time in nature'
        ];
    }
    // Default/Unknown symptoms
    else {
        condition = 'Unspecified Symptoms';
        medicines = [
            { name: 'Consult a doctor', dosage: 'N/A', info: 'Your symptoms require professional medical evaluation' }
        ];
        precautions = [
            'Monitor your symptoms and keep a detailed log',
            'Rest and stay hydrated',
            'Avoid self-medication without proper diagnosis',
            'Consult with a healthcare professional as soon as possible'
        ];
        alternatives = [
            'Focus on general wellness practices while awaiting medical consultation',
            'Ensure adequate rest and hydration',
            'Maintain a balanced diet',
            'Avoid strenuous activities until diagnosis'
        ];
    }
    
    // Adjust recommendations based on chronic diseases
    if (hasChronicDiseases) {
        precautions.unshift('IMPORTANT: Due to your chronic condition, consult your doctor before taking any medication');
        
        // Add warning to medicines
        medicines.forEach(med => {
            med.info += ' (Consult your doctor first due to your chronic condition)';
        });
    }
    
    // Adjust recommendations based on allergies
    if (hasAllergies) {
        precautions.unshift('IMPORTANT: Due to your allergies, check for allergens in any medication');
    }
    
    return {
        condition,
        medicines,
        precautions,
        alternatives
    };
}

// Display diagnosis results
function displayResults(diagnosis) {
    // Clear previous results
    conditionResult.innerHTML = '';
    medicinesResult.innerHTML = '';
    precautionsResult.innerHTML = '';
    alternativeResult.innerHTML = '';
    
    // Display condition
    conditionResult.innerHTML = `
        <h4>${diagnosis.condition}</h4>
        <p>Based on the symptoms you described, this appears to be the most likely condition.</p>
    `;
    
    // Display medicines
    if (diagnosis.medicines.length > 0) {
        const medicinesList = document.createElement('ul');
        medicinesList.className = 'medicines-list';
        
        diagnosis.medicines.forEach(medicine => {
            const medicineItem = document.createElement('li');
            medicineItem.className = 'medicine-item';
            
            medicineItem.innerHTML = `
                <div class="medicine-name">${medicine.name}</div>
                ${medicine.dosage ? `<div class="medicine-dosage">Dosage: ${medicine.dosage}</div>` : ''}
                <div class="medicine-info">${medicine.info}</div>
            `;
            
            medicinesList.appendChild(medicineItem);
        });
        
        medicinesResult.appendChild(medicinesList);
    } else {
        medicinesResult.innerHTML = '<p>No specific medications are recommended. Please consult a healthcare professional.</p>';
    }
    
    // Display precautions
    if (diagnosis.precautions.length > 0) {
        const precautionsList = document.createElement('ul');
        
        diagnosis.precautions.forEach(precaution => {
            const precautionItem = document.createElement('li');
            precautionItem.className = 'precaution-item';
            precautionItem.textContent = precaution;
            precautionsList.appendChild(precautionItem);
        });
        
        precautionsResult.appendChild(precautionsList);
    } else {
        precautionsResult.innerHTML = '<p>No specific precautions are recommended.</p>';
    }
    
    // Display alternatives
    if (diagnosis.alternatives.length > 0) {
        const alternativesList = document.createElement('ul');
        
        diagnosis.alternatives.forEach(alternative => {
            const alternativeItem = document.createElement('li');
            alternativeItem.className = 'alternative-item';
            alternativeItem.textContent = alternative;
            alternativesList.appendChild(alternativeItem);
        });
        
        alternativeResult.appendChild(alternativesList);
    } else {
        alternativeResult.innerHTML = '<p>No alternative remedies are recommended.</p>';
    }
}

// Save results functionality
function saveResults() {
    // For a real application, you would save to a database
    // For this demo, we'll use local storage
    
    const savedResults = {
        date: new Date().toLocaleString(),
        symptoms: symptomsInput.value,
        condition: document.querySelector('#condition-result h4')?.textContent || '',
        chronicDiseases: chronicDiseasesCheckbox.checked,
        allergies: allergiesCheckbox.checked
    };
    
    // Get existing saved results or initialize empty array
    const existingResults = JSON.parse(localStorage.getItem('savedResults') || '[]');
    
    // Add new results
    existingResults.push(savedResults);
    
    // Save back to local storage
    localStorage.setItem('savedResults', JSON.stringify(existingResults));
    
    showNotification('Results saved successfully!', 'success');
}

// Share results functionality
function shareResults() {
    // In a real application, this would generate a shareable link or email
    // For this demo, we'll just show a notification
    
    showNotification('Sharing functionality would be implemented here in a real application.', 'info');
}

// Show notification
function showNotification(message, type) {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    // If it doesn't exist, create it
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <p>${message}</p>
        <span class="notification-close">&times;</span>
    `;
    
    // Add notification to container
    notificationContainer.appendChild(notification);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('fadeOut');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fadeOut');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
} 