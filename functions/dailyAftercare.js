/**
 * HEALINK MVP - DAILY AFTERCARE SCHEDULER
 * 
 * Automated Cloud Function that runs daily at 9 AM Dublin time
 * Sends emails and push notifications based on healing day
 * 
 * Timeline: 6 emails + 10 push notifications over 30 days
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const emailjs = require('@emailjs/nodejs');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Daily Aftercare Scheduler
 * Runs every day at 9:00 AM Dublin time
 * Processes all active clients and sends appropriate communications
 */
exports.dailyAftercare = functions
  .region('europe-west1') // Dublin region for EU GDPR compliance
  .pubsub
  .schedule('0 9 * * *') // Cron: 9 AM every day
  .timeZone('Europe/Dublin')
  .onRun(async (context) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate day calculation

    console.log('[SCHEDULER] Starting daily aftercare run:', today.toISOString());

    try {
      // Query all clients who completed setup
      const clientsSnapshot = await admin.firestore()
        .collection('users')
        .where('role', '==', 'client')
        .where('hasCompletedSetup', '==', true)
        .get();

      console.log(`[SCHEDULER] Found ${clientsSnapshot.size} active clients`);

      let processedCount = 0;
      let emailsSent = 0;
      let pushesSent = 0;

      // Process each client
      for (const clientDoc of clientsSnapshot.docs) {
        const client = clientDoc.data();
        const clientId = clientDoc.id;

        // Skip if no tattoo date
        if (!client.tattooDate) {
          console.warn(`[SCHEDULER] Client ${clientId} (${client.email}) has no tattoo date`);
          continue;
        }

        // Calculate days since tattoo
        const tattooDate = new Date(client.tattooDate);
        tattooDate.setHours(0, 0, 0, 0);
        const daysSince = Math.floor((today - tattooDate) / (1000 * 60 * 60 * 24));

        // Only process days 1-30 (Day 0 is sent immediately by artist)
        if (daysSince < 1 || daysSince > 30) {
          continue;
        }

        console.log(`[SCHEDULER] Processing client ${client.email} - Day ${daysSince}`);

        // Get artist data
        const artistDoc = await admin.firestore()
          .collection('users')
          .doc(client.artistId)
          .get();

        if (!artistDoc.exists) {
          console.error(`[SCHEDULER] Artist not found for client ${clientId}`);
          continue;
        }

        const artist = artistDoc.data();

        // Send appropriate communications
        const results = await sendCommunications(clientId, client, artist, daysSince);
        
        processedCount++;
        emailsSent += results.emailSent ? 1 : 0;
        pushesSent += results.pushSent ? 1 : 0;
        const photoRemindersSent = results.photoReminderSent ? 1 : 0;
      }

      console.log(`[SCHEDULER] Daily aftercare complete - Processed: ${processedCount}, Emails: ${emailsSent}, Pushes: ${pushesSent}, Photo Reminders: ${photoRemindersSent}`);
      return { success: true, processedCount, emailsSent, pushesSent, photoRemindersSent };

    } catch (error) {
      console.error('[SCHEDULER] Fatal error:', error);
      return { success: false, error: error.message };
    }
  });

/**
 * Send appropriate communications for a specific healing day
 * @param {string} clientId - Firestore document ID
 * @param {Object} client - Client data
 * @param {Object} artist - Artist data
 * @param {number} day - Days since tattoo
 * @returns {Promise<{emailSent: boolean, pushSent: boolean, photoReminderSent: boolean}>}
 */
async function sendCommunications(clientId, client, artist, day) {
  const emailDays = [1, 3, 5, 7, 30]; // Day 0 sent by artist
  const pushDays = [1, 2, 3, 4, 5, 6, 7, 10, 14, 21, 30];
  const photoDays = [3, 7, 14, 30]; // Photo check-in reminders

  const results = {
    emailSent: false,
    pushSent: false,
    photoReminderSent: false
  };

  // Send Email if needed
  if (emailDays.includes(day)) {
    const sent = await sendEmail(clientId, client, artist, day);
    results.emailSent = sent;
  }

  // Send Push if needed
  if (pushDays.includes(day)) {
    const sent = await sendPush(clientId, client, day);
    results.pushSent = sent;
  }

  // Send Photo Reminder if needed
  if (photoDays.includes(day)) {
    const sent = await sendPhotoReminder(clientId, client, day);
    results.photoReminderSent = sent;
  }

  return results;
}

/**
 * Send email via EmailJS
 * @param {string} clientId - Firestore document ID
 * @param {Object} client - Client data
 * @param {Object} artist - Artist data
 * @param {number} day - Healing day
 * @returns {Promise<boolean>} Success status
 */
