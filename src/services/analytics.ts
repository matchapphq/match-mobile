import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY || "", {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
});

class AnalyticsService {
    capture(event: string, properties: Record<string, any> = {}) {
        posthog.capture(event, {
            platform: Platform.OS,
            app_version: Constants.expoConfig?.version ?? null,
            ...properties,
        });
    }

    identify(userId: string, properties: Record<string, any> = {}) {
        posthog.identify(userId, properties);
    }

    reset() {
        posthog.reset();
    }

    screen(screenName: string, properties: Record<string, any> = {}) {
        posthog.screen(screenName, properties);
    }
}

export const analytics = new AnalyticsService();
