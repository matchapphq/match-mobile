import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const API_BASE_URL = Constants.expoConfig?.extra?.apiBase || "http://localhost:8008/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
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
                // We might want to trigger a logout action in the store here
                // but avoiding circular dependencies is tricky. 
                // The store should listen to isAuthenticated state which will be false next app load
                // or we can emit an event.
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
    reservation?: {
        id: string;
        status: string;
        partySize: number;
        venueMatchId: string;
        venue?: string;
        match?: {
            scheduledAt?: string;
        };
    };
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

    logout: async () => {
        try {
            await api.post("/auth/logout");
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
        return response.data?.data || response.data;
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
            return response.data?.isFavorite ?? false;
        } catch {
            return false;
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

    getMatchVenues: async (matchId: string): Promise<MatchVenue[]> => {
        const cacheKey = `match_venues_${matchId}`;
        const cached = await cacheService.get<MatchVenue[]>(cacheKey);
        if (cached) return cached;

        const response = await api.get(`/matches/${matchId}/venues`);
        const data = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
            
        await cacheService.set(cacheKey, data, 15); // Cache for 15 minutes
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
};

// Mock data for development
export const mockData = {
    venues: [
        {
            id: "1",
            name: "The Kop Bar",
            address: "Bar - 123 Bd Ney, 75018 Paris",
            latitude: 48.8584,
            longitude: 2.3522,
            type: VenueType.BAR,
            rating: 4.5,
            priceRange: "5-10€",
            tags: ["Foot", "Conviviale", "Bière"],
            distance: 0.9,
            images: ["https://via.placeholder.com/400x300"],
            description: "Bar sportif convivial avec grande terrasse",
            hours: "11h / 01h",
        },
        {
            id: "2",
            name: "Le Corner Pub",
            address: "45 Rue de la République, 75011 Paris",
            latitude: 48.8566,
            longitude: 2.3525,
            type: VenueType.PUB,
            rating: 4.2,
            priceRange: "+20€",
            tags: ["Rugby", "Posée", "Pizza"],
            distance: 1.5,
            images: ["https://via.placeholder.com/400x300"],
            description: "Pub irlandais authentique",
            hours: "16h / 02h",
        },
    ],
    matches: [
        {
            id: "1",
            homeTeam: "PSG",
            awayTeam: "OM",
            sport: SportType.FOOTBALL,
            date: new Date("2025-11-28T21:00:00"),
            time: "21h",
            competition: "Ligue 1",
            thumbnail: "https://via.placeholder.com/400x200",
        },
        {
            id: "2",
            homeTeam: "RMA",
            awayTeam: "FCB",
            sport: SportType.FOOTBALL,
            date: new Date("2025-11-30T16:00:00"),
            time: "16h",
            competition: "La Liga",
            thumbnail: "https://via.placeholder.com/400x200",
        },
        {
            id: "3",
            homeTeam: "Lakers",
            awayTeam: "Warriors",
            sport: SportType.BASKETBALL,
            date: new Date("2025-12-01T19:30:00"),
            time: "19h30",
            competition: "NBA",
            thumbnail: "https://via.placeholder.com/400x200",
        },
        {
            id: "4",
            homeTeam: "France",
            awayTeam: "England",
            sport: SportType.RUGBY,
            date: new Date("2025-12-05T15:00:00"),
            time: "15h",
            competition: "Six Nations",
            thumbnail: "https://via.placeholder.com/400x200",
        },
        {
            id: "5",
            homeTeam: "Medvedev",
            awayTeam: "Djokovic",
            sport: SportType.TENNIS,
            date: new Date("2025-12-02T14:00:00"),
            time: "14h",
            competition: "ATP Finals",
            thumbnail: "https://via.placeholder.com/400x200",
        },
        {
            id: "6",
            homeTeam: "Man City",
            awayTeam: "Liverpool",
            sport: SportType.FOOTBALL,
            date: new Date("2025-11-29T18:30:00"),
            time: "18h30",
            competition: "Premier League",
            thumbnail: "https://via.placeholder.com/400x200",
        },
    ],
};
