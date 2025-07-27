// test-backend.js
// Simple test script to verify backend functionality

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testVendor = {
  name: 'Test Vendor',
  email: 'testvendor@example.com',
  phone: '9876543210',
  password: 'test123',
  confirmPassword: 'test123',
  userType: 'vendor'
};

const testSupplier = {
  name: 'Test Supplier',
  email: 'testsupplier@example.com',
  phone: '9876543211',
  password: 'test123',
  confirmPassword: 'test123',
  userType: 'supplier'
};

// Helper function to make API calls
async function makeRequest(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();

    return {
      status: response.status,
      data: result,
      success: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      success: false
    };
  }
}

// Test functions
async function testServerStatus() {
  console.log('\n🧪 Testing Server Status...');
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      console.log('✅ Server is running on http://localhost:3000');
      return true;
    } else {
      console.log('❌ Server responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start with: npm run dev');
    return false;
  }
}

async function testSignup() {
  console.log('\n🧪 Testing Vendor Signup...');
  const result = await makeRequest('/auth/signup', 'POST', testVendor);
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.success;
}

async function testSignin() {
  console.log('\n🧪 Testing Vendor Signin...');
  const result = await makeRequest('/auth/signin', 'POST', {
    email: testVendor.email,
    password: testVendor.password,
    userType: testVendor.userType
  });
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.success;
}

async function testSupplierSignup() {
  console.log('\n🧪 Testing Supplier Signup...');
  const result = await makeRequest('/auth/signup', 'POST', testSupplier);
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.success;
}

async function testProducts() {
  console.log('\n🧪 Testing Products API...');
  const result = await makeRequest('/products');
  console.log('Status:', result.status);
  console.log('Response:', result.data);
  return result.success;
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting SathiBuy Backend Tests...');
  console.log('Make sure your backend is running on http://localhost:3000');

  // First check if server is running
  const serverRunning = await testServerStatus();
  if (!serverRunning) {
    console.log('\n❌ Cannot run tests - server is not running');
    console.log('Please start the server with: npm run dev');
    return;
  }

  const tests = [
    { name: 'Vendor Signup', fn: testSignup },
    { name: 'Vendor Signin', fn: testSignin },
    { name: 'Supplier Signup', fn: testSupplierSignup },
    { name: 'Products API', fn: testProducts }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    try {
      const success = await test.fn();
      if (success) {
        console.log(`✅ ${test.name} - PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAILED`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ERROR:`, error.message);
    }
  }

  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
  }

  console.log('\n💡 Next Steps:');
  console.log('1. Open http://localhost:3000 in your browser');
  console.log('2. Try signing up as a vendor or supplier');
  console.log('3. Test the login functionality');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, makeRequest }; 