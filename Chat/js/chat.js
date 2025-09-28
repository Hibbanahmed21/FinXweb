// DOM Elements
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarToggleExternal = document.getElementById('sidebarToggleExternal');
const newChatBtn = document.getElementById('newChatBtn');
const chatList = document.getElementById('chatList');
const messages = document.getElementById('messages');
const chatTitle = document.getElementById('chatTitle');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const qaGeneral = document.getElementById('qaGeneral');
const qaPersonal = document.getElementById('qaPersonal');
const categoryPicker = document.getElementById('categoryPicker');
const subcategoryPicker = document.getElementById('subcategoryPicker');
const intakeForm = document.getElementById('intakeForm');
const intakeFormFields = document.getElementById('intakeFormFields');
const skipIntake = document.getElementById('skipIntake');
const submitIntake = document.getElementById('submitIntake');

// State
let currentChatId = null;
let chats = [];
let isSidebarCollapsed = false;
const STORAGE_KEY = 'friday_chats';
const SIDEBAR_STATE_KEY = 'friday_sidebar_collapsed';

// Categories and Subcategories
const CATEGORIES = [
    { id: 'budgeting', name: '💰 Budgeting & Saving', icon: '💰' },
    { id: 'investments', name: '📈 Investments & Wealth', icon: '📈' },
    { id: 'loans', name: '🏠 Loans & Credit', icon: '🏠' },
    { id: 'insurance', name: '🛡️ Insurance & Protection', icon: '🛡️' },
    { id: 'tax', name: '📋 Tax Planning', icon: '📋' },
    { id: 'goals', name: '🎯 Financial Goals', icon: '🎯' }
];

const SUBCATEGORIES = {
    'budgeting': [
        { id: 'monthly_budget', name: 'Monthly Budget Planning' },
        { id: 'emergency_fund', name: 'Emergency Fund Setup' },
        { id: 'expense_tracking', name: 'Expense Tracking' },
        { id: 'debt_management', name: 'Debt Management' }
    ],
    'investments': [
        { id: 'stocks', name: 'Stock Market Investing' },
        { id: 'mutual_funds', name: 'Mutual Funds' },
        { id: 'fixed_deposits', name: 'Fixed Deposits & Bonds' },
        { id: 'retirement_planning', name: 'Retirement Planning' }
    ],
    'loans': [
        { id: 'home_loan', name: 'Home Loan' },
        { id: 'car_loan', name: 'Car Loan' },
        { id: 'personal_loan', name: 'Personal Loan' },
        { id: 'credit_cards', name: 'Credit Card Management' }
    ],
    'insurance': [
        { id: 'health_insurance', name: 'Health Insurance' },
        { id: 'life_insurance', name: 'Life Insurance' },
        { id: 'motor_insurance', name: 'Motor Insurance' },
        { id: 'property_insurance', name: 'Property Insurance' }
    ],
    'tax': [
        { id: 'tax_regime', name: 'Old vs New Tax Regime' },
        { id: 'tax_deductions', name: '80C Deductions & Savings' },
        { id: 'capital_gains', name: 'Capital Gains Tax' },
        { id: 'tax_planning', name: 'Annual Tax Planning' }
    ],
    'goals': [
        { id: 'car_purchase', name: 'Car Purchase Planning' },
        { id: 'house_purchase', name: 'House Purchase Planning' },
        { id: 'retirement', name: 'Retirement Planning' },
        { id: 'education', name: 'Education Funding' }
    ]
};

