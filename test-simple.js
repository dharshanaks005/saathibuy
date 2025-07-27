// Simple test to check server status and API endpoints
const BASE_URL = 'http://localhost:3000';

async function testServer() {
  console.log('🧪 Testing server status...');
  
  try {
    // Test if server is running
    const response = await fetch(BASE_URL);
    console.log('✅ Server is running');
    console.log('Status:', response.status);
    
    // Test API endpoint
    const apiResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        userType: 'vendor'
      }),
    });
    
    const data = await apiResponse.json();
    console.log('API Response Status:', apiResponse.status);
    console.log('API Response:', data);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testServer(); 