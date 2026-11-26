# Plantation Mapper

ADYPU Mobile Application course project · Problem #179

A field worker can capture a sapling's planting location in a hydro project's catchment, save the record on the phone and revisit its original coordinates. Day 1 includes the record list, capture form and read-only detail screen.

## Run on an Android phone

Install Node.js LTS and an Android version of Expo Go compatible with Expo SDK 58. Connect the phone and computer to the same Wi-Fi network. From the repository root, run:

```sh
npm ci
npm start -- --go --lan
```

Open Expo Go and scan the QR code printed by Expo. Leave the terminal running while using the development app.

GPS capture requests foreground location access when you tap **Capture current location**. Records live in AsyncStorage on this device. Clearing the app's data or uninstalling it can remove them. The app uses no server for capture, save or lookup. Expo Go needs access to the local development server to load the JavaScript on a cold start. For a restart test without internet, keep both devices on the same local Wi-Fi and disconnect that network's internet uplink. Start Metro with `npm start -- --go --offline` if the computer is already offline.

## Physical-device check

1. On a fresh installation, confirm **0 saved records**. Tap **Add plantation**, enter the catchment and species, and check that the count starts at 1. Try 0 or a decimal, then restore 1. Saving should stay disabled until you capture a location.
2. Outdoors, tap **Capture current location**. Deny permission once, retry and grant precise location while using the app. Also try with Android Location turned off, then switch it back on and retry. Check that your entries survive and a successful fix shows latitude, longitude and accuracy when available.
3. With the app loaded, disconnect mobile data and Wi-Fi, leaving Location on. Capture again, note the coordinates and tap **Save plantation** twice quickly. Confirm one record appears. Open it and compare both coordinates. Add a second record and check that it appears first.
4. Walk elsewhere. Restore the local Wi-Fi connection for Expo Go, force-stop Expo Go without clearing its data, and reopen the same project. Confirm both records remain and the first record still shows its original coordinates, timestamp and notes.

## Project checks

```sh
npm test
npx expo install --check
npx expo export --platform android
```

The Node tests exercise input validation, coordinate snapshots, serialization and storage failure handling with a storage substitute. The Android export compiles the JavaScript bundle. Use the physical-device check for native GPS, permissions and persistence across a real restart.