// Intake Form Templates
const INTAKE_FORMS = {
    'monthly_budget': [
        { name: 'monthly_income', label: 'Monthly Income (₹)', type: 'number', required: true, hint: 'Your total monthly take-home salary' },
        { name: 'fixed_expenses', label: 'Fixed Monthly Expenses (₹)', type: 'number', required: true, hint: 'Rent, utilities, loan EMIs, etc.' },
        { name: 'dependents', label: 'Number of Dependents', type: 'number', required: false, hint: 'Family members you financially support' },
        { name: 'savings_goal', label: 'Monthly Savings Target (%)', type: 'number', required: false, hint: 'What percentage of income do you want to save?' }
    ],
    'emergency_fund': [
        { name: 'monthly_expenses', label: 'Monthly Expenses (₹)', type: 'number', required: true, hint: 'Your total monthly expenses' },
        { name: 'current_savings', label: 'Current Emergency Savings (₹)', type: 'number', required: false, hint: 'Money already saved for emergencies' },
        { name: 'target_months', label: 'Target Coverage (months)', type: 'select', options: ['3', '6', '9', '12'], required: true, hint: 'How many months of expenses to cover?' }
    ],
    'stocks': [
        { name: 'investment_amount', label: 'Investment Amount (₹)', type: 'number', required: true, hint: 'How much do you want to invest?' },
        { name: 'risk_tolerance', label: 'Risk Tolerance', type: 'select', options: ['Low', 'Medium', 'High'], required: true, hint: 'How comfortable are you with market volatility?' },
        { name: 'investment_horizon', label: 'Investment Horizon', type: 'select', options: ['Less than 1 year', '1-3 years', '3-5 years', '5+ years'], required: true, hint: 'How long can you stay invested?' },
        { name: 'experience_level', label: 'Stock Market Experience', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'], required: true }
    ],
    'mutual_funds': [
        { name: 'monthly_sip', label: 'Monthly SIP Amount (₹)', type: 'number', required: true, hint: 'Amount you can invest monthly' },
        { name: 'investment_goal', label: 'Investment Goal', type: 'select', options: ['Wealth Creation', 'Retirement', 'Child Education', 'House Purchase'], required: true },
        { name: 'time_horizon', label: 'Time Horizon (years)', type: 'number', required: true, hint: 'When do you need the money?' },
        { name: 'risk_appetite', label: 'Risk Appetite', type: 'select', options: ['Conservative', 'Moderate', 'Aggressive'], required: true }
    ],
    'home_loan': [
        { name: 'loan_amount', label: 'Loan Amount Required (₹)', type: 'number', required: true, hint: 'How much loan do you need?' },
        { name: 'property_value', label: 'Property Value (₹)', type: 'number', required: true, hint: 'Total cost of the property' },
        { name: 'monthly_income', label: 'Monthly Income (₹)', type: 'number', required: true, hint: 'Your gross monthly income' },
        { name: 'existing_emis', label: 'Existing EMIs (₹)', type: 'number', required: false, hint: 'Current loan EMIs you pay monthly' },
        { name: 'loan_tenure', label: 'Preferred Tenure (years)', type: 'select', options: ['10', '15', '20', '25', '30'], required: true }
    ],
    'car_loan': [
        { name: 'car_price', label: 'Car Price (₹)', type: 'number', required: true, hint: 'On-road price of the car' },
        { name: 'down_payment', label: 'Down Payment (₹)', type: 'number', required: true, hint: 'Amount you can pay upfront' },
        { name: 'monthly_income', label: 'Monthly Income (₹)', type: 'number', required: true },
        { name: 'preferred_tenure', label: 'Loan Tenure (years)', type: 'select', options: ['1', '2', '3', '4', '5', '7'], required: true }
    ],
    'health_insurance': [
        { name: 'age', label: 'Your Age', type: 'number', required: true },
        { name: 'family_members', label: 'Family Members to Cover', type: 'number', required: true, hint: 'Including yourself' },
        { name: 'coverage_amount', label: 'Desired Coverage (₹)', type: 'select', options: ['5,00,000', '10,00,000', '15,00,000', '20,00,000', '25,00,000+'], required: true },
        { name: 'existing_conditions', label: 'Pre-existing Medical Conditions', type: 'textarea', required: false, hint: 'Any chronic conditions or ongoing treatments' }
    ],
    'tax_regime': [
        { name: 'annual_income', label: 'Annual Income (₹)', type: 'number', required: true, hint: 'Your gross annual salary' },
        { name: 'investments_80c', label: 'Current 80C Investments (₹)', type: 'number', required: false, hint: 'PPF, ELSS, Life Insurance premiums, etc.' },
        { name: 'home_loan_interest', label: 'Home Loan Interest (₹)', type: 'number', required: false, hint: 'Annual home loan interest paid' },
        { name: 'other_deductions', label: 'Other Deductions (₹)', type: 'number', required: false, hint: '80D, NPS, etc.' }
    ],
    'car_purchase': [
        { name: 'target_amount', label: 'Car Budget (₹)', type: 'number', required: true, hint: 'How much do you want to spend?' },
        { name: 'time_frame', label: 'When do you plan to buy?', type: 'select', options: ['Within 6 months', '6-12 months', '1-2 years', '2-3 years', '3+ years'], required: true },
        { name: 'current_savings', label: 'Current Savings for Car (₹)', type: 'number', required: false },
        { name: 'monthly_income', label: 'Monthly Income (₹)', type: 'number', required: true }
    ],
    'house_purchase': [
        { name: 'target_amount', label: 'House Budget (₹)', type: 'number', required: true, hint: 'Total budget for house purchase' },
        { name: 'time_frame', label: 'When do you plan to buy?', type: 'select', options: ['Within 1 year', '1-2 years', '2-5 years', '5-10 years', '10+ years'], required: true },
        { name: 'current_savings', label: 'Current Savings (₹)', type: 'number', required: false },
        { name: 'monthly_income', label: 'Monthly Income (₹)', type: 'number', required: true },
        { name: 'preferred_location', label: 'Preferred Location/City', type: 'text', required: false }
    ],
    'retirement': [
        { name: 'current_age', label: 'Current Age', type: 'number', required: true },
        { name: 'retirement_age', label: 'Planned Retirement Age', type: 'number', required: true },
        { name: 'current_income', label: 'Current Annual Income (₹)', type: 'number', required: true },
        { name: 'existing_retirement_savings', label: 'Existing Retirement Savings (₹)', type: 'number', required: false, hint: 'PF, PPF, NPS, other investments' },
        { name: 'monthly_expenses_retirement', label: 'Expected Monthly Expenses in Retirement (₹)', type: 'number', required: false, hint: 'Estimate your lifestyle expenses' }
    ]
};

// Default form for subcategories without specific forms
const DEFAULT_INTAKE_FORM = [
    { name: 'monthly_income', label: 'Monthly Income (₹)', type: 'number', required: true },
    { name: 'financial_goal', label: 'Your Financial Goal', type: 'textarea', required: true, hint: 'Describe what you want to achieve' },
    { name: 'time_frame', label: 'Time Frame', type: 'select', options: ['Immediate', '3-6 months', '6-12 months', '1-2 years', '2+ years'], required: true },
    { name: 'additional_info', label: 'Additional Information', type: 'textarea', required: false, hint: 'Any other relevant details' }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadChats();
    loadSidebarState();
    renderChatList();
    setupEventListeners();
    autoResizeTextarea();
    updateSidebarToggleVisibility();
    console.log('FRIDAY Chat initialized');
});