async function sendEmail(clientId, client, artist, day) {
  // Get config from Firebase Functions config
  const config = functions.config();
  
  const templateMap = {
    1: config.emailjs.template_day1,
    3: config.emailjs.template_day3,
    5: config.emailjs.template_day5,
    7: config.emailjs.template_day7,
    30: config.emailjs.template_day30
  };

  const templateId = templateMap[day];
  if (!templateId) {
    console.error(`[EMAIL] No template configured for day ${day}`);
    return false;
  }

  // Check if already sent
  if (client.emailsSent && client.emailsSent[`day${day}`]) {
    console.log(`[EMAIL] Day ${day} email already sent to ${client.email}`);
    return false;
  }

  try {
    await emailjs.send(
      config.emailjs.service_id,
      templateId,
      {
        to_email: client.email,
        email: client.email, // Backup field
        client_name: client.name,
        studio_name: artist.studioName || artist.name || 'Your Artist',
        app_link: 'https://healink.app/client/dashboard' // Update with your domain
      },
      {
        publicKey: config.emailjs.public_key,
        privateKey: config.emailjs.private_key
      }
    );

    console.log(`[EMAIL] ✅ Sent Day ${day} email to ${client.email}`);

    // Track sent email in Firestore
    await admin.firestore()
      .collection('users')
      .doc(clientId)
      .update({
        [`emailsSent.day${day}`]: admin.firestore.FieldValue.serverTimestamp()
      });

    return true;

  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send Day ${day} to ${client.email}:`, error);
    return false;
  }
}

/**
 * Send push notification via Firebase Cloud Messaging
 * @param {string} clientId - Firestore document ID
 * @param {Object} client - Client data
 * @param {number} day - Healing day
 * @returns {Promise<boolean>} Success status
 */
async function sendPush(clientId, client, day) {
  // Check if client has FCM token
  if (!client.fcmToken) {
    console.log(`[PUSH] Client ${client.email} has no FCM token (push notifications disabled)`);
    return false;
  }

  // Push notification messages for each day
  const pushMessages = {
    1: { 
      title: "Day 1 Check-in ✨", 
      body: "Keep washing your tattoo 2-3 times today with lukewarm water" 
    },
    2: { 
      title: "Day 2 Reminder 💧", 
      body: "Inflammation is normal. Keep washing gently" 
    },
    3: { 
      title: "Day 3 — Start Moisturizing 🧴", 
      body: "Apply thin layer of unscented lotion 2-3x daily" 
    },
    4: { 
      title: "Moisturize Reminder", 
      body: "Skin feeling tight? Time to moisturize" 
    },
    5: { 
      title: "Day 5 — Itching Phase 🔥", 
      body: "Tap, don't scratch! The itch means it's healing" 
    },
    6: { 
      title: "Evening Reminder 🌙", 
      body: "Don't scratch in your sleep tonight. Keep hands clean" 
    },
    7: { 
      title: "Week 1 Complete! 🎉", 
      body: "You survived the critical week. Keep up the care" 
    },
    10: { 
      title: "Peeling is Normal", 
      body: "Let flakes fall naturally. Don't pick at them" 
    },
    14: { 
      title: "Halfway Healed 🌟", 
      body: "You're halfway there! Color will brighten soon" 
    },
    21: { 
      title: "Almost Healed ☀️", 
      body: "Surface healed, but keep protecting from sun" 
    },
    30: { 
      title: "Fully Healed! 🎊", 
      body: "Your tattoo is permanent. Enjoy your new art" 
    }
  };

  const message = pushMessages[day];
  if (!message) {
    console.error(`[PUSH] No message configured for day ${day}`);
    return false;
  }

  // Check if already sent
  if (client.pushesSent && client.pushesSent[`day${day}`]) {
    console.log(`[PUSH] Day ${day} push already sent to ${client.email}`);
    return false;
  }

  try {
    await admin.messaging().send({
      token: client.fcmToken,
      notification: {
        title: message.title,
        body: message.body,
        icon: '/icons/icon-192.png'
      },
      data: {
        day: String(day),
        type: 'aftercare',
        click_action: 'https://healink.app/client/dashboard'
      },
      webpush: {
        fcmOptions: {
          link: 'https://healink.app/client/dashboard' // Update with your domain
        },
        notification: {
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          vibrate: [200, 100, 200]
        }
      }
    });

    console.log(`[PUSH] ✅ Sent Day ${day} push to ${client.email}`);

    // Track sent push in Firestore
    await admin.firestore()
      .collection('users')
      .doc(clientId)
      .update({
        [`pushesSent.day${day}`]: admin.firestore.FieldValue.serverTimestamp()
      });

    return true;

  } catch (error) {
    console.error(`[PUSH] ❌ Failed to send Day ${day} to ${client.email}:`, error);
    
    // If token is invalid, clear it from user document
    if (error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered') {
      console.warn(`[PUSH] Clearing invalid FCM token for ${client.email}`);
      await admin.firestore()
        .collection('users')
        .doc(clientId)
        .update({
          fcmToken: null
        });
    }
    
    return false;
  }
}
