class Chatbot {
    constructor() {
        this.chatbot = document.querySelector('.chat-bot');
        this.toggleBtn = document.querySelector('.chat-bot-toggle');
        this.closeBtn = document.querySelector('.close-chat');
        this.messagesContainer = document.querySelector('.chat-messages');
        this.inputField = document.querySelector('.chat-input input');
        this.sendBtn = document.querySelector('.chat-input button');
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*,.pdf,.doc,.docx';
        this.fileInput.style.display = 'none';
        this.voiceInputBtn = document.createElement('button');
        this.voiceInputBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        this.voiceInputBtn.classList.add('voice-input-btn');
        
        this.isOpen = false;
        this.isTyping = false;
        this.chatHistory = [];
        this.currentTheme = 'light';
        this.currentLanguage = 'en';
        this.supportedLanguages = ['en', 'es', 'fr', 'de'];
        this.recognition = null;
        
        this.medicalResponses = {
            symptoms: {
                pattern: /symptom|pain|ache|fever|cough|headache|stomach|nausea|vomit|dizzy|tired|fatigue/i,
                responses: [
                    "I understand you're experiencing symptoms. Could you please describe them in more detail?",
                    "How long have you been experiencing these symptoms?",
                    "Are you experiencing any other symptoms along with this?",
                    "Have you taken any medication for these symptoms?"
                ]
            },
            medicines: {
                pattern: /medicine|medication|pill|drug|prescription|dosage|side effect/i,
                responses: [
                    "I can help you with medication information. What specific medication are you asking about?",
                    "Are you experiencing any side effects from your medication?",
                    "When was the last time you took this medication?",
                    "Have you consulted with your doctor about this medication?"
                ]
            },
            emergency: {
                pattern: /emergency|urgent|help|911|ambulance|bleeding|unconscious|breathing|heart|stroke/i,
                responses: [
                    "This sounds serious. Please call emergency services immediately at 911.",
                    "For your safety, I recommend calling emergency services right away.",
                    "This requires immediate medical attention. Please call 911 or go to the nearest emergency room."
                ]
            },
            general: {
                pattern: /.*/,
                responses: [
                    "I'm here to help with your medical questions. Could you please provide more details?",
                    "I understand you have a question. Could you specify if it's about symptoms, medications, or something else?",
                    "To better assist you, could you tell me more about your concern?"
                ]
            }
        };

        this.conversationContext = {
            currentTopic: null,
            followUpQuestions: [],
            userInfo: {}
        };

        this.initialize();
        this.loadChatHistory();
        this.setupVoiceRecognition();
    }

    initialize() {
        // Add event listeners
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.inputField.addEventListener('input', () => this.handleTyping());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput());

        // Add file upload button
        const uploadBtn = document.createElement('button');
        uploadBtn.innerHTML = '<i class="fas fa-paperclip"></i>';
        uploadBtn.classList.add('upload-btn');
        uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.inputField.parentNode.insertBefore(uploadBtn, this.inputField);

        // Add voice input button
        this.inputField.parentNode.insertBefore(this.voiceInputBtn, this.inputField.nextSibling);

