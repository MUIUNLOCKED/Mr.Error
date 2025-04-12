// Configuration
const config = {
    webhookUrl: "https://discord.com/api/webhooks/1360728566668464138/hbugJre-UbJtN1F0LPibsnNubTRA19IExHa1yovOECZQgCBlpm16SxyYhBhScu6aw8xy",
    botUserId: "1360728831274778774",
    userToMention: "1360728831274778774",
    checkInterval: 2000,
    maxWaitTime: 30000
};

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing');
let lastMessageTimestamp = 0;

// Initial greeting
window.onload = function() {
    addMessage("Mr.Error", "Hello! I'm Mr.Error. How can I help you today?", false);
};

// Add message to chat
function addMessage(sender, text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = text;
    
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send message to Discord with mention
async function sendToDiscord(message) {
    try {
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: `<@${config.userToMention}> ${message}`
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Discord API Error:', errorData);
            throw new Error(`HTTP ${response.status}: ${errorData.message || 'Unknown error'}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Network Error:', error);
        addMessage("System", `Message sent to Discord (but confirmation failed). ${error.message}`, false);
        return { success: true };
    }
}

// Check for responses (simulated)
async function checkForResponse() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                content: "This is a simulated response from your bot.",
                timestamp: Date.now()
            });
        }, 1500);
    });
}

// Handle message sending
async function handleUserMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    addMessage("You", message, true);
    userInput.value = '';
    
    typingIndicator.style.display = 'block';
    
    try {
        const discordResponse = await sendToDiscord(message);
        
        if (!discordResponse || !discordResponse.success) {
            throw new Error('Failed to get confirmation');
        }

        const startTime = Date.now();
        let responseReceived = false;
        
        const checkInterval = setInterval(async () => {
            if (Date.now() - startTime > config.maxWaitTime) {
                clearInterval(checkInterval);
                typingIndicator.style.display = 'none';
                if (!responseReceived) {
                    addMessage("Mr.Error", "The bot is taking longer than usual to respond...", false);
                }
                return;
            }
            
            const response = await checkForResponse();
            if (response && response.timestamp > lastMessageTimestamp) {
                clearInterval(checkInterval);
                typingIndicator.style.display = 'none';
                responseReceived = true;
                lastMessageTimestamp = response.timestamp;
                addMessage("Mr.Error", response.content, false);
            }
        }, config.checkInterval);
        
    } catch (error) {
        typingIndicator.style.display = 'none';
        addMessage("System", "Your message was sent, but we couldn't verify delivery.", false);
    }
}

// Ripple effect for send button
sendButton.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top = `${e.clientY - rect.top - size/2}px`;
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    
    handleUserMessage();
});

// Send on Enter key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
});
