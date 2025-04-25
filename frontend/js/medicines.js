// DOM Elements
const medicineSearch = document.getElementById('medicine-search');
const categoryFilter = document.getElementById('medicine-category');
const formFilter = document.getElementById('medicine-form');
const medicineGrid = document.getElementById('medicine-grid');
const resultsTitle = document.getElementById('results-title');
const countNumber = document.getElementById('count-number');
const loadMoreBtn = document.getElementById('load-more-btn');
const medicineModal = document.getElementById('medicine-modal');
const closeModal = document.querySelector('.close-modal');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const categoryLinks = document.querySelectorAll('.category-link');
const saveMedicineBtn = document.getElementById('save-medicine');
const printMedicineBtn = document.getElementById('print-medicine');

// Medicine data
const medicinesData = {
    aspirin: {
        name: 'Aspirin',
        category: 'Pain Relief',
        form: 'Tablet',
        overview: 'Aspirin is the genericized trademark for acetylsalicylic acid, a nonsteroidal anti-inflammatory drug used to reduce pain, fever, and inflammation, and as an antithrombotic. Specific inflammatory conditions that aspirin is used to treat include Kawasaki disease, pericarditis, and rheumatic fever.',
        prescription: 'Over-the-counter',
        drugClass: 'NSAID, Antiplatelet',
        storage: 'Store at room temperature, away from moisture and heat',
        dosage: {
            adults: '325-650 mg every 4-6 hours as needed',
            children: 'Not recommended for children under 12 years',
            elderly: 'Use with caution, may need lower dose'
        },
        sideEffects: {
            common: ['Stomach pain', 'Heartburn', 'Nausea'],
            uncommon: ['Ringing in ears', 'Dizziness', 'Headache'],
            rare: ['Severe stomach bleeding', 'Allergic reaction', 'Liver problems']
        },
        precautions: {
            contraindications: ['Allergy to aspirin', 'Bleeding disorders', 'Stomach ulcers'],
            interactions: ['Blood thinners', 'Other NSAIDs', 'Alcohol'],
            specialPopulations: ['Pregnant women', 'Breastfeeding mothers', 'People with asthma']
        },
        alternatives: [
            {
                name: 'Ibuprofen',
                description: 'Alternative NSAID with similar pain-relieving properties'
            },
            {
                name: 'Acetaminophen',
                description: 'Pain reliever without anti-inflammatory effects'
            }
        ]
    },
    hydrocodone: {
        name: 'Hydrocodone',
        category: 'Pain Relief',
        form: 'Tablet',
        overview: 'Hydrocodone is an opioid medication used to treat severe pain. It is often combined with acetaminophen or ibuprofen for enhanced pain relief. It works by changing how the brain and nervous system respond to pain.',
        prescription: 'Prescription required',
        drugClass: 'Opioid Analgesic',
        storage: 'Store at room temperature, away from moisture and heat. Keep in a secure location.',
        dosage: {
            adults: '5-10 mg every 4-6 hours as needed',
            children: 'Not recommended for children under 18 years',
            elderly: 'Use with caution, may need lower dose'
        },
        sideEffects: {
            common: ['Drowsiness', 'Nausea', 'Constipation'],
            uncommon: ['Dizziness', 'Headache', 'Dry mouth'],
            rare: ['Severe breathing problems', 'Addiction', 'Liver damage']
        },
        precautions: {
            contraindications: ['Respiratory depression', 'Acute asthma', 'Paralytic ileus'],
            interactions: ['Alcohol', 'Other opioids', 'Benzodiazepines'],
            specialPopulations: ['Pregnant women', 'People with liver disease', 'Elderly patients']
        },
        alternatives: [
            {
                name: 'Oxycodone',
                description: 'Similar opioid medication for pain relief'
            },
            {
                name: 'Tramadol',
                description: 'Less potent opioid alternative'
            }
        ]
    }
};

