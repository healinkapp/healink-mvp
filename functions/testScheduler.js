/**
 * Manual Test Scheduler
 * Run this to test the scheduling function locally without waiting for cron
 * 
 * Usage:
 * 1. Make sure you're authenticated: firebase login
 * 2. Run: node testScheduler.js
 */

const admin = require('firebase-admin');
const { sendCommunications } = require('./dailyAftercare');

// Initialize Firebase Admin with service account
// You'll need to download the service account key from Firebase Console
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function testScheduler() {
  console.log('🧪 Starting manual test of scheduler...\n');
  
  try {
    // Test the sendCommunications function
    await sendCommunications();
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testScheduler();
