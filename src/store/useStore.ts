import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance, ColorSchemeName } from 'react-native';
import { DARK_THEME, LIGHT_THEME, ThemeColors } from "../constants/colors";
import {
    User,
    UserPreferences,
    Venue,
    Match,
    Reservation,
    Notification,
} from "../types";
import { apiService, ApiReservation } from "../services/api";
import { tokenStorage } from "../utils/tokenStorage";

// Transform API reservation to mobile Reservation type
export const transformApiReservation = (
    apiRes: ApiReservation,
    qrCode?: string,
): Reservation => {
    const venue = apiRes.venueMatch?.venue;
    const match = apiRes.venueMatch?.match;
    const scheduledAt = match?.scheduled_at
        ? new Date(match.scheduled_at)
        : new Date();

    let status: "pending" | "confirmed" | "cancelled" = "pending";
    if (apiRes.status === "confirmed") status = "confirmed";
    else if (apiRes.status === "canceled" || apiRes.status === "cancelled")
        status = "cancelled";

    return {
        id: apiRes.id,
        venueId: venue?.id || apiRes.venue_match_id,
        venueName: venue?.name || "Venue",
        venueAddress:
            [venue?.street_address, venue?.city].filter(Boolean).join(", ") ||
            undefined,
        date: scheduledAt,
        time: scheduledAt.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
        }),
        numberOfPeople: apiRes.party_size,
        matchId: match?.id,
        matchTitle: match
            ? `${match.homeTeam?.name || "TBD"} vs ${match.awayTeam?.name || "TBD"}`
            : undefined,
        status,
        conditions: apiRes.special_requests || undefined,
        qrCode: qrCode || apiRes.qr_code || undefined,
    };
};

interface AppState {
    // User
    user: User | null;
    isAuthenticated: boolean;
    onboardingCompleted: boolean;

    // Theme
    themeMode: 'light' | 'dark' | 'system';
    computedTheme: 'light' | 'dark';
    colors: ThemeColors;

    // Venues
    venues: Venue[];
    selectedVenue: Venue | null;
    filteredVenues: Venue[];

    // Matches
    matches: Match[];
    selectedMatch: Match | null;
    matchFilters: {
        sortBy: "date" | "sport" | "proximity";
        sortDirection: "asc" | "desc";
    };

    // Reservations
    reservations: Reservation[];

    // Favourites
    favouriteVenueIds: Set<string>;

    // Notifications
    notifications: Notification[];
    unreadNotificationCount: number;

    // Filters
    filters: {
        sports: string[];
        ambiance: string[];
        foodTypes: string[];
        priceRange: string[];
        sortOption: "distance" | "rating" | null;
        sortDirection: "asc" | "desc";
    };

    // Actions
    setUser: (user: User | null) => void;
    setOnboardingCompleted: (completed: boolean) => void;
    updateUserPreferences: (preferences: UserPreferences) => void;
    updateUser: (updates: Partial<User>) => Promise<void>;
    fetchUserProfile: () => Promise<void>;
    refreshUserProfile: () => Promise<void>;
    setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
    updateComputedTheme: () => void;

    setVenues: (venues: Venue[]) => void;
    setSelectedVenue: (venue: Venue | null) => void;
    applyFilters: (filters: any) => void;
    setSortOrder: (
        sortOption: "distance" | "rating" | null,
        sortDirection: "asc" | "desc",
    ) => void;

    setMatches: (matches: Match[]) => void;
    setSelectedMatch: (match: Match | null) => void;
    applyMatchSorting: (
        sortBy: "date" | "sport" | "proximity",
        sortDirection: "asc" | "desc",
    ) => void;

    addReservation: (reservation: Reservation) => void;
    updateReservation: (id: string, updates: Partial<Reservation>) => void;
    cancelReservation: (id: string) => void;
    removeReservation: (id: string) => void;

    // Favourites Actions
    toggleFavourite: (venueId: string) => Promise<boolean>;
    isFavourite: (venueId: string) => boolean;
    fetchFavourites: () => Promise<void>;
    checkAndCacheFavourite: (venueId: string) => Promise<boolean>;