let currentMedicines = [];
let currentPage = 1;
const itemsPerPage = 8;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page with all medicines
    currentMedicines = [...medicinesData];
    filterMedicines();
    displayMedicines();
    
    // Set up search functionality
    if (medicineSearch) {
        medicineSearch.addEventListener('input', filterMedicines);
    }
    
    // Set up filter functionality
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterMedicines);
    }
    
    if (formFilter) {
        formFilter.addEventListener('change', filterMedicines);
    }
    
    // Set up load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreMedicines);
    }
    
    // Set up modal close
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            medicineModal.style.display = 'none';
        });
    }
    
    // Set up tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Set up category links
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            categoryFilter.value = category;
            filterMedicines();
            
            // Scroll to results
            document.querySelector('.medicine-results').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Set up save medicine button
    if (saveMedicineBtn) {
        saveMedicineBtn.addEventListener('click', saveMedicine);
    }
    
    // Set up print medicine button
    if (printMedicineBtn) {
        printMedicineBtn.addEventListener('click', printMedicineInfo);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === medicineModal) {
            medicineModal.style.display = 'none';
        }
    });
});

// Filter medicines based on search and filter options
function filterMedicines() {
    const searchTerm = medicineSearch.value.toLowerCase();
    const category = categoryFilter.value;
    const form = formFilter.value;
    
    currentMedicines = medicinesData.filter(medicine => {
        // Search term filter
        const matchesSearch = medicine.name.toLowerCase().includes(searchTerm) || 
                             medicine.overview.toLowerCase().includes(searchTerm);
        
        // Category filter
        const matchesCategory = category === 'all' || medicine.category === category;
        
        // Form filter
        const matchesForm = form === 'all' || medicine.form === form;
        
        return matchesSearch && matchesCategory && matchesForm;
    });
    
    // Update title and count
    if (category !== 'all') {
        const categoryName = categoryFilter.options[categoryFilter.selectedIndex].text;
        resultsTitle.textContent = categoryName;
    } else {
        resultsTitle.textContent = 'All Medicines';
    }
    
    countNumber.textContent = currentMedicines.length;
    
    // Reset to first page and display
    currentPage = 1;
    displayMedicines();
}