// Event Listeners
function setupEventListeners() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarToggleExternal.addEventListener('click', toggleSidebar);
    
    // New chat
    newChatBtn.addEventListener('click', createNewChat);
    
    // Send message
    sendBtn.addEventListener('click', sendMessage);
    
    // Quick actions
    qaGeneral.addEventListener('click', () => handleQuickAction('general'));
    qaPersonal.addEventListener('click', () => handleQuickAction('personal'));
    
    // Intake form actions
    skipIntake.addEventListener('click', handleSkipIntake);
    submitIntake.addEventListener('click', handleSubmitIntake);
    intakeFormFields.addEventListener('submit', handleSubmitIntake);
    
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
    
    // Close sidebar when clicking backdrop on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900 && !isSidebarCollapsed && 
            !sidebar.contains(e.target) && !sidebarToggleExternal.contains(e.target)) {
            toggleSidebar();
        }
    });
    
    // Touch gesture support for mobile
    setupTouchGestures();
}

// Sidebar Functions
function toggleSidebar() {
    isSidebarCollapsed = !isSidebarCollapsed;
    sidebar.classList.toggle('collapsed', isSidebarCollapsed);
    
    // Update both toggle buttons
    sidebarToggle.setAttribute('aria-expanded', !isSidebarCollapsed);
    sidebarToggleExternal.setAttribute('aria-expanded', !isSidebarCollapsed);
    
    // Update internal toggle button icon
    sidebarToggle.classList.toggle('collapsed', isSidebarCollapsed);
    
    // Update external toggle button visibility and icon
    updateSidebarToggleVisibility();
    
    // Save state
    saveSidebarState();
}

function updateSidebarToggleVisibility() {
    if (isSidebarCollapsed) {
        sidebarToggleExternal.classList.add('show');
        // Update external toggle icon to point right (open sidebar)
        const togglePath = sidebarToggleExternal.querySelector('.toggle-path');
        togglePath.setAttribute('d', 'M9 18L15 12L9 6');
    } else {
        sidebarToggleExternal.classList.remove('show');
        // Update external toggle icon to point left (close sidebar)
        const togglePath = sidebarToggleExternal.querySelector('.toggle-path');
        togglePath.setAttribute('d', 'M15 18L9 12L15 6');
    }
}

