// Constants & Configuration
const USE_API = false; // when true, call backend
const BACKEND_URL = ""; // later set to ngrok URL

// State
let chats = JSON.parse(localStorage.getItem("friday_chats")) || [];
let currentChatId = null;
let filteredChats = [];

// DOM Elements
let sidebar, sidebarToggle, chatList, newChatBtn, clearAllBtn, chatSearch;
let chatHeader, chatTitle, renameChatBtn, deleteChatBtn, devMenuBtn;
let messages, quickActions, qaGeneral, qaPersonal;
let categoryPicker, subcategoryPicker, intakeForm;
let inputBar, userInput, sendBtn, typingIndicator;
let devMenu, toastContainer;

// Subcategories mapping
const SUBCATS = {
  "Investments & Wealth": ["Stocks", "Mutual Funds", "Fixed Deposits", "Gold", "Bonds"],
  "Loans & Credit": ["Home Loan", "Car Loan", "Personal Loan", "Credit Card"],
  "Insurance & Protection": ["Term Life", "Health Insurance", "Motor Insurance"],
  "Tax Planning": ["Old vs New Regime", "80C Deductions", "Capital Gains", "HRA/Rent"],
  "Budgeting & Saving": ["Monthly Budget", "Emergency Fund", "Expense Tracking"],
  "Goals": ["Car (2-3y)", "House (5-10y)", "Education", "Retirement"]
};

// Form field definitions for intake
const INTAKE_FORMS = {
  "Budgeting & Saving": {
    "Monthly Budget": [
      { name: "age", label: "Age", type: "number", required: true },
      { name: "monthly_income", label: "Monthly Income (₹)", type: "number", required: true },
      { name: "fixed_expenses", label: "Fixed Monthly Expenses (₹)", type: "number", required: true },
      { name: "savings_goal", label: "Monthly Savings Goal (₹)", type: "number", required: false },
      { name: "time_horizon", label: "Planning Time Horizon", type: "select", options: ["1 year", "2-3 years", "5+ years"], required: true }
    ],
    "Emergency Fund": [
      { name: "age", label: "Age", type: "number", required: true },
      { name: "monthly_income", label: "Monthly Income (₹)", type: "number", required: true },
      { name: "fixed_expenses", label: "Monthly Expenses (₹)", type: "number", required: true },
      { name: "current_savings", label: "Current Emergency Savings (₹)", type: "number", required: false },
      { name: "dependents", label: "Number of Dependents", type: "number", required: true }
    ]
  },
  "Loans & Credit": {
    "Car Loan": [
      { name: "loan_amount", label: "Loan Amount Needed (₹)", type: "number", required: true },
      { name: "tenure_months", label: "Preferred Tenure (months)", type: "number", required: true },
      { name: "monthly_income", label: "Monthly Income (₹)", type: "number", required: true },
      { name: "existing_debt", label: "Existing EMIs (₹/month)", type: "number", required: false },
      { name: "credit_score_estimate", label: "Credit Score (approx)", type: "select", options: ["Below 650", "650-700", "700-750", "Above 750"], required: false }
    ],
    "Home Loan": [
      { name: "loan_amount", label: "Loan Amount Needed (₹)", type: "number", required: true },
      { name: "property_value", label: "Property Value (₹)", type: "number", required: true },
      { name: "monthly_income", label: "Monthly Income (₹)", type: "number", required: true },
      { name: "tenure_years", label: "Preferred Tenure (years)", type: "select", options: ["10", "15", "20", "25", "30"], required: true },
      { name: "existing_debt", label: "Existing EMIs (₹/month)", type: "number", required: false }
    ]
  },
  "Tax Planning": {
    "80C Deductions": [
      { name: "monthly_income", label: "Monthly Income (₹)", type: "number", required: true },
      { name: "tax_regime", label: "Tax Regime", type: "select", options: ["Old Regime", "New Regime"], required: true },
      { name: "existing_80C", label: "Current 80C Investments (₹/year)", type: "number", required: false },
      { name: "hra", label: "HRA Received (₹/month)", type: "number", required: false },
      { name: "other_deductions", label: "Other Deductions (₹/year)", type: "number", required: false }
    ]
  },
  "Insurance & Protection": {
    "Term Life": [
      { name: "age", label: "Age", type: "number", required: true },
      { name: "monthly_income", label: "Monthly Income (₹)", type: "number", required: true },
      { name: "dependents", label: "Number of Dependents", type: "number", required: true },
      { name: "existing_coverage", label: "Existing Life Cover (₹)", type: "number", required: false },
      { name: "outstanding_loans", label: "Outstanding Loans (₹)", type: "number", required: false }
    ]
  },
  "Goals": {
    "Car (2-3y)": [
      { name: "target_amount", label: "Target Amount (₹)", type: "number", required: true },
      { name: "time_horizon", label: "Time to Goal (months)", type: "number", required: true },
      { name: "monthly_income", label: "Monthly Income (₹)", type: "number", required: true },
      { name: "current_savings", label: "Current Savings (₹)", type: "number", required: false },
      { name: "risk_tolerance", label: "Risk Tolerance", type: "select", options: ["Conservative", "Moderate", "Aggressive"], required: true }
    ]
  }
};

