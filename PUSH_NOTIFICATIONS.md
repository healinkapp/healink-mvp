# 🔔 Push Notifications - Healink MVP

## 📋 Overview

Healink now supports **Firebase Cloud Messaging (FCM)** push notifications for real-time alerts to clients about their tattoo aftercare.

---

## ✅ What Was Implemented

### 1. **Push Notification Service** (`src/services/pushService.js`)
Complete client-side FCM token management:
- `requestPushPermission(userId)` - Request permission & save token
- `subscribeToPushMessages(callback)` - Listen for foreground messages
- `unsubscribePush(userId)` - Remove FCM token
- `isPushSupported()` - Check browser compatibility
- `getPushPermissionStatus()` - Check current permission
- `sendTestNotification()` - Test local notifications

### 2. **Service Worker Updates** (`public/sw.js`)
Firebase Messaging integrated into PWA:
- Background message handler
- Notification click handler (opens app)
- Notification close handler (for analytics)
- Firebase SDK v10.7.1 imported via CDN

### 3. **Client Setup Integration** (`src/pages/ClientSetup.jsx`)
Automatic permission request:
- After successful account creation
- Non-blocking (doesn't halt user flow)
- Graceful error handling
- Works for both new accounts and existing logins

### 4. **Permission Banner** (`src/pages/ClientDashboard.jsx`)
User-friendly opt-in UI:
- Shows only if permission not granted/denied
- Dismissable (saved to localStorage)
- Blue gradient design with Bell icon
- "Enable Notifications" button
- Auto-hides after action

### 5. **Firebase Config Update** (`src/config/firebase.js`)
- Added `getMessagingInstance()` async function
- Browser support check with `isSupported()`
- Graceful fallback if messaging unavailable

---

## 🔧 Configuration

### **Environment Variables** (`.env.local`)
```bash
# Already configured
VITE_FIREBASE_VAPID_KEY=BJinzqjs0iV2htBLW5s8Iwmvg5_sRY4DgPHckEPvO680QRC0D9kgWPdy8Ivn5IYNOYIv8CxdLetlJokLQitiLMQ
```

### **Firebase Config in Service Worker**
Firebase config is hardcoded in `public/sw.js` (Service Workers can't access env vars):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDjGQtqvpIAHz7XoZ_F0SWyzG-QLCGsSgU",
  authDomain: "healink-mvp-27eff.firebaseapp.com",
  projectId: "healink-mvp-27eff",
  // ... etc
};
```

---

## 🚀 How It Works

### **User Flow**

#### **1. Client Completes Setup**
```
ClientSetup.jsx → Account created → 
requestPushPermission(userId) called →
Browser shows permission prompt →
If granted: FCM token saved to Firestore
```

#### **2. Permission Banner** (if missed during setup)
```
ClientDashboard loads →
Check permission status →
If 'default': Show banner →
User clicks "Enable" →
requestPushPermission(userId) →
Token saved to Firestore
```

#### **3. Foreground Messages** (app open)
```
Server sends FCM message →
subscribeToPushMessages() callback fired →
App shows toast notification
```

#### **4. Background Messages** (app closed)
```
Server sends FCM message →
Service Worker receives message →
onBackgroundMessage() fires →
Browser shows system notification →
User clicks notification →
App opens to relevant page
```

---

## 📊 Firestore Structure

FCM tokens stored in user documents:
```javascript
users/{userId} {
  email: "client@example.com",
  name: "João Silva",
  role: "client",
  fcmToken: "eX9kJh2...", // ✅ NEW: FCM token
  fcmTokenUpdatedAt: Timestamp // ✅ NEW: Last update time
}
```

---

## 🧪 Testing Guide

### **Step 1: Test Permission Request**

```javascript
// In browser console (after login)
import { requestPushPermission } from './services/pushService';

const userId = 'your-user-id-here';
await requestPushPermission(userId);

// Expected:
// 1. Browser shows permission prompt
// 2. After granting: "✅ FCM token saved to Firestore"
// 3. Check Firestore: users/{userId}.fcmToken should have value
```

### **Step 2: Test Foreground Messages**

```javascript
// In browser console
import { sendTestNotification } from './services/pushService';

await sendTestNotification(
  'Test Notification', 
  'This is a test message'
);

// Expected: Notification appears in browser
```

### **Step 3: Test Background Messages** (requires server)

You need to send a real FCM message from backend/Cloud Function:

```javascript
// Example Cloud Function (Node.js)
const admin = require('firebase-admin');

async function sendPushToUser(userId, title, body) {
  const userDoc = await admin.firestore()
    .collection('users')
    .doc(userId)
    .get();
  
  const fcmToken = userDoc.data().fcmToken;
  
  if (!fcmToken) {
    throw new Error('User has no FCM token');
  }
  
  const message = {
    notification: {
      title: title,
      body: body,
      icon: '/icons/icon-192.png'
    },
    data: {
      url: '/client/dashboard',
      type: 'aftercare_reminder'
    },
    token: fcmToken
  };
  
  const response = await admin.messaging().send(message);
  console.log('Message sent:', response);
}

// Usage
await sendPushToUser(
  'client-user-id', 
  'Day 3 Reminder', 
  'Time for your daily aftercare routine!'
);
```

### **Step 4: Test Notification Click**

1. Send background message (app closed)
2. Click notification
3. Expected: App opens to URL specified in `data.url`

---

## 📱 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| **Chrome** (Desktop) | ✅ Full | Best experience |
| **Chrome** (Android) | ✅ Full | Native push |
| **Firefox** | ✅ Full | Works well |
| **Safari** (iOS 16.4+) | ✅ Partial | Requires Add to Home Screen |
| **Safari** (macOS) | ✅ Full | macOS 13+ |
| **Edge** | ✅ Full | Chromium-based |

### **iOS Limitations**
- Push notifications only work in **PWA mode** (Add to Home Screen)
- Won't work in regular Safari browser
- User must install app first

---

## 🔒 Security & Privacy

### **Permission Model**
- **Explicit consent required** - User must click "Allow"
- **One-time prompt** - If denied, must enable in browser settings
- **Revocable** - User can disable anytime in settings

### **Token Management**
- **Tokens can expire** - Automatically refreshed by Firebase
- **Tokens are user-specific** - One token per user per device
- **Tokens stored securely** - In Firestore with proper rules

### **Firestore Rules** (recommended)
```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
  
  // Only user can update their own FCM token
  allow update: if request.auth.uid == userId 
    && request.resource.data.keys().hasAny(['fcmToken', 'fcmTokenUpdatedAt']);
}
```

---

## 🎯 Use Cases

### **1. Daily Aftercare Reminders**
```javascript
// Cloud Function scheduled daily
exports.sendDailyReminders = functions.pubsub
  .schedule('every day 09:00')
  .timeZone('America/Sao_Paulo')
  .onRun(async () => {
    const today = new Date();
    
    // Find clients in active healing phase (Day 0-30)
    const clientsSnapshot = await db.collection('users')
      .where('role', '==', 'client')
      .where('healingDay', '>=', 0)
      .where('healingDay', '<=', 30)
      .get();
    
    for (const doc of clientsSnapshot.docs) {
      const client = doc.data();
      
      await sendPushToUser(
        doc.id,
        `Day ${client.healingDay} Aftercare`,
        'Time for your daily cleaning routine! 💧'
      );
    }
  });
