# Validation Checklist - Client Setup Flow

## ✅ COMPLETED: Rules Deployment

- [x] Firestore rules updated to production-ready version
- [x] Removed all debug rules (`allow: if true`)
- [x] Backup created: `firestore.rules.backup.final`
- [x] Rules deployed successfully to `healink-mvp-27eff`
- [x] Documentation created and updated

## 📋 TESTING REQUIRED

### Test 1: Artist Signup (Fresh Account)
**Status:** ⏳ PENDING

**Steps:**
1. Open incognito window
2. Navigate to `/signup` (or signup page)
3. Create new artist account:
   - Name: Final Test Artist
   - Email: finalartist@test.com
   - Password: password123

**Expected Results:**
- [ ] Firebase Auth account created successfully
- [ ] Firestore document created in `users` collection
- [ ] Document has correct fields: `role: 'artist'`, `email`, `name`
- [ ] Redirect to `/dashboard` works
- [ ] No "Missing or insufficient permissions" errors in console
- [ ] Dashboard loads with artist data

**If it fails:**
- Check console for errors
- Verify Firestore document was created
- Check Firebase Auth user was created

---

### Test 2: Artist Login
**Status:** ⏳ PENDING

**Steps:**
1. Logout from artist account
2. Navigate to `/login`
3. Login with: `finalartist@test.com` / `password123`

**Expected Results:**
- [ ] Login successful (no errors)
- [ ] Query by email finds artist document
- [ ] Redirect to `/dashboard` works
- [ ] Dashboard displays correct artist data

**If it fails:**
- Check if document exists in Firestore
- Verify email in document matches Firebase Auth email

---

### Test 3: Client Creation by Artist
**Status:** ⏳ PENDING

**Steps:**
1. Logged in as artist (finalartist@test.com)
2. Navigate to client creation page
3. Create new client:
   - Name: Final Test Client
   - Email: finalclient@test.com
   - Tattoo Date: (select future date)
   - Photo: (upload any image)

**Expected Results:**
- [ ] Client document created in Firestore
- [ ] Document has: `role: 'client'`, `hasCompletedSetup: false`, `uniqueToken`
- [ ] uniqueToken is random string (20+ chars)
- [ ] artistId matches current artist's UID
- [ ] Email sent with setup link
- [ ] No permission errors

**Verify in Firestore Console:**
```javascript
{
  email: "finalclient@test.com",
  name: "Final Test Client",
  role: "client",
  artistId: "<artist-uid>",
  hasCompletedSetup: false,
  uniqueToken: "<random-token>",
  tattooDate: Timestamp,
  tattooPhoto: "https://...",
  createdAt: Timestamp
}
```

---

### Test 4: Client Setup (CRITICAL)
**Status:** ⏳ PENDING

**Steps:**
1. Open NEW incognito window
2. Clear all browser data (Cmd+Shift+Delete)
3. Copy setup link from email (or construct manually)
4. Navigate to: `http://localhost:5173/client/setup/<uniqueToken>`
5. Open DevTools console BEFORE page loads

**Expected Results:**
- [ ] Page loads (no 404 or route error)
- [ ] Console shows debug logs:
  ```
  === CLIENT SETUP DEBUG ===
  1. Token from URL: <token>
  2. Building query...
  3. Query built successfully
  4. Executing query...
  5. Query executed
  6. Results: 1 documents
  8. DOCUMENT FOUND:
     - ID: <doc-id>
     - Email: finalclient@test.com
     - Role: client
     - hasCompletedSetup: false
     - uniqueToken: <token>
     - Token match: true
  ```
- [ ] Setup form displays with client name and email
- [ ] No "Missing or insufficient permissions" error

**If "QUERY FAILED" appears:**
- Check error code and message in console
- Verify document exists in Firestore
- Verify `hasCompletedSetup: false`
- Verify `role: 'client'`
- Verify uniqueToken matches URL

**Create password:**
1. Enter password: `password123`
2. Confirm password: `password123`
3. Click "Complete Setup"

