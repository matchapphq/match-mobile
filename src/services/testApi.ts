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

const mockProfile: UserProfile = {
    name: "Alex Martin",
    email: "alex.martin@example.com",
    badgeLabel: "Membre Gold",
    avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuChmt00KB9g8IBMZd_IR3ke3Gwft5yoKGVzN-8fgjdV7GgI4c71dESH3eO8QbxO90D1zpzu7HVhZ7d0jaKtWza6F9OQYCmEoHH4dHRJlsYMt1VtECsAK0drJ0FD2rhoQHHWtm0zShI-4oCC20k3ZEPQLWO0vJEZcUX-G9QGG0tqS-EYxN0vkFW3X44r0qVvQqabL6BTYwda2OnxJf4jQmldITRtTxbzWpuagyaKoM1JrYgLvvCXGhBBTqdIyeoI22YBKVmbCoa3OQdP",
    memberSince: "Depuis 2019",
    tier: "Gold",
};

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const mockVenues: Venue[] = [
    {
        id: "venue-1",
        name: "THE KOP BAR",
        latitude: 48.8566,
        longitude: 2.3522,
        address: "45 Rue de la République, Paris",
        distance: "1.2km",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYutEUuVU2BmD0ExpdmZaiCw_5FllQ6-YQzhg5EOU49KnnxE9fPu8QBXqSdeQI6k1GVdmiH0u2iiHop1mX-2DQfzR9qNc3eLRHb9cs99834tPQc_QbE_mxKpEUbFCMtctZgRb3tjr177DTsaewRm8xX7UyPTIXeL1jsIjBoN4AAeVxI3tFRyycWR83TqeyDvEK8FO0hiasGHxOMLS9Kh2K90IZJyHLHu3u6kX1Sg4OKq8WlCmsdMC9Xgkq945myde12j9EkwhW4k_7",
        rating: 4.8,
        tags: ["Pub", "Grand écran", "Ambiance festive"],
        priceLevel: "€€",
        isOpen: true,
        matches: [
            {
                id: "match-1",
                date: "28",
                month: "NOV",
                league: "Ligue 1",
                team1: "PSG",
                team2: "OM",
                time: "20:45",
                team1Color: "#3b82f6",
                team2Color: "#f87171",
            },
            {
                id: "match-2",
                date: "29",
                month: "NOV",
                league: "Premier League",
                team1: "Arsenal",
                team2: "Chelsea",
                time: "18:30",
                team1Color: "#ef4444",
                team2Color: "#60a5fa",
            },
        ],
    },
    {
        id: "venue-2",
        name: "Café Oz Grands Boulevards",
        latitude: 48.8738,
        longitude: 2.3486,
        address: "8 Boulevard Montmartre, Paris",
        distance: "2.4km",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJ4BMSIXSsxUNFVvm74Lngw7OSNckfL5ZwCZl6TrgkDDs70j_SPPYMc16i-64G-JE1XZ8NBHnYfZpXhNTvJx_KUDxooZbvAHJgU_ziJDyTElxfbwZFralHI_DJ6AKaskSo7x0pZjCkS1USoWaOnihLqnoqkccweV3nbVhyRO-TZX58MGCk2A0gKoq4Zj8RiEvfgZwEznKz72M-oRU9ARJsTlCkJbADMiMa9xCXdY6MLLh4LqdJnYvOk-_9njn5Bhnqxug1qBMIX_BX",
        rating: 4.6,
        tags: ["Terrasse", "Cocktails", "DJ set"],
        priceLevel: "€€€",
        isOpen: true,
        matches: [
            {
                id: "match-3",
                date: "30",
                month: "NOV",
                league: "NBA",
                team1: "Lakers",
                team2: "Celtics",
                time: "02:00",
                team1Color: "#facc15",
                team2Color: "#38bdf8",
            },
        ],
    },
    {
        id: "venue-3",
        name: "O'Sullivans By The Mill",
        latitude: 48.8820,
        longitude: 2.3327,
        address: "92 Boulevard de Clichy, Paris",
        distance: "3.1km",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1LvcwoqJCao4N3QLiusjsPhONb-aHaWgQLRN0f5m4WnUi1bYADHxW_tGZkxt6HNUA8lnNfZNR6azf2f7KZKwXhQ_DqZ0VVvD1fAY3o1vWIquzOIhtWH1dC57bzuHt9DW6ouRXJboQwiqpWypYbiJFKxVuUIDFjFu56P9sp0heT_0owaLkuTy25JslfuMr35iRsYyEmSaDC2yFoxQASgxaWKfpEt9vtWLYrHpX1j9obR-HfpjRtx5w1sALUqfXNvHw7dJSCEyd9X22",
        rating: 4.5,
        tags: ["Happy Hour", "Live Music"],
        priceLevel: "€€",
        isOpen: false,
        matches: [],
    },
];

