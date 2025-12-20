# Healink Firebase Functions

Automated aftercare scheduling system for tattoo healing journey.

## 📦 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Firebase
```bash
# Quick setup with pre-filled values
./config-quick.sh

# OR manual setup
./setup.sh
```

### 3. Deploy
```bash
# From project root
cd ..
firebase deploy --only functions
```

## 🧪 Testing

### Local Emulator
```bash
# From project root
firebase emulators:start --only functions,firestore

# In another terminal
firebase functions:shell
> dailyAftercare()
```

### Check Logs
```bash
firebase functions:log --only dailyAftercare
```

## 📚 Documentation

See `../SCHEDULING.md` for complete documentation.

## 📁 Files

- `index.js` - Entry point
- `dailyAftercare.js` - Main scheduler logic
- `config-quick.sh` - Quick configuration script
- `setup.sh` - Interactive setup script
- `package.json` - Dependencies

## 🔧 Maintenance

### Update Config
```bash
firebase functions:config:set emailjs.template_day7="new_template_id"
firebase deploy --only functions
```

### View Config
```bash
firebase functions:config:get
```

## 📊 Schedule

Runs daily at **9:00 AM Dublin time** (Europe/Dublin timezone)

## 🚀 Features

- ✅ Automated email sending (6 touchpoints)
- ✅ Automated push notifications (10 touchpoints)
- ✅ Duplicate prevention via Firestore tracking
- ✅ Invalid token cleanup
- ✅ Comprehensive logging
