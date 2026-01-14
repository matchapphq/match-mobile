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
} from "../types/testApi.types";

export type { Venue, VenueMatch, SearchTrend, SearchResult, SearchMatchResult, Booking, FaqItem, UserProfile, ReservationDate };
import {
    mockVenues,
    mockProfile,
    mockSearchTrends,
    mockRecentSearches,
    mockSearchResults,
    mockSearchMatchResults,
    mockBookings,
    mockFaqItems,
    generateDates,
    getMatchesForDate,
} from "../lib/mockData";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const reservationDates = generateDates();
const reservationMatches = reservationDates.reduce<Record<string, VenueMatch[]>>((acc, date) => {
    acc[date.isoDate] = getMatchesForDate(date.isoDate);
    return acc;
}, {});

export const testApi = {
    async fetchVenues(): Promise<Venue[]> {
        await delay();
        return mockVenues;
    },
    async fetchVenueById(id: string): Promise<Venue | null> {
        await delay(200);
        return mockVenues.find((venue) => venue.id === id) ?? null;
    },
    async fetchUpcomingMatches(): Promise<VenueMatch[]> {
        await delay(350);
        return mockVenues.flatMap((venue) => venue.matches);
    },
    async fetchSearchData(): Promise<{
        trends: SearchTrend[];
        recentSearches: string[];
        results: SearchResult[];
        matchResults: SearchMatchResult[];
    }> {
        await delay(400);
        return {
            trends: mockSearchTrends,
            recentSearches: mockRecentSearches,
            results: mockSearchResults,
            matchResults: mockSearchMatchResults,
        };
    },
    async fetchBookings(): Promise<Booking[]> {
        await delay(500);
        return mockBookings;
    },
    async fetchFaqItems(): Promise<FaqItem[]> {
        await delay(200);
        return mockFaqItems;
    },
    async fetchMatchById(id: string): Promise<SearchMatchResult | null> {
        await delay(250);
        return mockSearchMatchResults.find((match) => match.id === id) ?? null;
    },
    async fetchProfile(): Promise<UserProfile> {
        await delay(250);
        return mockProfile;
    },
    async fetchReservationDates() {
        await delay(200);
        return reservationDates;
    },
    async fetchMatchesForDate(dateIso: string) {
        await delay(350);
        return reservationMatches[dateIso] ?? getMatchesForDate(dateIso);
    },
};