    // Reservation API Actions
    fetchReservations: () => Promise<void>;
    cancelReservationApi: (id: string, reason?: string) => Promise<boolean>;
    getReservationWithQR: (id: string) => Promise<Reservation | null>;

    addNotification: (notification: Notification) => void;
    markNotificationAsRead: (id: string) => void;
    clearNotifications: () => void;

    // API Actions
    fetchVenues: (filters?: any) => Promise<void>;
    fetchNearbyVenues: (
        lat: number,
        lng: number,
        radius?: number,
    ) => Promise<void>;
    fetchMatches: (filters?: any) => Promise<void>;
    fetchUpcomingMatches: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (data: any) => Promise<boolean>;
    refreshReservations: () => Promise<void>;

    // Loading states
    isLoading: boolean;
    error: string | null;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    logout: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    onboardingCompleted: false,
    themeMode: 'dark', // Default to dark initially
    computedTheme: 'dark',
    colors: DARK_THEME,
    venues: [],
    selectedVenue: null,
    filteredVenues: [],
    matches: [],
    selectedMatch: null,
    matchFilters: {
        sortBy: "date",
        sortDirection: "asc",
    },
    reservations: [],
    favouriteVenueIds: new Set<string>(),
    notifications: [],
    unreadNotificationCount: 0,
    filters: {
        sports: [],
        ambiance: [],
        foodTypes: [],
        priceRange: [],
        sortOption: null,
        sortDirection: "asc",
    },
    isLoading: false,
    error: null,

    // Loading state actions
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // Favourites
    toggleFavourite: async (venueId: string) => {
        const { favouriteVenueIds } = get();
        const isFav = favouriteVenueIds.has(venueId);
        
        // Optimistic update
        const newSet = new Set(favouriteVenueIds);
        if (isFav) {
            newSet.delete(venueId);
        } else {
            newSet.add(venueId);
        }
        set({ favouriteVenueIds: newSet });

        try {
            const { apiService } = await import('../services/api');
            if (isFav) {
                await apiService.removeVenueFromFavorites(venueId);
            } else {
                await apiService.addVenueToFavorites(venueId);
            }
            return !isFav;
        } catch (error) {
            // Revert on failure
            const revertSet = new Set(get().favouriteVenueIds);
            if (isFav) {
                revertSet.add(venueId);
            } else {
                revertSet.delete(venueId);
            }
            set({ favouriteVenueIds: revertSet });
            console.warn('Failed to toggle favourite:', error);
            return isFav;
        }
    },

    isFavourite: (venueId: string) => {
        return get().favouriteVenueIds.has(venueId);
    },

    fetchFavourites: async () => {
        try {
            const { apiService } = await import('../services/api');
            const venues = await apiService.getFavoriteVenues();
            const ids = new Set(venues.map((v: any) => v.id));
            set({ favouriteVenueIds: ids });
        } catch (error) {
            console.warn('Failed to fetch favourites:', error);
        }
    },

    checkAndCacheFavourite: async (venueId: string) => {
        try {
            const { apiService } = await import('../services/api');
            const isFav = await apiService.checkVenueFavorite(venueId);
            const newSet = new Set(get().favouriteVenueIds);
            if (isFav) {
                newSet.add(venueId);
            } else {
                newSet.delete(venueId);
            }
            set({ favouriteVenueIds: newSet });
            return isFav;
        } catch {
            return false;
        }
    },