function loadSidebarState() {
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (saved !== null) {
        isSidebarCollapsed = JSON.parse(saved);
        sidebar.classList.toggle('collapsed', isSidebarCollapsed);
        sidebarToggle.classList.toggle('collapsed', isSidebarCollapsed);
        sidebarToggle.setAttribute('aria-expanded', !isSidebarCollapsed);
        sidebarToggleExternal.setAttribute('aria-expanded', !isSidebarCollapsed);
    }
}

function saveSidebarState() {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isSidebarCollapsed));
}

// Touch Gesture Support
function setupTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipeGesture();
    });
    
    function handleSwipeGesture() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 50;
        
        // Only handle horizontal swipes that are longer than vertical swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (window.innerWidth <= 900) {
                if (deltaX > 0 && touchStartX < 50 && isSidebarCollapsed) {
                    // Swipe right from left edge - open sidebar
                    toggleSidebar();
                } else if (deltaX < 0 && !isSidebarCollapsed) {
                    // Swipe left - close sidebar
                    toggleSidebar();
                }
            }
        }
    }
}

// Chat Management
function createNewChat() {
    currentChatId = Date.now();
    const newChat = {
        id: currentChatId,
        title: 'New Chat',
        messages: [],
        type: null, // 'general' or 'personal'
        category: null,
        subcategory: null,
        intakeData: {},
        createdAt: new Date().toISOString()
    };

    chats.unshift(newChat);
    saveChats();
    renderChatList();
    loadChat(currentChatId);
    
    // Show the initial choice bubbles
    showInitialChoiceBubbles();
    
    // Hide welcome message
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

    // Hide all flow components initially
    categoryPicker.classList.add('hidden');
    subcategoryPicker.classList.add('hidden');
    intakeForm.classList.add('hidden');
    
    // Handle chat state based on type
    if (!chat.type) {
        // New chat - show initial choice bubbles
        showInitialChoiceBubbles();
    } else {
        // Established chat - hide choice bubbles
        hideInitialChoiceBubbles();
    }

    // Load chat messages
    if (chat.messages.length === 0) {
        if (chat.type) {
            // Chat has type but no messages - this is normal for completed setup
            // Don't show empty state, just enable input
        } else {
            // New chat without type - show empty state
            showEmptyState();
        }
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

// Initial Choice and Flow Management
function showInitialChoiceBubbles() {
    // Hide all pickers
    categoryPicker.classList.add('hidden');
    subcategoryPicker.classList.add('hidden');
    intakeForm.classList.add('hidden');
    
    // Show the initial choice bubbles
    const promptBubbles = document.querySelector('.prompt-bubbles');
    promptBubbles.style.display = 'flex';
}

function hideInitialChoiceBubbles() {
    const promptBubbles = document.querySelector('.prompt-bubbles');
    promptBubbles.style.display = 'none';
}

// Quick Actions
function handleQuickAction(type) {
    if (!currentChatId) {
        createNewChat();
        // Wait for chat creation to complete
        setTimeout(() => handleQuickAction(type), 100);
        return;
    }
    
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    
    // Hide the initial choice bubbles
    hideInitialChoiceBubbles();
    
    if (type === 'general') {
        chat.type = 'general';
        saveChats();
        
        // Enable normal chat input
        userInput.focus();
        
        // Add a system message
        const systemMessage = "Great! I'm ready to help with your general financial questions. What would you like to know?";
        addSystemMessage(systemMessage);
        
    } else if (type === 'personal') {
        chat.type = 'personal';
        saveChats();
        
        // Start the personal flow with category selection
        showCategoryPicker();
    }
}

// Category Selection
function showCategoryPicker() {
    categoryPicker.classList.remove('hidden');
    
    const categoryBubbles = categoryPicker.querySelector('.category-bubbles');
    categoryBubbles.innerHTML = '';
    
    CATEGORIES.forEach(category => {
        const bubble = document.createElement('button');
        bubble.className = 'category-bubble';
        bubble.textContent = category.name;
        bubble.addEventListener('click', () => selectCategory(category.id));
        categoryBubbles.appendChild(bubble);
    });
}

function selectCategory(categoryId) {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    
    chat.category = categoryId;
    saveChats();
    
    // Hide category picker and show subcategory picker
    categoryPicker.classList.add('hidden');
    showSubcategoryPicker(categoryId);
}

// Subcategory Selection
function showSubcategoryPicker(categoryId) {
    subcategoryPicker.classList.remove('hidden');
    
    const subcategoryBubbles = subcategoryPicker.querySelector('.subcategory-bubbles');
    subcategoryBubbles.innerHTML = '';
    
    const subcategories = SUBCATEGORIES[categoryId] || [];
    
    subcategories.forEach(subcategory => {
        const bubble = document.createElement('button');
        bubble.className = 'subcategory-bubble';
        bubble.textContent = subcategory.name;
        bubble.addEventListener('click', () => selectSubcategory(subcategory.id));
        subcategoryBubbles.appendChild(bubble);
    });
}

function selectSubcategory(subcategoryId) {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    
    chat.subcategory = subcategoryId;
    saveChats();
    
    // Hide subcategory picker and show intake form
    subcategoryPicker.classList.add('hidden');
    showIntakeForm(subcategoryId);
}

// Intake Form
function showIntakeForm(subcategoryId) {
    intakeForm.classList.remove('hidden');
    
    const formFields = INTAKE_FORMS[subcategoryId] || DEFAULT_INTAKE_FORM;
    const fieldsContainer = intakeFormFields;
    fieldsContainer.innerHTML = '';
    
    formFields.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'form-field';
        
        const label = document.createElement('label');
        label.textContent = field.label;
        label.setAttribute('for', field.name);
        fieldDiv.appendChild(label);
        
        let input;
        if (field.type === 'select') {
            input = document.createElement('select');
            input.innerHTML = '<option value="">Select an option</option>';
            field.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                input.appendChild(optionElement);
            });
        } else if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 3;
        } else {
            input = document.createElement('input');
            input.type = field.type || 'text';
        }
        
        input.id = field.name;
        input.name = field.name;
        input.required = field.required || false;
        
        if (field.hint) {
            input.placeholder = field.hint;
        }
        
        fieldDiv.appendChild(input);
        
        if (field.hint) {
            const hint = document.createElement('div');
            hint.className = 'field-hint';
            hint.textContent = field.hint;
            fieldDiv.appendChild(hint);
        }
        
        fieldsContainer.appendChild(fieldDiv);
    });
}

