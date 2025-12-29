import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserPreferences, Venue, Match, Reservation, Notification } from '../types';

interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  onboardingCompleted: boolean;

  // Venues
  venues: Venue[];
  selectedVenue: Venue | null;
  filteredVenues: Venue[];

  // Matches
  matches: Match[];
  selectedMatch: Match | null;
  matchFilters: {
    sortBy: 'date' | 'sport' | 'proximity';
    sortDirection: 'asc' | 'desc';
  };

  // Reservations
  reservations: Reservation[];

  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;

  // Filters
  filters: {
    sports: string[];
    ambiance: string[];
    foodTypes: string[];
    priceRange: string[];
    sortOption: 'distance' | 'rating' | null;
    sortDirection: 'asc' | 'desc';
  };

  // Actions
  setUser: (user: User | null) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  updateUserPreferences: (preferences: UserPreferences) => void;

  setVenues: (venues: Venue[]) => void;
  setSelectedVenue: (venue: Venue | null) => void;
  applyFilters: (filters: any) => void;
  setSortOrder: (sortOption: 'distance' | 'rating' | null, sortDirection: 'asc' | 'desc') => void;

  setMatches: (matches: Match[]) => void;
  setSelectedMatch: (match: Match | null) => void;
  applyMatchSorting: (sortBy: 'date' | 'sport' | 'proximity', sortDirection: 'asc' | 'desc') => void;

  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  cancelReservation: (id: string) => void;

  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  logout: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  onboardingCompleted: false,
  venues: [],
  selectedVenue: null,
  filteredVenues: [],
  matches: [],
  selectedMatch: null,
  matchFilters: {
    sortBy: 'date',
    sortDirection: 'asc',
  },
  reservations: [],
  notifications: [],
  unreadNotificationCount: 0,
  filters: {
    sports: [],
    ambiance: [],
    foodTypes: [],
    priceRange: [],
    sortOption: null,
    sortDirection: 'asc',
  },

  // Actions
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      AsyncStorage.removeItem('user');
    }
  },

  setOnboardingCompleted: async (completed) => {
    set({ onboardingCompleted: completed });
    await AsyncStorage.setItem('onboardingCompleted', JSON.stringify(completed));
  },

  updateUserPreferences: (preferences) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, preferences };
      set({ user: updatedUser });
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  },

  setVenues: (venues) => set({ venues, filteredVenues: venues }),

  setSelectedVenue: (venue) => set({ selectedVenue: venue }),

  applyFilters: (newFilters) => {
    set((state) => {
      const updatedFilters = { ...state.filters, ...newFilters };
      let filtered = [...state.venues];

      if (updatedFilters.sports.length > 0) {
        filtered = filtered.filter(v =>
          v.tags.some(tag => updatedFilters.sports.includes(tag))
        );
      }

      if (updatedFilters.ambiance.length > 0) {
        filtered = filtered.filter(v =>
          v.tags.some(tag => updatedFilters.ambiance.includes(tag))
        );
      }

      if (updatedFilters.foodTypes.length > 0) {
        filtered = filtered.filter(v =>
          v.tags.some(tag => updatedFilters.foodTypes.includes(tag))
        );
      }

      if (updatedFilters.priceRange.length > 0) {
        filtered = filtered.filter(v =>
          updatedFilters.priceRange.includes(v.priceRange)
        );
      }

      // Apply sorting
      if (updatedFilters.sortOption) {
        filtered.sort((a, b) => {
          if (updatedFilters.sortOption === 'distance') {
            const distA = a.distance || Infinity;
            const distB = b.distance || Infinity;
            return updatedFilters.sortDirection === 'asc' ? distA - distB : distB - distA;
          } else if (updatedFilters.sortOption === 'rating') {
            return updatedFilters.sortDirection === 'asc' ? a.rating - b.rating : b.rating - a.rating;
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

      if (matchFilters.sortBy === 'date') {
        sortedMatches.sort((a, b) => {
          const dateA = a.date.getTime();
          const dateB = b.date.getTime();
          return matchFilters.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
      } else if (matchFilters.sortBy === 'sport') {
        sortedMatches.sort((a, b) => {
          return matchFilters.sortDirection === 'asc'
            ? a.sport.localeCompare(b.sport)
            : b.sport.localeCompare(a.sport);
        });
      } else if (matchFilters.sortBy === 'proximity') {
        // TODO: Implement proximity sorting for matches (requires more data)
        // For now, it will just maintain the current order or be alphabetical
        sortedMatches.sort((a, b) => {
          return matchFilters.sortDirection === 'asc'
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

      if (newMatchFilters.sortBy === 'date') {
        sortedMatches.sort((a, b) => {
          const dateA = a.date.getTime();
          const dateB = b.date.getTime();
          return newMatchFilters.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
      } else if (newMatchFilters.sortBy === 'sport') {
        sortedMatches.sort((a, b) => {
          return newMatchFilters.sortDirection === 'asc'
            ? a.sport.localeCompare(b.sport)
            : b.sport.localeCompare(a.sport);
        });
      } else if (newMatchFilters.sortBy === 'proximity') {
        // TODO: Implement proximity sorting for matches (requires more data)
        sortedMatches.sort((a, b) => {
          return newMatchFilters.sortDirection === 'asc'
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
    AsyncStorage.setItem('reservations', JSON.stringify(updated));
  },

  updateReservation: (id, updates) => {
    const { reservations } = get();
    const updated = reservations.map(r =>
      r.id === id ? { ...r, ...updates } : r
    );
    set({ reservations: updated });
    AsyncStorage.setItem('reservations', JSON.stringify(updated));
  },

  cancelReservation: (id) => {
    const { reservations } = get();
    const updated = reservations.map(r =>
      r.id === id ? { ...r, status: 'cancelled' as const } : r
    );
    set({ reservations: updated });
    AsyncStorage.setItem('reservations', JSON.stringify(updated));
  },

  addNotification: (notification) => {
    const { notifications } = get();
    const updated = [notification, ...notifications];
    const unread = updated.filter(n => !n.read).length;
    set({ notifications: updated, unreadNotificationCount: unread });
  },

  markNotificationAsRead: (id) => {
    const { notifications } = get();
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    const unread = updated.filter(n => !n.read).length;
    set({ notifications: updated, unreadNotificationCount: unread });
  },

  clearNotifications: () => {
    set({ notifications: [], unreadNotificationCount: 0 });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      onboardingCompleted: false,
      venues: [],
      selectedVenue: null,
      filteredVenues: [],
      matches: [],
      selectedMatch: null,
      reservations: [],
      notifications: [],
      unreadNotificationCount: 0,
      filters: {
        sports: [],
        ambiance: [],
        foodTypes: [],
        priceRange: [],
        sortOption: null,
        sortDirection: 'asc',
      },
    });
    AsyncStorage.multiRemove(['user', 'onboardingCompleted', 'reservations']);
  },
}));

// Initialize store from AsyncStorage
export const initializeStore = async () => {
  try {
    const [userStr, onboardingStr, reservationsStr] = await AsyncStorage.multiGet([
      'user',
      'onboardingCompleted',
      'reservations',
    ]);

    const user = userStr[1] ? JSON.parse(userStr[1]) : null;
    const onboarding = onboardingStr[1] ? JSON.parse(onboardingStr[1]) : false;
    const reservations = reservationsStr[1] ? JSON.parse(reservationsStr[1]) : [];

    // Parse date strings back into Date objects for reservations if needed
    const parsedReservations = reservations.map((res: any) => ({
      ...res,
      date: res.date ? new Date(res.date) : res.date,
    }));

    useStore.setState({
      user,
      isAuthenticated: !!user,
      onboardingCompleted: onboarding,
      reservations: parsedReservations,
    });
  } catch (error) {
    console.error('Error initializing store:', error);
  }
};
