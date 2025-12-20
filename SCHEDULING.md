# 📅 HEALINK MVP - SCHEDULING SYSTEM

Automated email and push notification system for tattoo aftercare.

---

## 🎯 OVERVIEW

**System:** Firebase Cloud Functions with daily cron job  
**Schedule:** 9:00 AM Dublin time (Europe/Dublin timezone)  
**Coverage:** 30-day healing journey  
**Touchpoints:** 6 emails + 10 push notifications = 16 total

---

## 📊 COMMUNICATION TIMELINE

### Week 1 (Critical Phase)
```
Day 0:  ✉️ Email (Welcome + Setup) - Sent immediately by artist
Day 1:  ✉️ Email + 🔔 Push (09:00 AM) - "Keep washing 2-3x daily"
Day 2:  🔔 Push only (09:00 AM) - "Inflammation is normal"
Day 3:  ✉️ Email + 🔔 Push (09:00 AM) - "Start moisturizing"
Day 4:  🔔 Push only (09:00 AM) - "Moisturize when tight"
Day 5:  ✉️ Email + 🔔 Push (09:00 AM) - "Itching phase begins"
Day 6:  🔔 Push only (09:00 AM) - "Don't scratch"
Day 7:  ✉️ Email + 🔔 Push (09:00 AM) - "Week 1 complete"
```

### Week 2-4 (Healing Phase)
```
Day 10: 🔔 Push (09:00 AM) - "Peeling is normal"
Day 14: 🔔 Push (09:00 AM) - "Halfway healed"
Day 21: 🔔 Push (09:00 AM) - "Almost there"
Day 30: ✉️ Email + 🔔 Push (09:00 AM) - "Fully healed"
```

**Total:** 6 emails + 10 pushes = **16 touchpoints**

---

## 🏗️ ARCHITECTURE

### Cloud Function: `dailyAftercare`
- **Region:** `europe-west1` (Dublin) - GDPR compliant
- **Trigger:** Pub/Sub scheduled (cron)
- **Schedule:** `0 9 * * *` (9 AM daily)
- **Timezone:** `Europe/Dublin`

### Process Flow:
```
1. Query all clients with hasCompletedSetup: true
2. For each client:
   a. Calculate days since tattooDate
   b. If day 1-30:
      - Send email (if day 1,3,5,7,30)
      - Send push (if day 1,2,3,4,5,6,7,10,14,21,30)
   c. Track sends in Firestore
3. Log results
```

---

## 📦 FIRESTORE SCHEMA

### Tracking Fields (Added to users collection):
```javascript
{
  emailsSent: {
    day1: timestamp,
    day3: timestamp,
    day5: timestamp,
    day7: timestamp,
    day30: timestamp
  },
  pushesSent: {
    day1: timestamp,
    day2: timestamp,
    day3: timestamp,
    day4: timestamp,
    day5: timestamp,
    day6: timestamp,
    day7: timestamp,
    day10: timestamp,
    day14: timestamp,
    day21: timestamp,
    day30: timestamp
  }
}
```

**Purpose:** Prevents duplicate sends if function runs multiple times

---

## 🔧 SETUP

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Configure Environment Variables
```bash
# EmailJS Configuration
firebase functions:config:set emailjs.service_id="service_13h3kki"
firebase functions:config:set emailjs.public_key="uH10FXkw8yv434h5P"
firebase functions:config:set emailjs.private_key="46LIXk6cVjUGFeUty-fg5"

# Email Templates
firebase functions:config:set emailjs.template_day1="template_d75273a"
firebase functions:config:set emailjs.template_day3="template_xtdi2sx"
firebase functions:config:set emailjs.template_day5="template_ombo3rr"
firebase functions:config:set emailjs.template_day7="template_s8kfh7x"
firebase functions:config:set emailjs.template_day30="template_y1ovm08"
```

### 3. Deploy to Firebase
```bash
# From project root
firebase deploy --only functions
```

### 4. Verify Deployment
```bash
# Check function is deployed
firebase functions:list

# Check logs
firebase functions:log
```