function handleSkipIntake() {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    
    // Hide intake form
    intakeForm.classList.add('hidden');
    
    // Add system message
    const categoryName = CATEGORIES.find(c => c.id === chat.category)?.name || 'your selected area';
    const subcategoryName = SUBCATEGORIES[chat.category]?.find(s => s.id === chat.subcategory)?.name || 'your specific topic';
    
    const systemMessage = `Perfect! I'm ready to help you with ${subcategoryName.toLowerCase()} in ${categoryName.toLowerCase()}. What specific questions do you have?`;
    addSystemMessage(systemMessage);
    
    // Enable input
    userInput.focus();
}

function handleSubmitIntake(e) {
    if (e) e.preventDefault();
    
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;
    
    // Collect form data
    const formData = new FormData(intakeFormFields);
    const intakeData = {};
    
    for (let [key, value] of formData.entries()) {
        if (value.trim()) {
            intakeData[key] = value.trim();
        }
    }
    
    chat.intakeData = intakeData;
    saveChats();
    
    // Hide intake form
    intakeForm.classList.add('hidden');
    
    // Add system message
    const categoryName = CATEGORIES.find(c => c.id === chat.category)?.name || 'your selected area';
    const subcategoryName = SUBCATEGORIES[chat.category]?.find(s => s.id === chat.subcategory)?.name || 'your specific topic';
    
    const systemMessage = `Thanks for sharing your details! I now have a better understanding of your situation with ${subcategoryName.toLowerCase()}. I'll provide personalized advice based on your information. What would you like to know first?`;
    addSystemMessage(systemMessage);
    
    // Enable input
    userInput.focus();
}

// System Message Helper
function addSystemMessage(content) {
    const systemDiv = document.createElement('div');
    systemDiv.className = 'system-message';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'system-message-content';
    contentDiv.textContent = content;
    
    systemDiv.appendChild(contentDiv);
    messages.appendChild(systemDiv);
    
    scrollToBottom();
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
        // Prepare payload with intake data for personal chats
        const chat = chats.find(c => c.id === currentChatId);
        const payload = {
            message: message,
            history: chat ? chat.messages : [],
            user_profile: chat && chat.type === 'personal' ? chat.intakeData : {}
        };
        
        console.log('API Payload:', payload);
        
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
            // Reset to welcome state
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
            
            // Hide all flow components and show initial bubbles
            categoryPicker.classList.add('hidden');
            subcategoryPicker.classList.add('hidden');
            intakeForm.classList.add('hidden');
            showInitialChoiceBubbles();
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
