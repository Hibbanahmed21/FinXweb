# 🧪 FRIDAY Chat Interface Testing Checklist

## 🚀 Access Points
- **Main Interface:** http://localhost:8001/chat.html
- **Test Dashboard:** http://localhost:8001/test_chat.html

## ✅ Core Functionality Tests

### 1. **Initial Load & UI**
- [ ] Page loads without JavaScript errors (check browser console)
- [ ] Sidebar is visible with toggle button
- [ ] "New Chat" appears in header
- [ ] Quick action bubbles show: "💬 General Query" and "👤 Personal Query"
- [ ] Input area is present at bottom
- [ ] Dark theme loads correctly

### 2. **Sidebar & Navigation**
- [ ] Click hamburger (☰) to collapse/expand sidebar
- [ ] "＋ New" button creates new chat
- [ ] "🗑" button clears all chats (with confirmation)
- [ ] Search box filters chats
- [ ] Mobile: Sidebar becomes off-canvas overlay

### 3. **General Query Flow**
- [ ] Click "💬 General Query"
- [ ] System message appears
- [ ] Quick actions hide
- [ ] Type message and press Enter
- [ ] User message appears (right side, blue bubble)
- [ ] Typing indicator shows "FRIDAY is typing..."
- [ ] Bot response appears (left side, light bubble)
- [ ] Chat title updates from "New Chat" to first 4 words

### 4. **Personal Query Flow**
- [ ] Click "👤 Personal Query"
- [ ] Category picker appears with 6 categories
- [ ] Click category (e.g., "Budgeting & Saving")
- [ ] Subcategory picker appears
- [ ] Click subcategory (e.g., "Emergency Fund")
- [ ] Intake form appears with relevant fields
- [ ] Fill form and click "Continue" OR click "Skip for now"
- [ ] System message confirms setup
- [ ] Suggested starters appear as bubbles
- [ ] Click suggested starter to auto-fill and send

### 5. **Chat Management**
- [ ] Multiple chats appear in sidebar with icons
- [ ] Click chat to switch between conversations
- [ ] Active chat highlighted in sidebar
- [ ] Click ✏️ to rename chat
- [ ] Click 🗑 to delete chat (with confirmation)
- [ ] Chat search works (try typing partial chat titles)

### 6. **Message Features**
- [ ] Messages show timestamps (HH:MM format)
- [ ] Long messages wrap properly
- [ ] Textarea auto-expands as you type
- [ ] Shift+Enter creates new line
- [ ] Enter sends message
- [ ] Auto-scroll to bottom on new messages

### 7. **Keyboard Shortcuts**
- [ ] **Ctrl/Cmd + K:** Focus search box
- [ ] **Ctrl/Cmd + N:** Create new chat
- [ ] **Escape:** Collapse sidebar / close dev menu

### 8. **Dev Tools** (⚙️ gear icon)
- [ ] Click gear icon to open dev menu
- [ ] "Seed Demo Chats" adds sample conversations
- [ ] "Export Chats" downloads JSON file
- [ ] "Import Chats" accepts uploaded JSON
- [ ] "Clear Storage" resets everything

### 9. **Responsive Design**
- [ ] **Desktop (>900px):** Sidebar toggles width
- [ ] **Tablet (900px):** Sidebar becomes overlay
- [ ] **Mobile (<480px):** Optimized spacing and text
- [ ] Touch interactions work on mobile
- [ ] No horizontal scrolling

### 10. **Data Persistence**
- [ ] Refresh page - chats remain
- [ ] Close/reopen browser - data persists
- [ ] Multiple tabs share same chat data
- [ ] LocalStorage contains "friday_chats" key

## 🎯 Advanced Testing Scenarios

### **Intake Form Validation**
1. Try submitting empty required fields → Should show red error messages
2. Fill valid data → Should proceed to chat
3. Test different categories → Different forms appear

### **API Integration Preparation**
1. Open browser dev tools → Network tab
2. In chat.js, temporarily change `USE_API = true` and `BACKEND_URL = "https://example.com"`
3. Send message → Should see failed network request (expected)
4. Change back to `USE_API = false` → Should work with mock responses

### **Error Handling**
1. Try importing invalid JSON file → Should show error toast
2. Try with disabled localStorage → Should gracefully handle
3. Send very long messages → Should wrap properly

### **Performance**
1. Create 20+ chats → Should scroll smoothly
2. Send rapid messages → Should handle queue properly
3. Large chat history → Should load quickly

## 🐛 Common Issues to Check

- [ ] **Console Errors:** No JavaScript errors in browser console
- [ ] **Missing Files:** All CSS/JS files load (check Network tab)
- [ ] **Mobile Safari:** Test on iOS if available
- [ ] **Firefox/Chrome:** Cross-browser compatibility
- [ ] **Accessibility:** Tab navigation works properly

## 📱 Mobile-Specific Tests

- [ ] Tap to open/close sidebar
- [ ] Virtual keyboard doesn't break layout
- [ ] Touch scrolling in message area
- [ ] Pinch-to-zoom works properly
- [ ] Portrait/landscape orientation

## ✨ Success Criteria

**✅ All tests pass = Production Ready!**

The interface should feel smooth, responsive, and professional - comparable to ChatGPT or other modern chat applications.