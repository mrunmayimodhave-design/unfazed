const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testFullStackDeployment() {
  const tests = [
    { name: 'Health check (/api/health)', path: '/api/health', expectJson: true, expectStatus: 200 },
    { name: 'Therapist Directory (/api/therapist/directory)', path: '/api/therapist/directory', expectJson: true, expectStatus: 200 },
    { name: 'Unknown API route 404 (/api/unknown-endpoint)', path: '/api/unknown-endpoint', expectJson: true, expectStatus: 404 },
    { name: 'Root frontend bundle (/)', path: '/', expectHtml: true, expectStatus: 200 },
    { name: 'SPA client refresh (/therapists)', path: '/therapists', expectHtml: true, expectStatus: 200 },
    { name: 'SPA dynamic slug refresh (/dr-ananya-roy)', path: '/dr-ananya-roy', expectHtml: true, expectStatus: 200 },
    { name: 'SPA dashboard refresh (/dashboard)', path: '/dashboard', expectHtml: true, expectStatus: 200 },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await makeRequest(t.path);
      const statusOk = res.statusCode === t.expectStatus;
      const isHtml = res.data.includes('<div id="root">');
      let isJson = false;
      try {
        JSON.parse(res.data);
        isJson = true;
      } catch (e) {
        isJson = false;
      }

      let contentOk = true;
      if (t.expectJson && !isJson) contentOk = false;
      if (t.expectHtml && !isHtml) contentOk = false;

      if (statusOk && contentOk) {
        console.log(`✅ ${t.name} - PASS (Status: ${res.statusCode})`);
        passed++;
      } else {
        console.error(`❌ ${t.name} - FAIL: Status=${res.statusCode} ExpectStatus=${t.expectStatus} (ContentOk=${contentOk})`);
      }
    } catch (err) {
      console.error(`❌ ${t.name} - ERROR: ${err.message}`);
    }
  }

  console.log(`\n=============================================================`);
  console.log(`Deployment Verification Result: ${passed}/${tests.length} tests passed successfully!`);
  console.log(`=============================================================\n`);

  if (passed === tests.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

testFullStackDeployment();
