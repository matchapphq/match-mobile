# PostHog Implementation Guide: Match Mobile

This document explains how to set up the PostHog dashboard and implement the tracking code in the React Native application.

## 1. Dashboard Setup (PostHog UI)

### A. Core Insights
1. **Retention Table:**
   - Go to **Insights** -> **New Insight** -> **Retention**.
   - **User first performed:** `app_open`.
   - **User then returned and performed:** `app_open`.
   - Set the grouping to **Daily** or **Weekly**.

2. **Conversion Funnel (Booking):**
   - Go to **Insights** -> **New Insight** -> **Funnel**.
   - Step 1: `venue_viewed`.
   - Step 2: `booking_started`.
   - Step 3: `booking_confirmed`.
   - This identifies where users drop off in the booking flow.

3. **DAU/MAU Dashboard:**
   - Go to **Insights** -> **New Insight** -> **Trends**.
   - Action: `app_open`.
   - **Count per:** `Unique Users`.
   - **Interval:** `Daily` (DAU) or `Monthly` (MAU).

### B. Grouping by Feature
- Use **Feature Flags** in PostHog to toggle features and track performance differences between users with and without specific features.

---

## 2. React Native Implementation

The application already includes a basic `AnalyticsService` in `src/services/analytics.ts`. You should use this wrapper throughout the app.

### A. Base Implementation (`src/services/analytics.ts`)
```typescript
import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY || "", {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
});

class AnalyticsService {
    // Basic event capture
    track(event: string, properties: Record<string, any> = {}) {
        posthog.capture(event, {
            platform: Platform.OS,
            app_version: Constants.expoConfig?.version ?? null,
            ...properties,
        });
    }

    // User identification (Call after login/registration)
    identify(userId: string, properties: Record<string, any> = {}) {
        posthog.identify(userId, properties);
    }

    // Navigation tracking
    screen(screenName: string, properties: Record<string, any> = {}) {
        posthog.screen(screenName, properties);
    }

    // Reset on logout
    reset() {
        posthog.reset();
    }
}

export const analytics = new AnalyticsService();
```

### B. Usage Examples

#### 1. Tracking a Venue View
In `VenueProfileScreen.tsx`:
```typescript
import { analytics } from '../services/analytics';

useEffect(() => {
    analytics.track('venue_viewed', {
        venue_id: venue.id,
        venue_name: venue.name,
        source: route.params?.source || 'direct'
    });
}, [venue.id]);
```

#### 2. Identifying a User after Login
In `LoginScreen.tsx`:
```typescript
import { analytics } from '../services/analytics';

const handleLoginSuccess = (user: User) => {
    analytics.identify(user.id, {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role
    });
    analytics.track('login_completed', { method: 'email' });
};
```

#### 3. Tracking a Search
In `SearchMenu.tsx`:
```typescript
const onSearchSubmit = (query: string, resultCount: number) => {
    analytics.track('search_performed', {
        query,
        results_count: resultCount,
        filter_type: currentFilter
    });
};
```

#### 4. Tracking Retention (App Open)
In `App.tsx` or `index.ts`:
```typescript
import { analytics } from './src/services/analytics';

// On app launch or focus
analytics.track('app_open', {
    first_open: isFirstLaunch // Check via AsyncStorage
});
```

## 3. PostHog Dashboard - Actionable Metrics
- **Hotspots:** Use the `map_interacted` event to see where users are searching most frequently.
- **Top Matches:** Analyze `match_viewed` to see which sports/leagues drive the most engagement.
- **Drop-off Reasons:** Correlate `booking_cancelled` reasons to improve the user experience.
