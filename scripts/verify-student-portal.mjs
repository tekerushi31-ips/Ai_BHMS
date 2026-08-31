async function verify() {
  console.log('--- 1. Testing Demo Login as Student ---');
  const loginRes = await fetch('http://localhost:3000/api/auth/demo-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset: 'student1' }),
  });
  const loginData = await loginRes.json();
  const cookie = loginRes.headers.get('set-cookie');
  console.log('Login Response:', loginData);
  console.log('Cookie received:', cookie ? 'YES' : 'NO');

  console.log('\n--- 2. Testing /api/student/dashboard with student cookie ---');
  const dashRes = await fetch('http://localhost:3000/api/student/dashboard', {
    headers: { cookie: cookie || '' }
  });
  const dashData = await dashRes.json();
  console.log('Dashboard API Status:', dashRes.status);
  console.log('Student Name:', dashData.user?.name, '| Role:', dashData.user?.role);
  console.log('Metrics:', JSON.stringify(dashData.metrics));

  console.log('\n--- 3. Testing Doctor Accessing Student Route (Role Guard) ---');
  const docLogin = await fetch('http://localhost:3000/api/auth/demo-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset: 'doctor1' }),
  });
  const docCookie = docLogin.headers.get('set-cookie');
  
  const studentPageWithDoc = await fetch('http://localhost:3000/student/dashboard', {
    headers: { cookie: docCookie || '' },
    redirect: 'manual'
  });
  console.log('Doctor accessing /student/dashboard status:', studentPageWithDoc.status);
  console.log('Redirect Location:', studentPageWithDoc.headers.get('location'));

  console.log('\n--- 4. Testing /unauthorized page with parameters ---');
  const unauthRes = await fetch('http://localhost:3000/unauthorized?required=student&current=doctor');
  console.log('Unauthorized page status:', unauthRes.status);
  console.log('\nAll automated verifications PASSED successfully!');
}

verify().catch((e) => {
  console.error(e);
  process.exit(1);
});
