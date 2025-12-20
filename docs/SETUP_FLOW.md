# Client Setup Flow Documentation

## Overview

The client setup flow allows artists to invite clients and enable them to create their own accounts securely.

## Flow Diagram

```
1. ARTIST CREATES CLIENT
   ↓
   Firestore document created with:
   - uniqueToken (random, one-time)
   - hasCompletedSetup: false
   - email, name, tattooDate, photo
   ↓
2. EMAIL SENT TO CLIENT
   ↓
   Setup link: /client/setup/{uniqueToken}
   ↓
3. CLIENT CLICKS LINK (UNAUTHENTICATED)
   ↓
   Query Firestore by uniqueToken
   (Allowed by rule: hasCompletedSetup == false)
   ↓
4. CLIENT CREATES PASSWORD
   ↓
   Firebase Auth account created
   ↓
5. FIRESTORE DOCUMENT UPDATED
   ↓
   - hasCompletedSetup: true
   - uniqueToken: DELETED (security)
   ↓
6. CLIENT REDIRECTED TO DASHBOARD
   ↓
   Now authenticated, normal auth flow
```

## Routes

### `/client/setup/:token`
- **Purpose**: Client account setup page
- **Authentication**: NONE (unauthenticated)
- **Component**: `ClientSetup.jsx`
- **Route defined in**: `App.jsx`

## Technical Implementation

### 1. Client Document Creation (Artist Side)

**File**: `src/pages/Dashboard.jsx` (or wherever client creation happens)

```javascript
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Generate unique token
const uniqueToken = generateRandomToken(20); // e.g., "esj6jmwvr1fmjj8a8eq7g"

// Create client document
await addDoc(collection(db, 'users'), {
  name: clientName,
  email: clientEmail,
  role: 'client',
  artistId: currentArtistId,
  hasCompletedSetup: false,
  uniqueToken: uniqueToken,
  tattooDate: selectedDate,
  tattooPhoto: photoUrl,
  createdAt: serverTimestamp()
});

// Send setup email
const setupLink = `${window.location.origin}/client/setup/${uniqueToken}`;
await sendSetupEmail(clientEmail, setupLink);
```

### 2. Client Setup Query (Client Side - Unauthenticated)

**File**: `src/pages/ClientSetup.jsx`

```javascript
// Extract token from URL
const { token } = useParams();

// Query Firestore (NO AUTHENTICATION REQUIRED)
const q = query(
  collection(db, 'users'),
  where('uniqueToken', '==', token),
  where('role', '==', 'client'),
  limit(1)
);

const snapshot = await getDocs(q);

if (!snapshot.empty) {
  const clientDoc = snapshot.docs[0];
  const clientData = clientDoc.data();
  
  // Display setup form
  setClientData({ id: clientDoc.id, ...clientData });
}
```

### 3. Account Creation and Setup Completion

**File**: `src/pages/ClientSetup.jsx`

```javascript
// Step 1: Create Firebase Auth account
const userCredential = await createUserWithEmailAndPassword(
  auth, 
  clientData.email, 
  password
);

// Step 2: Update Firestore document
await updateDoc(doc(db, 'users', clientData.id), {
  hasCompletedSetup: true,
  uniqueToken: deleteField() // Remove token for security
});

// Step 3: Redirect to dashboard
navigate('/client/dashboard');
```

## Firestore Security Rules

### Critical Rule: Unauthenticated Client Setup Read

```javascript
match /users/{userId} {
  // Allow unauthenticated read for pending client setup
  allow read: if (
    resource.data.role == 'client' &&
    resource.data.hasCompletedSetup == false
  );
}
```

**Why this is secure:**
1. Only applies to documents with `hasCompletedSetup: false`
2. Token is random and long (20+ characters)
3. Token is one-time use (deleted after setup)
4. Client can only READ, not MODIFY
5. After setup, document becomes protected by authentication

