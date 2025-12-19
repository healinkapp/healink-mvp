# 🧪 Quick PWA Testing Guide

## Test Right Now (Development)

⚠️ **Important:** Service Worker only works in **production build**, not `npm run dev`

### Step 1: Build for Production
```bash
npm run build
npm run preview
```

### Step 2: Open in Browser
```
http://localhost:4173
```

### Step 3: Check PWA Features

#### ✅ Manifest
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Manifest** (left sidebar)
4. Verify:
   - Name: "Healink - Tattoo Aftercare"
   - Theme color: `#0F172A`
   - Icons: 192x192 and 512x512
   - Display: `standalone`

#### ✅ Service Worker
1. In **Application** tab
2. Click **Service Workers**
3. Verify:
   - Status: "Activated and running"
   - Scope: "/"
   - Source: `sw.js`

#### ✅ Cache Storage
1. In **Application** tab
2. Click **Cache Storage** → `healink-v1-static`
3. Should contain:
   - `/`
   - `/index.html`
   - `/manifest.json`
   - `/icons/icon-192.png`
   - `/icons/icon-512.png`

#### ✅ Install Prompt
1. Look for **Install icon** (⊕) in address bar
2. Click it
3. Confirm installation
4. App should open in separate window

#### ✅ Offline Mode
1. With app open and SW active
2. Open DevTools → **Network** tab
3. Select **Offline** from throttling dropdown
4. Refresh page (Cmd+R)
5. Should show beautiful offline fallback page:
   - Dark background (`#0F172A`)
   - "You're Offline" message
   - Connection help text

### Step 4: Console Output

You should see in console:
```
[Service Worker] Script loaded
[Service Worker] Installing...
[Service Worker] Caching static assets
[Service Worker] Installation complete
[Service Worker] Activating...
[Service Worker] Activation complete
✅ Service Worker registered successfully: /
```

---

## Test on Real Mobile Device

### Android (Chrome)
1. Build and deploy to Firebase/Vercel
2. Open URL on phone
3. Tap **Menu (⋮)** → **Add to Home Screen**
4. Confirm
5. Check home screen for icon
6. Open app (should be fullscreen, no browser UI)

### iOS (Safari)
1. Deploy to production (HTTPS required)
2. Open URL on iPhone
3. Tap **Share** button
4. Scroll to **Add to Home Screen**
5. Tap **Add**
6. Check home screen for icon
7. Open app (should be fullscreen)

---

## Common Issues

### "Service Worker registration failed"
- Are you in production build? (`npm run build && npm run preview`)
- Check console for specific error
- Verify `sw.js` exists in `public/` folder

### "Cannot find /sw.js"
- Make sure you built the project: `npm run build`
- Check `dist/sw.js` exists
- In dev mode, SW is disabled (this is intentional)

### Install prompt doesn't appear
- Manifest must be valid (check Application → Manifest)
- Icons must exist and be correct size
- Already installed? Check `chrome://apps`
- On mobile? Scroll down, prompt appears after few seconds

### Icons are wrong
- Current icons are placeholders (vite.svg)
- Open `public/icons/generator.html` in browser
- Right-click canvases and save as PNG
- Replace `icon-192.png` and `icon-512.png`

---

## Lighthouse Audit

### Run PWA Score
1. Open DevTools
2. Go to **Lighthouse** tab
3. Select **Progressive Web App** only
4. Click **Analyze page load**
5. Target score: **100/100**

### Expected Results
- ✅ Installable
- ✅ Works offline
- ✅ Has icons
- ✅ Has manifest
- ✅ Uses HTTPS (in production)
- ✅ Viewport is mobile-friendly

---

## Next Steps After Testing

1. ✅ Verify PWA works locally
2. 🎨 Create proper branded icons (replace placeholders)
3. 🚀 Deploy to production (Firebase/Vercel)
4. 📱 Test installation on real devices
5. 🔔 Implement push notifications (future task)

---

## Need Help?

See full documentation: `PWA_SETUP.md`

**Quick Commands:**
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Firebase
firebase deploy --only hosting
```