**Expected after submission:**
- [ ] Firebase Auth account created
- [ ] Firestore document updated: `hasCompletedSetup: true`
- [ ] uniqueToken field deleted from document
- [ ] Redirect to `/client/dashboard`
- [ ] Dashboard loads with client data

---

### Test 5: Client Login
**Status:** ⏳ PENDING

**Steps:**
1. Logout
2. Navigate to `/login`
3. Login with: `finalclient@test.com` / `password123`

**Expected Results:**
- [ ] Login successful
- [ ] Query by email finds client document
- [ ] Redirect to `/client/dashboard`
- [ ] Dashboard displays client data

---

## 🔒 Security Validation

### Security Test 1: Unauthenticated Access to Completed Client
**Status:** ⏳ PENDING

**Test in Firebase Rules Playground:**
1. Go to Firebase Console → Firestore → Rules
2. Click "Rules Playground"
3. Configure:
   - Location: `/users/<completed-client-doc-id>`
   - Operation: `get`
   - Authentication: DISABLED
4. Click "Run"

**Expected:** ❌ DENY

**Reason:** Only clients with `hasCompletedSetup: false` are readable without auth

---

### Security Test 2: Artist A Reads Artist B's Document
**Status:** ⏳ PENDING

**Test:**
1. Create two artist accounts (artistA, artistB)
2. Try to query artistB's document while logged in as artistA

**Expected:** ❌ DENY (no results)

---

### Security Test 3: Client A Reads Client B's Document
**Status:** ⏳ PENDING

**Test:**
1. Create two client accounts (clientA, clientB)
2. Try to query clientB's document while logged in as clientA

**Expected:** ❌ DENY (no results)

---

### Security Test 4: Client Creates Another Client
**Status:** ⏳ PENDING

**Test in Rules Playground:**
1. Location: `/users/{new-doc-id}`
2. Operation: `create`
3. Authentication: ENABLED (as client)
4. Data:
   ```json
   {
     "role": "client",
     "email": "test@test.com",
     "artistId": "some-artist-id",
     "hasCompletedSetup": false
   }
   ```

**Expected:** ❌ DENY

**Reason:** Only artists can create client documents

---

### Security Test 5: Revert Completed Setup
**Status:** ⏳ PENDING

**Test:**
Try to update a client document:
```javascript
// FROM
hasCompletedSetup: true

// TO
hasCompletedSetup: false
```

**Expected:** ❌ DENY

**Reason:** Can only update FROM false TO true, not the reverse

---

## 📊 Summary

### Functional Tests
- [ ] Artist Signup
- [ ] Artist Login
- [ ] Client Creation
- [ ] Client Setup
- [ ] Client Login

### Security Tests
- [ ] Deny unauthenticated access to completed clients
- [ ] Deny cross-artist document access
- [ ] Deny cross-client document access
- [ ] Deny client creating client
- [ ] Deny reverting completed setup

### Documentation
- [x] FIRESTORE_RULES_CHANGELOG.md updated
- [x] SETUP_FLOW.md created
- [x] VALIDATION_CHECKLIST.md created

---

## ✅ SUCCESS CRITERIA

All tasks complete when:

1. ✅ All 5 functional tests pass without errors
2. ✅ All 5 security tests correctly deny unauthorized access
3. ✅ No console errors in any flow
4. ✅ Documentation is complete and accurate
5. ✅ Production rules are deployed and working

---

## 🎯 Current Status

**Completed:**
- ✅ Firestore rules updated to production version
- ✅ Rules deployed to Firebase
- ✅ Documentation created
- ✅ Client setup route fixed (`/client/setup/:token`)
- ✅ Debug logging added to ClientSetup.jsx

**Next Action:**
👉 **Run Test 4 (Client Setup) with the setup link and verify it works**

**After successful test:**
- Complete remaining functional tests
- Run security validation tests
- Mark all items as complete

---

## 📝 Test Results Log

### Test 4 - Client Setup (Latest Attempt)
**Date:** 2024-12-20  
**Result:** ⏳ IN PROGRESS  
**Notes:**
- Route fixed from `/setup/:token` to `/client/setup/:token`
- Debug logging added
- Production rules deployed
- Awaiting user test with actual setup link

**Console output will show here after test**