// Suggested starters for each category
const SUGGESTED_STARTERS = {
  "Budgeting & Saving": ["Create a monthly budget", "Build emergency fund", "Track my expenses"],
  "Investments & Wealth": ["Where to invest ₹10,000", "SIP vs lump sum", "Tax-saving investments"],
  "Loans & Credit": ["Estimate EMI", "Should I prepay?", "Best tenure for me?"],
  "Insurance & Protection": ["How much life cover?", "Health insurance options", "Compare policies"],
  "Tax Planning": ["Save more tax", "Old vs new regime", "Plan year-end investments"],
  "Goals": ["Plan for house", "Child's education fund", "Retirement planning"]
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  initializeDOM();
  setupEventListeners();
  renderChatList();
  
  if (chats.length === 0) {
    startNewChat();
  } else if (currentChatId) {
    loadChat(currentChatId);
  }
  
  console.log('FRIDAY Chat initialized');
});

// DOM Initialization
function initializeDOM() {
  sidebar = document.getElementById('sidebar');
  sidebarToggle = document.getElementById('sidebarToggle');
  chatList = document.getElementById('chatList');
  newChatBtn = document.getElementById('newChatBtn');
  clearAllBtn = document.getElementById('clearAllBtn');
  chatSearch = document.getElementById('chatSearch');
  
  chatHeader = document.getElementById('chatHeader');
  chatTitle = document.getElementById('chatTitle');
  renameChatBtn = document.getElementById('renameChatBtn');
  deleteChatBtn = document.getElementById('deleteChatBtn');
  devMenuBtn = document.getElementById('devMenuBtn');
  
  messages = document.getElementById('messages');
  quickActions = document.getElementById('quickActions');
  qaGeneral = document.getElementById('qaGeneral');
  qaPersonal = document.getElementById('qaPersonal');
  
  categoryPicker = document.getElementById('categoryPicker');
  subcategoryPicker = document.getElementById('subcategoryPicker');
  intakeForm = document.getElementById('intakeForm');
  
  inputBar = document.getElementById('inputBar');
  userInput = document.getElementById('userInput');
  sendBtn = document.getElementById('sendBtn');
  typingIndicator = document.getElementById('typingIndicator');
  
  devMenu = document.getElementById('devMenu');
  toastContainer = document.getElementById('toastContainer');
}

