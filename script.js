// Configuration
const config = {
    webhookUrl: "YOUR_DISCORD_WEBHOOK_URL",
    botUserId: "BOT_USER_ID",
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

// Send message to Discord
async function sendToDiscord(message) {
    try {
        const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message,
            }),
        });
        
        if (!response.ok) throw new Error('Failed to send message');
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        addMessage("System", "Failed to send message. Please try again later.", false);
        return null;
    }
}

// Check for responses (simulated)
async function checkForResponse() {
    // In a real implementation, this would check your backend/Discord
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                content: "This is a simulated response. In a real app, this would come from your Discord bot.",
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
    const discordResponse = await sendToDiscord(message);
    if (!discordResponse) {
        typingIndicator.style.display = 'none';
        return;
    }
    
    const startTime = Date.now();
    let responseReceived = false;
    
    const checkInterval = setInterval(async () => {
        if (Date.now() - startTime > config.maxWaitTime) {
            clearInterval(checkInterval);
            typingIndicator.style.display = 'none';
            if (!responseReceived) {
                addMessage("Mr.Error", "I'm currently unavailable. Please try again later.", false);
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
