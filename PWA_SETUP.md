# PWA Setup - Healink MVP

## 🎯 Overview

Healink is now a **Progressive Web App (PWA)** that can be installed on mobile and desktop devices, work offline, and support push notifications in the future.

---

## ✅ What Was Implemented

### 1. **PWA Manifest** (`public/manifest.json`)
- App name: "Healink - Tattoo Aftercare"
- Theme color: `#0F172A` (dark slate)
- Display mode: `standalone` (looks like native app)
- Icons: 192x192 and 512x512
- Orientation: `portrait-primary` (mobile-first)
- Shortcuts: Quick access to Dashboard

### 2. **Service Worker** (`public/sw.js`)
- **Cache Strategy:**
  - **Static Assets** (JS/CSS/Fonts): Cache-first
  - **Images**: Cache-first with placeholder fallback
  - **HTML Pages**: Network-first with cache fallback
  - **API Calls**: Always network (Firebase, Cloudinary, EmailJS)
- **Offline Mode:** Beautiful offline fallback page
- **Cache Management:** Auto-cleanup of old versions
- **Update Check:** Every 60 seconds for new versions

### 3. **HTML Meta Tags** (`index.html`)
- PWA manifest link
- Theme color meta tag
- iOS-specific tags:
  - `apple-mobile-web-app-capable`
  - `apple-mobile-web-app-status-bar-style`
  - `apple-touch-icon`
- App description for SEO

### 4. **Service Worker Registration** (`src/main.jsx`)
- Registers SW only in **production** (not dev mode)
- Logs success/failure to console
- Auto-updates every minute
- Non-blocking (loads after app mounts)

### 5. **App Icons** (`public/icons/`)
- `icon-192.png` - For home screen
- `icon-512.png` - For splash screen
- `icon.svg` - SVG source (for future regeneration)
- `generator.html` - Tool to create proper icons

---

## 📱 Installation Instructions

### **Mobile (Android)**
1. Open Healink in Chrome
2. Tap **Menu (⋮)** → **"Add to Home Screen"**
3. Confirm installation
4. App appears on home screen
5. Opens in standalone mode (no browser UI)

### **Mobile (iOS/Safari)**
1. Open Healink in Safari
2. Tap **Share button** (□↑)
3. Scroll and tap **"Add to Home Screen"**
4. Edit name if desired
5. Tap **"Add"**
6. App appears on home screen

### **Desktop (Chrome/Edge)**
1. Open Healink
2. Look for **Install icon** in address bar (⊕)
3. Click **"Install"**
4. Confirm installation
5. App opens in separate window

---

## 🧪 Testing Checklist

### **Development Testing**
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Test at: http://localhost:4173
```

### **PWA Validation**
Open Chrome DevTools:
1. **Application** tab
2. **Manifest** - Check all fields display correctly
3. **Service Workers** - Verify registration
4. **Cache Storage** - Check cached resources
5. **Lighthouse** - Run PWA audit (should score 100%)

### **Offline Testing**
1. Open app online first (loads SW)
2. Open DevTools → **Network** tab
3. Enable **"Offline"** throttling
4. Refresh page
5. Should show offline fallback page

### **Installation Testing**
- ✅ Install prompt appears
- ✅ Icons display correctly
- ✅ Opens in standalone mode
- ✅ Matches system theme
- ✅ Portrait orientation on mobile

---

## 🔧 Configuration

### **Manifest Settings** (`public/manifest.json`)
```json
{
  "name": "Healink - Tattoo Aftercare",
  "short_name": "Healink",
  "theme_color": "#0F172A",    // App bar color
  "background_color": "#FFFFFF", // Splash screen
  "display": "standalone",       // No browser UI
  "orientation": "portrait-primary"
}
```

### **Service Worker Caching**
```javascript
// Cache versions (update when deploying)
const CACHE_VERSION = 'healink-v1'; // Change to v2, v3, etc.

// What gets cached
STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];
```

### **Update Cache Version**
When deploying changes:
1. Edit `public/sw.js`
2. Change `CACHE_VERSION = 'healink-v2'`
3. Rebuild and deploy
4. Users get new version automatically

---

## 🎨 Icon Customization

### **Option 1: Use Generator (Easiest)**
1. Open `public/icons/generator.html` in browser
2. Right-click each canvas
3. "Save Image As..." → `icon-192.png` and `icon-512.png`
4. Save to `public/icons/`

### **Option 2: Design Tool (Figma/Canva)**
1. Create 512x512 artboard
2. Background: `#0F172A`
3. Text: White "H" (Arial Bold, 320px, centered)
4. Export at 512x512 → `icon-512.png`
5. Resize to 192x192 → `icon-192.png`