// Event Listeners Setup
function setupEventListeners() {
  // Sidebar controls
  sidebarToggle.addEventListener('click', toggleSidebar);
  newChatBtn.addEventListener('click', startNewChat);
  clearAllBtn.addEventListener('click', clearAllChats);
  chatSearch.addEventListener('input', debounce(handleChatSearch, 300));
  
  // Chat controls
  renameChatBtn.addEventListener('click', renameCurrentChat);
  deleteChatBtn.addEventListener('click', deleteCurrentChat);
  devMenuBtn.addEventListener('click', toggleDevMenu);
  
  // Quick actions
  qaGeneral.addEventListener('click', () => initializeGeneralFlow());
  qaPersonal.addEventListener('click', () => initializePersonalFlow());
  
  // Input handling
  userInput.addEventListener('input', autoResizeTextarea);
  userInput.addEventListener('keydown', handleInputKeydown);
  sendBtn.addEventListener('click', handleSend);
  
  // Intake form
  document.getElementById('skipIntakeBtn').addEventListener('click', skipIntake);
  intakeForm.addEventListener('submit', handleIntakeSubmit);
  
  // Dev menu
  document.getElementById('seedDemoBtn').addEventListener('click', seedDemoChats);
  document.getElementById('exportChatsBtn').addEventListener('click', exportChats);
  document.getElementById('importChatsBtn').addEventListener('click', () => document.getElementById('importChatsInput').click());
  document.getElementById('importChatsInput').addEventListener('change', importChats);
  document.getElementById('clearStorageBtn').addEventListener('click', clearStorage);
  document.getElementById('closeDevMenuBtn').addEventListener('click', () => devMenu.hidden = true);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleGlobalKeydown);
  
  // Close dev menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!devMenu.hidden && !devMenu.contains(e.target) && e.target !== devMenuBtn) {
      devMenu.hidden = true;
    }
  });
  
  // Mobile sidebar handling
  if (window.innerWidth <= 900) {
    sidebar.classList.add('collapsed');
    updateSidebarToggle();
  }
  
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.remove('open');
    }
  });
}

// Sidebar Functions
function toggleSidebar() {
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('collapsed');
  }
  updateSidebarToggle();
}

function updateSidebarToggle() {
  const isCollapsed = sidebar.classList.contains('collapsed') || !sidebar.classList.contains('open');
  sidebarToggle.setAttribute('aria-expanded', !isCollapsed);
}

// Chat Management
function startNewChat() {
  const newChat = createChat();
  chats.unshift(newChat);
  currentChatId = newChat.id;
  saveChats();
  renderChatList();
  loadChat(currentChatId);
  showQuickActions();
  userInput.focus();
  
  // Close sidebar on mobile
  if (window.innerWidth <= 900) {
    sidebar.classList.remove('open');
  }
}

function createChat(type = null) {
  return {
    id: Date.now(),
    title: 'New Chat',
    type: type,
    category: null,
    subcategory: null,
    created_at: Date.now(),
    updated_at: Date.now(),
    messages: [],
    intake_data: {}
  };
}

function loadChat(chatId) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  
  currentChatId = chatId;
  chatTitle.textContent = chat.title;
  
  // Clear messages and render
  messages.innerHTML = '';
  chat.messages.forEach(msg => renderMessage(msg));
  
  // Hide contextual panels
  hideAllPanels();
  
  // Show quick actions if no messages or if it's a new chat
  if (chat.messages.length === 0) {
    showQuickActions();
  } else {
    hideQuickActions();
    showSuggestedStarters(chat);
  }
  
  // Update active chat in sidebar
  document.querySelectorAll('.chat-item').forEach(item => {
    item.classList.toggle('active', parseInt(item.dataset.chatId) === chatId);
  });
  
  scrollToBottom();
}

function renameCurrentChat() {
  if (!currentChatId) return;
  
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  const newTitle = prompt('Enter new chat title:', chat.title);
  if (newTitle && newTitle.trim() && newTitle.trim() !== chat.title) {
    chat.title = newTitle.trim();
    chat.updated_at = Date.now();
    saveChats();
    renderChatList();
    chatTitle.textContent = chat.title;
  }
}

function deleteCurrentChat() {
  if (!currentChatId) return;
  
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  if (confirm(`Delete "${chat.title}"?`)) {
    chats = chats.filter(c => c.id !== currentChatId);
    saveChats();
    renderChatList();
    
    // Load another chat or start new
    if (chats.length > 0) {
      loadChat(chats[0].id);
    } else {
      currentChatId = null;
      messages.innerHTML = '';
      chatTitle.textContent = 'New Chat';
      startNewChat();
    }
  }
}

function clearAllChats() {
  if (confirm('Clear all chats? This cannot be undone.')) {
    chats = [];
    currentChatId = null;
    localStorage.removeItem('friday_chats');
    renderChatList();
    messages.innerHTML = '';
    chatTitle.textContent = 'New Chat';
    startNewChat();
    toast('All chats cleared', 'success');
  }
}

