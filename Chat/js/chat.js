// DOM Elements
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const collapseBtn = document.getElementById('collapseBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatList = document.getElementById('chatList');
const messagesContainer = document.getElementById('messagesContainer');
const emptyState = document.getElementById('emptyState');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const typingIndicator = document.getElementById('typingIndicator');

// State
let currentChatId = null;
let chats = [];
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
    toggleBtn.addEventListener('click', toggleSidebar);
    collapseBtn.addEventListener('click', expandSidebar);
    newChatBtn.addEventListener('click', createNewChat);
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    messageInput.addEventListener('input', autoResizeTextarea);

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.chat-item-menu')) {
            closeAllDropdowns();
        }
    });
}

// Sidebar Functions
function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    updateCollapseButton();
}
function expandSidebar() {
    sidebar.classList.remove('collapsed');
    updateCollapseButton();
}
function updateCollapseButton() {
    if (sidebar.classList.contains('collapsed')) {
        collapseBtn.classList.add('show');
    } else {
        collapseBtn.classList.remove('show');
    }
}

// Chat Management
function createNewChat() {
    currentChatId = Date.now();
    const newChat = {
        id: currentChatId,
        title: 'New Chat',
        messages: []
    };

    chats.unshift(newChat);
    saveChats();
    renderChatList();
    loadChat(currentChatId);
    messageInput.focus();
}
function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    currentChatId = chatId;

    messagesContainer.innerHTML = '';
    emptyState.style.display = 'none';

    chat.messages.forEach(message => {
        addMessageToDOM(message.content, message.isUser);
    });

    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-chat-id="${chatId}"]`)?.classList.add('active');
}
function addMessageToChat(content, isUser) {
    if (!currentChatId) {
        createNewChat();
    }

    const chat = chats.find(c => c.id === currentChatId);
    if (chat) {
        chat.messages.push({ content, isUser });

        if (chat.title === 'New Chat' && isUser) {
            chat.title = generateTitle(content);
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

    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}
function showTypingIndicator(show = true) {
    if (show) {
        typingIndicator.classList.add('show');
    } else {
        typingIndicator.classList.remove('show');
    }
    scrollToBottom();
}
function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
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
    const message = messageInput.value.trim();
    if (!message) return;

    console.log('Sending message:', message);

    sendButton.disabled = true;
    emptyState.style.display = 'none';

    addMessageToDOM(message, true);
    addMessageToChat(message, true);
    messageInput.value = '';
    autoResizeTextarea();

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

    sendButton.disabled = false;
    messageInput.focus();
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

        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-menu';

        const renameItem = document.createElement('div');
        renameItem.className = 'dropdown-item';
        renameItem.innerHTML = `<div class="dropdown-icon">✏️</div><span>Rename</span>`;
        renameItem.addEventListener('click', (e) => {
            e.stopPropagation();
            renameChat(chat.id);
            closeAllDropdowns();
        });

        const deleteItem = document.createElement('div');
        deleteItem.className = 'dropdown-item delete';
        deleteItem.innerHTML = `<div class="dropdown-icon">🗑️</div><span>Delete</span>`;
        deleteItem.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteChat(chat.id);
            closeAllDropdowns();
        });

        dropdown.appendChild(renameItem);
        dropdown.appendChild(deleteItem);

        // ✅ Updated menu button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'menu-btn';
        menuBtn.innerHTML = '⋯';
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns(); // close others
            dropdown.classList.toggle('show'); // toggle this one instead of forcing open
        });

        const menuContainer = document.createElement('div');
        menuContainer.className = 'chat-item-menu';
        menuContainer.appendChild(menuBtn);

        chatItem.appendChild(chatText);
        chatItem.appendChild(menuContainer);
        chatItem.appendChild(dropdown);

        chatItem.addEventListener('click', () => loadChat(chat.id));
        chatList.appendChild(chatItem);
    });
}

function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
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
            messagesContainer.innerHTML =
                '<div class="empty-state" id="emptyState"><h2>Welcome to FRIDAY</h2><p>Start a new conversation to begin your financial journey</p></div>';
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
