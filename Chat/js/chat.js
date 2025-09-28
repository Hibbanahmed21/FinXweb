// Global Configuration
let USE_API = JSON.parse(localStorage.getItem("friday_use_api") || "false");
let BACKEND_URL = localStorage.getItem("friday_backend_url") || "https://<ngrok_url>/chat";

// Global State
let chats = JSON.parse(localStorage.getItem("friday_chats")) || [];
let currentChatId = null;

// DOM Elements
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarHoverToggle = document.getElementById("sidebarHoverToggle");
const newChatBtn = document.getElementById("newChatBtn");
const chatList = document.getElementById("chatList");
const chatTitle = document.getElementById("chatTitle");
const messagesContainer = document.getElementById("messagesContainer");
const quickActions = document.getElementById("quickActions");
const categoryPanel = document.getElementById("categoryPanel");
const subcategoryPanel = document.getElementById("subcategoryPanel");
const subcategoryContainer = document.getElementById("subcategoryContainer");
const intakePanel = document.getElementById("intakePanel");
const intakeForm = document.getElementById("intakeForm");
const typingIndicator = document.getElementById("typingIndicator");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const themeToggle = document.getElementById("themeToggle");
const scrollBottomBtn = document.getElementById("scrollBottomBtn");
const connectApiBtn = document.getElementById("connectApiBtn");

// Subcategory mappings
const subcategories = {
  "Budgeting": ["Monthly Budget", "Emergency Fund", "Expense Tracking", "Debt Management"],
  "Investments": ["Stocks", "Mutual Funds", "Real Estate", "Retirement Planning", "Portfolio Review"],
  "Loans": ["Home Loan", "Personal Loan", "Education Loan", "Loan Refinancing"],
  "Insurance": ["Health Insurance", "Life Insurance", "Vehicle Insurance", "Property Insurance"],
  "Tax": ["Tax Planning", "Tax Filing", "Tax Deductions", "Tax Optimization"],
  "Goals": ["Buying a Home", "Child Education", "Retirement", "Vacation Planning", "Starting a Business"]
};

// Intake form fields based on category/subcategory
const intakeFields = {
  "Budgeting": [
    { name: "monthly_income", label: "Monthly Income", type: "number", placeholder: "50000" },
    { name: "monthly_expenses", label: "Monthly Expenses", type: "number", placeholder: "30000" },
    { name: "age", label: "Age", type: "number", placeholder: "30" },
    { name: "dependents", label: "Number of Dependents", type: "number", placeholder: "2" },
    { name: "employment_type", label: "Employment Type", type: "select", options: ["Salaried", "Self-Employed", "Business Owner", "Freelancer"] }
  ],
  "Investments": [
    { name: "monthly_income", label: "Monthly Income", type: "number", placeholder: "75000" },
    { name: "investment_amount", label: "Investment Amount", type: "number", placeholder: "10000" },
    { name: "age", label: "Age", type: "number", placeholder: "35" },
    { name: "risk_tolerance", label: "Risk Tolerance", type: "select", options: ["Conservative", "Moderate", "Aggressive"] },
    { name: "investment_horizon", label: "Investment Horizon", type: "select", options: ["< 1 year", "1-3 years", "3-5 years", "5-10 years", "> 10 years"] }
  ],
  "Loans": [
    { name: "monthly_income", label: "Monthly Income", type: "number", placeholder: "60000" },
    { name: "loan_amount", label: "Loan Amount Required", type: "number", placeholder: "500000" },
    { name: "age", label: "Age", type: "number", placeholder: "32" },
    { name: "employment_type", label: "Employment Type", type: "select", options: ["Salaried", "Self-Employed", "Business Owner"] },
    { name: "existing_loans", label: "Existing Loan EMIs", type: "number", placeholder: "15000" }
  ],
  "Insurance": [
    { name: "monthly_income", label: "Monthly Income", type: "number", placeholder: "55000" },
    { name: "age", label: "Age", type: "number", placeholder: "28" },
    { name: "dependents", label: "Number of Dependents", type: "number", placeholder: "3" },
    { name: "health_conditions", label: "Pre-existing Health Conditions", type: "select", options: ["None", "Diabetes", "Hypertension", "Heart Disease", "Other"] },
    { name: "coverage_amount", label: "Desired Coverage Amount", type: "number", placeholder: "1000000" }
  ],
  "Tax": [
    { name: "annual_income", label: "Annual Income", type: "number", placeholder: "800000" },
    { name: "age", label: "Age", type: "number", placeholder: "40" },
    { name: "employment_type", label: "Employment Type", type: "select", options: ["Salaried", "Self-Employed", "Business Owner"] },
    { name: "investments_80c", label: "Current 80C Investments", type: "number", placeholder: "150000" },
    { name: "home_loan_interest", label: "Home Loan Interest", type: "number", placeholder: "200000" }
  ],
  "Goals": [
    { name: "monthly_income", label: "Monthly Income", type: "number", placeholder: "70000" },
    { name: "goal_amount", label: "Goal Amount", type: "number", placeholder: "2000000" },
    { name: "goal_timeline", label: "Timeline to Achieve Goal", type: "select", options: ["1 year", "2-3 years", "3-5 years", "5-10 years", "> 10 years"] },
    { name: "age", label: "Age", type: "number", placeholder: "30" },
    { name: "current_savings", label: "Current Savings", type: "number", placeholder: "100000" }
  ]
};

