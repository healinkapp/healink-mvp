# 🚀 DEPLOYMENT GUIDE - Healink Scheduling System

## ✅ PRE-DEPLOYMENT CHECKLIST

- [x] Functions folder created
- [x] Dependencies installed (`npm install` in functions/)
- [x] EmailJS credentials ready
- [x] Firebase project initialized
- [ ] Firebase Functions config set
- [ ] Functions deployed to Firebase
- [ ] First execution verified

---

## 📋 STEP-BY-STEP DEPLOYMENT

### Step 1: Install Dependencies (Already Done ✅)
```bash
cd functions
npm install
cd ..
```

### Step 2: Configure Firebase Functions
```bash
# Option A: Quick setup (recommended)
cd functions
./config-quick.sh
cd ..

# Option B: Manual setup
firebase functions:config:set \
  emailjs.service_id="service_13h3kki" \
  emailjs.public_key="uH10FXkw8yv434h5P" \
  emailjs.private_key="46LIXk6cVjUGFeUty-fg5" \
  emailjs.template_day1="template_d75273a" \
  emailjs.template_day3="template_xtdi2sx" \
  emailjs.template_day5="template_ombo3rr" \
  emailjs.template_day7="template_s8kfh7x" \
  emailjs.template_day30="template_y1ovm08"
```

### Step 3: Verify Configuration
```bash
firebase functions:config:get
```

Expected output:
```json
{
  "emailjs": {
    "service_id": "service_13h3kki",
    "public_key": "uH10FXkw8yv434h5P",
    "private_key": "46LIXk6cVjUGFeUty-fg5",
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
