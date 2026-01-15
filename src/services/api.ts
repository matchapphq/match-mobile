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

const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:8008/api";

//const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://opportunely-untrinitarian-tommie.ngrok-free.dev';

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
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.log("Error getting auth token:", error);
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem("authToken");
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

export const apiService = {
    // Auth
    login: async (email: string, password: string) => {
        const response = await api.post("/auth/login", { email, password });
        if (!response) throw new Error("Login failed");
        return response.data;
    },

    signup: async (data: any) => {
        const response = await api.post("/onboarding/complete", data);
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
        // Handle both array and { data: [] } response formats
        return Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
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
        const response = await api.get("/matches/upcoming");
        const rawMatches = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
        return transformMatches(rawMatches);
    },

    getMatchesByVenue: async (venueId: string): Promise<Match[]> => {
        const response = await api.get(`/venues/${venueId}/matches`);
        return response.data;
    },

    getMatchVenues: async (matchId: string): Promise<MatchVenue[]> => {
        const response = await api.get(`/matches/${matchId}/venues`);
        const data = Array.isArray(response.data)
            ? response.data
            : response.data?.data || [];
        return data;
    },

    // Reservations
    createReservation: async (
        payload: CreateReservationPayload,
    ): Promise<CreateReservationResponse> => {
        const response = await api.post("/reservations", payload);
        return response.data;
    },

    getUserReservations: async (): Promise<Reservation[]> => {
        const response = await api.get("/reservations");
        return response.data;
    },

    cancelReservation: async (id: string): Promise<void> => {
        await api.delete(`/reservations/${id}`);
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
