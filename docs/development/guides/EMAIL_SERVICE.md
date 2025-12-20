# Email Service - Healink MVP

## 📧 Overview

Centralized email service for sending aftercare emails via EmailJS at different healing stages.

---

## 🎯 Supported Email Days

| Day | Template | Purpose |
|-----|----------|---------|
| **0** | `template_1tcang2` | Welcome + Account Setup Link |
| **1** | `template_d75273a` | First day aftercare tips |
| **3** | `template_xtdi2sx` | Early healing phase |
| **5** | `template_ombo3rr` | Mid-week check-in |
| **7** | `template_s8kfh7x` | Critical phase complete |
| **30** | `template_y1ovm08` | Fully healed celebration |

---

## 🚀 Usage

### **Import the service**

```javascript
import { 
  sendDay0Email, 
  sendAftercareEmail,
  sendHealingEmail 
} from '../services/emailService';
```

---

### **1. Send Day 0 Welcome Email**

```javascript
// When adding a new client
await sendDay0Email({
  clientEmail: 'client@example.com',
  clientName: 'João Silva',
  studioName: 'Black Rose Tattoo',
  setupLink: 'https://healink.app/setup/abc123',
  tattooPhoto: 'https://cloudinary.com/...' // Optional
});
```

**Template Variables (Day 0):**
- `{to_email}` - Client email
- `{client_name}` - Client name
- `{studio_name}` - Artist studio name
- `{setup_link}` - Account setup URL
- `{tattoo_photo}` - Cloudinary image URL (optional)

---

### **2. Send Aftercare Emails (Day 1-30)**

```javascript
// Send Day 7 email
await sendAftercareEmail({
  clientEmail: 'client@example.com',
  clientName: 'João Silva',
  dayNumber: 7,
  appLink: 'https://healink.app/client/dashboard'
});
```

**Template Variables (Day 1-30):**
- `{to_email}` - Client email
- `{client_name}` - Client name
- `{app_link}` - Link to client dashboard

---

### **3. Universal Email Sender (Recommended)**

```javascript
// Automatically detects Day 0 vs aftercare
const client = {
  email: 'client@example.com',
  name: 'João Silva',
  tattooPhoto: 'https://...'
};

const artist = {
  studioName: 'Black Rose Tattoo',
  name: 'Maria Artist'
};

// Day 0 (requires setupToken)
await sendHealingEmail(client, artist, 0, 'abc123token');

// Day 7 (no token needed)
await sendHealingEmail(client, artist, 7);
```

---

## 🛠️ Helper Functions

### **Check if template is configured**

```javascript
import { isTemplateConfigured } from '../services/emailService';

if (isTemplateConfigured(7)) {
  await sendAftercareEmail({ ... });
}
```

### **Get all configured days**

```javascript
import { getConfiguredDays } from '../services/emailService';

const days = getConfiguredDays();
// Returns: [0, 1, 3, 5, 7, 30]
```

### **Validate EmailJS configuration**

```javascript
import { validateEmailConfig } from '../services/emailService';

const config = validateEmailConfig();
console.log(config);
// {
//   publicKey: true,
//   serviceId: true,
//   templates: { day0: true, day1: true, ... },
//   isValid: true,
//   configuredDays: [0, 1, 3, 5, 7, 30]
// }
```

---

## 🔧 Configuration (.env.local)

```bash
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=uH10FXkw8yv434h5P
VITE_EMAILJS_SERVICE_ID=service_13h3kki

# Email Templates
VITE_EMAILJS_TEMPLATE_DAY0=template_1tcang2
VITE_EMAILJS_TEMPLATE_DAY1=template_d75273a
VITE_EMAILJS_TEMPLATE_DAY3=template_xtdi2sx
VITE_EMAILJS_TEMPLATE_DAY5=template_ombo3rr
VITE_EMAILJS_TEMPLATE_DAY7=template_s8kfh7x
VITE_EMAILJS_TEMPLATE_DAY30=template_y1ovm08
```

---

## 📊 Email Flow

### **Client Onboarding (Day 0)**

```
Artist adds client → 
Upload photo → 
Create Firestore doc → 
Send Day 0 email with setup link →
Client receives email →
Client clicks setup link →
Client creates password →
Redirect to dashboard
```

### **Aftercare Emails (Day 1-30)**

```
Cloud Function monitors healingDay field →
When healingDay changes to 1, 3, 5, 7, or 30 →
Trigger sendAftercareEmail() →
Client receives email →
Email includes link to dashboard
```

---

## 🚀 Future Automation (Cloud Functions)

### **Auto-send emails based on healing day**

```javascript
// Firebase Cloud Function
exports.sendDailyEmails = functions.pubsub
  .schedule('every day 09:00')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Query clients by tattoo date
    const clientsSnapshot = await db.collection('users')
      .where('role', '==', 'client')
      .where('tattooDate', '==', getDateDaysAgo(7)) // Day 7 today
      .get();
    
    for (const doc of clientsSnapshot.docs) {
      const client = doc.data();
      const artist = await getArtist(client.artistId);
      
      await sendHealingEmail(client, artist, 7);
    }
  });
```

---

## ✅ Error Handling

All email functions throw errors if:
- Template not configured
- EmailJS service unavailable
- Invalid parameters

**Example:**

```javascript
try {
  await sendDay0Email({ ... });
  console.log('✅ Email sent');
} catch (error) {
  console.error('❌ Email failed:', error);
  // Show user-friendly error
  showToast('Failed to send email', 'error');
}
```

---

## 🧪 Testing

### **Test Day 0 email**

```javascript
// Dashboard.jsx - When adding client
console.log('📧 Sending Day 0 email...');
await sendDay0Email({ ... });
console.log('✅ Email sent!');
```

### **Test aftercare emails**

```javascript
// Create test script
import { sendAftercareEmail } from './services/emailService';

await sendAftercareEmail({
  clientEmail: 'your-test-email@example.com',
  clientName: 'Test Client',
  dayNumber: 7
});
```

---

## 📝 Migration Notes

### **Before (Dashboard.jsx):**
```javascript
// Old way - inline emailjs.send()
await emailjs.send(
  import.meta.env.VITE_EMAILJS_SERVICE_ID,
  import.meta.env.VITE_EMAILJS_TEMPLATE_DAY0,
  { ... }
);
```

### **After (Using service):**
```javascript
// New way - centralized service
import { sendDay0Email } from '../services/emailService';

await sendDay0Email({
  clientEmail: email,
  clientName: name,
  studioName: studio,
  setupLink: link,
  tattooPhoto: photo
});
```

---

## ✅ Benefits

1. **Centralized** - One place for all email logic
2. **Type-safe** - Clear function signatures
3. **Error handling** - Consistent error management
4. **Testable** - Easy to test in isolation
5. **Scalable** - Easy to add new email days
6. **Documented** - Clear API with JSDoc comments

---

## 🔒 Security

- **API Key** - Public key safe to expose (read-only)
- **Templates** - Only EmailJS can access template content
- **Rate Limits** - EmailJS enforces sending limits
- **Validation** - Service validates configuration on init

---

## 📚 Next Steps

1. ✅ Integrate with Dashboard (DONE)
2. ⏳ Create Cloud Functions for auto-sending
3. ⏳ Add email tracking/analytics
4. ⏳ Implement retry logic for failed emails
5. ⏳ Add email preview in admin panel
