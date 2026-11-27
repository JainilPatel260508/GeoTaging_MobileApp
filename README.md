# Plantation Mapper

ADYPU Mobile Application · Problem #179 · Geo tagging of plantation in the catchment area of a hydro project

A field worker records the catchment, species, sapling count, optional notes, GPS fix and optional photo at planting time. Later, they can search by species or catchment, or tap a map marker to revisit the original record. Plantations at identical coordinates share a marker with a choice of records.

## Install the course APK

Download the APK on Android, open it and follow the system installer. If Android requests permission to install from the browser or file manager, allow that source for the installation. Launch **Plantation Mapper** from the app drawer. The submission profile embeds the JavaScript bundle so Metro can be stopped. Expo Go and the standalone app have separate private storage. Capture the viva record in the installed APK.

- [Download Plantation Mapper 1.0.0](https://expo.dev/artifacts/eas/zsBCTeLkpqq1s_eqQjbRuaEXJvZRZ6eayf8LtrgTLRc.apk)
- [Expo build details](https://expo.dev/accounts/jainilpatel260508/projects/plantation-mapper/builds/c37a0ebe-7800-4d3a-9f60-4aceb5c5cf47)
- [Release source b400cab](https://github.com/JainilPatel260508/GeoTaging_MobileApp/commit/b400cab8904491857982cd609c3e29c269c9760c)

### Submission artifact verification

The downloaded APK is 72,491,013 bytes. Android build tools verified APK Signature Scheme v2, package `com.jainilpatel.plantationmapper`, version 1.0.0 (code 1) and launch activity `MainActivity`. Its archive contains `assets/index.android.bundle`.

| Fingerprint | Value |
|---|---|
| APK SHA-256 | `ac0c6dbca887755dc206ffdc2fb16a5e46034ac76d39d2e23c895b48d41a021a` |
| Signing certificate SHA-1 | `61:84:3A:D0:B3:CE:EF:6F:A0:FD:48:77:47:CE:97:EF:A3:64:76:70` |

All nine logic tests, Expo dependency checks, Expo Doctor (20/20), and the Android bundle export passed. ADB listed no device or running emulator. The phone acceptance test below remains pending.

## Run and rebuild

From the repository root, install dependencies with Node.js LTS. For development, connect the phone and computer to the same Wi-Fi and scan the QR code in Expo Go for SDK 58.

```sh
npm ci
npx expo start
```

To check the project and create a standalone APK, sign in to an Expo account with build access to the linked project. The submission profile uses Android package `com.jainilpatel.plantationmapper` and the project's remote signing keystore. Reuse that keystore for updates.

```sh
npm test
npx expo install --check
npx expo-doctor@latest
npx expo export --platform android
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile submission --wait
```

## Permissions, photos and offline use

- **Foreground location** is requested on **Capture current location**. For a field record, grant precise location, turn on Android Location and capture outdoors. A failed or denied fix can be retried with the same form entries.
- **Camera** is requested when you take, add or replace a photo. You can cancel, retake or skip. Saving copies the accepted image into the app's documents directory. Replacing a photo updates its URI before removing the previous image.
- **Persistence.** AsyncStorage holds record IDs, timestamps, field values, original coordinates and photo URIs. Clearing app data or uninstalling can remove this installation's records. The list, search, details and local photos remain usable offline.
- **Map.** This APK uses bundled Leaflet controls and saved coordinates with online OpenStreetMap base tiles. Maps can open with current-location permission disabled. Tile requests disclose the viewed area to the provider. The marker opens a record by ID, including when other records have the same species. [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/)
- **Optional Google Maps build.** Expo Go uses its included Google Maps integration. To select native Google Maps in a future APK, enable Maps SDK for Android in a billing-enabled Google Cloud project. Restrict the key to that API, the package above and the signing certificate's SHA-1. Set `GOOGLE_MAPS_ANDROID_API_KEY` in the linked EAS project's production environment and rebuild. The OpenStreetMap release needs no Google key. [Expo Android map setup](https://docs.expo.dev/versions/latest/sdk/map-view/#android)

## 60-second viva

**Before the viva:** Install the submission APK. Outdoors, create a record with a recognizable catchment name, capture its GPS accuracy and take a clear photo. Save it, force-stop the app, and reopen it to check the photo and coordinates. Have internet available indoors for base tiles.

| Time | Screen action | What to say |
|---|---|---|
| 0–10 s | Open Home from the Android launcher. | “Plantation Mapper helps a field worker record and revisit planting sites in a hydro project's catchment. I recorded this sapling outdoors before the demo.” |
| 10–22 s | Type part of the catchment name and tap the result. | “This search checks both species and catchment on the phone. Here are the sapling count, planting time and field notes.” |
| 22–36 s | Show the coordinates, accuracy, photo and record ID. | “These coordinates belong to the planting site. Moving indoors hasn't changed them. The photo is stored with this record and survived closing the app.” |
| 36–52 s | Return to Home, tap **View map**, tap the marker and choose **Open details**. | “The pin uses the saved coordinates. It opens the same record ID, so two plantations with the same species still have distinct records.” |
| 52–60 s | Show the matching photo again. | “The record and photo are available offline. Internet supplies the base map when I revisit the site.” |

## Acceptance test on the submission APK

1. With Metro stopped, capture and save a record outdoors. Note its ID, coordinates and photo. Force-stop the APK from Android settings and relaunch. Reopen the same record and compare.
2. Search by part of the catchment name. With internet available, open **View map**. Check that roads or terrain are visible, tap the marker and compare the record ID and image.
3. Turn off Wi-Fi and mobile data, relaunch and repeat the search. Verify the saved details and photo open. Restore connectivity afterward.
4. In a new form, enter fields, deny location permission or cancel the camera and verify the entries survive. If a photo-less record is available, attach a photo and check its original coordinates, ID, timestamp and list position.
