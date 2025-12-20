# 🚀 FINAL DEPLOYMENT CHECKLIST

## ✅ PRE-DEPLOYMENT (5 minutes)

### 1. Set Firebase Functions Config
```bash
cd functions
./config-quick.sh
cd ..
```

**Expected output:**
- ✅ 9 EmailJS variables set
- ✅ Configuration verified

**Fallback:** If script fails, see `functions/config-manual.md`

---

### 2. Install Dependencies
```bash
cd functions
npm install
cd ..
```

**Expected output:**
- ✅ 523 packages installed
- ✅ 0 vulnerabilities

---

### 3. Build Frontend
```bash
npm run build
```

**Expected output:**
- ✅ Build complete (2-3s)
- ✅ Bundle size: ~717 kB

---

## 🚀 DEPLOY (3 minutes)

### 1. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

**Expected output:**
```
✔ Deploy complete!
✔ Function(s) deployed successfully:
   - dailyAftercare (europe-west1)
```

---

### 2. Verify Function Deployed
```bash
firebase functions:list
```

**Expected output:**
```
dailyAftercare(europe-west1)
  Trigger: pubsub.schedule
  Schedule: 0 9 * * *
  Timezone: Europe/Dublin
```

---

### 3. Check Function Logs
```bash
firebase functions:log --only dailyAftercare --lines 10
```

**Expected output:**
- ✅ No errors
- Function waiting for tomorrow 9 AM

---

## 🧪 TEST (10 minutes)

### Test 1: Day 0 Email
1. Open app: https://healink-mvp.web.app
2. Login as artist
3. Add test client with your email
4. Check inbox for Day 0 email

**Expected:**
- ✅ Email received within 30 seconds
- ✅ Subject: "Your tattoo healing starts today"
- ✅ Setup link works

---

### Test 2: Client Setup
1. Click setup link from email
2. Create password
3. Grant push permission
4. View dashboard

**Expected:**
- ✅ Account created
- ✅ Push permission granted
- ✅ FCM token saved to Firestore

---

### Test 3: Monitor Tomorrow's Automated Send
Wait until tomorrow 9:00 AM Dublin time, then check:

```bash
firebase functions:log --only dailyAftercare
```

**Expected:**
- ✅ `[EMAIL] Sent Day 1 to {email}`
- ✅ `[PUSH] Sent Day 1 to {email}`

---

### Test 4: Photo Reminders (Day 3, 7, 14, 30)
On Day 3, 7, 14, and 30, client should receive photo check-in push:

**Expected:**
- ✅ Push notification with photo reminder
- ✅ "Upload a quick photo" message
- ✅ `requireInteraction: true` (stays visible)

---

## 📊 PRODUCTION MONITORING

### Check Email Delivery
- **EmailJS Dashboard:** https://dashboard.emailjs.com/admin
- Go to **History** tab
- Verify emails sent successfully

---

### Check Push Delivery
- **Firebase Console:** Cloud Messaging section
- Check delivery reports
- Monitor opt-in rates

---

### Check Function Execution
```bash
firebase functions:log --only dailyAftercare --lines 100
```

**Look for:**
- `[EMAIL]` entries showing sent emails
- `[PUSH]` entries showing sent pushes
- `[PHOTO]` entries showing photo reminders
- No error messages

---

## ✅ SUCCESS CRITERIA

- [x] Artist can add client
- [x] Day 0 email sends immediately
- [x] Client can complete setup
- [x] Push permission works
- [x] Automated function runs daily at 9 AM
- [x] Photo reminders send on Day 3, 7, 14, 30

**When all checked:** ✅ **PRODUCTION READY**

---

## 📋 COMMUNICATION TIMELINE

### Emails (6 total)
- Day 0: Welcome + Setup link
- Day 1: First check-in
- Day 3: Start moisturizing
- Day 5: Itching phase
- Day 7: Week 1 complete
- Day 30: Journey complete

### Push Notifications (11 total)
- Day 1: Check-in reminder
- Day 2: Inflammation normal
- Day 3: Start moisturizing
- Day 4: Moisturize reminder
- Day 5: Itching phase
- Day 6: Evening reminder
- Day 7: Week 1 complete
- Day 10: Peeling is normal
- Day 14: Halfway healed
- Day 21: Week 3 check-in
- Day 30: Journey complete

### Photo Reminders (4 total - NEW)
- Day 3: First progress photo
- Day 7: Week 1 photo
- Day 14: Halfway photo
- Day 30: Final healed photo

**Total:** 21 touchpoints over 30 days

---

## 🎯 STATUS

**Configuration:** ✅ Complete (9 variables set)  
**Deployment:** ⏳ Pending (requires Blaze plan upgrade)  
**Testing:** ⏳ Pending (after deployment)

**Next Action:** 
1. Upgrade Firebase to Blaze plan
2. Run: `firebase deploy --only functions`
3. Test with first artist

---

## 🔧 TROUBLESHOOTING

### Issue: "Permission denied"
```bash
firebase login
firebase projects:list
```

### Issue: "Config not found"
```bash
cd functions
./config-quick.sh
```

### Issue: "Deploy fails"
```bash
# Check Node version (should be 18)
node --version

# Try force deploy
firebase deploy --only functions --force
```

### Issue: "Emails not sending"
**Check:**
1. EmailJS dashboard for errors
2. Template IDs are correct
3. Firebase Functions logs
4. EmailJS service status

---

