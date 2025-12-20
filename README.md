# Healink

**Science-backed tattoo aftercare automation for tattoo studios**

Healink automates the 30-day tattoo healing journey with personalized emails, push notifications, and photo tracking—helping artists provide better aftercare while reducing support workload.

---

## ✨ Features

- **Automated Communication** - 6 emails + 11 push notifications over 30 days
- **Photo Tracking** - Clients upload progress photos on critical healing days (Day 3, 7, 14, 30)
- **PWA** - Installable mobile app with offline support
- **Artist Dashboard** - Manage clients and view healing progress
- **Client Dashboard** - Track healing journey with daily guidance

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Lucide Icons
- Firebase (Auth, Firestore, Cloud Messaging)

**Backend:**
- Firebase Cloud Functions
- EmailJS (email delivery)
- Cloudinary (photo storage)

**Infrastructure:**
- Firebase Hosting
- Firestore (NoSQL database)
- Firebase Cloud Messaging (push notifications)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project (Blaze plan for Cloud Functions)

### Local Development

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd healink-mvp
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Fill in your Firebase, EmailJS, and Cloudinary credentials
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

4. **Set up Cloud Functions:**
   ```bash
   cd functions
   npm install
   cd ..
   ```

---

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick deploy:**

```bash
# 1. Configure Firebase Functions
cd functions
./config-quick.sh
cd ..

# 2. Build and deploy
npm run build
firebase deploy
```

### Deploying Firestore Rules

Firestore security rules are defined in `firestore.rules`. To deploy rules:

```bash
# Deploy only rules (safe, doesn't affect code or functions)
firebase deploy --only firestore:rules

# Verify deployment
firebase use  # Check active project
```

**Important:**
- Always test rules in staging/emulator first
- Keep backup: `cp firestore.rules firestore.rules.backup`
- See [FIRESTORE_RULES_CHANGELOG.md](./FIRESTORE_RULES_CHANGELOG.md) for rule changes

---

## 📊 Project Structure

```
healink-mvp/
├── src/
│   ├── pages/           # Route components
│   ├── components/      # Reusable UI components
│   ├── services/        # API integrations (email, push, cloudinary)
│   ├── config/          # Firebase configuration
│   └── utils/           # Helper functions
├── functions/           # Cloud Functions (automated scheduling)
├── public/              # Static assets (PWA manifest, icons, SW)
├── docs/                # Documentation
├── firestore.rules      # Firestore security rules
└── firebase.json        # Firebase configuration
```

---

## 🔐 Environment Variables

Required variables (see `.env.example`):

- **Firebase** (6 vars) - Project configuration
- **Firebase Cloud Messaging** (1 var) - VAPID key for push
- **EmailJS** (8 vars) - Email service + 6 templates
- **Cloudinary** (4 vars) - Photo storage

---

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - How to deploy to production
- [Database Schema](./FIRESTORE_SCHEMA.md) - Firestore structure
- [Development Docs](./docs/development/) - Architecture, setup guides
- [Audit Reports](./docs/development/audit-reports/) - Code quality reports

---

## 🧪 Testing

**Test with first artist:**

1. Deploy to Firebase Hosting
2. Login as artist
3. Add test client with your email
4. Verify Day 0 email received
5. Complete client setup
6. Grant push permission
7. Wait for Day 1 (9 AM Dublin time)
8. Verify automated email + push sent

---

## 🔄 Communication Timeline

**21 touchpoints over 30 days:**

- **6 emails** - Day 0, 1, 3, 5, 7, 30 (critical guidance)
- **11 pushes** - Day 1-7, 10, 14, 21, 30 (healing reminders)
- **4 photo reminders** - Day 3, 7, 14, 30 (progress tracking)

All automated via Cloud Functions cron job (runs daily at 9 AM Dublin time).

---

## 📈 Healing Journey

```
Day 0-7:   Critical Phase (plasma, inflammation, itching)
Day 7-14:  Active Healing (peeling, scabbing)
Day 14-21: Stabilizing (new skin forming)
Day 21-30: Maintenance (surface healed, deep healing continues)
```

---

## 🤝 Contributing

This is a production MVP. For bugs or feature requests, contact the development team.

---

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for tattoo artists and their clients**