    // API Actions
    fetchVenues: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const venues = await apiService.getVenues(filters);
            set({ venues, filteredVenues: venues, isLoading: false });
        } catch (error) {
            console.log("API error, using mock data:", error);
            set({
                venues: mockData.venues,
                filteredVenues: mockData.venues,
                isLoading: false,
            });
        }
    },

    fetchNearbyVenues: async (lat, lng, radius = 5000) => {
        set({ isLoading: true, error: null });
        try {
            const venues = await apiService.getNearbyVenues(lat, lng, radius);
            set({ venues, filteredVenues: venues, isLoading: false });
        } catch (error) {
            console.log("API error, using mock data:", error);
            set({
                venues: mockData.venues,
                filteredVenues: mockData.venues,
                isLoading: false,
            });
        }
    },

    fetchMatches: async (filters) => {
        set({ isLoading: true, error: null });
        try {
            const matches = await apiService.getMatches(filters);
            set({ matches, isLoading: false });
        } catch (error) {
            console.log("API error, using mock data:", error);
            set({ matches: mockData.matches, isLoading: false });
        }
    },

    fetchUpcomingMatches: async () => {
        set({ isLoading: true, error: null });
        try {
            const matches = await apiService.getUpcomingMatches();
            set({ matches, isLoading: false });
        } catch (error) {
            console.log("API error, using mock data:", error);
            set({ matches: mockData.matches, isLoading: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.login(email, password);
            const { token, refresh_token, user } = response;
            
            await tokenStorage.setTokens(token, refresh_token);
            await AsyncStorage.setItem("user", JSON.stringify(user));
            
            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });

            // Trigger background refresh to get full profile (bio, created_at, etc)
            get().refreshUserProfile();

            return true;
        } catch (error: any) {
            set({ error: error.message || "Login failed", isLoading: false });
            return false;
        }
    },

    signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const payload = {
                email: data.email,
                firstName: data.firstName,
                username: data.username,
                lastName: data.lastName,
                password: data.password,
                role: data.role ?? "user",
                referralCode: data.referralCode?.trim() || undefined,
                phone: data.phone || data.phoneNumber || undefined,
                fav_sports: data.fav_sports ?? data.sports ?? [],
                fav_team_ids: data.fav_team_ids ?? data.favoriteTeams ?? [],
                ambiances: data.ambiances ?? data.ambiance ?? [],
                venue_types: data.venue_types ?? data.foodTypes ?? [],
                budget: data.budget ?? data.priceRange ?? undefined,
                home_lat: data.home_lat ?? data.lat ?? undefined,
                home_lng: data.home_lng ?? data.lng ?? undefined,
            };

            const response = await apiService.signup(payload);
            const { token, refresh_token, user } = response;
            if (!token || !user) {
                throw new Error("Signup response missing data");
            }

            await tokenStorage.setTokens(token, refresh_token);
            await AsyncStorage.setItem("user", JSON.stringify(user));
            await AsyncStorage.setItem("onboardingCompleted", "true");

            set({
                user,
                isAuthenticated: true,
                onboardingCompleted: true,
                isLoading: false,
            });
            return true;
        } catch (error: any) {
            console.error("Signup failed:", error);
            set({
                error:
                    error?.response?.data?.error ||
                    error.message ||
                    "Signup failed",
                isLoading: false,
            });
            return false;
        }
    },

    // Actions
    setUser: (user) => {
        set({ user, isAuthenticated: !!user });
        if (user) {
            AsyncStorage.setItem("user", JSON.stringify(user));
        } else {
            AsyncStorage.removeItem("user");
        }
    },

    setOnboardingCompleted: async (completed) => {
        set({ onboardingCompleted: completed });
        await AsyncStorage.setItem(
            "onboardingCompleted",
            JSON.stringify(completed),
        );
    },

    setThemeMode: (mode) => {
        const systemTheme = Appearance.getColorScheme() || 'dark';
        const newComputed = mode === 'system' ? systemTheme : mode;

        set({
            themeMode: mode,
            computedTheme: newComputed,
            colors: newComputed === 'light' ? LIGHT_THEME : DARK_THEME
        });
        AsyncStorage.setItem("themeMode", mode);
    },

    updateComputedTheme: () => {
        const { themeMode } = get();
        if (themeMode === 'system') {
            const systemTheme = Appearance.getColorScheme() || 'dark';
            set({
                computedTheme: systemTheme,
                colors: systemTheme === 'light' ? LIGHT_THEME : DARK_THEME
            });
        }
    },

    updateUserPreferences: (preferences) => {
        const { user } = get();
        if (user) {
            const updatedUser = { ...user, preferences };
            set({ user: updatedUser });
            AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        }
    },

    updateUser: async (updates) => {
        const { user } = get();
        if (user) {
            set({ isLoading: true, error: null });
            try {
                const updatedUser = await apiService.updateProfile(updates);
                // Merge with existing user data to ensure all fields are preserved
                const finalUser = { ...user, ...updatedUser };
                
                // Keep nested user object in sync if it exists
                if (finalUser.user) {
                    finalUser.user = { ...finalUser.user, ...updatedUser };
                }

                set({ user: finalUser, isLoading: false });
                await AsyncStorage.setItem("user", JSON.stringify(finalUser));

                // Optional: Trigger a background refresh to be absolutely sure we're in sync
                get().refreshUserProfile();
            } catch (error: any) {
                set({ 
                    error: error?.response?.data?.error || error.message || "Failed to update user", 
                    isLoading: false 
                });
                throw error;
            }
        }
    },

    fetchUserProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const user = await apiService.getMe();
            set({ user, isAuthenticated: !!user, isLoading: false });
            if (user) {
                await AsyncStorage.setItem("user", JSON.stringify(user));
            }
        } catch (error: any) {
            console.error("Error fetching user profile:", error);
            set({ isLoading: false });
        }
    },

    refreshUserProfile: async () => {
        try {
            const user = await apiService.getMe();
            if (user) {
                const currentUser = get().user;
                // Preserve local nested structure if it exists
                const finalUser = { ...currentUser, ...user };
                if (currentUser?.user) {
                    finalUser.user = { ...currentUser.user, ...user };
                }
                
                set({ user: finalUser });
                await AsyncStorage.setItem("user", JSON.stringify(finalUser));
            }
        } catch (error) {
            console.warn("Background profile refresh failed:", error);
        }
    },

    setVenues: (venues) => set({ venues, filteredVenues: venues }),

    setSelectedVenue: (venue) => set({ selectedVenue: venue }),

    applyFilters: (newFilters) => {
        set((state) => {
            const updatedFilters = { ...state.filters, ...newFilters };
            let filtered = [...state.venues];

            if (updatedFilters.sports.length > 0) {
                filtered = filtered.filter((v) =>
                    v.tags.some((tag) => updatedFilters.sports.includes(tag)),
                );
            }

            if (updatedFilters.ambiance.length > 0) {
                filtered = filtered.filter((v) =>
                    v.tags.some((tag) => updatedFilters.ambiance.includes(tag)),
                );
            }

            if (updatedFilters.foodTypes.length > 0) {
                filtered = filtered.filter((v) =>
                    v.tags.some((tag) =>
                        updatedFilters.foodTypes.includes(tag),
                    ),
                );
            }

            if (updatedFilters.priceRange.length > 0) {
                filtered = filtered.filter((v) =>
                    updatedFilters.priceRange.includes(v.priceRange),
                );
            }

            // Apply sorting
            if (updatedFilters.sortOption) {
                filtered.sort((a, b) => {
                    if (updatedFilters.sortOption === "distance") {
                        const distA = a.distance || Infinity;
                        const distB = b.distance || Infinity;
                        return updatedFilters.sortDirection === "asc"
                            ? distA - distB
                            : distB - distA;
                    } else if (updatedFilters.sortOption === "rating") {
                        return updatedFilters.sortDirection === "asc"
                            ? a.rating - b.rating
                            : b.rating - a.rating;
                    }
                    return 0;
                });
            }

            return { filters: updatedFilters, filteredVenues: filtered };
        });
    },

    setSortOrder: (sortOption, sortDirection) => {
        get().applyFilters({ sortOption, sortDirection });
    },

    setMatches: (newMatches) => {
        set((state) => {
            const { matchFilters } = state;
            let sortedMatches = [...newMatches]; // Start with the new matches

            if (matchFilters.sortBy === "date") {
                sortedMatches.sort((a, b) => {
                    const dateA = a.date.getTime();
                    const dateB = b.date.getTime();
                    return matchFilters.sortDirection === "asc"
                        ? dateA - dateB
                        : dateB - dateA;
                });
            } else if (matchFilters.sortBy === "sport") {
                sortedMatches.sort((a, b) => {
                    return matchFilters.sortDirection === "asc"
                        ? a.sport.localeCompare(b.sport)
                        : b.sport.localeCompare(a.sport);
                });
            } else if (matchFilters.sortBy === "proximity") {
                // TODO: Implement proximity sorting for matches (requires more data)
                // For now, it will just maintain the current order or be alphabetical
                sortedMatches.sort((a, b) => {
                    return matchFilters.sortDirection === "asc"
                        ? a.homeTeam.localeCompare(b.homeTeam)
                        : b.homeTeam.localeCompare(a.homeTeam);
                });
            }

            return { matches: sortedMatches };
        });
    },

    setSelectedMatch: (match) => set({ selectedMatch: match }),

    applyMatchSorting: (sortBy, sortDirection) => {
        set((state) => {
            const newMatchFilters = { sortBy, sortDirection };
            const currentMatches = [...state.matches]; // Get current matches to re-sort
            let sortedMatches = [...currentMatches];

            if (newMatchFilters.sortBy === "date") {
                sortedMatches.sort((a, b) => {
                    const dateA = a.date.getTime();
                    const dateB = b.date.getTime();
                    return newMatchFilters.sortDirection === "asc"
                        ? dateA - dateB
                        : dateB - dateA;
                });
            } else if (newMatchFilters.sortBy === "sport") {
                sortedMatches.sort((a, b) => {
                    return newMatchFilters.sortDirection === "asc"
                        ? a.sport.localeCompare(b.sport)
                        : b.sport.localeCompare(a.sport);
                });
            } else if (newMatchFilters.sortBy === "proximity") {
                // TODO: Implement proximity sorting for matches (requires more data)
                sortedMatches.sort((a, b) => {
                    return newMatchFilters.sortDirection === "asc"
                        ? a.homeTeam.localeCompare(b.homeTeam)
                        : b.homeTeam.localeCompare(a.homeTeam);
                });
            }

            return { matchFilters: newMatchFilters, matches: sortedMatches };
        });
    },

    addReservation: (reservation) => {
        const { reservations } = get();
        const updated = [...reservations, reservation];
        set({ reservations: updated });
        AsyncStorage.setItem("reservations", JSON.stringify(updated));
    },

    updateReservation: (id, updates) => {
        const { reservations } = get();
        const updated = reservations.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
        );
        set({ reservations: updated });
        AsyncStorage.setItem("reservations", JSON.stringify(updated));
    },

    cancelReservation: (id) => {
        const { reservations } = get();
        const updated = reservations.map((r) =>
            r.id === id ? { ...r, status: "cancelled" as const } : r,
        );
        set({ reservations: updated });
        AsyncStorage.setItem("reservations", JSON.stringify(updated));
    },
    removeReservation: (id) => {
        const { reservations } = get();
        const updated = reservations.filter((r) => r.id !== id);
        set({ reservations: updated });
        AsyncStorage.setItem("reservations", JSON.stringify(updated));
    },

    // Reservation API Actions
    fetchReservations: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.getUserReservations();
            const apiReservations = response.data || [];
            const transformed = apiReservations.map((r) =>
                transformApiReservation(r),
            );
            set({ reservations: transformed, isLoading: false });
            AsyncStorage.setItem("reservations", JSON.stringify(transformed));
        } catch (error) {
            console.error("Error fetching reservations:", error);
            set({ isLoading: false, error: "Failed to fetch reservations" });
        }
    },

    refreshReservations: async () => {
        try {
            const response = await apiService.getUserReservations();
            const apiReservations = response.data || [];
            const transformed = apiReservations.map((r) =>
                transformApiReservation(r),
            );
            set({ reservations: transformed });
            AsyncStorage.setItem("reservations", JSON.stringify(transformed));
        } catch (error) {
            console.error("Error refreshing reservations:", error);
        }
    },

    cancelReservationApi: async (id, reason) => {
        set({ isLoading: true, error: null });
        try {
            await apiService.cancelReservation(id, reason);
            const { reservations } = get();
            const updated = reservations.map((r) =>
                r.id === id ? { ...r, status: "cancelled" as const } : r,
            );
            set({ reservations: updated, isLoading: false });
            AsyncStorage.setItem("reservations", JSON.stringify(updated));
            return true;
        } catch (error) {
            console.error("Error canceling reservation:", error);
            set({ isLoading: false, error: "Failed to cancel reservation" });
            return false;
        }
    },

    getReservationWithQR: async (id) => {
        try {
            const response = await apiService.getReservationById(id);
            return transformApiReservation(
                response.reservation,
                response.qrCode,
            );
        } catch (error) {
            console.error("Error fetching reservation with QR:", error);
            return null;
        }
    },

    addNotification: (notification) => {
        const { notifications } = get();
        const updated = [notification, ...notifications];
        const unread = updated.filter((n) => !n.read).length;
        set({ notifications: updated, unreadNotificationCount: unread });
    },

    markNotificationAsRead: (id) => {
        const { notifications } = get();
        const updated = notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
        );
        const unread = updated.filter((n) => !n.read).length;
        set({ notifications: updated, unreadNotificationCount: unread });
    },

    clearNotifications: () => {
        set({ notifications: [], unreadNotificationCount: 0 });
    },

    logout: async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error("Logout API error:", error);
        }

        set({
            user: null,
            isAuthenticated: false,
            onboardingCompleted: false,
            themeMode: 'dark',
            computedTheme: 'dark',
            colors: DARK_THEME,
            venues: [],
            selectedVenue: null,
            filteredVenues: [],
            matches: [],
            selectedMatch: null,
            reservations: [],
            favouriteVenueIds: new Set<string>(),
            notifications: [],
            unreadNotificationCount: 0,
            filters: {
                sports: [],
                ambiance: [],
                foodTypes: [],
                priceRange: [],
                sortOption: null,
                sortDirection: "asc",
            },
        });
        
        await tokenStorage.clearTokens();
        
        AsyncStorage.multiRemove([
            "user",
            "onboardingCompleted",
            "reservations",
            // "authToken" // Handled by tokenStorage
        ]);
    },
}));