// Chat Search
function handleChatSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  
  if (query) {
    filteredChats = chats.filter(chat => 
      chat.title.toLowerCase().includes(query) ||
      chat.messages.some(msg => msg.content.toLowerCase().includes(query))
    );
  } else {
    filteredChats = [];
  }
  
  renderChatList();
}

// Chat List Rendering
function renderChatList() {
  const chatsToRender = filteredChats.length > 0 ? filteredChats : chats;
  
  chatList.innerHTML = '';
  
  chatsToRender.forEach(chat => {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item';
    chatItem.dataset.chatId = chat.id;
    
    if (chat.id === currentChatId) {
      chatItem.classList.add('active');
    }
    
    const icon = document.createElement('div');
    icon.className = 'chat-item-icon';
    icon.textContent = chat.type === 'personal' ? '👤' : '💬';
    
    const content = document.createElement('div');
    content.className = 'chat-item-content';
    
    const title = document.createElement('div');
    title.className = 'chat-item-title';
    title.textContent = chat.title;
    
    const preview = document.createElement('div');
    preview.className = 'chat-item-preview';
    const lastMsg = chat.messages[chat.messages.length - 1];
    preview.textContent = lastMsg ? lastMsg.content.substring(0, 50) + '...' : 'No messages';
    
    content.appendChild(title);
    content.appendChild(preview);
    
    chatItem.appendChild(icon);
    chatItem.appendChild(content);
    
    chatItem.addEventListener('click', () => loadChat(chat.id));
    
    chatList.appendChild(chatItem);
  });
}

// Quick Actions
function showQuickActions() {
  quickActions.hidden = false;
  qaGeneral.style.display = 'flex';
  qaPersonal.style.display = 'flex';
}

function hideQuickActions() {
  quickActions.hidden = true;
}

function showSuggestedStarters(chat) {
  if (!chat.category || !SUGGESTED_STARTERS[chat.category]) return;
  
  quickActions.hidden = false;
  
  // Clear existing quick actions
  while (quickActions.children.length > 2) {
    quickActions.removeChild(quickActions.lastChild);
  }
  
  // Hide initial bubbles
  qaGeneral.style.display = 'none';
  qaPersonal.style.display = 'none';
  
  // Add suggested starters
  SUGGESTED_STARTERS[chat.category].forEach(starter => {
    const bubble = document.createElement('button');
    bubble.className = 'qa-bubble';
    bubble.textContent = starter;
    bubble.addEventListener('click', () => {
      userInput.value = starter;
      handleSend();
    });
    quickActions.appendChild(bubble);
  });
}

// Flow Initialization
function initializeGeneralFlow() {
  if (!currentChatId) startNewChat();
  
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.type = 'general';
    chat.updated_at = Date.now();
    saveChats();
  }
  
  hideAllPanels();
  hideQuickActions();
  userInput.placeholder = 'Ask anything about personal finance...';
  userInput.focus();
  
  // Add system message
  addSystemMessage('💬 General Query mode activated. Ask me anything about personal finance!');
}

function initializePersonalFlow() {
  if (!currentChatId) startNewChat();
  
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.type = 'personal';
    chat.updated_at = Date.now();
    saveChats();
  }
  
  hideAllPanels();
  showCategoryPicker();
}

// Category Flow
function showCategoryPicker() {
  const categories = Object.keys(SUBCATS);
  const container = categoryPicker.querySelector('.pill-container');
  
  container.innerHTML = '';
  categories.forEach(category => {
    const pill = document.createElement('button');
    pill.className = 'pill';
    pill.textContent = category;
    pill.addEventListener('click', () => showSubcategories(category));
    container.appendChild(pill);
  });
  
  categoryPicker.hidden = false;
}

function showSubcategories(category) {
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.category = category;
    chat.updated_at = Date.now();
    saveChats();
  }
  
  categoryPicker.hidden = true;
  
  const subcategories = SUBCATS[category];
  const container = subcategoryPicker.querySelector('.pill-container');
  
  container.innerHTML = '';
  subcategories.forEach(subcategory => {
    const pill = document.createElement('button');
    pill.className = 'pill';
    pill.textContent = subcategory;
    pill.addEventListener('click', () => startIntake(category, subcategory));
    container.appendChild(pill);
  });
  
  subcategoryPicker.hidden = false;
}

