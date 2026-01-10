#!/usr/bin/env node
/**
 * Apple Client Secret Generator for Supabase Auth
 *
 * Usage:
 *   node scripts/generate-apple-secret.js
 *
 * Before running:
 *   1. npm install jsonwebtoken (if not installed)
 *   2. Update the configuration below with your values
 *   3. Place your .p8 file in the scripts folder (or update the path)
 */

const crypto = require('crypto');

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

const CONFIG = {
  // Your Apple Team ID (10 characters, found in Apple Developer Portal top-right)
  TEAM_ID: 'T94953BUAS',

  // Your Services ID (the one you created for Sign in with Apple)
  // Example: 'app.toonnotes.supabase' or 'com.yourcompany.app.auth'
  SERVICE_ID: 'com.toonnotes.app.web',

  // Your Key ID (shown when you created/downloaded the .p8 key)
  KEY_ID: 'NXBS6K2M5Y',

  // Path to your .p8 private key file
  // Download this from Apple Developer Portal > Keys
  PRIVATE_KEY_PATH: './scripts/AuthKey_NXBS6K2M5Y.p8',
};

// ============================================
// JWT GENERATION (Don't modify below)
// ============================================

const fs = require('fs');
const path = require('path');

function base64UrlEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateAppleClientSecret() {
  // Validate config
  if (CONFIG.SERVICE_ID === 'YOUR_SERVICE_ID_HERE') {
    console.error('\n❌ Error: Please update SERVICE_ID in the script');
    console.error('   This is your Apple Services ID (e.g., app.toonnotes.supabase)\n');
    process.exit(1);
  }

  if (CONFIG.KEY_ID === 'YOUR_KEY_ID_HERE') {
    console.error('\n❌ Error: Please update KEY_ID in the script');
    console.error('   This is the Key ID shown when you created your .p8 key\n');
    process.exit(1);
  }

  // Read private key
  const keyPath = path.resolve(CONFIG.PRIVATE_KEY_PATH);
  if (!fs.existsSync(keyPath)) {
    console.error(`\n❌ Error: Private key file not found at: ${keyPath}`);
    console.error('   Download your .p8 file from Apple Developer Portal > Keys');
    console.error('   Place it in the scripts folder and update PRIVATE_KEY_PATH\n');
    process.exit(1);
  }

  const privateKey = fs.readFileSync(keyPath, 'utf8');

  // Create JWT header
  const header = {
    alg: 'ES256',
    kid: CONFIG.KEY_ID,
    typ: 'JWT',
  };

  // Create JWT payload (valid for 6 months)
  const now = Math.floor(Date.now() / 1000);
  const sixMonths = 180 * 24 * 60 * 60; // 180 days in seconds

  const payload = {
    iss: CONFIG.TEAM_ID,
    iat: now,
    exp: now + sixMonths,
    aud: 'https://appleid.apple.com',
    sub: CONFIG.SERVICE_ID,
  };

  // Encode header and payload
  const encodedHeader = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(Buffer.from(JSON.stringify(payload)));

  // Create signature
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const sign = crypto.createSign('SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(privateKey);

  // Convert DER signature to raw format for ES256
  // DER format: 0x30 [length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  let offset = 3;
  const rLength = signature[offset];
  offset += 1;
  let r = signature.slice(offset, offset + rLength);
  offset += rLength + 1;
  const sLength = signature[offset];
  offset += 1;
  let s = signature.slice(offset, offset + sLength);

  // Pad or trim r and s to 32 bytes
  if (r.length > 32) r = r.slice(r.length - 32);
  if (s.length > 32) s = s.slice(s.length - 32);
  if (r.length < 32) r = Buffer.concat([Buffer.alloc(32 - r.length), r]);
  if (s.length < 32) s = Buffer.concat([Buffer.alloc(32 - s.length), s]);

  const rawSignature = Buffer.concat([r, s]);
  const encodedSignature = base64UrlEncode(rawSignature);

  // Create final JWT
  const jwt = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

  // Output
  console.log('\n✅ Apple Client Secret Generated Successfully!\n');
  console.log('━'.repeat(60));
  console.log('\nConfiguration used:');
  console.log(`  Team ID:    ${CONFIG.TEAM_ID}`);
  console.log(`  Service ID: ${CONFIG.SERVICE_ID}`);
  console.log(`  Key ID:     ${CONFIG.KEY_ID}`);
  console.log(`\nExpires: ${new Date((now + sixMonths) * 1000).toLocaleDateString()}`);
  console.log('\n━'.repeat(60));
  console.log('\n📋 Your Apple Client Secret (copy this to Supabase):\n');
  console.log(jwt);
  console.log('\n━'.repeat(60));
  console.log('\n⚠️  IMPORTANT: This secret expires in 6 months!');
  console.log('   Set a calendar reminder to regenerate it before:',
    new Date((now + sixMonths) * 1000).toLocaleDateString());
  console.log('\n📝 Next steps:');
  console.log('   1. Go to Supabase Dashboard > Authentication > Providers > Apple');
  console.log('   2. Paste this secret in the "Secret Key" field');
  console.log('   3. Enter your Service ID in the "Client ID" field');
  console.log('   4. Click Save\n');

  return jwt;
}

// Run
generateAppleClientSecret();