        // Add theme toggle
        const themeToggle = document.createElement('button');
        themeToggle.innerHTML = '<i class="fas fa-palette"></i>';
        themeToggle.classList.add('theme-toggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());
        this.chatbot.querySelector('.chat-header').appendChild(themeToggle);

        // Add language selector
        const languageSelect = document.createElement('select');
        languageSelect.classList.add('language-select');
        this.supportedLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = lang.toUpperCase();
            languageSelect.appendChild(option);
        });
        languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        this.chatbot.querySelector('.chat-header').appendChild(languageSelect);

        // Add welcome message
        this.addBotMessage("Hello! I'm your MediGuide Assistant. How can I help you today?");
    }

    // Message persistence
    saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
    }

    loadChatHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            this.chatHistory = JSON.parse(savedHistory);
            this.chatHistory.forEach(msg => {
                if (msg.type === 'user') {
                    this.addUserMessage(msg.content, msg.timestamp);
                } else {
                    this.addBotMessage(msg.content, msg.timestamp);
                }
            });
        }
    }

    // Typing indicators
    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.showTypingIndicator();
        }
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            this.hideTypingIndicator();
        }, 1000);
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        this.messagesContainer.appendChild(typingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = this.messagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // File upload support
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.addFileMessage(file.name, e.target.result, file.type);
            };
            reader.readAsDataURL(file);
        }
    }

    addFileMessage(filename, content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'file-message');
        
        if (type.startsWith('image/')) {
            messageDiv.innerHTML = `
                <div class="file-preview">
                    <img src="${content}" alt="${filename}">
                </div>
                <div class="file-info">${filename}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="file-preview">
                    <i class="fas fa-file"></i>
                </div>
                <div class="file-info">${filename}</div>
            `;
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    // Message timestamps
    addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
        
        const timestamp = new Date().toLocaleTimeString();
        messageDiv.innerHTML = `
            <div class="message-content">${this.formatMessage(message)}</div>
            <div class="message-timestamp">${timestamp}</div>
            <div class="message-reactions">
                <button class="reaction-btn" data-reaction="👍">👍</button>
                <button class="reaction-btn" data-reaction="❤️">❤️</button>
                <button class="reaction-btn" data-reaction="😊">😊</button>
            </div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        // Save to chat history
        this.chatHistory.push({
            type: isUser ? 'user' : 'bot',
            content: message,
            timestamp: timestamp
        });
        this.saveChatHistory();
    }

    // Message formatting
    formatMessage(message) {
        // Support for basic markdown-like formatting
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\_(.*?)\_/g, '<u>$1</u>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }

    // Voice input/output
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.inputField.value = transcript;
                this.sendMessage();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
        }
    }

    toggleVoiceInput() {
        if (this.recognition) {
            if (this.recognition.isListening) {
                this.recognition.stop();
                this.voiceInputBtn.classList.remove('active');
            } else {
                this.recognition.start();
                this.voiceInputBtn.classList.add('active');
            }
        }
    }

    // Multiple language support
    changeLanguage(lang) {
        this.currentLanguage = lang;
        // Here you would typically load language-specific content
        // For now, we'll just update the UI
        document.documentElement.lang = lang;
    }

    // Custom themes
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    // Auto-suggestions
    setupAutoSuggestions() {
        const suggestions = [
            'How can I help you?',
            'What are your symptoms?',
            'Do you need emergency assistance?',
            'Tell me more about your condition'
        ];
        
        this.inputField.addEventListener('input', () => {
            const input = this.inputField.value.toLowerCase();
            const matchingSuggestions = suggestions.filter(s => 
                s.toLowerCase().includes(input)
            );
            
            this.showSuggestions(matchingSuggestions);
        });
    }

    showSuggestions(suggestions) {
        const suggestionContainer = document.querySelector('.suggestions-container') || 
            document.createElement('div');
        suggestionContainer.className = 'suggestions-container';
        suggestionContainer.innerHTML = '';
        
        suggestions.forEach(suggestion => {
            const div = document.createElement('div');
            div.className = 'suggestion';
            div.textContent = suggestion;
            div.addEventListener('click', () => {
                this.inputField.value = suggestion;
                suggestionContainer.innerHTML = '';
            });
            suggestionContainer.appendChild(div);
        });
        
        if (suggestions.length > 0) {
            this.inputField.parentNode.appendChild(suggestionContainer);
        } else {
            suggestionContainer.remove();
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatbot.style.display = this.isOpen ? 'block' : 'none';
        if (this.isOpen) {
            this.inputField.focus();
        }
    }

    closeChat() {
        this.isOpen = false;
        this.chatbot.style.display = 'none';
    }

    addBotMessage(message) {
        this.addMessage(message, false);
    }

    addUserMessage(message) {
        this.addMessage(message, true);
    }

    async sendMessage() {
        const message = this.inputField.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addUserMessage(message);
        this.inputField.value = '';

        try {
            // Show loading state
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'bot-message');
            loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';
            this.messagesContainer.appendChild(loadingDiv);

            // Process the message and get appropriate response
            const response = await this.processUserMessage(message);

            // Remove loading message
            this.messagesContainer.removeChild(loadingDiv);

            // Add bot response
            this.addBotMessage(response);

            // If there are follow-up questions, show them as quick replies
            if (this.conversationContext.followUpQuestions.length > 0) {
                this.showQuickReplies(this.conversationContext.followUpQuestions);
            }

        } catch (error) {
            console.error('Error:', error);
            this.addErrorMessage("I'm sorry, I'm having trouble connecting right now. Please try again later.");
        }
    }

    async processUserMessage(message) {
        // Check for emergency keywords first
        if (this.medicalResponses.emergency.pattern.test(message)) {
            this.conversationContext.currentTopic = 'emergency';
            return this.getEmergencyResponse();
        }

        // Check other medical topics
        for (const [topic, data] of Object.entries(this.medicalResponses)) {
            if (topic !== 'emergency' && data.pattern.test(message)) {
                this.conversationContext.currentTopic = topic;
                this.conversationContext.followUpQuestions = this.generateFollowUpQuestions(topic);
                return this.getTopicResponse(topic);
            }
        }

        // If no specific topic is matched, use general responses
        this.conversationContext.currentTopic = 'general';
        return this.getTopicResponse('general');
    }

    getEmergencyResponse() {
        const responses = this.medicalResponses.emergency.responses;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getTopicResponse(topic) {
        const responses = this.medicalResponses[topic].responses;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateFollowUpQuestions(topic) {
        switch (topic) {
            case 'symptoms':
                return [
                    "How long have you had these symptoms?",
                    "Are the symptoms getting worse?",
                    "Have you taken any medication?",
                    "Do you have any other symptoms?"
                ];
            case 'medicines':
                return [
                    "What medication are you taking?",
                    "How long have you been taking it?",
                    "Are you experiencing any side effects?",
                    "Have you consulted your doctor?"
                ];
            default:
                return [];
        }
    }

    showQuickReplies(questions) {
        const quickRepliesContainer = document.createElement('div');
        quickRepliesContainer.classList.add('quick-replies');

        questions.forEach(question => {
            const button = document.createElement('button');
            button.classList.add('quick-reply');
            button.textContent = question;
            button.addEventListener('click', () => {
                this.inputField.value = question;
                this.sendMessage();
                quickRepliesContainer.remove();
            });
            quickRepliesContainer.appendChild(button);
        });

        this.messagesContainer.appendChild(quickRepliesContainer);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    addErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('message', 'error');
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        `;
        this.messagesContainer.appendChild(errorDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new Chatbot();
}); 