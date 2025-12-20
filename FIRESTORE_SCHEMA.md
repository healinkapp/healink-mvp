# Firestore Data Structure

**Last Updated:** 20 December 2025  
**Purpose:** Document complete Firestore schema for Healink MVP

---

## users/{userId}

### All Users (Common Fields)
```javascript
{
  email: string,              // User email (required)
  role: 'artist' | 'client',  // User type (required)
  name: string,               // Display name (required)
  createdAt: timestamp        // Account creation date
}
```

---

## Artist-specific Fields

```javascript
{
  // Common fields +
  studioName: string,         // Tattoo studio name (optional)
  photoURL: string,           // Profile picture URL (optional)
  
  // Artist metadata
  bio: string,                // Artist bio/description (optional)
  specialties: string[],      // Tattoo styles (optional)
  website: string,            // Studio website (optional)
  instagram: string,          // Instagram handle (optional)
  location: string            // City/region (optional)
}
```

**Example Artist Document:**
```javascript
{
  email: "artist@example.com",
  role: "artist",
  name: "Maria Silva",
  studioName: "Black Rose Tattoo",
  photoURL: "https://cloudinary.com/...",
  createdAt: Timestamp(2025, 12, 20)
}
```

---

## Client-specific Fields

```javascript
{
  // Common fields +
  artistId: string,              // Reference to artist UID (required)
  tattooDate: string,            // YYYY-MM-DD format (required)
  tattooPhoto: string,           // Cloudinary URL of tattoo (optional)
  profilePhoto: string,          // Client profile picture (optional)
  hasCompletedSetup: boolean,    // Account setup status (required)
  setupToken: string,            // Unique setup link token (required)
  
  // Push notifications
  fcmToken: string,              // Firebase Cloud Messaging token (optional)
  fcmTokenUpdatedAt: timestamp,  // Last FCM token update (optional)
  
  // Communication tracking
  emailsSent: {                  // Track sent emails (prevent duplicates)
    day0: timestamp,             // Welcome email (sent by artist)
    day1: timestamp,             // First follow-up
    day3: timestamp,             // Moisturizing reminder
    day5: timestamp,             // Itching phase
    day7: timestamp,             // Week 1 complete
    day30: timestamp             // Fully healed
  },
  
  pushesSent: {                  // Track sent push notifications
    day1: timestamp,             // Day 1 check-in
    day2: timestamp,             // Day 2 reminder
    day3: timestamp,             // Start moisturizing
    day4: timestamp,             // Moisturize reminder
    day5: timestamp,             // Itching phase
    day6: timestamp,             // Evening reminder
    day7: timestamp,             // Week 1 complete
    day10: timestamp,            // Peeling is normal
    day14: timestamp,            // Halfway healed
    day21: timestamp,            // Week 3 check-in
    day30: timestamp             // Journey complete
  },
  
  photoReminders: {              // Track photo check-in reminders (NEW)
    day3: timestamp,             // First progress photo
    day7: timestamp,             // Week 1 photo
    day14: timestamp,            // Halfway photo
    day30: timestamp             // Final healed photo
  },
  
  // Client metadata
  healingDay: number,            // Current day in healing journey (0-30)
  status: string,                // 'healing' | 'healed' (optional)
  photos: string[]               // Array of uploaded photo URLs (optional)
}
```

**Example Client Document:**
```javascript
{
  email: "client@example.com",
  role: "client",
  name: "João Santos",
  artistId: "artist-uid-here",
  tattooDate: "2025-12-20",
  tattooPhoto: "https://cloudinary.com/...",
  hasCompletedSetup: true,
  setupToken: "abc123xyz789",
  fcmToken: "fcm-token-string-here",
  fcmTokenUpdatedAt: Timestamp(2025, 12, 20),
  
  emailsSent: {
    day0: Timestamp(2025, 12, 20),
    day1: Timestamp(2025, 12, 21),
    day3: Timestamp(2025, 12, 23)
  },
  
  pushesSent: {
    day1: Timestamp(2025, 12, 21),
    day2: Timestamp(2025, 12, 22),
    day3: Timestamp(2025, 12, 23)
  },
  
  photoReminders: {
    day3: Timestamp(2025, 12, 23)
  },
  
  healingDay: 3,
  status: "healing",
  photos: [
    "https://cloudinary.com/photo1.jpg",
    "https://cloudinary.com/photo2.jpg"
  ],
  
  createdAt: Timestamp(2025, 12, 20)
}
```

