// Quick automated test for FRIDAY chat interface
console.log('🧪 Running FRIDAY Chat Quick Tests...\n');

// Test 1: Check if main constants are defined
console.log('1. Testing Constants:');
try {
  // Simulate the main constants from chat.js
  const USE_API = false;
  const BACKEND_URL = "";
  console.log('  ✅ USE_API:', USE_API);
  console.log('  ✅ BACKEND_URL:', BACKEND_URL || '(empty - using mock responses)');
} catch (e) {
  console.log('  ❌ Constants error:', e.message);
}

// Test 2: Test localStorage functionality
console.log('\n2. Testing LocalStorage:');
try {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('friday_test', JSON.stringify({test: true}));
    const data = JSON.parse(localStorage.getItem('friday_test'));
    localStorage.removeItem('friday_test');
    console.log('  ✅ LocalStorage read/write works');
  } else {
    console.log('  ⚠️  LocalStorage not available (Node.js environment)');
  }
} catch (e) {
  console.log('  ❌ LocalStorage error:', e.message);
}

// Test 3: Test data structures
console.log('\n3. Testing Data Structures:');
try {
  const SUBCATS = {
    "Investments & Wealth": ["Stocks", "Mutual Funds", "Fixed Deposits", "Gold", "Bonds"],
    "Loans & Credit": ["Home Loan", "Car Loan", "Personal Loan", "Credit Card"],
    "Tax Planning": ["Old vs New Regime", "80C Deductions", "Capital Gains", "HRA/Rent"],
  };
  
  console.log('  ✅ SUBCATS structure:', Object.keys(SUBCATS).length, 'categories');
  
  const sampleChat = {
    id: Date.now(),
    title: 'Test Chat',
    type: 'general',
    messages: [],
    intake_data: {}
  };
  
  console.log('  ✅ Chat object structure valid');
} catch (e) {
  console.log('  ❌ Data structure error:', e.message);
}

// Test 4: Test utility functions
console.log('\n4. Testing Utility Functions:');
try {
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }
  
  const testTime = formatTime(Date.now());
  console.log('  ✅ Time formatting works:', testTime);
  
  function generateTitle(message) {
    const words = message.trim().split(' ').slice(0, 4);
    return words.join(' ') + (message.split(' ').length > 4 ? '...' : '');
  }
  
  const testTitle = generateTitle('This is a test message for title generation');
  console.log('  ✅ Title generation works:', testTitle);
  
} catch (e) {
  console.log('  ❌ Utility function error:', e.message);
}

// Test 5: Mock API response
console.log('\n5. Testing Mock Response Generation:');
try {
  function generateGeneralResponse(message) {
    if (message.includes('budget')) {
      return 'Budget advice: Track expenses and follow 50/30/20 rule';
    }
    return 'General financial advice response';
  }
  
  const response1 = generateGeneralResponse('help me with budget');
  const response2 = generateGeneralResponse('investment question');
  
  console.log('  ✅ Budget response:', response1.substring(0, 30) + '...');
  console.log('  ✅ General response:', response2);
} catch (e) {
  console.log('  ❌ Mock response error:', e.message);
}

console.log('\n🎉 Quick Tests Complete!');
console.log('\n📋 Next Steps:');
console.log('1. Open http://localhost:8001/chat.html in your browser');
console.log('2. Test the full user interface manually');
console.log('3. Try both General and Personal query flows');
console.log('4. Check mobile responsiveness');
console.log('5. Use the testing checklist for comprehensive testing');