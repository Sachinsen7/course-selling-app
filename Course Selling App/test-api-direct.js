const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

async function testQuizAPI() {
  try {
    console.log('=== TESTING QUIZ API DIRECTLY ===');
    

    const testQuizData = {
      lectureId: "688f45eb5ab81dd4a832dc15", 
      title: "Direct API Test Quiz",
      description: "Testing quiz creation directly",
      passPercentage: 70,
      isPublished: true
    };
    
    console.log('Making direct API call to create quiz...');
    console.log('Quiz data:', testQuizData);
  
    const token = "YOUR_JWT_TOKEN_HERE"; 
    
    const response = await axios.post('http://localhost:3000/api/instructor/quiz', testQuizData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Quiz created successfully!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('Quiz creation failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

console.log('IMPORTANT: Replace YOUR_JWT_TOKEN_HERE with your actual token from browser localStorage');
console.log('   1. Open browser dev tools (F12)');
console.log('   2. Go to Application tab -> Local Storage');
console.log('   3. Copy the "token" value');
console.log('   4. Replace YOUR_JWT_TOKEN_HERE in this file');
console.log('   5. Run: node test-api-direct.js');
console.log('');

// Uncomment the line below after adding your token
// testQuizAPI();