function startIntake(category, subcategory) {
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.subcategory = subcategory;
    chat.updated_at = Date.now();
    saveChats();
  }
  
  subcategoryPicker.hidden = true;
  
  // Get form fields for this category/subcategory
  const fields = INTAKE_FORMS[category]?.[subcategory];
  
  if (!fields) {
    // Skip intake if no form defined
    skipIntake();
    return;
  }
  
  renderIntakeForm(fields);
  intakeForm.hidden = false;
}

function renderIntakeForm(fields) {
  const container = intakeForm.querySelector('.form-fields');
  container.innerHTML = '';
  
  fields.forEach(field => {
    const group = document.createElement('div');
    group.className = 'form-group';
    
    const label = document.createElement('label');
    label.textContent = field.label + (field.required ? ' *' : '');
    label.setAttribute('for', field.name);
    
    let input;
    if (field.type === 'select') {
      input = document.createElement('select');
      field.options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        input.appendChild(opt);
      });
    } else {
      input = document.createElement('input');
      input.type = field.type;
    }
    
    input.id = field.name;
    input.name = field.name;
    input.required = field.required;
    
    group.appendChild(label);
    group.appendChild(input);
    container.appendChild(group);
  });
}

function handleIntakeSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const intakeData = {};
  
  // Validate and collect data
  let isValid = true;
  const fields = e.target.querySelectorAll('input, select');
  
  fields.forEach(field => {
    // Remove existing error messages
    const existingError = field.parentNode.querySelector('.err');
    if (existingError) existingError.remove();
    
    if (field.required && !field.value.trim()) {
      isValid = false;
      const error = document.createElement('div');
      error.className = 'err';
      error.textContent = 'This field is required';
      field.parentNode.appendChild(error);
    } else if (field.value.trim()) {
      intakeData[field.name] = field.type === 'number' ? parseFloat(field.value) : field.value;
    }
  });
  
  if (!isValid) return;
  
  // Save intake data
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.intake_data = intakeData;
    chat.updated_at = Date.now();
    saveChats();
  }
  
  completeIntake();
}

function skipIntake() {
  completeIntake();
}

function completeIntake() {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  hideAllPanels();
  
  const categoryText = chat.subcategory ? `${chat.category} → ${chat.subcategory}` : chat.category;
  addSystemMessage(`👤 Personal Query configured for ${categoryText}. I'll tailor my advice accordingly. What would you like to know?`);
  
  showSuggestedStarters(chat);
  userInput.focus();
}

// Panel Management
function hideAllPanels() {
  categoryPicker.hidden = true;
  subcategoryPicker.hidden = true;
  intakeForm.hidden = true;
}

// Message Handling
function renderMessage(msg) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `msg ${msg.role}`;
  
  const content = document.createElement('div');
  content.textContent = msg.content;
  
  const timestamp = document.createElement('span');
  timestamp.className = 'ts';
  timestamp.textContent = formatTime(msg.ts);
  
  messageDiv.appendChild(content);
  messageDiv.appendChild(timestamp);
  
  messages.appendChild(messageDiv);
  scrollToBottom();
}

function addSystemMessage(content) {
  const msg = {
    role: 'system',
    content: content,
    ts: Date.now()
  };
  
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.messages.push(msg);
    saveChats();
  }
  
  renderMessage(msg);
}

function addUserMessage(content) {
  const msg = {
    role: 'user',
    content: content,
    ts: Date.now()
  };
  
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.messages.push(msg);
    
    // Update title if it's the first user message
    if (chat.title === 'New Chat') {
      chat.title = generateTitle(content);
      chatTitle.textContent = chat.title;
    }
    
    chat.updated_at = Date.now();
    saveChats();
    renderChatList();
  }
  
  renderMessage(msg);
}

function addAssistantMessage(content) {
  const msg = {
    role: 'assistant',
    content: content,
    ts: Date.now()
  };
  
  const chat = chats.find(c => c.id === currentChatId);
  if (chat) {
    chat.messages.push(msg);
    chat.updated_at = Date.now();
    saveChats();
  }
  
  renderMessage(msg);
}

function generateTitle(message) {
  const words = message.trim().split(' ').slice(0, 4);
  return words.join(' ') + (message.split(' ').length > 4 ? '...' : '');
}

