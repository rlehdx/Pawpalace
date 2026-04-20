/**
 * Customer account preferences stored per-browser (guests).
 * Logged-in profile fields that sync server-side are updated only via the
 * signed-in user's own Supabase session — never another customer's data.
 */
export type PreferredPet = "dog" | "cat" | "bird" | "fish" | "small-pet" | "multiple";

export const PROFILE_STORAGE_KEY = "paw-palace-profile";
export const SETTINGS_STORAGE_KEY = "paw-palace-account-settings";

export interface StoredProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredPet: PreferredPet;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zip: string;
}

export const defaultStoredProfile: StoredProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredPet: "dog",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
};

export interface StoredAccountSettings {
  orderShipEmails: boolean;
  backInStockAlerts: boolean;
  dealsAndMarketing: boolean;
  petCareTips: boolean;
  smsOrderUpdates: boolean;
  prescriptionReminders: boolean;
  language: string;
  currency: string;
}

export const defaultAccountSettings: StoredAccountSettings = {
  orderShipEmails: true,
  backInStockAlerts: true,
  dealsAndMarketing: false,
  petCareTips: true,
  smsOrderUpdates: false,
  prescriptionReminders: true,
  language: "en-US",
  currency: "USD",
};

export function loadProfileFromStorage(): StoredProfile {
  if (typeof window === "undefined") return defaultStoredProfile;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return defaultStoredProfile;
    const parsed = JSON.parse(raw) as Partial<StoredProfile>;
    return { ...defaultStoredProfile, ...parsed };
  } catch {
    return defaultStoredProfile;
  }
}

export function saveProfileToStorage(profile: StoredProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function loadSettingsFromStorage(): StoredAccountSettings {
  if (typeof window === "undefined") return defaultAccountSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultAccountSettings;
    const parsed = JSON.parse(raw) as Partial<StoredAccountSettings>;
    return { ...defaultAccountSettings, ...parsed };
  } catch {
    return defaultAccountSettings;
  }
}

export function saveSettingsToStorage(settings: StoredAccountSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