const mockSearchTrends: SearchTrend[] = [
    { icon: "deck", label: "Bars avec terrasse" },
    { icon: "celebration", label: "Happy Hour" },
    { icon: "sports-soccer", label: "PSG vs OM" },
    { icon: "sports-basketball", label: "NBA Nights" },
    { icon: "sports-rugby", label: "Rugby World Cup" },
    { icon: "tv", label: "Grand Écran" },
];

const mockRecentSearches = ["The Kop Bar", "Café Oz", "Happy Hour Bastille", "Sportsbar République"];

const mockSearchResults: SearchResult[] = mockVenues.map((venue) => ({
    id: venue.id,
    name: venue.name,
    tag: venue.tags[0],
    distance: venue.distance,
    isLive: venue.isOpen,
    image: venue.image,
    rating: venue.rating,
    priceLevel: venue.priceLevel,
}));

const mockSearchMatchResults: SearchMatchResult[] = [
    {
        id: "match-psgom",
        league: "Ligue 1 Uber Eats",
        timeLabel: "Ce soir 21:00",
        kickoffTime: "21:00",
        statusLabel: "Aujourd'hui",
        stadium: "Parc des Princes",
        city: "Paris",
        heroImage:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDEcsj6H3014GYUkoAU27Q9iQ_fm1g4dxnHPFS-HlTfCwIwVnv0Cf1EzwRO2bD2UJwhhoGy3EyRf82OhTrwsSPU14ENI7F7J-vlii--lCkH4rTxXdqtVdQVexOhnOY3rq0q2EQ0JMDDkras2W73w1BgGfQclUxyF17P22K-6muXZygnPhpjvYMv53tk2Z2m0ZVsvcDhURaHXXbJw4_Xkz-HiFSrsY5KSiFhFEftwn9RI527cDtRlopxoK3oQqgUpdk0WkGOb8mzmwHB",
        home: {
            badge: "PSG",
            name: "Paris SG",
            color: "#004170",
        },
        away: {
            badge: "OM",
            name: "Marseille",
            color: "#2faee0",
        },
    },
    {
        id: "match-arschel",
        league: "Premier League",
        timeLabel: "Demain 18:30",
        kickoffTime: "18:30",
        statusLabel: "Demain",
        stadium: "Emirates Stadium",
        city: "London",
        heroImage:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCfIBKbI06a7OgT_QZbOI8mrVSkiCIRRqUpT_AVMk1eBa-_ltPqkv2UN-0ufIdC8_UoTWbrSA5bk3sBnYg2wg-QE2bAzObdOD0rKXPbCA0j_w59wCVjYeM-NSsW1xantn1NZR7JtqHp_ZCVnYsG1wmzj4AAMMqrxjZtXNkB9vFXVtcpMYtkT7Bh2Ayi5g5hXzbYF6q6pbc528QWjwJ7isZ1XTaMRfRZoVjI8LnF8tJ1oxLlle8YiScerUWwPtNSjAftLd3jZ-aIN3bb",
        home: {
            badge: "ARS",
            name: "Arsenal",
            color: "#be123c",
        },
        away: {
            badge: "CHE",
            name: "Chelsea",
            color: "#1d4ed8",
        },
    },
];

