import axios from 'axios';
import { Venue, Match, User, Reservation, VenueType, SportType } from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  // TODO: Get token from AsyncStorage
  // const token = await AsyncStorage.getItem('authToken');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  signup: async (data: any) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  
  // Venues
  getVenues: async (filters?: any): Promise<Venue[]> => {
    const response = await api.get('/venues', { params: filters });
    return response.data;
  },
  
  getVenueById: async (id: string): Promise<Venue> => {
    const response = await api.get(`/venues/${id}`);
    return response.data;
  },
  
  getNearbyVenues: async (lat: number, lng: number, radius: number = 5000): Promise<Venue[]> => {
    const response = await api.get('/venues/nearby', {
      params: { lat, lng, radius }
    });
    return response.data;
  },
  
  // Matches
  getMatches: async (filters?: any): Promise<Match[]> => {
    const response = await api.get('/matches', { params: filters });
    return response.data;
  },
  
  getUpcomingMatches: async (): Promise<Match[]> => {
    const response = await api.get('/matches/upcoming');
    return response.data;
  },
  
  getMatchesByVenue: async (venueId: string): Promise<Match[]> => {
    const response = await api.get(`/venues/${venueId}/matches`);
    return response.data;
  },
  
  // Reservations
  createReservation: async (data: Partial<Reservation>): Promise<Reservation> => {
    const response = await api.post('/reservations', data);
    return response.data;
  },
  
  getUserReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations');
    return response.data;
  },
  
  cancelReservation: async (id: string): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },
  
  // User
  updateUserPreferences: async (preferences: any): Promise<User> => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },
  
  getUserProfile: async (): Promise<User> => {
    const response = await api.get('/users/profile');
    return response.data;
  },
};

// Mock data for development
export const mockData = {
  venues: [
    {
      id: '1',
      name: 'The Kop Bar',
      address: 'Bar - 123 Bd Ney, 75018 Paris',
      latitude: 48.8584,
      longitude: 2.3522,
      type: VenueType.BAR,
      rating: 4.5,
      priceRange: '5-10€',
      tags: ['Foot', 'Conviviale', 'Bière'],
      distance: 0.9,
      images: ['https://via.placeholder.com/400x300'],
      description: 'Bar sportif convivial avec grande terrasse',
      hours: '11h / 01h',
    },
    {
      id: '2',
      name: 'Le Corner Pub',
      address: '45 Rue de la République, 75011 Paris',
      latitude: 48.8566,
      longitude: 2.3525,
      type: VenueType.PUB,
      rating: 4.2,
      priceRange: '+20€',
      tags: ['Rugby', 'Posée', 'Pizza'],
      distance: 1.5,
      images: ['https://via.placeholder.com/400x300'],
      description: 'Pub irlandais authentique',
      hours: '16h / 02h',
    },
  ],
  matches: [
    {
      id: '1',
      homeTeam: 'PSG',
      awayTeam: 'OM',
      sport: SportType.FOOTBALL,
      date: new Date('2025-11-28'),
      time: '21h',
      competition: 'Ligue 1',
      thumbnail: 'https://via.placeholder.com/400x200',
    },
    {
      id: '2',
      homeTeam: 'RMA',
      awayTeam: 'FCB',
      sport: SportType.FOOTBALL,
      date: new Date('2025-11-31'),
      time: '16h',
      competition: 'La Liga',
      thumbnail: 'https://via.placeholder.com/400x200',
    },
  ],
};
