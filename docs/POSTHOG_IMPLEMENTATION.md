# PostHog Implementation Guide: Match Mobile

This document explains how to set up the PostHog dashboard and implement tracking for the Match platform.

## 1. Dashboard Setup (PostHog UI)

### A. Core Insights (The "North Star" Dashboard)

1.  **Confirmed Booking Trend:**
    -   **Insight:** Trends
    -   **Event:** `booking_confirmed`
    -   **Measure:** Total Count (Daily)
    -   **Goal:** Track the growth of successful reservations.

2.  **Auth Method Breakdown (Signup & Login):**
    -   **Insight:** Trends
    -   **Events:** `sign_up_completed` and `login_completed`
    -   **Breakdown by:** `method` (Property)
    -   **Action:** See how many users prefer Email vs. OAuth (Google/Apple). Use a Pie Chart to see the total split.

3.  **Onboarding Funnel with Step Names:**
    -   **Insight:** Funnel
    -   **Steps:** 
        -   Step 1: `onboarding_started`
        -   Step 2: `onboarding_step_completed` (Filter: `step_name` = `name`)
        -   Step 3: `onboarding_step_completed` (Filter: `step_name` = `contact`)
        -   ...
        -   Last Step: `onboarding_completed`
    -   **Breakdown:** Use "Breakdown by: `method`" to compare Email vs. OAuth drop-offs.

4.  **DAU/MAU Ratio (Stickiness):**
    -   **Insight:** Trends
    -   **Action:** `app_open`
    -   **Count per:** `Unique Users`
    -   **Formula:** (DAU / MAU) * 100.
    -   **Action:** Measures how "sticky" the app is. 20%+ is a good target for Match.

### B. Product Health & Content Insights

1.  **API Error Heatmap:**
    -   **Insight:** Trends -> Group by `endpoint` and `status`
    -   **Event:** `api_error`
    -   **Action:** Identify which backend services are failing in real-time.

2.  **Top Sports & Venues:**
    -   **Insight:** Trends -> Group by `sport` or `venue_name`
    -   **Events:** `match_viewed`, `venue_viewed`

---

## 2. Most Useful Data to Track

### User Identification
Call `analytics.identify()` after login with these properties to create "User Cohorts":
-   `tier`: standard | premium
-   `favorite_teams`: array of IDs
-   `preferred_sports`: array
-   `method`: email | google | apple (Last used method)

### Critical Events & Properties
| Event | Property | Purpose |
| :--- | :--- | :--- |
| `sign_up_completed` | `method` | Identify the acquisition channel (Email vs Social). |
| `login_completed` | `method` | Track how users return to the app. |
| `onboarding_step_completed`| `step_name`, `method`| Pinpoint exact friction points in the first 2 minutes. |
| `booking_confirmed` | `venue_id`, `party_size` | Calculate core platform utility. |
| `search_performed` | `query`, `results_count` | Identify "Dead Ends" where users find nothing. |

---

## 3. How to "Warm Up" your Dashboard

Event names and properties won't appear in PostHog dropdowns until they are sent at least once.

1.  **Run the Seed Script:**
    This sends dummy data for every defined event/property so you can build your charts immediately.
    ```bash
    EXPO_PUBLIC_POSTHOG_API_KEY=your_key bun run match-mobile/src/scripts/posthog-seed.ts
    ```
2.  **Verify:**
    Check **Data Management -> Events** in PostHog. You should see all events with `is_seed_event: true`.

---

## 4. Implementation Reference

### Navigation Tracking
We track user movement automatically:
```typescript
// src/navigation/AppNavigator.tsx
<NavigationContainer
  onStateChange={(state) => {
    const route = getCurrentRouteName(state);
    analytics.screen(route); // Tracks $screen event
  }}
>
```

### Capturing Auth Methods
```typescript
// In Login/Signup logic
analytics.track("login_completed", { method: 'google' });
analytics.track("sign_up_completed", { method: 'email' });
```
