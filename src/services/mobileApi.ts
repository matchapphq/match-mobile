import type {
    Venue,
    VenueMatch,
    SearchTrend,
    SearchResult,
    SearchMatchResult,
    Booking,
    FaqItem,
    UserProfile,
    ReservationDate,
} from "../types/app.types";

export type { Venue, VenueMatch, SearchTrend, SearchResult, SearchMatchResult, Booking, FaqItem, UserProfile, ReservationDate };

import { apiService } from "./api";
import {
    mockSearchTrends,
    mockRecentSearches,
    mockFaqItems,
    generateDates,
} from "../lib/mockData";

// Transform API venue to MobileApi Venue format
const transformApiVenue = (apiVenue: any): Venue => ({
    id: apiVenue.id,
    name: apiVenue.name,
    latitude: apiVenue.latitude ?? 48.8566,
    longitude: apiVenue.longitude ?? 2.3522,
    address: apiVenue.street_address || apiVenue.address || "",
    distance: apiVenue.distance ? `${apiVenue.distance.toFixed(1)} km` : "0.5 km",
    image: apiVenue.photos?.[0]?.url || apiVenue.image_url || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
    rating: apiVenue.rating ?? 4.5,
    tags: apiVenue.amenities || apiVenue.tags || ["Bar sportif"],
    priceLevel: apiVenue.price_range || "€€",
    isOpen: true,
    matches: [],
});

// Transform API match to VenueMatch format
const transformApiMatch = (apiMatch: any): VenueMatch => {
    const scheduledAt = new Date(apiMatch.scheduled_at || apiMatch.date);
    const homeTeam = apiMatch.homeTeam?.name || apiMatch.homeTeam || "Home";
    const awayTeam = apiMatch.awayTeam?.name || apiMatch.awayTeam || "Away";
    
    return {
        id: apiMatch.id,
        date: scheduledAt.getDate().toString(),
        month: scheduledAt.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase(),
        league: apiMatch.league?.name || apiMatch.competition || "Ligue",
        team1: homeTeam,
        team2: awayTeam,
        time: scheduledAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        team1Color: "#1e3a8a",
        team2Color: "#dc2626",
        bgImage: apiMatch.thumbnail,
    };
};

// Transform API match to SearchMatchResult format
const transformToSearchMatch = (apiMatch: any): SearchMatchResult => {
    const scheduledAtRaw = apiMatch.scheduled_at || apiMatch.date;
    const scheduledAtDate = new Date(scheduledAtRaw || Date.now());
    const dateIso = scheduledAtDate.toISOString().split("T")[0];
    const scheduledAt = scheduledAtDate.toISOString();
    const homeTeam = apiMatch.homeTeam?.name || apiMatch.homeTeam || "Home";
    const awayTeam = apiMatch.awayTeam?.name || apiMatch.awayTeam || "Away";
    
    return {
        id: apiMatch.id,
        league: apiMatch.league?.name || apiMatch.competition || "Ligue",
        timeLabel: scheduledAtDate.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }),
        kickoffTime: scheduledAtDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        statusLabel: scheduledAtDate > new Date() ? "À venir" : "Terminé",
        scheduledAt,
        dateIso,
        stadium: "Stade",
        city: "Paris",
        heroImage: apiMatch.thumbnail || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800",
        home: {
            badge: homeTeam.slice(0, 3).toUpperCase(),
            name: homeTeam,
            color: "#1e3a8a",
        },
        away: {
            badge: awayTeam.slice(0, 3).toUpperCase(),
            name: awayTeam,
            color: "#dc2626",
        },
    };
};

// Transform API venue to SearchResult format
const transformToSearchResult = (apiVenue: any): SearchResult => ({
    id: apiVenue.id,
    name: apiVenue.name,
    tag: apiVenue.type || "Bar",
    distance: apiVenue.distance ? `${apiVenue.distance.toFixed(1)} km` : "0.5 km",
    isLive: false,
    image: apiVenue.photos?.[0]?.url || apiVenue.image_url || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
    rating: apiVenue.rating ?? 4.5,
    priceLevel: apiVenue.price_range || "€€",
});