const mockBookings: Booking[] = [
    {
        id: "booking-1",
        status: "confirmed",
        venue: "The Kop Bar",
        match: "Diffusion: Arsenal vs Liverpool",
        date: "14 Oct • 20:45",
        people: "4 personnes",
        peopleCount: 4,
        location: "Centre Ville, Paris",
        reference: "#RES-8921",
        dateShort: "14 Oct",
        time: "20:45",
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=MatchReservation-1",
        image: mockVenues[0].image,
    },
    {
        id: "booking-2",
        status: "pending",
        venue: "Café Oz Grands Boulevards",
        match: "Diffusion: PSG vs OM",
        date: "21 Oct • 21:00",
        people: "6 personnes",
        peopleCount: 6,
        location: "Grands Boulevards, Paris",
        reference: "#RES-5632",
        dateShort: "21 Oct",
        time: "21:00",
        qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=MatchReservation-2",
        image: mockVenues[1].image,
    },
];

const mockFaqItems: FaqItem[] = [
    {
        id: "faq-1",
        question: "Comment réserver une table ?",
        answer:
            "Accédez à la page du bar, sélectionnez votre date et l'heure, choisissez le nombre de personnes, puis confirmez votre réservation.",
    },
    {
        id: "faq-2",
        question: "Le QR code ne s'affiche pas",
        answer:
            "Vérifiez votre connexion internet. Si le problème persiste, rafraîchissez la page 'Mes Tickets' ou contactez notre support.",
    },
    {
        id: "faq-3",
        question: "Annuler ma réservation",
        answer:
            "Vous pouvez annuler sans frais jusqu'à 2 heures avant l'événement. Allez dans 'Mes Réservations' pour annuler.",
    },
    {
        id: "faq-4",
        question: "Puis-je modifier mon profil ?",
        answer: "Oui, rendez-vous dans l'onglet 'Profil' puis cliquez sur l'icône de crayon pour éditer vos informations.",
    },
];

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS = ["JAN", "FEV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOUT", "SEPT", "OCT", "NOV", "DEC"];

const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push({
            fullDate: date,
            day: date.getDate(),
            month: MONTHS[date.getMonth()],
            weekDay: DAYS[date.getDay()],
            isoDate: date.toISOString().split("T")[0],
        });
    }
    return dates;
};

const COLOR_PALETTE = ["#f87171", "#60a5fa", "#34d399", "#facc15", "#a78bfa", "#fb923c"];

const getMatchesForDate = (dateIso: string) => {
    const hash = dateIso.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const matchCount = (hash % 3) + 1;
    const teams = ["PSG", "OM", "Real Madrid", "Barcelona", "Arsenal", "Chelsea", "Lakers", "Celtics"];
    const leagues = ["Ligue 1", "Premier League", "La Liga", "NBA"];
    const dateObj = new Date(dateIso);
    const dayLabel = dateObj.getDate().toString().padStart(2, "0");
    const monthLabel = MONTHS[dateObj.getMonth()];

    const matches = [];
    for (let i = 0; i < matchCount; i++) {
        matches.push({
            id: `${dateIso}-${i}`,
            date: dayLabel,
            month: monthLabel,
            league: leagues[(hash + i) % leagues.length],
            team1: teams[(hash + i) % teams.length],
            team2: teams[(hash + i + 3) % teams.length],
            time: `${18 + ((hash + i) % 5)}:00`,
            bgImage: mockVenues[(hash + i) % mockVenues.length].image,
            team1Color: COLOR_PALETTE[(hash + i) % COLOR_PALETTE.length],
            team2Color: COLOR_PALETTE[(hash + i + 2) % COLOR_PALETTE.length],
        });
    }
    return matches;
};

const reservationDates = generateDates();
const reservationMatches = reservationDates.reduce<Record<string, any[]>>((acc, date) => {
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
