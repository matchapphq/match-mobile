export type VenueMatch = {
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
};

export type Venue = {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    distance: string;
    image: string;
    rating: number;
    tags: string[];
    priceLevel: string;
    isOpen: boolean;
    matches: VenueMatch[];
};

export type SearchTrend = { icon: string; label: string };

export type SearchMatchTeam = {
    badge: string;
    name: string;
    color: string;
};

export type SearchMatchResult = {
    id: string;
    league: string;
    timeLabel: string;
    kickoffTime: string;
    statusLabel: string;
    stadium: string;
    city: string;
    heroImage: string;
    home: SearchMatchTeam;
    away: SearchMatchTeam;
};

export type SearchResult = {
    id: string;
    name: string;
    tag: string;
    distance: string;
    isLive: boolean;
    image: string;
    rating: number;
    priceLevel: string;
};

export type Booking = {
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
};

export type FaqItem = {
    id: string;
    question: string;
    answer: string;
};

export type UserProfile = {
    name: string;
    email: string;
    badgeLabel: string;
    avatar: string;
    memberSince: string;
    tier: "Gold" | "Silver" | "Bronze";
};

export type ReservationDate = {
    fullDate: Date;
    day: number;
    month: string;
    weekDay: string;
    isoDate: string;
};

export type NotificationSetting = {
    id: string;
    type: "match" | "venue" | "promo" | "reservation";
    title: string;
    message: string;
    badge: "ON/OFF";
};

export type MockReservation = {
    id: string;
    venueName: string;
    date: string;
    details: string;
    status: "confirmed" | "pending";
    qrCode: string | null;
};
