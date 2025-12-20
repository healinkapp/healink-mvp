# CLIENT SETUP FLOW - QUICK TEST CHECKLIST

## 🎯 PURPOSE
Use this checklist while testing the client creation flow. Check off each item as you verify it in the console.

---

## ✅ TEST CHECKLIST

### STEP 1: Artist Creates Client

**Actions:**
1. [ ] Login as artist
2. [ ] Click "Add Client"
3. [ ] Fill in client details:
   - Name: Test Client
   - Email: test@example.com
   - Photo: Any image
4. [ ] Click "Add Client"

**Console Output to Verify:**
```
=== [ARTIST] CREATING CLIENT ===
[ARTIST] Artist UID: [YOUR_ARTIST_UID]
[ARTIST] Client email: test@example.com
[ARTIST] Photo uploaded: https://...
[ARTIST] Generated uniqueToken: [TOKEN]
✅ [ARTIST] Firestore document created: {
  documentId: [DOC_ID],
  email: "test@example.com",
  role: "client",
  artistId: [YOUR_ARTIST_UID],
  hasCompletedSetup: false,
  uniqueToken: [TOKEN]
}
```

**Record These Values:**
- Document ID: _____________________
- uniqueToken: _____________________
- Email: _____________________

**Verify:**
- [ ] ✅ Document ID is a random string (not artist UID)
- [ ] ✅ hasCompletedSetup is false
- [ ] ✅ uniqueToken is generated
- [ ] ✅ Email is correct (no typos or extra spaces)
- [ ] ✅ Toast notification shows "Client added and welcome email sent!"

---

### STEP 2: Email Received

**Actions:**
1. [ ] Check email inbox for test@example.com
2. [ ] Open "Welcome to Healink" email
3. [ ] Find setup link in email

**Verify:**
- [ ] ✅ Email received within 1 minute
- [ ] ✅ Setup link format: `https://yourdomain.com/setup/[TOKEN]`
- [ ] ✅ Token in URL matches `uniqueToken` from Step 1

**Setup Link:** _____________________

---

### STEP 3: Click Setup Link

**Actions:**
1. [ ] Click setup link from email (or paste in browser)
2. [ ] Wait for page to load
3. [ ] Check console immediately

**Console Output to Verify:**
```
=== [SETUP] LOADING CLIENT DATA ===
[SETUP] Setup token from URL: [TOKEN]
[SETUP] Query results: 1 documents
✅ [SETUP] Found client document: {
  documentId: [DOC_ID],
  email: "test@example.com",
  name: "Test Client",
  hasCompletedSetup: false,
  uniqueToken: [TOKEN]
}
```

**Verify:**
- [ ] ✅ Token from URL matches token in console
- [ ] ✅ Query found exactly 1 document
- [ ] ✅ Document ID matches Step 1
- [ ] ✅ hasCompletedSetup is still false
- [ ] ✅ Setup form is displayed with welcome message

**⚠️ IF QUERY RETURNS 0 DOCUMENTS:**
- Token mismatch (URL vs Firestore)
- Document wasn't created
- Email URL was corrupted
- Check Firestore Console manually

---

### STEP 4: Create Password

**Actions:**
1. [ ] Enter password: "password123"
2. [ ] Confirm password: "password123"
3. [ ] Click "Create Account"
4. [ ] Watch console closely

**Console Output to Verify:**
```
=== [SETUP] CREATING ACCOUNT ===
[SETUP] Client document ID: [DOC_ID]
[SETUP] Client email: test@example.com
✅ [SETUP] Auth account created: {
  authUID: [AUTH_UID],
  email: "test@example.com"
}
[SETUP] ⚠️ CRITICAL: Firestore doc ID ([DOC_ID]) ≠ Auth UID ([AUTH_UID])
[SETUP] This is CORRECT. They are linked by EMAIL.
✅ [SETUP] Firestore updated successfully: {
  documentId: [DOC_ID],
  hasCompletedSetup: true,
  uniqueToken: "DELETED"
}
```

**Record These Values:**
- Auth UID: _____________________
- Firestore Doc ID: _____________________

**Verify:**
- [ ] ✅ Auth UID is generated (different from Doc ID)
- [ ] ✅ Firestore Doc ID is the same as Step 1
- [ ] ✅ hasCompletedSetup changed to true
- [ ] ✅ uniqueToken deleted
- [ ] ✅ Toast shows "Welcome to Healink! Your account is ready."
- [ ] ✅ Redirects to /client/dashboard after 300ms

**⚠️ IF clientData.id IS UNDEFINED:**
- Setup link query didn't work
- clientData wasn't set properly
- Go back to Step 3 logs

---

### STEP 5: Dashboard Loads

**Actions:**
1. [ ] Wait for automatic redirect to /client/dashboard
2. [ ] Check console immediately

**Console Output to Verify:**
```
=== [DASHBOARD] LOADING CLIENT ===
[DASHBOARD] Auth user email: test@example.com
[DASHBOARD] Auth user UID: [AUTH_UID]
[DASHBOARD] Query results: 1 documents
✅ [DASHBOARD] Client document found: {
  documentId: [DOC_ID],
  email: "test@example.com",
  name: "Test Client",
  hasCompletedSetup: true,
  artistId: [ARTIST_UID],
  healingDay: 0
}
```

