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
    distance: apiVenue.distance !== undefined && apiVenue.distance !== null ? `${Number(apiVenue.distance).toFixed(1)} km` : "0.5 km",
    image: apiVenue.cover_image_url || apiVenue.photos?.[0]?.url || apiVenue.image_url || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
    rating: Number(apiVenue.average_rating ?? apiVenue.rating ?? 4.5),
    tags: apiVenue.amenities || apiVenue.tags || ["Bar sportif"],
    priceLevel: apiVenue.price_range || apiVenue.priceLevel || "€€",
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
    distance: apiVenue.distance !== undefined && apiVenue.distance !== null ? `${Number(apiVenue.distance).toFixed(1)} km` : "",
    isLive: false,
    image: apiVenue.cover_image_url || apiVenue.photos?.[0]?.url || apiVenue.image_url || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800",
    rating: Number(apiVenue.average_rating ?? apiVenue.rating ?? 4.5),
    priceLevel: apiVenue.price_range || apiVenue.priceLevel || "€€",
    latitude: apiVenue.latitude != null ? Number(apiVenue.latitude) : undefined,
    longitude: apiVenue.longitude != null ? Number(apiVenue.longitude) : undefined,
});

// Transform API reservation to Booking format
const transformApiReservation = (apiRes: any): Booking => {
    const venueMatch = apiRes.venueMatch;
    const match = venueMatch?.match;
    const venue = venueMatch?.venue;
    const scheduledAt = match?.scheduled_at ? new Date(match.scheduled_at) : new Date();
    const homeTeam = match?.homeTeam?.name || match?.home_team?.name || "Home";
    const awayTeam = match?.awayTeam?.name || match?.away_team?.name || "Away";
    
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

    /**
     * Paginated search with type filtering - uses backend pagination
     * @param query - Search query string
     * @param type - Filter type: "all" | "matches" | "venues"
     * @param page - Page number (1-indexed)
     * @param limit - Items per page (default 15)
     * @param filterDate - Optional date string (ISO format) to filter matches
     * @param lat - Optional user latitude for geo-filtering
     * @param lng - Optional user longitude for geo-filtering
     */
    async searchPaginated(
        query: string,
        type: "all" | "matches" | "venues" = "all",
        page: number = 1,
        limit: number = 15,
        filterDate?: string,
        lat?: number,
        lng?: number
    ): Promise<{
        venues: SearchResult[];
        matches: SearchMatchResult[];
        hasMoreVenues: boolean;
        hasMoreMatches: boolean;
        totalVenues: number;
        totalMatches: number;
    }> {
        try {
            // Call backend paginated search endpoint
            const response = await apiService.searchPaginated({
                q: query,
                type,
                page,
                limit,
                date: filterDate,
                lat,
                lng,
                radius_km: 50, // Default 50km radius
            });

            // Transform backend response to frontend format
            const venues = (response.venues || []).map(transformToSearchResult);
            const matches = (response.matches || []).map(transformToSearchMatch);

            return {
                venues,
                matches,
                hasMoreVenues: response.pagination?.hasMoreVenues ?? false,
                hasMoreMatches: response.pagination?.hasMoreMatches ?? false,
                totalVenues: response.pagination?.totalVenues ?? venues.length,
                totalMatches: response.pagination?.totalMatches ?? matches.length,
            };
        } catch (error) {
            console.warn("API searchPaginated failed, falling back to client-side", error);
            
            // Fallback to client-side filtering if backend fails
            try {
                const shouldFetchVenues = type === "all" || type === "venues";
                const shouldFetchMatches = type === "all" || type === "matches";

                const [apiVenues, apiMatches] = await Promise.all([
                    shouldFetchVenues ? apiService.getVenues() : Promise.resolve([]),
                    shouldFetchMatches ? apiService.getUpcomingMatches() : Promise.resolve([]),
                ]);

                const queryLower = query.toLowerCase().trim();
                let filteredVenues = apiVenues;
                let filteredMatches = apiMatches;

                if (queryLower) {
                    filteredVenues = apiVenues.filter((v: any) => 
                        v.name?.toLowerCase().includes(queryLower) ||
                        v.type?.toLowerCase().includes(queryLower) ||
                        v.city?.toLowerCase().includes(queryLower)
                    );
                    filteredMatches = apiMatches.filter((m: any) => {
                        const homeName = m.homeTeam?.name || m.homeTeam || "";
                        const awayName = m.awayTeam?.name || m.awayTeam || "";
                        const league = m.league?.name || m.competition || "";
                        return homeName.toLowerCase().includes(queryLower) ||
                               awayName.toLowerCase().includes(queryLower) ||
                               league.toLowerCase().includes(queryLower);
                    });
                }

                if (filterDate) {
                    filteredMatches = filteredMatches.filter((m: any) => {
                        const matchDate = new Date(m.scheduled_at || m.date);
                        const filterDateObj = new Date(filterDate);
                        return matchDate.getFullYear() === filterDateObj.getFullYear() &&
                               matchDate.getMonth() === filterDateObj.getMonth() &&
                               matchDate.getDate() === filterDateObj.getDate();
                    });
                }

                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;

                return {
                    venues: filteredVenues.slice(startIndex, endIndex).map(transformToSearchResult),
                    matches: filteredMatches.slice(startIndex, endIndex).map(transformToSearchMatch),
                    hasMoreVenues: endIndex < filteredVenues.length,
                    hasMoreMatches: endIndex < filteredMatches.length,
                    totalVenues: filteredVenues.length,
                    totalMatches: filteredMatches.length,
                };
            } catch (fallbackError) {
                console.warn("Fallback search also failed", fallbackError);
                return {
                    venues: [],
                    matches: [],
                    hasMoreVenues: false,
                    hasMoreMatches: false,
                    totalVenues: 0,
                    totalMatches: 0,
                };
            }
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

    // Favourites
    async fetchFavoriteVenues(): Promise<SearchResult[]> {
        try {
            const favorites = await apiService.getFavoriteVenues();
            // The API returns an array of favorite objects { id, venue: { ... } }
            // We need to extract and transform the venue part
            return favorites.map((fav: any) => {
                const venueData = fav.venue || fav;
                return transformToSearchResult(venueData);
            });
        } catch (error) {
            console.warn("API fetchFavoriteVenues failed", error);
            return [];
        }
    },

    async addFavorite(venueId: string): Promise<boolean> {
        try {
            await apiService.addVenueToFavorites(venueId);
            return true;
        } catch (error) {
            console.warn("API addFavorite failed", error);
            return false;
        }
    },

    async removeFavorite(venueId: string): Promise<boolean> {
        try {
            await apiService.removeVenueFromFavorites(venueId);
            return true;
        } catch (error) {
            console.warn("API removeFavorite failed", error);
            return false;
        }
    },

    async checkFavorite(venueId: string): Promise<boolean> {
        try {
            return await apiService.checkVenueFavorite(venueId);
        } catch (error) {
            console.warn("API checkFavorite failed", error);
            return false;
        }
    },

    async reportBug(data: {
        userName: string;
        userEmail: string;
        description: string;
        metadata?: any;
    }): Promise<boolean> {
        try {
            await apiService.post("/support/bug-report", {
                user_name: data.userName,
                user_email: data.userEmail,
                description: data.description,
                metadata: data.metadata,
            });
            return true;
        } catch (error) {
            console.error("API reportBug failed", error);
            return false;
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
                rating: Number(mv.venue?.rating ?? 4.5),
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
