// DOM Elements
const contactForm = document.getElementById('contact-form');
const faqItems = document.querySelectorAll('.faq-item');
const chatBot = document.getElementById('chat-bot');
const chatBotToggle = document.getElementById('chat-bot-toggle');
const closeChat = document.getElementById('close-chat');
const chatMessages = document.getElementById('chat-messages');
const chatInputField = document.getElementById('chat-input-field');
const sendChatBtn = document.getElementById('send-chat');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Contact Form Submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // FAQ Accordion
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            toggleFAQ(item);
        });
    });
    
    // Chat Bot Toggle
    if (chatBotToggle) {
        chatBotToggle.addEventListener('click', toggleChatBot);
    }
    
    // Close Chat
    if (closeChat) {
        closeChat.addEventListener('click', toggleChatBot);
    }
    
    // Send Chat Message
    if (sendChatBtn) {
        sendChatBtn.addEventListener('click', sendMessage);
        
        // Also send message when pressing Enter in the input field
        chatInputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Handle Contact Form Submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const newsletter = document.getElementById('newsletter').checked;
    
    // In a real application, you would send this data to a server
    // For this demo, we'll just simulate a successful submission
    
    // Simple validation
    if (!name || !email || !subject || !message) {
        alert('Please fill out all required fields.');
        return;
    }
    
    // Simulate sending data to server with a delay
    const submitBtn = contactForm.querySelector('.submit-btn');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        
        // Reset form
        contactForm.reset();
        
        // Reset button
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
    }, 1500);
}

// Toggle FAQ Accordion
function toggleFAQ(item) {
    // Check if this item is already active
    const isActive = item.classList.contains('active');
    
    // Close all FAQs
    faqItems.forEach(faq => {
        faq.classList.remove('active');
        const icon = faq.querySelector('.toggle-icon i');
        icon.className = 'fas fa-plus';
    });
    
    // If the clicked item wasn't active, open it
    if (!isActive) {
        item.classList.add('active');
        const icon = item.querySelector('.toggle-icon i');
        icon.className = 'fas fa-minus';
    }
}

// Toggle Chat Bot
function toggleChatBot() {
    if (chatBot.style.display === 'block') {
        chatBot.style.display = 'none';
    } else {
        chatBot.style.display = 'block';
        chatInputField.focus();
    }
}

// Send Chat Message
function sendMessage() {
    const messageText = chatInputField.value.trim();
    
    if (!messageText) return;
    
    // Add user message to chat
    addMessage(messageText, 'user');
    
    // Clear input field
    chatInputField.value = '';
    
    // Simulate bot response after a short delay
    setTimeout(() => {
        const botResponse = getBotResponse(messageText);
        addMessage(botResponse, 'bot');
    }, 1000);
}

// Add Message to Chat
function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (sender === 'user') {
        messageElement.classList.add('user-message');
    } else {
        messageElement.classList.add('bot-message');
    }
    
    messageElement.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom of chat
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get Bot Response
function getBotResponse(message) {
    // Convert message to lowercase for easier matching
    const lowerMessage = message.toLowerCase();
    
    // Simple keyword matching for responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return 'Hello! How can I help you today?';
    }
    else if (lowerMessage.includes('symptom') || lowerMessage.includes('sick') || lowerMessage.includes('not feeling well')) {
        return 'I can help you check your symptoms. Please visit our Symptom Checker page for a detailed analysis.';
    }
    else if (lowerMessage.includes('medicine') || lowerMessage.includes('drug') || lowerMessage.includes('medication')) {
        return 'You can find detailed information about different medicines in our Medicines section. Is there a specific medicine you want to know about?';
    }
    else if (lowerMessage.includes('doctor') || lowerMessage.includes('appointment') || lowerMessage.includes('clinic')) {
        return 'MediGuide is for informational purposes only. For medical emergencies or professional advice, please consult a healthcare provider directly.';
    }
    else if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
        return 'You\'re welcome! Is there anything else I can help you with?';
    }
    else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        return 'Goodbye! Feel free to reach out if you have more questions later.';
    }
    else if (lowerMessage.includes('help')) {
        return 'I can help with information about symptoms, medicines, or using our website. What specific information are you looking for?';
    }
    else if (lowerMessage.includes('contact') || lowerMessage.includes('support') || lowerMessage.includes('email')) {
        return 'You can contact our support team at support@mediguide.com or call us at +1 234 567 890.';
    }
    else if (lowerMessage.includes('account') || lowerMessage.includes('login') || lowerMessage.includes('signup')) {
        return 'To create an account or login, please click on the Login button in the top right corner of the page.';
    }
    else {
        return 'I\'m not sure I understand. Could you please rephrase or ask about symptoms, medicines, or using our website?';
    }
} 