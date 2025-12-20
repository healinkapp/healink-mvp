# ✅ FIREBASE FUNCTIONS CONFIGURATION - READY TO DEPLOY

**Status:** Production-ready  
**Date:** 20 December 2025  
**Action Required:** Run script OR manual commands below

---

## 🎯 CONFIGURATION STATUS

### ✅ What's Ready:
- [x] Functions code complete (`dailyAftercare.js`)
- [x] Dependencies installed (523 packages, 0 vulnerabilities)
- [x] Configuration script created (`config-quick.sh`)
- [x] Manual commands documented (backup method)
- [x] 9 EmailJS variables prepared
- [x] Script executable permissions set

### ⏳ What's Needed:
- [ ] Run config script (30 seconds)
- [ ] Deploy to Firebase (2 minutes)

---

## ⚡ OPTION 1: AUTOMATED (RECOMMENDED)

### Run the Config Script:
```bash
cd /Users/appreciart/Desktop/healink/healink-mvp/functions
./config-quick.sh
```

### Expected Output:
```
🔧 Setting Firebase Functions Configuration...
✓ Functions config updated.
✅ Config set! Verifying...

📋 Current configuration:
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

🎉 Ready to deploy!
Next command: firebase deploy --only functions
```

**Time:** 30 seconds  
**If this works, skip to STEP 2: DEPLOY**

---

## 🔧 OPTION 2: MANUAL (IF SCRIPT FAILS)

### Single Command Method:
```bash
firebase functions:config:set \
  emailjs.service_id="service_1tcang2" \
  emailjs.public_key="kGc9NLe3dC-X0KMBL" \
  emailjs.private_key="LJT3w2cFG0-5dSuMI" \
  emailjs.template_day0="template_1tcang2" \
  emailjs.template_day1="template_d75273a" \
  emailjs.template_day3="template_xtdi2sx" \
  emailjs.template_day5="template_ombo3rr" \
  emailjs.template_day7="template_s8kfh7x" \
  emailjs.template_day30="template_y1ovm08"
```

### Individual Commands Method:
If the single command fails, run each one separately:

```bash
firebase functions:config:set emailjs.service_id="service_1tcang2"
firebase functions:config:set emailjs.public_key="kGc9NLe3dC-X0KMBL"
firebase functions:config:set emailjs.private_key="LJT3w2cFG0-5dSuMI"
firebase functions:config:set emailjs.template_day0="template_1tcang2"
firebase functions:config:set emailjs.template_day1="template_d75273a"
firebase functions:config:set emailjs.template_day3="template_xtdi2sx"
firebase functions:config:set emailjs.template_day5="template_ombo3rr"
firebase functions:config:set emailjs.template_day7="template_s8kfh7x"
firebase functions:config:set emailjs.template_day30="template_y1ovm08"
```

**Time:** 2 minutes

---

## ✅ VERIFY CONFIGURATION

After running either method, verify the config was saved:

```bash
firebase functions:config:get
```

**Expected Output:**
```json
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

**If you see this → Configuration COMPLETE ✅**

---

## 🚀 STEP 2: DEPLOY

Once config is verified, deploy the function:

```bash
cd /Users/appreciart/Desktop/healink/healink-mvp
firebase deploy --only functions
```

**Expected Output:**
```
=== Deploying to 'healink-mvp-27eff'...

i  deploying functions
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (123.45 KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: creating Node.js 18 function dailyAftercare(europe-west1)...
✔  functions[dailyAftercare(europe-west1)] Successful create operation.
Function URL (dailyAftercare(europe-west1)): https://europe-west1-healink-mvp-27eff.cloudfunctions.net/dailyAftercare

✔  Deploy complete!
```

**Time:** 2-3 minutes  
**If you see this → Deployment COMPLETE ✅**

---

## 🧪 STEP 3: TEST

### Test 1: Manual Trigger (Immediate)
```bash
# Trigger function manually via Firebase Console
# 1. Go to: https://console.firebase.google.com/project/healink-mvp-27eff/functions
# 2. Click: dailyAftercare
# 3. Click: Testing tab
# 4. Click: Run function
# 5. Check logs for execution
```

### Test 2: Add Test Client (5 minutes)
1. Login to Healink as artist
2. Dashboard → Add Client
3. Fill form with test data
4. Submit
5. **Check email inbox for Day 0 email** ✅

### Test 3: Wait for Scheduled Run (24 hours)
- Function runs daily at **9:00 AM Dublin time**
- First execution: Tomorrow at 9:00 AM
- Monitor logs:
  ```bash
  firebase functions:log --only dailyAftercare
  ```

---

## 📊 MONITORING

### Check Function Status:
```bash
firebase functions:list
```

**Expected Output:**
```
✔ Functions in project healink-mvp-27eff
dailyAftercare (europe-west1) [Scheduled: 0 9 * * *]
```

### View Logs:
```bash
# Live tail (real-time)
firebase functions:log --only dailyAftercare

# Last 50 entries
firebase functions:log --only dailyAftercare --limit 50
```

### EmailJS Dashboard:
1. Login: https://dashboard.emailjs.com/
2. Service: `service_1tcang2`
3. Check **History** tab for sent emails
4. Verify delivery status

---

## ⚠️ TROUBLESHOOTING

### Issue: "Permission denied"
```bash
firebase login
firebase projects:list  # Should show healink-mvp-27eff
```

### Issue: "Config not showing after set"
```bash
# Re-run config
cd functions
./config-quick.sh

# Force verify
firebase functions:config:get
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
3. Firebase Functions logs: `firebase functions:log --only dailyAftercare`
4. EmailJS service status: https://status.emailjs.com/

---

## 📋 CONFIGURATION REFERENCE

| Variable | Value | Purpose |
|----------|-------|---------|
| `service_id` | `service_1tcang2` | EmailJS service ID |
| `public_key` | `kGc9NLe3dC-X0KMBL` | EmailJS public key |
| `private_key` | `LJT3w2cFG0-5dSuMI` | EmailJS private key (server-side only) |
| `template_day0` | `template_1tcang2` | Welcome email (sent by artist) |
| `template_day1` | `template_d75273a` | Day 1 aftercare email |
| `template_day3` | `template_xtdi2sx` | Day 3 aftercare email |
| `template_day5` | `template_ombo3rr` | Day 5 aftercare email |
| `template_day7` | `template_s8kfh7x` | Day 7 aftercare email |
| `template_day30` | `template_y1ovm08` | Day 30 completion email |

---

## ✅ FINAL CHECKLIST

- [ ] Config script executed successfully
- [ ] `firebase functions:config:get` shows all 9 variables
- [ ] `firebase deploy --only functions` completed
- [ ] `firebase functions:list` shows `dailyAftercare`
- [ ] Test client added (Day 0 email received)
- [ ] Logs show no errors
- [ ] EmailJS dashboard shows delivery

**When all ✅ → PRODUCTION READY 🚀**

---

## 🎯 NEXT COMMAND

**Copy-paste this to complete configuration:**

```bash
cd /Users/appreciart/Desktop/healink/healink-mvp/functions && \
./config-quick.sh && \
cd .. && \
firebase deploy --only functions
```

**Time:** 3 minutes  
**Result:** Fully deployed automated aftercare system ✨

---

**Questions?** See `functions/CONFIG.md` for detailed troubleshooting.
