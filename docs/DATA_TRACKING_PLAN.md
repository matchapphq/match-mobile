# Data Tracking Plan: Match Mobile App

This document outlines the comprehensive event tracking strategy for the Match mobile application using PostHog.

## 1. Core KPIs
| Metric | Definition | Event(s) |
|--------|------------|----------|
| **Retention Rate** | % of users returning after N days | `app_open` |
| **Conversion Rate (Booking)** | % of users who complete a booking after viewing a match | `booking_confirmed` / `venue_view` |
| **Search Success** | % of searches that lead to a venue view | `search_performed` -> `venue_view` |
| **Active Users (DAU/MAU)** | Number of unique users per day/month | `app_open` / `identify` |

---

## 2. Event Taxonomy

### A. Lifecycle & Auth
| Event Name | Trigger | Properties |
|------------|---------|------------|
| `app_open` | App enters foreground | `first_open` (bool), `platform` |
| `onboarding_started` | User sees first onboarding screen | - |
| `onboarding_completed` | User finishes onboarding steps | `duration_seconds` |
| `sign_up_started` | User clicks "Sign Up" | `method` (email, apple, google) |
| `sign_up_completed` | User successfully registers | `user_id`, `method` |
| `login_completed` | User successfully logs in | `user_id`, `method` |

### B. Discovery & Search
| Event Name | Trigger | Properties |
|------------|---------|------------|
| `search_performed` | User submits a search query | `query`, `results_count`, `filter_type` |
| `venue_viewed` | User opens a venue profile | `venue_id`, `venue_name`, `source` (search, map, favorites) |
| `match_viewed` | User opens match details | `match_id`, `teams`, `league`, `source` |
| `map_interacted` | User pans/zooms on the map | `lat`, `lng`, `zoom_level` |

### C. Booking Flow
| Event Name | Trigger | Properties |
|------------|---------|------------|
| `booking_started` | User clicks "Reserve a table" | `venue_id`, `match_id`, `party_size` |
| `booking_confirmed` | Reservation successfully created | `reservation_id`, `venue_id`, `match_id`, `party_size` |
| `booking_cancelled` | User cancels a reservation | `reservation_id`, `reason` |

### D. Engagement & Community
| Event Name | Trigger | Properties |
|------------|---------|------------|
| `favorite_added` | User hearts a venue | `venue_id`, `venue_name` |
| `favorite_removed` | User un-hearts a venue | `venue_id` |
| `review_submitted` | User leaves a review | `venue_id`, `rating`, `has_comment` (bool) |
| `bug_reported` | User submits a bug report | `category`, `description_length` |

---

## 3. User Properties
These should be set via `posthog.identify()` or `posthog.set_user_properties()`.

- `email`: User's email.
- `first_name` / `last_name`: Personal details.
- `is_venue_owner`: Boolean flag.
- `preferred_language`: Set from device or app settings.
- `favorite_teams`: List of teams the user follows.
- `total_bookings_count`: Incremented on each success.
- `last_booking_date`: Timestamp of the most recent booking.

---

## 4. Retention Analysis (PostHog Logic)
Retention is tracked by calculating the interval between a user's `app_open` events. 
- **Cohort:** Users who performed `app_open` for the first time.
- **Returning Action:** Subsequent `app_open` events.
