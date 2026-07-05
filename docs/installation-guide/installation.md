# Installation & Setup Guide

This guide explains how to install, update, and configure **Gradence Companion** on your device using the packages provided in our **GitHub Releases**.

---

## 1. System Requirements
* **Platform**: Android 8.0 (Oreo) / API Level 26 or higher.
* **Storage**: Approx. 15-20MB free space.
* **Permissions**: Requires Internet (for optional Groq AI advice and competitive coding profile syncs) and Filesystem access (for creating/reading manual offline backups).

---

## 2. Installing the Android App (.apk)

Since Gradence is distributed as a standalone `.apk` bundle on GitHub Releases, follow these steps to install it on your Android phone:

### Step 1: Download the APK
1. Open your browser and navigate to the **[Gradence GitHub Releases Page](https://github.com/Yugenjr/Gradence/releases)**.
2. Under the latest release assets, tap on `app-release.apk` (or the equivalent version name) to download it to your device.

### Step 2: Enable "Unknown Sources"
For security, Android restricts installing applications outside of the Google Play Store. You must allow your browser or file manager to install package archives:
1. When the download finishes, tap the notification or open your **Files/Downloads** manager.
2. Click on the downloaded `.apk` file.
3. If prompted with *"For your security, your phone is not allowed to install unknown apps from this source"*, tap **Settings**.
4. Toggle on **"Allow from this source"** (or **"Install Unknown Apps"**).

### Step 3: Complete Installation
1. Navigate back to the installer.
2. Tap **Install** and wait for the package manager to extract assets.
3. Tap **Open** to launch the Gradence workspace!

---

## 3. How to Update the Application
Because auto-backup is disabled for privacy and data consistency (`allowBackup="false"` in the Manifest), follow these steps to update safely without losing records:

1. **Export a Backup**: Open Gradence &rarr; **Settings** &rarr; tap **"Copy to Clipboard"** or **"Download JSON"** to save your current grades and schedules.
2. **Download & Overwrite**: Download the updated `.apk` from the latest GitHub Release and run the installation. It will overwrite the existing version.
3. **Restore (If Clean Reinstall)**: If you had to uninstall the older version first, simply run onboarding, go to **Settings** &rarr; **Import Backup**, and paste/upload your backup JSON file to restore all academic records.
