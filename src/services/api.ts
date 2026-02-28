import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
    Venue,
    Match,
    User,
    Reservation,
    VenueType,
    SportType,
} from "../types";
import Constants from "expo-constants";
import { cacheService } from "./cache";
import { tokenStorage } from "../utils/tokenStorage";
import PostHog from 'posthog-react-native';

const getApiBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    
    const apiBase = Constants.expoConfig?.extra?.apiBase || "http://localhost:8008/api";
    
    // Auto-fix localhost for Android emulator and potentially physical devices
    if (__DEV__ && apiBase.includes("localhost")) {
        if (Platform.OS === 'android') {
            return apiBase.replace("localhost", "10.0.2.2");
        }
        // For physical devices, we can't easily auto-detect host IP here without more complex logic
        // but using process.env.EXPO_PUBLIC_API_URL is the recommended way.
    }
    
    return apiBase;
};

export const API_BASE_URL = getApiBaseUrl();

type AuthFailureReason = "refresh_failed" | "missing_refresh_token";
type AuthFailureHandler = (reason: AuthFailureReason) => void | Promise<void>;

let authFailureHandler: AuthFailureHandler | null = null;

export const setAuthFailureHandler = (handler: AuthFailureHandler | null) => {
    authFailureHandler = handler;
};

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // Increased to 15s to be more resilient
    headers: {
        "Content-Type": "application/json",
    },
});

// PostHog instance for background/service tracking
const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY || "", {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    try {
        const token = await tokenStorage.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.log("Error getting auth token:", error);
    }
    return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status !== 401) {
            posthog.capture("api_error", {
                status: error.response?.status,
                url: originalRequest.url,
                method: originalRequest.method,
                message: error.message,
            });
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers["Authorization"] = "Bearer " + token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = await tokenStorage.getRefreshToken();
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                    refresh_token: refreshToken
                });

                const { token, refresh_token } = response.data;
                
                await tokenStorage.setTokens(token, refresh_token);
                
                api.defaults.headers.common["Authorization"] = "Bearer " + token;
                processQueue(null, token);
                
                originalRequest.headers["Authorization"] = "Bearer " + token;
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                await tokenStorage.clearTokens();
                delete api.defaults.headers.common["Authorization"];
                if (originalRequest.headers) {
                    delete originalRequest.headers["Authorization"];
                }
                if (authFailureHandler) {
                    const reason =
                        err instanceof Error && err.message === "No refresh token available"
                            ? "missing_refresh_token"
                            : "refresh_failed";
                    await authFailureHandler(reason);
                }
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

