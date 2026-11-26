# Plantation Mapper

ADYPU Mobile Application course project · Problem #179

A field worker can capture a sapling's planting location in a hydro project's catchment, save the record on the phone and revisit its original coordinates. Search saved records by species or catchment, attach a photo during planting or from a saved record, and open the record from its map marker.

## Run on an Android phone

Install Node.js LTS and an Android version of Expo Go compatible with Expo SDK 58. Connect the phone and computer to the same Wi-Fi network. From the repository root, run:

```sh
npm ci
npx expo start
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

## Photos and the plantation map

Camera permission is requested when taking a photo. You can cancel, retake or skip it. Saving copies the picture into the app's documents directory and stores its URI alongside the record in AsyncStorage. **Add photo** or **Replace photo** in details keeps the original record ID, timestamp and coordinates. Photos remain local to this installation.

Choose **View map** to see all valid saved locations, including records outside the current search. Tap a marker and choose **Open details**. Plantations at the same coordinates share a marker with a choice of records. Map tiles may need internet. The list, search, details and photos work from local storage.

## Standalone Android map setup for Day 3

Expo Go includes its own Google Maps configuration. For a sideloaded APK, configure the credential for the actual signing keystore before building.

1. In Google Cloud Console, select a billing-enabled project, enable **Maps SDK for Android**, and create an API key under **APIs & Services → Credentials**.
2. Set the key's application restriction to **Android apps**. Add package `com.jainilpatel.plantationmapper` and the **SHA-1** of the keystore that signs the APK. For an EAS-managed keystore, use `eas credentials -p android`, select the build profile, and read the signing certificate fingerprint. For a local keystore, run `keytool -list -v -keystore /path/to/signing.keystore -alias YOUR_ALIAS`. Set the API restriction to **Maps SDK for Android**.
3. Set `GOOGLE_MAPS_ANDROID_API_KEY` in the build environment. For EAS, create the variable in the Expo project's **Environment variables** settings and select that same environment in the APK profile's `environment` field. For a local build, export the variable in your shell. The Expo config passes it to the native maps plugin. Keep the value and the keystore out of Git.
4. Build with that environment and certificate, install the APK, and confirm tiles and markers load. A change to the embedded key requires a new binary. [Expo Android Google Maps setup](https://docs.expo.dev/versions/latest/sdk/map-view/#android)

## Day 2 phone check

1. From a Day 1 record, note its ID, coordinates and timestamp. Tap **Add photo**, deny camera permission, retry and take a photo. Cancel one replacement and verify the original still displays. Complete a replacement and check the record fields and list position.
2. At a different location, create a second plantation, capture GPS, enter details and cancel the camera once. Confirm the form survives. Capture, preview, retake and save a distinct photo.
3. Force-stop and reopen the same project. Open both records and match their photos. Disable location permission, open **View map**, tap each marker and open its details. Return to Home and search for each catchment.
4. With the project loaded, disconnect internet and check Home search, details and photos again. On a fresh installation, verify the map offers **Add plantation** when empty.