// Input Handling
function handleInputKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

function autoResizeTextarea() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
}

async function handleSend() {
  const message = userInput.value.trim();
  if (!message) return;
  
  if (!currentChatId) startNewChat();
  
  sendBtn.disabled = true;
  hideQuickActions();
  
  // Add user message
  addUserMessage(message);
  userInput.value = '';
  autoResizeTextarea();
  
  // Show typing indicator
  typingIndicator.hidden = false;
  scrollToBottom();
  
  try {
    const chat = chats.find(c => c.id === currentChatId);
    const reply = await getAssistantReply(chat, message);
    
    typingIndicator.hidden = true;
    addAssistantMessage(reply);
  } catch (error) {
    console.error('Error getting assistant reply:', error);
    typingIndicator.hidden = true;
    addAssistantMessage('⚠️ Sorry, I encountered an error. Please try again.');
    toast('Failed to get response', 'error');
  }
  
  sendBtn.disabled = false;
  userInput.focus();
}

// Assistant Reply Logic
async function getAssistantReply(chat, userText) {
  const payload = {
    message: userText,
    history: chat.messages,
    user_profile: buildUserProfileFromIntake(chat)
  };
  
  if (USE_API && BACKEND_URL) {
    return await sendToBackend(payload);
  } else {
    return await fakeLocalReply(payload, chat);
  }
}

async function sendToBackend(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);
  
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.reply;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

async function fakeLocalReply(payload, chat) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));
  
  const message = payload.message.toLowerCase();
  
  if (chat.type === 'general') {
    return generateGeneralResponse(message);
  } else if (chat.type === 'personal') {
    return generatePersonalResponse(message, chat);
  }
  
  return "I'm here to help with your financial questions. What would you like to know?";
}

function generateGeneralResponse(message) {
  const responses = {
    budget: "Creating a budget is the foundation of financial health. Here's a simple approach:\n\n• Track your income and expenses for a month\n• Follow the 50/30/20 rule (needs/wants/savings)\n• Use apps or spreadsheets to monitor spending\n\nWould you like help setting up a specific budget category?",
    
    investment: "Investment basics for beginners:\n\n• Start with an emergency fund (6 months expenses)\n• Consider tax-saving options like ELSS, PPF\n• Diversify across asset classes (equity, debt, gold)\n• Start SIPs for regular investing\n\nWhat's your investment timeline and risk tolerance?",
    
    loan: "When considering loans:\n\n• Compare interest rates across lenders\n• Check your credit score first\n• Calculate EMI vs income ratio (max 40%)\n• Consider prepayment options\n\nWhat type of loan are you considering?",
    
    tax: "Tax planning strategies:\n\n• Choose between old vs new tax regime\n• Maximize 80C deductions (₹1.5L limit)\n• Plan investments before March 31st\n• Keep proper documentation\n\nAre you looking at any specific tax-saving instruments?"
  };
  
  for (const [key, response] of Object.entries(responses)) {
    if (message.includes(key)) {
      return response;
    }
  }
  
  return "Great question! Here's what I'd recommend:\n\n• Start with understanding your current financial position\n• Set clear, measurable goals\n• Create a plan with specific timelines\n\nWhat specific area of personal finance interests you most?";
}

function generatePersonalResponse(message, chat) {
  const category = chat.category;
  const subcategory = chat.subcategory;
  const hasIntake = Object.keys(chat.intake_data).length > 0;
  
  let response = `Based on your interest in ${category}`;
  if (subcategory) response += ` → ${subcategory}`;
  if (hasIntake) response += ` and the information you provided`;
  response += ":\n\n";
  
  // Category-specific responses
  if (category === "Budgeting & Saving") {
    response += "• Set up automated savings transfers\n• Track expenses using the envelope method\n• Build an emergency fund first\n\nNext steps: Review your monthly spending patterns and identify areas to optimize.";
  } else if (category === "Investments & Wealth") {
    response += "• Start with goal-based investing\n• Consider systematic investment plans (SIPs)\n• Diversify across asset classes\n\nNext steps: Define your investment timeline and risk appetite.";
  } else if (category === "Loans & Credit") {
    response += "• Compare offers from multiple lenders\n• Check your credit score regularly\n• Plan EMIs within 40% of income\n\nNext steps: Get pre-approved to understand your eligibility.";
  } else if (category === "Tax Planning") {
    response += "• Review current tax regime suitability\n• Maximize available deductions\n• Plan investments strategically\n\nNext steps: Calculate tax liability under both regimes.";
  } else if (category === "Insurance & Protection") {
    response += "• Calculate adequate coverage amount\n• Separate insurance from investment\n• Review and update beneficiaries\n\nNext steps: Get quotes from multiple insurers.";
  } else if (category === "Goals") {
    response += "• Define specific target amounts\n• Choose appropriate investment vehicles\n• Monitor progress regularly\n\nNext steps: Create a systematic investment plan.";
  }
  
  response += "\n\n*This is educational guidance, not licensed financial advice. Verify with a registered professional before making financial decisions.*";
  
  return response;
}

