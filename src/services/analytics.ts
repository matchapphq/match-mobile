import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { posthogClient } from './posthogClient';

export const posthog = posthogClient;

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