```

### **2. Critical Phase Alerts**
```javascript
// When artist updates client status
async function notifyCriticalPhase(clientId, day) {
  await sendPushToUser(
    clientId,
    '⚠️ Critical Healing Phase',
    `You're on Day ${day}. Extra care needed!`
  );
}
```

### **3. Milestone Celebrations**
```javascript
// Day 30 - Fully healed
async function notifyFullyHealed(clientId) {
  await sendPushToUser(
    clientId,
    '🎉 Fully Healed!',
    'Congratulations! Your tattoo has completed healing.'
  );
}
```

---

## 🐛 Troubleshooting

### **"Permission denied" Error**
**Cause:** User clicked "Block" on permission prompt  
**Solution:** User must manually enable in browser settings  
- Chrome: `chrome://settings/content/notifications`
- Add site to "Allowed" list

### **"Firebase Messaging not supported"**
**Cause:** Browser doesn't support FCM  
**Solution:** Check `isPushSupported()` before requesting  
```javascript
import { isPushSupported } from './services/pushService';

if (!isPushSupported()) {
  console.log('Push notifications not available in this browser');
}
```

### **"No FCM token in Firestore"**
**Cause:** User hasn't granted permission yet  
**Solution:** Show permission banner or call `requestPushPermission()`

### **Background messages not working**
**Checklist:**
- [ ] Service Worker registered? (Check DevTools → Application)
- [ ] Firebase config correct in `sw.js`?
- [ ] Sending to correct FCM token?
- [ ] Token not expired? (Check Firestore timestamp)
- [ ] HTTPS enabled? (required for production)

