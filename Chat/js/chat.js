// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const newChatBtn = document.getElementById('newChatBtn');
const chatList = document.getElementById('chatList');
const messages = document.getElementById('messages');
const chatTitle = document.getElementById('chatTitle');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const qaGeneral = document.getElementById('qaGeneral');
const qaPersonal = document.getElementById('qaPersonal');

// State
let currentChatId = null;
let chats = [];
let isSidebarCollapsed = false;
const STORAGE_KEY = 'friday_chats';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadChats();
    renderChatList();
    setupEventListeners();
    autoResizeTextarea();
    console.log('FRIDAY Chat initialized');
});

// Event Listeners
function setupEventListeners() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    // New chat
    newChatBtn.addEventListener('click', createNewChat);
    
    // Send message
    sendBtn.addEventListener('click', sendMessage);
    
    // Quick actions
    qaGeneral.addEventListener('click', () => handleQuickAction('general'));
    qaPersonal.addEventListener('click', () => handleQuickAction('personal'));
    
    // Input handling
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    userInput.addEventListener('input', autoResizeTextarea);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.chat-item-menu')) {
            closeAllDropdowns();
        }
    });
}

// Sidebar Functions
function toggleSidebar() {
    isSidebarCollapsed = !isSidebarCollapsed;
    sidebar.classList.toggle('collapsed', isSidebarCollapsed);
    sidebarToggle.setAttribute('aria-expanded', !isSidebarCollapsed);
    
    // Update hamburger animation
    const hamburger = sidebarToggle.querySelector('.hamburger');
    if (isSidebarCollapsed) {
        hamburger.style.transform = 'rotate(45deg)';
        hamburger.style.background = '#7E57C2';
    } else {
        hamburger.style.transform = 'rotate(0deg)';
        hamburger.style.background = '#64748b';
    }
}

// Chat Management
function createNewChat() {
    currentChatId = Date.now();
    const newChat = {
        id: currentChatId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString()
    };

    chats.unshift(newChat);
    saveChats();
    renderChatList();
    loadChat(currentChatId);
    userInput.focus();
    
    // Hide welcome message and show empty state
    const welcomeMessage = messages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.style.display = 'none';
    }
}

function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    currentChatId = chatId;
    chatTitle.textContent = chat.title;

    // Clear messages
    messages.innerHTML = '';
    
    // Remove welcome message
    const welcomeMessage = messages.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    // Load chat messages
    if (chat.messages.length === 0) {
        showEmptyState();
    } else {
        chat.messages.forEach(message => {
            addMessageToDOM(message.content, message.isUser);
        });
    }

    // Update active chat in sidebar
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-chat-id="${chatId}"]`)?.classList.add('active');
}

function showEmptyState() {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
        <div class="empty-content">
            <h3>Start a conversation</h3>
            <p>Ask FRIDAY anything about your finances or use the quick actions below.</p>
        </div>
    `;
    messages.appendChild(emptyState);
}

function addMessageToChat(content, isUser) {
    if (!currentChatId) {
        createNewChat();
    }

    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.messages.push({ content, isUser, timestamp: new Date().toISOString() });

        if (chat.title === 'New Chat' && isUser) {
            chat.title = generateTitle(content);
            chatTitle.textContent = chat.title;
            renderChatList();
        }

        saveChats();
    }
}

function generateTitle(message) {
    const words = message.trim().split(' ').slice(0, 4);
    return words.join(' ') + (message.split(' ').length > 4 ? '...' : '');
}

// Message Functions
function addMessageToDOM(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = `avatar ${isUser ? 'user' : 'bot'}`;
    avatarDiv.textContent = isUser ? 'U' : 'F';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    messages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    setTimeout(() => {
        messages.scrollTop = messages.scrollHeight;
    }, 100);
}

// Quick Actions
function handleQuickAction(type) {
    if (!currentChatId) {
        createNewChat();
    }
    
    let message = '';
    if (type === 'general') {
        message = 'I have a general question about personal finance. Can you help me understand the basics?';
    } else if (type === 'personal') {
        message = 'I need help with my personal financial planning. Where should I start?';
    }
    
    if (message) {
        userInput.value = message;
        sendMessage();
    }
}

