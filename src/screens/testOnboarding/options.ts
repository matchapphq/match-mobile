import { MaterialIcons } from "@expo/vector-icons";

export type IconName = keyof typeof MaterialIcons.glyphMap;

export type SportOption = { id: string; label: string; icon: IconName };
export type MoodOption = { id: string; label: string; icon: IconName; subtitle: string };
export type VenueOption = { id: string; label: string; icon: IconName; subtitle: string };
export type BudgetOption = { id: string; label: string; subtitle: string };

export const USERNAME_SUGGESTIONS = ["alex.goal", "alex_fan", "stadium_alex"];

export const SPORTS_OPTIONS: SportOption[] = [
    { id: "football", label: "Football", icon: "sports-soccer" },
    { id: "basketball", label: "Basketball", icon: "sports-basketball" },
    { id: "rugby", label: "Rugby", icon: "sports-rugby" },
    { id: "tennis", label: "Tennis", icon: "sports-tennis" },
    { id: "f1", label: "Formula 1", icon: "sports-motorsports" },
    { id: "mma", label: "MMA / Boxe", icon: "sports-mma" },
    { id: "handball", label: "Handball", icon: "sports-handball" },
];

export const MOOD_OPTIONS: MoodOption[] = [
    { id: "conviviale", label: "Conviviale", icon: "sports-bar", subtitle: "Des bières et des rires" },
    { id: "ultra", label: "Ultra", icon: "campaign", subtitle: "Ambiance stade & chants" },
    { id: "posee", label: "Posée", icon: "weekend", subtitle: "Confort, calme et écrans" },
];

export const VENUE_OPTIONS: VenueOption[] = [
    { id: "bar", label: "Bar Sportif", icon: "sports-bar", subtitle: "Pour l'ambiance et les boissons" },
    { id: "restaurant", label: "Restaurant", icon: "restaurant", subtitle: "Pour un bon repas devant le match" },
    { id: "fastfood", label: "Snack / Fast-Food", icon: "fastfood", subtitle: "Pour manger vite sans rater l'action" },
];

export const BUDGET_OPTIONS: BudgetOption[] = [
    { id: "eco", label: "-5€", subtitle: "ÉCO" },
    { id: "standard", label: "5-10€", subtitle: "STANDARD" },
    { id: "premium", label: "10-20€", subtitle: "PREMIUM" },
    { id: "luxe", label: "+20€", subtitle: "LUXE" },
];
