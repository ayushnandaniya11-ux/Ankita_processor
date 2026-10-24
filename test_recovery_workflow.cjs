const http = require('http');
const crypto = require('crypto');
const { Client } = require('./apps/api/node_modules/pg');

const API_BASE = 'http://localhost:3333/api/v1';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING MANDATORY PASSWORD RESET WORKFLOW TESTS');
  console.log('====================================================\n');

  const pgClient = new Client({
    connectionString: 'postgresql://postgres:5432@127.0.0.1:5433/ankita_processors',
  });
  await pgClient.connect();

  const testEmail = 'recovery_test_customer@ankita.com';
  const initialPassword = 'InitialPassword123';
  const newPassword = 'NewSecretPassword456!';

  // Step 0: Ensure clean test user
  await pgClient.query('DELETE FROM users WHERE email = $1', [testEmail]);
  
  // Register or create user using API register or direct hash
  console.log('1. Setting up test customer user...');
  const regRes = await fetchJson(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Recovery Test User',
      email: testEmail,
      password: initialPassword,
    }),
  });

  // Verify OTP directly in DB to complete registration
  await pgClient.query('UPDATE users SET otp = null, otp_expires_at = null WHERE email = $1', [testEmail]);

  // Verify initial login works
  console.log('2. Verifying initial credentials work for login...');
  const initLogin = await fetchJson(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: initialPassword }),
  });
  if (initLogin.status !== 200) {
    throw new Error(`Initial login failed: ${JSON.stringify(initLogin.data)}`);
  }
  console.log('   ✅ Initial customer login succeeded');

  // Step 3: Test unknown / unregistered email
  console.log('\n3. Testing unregistered email address for privacy / enumeration prevention...');
  const unknownEmailRes = await fetchJson(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email: 'nonexistent_account_12345@example.com' }),
  });
  if (unknownEmailRes.status !== 200) {
    throw new Error(`Expected 200 generic response, got ${unknownEmailRes.status}`);
  }
  console.log(`   Response: "${unknownEmailRes.data.message}"`);
  console.log('   ✅ Unregistered email returned generic success message without leaking account existence');

  // Step 4: Request password recovery for registered customer
  console.log('\n4. Requesting password reset for registered customer...');
  const forgotRes = await fetchJson(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email: testEmail }),
  });
  if (forgotRes.status !== 200) {
    throw new Error(`Forgot password failed: ${JSON.stringify(forgotRes.data)}`);
  }
  console.log(`   Response message: "${forgotRes.data.message}"`);
  const rawToken = forgotRes.data.debugToken;
  console.log(`   Issued raw token: ${rawToken ? rawToken.substring(0, 16) + '...' : 'Generated and mailed'}`);

  // Step 5: Verify database record
  console.log('\n5. Inspecting password_reset_tokens table in database...');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const dbTokenRes = await pgClient.query(
    'SELECT prt.*, u.email FROM password_reset_tokens prt JOIN users u ON u.id = prt.user_id WHERE prt.token_hash = $1',
    [tokenHash]
  );
  if (dbTokenRes.rows.length === 0) {
    throw new Error('Token record not found in database!');
  }
  const tokenRecord = dbTokenRes.rows[0];
  console.log('   ✅ Found database token record:');
  console.log('      - User ID:', tokenRecord.user_id);
  console.log('      - Token Hash:', tokenRecord.token_hash);
  console.log('      - Is Used:', tokenRecord.is_used);
  console.log('      - Expires At:', tokenRecord.expires_at);
  if (tokenRecord.is_used !== false) throw new Error('Token should be unused');
  if (new Date(tokenRecord.expires_at) <= new Date()) throw new Error('Token should not be expired');

  // Step 6: Test token verification endpoint
  console.log('\n6. Testing token verification endpoint (GET /auth/verify-reset-token)...');
  // 6a: Missing token
  const missingTokenRes = await fetchJson(`${API_BASE}/auth/verify-reset-token`);
  if (missingTokenRes.status !== 400 || missingTokenRes.data.valid !== false) {
    throw new Error('Missing token should return valid: false, 400');
  }
  console.log('   ✅ Missing token rejected correctly (400)');

  // 6b: Invalid token
  const invalidTokenRes = await fetchJson(`${API_BASE}/auth/verify-reset-token?token=deadbeefdeadbeef`);
  if (invalidTokenRes.status !== 400 || invalidTokenRes.data.valid !== false) {
    throw new Error('Invalid token should return valid: false, 400');
  }
  console.log('   ✅ Invalid token rejected correctly (400)');

  // 6c: Valid token
  const validTokenRes = await fetchJson(`${API_BASE}/auth/verify-reset-token?token=${rawToken}`);
  if (validTokenRes.status !== 200 || !validTokenRes.data.valid) {
    throw new Error(`Valid token check failed: ${JSON.stringify(validTokenRes.data)}`);
  }
  console.log(`   ✅ Valid token accepted (200), masked email: ${validTokenRes.data.email}`);

  // Step 7: Test password policy validation
  console.log('\n7. Testing password policy validation on reset...');
  const weakPasswordRes = await fetchJson(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ token: rawToken, password: 'weak' }),
  });
  if (weakPasswordRes.status !== 400) {
    throw new Error(`Weak password should be rejected, got ${weakPasswordRes.status}`);
  }
  console.log('   ✅ Weak password rejected correctly (400)');

  // Step 8: Successfully reset password
  console.log('\n8. Performing password reset with valid new password...');
  const resetRes = await fetchJson(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ token: rawToken, password: newPassword }),
  });
  if (resetRes.status !== 200) {
    throw new Error(`Reset password failed: ${JSON.stringify(resetRes.data)}`);
  }
  console.log(`   Response: "${resetRes.data.message}"`);
  console.log('   ✅ Password updated successfully');

  // Step 9: Verify token is now marked used in database
  console.log('\n9. Verifying token state in database after reset...');
  const usedTokenRes = await pgClient.query(
    'SELECT is_used, used_at FROM password_reset_tokens WHERE token_hash = $1',
    [tokenHash]
  );
  if (!usedTokenRes.rows[0].is_used || !usedTokenRes.rows[0].used_at) {
    throw new Error('Token should be marked is_used = true with used_at timestamp!');
  }
  console.log('   ✅ Token is marked is_used = true with timestamp:', usedTokenRes.rows[0].used_at);

  // Step 10: Test token reuse prevention
  console.log('\n10. Testing single-use token protection (preventing token reuse)...');
  const reuseRes = await fetchJson(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ token: rawToken, password: 'AnotherPassword789!' }),
  });
  if (reuseRes.status !== 400) {
    throw new Error(`Expected token reuse to be rejected with 400, got ${reuseRes.status}`);
  }
  console.log(`   Response: "${reuseRes.data.error.message}"`);
  console.log('   ✅ Token reuse successfully blocked');

  const verifyUsedRes = await fetchJson(`${API_BASE}/auth/verify-reset-token?token=${rawToken}`);
  if (verifyUsedRes.status !== 400 || verifyUsedRes.data.reason !== 'USED') {
    throw new Error('Verification of used token should return 400 with reason USED');
  }
  console.log('   ✅ Verify endpoint correctly flags used token as USED');

  // Step 11: Verify expired token handling
  console.log('\n11. Testing expired token handling...');
  const expiredRawToken = crypto.randomBytes(32).toString('hex');
  const expiredHash = crypto.createHash('sha256').update(expiredRawToken).digest('hex');
  await pgClient.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, is_used, created_at)
     VALUES ($1, $2, NOW() - INTERVAL '10 minutes', false, NOW() - INTERVAL '15 minutes')`,
    [tokenRecord.user_id, expiredHash]
  );
  const verifyExpiredRes = await fetchJson(`${API_BASE}/auth/verify-reset-token?token=${expiredRawToken}`);
  if (verifyExpiredRes.status !== 400 || verifyExpiredRes.data.reason !== 'EXPIRED') {
    throw new Error('Expired token should return 400 with reason EXPIRED');
  }
  console.log('   ✅ Expired token correctly rejected as EXPIRED');

  // Step 12: Login with new password
  console.log('\n12. Testing login with NEW password...');
  const newLoginRes = await fetchJson(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: newPassword }),
  });
  if (newLoginRes.status !== 200 || !newLoginRes.data.user) {
    throw new Error(`Login with new password failed: ${JSON.stringify(newLoginRes.data)}`);
  }
  console.log(`   ✅ Successfully logged in with new password! User ID: ${newLoginRes.data.user.id}, Role: ${newLoginRes.data.user.role}`);

  // Step 13: Confirm OLD password no longer works
  console.log('\n13. Confirming OLD password is now invalid...');
  const oldLoginRes = await fetchJson(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: initialPassword }),
  });
  if (oldLoginRes.status !== 400) {
    throw new Error(`Old password should be rejected with 400, got ${oldLoginRes.status}`);
  }
  console.log(`   Response: "${oldLoginRes.data.error.message}"`);
  console.log('   ✅ Old password is definitively rejected');

  // Step 14: Clean up test user
  await pgClient.query('DELETE FROM users WHERE email = $1', [testEmail]);
  await pgClient.end();

  console.log('\n====================================================');
  console.log('🎉 ALL 16 MANDATORY TEST CONDITIONS PASSED SUCCESSFULLY!');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