**Verify:**
- [ ] ✅ Auth email matches Firestore email
- [ ] ✅ Query found exactly 1 document
- [ ] ✅ Document ID matches Step 1 and Step 4
- [ ] ✅ hasCompletedSetup is true
- [ ] ✅ Dashboard displays:
  - Client name
  - Healing day (Day 0)
  - Tattoo photo
  - Welcome message
- [ ] ✅ No error messages

**⚠️ IF QUERY RETURNS 0 DOCUMENTS:**
- **EMAIL MISMATCH** (most likely cause)
- hasCompletedSetup update failed
- Document wasn't created properly
- Check Firestore Console

---

### STEP 6: Logout and Login

**Actions:**
1. [ ] Click logout button
2. [ ] Go to /login
3. [ ] Enter credentials:
   - Email: test@example.com
   - Password: password123
4. [ ] Click "Login"
5. [ ] Check console

**Console Output to Verify:**
```
=== [LOGIN] AUTHENTICATING USER ===
[LOGIN] Email: test@example.com
✅ [LOGIN] Firebase Auth successful: {
  authUID: [AUTH_UID],
  email: "test@example.com"
}
[LOGIN] Querying Firestore for role...
[LOGIN] Query results: 1 documents
✅ [LOGIN] User document found: {
  documentId: [DOC_ID],
  email: "test@example.com",
  role: "client",
  hasCompletedSetup: true
}
[LOGIN] Redirecting to /client/dashboard (client)
```

**Verify:**
- [ ] ✅ Auth successful
- [ ] ✅ Query found document by email
- [ ] ✅ Role detected as "client"
- [ ] ✅ Redirects to /client/dashboard
- [ ] ✅ Dashboard loads successfully again

---

## 🔍 FIRESTORE CONSOLE VERIFICATION

### Manual Check in Firebase Console

1. [ ] Open Firebase Console → Firestore Database
2. [ ] Navigate to `users` collection
3. [ ] Find document with ID from Step 1
4. [ ] Verify document structure:

```javascript
{
  email: "test@example.com",         // ← Must match EXACTLY
  role: "client",                    // ← Must be "client"
  name: "Test Client",               // ← Client name
  artistId: "[ARTIST_UID]",          // ← Your artist UID
  hasCompletedSetup: true,           // ← Must be true after setup
  uniqueToken: [DELETED],            // ← Should be deleted
  tattooDate: "2024-12-20",          // ← Today's date
  tattooPhoto: "https://...",        // ← Cloudinary URL
  profilePhoto: "https://...",       // ← Cloudinary URL
  healingDay: 0,                     // ← Should be 0
  status: "healing",                 // ← Should be "healing"
  photos: [...],                     // ← Array with initial photo
  createdAt: Timestamp               // ← Timestamp
}
```

**Verify:**
- [ ] ✅ Document exists with correct ID
- [ ] ✅ All required fields present
- [ ] ✅ Email is exact match (no case difference)
- [ ] ✅ hasCompletedSetup is true
- [ ] ✅ uniqueToken is deleted (field doesn't exist)
- [ ] ✅ artistId matches your artist UID

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Invalid or expired link" on Setup Page
**Cause:** Token mismatch
**Check:**
- [ ] Token in URL matches Firestore uniqueToken
- [ ] Document was actually created in Step 1
- [ ] No typos in email link

### Issue 2: "Account not found" on Dashboard
**Cause:** Email mismatch or missing document
**Check:**
- [ ] Email in Auth matches email in Firestore (exact case)
- [ ] hasCompletedSetup was updated to true
- [ ] Document exists in Firestore with correct email

### Issue 3: clientData.id is undefined
**Cause:** Setup query didn't work
**Check:**
- [ ] Step 3 query returned 1 document
- [ ] clientData was set properly
- [ ] No console errors in Step 3

### Issue 4: Multiple documents with same email
**Cause:** Auth UID was used as doc ID instead of random ID
**Check:**
- [ ] Only ONE document per email in Firestore
- [ ] Document ID is random string (not Auth UID)
- [ ] Artist uses addDoc (not setDoc with UID)

---

## 📊 FINAL VERIFICATION

### All Steps Passed ✅

If all checkboxes are checked, the flow is working correctly!

**Summary:**
- Document ID (Firestore): _____________________
- Auth UID: _____________________
- Email: _____________________
- IDs are different: [ ] Yes [ ] No (should be Yes)
- Linked by email: [ ] Yes [ ] No (should be Yes)

---

## 🚨 IF ANY STEP FAILS

### What to Report:

1. **Which step failed:** _____________________
2. **Console logs:** (paste complete output)
3. **Error message:** _____________________
4. **Firestore screenshot:** (if possible)

### What to Check:

1. [ ] Console shows all log messages
2. [ ] No JavaScript errors in console
3. [ ] Firestore document exists
4. [ ] Email matches exactly (case-sensitive)
5. [ ] hasCompletedSetup updated properly

---

## ✅ SUCCESS CRITERIA

You'll know everything is working when:

✅ All 6 steps complete without errors
✅ All console logs show ✅ checkmarks
✅ Dashboard loads immediately after setup
✅ Login works after logout
✅ No "Account not found" errors
✅ Firestore document has all correct fields

---

**Print this checklist and mark off items as you test!**