function buildUserProfileFromIntake(chat) {
  return chat.intake_data || {};
}

// Utility Functions
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function scrollToBottom() {
  setTimeout(() => {
    messages.scrollTop = messages.scrollHeight;
  }, 100);
}

function saveChats() {
  localStorage.setItem('friday_chats', JSON.stringify(chats));
}

// Toast Notifications
function toast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Global Keyboard Shortcuts
function handleGlobalKeydown(e) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
  
  if (cmdOrCtrl && e.key === 'k') {
    e.preventDefault();
    chatSearch.focus();
  } else if (cmdOrCtrl && e.key === 'n') {
    e.preventDefault();
    startNewChat();
  } else if (e.key === 'Escape') {
    if (window.innerWidth <= 900) {
      sidebar.classList.remove('open');
    } else {
      sidebar.classList.add('collapsed');
    }
    updateSidebarToggle();
    devMenu.hidden = true;
  }
}

// Dev Tools
function toggleDevMenu() {
  devMenu.hidden = !devMenu.hidden;
}

function seedDemoChats() {
  const demoChats = [
    {
      id: Date.now() - 1000,
      title: 'Emergency fund planning',
      type: 'personal',
      category: 'Budgeting & Saving',
      subcategory: 'Emergency Fund',
      created_at: Date.now() - 86400000,
      updated_at: Date.now() - 3600000,
      messages: [
        { role: 'user', content: 'How much should I save for emergency fund?', ts: Date.now() - 3600000 },
        { role: 'assistant', content: 'For emergency funds, aim for 6-12 months of expenses. Start with 3 months as a minimum goal.', ts: Date.now() - 3500000 }
      ],
      intake_data: { age: 28, monthly_income: 50000, fixed_expenses: 30000 }
    },
    {
      id: Date.now() - 2000,
      title: 'Tax saving investments',
      type: 'general',
      category: null,
      subcategory: null,
      created_at: Date.now() - 172800000,
      updated_at: Date.now() - 7200000,
      messages: [
        { role: 'user', content: 'What are the best tax saving investments?', ts: Date.now() - 7200000 },
        { role: 'assistant', content: 'Popular 80C options include ELSS mutual funds, PPF, and life insurance premiums. ELSS offers growth potential with 3-year lock-in.', ts: Date.now() - 7100000 }
      ],
      intake_data: {}
    }
  ];
  
  chats = [...demoChats, ...chats];
  saveChats();
  renderChatList();
  toast('Demo chats added', 'success');
}

function exportChats() {
  const dataStr = JSON.stringify(chats, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `friday_chats_${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  toast('Chats exported', 'success');
}

function importChats(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedChats = JSON.parse(e.target.result);
      if (Array.isArray(importedChats)) {
        chats = importedChats;
        saveChats();
        renderChatList();
        toast('Chats imported successfully', 'success');
      } else {
        throw new Error('Invalid format');
      }
    } catch (error) {
      toast('Failed to import chats', 'error');
    }
  };
  reader.readAsText(file);
  
  // Reset input
  e.target.value = '';
}

function clearStorage() {
  if (confirm('Clear all data including chats? This cannot be undone.')) {
    localStorage.clear();
    chats = [];
    currentChatId = null;
    renderChatList();
    messages.innerHTML = '';
    chatTitle.textContent = 'New Chat';
    startNewChat();
    toast('Storage cleared', 'success');
  }
}