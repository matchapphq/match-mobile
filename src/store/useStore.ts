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
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  updateUserPreferences: (preferences: UserPreferences) => void;
  
  setVenues: (venues: Venue[]) => void;
  setSelectedVenue: (venue: Venue | null) => void;
  applyFilters: (filters: any) => void;
  
  setMatches: (matches: Match[]) => void;
  setSelectedMatch: (match: Match | null) => void;
  
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
  reservations: [],
  notifications: [],
  unreadNotificationCount: 0,
  filters: {
    sports: [],
    ambiance: [],
    foodTypes: [],
    priceRange: [],
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
  
  applyFilters: (filters) => {
    set({ filters });
    const { venues } = get();
    
    let filtered = [...venues];
    
    if (filters.sports.length > 0) {
      filtered = filtered.filter(v => 
        v.tags.some(tag => filters.sports.includes(tag))
      );
    }
    
    if (filters.ambiance.length > 0) {
      filtered = filtered.filter(v => 
        v.tags.some(tag => filters.ambiance.includes(tag))
      );
    }
    
    if (filters.foodTypes.length > 0) {
      filtered = filtered.filter(v => 
        v.tags.some(tag => filters.foodTypes.includes(tag))
      );
    }
    
    if (filters.priceRange.length > 0) {
      filtered = filtered.filter(v => 
        filters.priceRange.includes(v.priceRange)
      );
    }
    
    set({ filteredVenues: filtered });
  },
  
  setMatches: (matches) => set({ matches }),
  
  setSelectedMatch: (match) => set({ selectedMatch: match }),
  
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
    
    useStore.setState({
      user,
      isAuthenticated: !!user,
      onboardingCompleted: onboarding,
      reservations,
    });
  } catch (error) {
    console.error('Error initializing store:', error);
  }
};
