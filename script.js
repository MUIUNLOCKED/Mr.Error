// Configuration
const config = {
    botUserId: "1360728831274778774",  // The bot's user ID that will respond
    channelId: "1360728529112928366",  // Channel ID where messages should be sent
    userToken: "MTM2MDc0MDUxOTg5NDA2MTEwNw.G_kCz5.kF0dPQ9w2uWe7R6JURD-Q6XU-6TcpsURrRxNWY",  // Your Discord account token
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

// Send message to Discord channel using user token
async function sendToDiscord(message) {
    try {
        const response = await fetch(`https://discord.com/api/v9/channels/${config.channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': config.userToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message
            }),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send message');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending message:', error);
        addMessage("System", "Failed to send message. Please check console for details.", false);
        return null;
    }
}

// Check for new messages in channel
async function checkForNewMessages() {
    try {
        const response = await fetch(`https://discord.com/api/v9/channels/${config.channelId}/messages?limit=1`, {
            headers: {
                'Authorization': config.userToken
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch messages');
        
        const messages = await response.json();
        if (messages.length > 0 && messages[0].author.id === config.botUserId) {
            return {
                content: messages[0].content,
                timestamp: new Date(messages[0].timestamp).getTime()
            };
        }
        return null;
    } catch (error) {
        console.error('Error checking messages:', error);
        return null;
    }
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
        
        const response = await checkForNewMessages();
        if (response && response.timestamp > lastMessageTimestamp) {
            clearInterval(checkInterval);
            typingIndicator.style.display = 'none';
            responseReceived = true;
            lastMessageTimestamp = response.timestamp;
            addMessage("Mr.Error", response.content, false);
        }
    }, config.checkInterval);
}

// Event Listeners
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

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
});
