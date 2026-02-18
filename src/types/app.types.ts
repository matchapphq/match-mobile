// match-mobile/src/types/app.types.ts

export interface UserProfile {
    name: string;
    email: string;
    badgeLabel: string;
    avatar: string;
    memberSince: string;
    tier: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
    phone?: string;
}

export interface Venue {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    distance?: string;
    image: string;
    rating: number;
    tags: string[];
    priceLevel: string;
    isOpen: boolean;
    matches?: VenueMatch[];
}

export interface VenueMatch {
    id: string;
    date: string;
    month: string;
    league: string;
    team1: string;
    team2: string;
    time: string;
    team1Color: string;
    team2Color: string;
    bgImage?: string;
}

export interface SearchTrend {
    icon: string;
    label: string;
}

export interface SearchResult {
    id: string;
    name: string;
    tag: string;
    distance: string;
    isLive: boolean;
    image: string;
    rating: number;
    priceLevel: string;
}

export interface SearchMatchResult {
    id: string;
    league: string;
    timeLabel: string;
    kickoffTime: string;
    statusLabel: string;
    scheduledAt: string;
    dateIso: string;
    stadium: string;
    city: string;
    heroImage?: string;
    home: {
        badge: string;
        name: string;
        color: string;
    };
    away: {
        badge: string;
        name: string;
        color: string;
    };
}

export interface Booking {
    id: string;
    status: "confirmed" | "pending";
    venue: string;
    match: string;
    date: string;
    people: string;
    peopleCount: number;
    location: string;
    reference: string;
    dateShort: string;
    time: string;
    qrCode: string;
    image: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface ReservationDate {
    fullDate: Date;
    day: number;
    month: string;
    weekDay: string;
    isoDate: string;
}