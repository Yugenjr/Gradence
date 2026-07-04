import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { setItem, getItem, removeItem } from './storage';

const SECURE_KEY = 'gradence_groq_api_key';

/**
 * Save API key securely. Falls back to standard Preferences if native secure storage fails (e.g. on Web)
 */
export async function saveApiKey(key: string): Promise<void> {
  try {
    await SecureStorage.set(SECURE_KEY, key);
  } catch (e) {
    console.warn('Secure storage failed, falling back to Preferences:', e);
    await setItem(SECURE_KEY, key);
  }
}

/**
 * Retrieve API key securely. Falls back to standard Preferences if native secure storage fails.
 */
export async function getApiKey(): Promise<string | null> {
  try {
    const value = await SecureStorage.get(SECURE_KEY);
    return typeof value === 'string' ? value : null;
  } catch (e) {
    console.warn('Secure storage fetch failed, falling back to Preferences:', e);
    return await getItem(SECURE_KEY);
  }
}

/**
 * Remove API key securely.
 */
export async function removeApiKey(): Promise<void> {
  try {
    await SecureStorage.remove(SECURE_KEY);
  } catch (e) {
    console.warn('Secure storage removal failed, falling back to Preferences:', e);
    await removeItem(SECURE_KEY);
  }
}