// API Simulation (placeholder for backend integration)
async function getBotResponse(message) {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const responses = [
        "That's a great question! Let me help you understand that better.",
        "I'd be happy to assist you with your financial planning needs.",
        "Based on your situation, I'd recommend considering these options...",
        "Let's break down your financial goals step by step.",
        "Here are some strategies that might work well for you.",
        "I understand your concern. Let me provide some guidance on this topic.",
        "That's an important financial decision. Here's what you should know...",
        "Great question! Here's how you can approach this situation.",
        "I can help you create a plan for that. Let's start with the basics.",
        "Financial planning is all about making informed decisions. Here's my advice..."
    ];
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    console.log('Sending message:', message);

    sendBtn.disabled = true;
    
    // Remove empty state if it exists
    const emptyState = messages.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    addMessageToDOM(message, true);
    addMessageToChat(message, true);
    userInput.value = '';
    autoResizeTextarea();

    // Show typing indicator
    showTypingIndicator(true);

    try {
        const botResponse = await getBotResponse(message);
        console.log('Bot response:', botResponse);

        showTypingIndicator(false);
        addMessageToDOM(botResponse, false);
        addMessageToChat(botResponse, false);
    } catch (error) {
        console.error('Error getting bot response:', error);
        showTypingIndicator(false);
        const errorMessage = "⚠️ Could not reach FRIDAY backend.";
        addMessageToDOM(errorMessage, false);
        addMessageToChat(errorMessage, false);
    }

    sendBtn.disabled = false;
    userInput.focus();
}

function showTypingIndicator(show = true) {
    let indicator = document.getElementById('typingIndicator');
    
    if (show && !indicator) {
        indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="avatar bot">F</div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        messages.appendChild(indicator);
    }
    
    if (indicator) {
        indicator.classList.toggle('show', show);
    }
    
    if (show) {
        scrollToBottom();
    }
}

// UI Functions
function renderChatList() {
    chatList.innerHTML = '';

    chats.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.setAttribute('data-chat-id', chat.id);

        if (chat.id === currentChatId) {
            chatItem.classList.add('active');
        }

        const chatText = document.createElement('div');
        chatText.className = 'chat-item-text';
        chatText.textContent = chat.title;

        const menuContainer = document.createElement('div');
        menuContainer.className = 'chat-item-menu';

        const menuBtn = document.createElement('button');
        menuBtn.className = 'menu-btn';
        menuBtn.innerHTML = '⋯';
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(chat.id);
        });

        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-menu';

        const renameItem = document.createElement('div');
        renameItem.className = 'dropdown-item';
        renameItem.innerHTML = '✏️ Rename';
        renameItem.addEventListener('click', (e) => {
            e.stopPropagation();
            renameChat(chat.id);
            closeAllDropdowns();
        });

        const deleteItem = document.createElement('div');
        deleteItem.className = 'dropdown-item delete';
        deleteItem.innerHTML = '🗑️ Delete';
        deleteItem.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
            closeAllDropdowns();
        });

        dropdown.appendChild(renameItem);
        dropdown.appendChild(deleteItem);
        menuContainer.appendChild(menuBtn);

        chatItem.appendChild(chatText);
        chatItem.appendChild(menuContainer);
        chatItem.appendChild(dropdown);

        chatItem.addEventListener('click', () => loadChat(chat.id));
        chatList.appendChild(chatItem);
    });
}

function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

// Dropdown Functions
function toggleDropdown(chatId) {
    closeAllDropdowns();
    const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
    const dropdown = chatItem.querySelector('.dropdown-menu');
    dropdown.classList.add('show');
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

// Chat Management Functions
function renameChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    const newTitle = prompt('Enter new chat title:', chat.title);
    if (newTitle && newTitle.trim() && newTitle.trim() !== chat.title) {
        chat.title = newTitle.trim();
        saveChats();
        renderChatList();
        
        if (chatId === currentChatId) {
            chatTitle.textContent = chat.title;
        }
    }
    closeAllDropdowns();
}

function deleteChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    if (confirm(`Are you sure you want to delete "${chat.title}"?`)) {
        chats = chats.filter(c => c.id !== chatId);

        if (chatId === currentChatId) {
            currentChatId = null;
            chatTitle.textContent = 'Welcome to FRIDAY';
            messages.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-content">
                        <h3>👋 Hi there!</h3>
                        <p>I'm FRIDAY, your personal AI financial advisor. I'm here to help you with:</p>
                        <ul>
                            <li>💰 Investment planning</li>
                            <li>📊 Budget management</li>
                            <li>🏠 Financial goals</li>
                            <li>📈 Tax optimization</li>
                        </ul>
                        <p>Choose how you'd like to start our conversation:</p>
                    </div>
                </div>
            `;
        }

        saveChats();
        renderChatList();
    }
    closeAllDropdowns();
}

// Storage Functions
function loadChats() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        chats = JSON.parse(stored);
    }
}

function saveChats() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}
