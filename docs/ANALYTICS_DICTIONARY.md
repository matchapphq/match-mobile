# Analytics Event Dictionary: Match Mobile

This document provides a comprehensive reference for all events tracked in the Match mobile application via PostHog. It serves as a source of truth for understanding user behavior and calculating KPIs.

---

## 1. Lifecycle & Authentication
Events related to the app's lifecycle and user access.

### `app_open`
*   **Description:** Triggered every time the app enters the foreground.
*   **Properties:**
    *   `first_open` (bool): True if this is the user's first time opening the app.
    *   `platform` (string): 'ios' or 'android'.

### `onboarding_started`
*   **Description:** Triggered when the user lands on the first screen of the onboarding flow.

### `onboarding_completed`
*   **Description:** Triggered when the user successfully finishes all onboarding steps and the account is created.
*   **Properties:**
    *   `duration_seconds` (number): Time spent in the onboarding flow from start to finish.

### `sign_up_completed`
*   **Description:** Triggered when a new user account is successfully registered.
*   **Properties:**
    *   `user_id` (string): The unique database ID of the user.
    *   `method` (string): The registration method used (e.g., 'email', 'google', 'apple').

### `login_completed`
*   **Description:** Triggered when an existing user successfully logs in.
*   **Properties:**
    *   `user_id` (string): The unique database ID of the user.
    *   `method` (string): The login method used (e.g., 'email', 'google', 'apple').

---

## 2. Discovery & Search
Events related to how users find venues and matches.

### `search_performed`
*   **Description:** Triggered when a search is executed (either by typing or by changing filters/tabs).
*   **Properties:**
    *   `query` (string): The text entered by the user.
    *   `filter_type` (string): The active tab ('all', 'matches', 'venues').
    *   `results_count` (number): Total number of results returned.
    *   `selected_date` (string): If applicable, the date used for filtering.

### `venue_viewed`
*   **Description:** Triggered when a user opens a venue's profile page or selects a venue marker on the map.
*   **Properties:**
    *   `venue_id` (string): The ID of the venue.
    *   `venue_name` (string): The display name of the venue.
    *   `source` (string): Where the user came from ('search', 'map', 'favorites', 'search_history', 'search_trends').

### `match_viewed`
*   **Description:** Triggered when a user opens the details page for a specific match.
*   **Properties:**
    *   `match_id` (string): The ID of the match.
    *   `teams` (string): Display string of the teams (e.g., "PSG vs Marseille").
    *   `league` (string): Name of the competition.
    *   `source` (string): Where the user came from ('search', 'map', 'venue_agenda').

### `map_interacted`
*   **Description:** Triggered when the user pans or zooms the map.
*   **Properties:**
    *   `lat` / `lng` (number): Center coordinates of the map after interaction.
    *   `latitudeDelta` / `longitudeDelta` (number): Current zoom level/visible area.

---

## 3. Booking Flow
Events tracking the conversion funnel from intent to confirmed reservation.

### `booking_started`
*   **Description:** Triggered when the user enters the reservation flow (clicks "Reserve a table").
*   **Properties:**
    *   `venue_id` (string): The ID of the venue.
    *   `match_id` (string): The ID of the match being reserved (if selected).

### `booking_confirmed`
*   **Description:** Triggered when the reservation is successfully saved in the database.
*   **Properties:**
    *   `reservation_id` (string): The unique ID of the booking.
    *   `venue_id` (string): The ID of the venue.
    *   `match_id` (string): The ID of the match.
    *   `party_size` (number): Number of guests.

### `booking_cancelled`
*   **Description:** Triggered when a user cancels an existing reservation.
*   **Properties:**
    *   `reservation_id` (string): The ID of the cancelled booking.
    *   `reason` (string): The reason provided for cancellation.

---

## 4. Engagement & Community
Events related to secondary interactions and feedback.

### `favorite_added` / `favorite_removed`
*   **Description:** Triggered when a user hearts or un-hearts a venue.
*   **Properties:**
    *   `venue_id` (string): The ID of the venue.

### `review_submitted`
*   **Description:** Triggered when a user successfully submits a review for a venue.
*   **Properties:**
    *   `venue_id` (string): The ID of the venue.
    *   `rating` (number): The star rating given (1-5).
    *   `has_comment` (bool): True if the user wrote a text review.

### `bug_reported`
*   **Description:** Triggered when a user submits a bug report via the profile screen.
*   **Properties:**
    *   `category` (string): The type of bug (e.g., 'general', 'technical').
    *   `description_length` (number): Character count of the report.

### `venue_shared`
*   **Description:** Triggered when a user clicks the share button on a venue profile.
*   **Properties:**
    *   `venue_id` (string): The ID of the shared venue.

---

## 5. User Properties (Global)
These properties are attached to the user profile and available for cohorting.

| Property | Description |
|----------|-------------|
| `email` | User's primary email address. |
| `first_name` / `last_name` | User's personal name. |
| `is_venue_owner` | Boolean flag indicating if the user is a partner/owner. |
| `preferred_language` | The language setting of the user. |
| `favorite_teams` | List of team IDs the user follows. |
| `total_bookings_count` | Running total of successful reservations. |
| `last_booking_date` | ISO timestamp of the most recent booking. |
| `user_tier` | Account level (e.g., 'standard', 'premium'). |
| `fav_sports` | List of sports the user expressed interest in during onboarding. |
| `budget` | Preferred price range selected during onboarding. |