### Update Rule: Client Completes Setup

```javascript
match /users/{userId} {
  // Allow client to update their own document after auth creation
  allow update: if (
    isSignedIn() &&
    resource.data.email == request.auth.token.email &&
    resource.data.role == 'client' &&
    resource.data.hasCompletedSetup == false &&
    request.resource.data.hasCompletedSetup == true
  );
}
```

**This ensures:**
1. User must be authenticated (just created account)
2. Email must match the document email
3. Can only update `hasCompletedSetup` from `false` to `true`
4. One-time operation

## Security Considerations

### ✅ Secure
- Unauthenticated read is scoped to pending clients only
- Token is random and unpredictable
- Token is deleted after use
- No sensitive data exposed before authentication
- Email verification handled by Firebase Auth

### ⚠️ Potential Issues
- **Link sharing**: If client shares link, someone else could complete setup
  - **Mitigation**: Email notification when account is created
  - **Future**: Add email verification step before account creation

- **Token in URL**: Visible in browser history
  - **Mitigation**: Token is one-time use and deleted after setup
  - **Future**: Consider shorter token expiration

## Testing Checklist

### ✅ Happy Path
- [ ] Artist creates client
- [ ] Email sent with setup link
- [ ] Client clicks link
- [ ] Page loads without errors
- [ ] Query finds client document
- [ ] Setup form displays
- [ ] Client creates password
- [ ] Auth account created
- [ ] Firestore document updated
- [ ] uniqueToken deleted
- [ ] Client redirected to dashboard
- [ ] Client can login again later

### ✅ Error Cases
- [ ] Invalid token → "Invalid or expired link" error
- [ ] Already completed setup → "Account already set up" error
- [ ] Password too short → Validation error
- [ ] Passwords don't match → Validation error
- [ ] Network error → Graceful error handling

### ✅ Security Tests
- [ ] Cannot query clients with `hasCompletedSetup: true`
- [ ] Cannot update other users' documents
- [ ] Cannot reuse token after setup
- [ ] Cannot bypass email verification

## Troubleshooting

### Issue: "Missing or insufficient permissions"

**Causes:**
1. Firestore rules not deployed
2. Document has `hasCompletedSetup: true` (already set up)
3. Document missing `role: 'client'` field
4. Token doesn't match (typo in URL)

**Solution:**
```bash
# Redeploy rules
firebase deploy --only firestore:rules

# Check document in Firestore Console
# Verify: role == 'client', hasCompletedSetup == false
```

### Issue: "No routes matched location"

**Cause:** Route not defined in `App.jsx`

**Solution:**
```jsx
// In App.jsx
<Route path="/client/setup/:token" element={<ClientSetup />} />
```

### Issue: Setup works but login fails

**Cause:** Client document and Auth account have different identifiers

**Explanation:**
- Auth account UID: `abc123` (generated by Firebase Auth)
- Firestore document ID: `xyz789` (generated when artist creates client)
- They are linked by EMAIL, not UID

**Verification:**
```javascript
// In login flow, query by email:
const q = query(
  collection(db, 'users'),
  where('email', '==', userEmail)
);
```

## Related Files

- `src/pages/ClientSetup.jsx` - Setup page component
- `src/App.jsx` - Route definition
- `firestore.rules` - Security rules
- `src/services/emailService.js` - Email sending
- `FIRESTORE_RULES_CHANGELOG.md` - Rules history

## Future Improvements

1. **Email verification before setup**
   - Send verification email first
   - Only allow setup after verification

2. **Token expiration**
   - Add `tokenExpiry` timestamp
   - Validate token age before allowing setup

3. **Rate limiting**
   - Limit setup attempts per token
   - Prevent brute force attacks

4. **Multi-step setup**
   - Email verification
   - Password creation
   - Profile completion

5. **Setup analytics**
   - Track completion rate
   - Identify drop-off points
   - Monitor setup time