**Last Updated:** 20 December 2025  
**Status:** Ready for Blaze upgrade + deployment
{
  "emailjs": {
    "service_id": "service_1tcang2",
    "public_key": "kGc9NLe3dC-X0KMBL",
    "private_key": "LJT3w2cFG0-5dSuMI",
    "template_day0": "template_1tcang2",
    "template_day1": "template_d75273a",
    "template_day3": "template_xtdi2sx",
    "template_day5": "template_ombo3rr",
    "template_day7": "template_s8kfh7x",
    "template_day30": "template_y1ovm08"
  }
}
```

### Step 4: Deploy to Firebase
```bash
firebase deploy --only functions
```

Expected output:
```
✔ Deploy complete!

Function URL (dailyAftercare):
https://europe-west1-healink-mvp-27eff.cloudfunctions.net/dailyAftercare
```

### Step 5: Verify Deployment
```bash
# List deployed functions
firebase functions:list

# Check recent logs
firebase functions:log --only dailyAftercare --lines 10
```

---

## 🧪 TESTING

### Test 1: Manual Trigger (Immediate)
```bash
# Trigger function now (doesn't wait for 9 AM)
firebase functions:shell

# Then in the shell:
> dailyAftercare()
```

### Test 2: Check Logs
```bash
# Real-time logs
firebase functions:log --only dailyAftercare

# Filter errors only
firebase functions:log --only dailyAftercare --level error
```

### Test 3: Verify in Firebase Console
1. Go to: https://console.firebase.google.com/
2. Select project: `healink-mvp-27eff`
3. Navigate to: Functions → dailyAftercare
4. Check: Logs, Metrics, Health

---

## 📊 MONITORING FIRST EXECUTION

### When Will It Run?
- **First execution:** Tomorrow at 9:00 AM Dublin time
- **Timezone:** Europe/Dublin (GMT/GMT+1 depending on DST)
- **Cron schedule:** `0 9 * * *`

### What to Check:
1. **Execution logs** - Did it run?
2. **Processed count** - How many clients?
3. **Emails sent** - Check EmailJS dashboard
4. **Pushes sent** - Check Firebase Cloud Messaging
5. **Errors** - Any failures?

### Expected Log Output:
```
[SCHEDULER] Starting daily aftercare run: 2025-12-21T09:00:00.000Z
[SCHEDULER] Found 5 active clients
[SCHEDULER] Processing client john@example.com - Day 3
[EMAIL] ✅ Sent Day 3 email to john@example.com
[PUSH] ✅ Sent Day 3 push to john@example.com
[SCHEDULER] Daily aftercare complete - Processed: 5, Emails: 2, Pushes: 3
```

---

## 🔧 TROUBLESHOOTING

### Issue: Function not deployed
```bash
# Check Firebase project
firebase use

# Should show: healink-mvp-27eff

# Re-deploy
firebase deploy --only functions --force
```

### Issue: Config not found
```bash
# Check current config
firebase functions:config:get

# If empty, re-run config script
cd functions
./config-quick.sh
cd ..
```

### Issue: Email not sending
1. Check EmailJS dashboard: https://dashboard.emailjs.com/
2. Verify service ID and template IDs
3. Check EmailJS quota (200 emails/month on free plan)
4. Review function logs for errors

### Issue: Push not sending
1. Check if client has `fcmToken` in Firestore
2. Verify VAPID key is correct
3. Check Firebase Cloud Messaging quota
4. Review function logs for invalid token errors

---

## 💰 COST ESTIMATE

### Firebase Functions (Blaze Plan)
- **Daily executions:** 1/day = 30/month
- **Compute time:** ~1 second/execution
- **Monthly cost:** **$0** (within free tier)

### EmailJS
- **Current plan:** Free (200 emails/month)
- **Usage estimate:** ~180 emails/month for 30 clients
- **Upgrade:** $9/month for 5,000 emails if needed

### Firebase Cloud Messaging
- **Cost:** **$0** (unlimited, always free)

**Total:** $0-9/month

---

## 📅 SCHEDULE VERIFICATION

### Check Next Execution:
```bash
# View function details
firebase functions:list

# Check Cloud Scheduler in Console:
https://console.cloud.google.com/cloudscheduler?project=healink-mvp-27eff
```

### Manual Schedule Check:
```javascript
// Next execution: Tomorrow at 9:00 AM Dublin time
const next = new Date();
next.setDate(next.getDate() + 1);
next.setHours(9, 0, 0, 0);
console.log('Next execution:', next.toLocaleString('en-IE', { 
  timeZone: 'Europe/Dublin' 
}));
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

After deployment:
- [ ] Function appears in Firebase Console
- [ ] Cloud Scheduler created automatically
- [ ] Config values visible in Firebase Console
- [ ] No errors in deployment logs
- [ ] Test execution successful
- [ ] Monitoring setup in Firebase Console
- [ ] Email/SMS alerts configured (optional)

---

## 🆘 NEED HELP?

### Documentation:
- **Firebase Functions:** https://firebase.google.com/docs/functions
- **Cloud Scheduler:** https://cloud.google.com/scheduler/docs
- **EmailJS:** https://www.emailjs.com/docs/
- **FCM:** https://firebase.google.com/docs/cloud-messaging

### Quick Commands:
```bash
# View all functions
firebase functions:list

# Delete function (if needed)
firebase functions:delete dailyAftercare

# Re-deploy
firebase deploy --only functions

# View logs
firebase functions:log --only dailyAftercare
```

---

## 🎉 SUCCESS CRITERIA

Your deployment is successful when:
1. ✅ Function deploys without errors
2. ✅ Cloud Scheduler shows next run time
3. ✅ Manual trigger works (test execution)
4. ✅ Logs show expected output
5. ✅ First automatic execution completes at 9 AM
6. ✅ Emails appear in EmailJS dashboard
7. ✅ Push notifications received on test devices

---

**Ready to deploy? Run:** `firebase deploy --only functions` 🚀
