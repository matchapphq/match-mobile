import { create } from "zustand";

export const TEST_ONBOARDING_TOTAL_STEPS = 8;

const DEFAULT_COORDINATES = {
    lat: 48.8566,
    lng: 2.3522,
};

export type TestOnboardingFormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    username: string;
    referralCode: string;
    fav_sports: string[];
    fav_team_ids: string[];
    ambiances: string[];
    venue_types: string[];
    budget: string;
    home_lat: number | null;
    home_lng: number | null;
};

const initialData: TestOnboardingFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    username: "",
    referralCode: "",
    fav_sports: ["football", "rugby"],
    fav_team_ids: [],
    ambiances: ["ultra"],
    venue_types: ["bar"],
    budget: "standard",
    home_lat: DEFAULT_COORDINATES.lat,
    home_lng: DEFAULT_COORDINATES.lng,
};

type ArrayField = "fav_sports" | "fav_team_ids" | "ambiances" | "venue_types";

type TestOnboardingFormState = {
    data: TestOnboardingFormData;
    updateField: <K extends keyof TestOnboardingFormData>(field: K, value: TestOnboardingFormData[K]) => void;
    toggleArrayValue: (field: ArrayField, value: string) => void;
    reset: () => void;
    buildRequestPayload: () => Record<string, unknown>;
};

export const useTestOnboardingForm = create<TestOnboardingFormState>((set, get) => ({
    data: initialData,
    updateField: (field, value) =>
        set((state) => ({
            data: {
                ...state.data,
                [field]: value,
            },
        })),
    toggleArrayValue: (field, value) =>
        set((state) => {
            const current = state.data[field];
            const exists = current.includes(value);
            return {
                data: {
                    ...state.data,
                    [field]: exists ? current.filter((item) => item !== value) : [...current, value],
                },
            };
        }),
    reset: () => set({ data: initialData }),
    buildRequestPayload: () => {
        const { data } = get();
        return {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
            role: "user",
            referralCode: data.referralCode || undefined,
            phone: data.phone || undefined,
            fav_sports: data.fav_sports,
            fav_team_ids: data.fav_team_ids,
            home_lat: data.home_lat ?? undefined,
            home_lng: data.home_lng ?? undefined,
            ambiances: data.ambiances,
            budget: data.budget || undefined,
            venue_types: data.venue_types,
        };
    },
}));
