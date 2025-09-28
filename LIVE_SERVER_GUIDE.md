# 🚀 FRIDAY Live Server - Development Guide

## 🌐 **Live Server is Running!**

### **🔗 Access URLs:**
- **📱 Main Chat Interface:** http://localhost:3000/chat.html
- **🧪 Test Dashboard:** http://localhost:3000/../test_chat.html  
- **📋 Testing Summary:** http://localhost:3000/../TESTING_SUMMARY.md

---

## ⚡ **Live Server Features**

✅ **Auto-reload** - Changes reflect immediately  
✅ **No caching** - Always serves latest files  
✅ **CORS enabled** - Ready for API integration  
✅ **Live logging** - See requests in real-time  
✅ **Development optimized** - Perfect for testing

---

## 🎯 **Quick Testing Guide**

### **1. Basic Functionality (30 seconds)**
1. Open http://localhost:3000/chat.html
2. Click "💬 General Query"
3. Type: "How to create a budget?" 
4. Press Enter → See typing indicator → Get AI response

### **2. Personal Query Flow (2 minutes)**
1. Click "＋ New" for fresh chat
2. Click "👤 Personal Query" 
3. Choose: "Budgeting & Saving" → "Monthly Budget"
4. Fill intake form (age: 25, income: 50000, etc.)
5. Click "Continue" → See personalized advice

### **3. Advanced Features (1 minute)**
- **Sidebar:** Click ☰ to collapse/expand
- **Mobile:** Resize browser to test responsive design
- **Shortcuts:** Ctrl+K (search), Ctrl+N (new chat), Esc (collapse)
- **Dev Tools:** Click ⚙️ gear → "Seed Demo Chats"

---

## 🛠️ **Development Workflow**

### **Making Changes:**
1. Edit files in `/workspace/Chat/` directory
2. Save the file
3. Refresh browser → Changes appear instantly
4. No server restart needed!

### **File Structure:**
```
Chat/
├── chat.html      ← Main interface
├── css/chat.css   ← Styles and themes  
├── js/chat.js     ← All functionality
├── chat_core.py   ← Python AI backend
└── config/        ← System prompts
```

### **Common Development Tasks:**
- **Edit UI:** Modify `chat.html` or `chat.css`
- **Add features:** Update `chat.js` 
- **Change prompts:** Edit files in `config/`
- **API integration:** Set `USE_API = true` in `chat.js`

---

## 🔌 **API Integration Ready**

When your Python backend is ready:

1. **Start your backend server** (Flask/FastAPI)
2. **Get ngrok URL** (if needed): `ngrok http 5000`
3. **Update chat.js:**
   ```javascript
   const USE_API = true;
   const BACKEND_URL = "https://your-ngrok-url.com";
   ```
4. **Refresh browser** → Now uses real AI responses!

---

## 📱 **Mobile Testing**

### **Desktop Browser:**
- Resize window to test responsive breakpoints
- Use browser dev tools (F12) → Device simulation

### **Real Mobile:**
- Find your local IP: `ifconfig` or `ipconfig`
- Access: `http://YOUR_IP:3000/chat.html`
- Test touch interactions and virtual keyboard

---

## 🐛 **Troubleshooting**

### **Server Not Responding:**
- Check if port 3000 is free
- Restart server if needed
- Check firewall settings

### **Changes Not Appearing:**
- Hard refresh: Ctrl+F5 (Windows) / Cmd+Shift+R (Mac)
- Clear browser cache
- Check browser console (F12) for errors

### **Mobile Issues:**
- Ensure devices on same network
- Check local IP address
- Test in different mobile browsers

---

## 🏆 **Production Deployment**

When ready for production:

1. **Build optimized version** (minify CSS/JS if needed)
2. **Deploy to web server** (Nginx, Apache, Vercel, Netlify)
3. **Set up HTTPS** for secure connections
4. **Configure API endpoints** for production backend
5. **Add analytics** and error monitoring

---

## 🎉 **Happy Developing!**

The FRIDAY chat interface is now running in live development mode. Make changes and see them instantly in your browser!

**Need help?** Check the testing guides or console logs for debugging.