### **iOS not receiving notifications**
**Cause:** iOS requires PWA mode  
**Solution:**
1. User must "Add to Home Screen"
2. Open app from home screen (not Safari)
3. Then request permission

---

## 📚 API Reference

### **`requestPushPermission(userId)`**
Request notification permission and save FCM token.

**Parameters:**
- `userId` (string) - Firestore user document ID

**Returns:**
```javascript
{
  success: boolean,
  token?: string,     // FCM token if successful
  error?: string      // Error message if failed
}
```

**Example:**
```javascript
const result = await requestPushPermission('user-123');
if (result.success) {
  console.log('Token:', result.token);
} else {
  console.error('Error:', result.error);
}
```

---

### **`subscribeToPushMessages(callback)`**
Listen for foreground push messages (when app is open).

**Parameters:**
- `callback` (function) - Called with `{title, body, icon, data}`

**Returns:**
- `unsubscribe` (function) - Call to stop listening

**Example:**
```javascript
const unsubscribe = await subscribeToPushMessages((message) => {
  console.log('Received:', message.title, message.body);
  showToast(message.title, message.body);
});

// Later: stop listening
unsubscribe();
```

---

### **`unsubscribePush(userId)`**
Remove FCM token from Firestore (opt-out).

**Parameters:**
- `userId` (string) - Firestore user document ID

**Returns:**
```javascript
{
  success: boolean,
  error?: string
}
```

---

### **`isPushSupported()`**
Check if browser supports push notifications.

**Returns:**
- `boolean` - `true` if supported, `false` otherwise

---

### **`getPushPermissionStatus()`**
Get current notification permission status.

**Returns:**
- `'granted'` - User has allowed notifications
- `'denied'` - User has blocked notifications
- `'default'` - User hasn't decided yet

---

### **`sendTestNotification(title, body, options)`**
Show a local test notification (not real FCM push).

**Parameters:**
- `title` (string) - Notification title
- `body` (string) - Notification body
- `options` (object) - Additional options (icon, tag, data, etc.)

**Example:**
```javascript
await sendTestNotification(
  'Test Alert',
  'This is a test message',
  {
    icon: '/icons/icon-192.png',
    tag: 'test',
    data: { url: '/dashboard' }
  }
);
```

---

## 🚀 Next Steps

### **Immediate (Production Ready)**
- ✅ Permission request on setup (DONE)
- ✅ Permission banner in dashboard (DONE)
- ✅ Background message handling (DONE)
- ✅ Notification clicks open app (DONE)

### **Phase 2: Backend Integration**
- [ ] Create Cloud Function to send notifications
- [ ] Schedule daily aftercare reminders
- [ ] Send alerts on critical healing days
- [ ] Celebrate milestones (Day 14, Day 30)

### **Phase 3: Analytics**
- [ ] Track notification delivery rate
- [ ] Monitor click-through rate
- [ ] A/B test notification copy
- [ ] Measure engagement impact

### **Phase 4: Advanced Features**
- [ ] Rich notifications (images, actions)
- [ ] Notification preferences (time, frequency)
- [ ] Silent notifications (data-only)
- [ ] Multi-device support

---

## 📝 Code Quality Checklist

- [x] ✅ All async functions have try/catch
- [x] ✅ Errors logged with context
- [x] ✅ No excessive console.logs
- [x] ✅ JSDoc comments on all exported functions
- [x] ✅ Clean separation of concerns
- [x] ✅ Non-blocking permission requests
- [x] ✅ Graceful fallbacks for unsupported browsers
- [x] ✅ No breaking changes to existing code

---

## 🎉 Summary

**Healink now has production-ready push notifications!**

✅ **Client-side complete** - Permission, tokens, foreground messages  
✅ **Service Worker ready** - Background messages, notification clicks  
✅ **User-friendly UI** - Banner prompt, graceful errors  
⏳ **Backend pending** - Need Cloud Functions to send actual pushes  

**Next:** Implement Cloud Functions to automatically send daily reminders based on healing day.

---

**Last Updated:** December 19, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for Backend Integration
