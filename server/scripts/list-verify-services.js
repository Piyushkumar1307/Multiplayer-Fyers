/**
 * Run after setting LIVE credentials in .env:
 *   node scripts/list-verify-services.js
 */
require('dotenv').config();
const twilio = require('twilio');

async function main() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token || token.includes('PASTE')) {
    console.error('Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN (Live) in server/.env first.');
    process.exit(1);
  }

  const client = twilio(sid, token);
  const services = await client.verify.v2.services.list({ limit: 20 });
  if (!services.length) {
    console.log('No Verify services. Create one: Console → Verify → Services → Create');
    return;
  }
  for (const s of services) {
    console.log(`${s.friendlyName}: ${s.sid}`);
  }
  console.log('\nCopy a VA... sid into TWILIO_VERIFY_SERVICE_SID in .env');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