---

## notifications/{notificationId}

**Purpose:** Store in-app notifications for artists

```javascript
{
  artistId: string,           // Artist UID (for querying)
  clientId: string,           // Client UID (reference)
  clientName: string,         // Client display name
  type: string,               // 'client_added' | 'setup_complete' | 'photo_uploaded'
  message: string,            // Notification text
  read: boolean,              // Read status
  createdAt: timestamp,       // Notification timestamp
  
  // Optional metadata
  photoURL: string,           // Related photo (if type = photo_uploaded)
  healingDay: number          // Client's healing day when notification created
}
```

**Example Notification:**
```javascript
{
  artistId: "artist-uid-here",
  clientId: "client-uid-here",
  clientName: "João Santos",
  type: "setup_complete",
  message: "João Santos completed account setup",
  read: false,
  createdAt: Timestamp(2025, 12, 20)
}
```

---

## Communication Timeline

### Emails (6 total)
- **Day 0:** Welcome + Setup link (sent immediately by artist)
- **Day 1:** First check-in
- **Day 3:** Start moisturizing
- **Day 5:** Itching phase guidance
- **Day 7:** Week 1 complete
- **Day 30:** Journey complete

### Push Notifications (11 total)
- **Day 1:** Check-in reminder
- **Day 2:** Inflammation normal
- **Day 3:** Start moisturizing
- **Day 4:** Moisturize reminder
- **Day 5:** Itching phase
- **Day 6:** Evening reminder
- **Day 7:** Week 1 complete
- **Day 10:** Peeling is normal
- **Day 14:** Halfway healed
- **Day 21:** Week 3 check-in
- **Day 30:** Journey complete

### Photo Reminders (4 total - NEW)
- **Day 3:** First progress photo
- **Day 7:** Week 1 photo
- **Day 14:** Halfway photo
- **Day 30:** Final healed photo

**Total Touchpoints:** 21 communications over 30 days

---

## Security Rules Reference

### Client Setup Flow
```javascript
// Client can read their own document via setupToken (unauthenticated)
allow read: if true;

// Client can update hasCompletedSetup from false → true
allow update: if resource.data.role == 'client' &&
                 resource.data.hasCompletedSetup == false &&
                 request.resource.data.hasCompletedSetup == true;
```

### Artist Access
```javascript
// Artists can read their own clients
allow read: if isArtist() && resource.data.artistId == request.auth.uid;

// Artists can create clients with their artistId
allow create: if request.resource.data.role == 'client' && 
                 request.resource.data.artistId == request.auth.uid;
```

---

## Indexes Required

### Query: Get artist's clients
```javascript
// Collection: users
// Fields: role (Ascending), artistId (Ascending)
```

### Query: Get unread notifications
```javascript
// Collection: notifications
// Fields: artistId (Ascending), read (Ascending), createdAt (Descending)
```

---

## Migration Notes

### From Old Schema (accountSetup → hasCompletedSetup)
If migrating from previous version:
```javascript
// Update all existing clients
db.collection('users')
  .where('role', '==', 'client')
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      if ('accountSetup' in data) {
        doc.ref.update({
          hasCompletedSetup: data.accountSetup,
          accountSetup: firebase.firestore.FieldValue.delete()
        });
      }
    });
  });
```

---

## Best Practices

### 1. Always Initialize Tracking Objects
When creating a client, initialize empty tracking objects:
```javascript
const clientData = {
  // ... other fields
  emailsSent: {},
  pushesSent: {},
  photoReminders: {}  // NEW
};
```

### 2. Use Server Timestamps
```javascript
// Good
createdAt: admin.firestore.FieldValue.serverTimestamp()

// Avoid
createdAt: new Date()
```

### 3. Check Before Sending
Always check if communication already sent:
```javascript
const alreadySent = client.emailsSent?.[`day${day}`];
if (!alreadySent) {
  await sendEmail(client, day);
}
```

### 4. FCM Token Management
- Store `fcmTokenUpdatedAt` when updating token
- Clear token if `messaging/invalid-registration-token` error
- Allow clients to opt-out (null token is valid)

---

## Schema Version

**Current Version:** 2.1.0 (added photoReminders)  
**Last Major Update:** December 20, 2025  
**Breaking Changes:** None (backward compatible)

**Previous Versions:**
- 2.0.0: Changed `accountSetup` → `hasCompletedSetup`
- 1.0.0: Initial schema
