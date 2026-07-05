# AI Career Advisor & System Backups

Gradence integrates modern AI assistance with offline-first data backup controls.

---

## 1. Groq Cloud AI Integration
* **Configuring Keys**: Set up your Llama API credentials under **Settings**.
* **Key Encryption**: Your key is kept secure inside native Keystore (Android) or Keychain (iOS) hardware vaults and is never written to standard settings preferences.
* **Network Warning**: If you attempt to access AI Advice offline, the space will display a warning requesting a network connection.

---

## 2. Career Roadmaps Manager
* **Roadmap Drafting**: Describe your career goals (e.g. "DevOps Engineer") in the AI Space to generate a custom, stage-by-stage learning roadmap.
* **Following Roadmaps**: Tap **"Follow this Roadmap"** to copy the generated stages into your **Roadmaps Manager** tool.
* **Tracking Progress**: You can follow up to 4 active roadmaps simultaneously. Mark stages as complete to track your overall progress.
* **Completed Roadmaps**: Once all stages are finished, mark it as completed to show a checkmark and free up slot spaces.

---

## 3. Data Backups & Reset
* **Manual Export**: Under Settings, tap **"Download JSON"** to save your backup directly to your device's **Documents** folder using Capacitor Filesystem. Tapping it also opens the native sharing sheet.
* **Copy Backup**: Use **"Copy to Clipboard"** to copy the backup string directly.
* **Offline Import**: To import, tap **"Import Backup"**. You can choose to paste the JSON string or click **"Upload JSON File"** to pick a `.json` backup file from device folders. Tap **"Verify and Restore"** to restore.
* **Database Reset**: Tap **"Erase All Database Records"** under settings, select **"Delete Anyway"** on the warning dialog, and the app resets completely.
