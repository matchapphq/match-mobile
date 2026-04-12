/**
 * PostHog Seed Script (Exhaustive - Bun/Node compatible)
 * Run this to "register" ALL event and screen names in your PostHog dashboard.
 * 
 * Usage: 
 * EXPO_PUBLIC_POSTHOG_API_KEY=your_key bun run match-mobile/src/scripts/posthog-seed.ts
 */

const API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || "";
const HOST = (process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");

const METHODS = ['email', 'google', 'apple'];
const ONBOARDING_STEPS = ['name', 'contact', 'security', 'username', 'sports', 'mood', 'venue_style'];

const ALL_EVENTS: any[] = [
    // Lifecycle & App
    { name: 'app_open', props: { first_open: true, platform: 'seed-script' } },
    { name: 'app_backgrounded', props: {} },
    { name: 'app_foregrounded', props: {} },
];

// Add Auth & Onboarding variations for ALL methods
METHODS.forEach(method => {
    ALL_EVENTS.push({ name: 'sign_up_started', props: { method } });
    ALL_EVENTS.push({ name: 'sign_up_completed', props: { method } });
    ALL_EVENTS.push({ name: 'login_completed', props: { method } });
    ALL_EVENTS.push({ name: 'onboarding_started', props: { method } });
    ALL_EVENTS.push({ name: 'onboarding_completed', props: { method, total_time_seconds: 120 } });
    
    ONBOARDING_STEPS.forEach(step => {
        ALL_EVENTS.push({ name: 'onboarding_step_completed', props: { step_name: step, method } });
    });
});

// Add Discovery & Operational Events
ALL_EVENTS.push(
    { name: 'venue_viewed', props: { venue_id: 'seed', venue_name: 'Seed Venue', source: 'discovery' } },
    { name: 'match_viewed', props: { match_id: 'seed', match_name: 'Seed vs Seed', sport: 'football' } },
    { name: 'match_shared', props: { match_id: 'seed' } },
    { name: 'search_performed', props: { query: 'seed', results_count: 5 } },
    { name: 'search_date_filtered', props: { date: '2026-03-24' } },
    { name: 'search_tab_switched', props: { tab: 'matches' } },
    { name: 'map_interacted', props: { action: 'marker_tap' } },
    { name: 'booking_started', props: { venue_id: 'seed', match_id: 'seed' } },
    { name: 'booking_confirmed', props: { reservation_id: 'seed', party_size: 2, venue_name: 'Seed Venue' } },
    { name: 'booking_cancelled', props: { reservation_id: 'seed', reason: 'change_of_plans' } },
    { name: 'review_submitted', props: { rating: 5, venue_id: 'seed' } },
    { name: 'api_error', props: { endpoint: '/api/v1/venues', status: 500, error: 'Internal Server Error' } }
);

const ALL_SCREENS = [
    'Discover', 'Search', 'VenueProfile', 'MatchDetail', 'UserBookings', 'Profile', 'Login', 'SignUp', 'Onboarding'
];

async function seedPostHog() {
    if (!API_KEY) {
        console.error("❌ PostHog API Key missing. Run with: EXPO_PUBLIC_POSTHOG_API_KEY=phc_... bun run match-mobile/src/scripts/posthog-seed.ts");
        process.exit(1);
    }

    console.log(`🚀 Starting Global PostHog Seeding to ${HOST}...`);
    console.log(`📊 Sending variations for methods: ${METHODS.join(', ')}`);
    
    const eventsBatch = ALL_EVENTS.map(event => ({
        event: event.name,
        properties: {
            ...event.props,
            distinct_id: `seed-user-${event.props.method || 'admin'}`,
            is_seed_event: true,
            $lib: 'bun-seed-script',
        },
        timestamp: new Date().toISOString()
    }));

    const screensBatch = ALL_SCREENS.map(screenName => ({
        event: '$screen',
        properties: {
            $screen_name: screenName,
            distinct_id: 'seed-admin-user',
            is_seed_event: true,
            $lib: 'bun-seed-script'
        },
        timestamp: new Date().toISOString()
    }));

    const fullBatch = [...eventsBatch, ...screensBatch];

    try {
        const response = await fetch(`${HOST}/batch/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: API_KEY,
                batch: fullBatch
            })
        });

        if (response.ok) {
            console.log(`✨ Successfully sent ${fullBatch.length} items to PostHog.`);
            console.log("✅ All methods (email, google, apple) are now registered for all auth events.");
        } else {
            const errorData = await response.text();
            console.error(`❌ PostHog Error: ${response.status}`, errorData);
        }
    } catch (err) {
        console.error("❌ Network error during seeding:", err);
    }
}

seedPostHog();