// Initialize store from AsyncStorage
export const initializeStore = async () => {
    try {
        const values = await AsyncStorage.multiGet([
            "user",
            "onboardingCompleted",
            "reservations",
            "themeMode"
        ]);

        const token = await tokenStorage.getAccessToken();

        const userStr = values.find(([key]) => key === "user")?.[1] || null;
        const onboardingStr =
            values.find(([key]) => key === "onboardingCompleted")?.[1] || null;
        const reservationsStr =
            values.find(([key]) => key === "reservations")?.[1] || null;
        // const token = values.find(([key]) => key === "authToken")?.[1] || null; // Handled above
        const themeModeStr = values.find(([key]) => key === "themeMode")?.[1] || 'dark';

        // Resolve theme
        const themeMode = (themeModeStr === 'light' || themeModeStr === 'dark' || themeModeStr === 'system')
            ? themeModeStr
            : 'dark';

        const systemTheme = Appearance.getColorScheme() || 'dark';
        const computedTheme = themeMode === 'system' ? systemTheme : themeMode;
        const colors = computedTheme === 'light' ? LIGHT_THEME : DARK_THEME;

        const user = userStr ? JSON.parse(userStr) : null;
        const onboarding = onboardingStr ? JSON.parse(onboardingStr) : false;
        const reservations = reservationsStr ? JSON.parse(reservationsStr) : [];

        // Parse date strings back into Date objects for reservations if needed
        const parsedReservations = reservations.map((res: any) => ({
            ...res,
            date: res.date ? new Date(res.date) : res.date,
        }));

        useStore.setState({
            user,
            isAuthenticated: !!token && !!user,
            onboardingCompleted: onboarding,
            reservations: parsedReservations,
            themeMode: themeMode as 'light' | 'dark' | 'system',
            computedTheme,
            colors,
        });

        // Trigger background refresh if we have a token
        if (token) {
            useStore.getState().refreshUserProfile();
            useStore.getState().fetchFavourites();
        }
    } catch (error) {
        console.error("Error initializing store:", error);
    }
};
