import { Preferences } from '@capacitor/preferences';

/**
 * Save item asynchronously in Capacitor Preferences
 */
export async function setItem(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
}

/**
 * Retrieve item asynchronously from Capacitor Preferences
 */
export async function getItem(key: string): Promise<string | null> {
  const { value } = await Preferences.get({ key });
  return value;
}

/**
 * Remove item asynchronously from Capacitor Preferences
 */
export async function removeItem(key: string): Promise<void> {
  await Preferences.remove({ key });
}

/**
 * Clear all preferences asynchronously
 */
export async function clearAll(): Promise<void> {
  await Preferences.clear();
}

/**
 * Performs a one-time migration of all Gradence data from LocalStorage to Capacitor Preferences
 */
export async function migrateLocalStorageToPreferences(): Promise<void> {
  try {
    const isMigrated = await getItem('gradence_storage_migrated');
    if (isMigrated === 'true') {
      return; // Already migrated
    }

    const migrationKeys = [
      'gradence_profile',
      'gradence_semesters',
      'gradence_attendance_subjects',
      'gradence_followed_roadmaps',
      'gradence_timetable',
      'gradence_countdowns',
      'gradence_habits',
      'gradence_exams',
      'gradence_activities'
    ];

    for (const key of migrationKeys) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        await setItem(key, value);
        localStorage.removeItem(key);
      }
    }

    // Set migration flag
    await setItem('gradence_storage_migrated', 'true');
    localStorage.setItem('gradence_storage_migrated', 'true');
    console.log('Gradence local storage successfully migrated to Capacitor Preferences.');
  } catch (e) {
    console.error('Failed to migrate storage layer', e);
  }
}
