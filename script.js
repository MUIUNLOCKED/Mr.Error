// Configuration - Replace these with your own values
const config = {
    webhookUrl: "YOUR_DISCORD_WEBHOOK_URL", // Replace with your Discord webhook URL
    botUserId: "BOT_USER_ID", // Replace with the bot/user ID you want to listen for
    checkInterval: 2000, // How often to check for new messages (in ms)
    maxWaitTime: 30000 // Maximum time to wait for a response (in ms)
};

// DOM elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');

// Store the last message timestamp to avoid duplicates
let lastMessageTimestamp = 0;

// Function to add a message to the chat
function addMessage(sender, text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`;
    bubbleDiv.textContent = text;
    
    const senderSpan = document.createElement('span');
    senderSpan.className = 'message-sender';
    senderSpan.textContent = sender;
    
    messageDiv.appendChild(bubbleDiv);
    messageDiv.appendChild(senderSpan);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send message to Discord
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
        
        if (!response.ok) {
            throw new Error('Failed to send message to Discord');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending message to Discord:', error);
        addMessage("System", "Failed to send message. Please try again later.", false);
        return null;
    }
}

// Function to check for responses from the specific bot/user
async function checkForResponse() {
    try {
        // In a real implementation, you would need a server endpoint to fetch messages
        // This is a placeholder for the concept
        console.log("Checking for responses...");
        
        // Simulating a response for demonstration
        // In a real app, you would:
        // 1. Query your server which monitors the Discord channel
        // 2. Check if there are new messages from the botUserId
        // 3. Return the message content if found
        
        return null;
        
    } catch (error) {
        console.error('Error checking for responses:', error);
        return null;
    }
}

// Function to handle user sending a message
async function handleUserMessage() {
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessage("You", message, true);
    userInput.value = '';
    
    // Show typing indicator
    typingIndicator.style.display = 'block';
    
    // Send message to Discord
    const discordResponse = await sendToDiscord(message);
    if (!discordResponse) {
        typingIndicator.style.display = 'none';
        return;
    }
    
    // Start checking for responses
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

// Enhanced button click effect
sendButton.addEventListener('click', function(e) {
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');
    
    // Position the ripple
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size/2;
    const y = e.clientY - rect.top - size/2;
    
    // Style the ripple
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    // Add to button
    this.appendChild(ripple);
    
    // Remove after animation
    setTimeout(() => {
        ripple.remove();
    }, 600);
    
    // Handle the message sending
    handleUserMessage();
});

// Event listeners
sendButton.addEventListener('click', handleUserMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserMessage();
    }
});

// Initial greeting
// addMessage("Mr.Error", "Hello! I'm Mr.Error. How can I help you today?", false);
