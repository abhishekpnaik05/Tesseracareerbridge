// Simple script to check and repair week indices
import http from 'http';

const checkOptions = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/v1/admins/check-week-indices',
  method: 'GET'
};

const checkReq = http.request(checkOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Current week indices:', data);
    
    // Now trigger repair
    const repairOptions = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/admins/repair-week-indices',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const repairReq = http.request(repairOptions, (repairRes) => {
      let repairData = '';
      repairRes.on('data', (chunk) => { repairData += chunk; });
      repairRes.on('end', () => {
        console.log('Repair result:', repairData);
        process.exit(0);
      });
    });
    
    repairReq.on('error', (error) => {
      console.error('Repair error:', error);
      process.exit(1);
    });
    
    repairReq.end();
  });
});

checkReq.on('error', (error) => {
  console.error('Check error:', error);
  process.exit(1);
});

checkReq.end();