### **Option 3: Online Converter**
1. Edit `public/icons/icon.svg` (modify colors/text)
2. Upload to https://cloudconvert.com/svg-to-png
3. Convert to 192x192 and 512x512
4. Download and replace files

### **Current Icons**
⚠️ **Note:** Current icons are temporary placeholders (vite.svg copies).
Replace with proper Healink branded icons before production launch.

---

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
```

### **Deploy to Firebase Hosting**
```bash
firebase deploy --only hosting
```

### **Verify PWA After Deploy**
1. Visit production URL
2. Check install prompt appears
3. Install and test offline mode
4. Run Lighthouse audit

---

## 📊 Lighthouse PWA Criteria

To score 100% on PWA audit:
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a valid manifest.json
- ✅ Uses HTTPS (required for production)
- ✅ Has viewport meta tag
- ✅ Has theme color
- ✅ Has icons (192x192 and 512x512)
- ✅ Content is sized correctly for viewport

---

## 🔮 Future Enhancements

### **Push Notifications (Firebase Cloud Messaging)**
```javascript
// In sw.js - Add FCM support
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-messaging-compat.js');

self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
  });
});
```

### **Background Sync**
```javascript
// Retry failed requests when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});
```

### **Install Prompt Component**
```jsx
// Show custom install button to users
import { useState, useEffect } from 'react';

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);
  
  const handleInstall = () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === 'accepted') {
        console.log('User installed app');
      }
      setDeferredPrompt(null);
    });
  };
  
  if (!deferredPrompt) return null;
  
  return (
    <button onClick={handleInstall}>
      Install Healink App
    </button>
  );
}
```

---

## 🐛 Troubleshooting

### **Service Worker Not Registering**
- Check console for errors
- Verify `sw.js` is in `public/` folder
- Only works in production (`npm run build && npm run preview`)
- Must use HTTPS in production (localhost is OK)

### **Manifest Errors**
- Validate JSON syntax: https://jsonlint.com/
- Check all icon paths exist
- Icons must be PNG (not SVG)
- `start_url` must be valid route

### **Icons Not Showing**
- Clear browser cache
- Check icon files exist in `public/icons/`
- Verify correct file names: `icon-192.png`, `icon-512.png`
- Icons must be PNG format
- Minimum sizes: 192x192 and 512x512

### **Not Installable**
Run Lighthouse audit to see specific issues:
```
Chrome DevTools → Lighthouse → Progressive Web App
```

Common issues:
- Missing manifest
- No service worker
- Icons too small
- Not served over HTTPS (production)

### **Offline Mode Not Working**
1. Open DevTools → Application → Service Workers
2. Check SW status: "Activated and running"
3. Try "Update" and "Unregister" buttons
4. Reload page to re-register
5. Check Cache Storage has files

### **Clear All Caches**
```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});

caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

---

## 📚 Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox (Advanced SW)](https://developers.google.com/web/tools/workbox)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/js/client)

---

## ✅ Production Checklist

Before launching:

- [ ] Replace placeholder icons with branded Healink icons
- [ ] Test installation on real iOS device
- [ ] Test installation on real Android device
- [ ] Test offline mode thoroughly
- [ ] Run Lighthouse PWA audit (target 100%)
- [ ] Verify HTTPS in production
- [ ] Test on slow 3G connection
- [ ] Check all cached assets load correctly
- [ ] Verify manifest displays correct name/colors
- [ ] Test app shortcuts work (if added)

---

## 🎉 Success Criteria

✅ **App is installable** - Shows install prompt on mobile/desktop  
✅ **Works offline** - Displays fallback page when no network  
✅ **Service Worker active** - Registers without errors in production  
✅ **Icons display correctly** - Shows proper icons in install prompt and home screen  
✅ **Looks native** - Opens in standalone mode without browser UI  
✅ **Fast loading** - Cached assets load instantly  

---

## 📝 Notes

- Service Worker **ONLY** runs in production build (`npm run build`)
- In development (`npm run dev`), SW is disabled to avoid caching issues
- Cache version must be updated manually on each deploy
- Firebase/Cloudinary/EmailJS calls are never cached (always live)
- Offline fallback is intentionally simple and beautiful

---

**Last Updated:** December 19, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready for Production Testing
