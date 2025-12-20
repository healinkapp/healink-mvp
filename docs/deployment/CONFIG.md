# Firebase Functions Configuration Guide

**Last Updated:** 20 December 2025  
**Purpose:** Set production EmailJS credentials for automated aftercare emails

---

## ⚡ QUICK START (Recommended)

### Option 1: Automated Script (30 seconds)
```bash
cd functions
chmod +x config-quick.sh
./config-quick.sh
```

**Expected Output:**
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
```

---

## 🔧 MANUAL CONFIGURATION (If Script Fails)

### Option 2: Single Command (1 minute)
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

### Option 3: Individual Commands (2 minutes)
If the single command fails, set each variable individually:

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

---

## ✅ VERIFY CONFIGURATION

After setting config, verify it was saved correctly:

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

**If you see this, configuration is COMPLETE ✅**

---

## 🚀 DEPLOY FUNCTIONS

After config is verified, deploy:

```bash
firebase deploy --only functions
```

**Expected Output:**
```
✔ Deploy complete!
✔ Function(s) deployed successfully:
   - dailyAftercare (europe-west1)
```

---

## 🧪 TEST CONFIGURATION

### Test 1: Manual Trigger (Firebase Console)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `healink-mvp-27eff`
3. Navigate to: **Functions** → `dailyAftercare`
4. Click **Testing** tab
5. Click **Run function**
6. Check logs for execution

### Test 2: Wait for Scheduled Run
- Function runs daily at **9:00 AM Dublin time**
- First execution: Tomorrow at 9:00 AM
- Monitor logs: `firebase functions:log --only dailyAftercare`

### Test 3: Create Test Client
1. Login to Healink as artist
2. Add client with `tattooDate = today`
3. Wait until tomorrow 9:00 AM
4. Check client receives Day 1 email + push

---

## 🔍 TROUBLESHOOTING

### Issue: "Permission denied"
**Solution:** Ensure you're logged in to Firebase
```bash
firebase login
firebase projects:list  # Should show healink-mvp-27eff
```

### Issue: "Config not found after deploy"
**Solution:** Redeploy after setting config
```bash
firebase functions:config:get  # Verify config exists
firebase deploy --only functions --force  # Force redeploy
```

### Issue: "Emails not sending"
**Solution:** Check EmailJS dashboard for errors
1. Login to [EmailJS](https://dashboard.emailjs.com/)
2. Go to **Email Services** → `service_1tcang2`
3. Check **History** for delivery status
4. Verify templates exist:
   - `template_1tcang2` (Day 0)
   - `template_d75273a` (Day 1)
   - `template_xtdi2sx` (Day 3)
   - `template_ombo3rr` (Day 5)
   - `template_s8kfh7x` (Day 7)
   - `template_y1ovm08` (Day 30)

### Issue: "Function fails silently"
**Solution:** Check Firebase logs
```bash
firebase functions:log --only dailyAftercare --limit 50
```

Look for errors like:
- `EmailJS error: Invalid template ID`
- `Firebase error: Permission denied`
- `Network error: Cannot reach EmailJS API`

---

## 📋 CONFIGURATION REFERENCE

| Variable | Value | Purpose |
|----------|-------|---------|
| `emailjs.service_id` | `service_1tcang2` | EmailJS service ID |
| `emailjs.public_key` | `kGc9NLe3dC-X0KMBL` | EmailJS public key |
| `emailjs.private_key` | `LJT3w2cFG0-5dSuMI` | EmailJS private key (server-side) |
| `emailjs.template_day0` | `template_1tcang2` | Welcome email template |
| `emailjs.template_day1` | `template_d75273a` | Day 1 aftercare email |
| `emailjs.template_day3` | `template_xtdi2sx` | Day 3 aftercare email |
| `emailjs.template_day5` | `template_ombo3rr` | Day 5 aftercare email |
| `emailjs.template_day7` | `template_s8kfh7x` | Day 7 aftercare email |
| `emailjs.template_day30` | `template_y1ovm08` | Day 30 completion email |

---

## 🔐 SECURITY NOTES

- **Never commit these values to git** (functions/.env is gitignored ✅)
- Production config stored securely in Firebase (encrypted at rest)
- Private key only accessible by Cloud Functions (not frontend)
- Frontend uses public key only (safe to expose)

---

## 📊 POST-DEPLOYMENT CHECKLIST

After running config + deploy:

- [ ] Config verified: `firebase functions:config:get`
- [ ] Function deployed: `firebase functions:list` shows `dailyAftercare`
- [ ] Manual test passed (Firebase Console → Testing)
- [ ] Day 0 email sends when adding client
- [ ] Scheduled run at 9 AM tomorrow monitored
- [ ] EmailJS dashboard shows delivery success
- [ ] Firebase logs show no errors

**If all checkboxes ✅ → PRODUCTION READY 🚀**

---

## 🎯 NEXT STEPS

1. **Run config script:** `./config-quick.sh` (30 seconds)
2. **Deploy functions:** `firebase deploy --only functions` (2 minutes)
3. **Test Day 0 email:** Add test client (5 minutes)
4. **Monitor first scheduled run:** Tomorrow at 9 AM (24 hours)
5. **Launch to 5 artists:** Start onboarding real users

**Total Time:** 10 minutes active work + 24 hour monitoring

---

**Questions?** Check DEPLOYMENT.md or SCHEDULING.md for detailed system architecture.
