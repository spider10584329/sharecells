// Test script to verify agent filtering is working
const testAgentFiltering = async () => {
  console.log('Testing agent data filtering...');
  
  try {
    // First test with admin login
    console.log('\n1. Testing admin login and data access:');
    const adminLoginResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@test.com', // Replace with valid admin credentials
        password: 'password',
        role: 'admin'
      })
    });
    
    if (!adminLoginResponse.ok) {
      console.log('Admin login failed, skipping admin test');
    } else {
      const adminData = await adminLoginResponse.json();
      console.log('Admin login successful:', adminData.user?.role);
      
      // Get cookies from response
      const adminCookies = adminLoginResponse.headers.get('set-cookie');
      console.log('Admin cookies set:', !!adminCookies);
    }
    
    // Test with agent login
    console.log('\n2. Testing agent login and data access:');
    const agentLoginResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'agent@test.com', // Replace with valid agent credentials
        password: 'password',
        role: 'agent'
      })
    });
    
    if (!agentLoginResponse.ok) {
      console.log('Agent login failed, please check credentials');
      const errorData = await agentLoginResponse.json();
      console.log('Error:', errorData);
    } else {
      const agentData = await agentLoginResponse.json();
      console.log('Agent login successful:', agentData.user?.role);
      
      // Get cookies from response
      const agentCookies = agentLoginResponse.headers.get('set-cookie');
      console.log('Agent cookies set:', !!agentCookies);
      
      // Test accessing sheet data with agent credentials
      if (agentCookies) {
        console.log('\n3. Testing agent sheet data access:');
        const sheetDataResponse = await fetch('http://localhost:3000/api/agent/sheet-data/64', {
          headers: {
            'Cookie': agentCookies
          }
        });
        
        if (sheetDataResponse.ok) {
          const sheetData = await sheetDataResponse.json();
          console.log('Agent sheet data rows count:', sheetData.rows?.length || 0);
          console.log('Agent sees rows from users:', sheetData.rows?.map(r => r.user_id || 'admin'));
        } else {
          const errorData = await sheetDataResponse.json();
          console.log('Agent sheet data error:', errorData);
        }
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testAgentFiltering();