// Transform API reservation to Booking format
const transformApiReservation = (apiRes: any): Booking => {
    const venueMatch = apiRes.venueMatch;
    const match = venueMatch?.match;
    const venue = venueMatch?.venue;
    const scheduledAt = match?.scheduled_at ? new Date(match.scheduled_at) : new Date();
    const homeTeam = match?.homeTeam?.name || "Home";
    const awayTeam = match?.awayTeam?.name || "Away";
    
    return {
        id: apiRes.id,
        status: apiRes.status === "confirmed" ? "confirmed" : "pending",
        venue: venue?.name || "Venue",
        match: `${homeTeam} vs ${awayTeam}`,
        date: scheduledAt.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
        people: `${apiRes.party_size} personne${apiRes.party_size > 1 ? "s" : ""}`,
        peopleCount: apiRes.party_size,
        location: [venue?.street_address, venue?.city].filter(Boolean).join(", ") || "",
        reference: apiRes.id.slice(0, 8).toUpperCase(),
        dateShort: scheduledAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        time: scheduledAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        qrCode: apiRes.qr_code || "",
        image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
    };
};

export const mobileApi = {
    async fetchVenues(): Promise<Venue[]> {
        try {
            const apiVenues = await apiService.getVenues();
            return apiVenues.map(transformApiVenue);
        } catch (error) {
            console.warn("API fetchVenues failed, returning empty array", error);
            return [];
        }
    },

    async fetchVenuesInArea(
        latitude: number,
        longitude: number,
        latitudeDelta: number,
        longitudeDelta: number
    ): Promise<Venue[]> {
        try {
            // Calculate radius from delta (approximate conversion)
            // 1 degree latitude ≈ 111km, use the larger delta for radius
            const latKm = latitudeDelta * 111;
            const lngKm = longitudeDelta * 111 * Math.cos(latitude * Math.PI / 180);
            const radiusKm = Math.max(latKm, lngKm) / 2;
            // Convert to meters and cap at reasonable max (50km)
            const radiusMeters = Math.min(radiusKm * 1000, 50000);
            
            const apiVenues = await apiService.getNearbyVenues(latitude, longitude, radiusMeters);
            return apiVenues.map(transformApiVenue);
        } catch (error) {
            console.warn("API fetchVenuesInArea failed, returning empty array", error);
            return [];
        }
    },

    async fetchVenueById(id: string): Promise<Venue | null> {
        try {
            const apiVenue = await apiService.getVenueDetails(id);
            if (!apiVenue) return null;
            
            const venue = transformApiVenue(apiVenue);
            
            // Try to get matches for this venue
            try {
                const matches = await apiService.getMatchesByVenue(id);
                venue.matches = (matches || []).map(transformApiMatch);
            } catch {
                venue.matches = [];
            }
            
            return venue;
        } catch (error) {
            console.warn("API fetchVenueById failed", error);
            return null;
        }
    },

    async fetchUpcomingMatches(): Promise<VenueMatch[]> {
        try {
            const apiMatches = await apiService.getUpcomingMatches();
            return apiMatches.map(transformApiMatch);
        } catch (error) {
            console.warn("API fetchUpcomingMatches failed", error);
            return [];
        }
    },

    async fetchSearchData(): Promise<{
        trends: SearchTrend[];
        recentSearches: string[];
        results: SearchResult[];
        matchResults: SearchMatchResult[];
    }> {
        try {
            const [apiVenues, apiMatches] = await Promise.all([
                apiService.getVenues(),
                apiService.getUpcomingMatches(),
            ]);
            
            return {
                trends: mockSearchTrends,
                recentSearches: mockRecentSearches,
                results: apiVenues.map(transformToSearchResult),
                matchResults: apiMatches.map(transformToSearchMatch),
            };
        } catch (error) {
            console.warn("API fetchSearchData failed", error);
            return {
                trends: mockSearchTrends,
                recentSearches: mockRecentSearches,
                results: [],
                matchResults: [],
            };
        }
    },

    async fetchBookings(): Promise<Booking[]> {
        try {
            const response = await apiService.getUserReservations();
            const apiReservations = response.data || [];
            return apiReservations.map(transformApiReservation);
        } catch (error) {
            console.warn("API fetchBookings failed", error);
            return [];
        }
    },

    async fetchFaqItems(): Promise<FaqItem[]> {
        // FAQ items are static content, keep mock for now
        return mockFaqItems;
    },

    async fetchMatchById(id: string): Promise<SearchMatchResult | null> {
        try {
            const apiMatch = await apiService.getMatchById(id);
            if (!apiMatch) return null;
            return transformToSearchMatch(apiMatch);
        } catch (error) {
            console.warn("API fetchMatchById failed", error);
            return null;
        }
    },

    async fetchProfile(): Promise<UserProfile> {
        try {
            const user = await apiService.getMe();
            return {
                name: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Utilisateur",
                email: user.email || "",
                badgeLabel: "Fan",
                avatar: user.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
                memberSince: "2024",
                tier: "Gold",
                first_name: user.first_name,
                last_name: user.last_name,
            };
        } catch (error) {
            console.warn("API fetchProfile failed", error);
            return {
                name: "Utilisateur",
                email: "",
                badgeLabel: "Fan",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
                memberSince: "2024",
                tier: "Gold",
            };
        }
    },

    async fetchReservationDates(): Promise<ReservationDate[]> {
        // Generate dates for the next 7 days (no API needed for date list)
        return generateDates();
    },

    async fetchMatchesForDate(dateIso: string): Promise<VenueMatch[]> {
        try {
            // Fetch upcoming matches and filter by date
            const apiMatches = await apiService.getUpcomingMatches();
            const targetDate = new Date(dateIso).toDateString();
            
            const filtered = apiMatches.filter((match: any) => {
                const matchDate = new Date(match.date).toDateString();
                return matchDate === targetDate;
            });
            
            return filtered.map(transformApiMatch);
        } catch (error) {
            console.warn("API fetchMatchesForDate failed", error);
            return [];
        }
    },

    async fetchMatchVenues(
        matchId: string,
        userLat?: number,
        userLng?: number,
        maxDistanceKm: number = 50
    ): Promise<Venue[]> {
        try {
            // Call API with location params if provided (for distance sorting)
            const matchVenues = await apiService.getMatchVenues(
                matchId,
                userLat,
                userLng,
                maxDistanceKm
            );
            
            // Transform API response to Venue format
            return matchVenues.map((mv: any) => ({
                id: mv.venue?.id || mv.venueMatchId,
                name: mv.venue?.name || "Unknown Venue",
                latitude: mv.venue?.latitude ?? 48.8566,
                longitude: mv.venue?.longitude ?? 2.3522,
                address: mv.venue?.street_address || mv.venue?.city || "",
                distance: mv.venue?.distance !== null && mv.venue?.distance !== undefined
                    ? `${mv.venue.distance} km`
                    : "N/A",
                image: mv.venue?.image_url || mv.venue?.cover_image_url || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
                rating: mv.venue?.rating ?? 4.5,
                tags: ["Bar sportif", "Diffuse ce match"],
                priceLevel: "€€",
                isOpen: true,
                matches: [],
                venueMatchId: mv.venueMatchId,
                availableCapacity: mv.availableCapacity,
                totalCapacity: mv.totalCapacity,
            }));
        } catch (error) {
            console.warn("API fetchMatchVenues failed", error);
            return [];
        }
    },
};