// Display medicines on the grid
function displayMedicines() {
    // Clear existing content
    medicineGrid.innerHTML = '';
    
    // Calculate start and end index for current page
    const startIndex = 0;
    const endIndex = Math.min(currentPage * itemsPerPage, currentMedicines.length);
    const displayedMedicines = currentMedicines.slice(startIndex, endIndex);
    
    // Display medicines
    displayedMedicines.forEach(medicine => {
        const medicineCard = document.createElement('div');
        medicineCard.className = 'medicine-card';
        medicineCard.setAttribute('data-category', medicine.category);
        medicineCard.setAttribute('data-form', medicine.form);
        
        medicineCard.innerHTML = `
            <div class="medicine-icon">
                <i class="${medicine.icon}"></i>
            </div>
            <h3>${medicine.name}</h3>
            <p class="medicine-category">${medicine.displayCategory}</p>
            <p class="medicine-form">${medicine.form.charAt(0).toUpperCase() + medicine.form.slice(1)}</p>
            <button class="view-details-btn" data-medicine="${medicine.id}">View Details</button>
        `;
        
        // Add click event for details button
        medicineCard.querySelector('.view-details-btn').addEventListener('click', () => {
            openMedicineDetails(medicine.id);
        });
        
        medicineGrid.appendChild(medicineCard);
    });
    
    // Show/hide load more button
    if (endIndex >= currentMedicines.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// Load more medicines function
function loadMoreMedicines() {
    currentPage++;
    displayMedicines();
}

// Open medicine details modal
function openMedicineDetails(medicineId) {
    // Find the medicine
    const medicine = medicinesData.find(med => med.id === medicineId);
    
    if (!medicine) return;
    
    // Update modal content
    document.getElementById('modal-medicine-name').textContent = medicine.name;
    document.getElementById('modal-medicine-category').textContent = medicine.displayCategory;
    document.getElementById('modal-overview').textContent = medicine.overview;
    document.getElementById('modal-form').textContent = medicine.form.charAt(0).toUpperCase() + medicine.form.slice(1);
    document.getElementById('modal-prescription').textContent = medicine.prescription;
    document.getElementById('modal-drug-class').textContent = medicine.drugClass;
    document.getElementById('modal-storage').textContent = medicine.storage;
    
    // Update dosage information
    const dosageContent = document.getElementById('modal-dosage');
    dosageContent.innerHTML = '';
    
    const adultsDosage = document.createElement('div');
    adultsDosage.className = 'dosage-group';
    adultsDosage.innerHTML = `<h4>Adults</h4><p>${medicine.dosage.adults}</p>`;
    dosageContent.appendChild(adultsDosage);
    
    const childrenDosage = document.createElement('div');
    childrenDosage.className = 'dosage-group';
    childrenDosage.innerHTML = `<h4>Children</h4><p>${medicine.dosage.children}</p>`;
    dosageContent.appendChild(childrenDosage);
    
    const elderlyDosage = document.createElement('div');
    elderlyDosage.className = 'dosage-group';
    elderlyDosage.innerHTML = `<h4>Elderly</h4><p>${medicine.dosage.elderly}</p>`;
    dosageContent.appendChild(elderlyDosage);
    
    // Update side effects
    const sideEffectsContent = document.getElementById('modal-side-effects');
    sideEffectsContent.innerHTML = '';
    
    const commonEffects = document.createElement('div');
    commonEffects.className = 'side-effects-group';
    commonEffects.innerHTML = `
        <h4>Common (1% to 10%)</h4>
        <ul>
            ${medicine.sideEffects.common.map(effect => `<li>${effect}</li>`).join('')}
        </ul>
    `;
    sideEffectsContent.appendChild(commonEffects);
    
    const uncommonEffects = document.createElement('div');
    uncommonEffects.className = 'side-effects-group';
    uncommonEffects.innerHTML = `
        <h4>Uncommon (0.1% to 1%)</h4>
        <ul>
            ${medicine.sideEffects.uncommon.map(effect => `<li>${effect}</li>`).join('')}
        </ul>
    `;
    sideEffectsContent.appendChild(uncommonEffects);
    
    const rareEffects = document.createElement('div');
    rareEffects.className = 'side-effects-group';
    rareEffects.innerHTML = `
        <h4>Rare (less than 0.1%)</h4>
        <ul>
            ${medicine.sideEffects.rare.map(effect => `<li>${effect}</li>`).join('')}
        </ul>
    `;
    sideEffectsContent.appendChild(rareEffects);
    
    // Update precautions
    const precautionsContent = document.getElementById('modal-precautions');
    precautionsContent.innerHTML = '';
    
    const contraindications = document.createElement('div');
    contraindications.className = 'precautions-group';
    contraindications.innerHTML = `
        <h4>Who should not take this medicine</h4>
        <ul>
            ${medicine.precautions.contraindications.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;
    precautionsContent.appendChild(contraindications);
    
    const interactions = document.createElement('div');
    interactions.className = 'precautions-group';
    interactions.innerHTML = `
        <h4>Interactions with other medicines</h4>
        <ul>
            ${medicine.precautions.interactions.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;
    precautionsContent.appendChild(interactions);
    
    const specialPop = document.createElement('div');
    specialPop.className = 'precautions-group';
    specialPop.innerHTML = `
        <h4>Special populations</h4>
        <ul>
            ${medicine.precautions.specialPopulations.map(item => `<li>${item}</li>`).join('')}
        </ul>
    `;
    precautionsContent.appendChild(specialPop);
    
    // Update alternatives
    const alternativesContent = document.getElementById('modal-alternatives');
    alternativesContent.innerHTML = '';
    
    const alternativesList = document.createElement('div');
    alternativesList.className = 'alternatives-list';
    
    medicine.alternatives.forEach(alt => {
        const altItem = document.createElement('div');
        altItem.className = 'alternative-item';
        altItem.innerHTML = `
            <div class="alt-icon"><i class="fas fa-pills"></i></div>
            <div class="alt-info">
                <h4>${alt.name}</h4>
                <p>${alt.description}</p>
            </div>
        `;
        alternativesList.appendChild(altItem);
    });
    
    alternativesContent.appendChild(alternativesList);
    
    // Show the first tab
    switchTab('overview');
    
    // Show the modal
    medicineModal.style.display = 'block';
}

// Switch between tabs in the modal
function switchTab(tabId) {
    // Hide all tab contents
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Deactivate all tab buttons
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // Show the selected tab content
    document.getElementById(tabId).style.display = 'block';
    
    // Activate the corresponding tab button
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
}

// Save medicine to favorites
function saveMedicine() {
    const medicineName = document.getElementById('modal-medicine-name').textContent;
    
    // In a real app, this would save to a database or localStorage
    // For this demo, we'll show a notification
    showNotification(`${medicineName} has been saved to your favorites!`, 'success');
}

// Print medicine information
function printMedicineInfo() {
    const medicineName = document.getElementById('modal-medicine-name').textContent;
    
    // In a real app, this would format the data for printing
    // For this demo, we'll just show a notification
    showNotification(`Print functionality would be implemented here in a real application.`, 'info');
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