// Transform API match response to mobile Match type
const transformMatches = (rawMatches: any[]): Match[] =>
    rawMatches.map((m: any) => ({
        id: m.id,
        homeTeam: m.homeTeam?.name || m.home_team?.name || m.homeTeam || "TBD",
        awayTeam: m.awayTeam?.name || m.away_team?.name || m.awayTeam || "TBD",
        sport: (m.league?.sport?.name || m.sport || "Football") as SportType,
        date: new Date(m.scheduled_at || m.date),
        time: m.scheduled_at
            ? new Date(m.scheduled_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : m.time || "",
        competition: m.league?.name || m.competition || "",
        thumbnail: m.thumbnail || m.image_url || undefined,
    }));

export interface MatchVenue {
    venueMatchId: string;
    venue: {
        id: string;
        name: string;
        city?: string;
        street_address?: string;
        phone?: string;
        latitude?: number;
        longitude?: number;
    };
    totalCapacity: number;
    availableCapacity: number;
    maxGroupSize: number;
    isFeatured: boolean;
    allowsReservations: boolean;
}

export interface MatchDetails {
    id: string;
    scheduled_at: string;
    status: string;
    homeTeam?: { id: string; name: string; logo_url?: string };
    awayTeam?: { id: string; name: string; logo_url?: string };
    league?: { id: string; name: string; sport?: { name: string } };
    thumbnail?: string;
}

export interface VenueDetails {
    id: string;
    name: string;
    city?: string;
    street_address?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    price_range?: string;
    rating?: number;
    photos?: VenuePhoto[];
    opening_hours?: VenueOpeningHours[];
    amenities?: string[];
}

export interface VenuePhoto {
    id: string;
    url: string;
    is_primary?: boolean;
}

export interface VenueOpeningHours {
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed?: boolean;
}

export interface VenueAvailability {
    venueMatchId: string;
    matchId: string;
    availableCapacity: number;
    totalCapacity: number;
    maxGroupSize: number;
    scheduledAt: string;
}

export interface UpcomingNearbyMatch {
    venueMatchId: string;
    match: MatchDetails;
    venue: { id: string; name: string; city?: string };
    availableCapacity: number;
    isFeatured: boolean;
}

export interface SearchFilters {
    query?: string;
    sport?: string;
    date?: string;
    lat?: number;
    lng?: number;
    radius?: number;
}

export interface CreateReservationPayload {
    venueMatchId: string;
    partySize: number;
    requiresAccessibility?: boolean;
    specialRequests?: string;
}

export interface CreateReservationResponse {
    message?: string;
    reservation?: ApiReservation;
    qr_code?: string;
    qrCode?: string;
}

export interface ApiReservation {
    id: string;
    user_id: string;
    venue_match_id: string;
    party_size: number;
    status: string;
    special_requests?: string | null;
    qr_code?: string | null;
    created_at: string;
    canceled_at?: string | null;
    canceled_reason?: string | null;
    venueMatch?: {
        id: string;
        venue?: {
            id: string;
            name: string;
            city?: string;
            street_address?: string;
            phone?: string;
        };
        match?: {
            id: string;
            scheduled_at: string;
            homeTeam?: { name: string };
            awayTeam?: { name: string };
            home_team?: { name: string };
            away_team?: { name: string };
            league?: { name: string };
        };
    };
}

export interface GetReservationResponse {
    reservation: ApiReservation;
    qrCode?: string;
}

export interface CancelReservationResponse {
    message: string;
    reservation: ApiReservation;
}

export const apiService = {
    // Auth
    login: async (email: string, password: string) => {
        const response = await api.post("/auth/login", { email, password });
        if (!response) throw new Error("Login failed");
        return response.data;
    },

    googleLogin: async (idToken: string) => {
        const response = await api.post("/auth/google", { id_token: idToken });
        if (!response) throw new Error("Google login failed");
        return response.data;
    },

    appleLogin: async (payload: {
        idToken: string;
        firstName?: string;
        lastName?: string;
    }) => {
        const response = await api.post("/auth/apple", {
            id_token: payload.idToken,
            first_name: payload.firstName,
            last_name: payload.lastName,
        });
        if (!response) throw new Error("Apple login failed");
        return response.data;
    },

    logout: async () => {
        try {
            const refreshToken = await tokenStorage.getRefreshToken();
            await api.post("/auth/logout", refreshToken ? { refresh_token: refreshToken } : undefined);
        } catch (error) {
            console.warn("Logout API call failed", error);
        }
    },

    signup: async (data: any) => {
        const response = await api.post("/auth/register", data);
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await api.get("/users/me");
        return response.data?.user || response.data?.data || response.data;
    },

    getPrivacyPreferences: async (): Promise<{
        analytics_consent: boolean;
        marketing_consent: boolean;
        legal_updates_email: boolean;
        account_deletion_grace_days: number;
    }> => {
        const response = await api.get("/users/me/privacy-preferences");
        return response.data;
    },

    // Venues
    getVenues: async (filters?: any): Promise<Venue[]> => {
        const response = await api.get("/venues", { params: filters });
        // Handle both array and { data: [] } response formats
        return Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
    },

    getVenueById: async (id: string): Promise<Venue> => {
        const response = await api.get(`/venues/${id}`);
        return response.data?.data || response.data;
    },

    getNearbyVenues: async (
        lat: number,
        lng: number,
        radius: number = 5000,
    ): Promise<Venue[]> => {
        const response = await api.get("/venues/nearby", {
            params: { lat, lng, radius },
        });
        return Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
    },

    getVenueDetails: async (venueId: string): Promise<VenueDetails> => {
        const response = await api.get(`/venues/${venueId}`);
        return response.data?.data || response.data;
    },

    getVenuePhotos: async (venueId: string): Promise<VenuePhoto[]> => {
        const response = await api.get(`/venues/${venueId}/photos`);
        return response.data?.data || response.data || [];
    },

    getVenueReviews: async (venueId: string): Promise<any[]> => {
        const response = await api.get(`/venues/${venueId}/reviews`);
        return response.data?.data || response.data || [];
    },

    getVenueAvailability: async (venueId: string): Promise<VenueAvailability[]> => {
        const response = await api.get(`/venues/${venueId}/availability`);
        return response.data?.data || response.data || [];
    },

    getVenueOpeningHours: async (venueId: string): Promise<VenueOpeningHours[]> => {
        const response = await api.get(`/venues/${venueId}/opening-hours`);
        return response.data?.data || response.data || [];
    },

    getVenueMenu: async (venueId: string): Promise<any[]> => {
        const response = await api.get(`/venues/${venueId}/menu`);
        return response.data?.data || response.data || [];
    },

    getVenueAmenities: async (venueId: string): Promise<string[]> => {
        const response = await api.get(`/venues/${venueId}/amenities`);
        return response.data?.data || response.data || [];
    },

    // Favorites
    addVenueToFavorites: async (venueId: string): Promise<void> => {
        await api.post(`/venues/${venueId}/favorite`);
    },

    removeVenueFromFavorites: async (venueId: string): Promise<void> => {
        await api.delete(`/venues/${venueId}/favorite`);
    },

    checkVenueFavorite: async (venueId: string): Promise<boolean> => {
        try {
            const response = await api.get(`/venues/${venueId}/favorite`);
            return response.data?.isFavorited ?? false;
        } catch {
            return false;
        }
    },

    getFavoriteVenues: async (): Promise<any[]> => {
        try {
            const response = await api.get("/users/me/favorites");
            return Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];
        } catch {
            return [];
        }
    },

    // Matches
    getMatches: async (filters?: any): Promise<Match[]> => {
        const response = await api.get("/matches", { params: filters });
        const rawMatches = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
        return transformMatches(rawMatches);
    },

    getUpcomingMatches: async (): Promise<Match[]> => {
        const cacheKey = "matches_upcoming";
        const cached = await cacheService.get<Match[]>(cacheKey);
        if (cached) {
            // Need to convert date strings back to Date objects because JSON.stringify converts dates to strings
            return cached.map(m => ({ ...m, date: new Date(m.date) }));
        }

        const response = await api.get("/matches/upcoming");
        const rawMatches = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
        const transformed = transformMatches(rawMatches);
        
        await cacheService.set(cacheKey, transformed, 15); // Cache for 15 minutes
        return transformed;
    },

    getMatchesByVenue: async (venueId: string): Promise<Match[]> => {
        const response = await api.get(`/venues/${venueId}/matches`);
        return response.data;
    },

    getMatchById: async (matchId: string): Promise<MatchDetails> => {
        const cacheKey = `match_${matchId}`;
        const cached = await cacheService.get<MatchDetails>(cacheKey);
        if (cached) return cached;

        const response = await api.get(`/matches/${matchId}`);
        const data = response.data?.data || response.data;
        
        await cacheService.set(cacheKey, data, 30); // Cache for 30 minutes
        return data;
    },

    getMatchVenues: async (
        matchId: string,
        lat?: number,
        lng?: number,
        distanceKm: number = 50
    ): Promise<MatchVenue[]> => {
        // Don't use cache when location is provided (results are personalized)
        if (lat === undefined || lng === undefined) {
            const cacheKey = `match_venues_${matchId}`;
            const cached = await cacheService.get<MatchVenue[]>(cacheKey);
            if (cached) return cached;

            const response = await api.get(`/matches/${matchId}/venues`);
            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];
                
            await cacheService.set(cacheKey, data, 15); // Cache for 15 minutes
            return data;
        }

        // Fetch with location params for distance-sorted results
        const response = await api.get(`/matches/${matchId}/venues`, {
            params: { lat, lng, distance_km: distanceKm }
        });
        const data = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
        return data;
    },

    getUpcomingNearbyMatches: async (
        lat: number,
        lng: number,
        distanceKm: number = 10,
        limit: number = 20,
    ): Promise<UpcomingNearbyMatch[]> => {
        const response = await api.get("/matches/upcoming-nearby", {
            params: { lat, lng, distance_km: distanceKm, limit },
        });
        return response.data?.data || [];
    },

    // Reservations
    createReservation: async (
        payload: CreateReservationPayload,
    ): Promise<CreateReservationResponse> => {
        const response = await api.post("/reservations", payload);
        return response.data;
    },

    getUserReservations: async (): Promise<{ data: ApiReservation[] }> => {
        const response = await api.get("/reservations");
        return response.data;
    },

    getReservationById: async (id: string): Promise<GetReservationResponse> => {
        const response = await api.get(`/reservations/${id}`);
        return response.data;
    },

    cancelReservation: async (id: string, reason?: string): Promise<CancelReservationResponse> => {
        const response = await api.post(`/reservations/${id}/cancel`, { reason });
        return response.data;
    },

    // User
    updateUserPreferences: async (preferences: any): Promise<User> => {
        const response = await api.put("/users/preferences", preferences);
        return response.data;
    },

    getUserProfile: async (): Promise<User> => {
        const response = await api.get("/users/profile");
        return response.data;
    },

    updateProfile: async (data: any): Promise<User> => {
        const response = await api.put("/users/me", data);
        return response.data?.user || response.data?.data || response.data;
    },

    /**
     * Update user avatar via multipart upload to S3
     */
    updateAvatar: async (uri: string): Promise<{ success: boolean; url: string }> => {
        const formData = new FormData();
        
        // Extract filename and type from URI
        const filename = uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // @ts-ignore
        formData.append('file', {
            uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
            name: filename,
            type,
        });

        const response = await api.post("/media/avatar", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            // Needed for Axios to correctly calculate progress and handle FormData in some environments
            transformRequest: (data) => data,
        });

        return response.data;
    },

    // Discovery
    discoverNearby: async (
        lat: number,
        lng: number,
        radius?: number,
    ): Promise<{ venues: Venue[]; matches: UpcomingNearbyMatch[] }> => {
        const response = await api.get("/discovery/nearby", {
            params: { lat, lng, radius },
        });
        return response.data;
    },

    discoverMatchesNearby: async (
        lat: number,
        lng: number,
        radius?: number,
    ): Promise<UpcomingNearbyMatch[]> => {
        const response = await api.get("/discovery/matches-nearby", {
            params: { lat, lng, radius },
        });
        return response.data?.data || response.data || [];
    },

    search: async (filters: SearchFilters): Promise<{ venues: Venue[]; matches: Match[] }> => {
        const response = await api.post("/discovery/search", filters);
        return response.data;
    },

    /**
     * Paginated search for venues and matches
     */
    searchPaginated: async (params: {
        q?: string;
        type?: "all" | "matches" | "venues";
        page?: number;
        limit?: number;
        lat?: number;
        lng?: number;
        radius_km?: number;
        date?: string;
    }): Promise<{
        venues: any[];
        matches: any[];
        pagination: {
            page: number;
            limit: number;
            totalVenues: number;
            totalMatches: number;
            hasMoreVenues: boolean;
            hasMoreMatches: boolean;
        };
    }> => {
        const response = await api.get("/discovery/search", { params });
        return response.data;
    },

    /**
     * Delete user account
     */
    deleteAccount: async (payload: { reason: string; details?: string; password?: string }): Promise<void> => {
        await api.delete("/users/me", { data: payload });
    },

    /**
     * Request user data export
     */
    requestDataExport: async (payload: { message: string }): Promise<{
        success: boolean;
        message?: string;
        traceId?: string;
    }> => {
        const response = await api.post("/support/data-export-request", payload);
        return response.data;
    },

    /**
     * Change user password
     */
    changePassword: async (payload: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }): Promise<void> => {
        await api.put("/users/me/password", {
            current_password: payload.currentPassword,
            new_password: payload.newPassword,
            confirm_password: payload.confirmPassword,
        });
    },

    /**
     * Update user push token
     */
    updatePushToken: async (token: string): Promise<void> => {
        await api.put("/users/me/push-token", { push_token: token });
    },

    /**
     * Explicitly refresh session last activity timestamp.
     */
    sendSessionHeartbeat: async (payload?: {
        location?: {
            city?: string | null;
            region?: string | null;
            country?: string | null;
        };
    }): Promise<void> => {
        const hasLocation = Boolean(
            payload?.location?.city || payload?.location?.region || payload?.location?.country
        );
        await api.post(
            "/users/me/session-heartbeat",
            hasLocation ? { location: payload?.location } : undefined
        );
    },

    /**
     * Generic POST request
     */
    post: async (url: string, data?: any) => {
        const response = await api.post(url, data);
        return response.data;
    },
};