// Event Listeners
document.addEventListener("DOMContentLoaded", init);
sidebarToggle.addEventListener("click", toggleSidebar);
sidebarHoverToggle.addEventListener("click", toggleSidebar);
newChatBtn.addEventListener("click", startNewChat);
sendBtn.addEventListener("click", handleSend);
themeToggle.addEventListener("click", toggleTheme);
if (connectApiBtn) connectApiBtn.addEventListener("click", connectApiPrompt);

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = userInput.scrollHeight + "px";
});

// Smooth auto-scroll utilities
function smoothScrollToBottom() {
  messagesContainer.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
}

// Initialization
function init() {
  loadTheme();
  renderChatList();
  if (chats.length === 0) {
    showWelcomeMessage();
  } else {
    loadChat(chats[0].id);
  }
}

function loadTheme() {
  const theme = localStorage.getItem("friday_theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

function connectApiPrompt() {
  const current = BACKEND_URL || "";
  const entered = prompt("Enter your API endpoint URL (e.g., https://xxxx.ngrok.io/chat)", current);
  if (entered && entered.startsWith("http")) {
    BACKEND_URL = entered.trim();
    USE_API = true;
    localStorage.setItem("friday_backend_url", BACKEND_URL);
    localStorage.setItem("friday_use_api", JSON.stringify(USE_API));
    alert("API connected. I'll use the backend for replies now.");
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("friday_theme", newTheme);
  themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
}

function toggleSidebar() {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    sidebar.classList.toggle("open");
  } else {
    sidebar.classList.toggle("collapsed");
  }
}

// Chat Management
function saveChats() {
  localStorage.setItem("friday_chats", JSON.stringify(chats));
  renderChatList();
}

function startNewChat() {
  const chatId = "chat_" + Date.now();
  const newChat = {
    id: chatId,
    type: null,
    category: null,
    subcategory: null,
    intakeData: {},
    messages: [],
    createdAt: Date.now()
  };
  
  chats.unshift(newChat);
  currentChatId = chatId;
  saveChats();
  loadChat(chatId);
  showQuickActionBubbles();
  renderFridayIntro();
  enableInput(false);
}

function loadChat(chatId) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  
  currentChatId = chatId;
  chatTitle.textContent = chat.type ? `${chat.category || "Chat"} - ${chat.subcategory || "General"}` : "New Chat";
  
  // Clear messages container
  messagesContainer.innerHTML = "";
  
  // Render messages
  chat.messages.forEach(msg => {
    renderMessage(msg.role, msg.content, new Date(msg.ts));
  });
  
  // Show appropriate panels
  hideAllPanels();
  
  if (!chat.type) {
    showQuickActionBubbles();
    renderFridayIntro();
    enableInput(false);
  } else if (chat.type === "personal" && !chat.subcategory) {
    showCategoryPanel();
    enableInput(false);
  } else {
    enableInput(true);
  }
  
  scrollToBottom();
  updateChatListActiveState();
}

function renderChatList() {
  chatList.innerHTML = "";
  chats.forEach(chat => {
    const chatItem = document.createElement("div");
    chatItem.className = "chat-item";
    chatItem.onclick = (e) => {
      // Don't load chat if clicking on actions
      if (!e.target.closest('.chat-item-actions')) {
        loadChat(chat.id);
      }
    };
    
    const title = chat.customTitle || (chat.category && chat.subcategory 
      ? `${chat.category} - ${chat.subcategory}`
      : chat.type === "general" 
        ? "General Chat"
        : "New Chat");
    
    const preview = chat.messages.length > 0 
      ? chat.messages[chat.messages.length - 1].content.substring(0, 50) + "..."
      : "Start chatting...";
    
    chatItem.innerHTML = `
      <div class="chat-item-content">
        <div class="chat-item-title">${title}</div>
        <div class="chat-item-preview">${preview}</div>
      </div>
      <div class="chat-item-actions">
        <div class="chat-menu">
          <button class="chat-action-btn" onclick="toggleChatMenu(event, '${chat.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
          <div class="chat-menu-dropdown" id="menu-${chat.id}">
            <div class="chat-menu-item" onclick="renameChat('${chat.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Rename
            </div>
            <div class="chat-menu-item delete" onclick="deleteChat('${chat.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
              </svg>
              Delete
            </div>
          </div>
        </div>
      </div>
    `;
    
    chatList.appendChild(chatItem);
  });
}

function updateChatListActiveState() {
  document.querySelectorAll(".chat-item").forEach((item, index) => {
    if (chats[index].id === currentChatId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

// Quick Actions and Flow
function showQuickActionBubbles() {
  quickActions.innerHTML = `
    <button class="qa-bubble" onclick="selectChatType('general')">
      💬 General Finance Questions
    </button>
    <button class="qa-bubble" onclick="selectChatType('personal')">
      👤 Personalized Advice
    </button>
  `;
  quickActions.style.display = "flex";
  // trigger stagger animation
  requestAnimationFrame(() => {
    quickActions.classList.add('show');
  });
}

function selectChatType(type) {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  chat.type = type;
  saveChats();
  
  hideAllPanels();
  
  if (type === "general") {
    enableInput(true);
    chatTitle.textContent = "General Finance Chat";

    // Auto-greeting from FRIDAY for General queries (only once per chat)
    const alreadyGreeted = chat.messages.some(m => m.role === "assistant" && m.content.startsWith("Hi, I'm FRIDAY"));
    if (!alreadyGreeted) {
      const greet = {
        role: "assistant",
        content: "Hi, I'm FRIDAY. Ask me anything about money — budgeting, investing, loans, insurance or taxes. What would you like to know?",
        ts: Date.now()
      };
      chat.messages.push(greet);
      renderMessage("bot", greet.content, new Date(greet.ts));
      saveChats();
      scrollToBottom();
    }
  } else {
    showCategoryPanel();
    chatTitle.textContent = "Personal Finance Setup";
  }
}

function showCategoryPanel() {
  categoryPanel.style.display = "block";
  
  // Add event listeners to category pills
  document.querySelectorAll(".pill[data-category]").forEach(pill => {
    pill.onclick = () => selectCategory(pill.dataset.category);
  });
}

function selectCategory(category) {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  chat.category = category;
  saveChats();
  
  categoryPanel.style.display = "none";
  showSubcategoryPanel(category);
}

function showSubcategoryPanel(category) {
  const subs = subcategories[category] || [];
  subcategoryContainer.innerHTML = "";
  
  subs.forEach(sub => {
    const pill = document.createElement("button");
    pill.className = "pill";
    pill.textContent = sub;
    pill.onclick = () => selectSubcategory(sub);
    subcategoryContainer.appendChild(pill);
  });
  
  subcategoryPanel.style.display = "block";
}

function selectSubcategory(subcategory) {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  chat.subcategory = subcategory;
  saveChats();
  
  subcategoryPanel.style.display = "none";
  showIntakeForm(chat.category);
}

function showIntakeForm(category) {
  const fields = intakeFields[category] || intakeFields["Budgeting"];
  intakeForm.innerHTML = "";
  
  fields.forEach(field => {
    const formGroup = document.createElement("div");
    formGroup.className = "form-group";
    
    const label = document.createElement("label");
    label.textContent = field.label;
    label.setAttribute("for", field.name);
    
    let input;
    if (field.type === "select") {
      input = document.createElement("select");
      input.innerHTML = '<option value="">Select...</option>';
      field.options.forEach(option => {
        const optionEl = document.createElement("option");
        optionEl.value = option;
        optionEl.textContent = option;
        input.appendChild(optionEl);
      });
    } else {
      input = document.createElement("input");
      input.type = field.type;
      input.placeholder = field.placeholder || "";
    }
    
    input.name = field.name;
    input.id = field.name;
    
    formGroup.appendChild(label);
    formGroup.appendChild(input);
    intakeForm.appendChild(formGroup);
  });
  
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "submit-btn";
  submitBtn.textContent = "Continue";
  intakeForm.appendChild(submitBtn);
  
  intakeForm.onsubmit = handleIntakeSubmit;
  intakePanel.style.display = "block";
}

function handleIntakeSubmit(e) {
  e.preventDefault();
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  const formData = new FormData(intakeForm);
  chat.intakeData = {};
  
  for (let [key, value] of formData.entries()) {
    chat.intakeData[key] = value;
  }
  
  saveChats();
  hideAllPanels();
  
  // Add system message
  const systemMsg = {
    role: "assistant",
    content: `Great! I've collected your information for ${chat.category} → ${chat.subcategory}. I'll now provide personalized advice based on your profile. What would you like to know?`,
    ts: Date.now()
  };
  
  chat.messages.push(systemMsg);
  renderMessage("bot", systemMsg.content, new Date(systemMsg.ts));
  saveChats();
  
  enableInput(true);
  chatTitle.textContent = `${chat.category} - ${chat.subcategory}`;
  scrollToBottom();
}

// Message Handling
function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;
  
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  // Add user message
  const userMsg = {
    role: "user",
    content: text,
    ts: Date.now()
  };
  
  chat.messages.push(userMsg);
  renderMessage("user", text, new Date(userMsg.ts));
  saveChats();
  
  userInput.value = "";
  userInput.style.height = "auto";
  
  getAssistantReply(chat, text);
}

async function getAssistantReply(chat, userText) {
  typingIndicator.style.display = "flex";
  typingIndicator.classList.add('show');
  scrollToBottom();
  
  const payload = {
    message: userText,
    history: chat.messages,
    user_profile: chat.intakeData || {}
  };
  
  let reply;
  
  if (USE_API && BACKEND_URL) {
    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      reply = data.reply;
    } catch (error) {
      console.error("API Error:", error);
      reply = "⚠️ Error contacting backend. Please try again.";
    }
  } else {
    // Demo stub responses
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
    
    if (chat.type === "personal") {
      const income = chat.intakeData.monthly_income || chat.intakeData.annual_income || "N/A";
      reply = `📊 **Personalized ${chat.category} advice for ${chat.subcategory}:**\n\n` +
              `Based on your profile:\n` +
              `• Income: ₹${income}\n` +
              `• Category: ${chat.category}\n` +
              `• Focus: ${chat.subcategory}\n\n` +
              `Here's my recommendation: [This is a demo response. Connect your backend for real advice.]\n\n` +
              `💡 *Disclaimer: This is a demo response for testing purposes.*`;
    } else {
      const responses = [
        "💬 Here's some general finance advice: Always maintain an emergency fund of 6-12 months of expenses. This provides financial security during unexpected situations.",
        "📈 Investment tip: Diversify your portfolio across different asset classes to manage risk effectively. Consider a mix of equity, debt, and alternative investments.",
        "💰 Budgeting advice: Follow the 50-30-20 rule - 50% for needs, 30% for wants, and 20% for savings and investments.",
        "🏦 For loans, always compare interest rates from multiple lenders and read the fine print before signing any agreement."
      ];
      reply = responses[Math.floor(Math.random() * responses.length)] + "\n\n💡 *This is a demo response. Connect your backend for personalized advice.*";
    }
  }
  
  typingIndicator.classList.remove('show');
  typingIndicator.style.display = "none";
  
  const assistantMsg = {
    role: "assistant",
    content: reply,
    ts: Date.now()
  };
  
  chat.messages.push(assistantMsg);
  renderMessage("bot", reply, new Date(assistantMsg.ts));
  saveChats();
  scrollToBottom();
}

function renderMessage(role, content, timestamp) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `msg ${role}`;
  
  const avatar = document.createElement("div");
  avatar.className = "msg-avatar";
  avatar.textContent = role === "user" ? "👤" : "🤖";
  
  const contentDiv = document.createElement("div");
  contentDiv.className = "msg-content";
  contentDiv.textContent = content;
  
  const timeDiv = document.createElement("div");
  timeDiv.className = "msg-time";
  timeDiv.textContent = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(contentDiv);
  messageDiv.appendChild(timeDiv);
  
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

// Utility Functions
function hideAllPanels() {
  quickActions.style.display = "none";
  categoryPanel.style.display = "none";
  subcategoryPanel.style.display = "none";
  intakePanel.style.display = "none";
}

function enableInput(enabled) {
  userInput.disabled = !enabled;
  sendBtn.disabled = !enabled;
  if (enabled) {
    userInput.focus();
  }
}

function showWelcomeMessage() {
  chatTitle.textContent = "Welcome to Friday";
  renderFridayIntro();
  enableInput(false);
}

function scrollToBottom() {
  smoothScrollToBottom();
}

// Friday Intro helper
function renderFridayIntro() {
  messagesContainer.innerHTML = `
    <div class="welcome-message">
      <div class="bot-avatar">🤖</div>
      <div class="welcome-text">
        <h3>Welcome — I'm FRIDAY</h3>
        <p><strong>FRIDAY</strong> stands for:</p>
        <ul class="friday-acro">
          <li><strong>F</strong>inancial</li>
          <li><strong>R</strong>easoning</li>
          <li><strong>I</strong>ntelligent</li>
          <li><strong>D</strong>ecision</li>
          <li><strong>A</strong>ssistant for</li>
          <li><strong>Y</strong>ou</li>
        </ul>
        <p>I help you make confident money decisions — from budgets and goals to investing, loans, insurance and taxes. Start a new chat or choose an option below.</p>
      </div>
    </div>
  `;
}

// Chat Menu Functions
function toggleChatMenu(event, chatId) {
  event.stopPropagation();
  
  // Close all other menus
  document.querySelectorAll('.chat-menu-dropdown').forEach(menu => {
    if (menu.id !== `menu-${chatId}`) {
      menu.classList.remove('show');
    }
  });
  
  // Toggle current menu
  const menu = document.getElementById(`menu-${chatId}`);
  menu.classList.toggle('show');
}

function renameChat(chatId) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  
  const currentTitle = chat.category && chat.subcategory 
    ? `${chat.category} - ${chat.subcategory}`
    : chat.type === "general" 
      ? "General Chat"
      : "New Chat";
  
  const newTitle = prompt("Enter new chat title:", currentTitle);
  if (newTitle && newTitle.trim() !== "" && newTitle !== currentTitle) {
    // Store custom title
    chat.customTitle = newTitle.trim();
    saveChats();
    renderChatList();
  }
  
  // Close menu
  document.querySelectorAll('.chat-menu-dropdown').forEach(menu => {
    menu.classList.remove('show');
  });
}

function deleteChat(chatId) {
  if (confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
    const chatIndex = chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      chats.splice(chatIndex, 1);
      saveChats();
      
      // If we deleted the current chat, load the first available chat or show welcome
      if (currentChatId === chatId) {
        if (chats.length > 0) {
          loadChat(chats[0].id);
        } else {
          showWelcomeMessage();
        }
      } else {
        renderChatList();
      }
    }
  }
  
  // Close menu
  document.querySelectorAll('.chat-menu-dropdown').forEach(menu => {
    menu.classList.remove('show');
  });
}

// Close menus when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.chat-menu')) {
    document.querySelectorAll('.chat-menu-dropdown').forEach(menu => {
      menu.classList.remove('show');
    });
  }
});

// Mobile responsiveness
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    sidebar.classList.remove("open");
  }
});

// Show/hide scroll-to-bottom button and compact header on scroll
messagesContainer.addEventListener('scroll', () => {
  const nearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 60;
  scrollBottomBtn.style.display = nearBottom ? 'none' : 'flex';
  const header = document.querySelector('.chat-header');
  if (messagesContainer.scrollTop > 20) header.classList.add('compact');
  else header.classList.remove('compact');
});

if (scrollBottomBtn) {
  scrollBottomBtn.addEventListener('click', () => {
    smoothScrollToBottom();
  });
}

// Update sidebar toggle for mobile
if (window.innerWidth <= 768) {
  sidebarToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.toggle("open");
  });
  
  // Close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
      sidebar.classList.remove("open");
    }
  });
}