---

## 🧪 TESTING

### Local Testing (Emulator)
```bash
# Start Firebase emulators
firebase emulators:start --only functions,firestore

# In another terminal, trigger function
firebase functions:shell
> dailyAftercare()
```

### Manual Trigger (Production)
```bash
# Trigger the function manually to test
gcloud functions call dailyAftercare --region=europe-west1
```

### Check Logs
```bash
# Real-time logs
firebase functions:log --only dailyAftercare

# Recent logs
firebase functions:log --only dailyAftercare --lines 50
```

---

## 📝 MONITORING

### View Logs in Firebase Console
1. Go to Firebase Console
2. Navigate to Functions
3. Click on `dailyAftercare`
4. View Logs tab

### Key Metrics to Monitor:
- **Execution count:** Should run once per day at 9 AM
- **Success rate:** Should be close to 100%
- **Email/Push counts:** Match expected clients
- **Errors:** FCM token errors, EmailJS failures

### Common Issues:
1. **Invalid FCM Token** → Automatically cleared from user document
2. **EmailJS Rate Limit** → Upgrade EmailJS plan
3. **Missing Template** → Check Firebase config

---

## 🔒 SECURITY

### Firestore Rules
Ensure tracking fields are only writable by Cloud Functions:
```javascript
match /users/{userId} {
  allow update: if request.auth != null && 
                   request.auth.uid == userId &&
                   !('emailsSent' in request.resource.data) &&
                   !('pushesSent' in request.resource.data);
}
```

### Environment Variables
- ✅ Stored in Firebase Functions config (encrypted)
- ✅ Never committed to Git
- ✅ Accessible only by Cloud Functions

---

## 💰 COSTS

### Firebase Functions (Blaze Plan Required)
- **Invocations:** 1/day = ~30/month → **FREE** (2M free/month)
- **Compute:** < 1 second/run → **FREE** (400K GB-seconds free/month)
- **Network:** Minimal → **FREE**

### EmailJS
- **Free Plan:** 200 emails/month
- **Personal Plan:** $9/month = 5,000 emails
- **Estimate:** ~180 emails/month for 30 clients

### Firebase Cloud Messaging
- **Completely FREE** (unlimited pushes)

**Total Cost:** $0-9/month depending on client count

---

## 🚀 DEPLOYMENT CHECKLIST

- [x] Create functions folder structure
- [x] Install dependencies (`npm install`)
- [x] Set environment variables in Firebase
- [x] Test locally with emulators
- [ ] Deploy to Firebase (`firebase deploy --only functions`)
- [ ] Verify first execution at 9 AM
- [ ] Monitor logs for errors
- [ ] Test with real client data

---

## 📚 FILES

```
functions/
├── index.js              # Entry point, exports all functions
├── dailyAftercare.js     # Main scheduler logic
├── package.json          # Dependencies
├── .gitignore           # Ignore node_modules
└── README.md            # This file
```

---

## 🔄 MAINTENANCE

### Update Email Template
```bash
firebase functions:config:set emailjs.template_day7="new_template_id"
firebase deploy --only functions
```

### Update Schedule
Edit `dailyAftercare.js`:
```javascript
.schedule('0 10 * * *') // Change to 10 AM
```

### Add New Communication Day
1. Add to `emailDays` or `pushDays` array
2. Add template ID or push message
3. Deploy

---

## 📞 SUPPORT

**Issues?** Check:
1. Firebase Functions logs
2. EmailJS dashboard (sent count)
3. FCM logs in Firebase Console
4. Firestore tracking fields

**Questions?** Review:
- Firebase Functions docs: https://firebase.google.com/docs/functions
- EmailJS docs: https://www.emailjs.com/docs/
- FCM docs: https://firebase.google.com/docs/cloud-messaging

---

## ✅ STATUS

**Current:** ✅ Implemented, ready to deploy  
**Next Steps:** Set Firebase config → Deploy → Monitor first run  
**ETA to Live:** 10 minutes after deployment
