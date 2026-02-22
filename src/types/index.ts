export interface User {
    user: {
        id: string;
        first_name?: string;
        username?: string;
        last_name?: string;
        email?: string;
        avatar?: string;
        bio?: string;
        phone?: string;
        created_at?: string;
        preferences?: UserPreferences;
    };
    id: string;
    first_name?: string;
    last_name?: string;
    username?: string;
    email?: string;
    avatar?: string;
    bio?: string;
    created_at?: string;
    phone?: string;
    preferences?: UserPreferences;
}

export interface UserPreferences {
    sports: string[];
    ambiance: string[];
    foodTypes: string[];
    budget: string;
}

export interface Venue {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    type: VenueType;
    rating: number;
    priceRange: string;
    tags: string[];
    distance?: number;
    images?: string[];
    description?: string;
    hours?: string;
    amenities?: string[];
    matchesShowing?: Match[];
}

export enum VenueType {
    BAR = "Bar",
    RESTAURANT = "Restaurant",
    PUB = "Pub",
    FAST_FOOD = "Fast-food",
    CHICHA = "Chicha",
}

export interface Match {
    id: string;
    homeTeam: string;
    awayTeam: string;
    sport: SportType;
    date: Date;
    time: string;
    competition?: string;
    thumbnail?: string;
}

export enum SportType {
    FOOTBALL = "Football",
    RUGBY = "Rugby",
    BASKETBALL = "Basketball",
    TENNIS = "Tennis",
}

export interface Reservation {
    id: string;
    venueId: string;
    venueName: string;
    venueAddress?: string;
    date: Date;
    time: string;
    numberOfPeople: number;
    matchId?: string;
    matchTitle?: string;
    status: "pending" | "confirmed" | "cancelled";
    conditions?: string;
    qrCode?: string;
}

export interface Notification {
    id: string;
    type: "match" | "venue" | "promo" | "reservation";
    title: string;
    message: string;
    date: Date;
    read: boolean;
    badge?: "ON" | "OFF";
}
