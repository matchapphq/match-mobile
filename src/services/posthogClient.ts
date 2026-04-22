import AsyncStorage from "@react-native-async-storage/async-storage";
import PostHog from "posthog-react-native";

const ANALYTICS_CONSENT_STORAGE_KEY = "analytics_consent_preference";
const HAS_SEEN_CONSENT_POPUP_KEY = "has_seen_consent_popup";

export const posthogClient = new PostHog(
    process.env.EXPO_PUBLIC_POSTHOG_API_KEY || "",
    {
        host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        defaultOptIn: true,
    },
);

export const loadAnalyticsConsentPreference = async (): Promise<boolean | null> => {
    try {
        const rawValue = await AsyncStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
        if (rawValue === null) {
            return null;
        }
        return rawValue === "true";
    } catch (error) {
        console.warn("Failed to read analytics consent preference", error);
        return null;
    }
};

export const setAnalyticsConsentPreference = async (consent: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, String(consent));
    } catch (error) {
        console.warn("Failed to persist analytics consent preference", error);
    }
};

export const loadHasSeenConsentPopup = async (): Promise<boolean> => {
    try {
        const value = await AsyncStorage.getItem(HAS_SEEN_CONSENT_POPUP_KEY);
        return value === "true";
    } catch (error) {
        return false;
    }
};

export const setHasSeenConsentPopupPreference = async (hasSeen: boolean): Promise<void> => {
    try {
        await AsyncStorage.setItem(HAS_SEEN_CONSENT_POPUP_KEY, String(hasSeen));
    } catch (error) {
        console.warn("Failed to persist consent popup seen state", error);
    }
};
