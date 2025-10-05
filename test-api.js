// Simple API test script
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5002/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test patents endpoint
    const patentsResponse = await fetch('http://localhost:5002/api/patents');
    const patentsData = await patentsResponse.json();
    console.log('✅ Patents endpoint:', patentsData.count, 'patents found');
    
    // Test statistics endpoint
    const statsResponse = await fetch('http://localhost:5002/api/patents/stats/summary');
    const statsData = await statsResponse.json();
    console.log('✅ Statistics:', statsData.stats);
    
    console.log('🎉 All API tests passed!');
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();