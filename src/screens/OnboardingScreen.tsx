import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    Image,
    Animated,
    TextInput,
    Alert,
    Modal,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { theme, images } from "../constants/theme";
import { useStore } from "../store/useStore";

type OnboardingStep = "credentials" | "sports" | "ambiance" | "food" | "budget";

const OnboardingScreen = () => {
    const navigation = useNavigation<any>();
    const { signup } = useStore();
    const [currentStep, setCurrentStep] =
        useState<OnboardingStep>("credentials");

    // Country code state
    const [countryCodeModalVisible, setCountryCodeModalVisible] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState({
        code: "+33",
        flag: "🇫🇷",
        name: "France",
    });

    const [selections, setSelections] = useState({
        sports: [] as string[],
        ambiance: [] as string[],
        foodTypes: [] as string[],
        budget: "" as string,
    });

    const [credentials, setCredentials] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phoneNumber: "",
    });

    const countryOptions = [
        { code: "+33", flag: "🇫🇷", name: "France" },
        { code: "+1", flag: "🇺🇸", name: "United States" },
        { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
        { code: "+49", flag: "🇩🇪", name: "Germany" },
        { code: "+34", flag: "🇪🇸", name: "Spain" },
        { code: "+39", flag: "🇮🇹", name: "Italy" },
        { code: "+351", flag: "🇵🇹", name: "Portugal" },
        { code: "+32", flag: "🇧🇪", name: "Belgium" },
        { code: "+41", flag: "🇨🇭", name: "Switzerland" },
    ];

    const sportsOptions = [
        { id: "foot", label: "Foot", icon: "⚽" },
        { id: "rugby", label: "Rugby", icon: "🏉" },
        { id: "basket", label: "Basket", icon: "🏀" },
        { id: "tennis", label: "Tennis", icon: "🎾" },
    ];

    const ambianceOptions = [
        { id: "posee", label: "Posée", icon: "😌" },
        { id: "chaude", label: "Ultra / Ambiance chaude", icon: "🔥" },
        { id: "conviviale", label: "Conviviale", icon: "🤗" },
    ];

    const foodOptions = [
        { id: "restaurant", label: "Restaurant", icon: "🍴" },
        { id: "bar", label: "Bars / Pubs", icon: "🍺" },
        { id: "fastfood", label: "Fast-foods", icon: "🍔" },
    ];

    const budgetOptions = [
        { id: "5-10", label: "5-10 €" },
        { id: "10-20", label: "10-20 €" },
        { id: "+20", label: "+20 €" },
    ];

    const handleCredentialChange = (name: string, value: string) => {
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const toggleSelection = (
        category: "sports" | "ambiance" | "foodTypes",
        item: string,
    ) => {
        setSelections((prev) => ({
            ...prev,
            [category]: prev[category].includes(item)
                ? prev[category].filter((i) => i !== item)
                : [...prev[category], item],
        }));
    };

    const selectBudget = (budget: string) => {
        setSelections((prev) => ({ ...prev, budget }));
    };

    const handleContinue = () => {
        switch (currentStep) {
            case "credentials":
                setCurrentStep("sports");
                break;
            case "sports":
                setCurrentStep("ambiance");
                break;
            case "ambiance":
                setCurrentStep("food");
                break;
            case "food":
                setCurrentStep("budget");
                break;
            case "budget":
                completeOnboarding();
                break;
        }
    };

    const completeOnboarding = async () => {
        const success = await signup({
            ...credentials,
            phone: `${selectedCountry.code}${credentials.phoneNumber}`,
            ...selections,
        });

        if (success) {
            navigation.navigate("Main");
        } else {
            Alert.alert(
                "Erreur",
                "L'inscription a échoué. Veuillez réessayer.",
            );
        }
    };

    const renderCountryItem = ({ item }: { item: typeof countryOptions[0] }) => (
        <TouchableOpacity
            style={styles.countryItem}
            onPress={() => {
                setSelectedCountry(item);
                setCountryCodeModalVisible(false);
            }}
        >
            <Text style={styles.countryFlag}>{item.flag}</Text>
            <Text style={styles.countryName}>{item.name}</Text>
            <Text style={styles.countryCode}>{item.code}</Text>
        </TouchableOpacity>
    );

    const renderCredentialsStep = () => (
        <>
            <Text style={styles.title}>Créez votre compte</Text>
            <View style={styles.optionsContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Prénom"
                    value={credentials.firstName}
                    onChangeText={(val) =>
                        handleCredentialChange("firstName", val)
                    }
                />
                <TextInput
                    style={styles.input}
                    placeholder="Nom"
                    value={credentials.lastName}
                    onChangeText={(val) =>
                        handleCredentialChange("lastName", val)
                    }
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={credentials.email}
                    onChangeText={(val) => handleCredentialChange("email", val)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {/* Phone Number Input with Country Code */}
                <View style={styles.phoneInputContainer}>
                    <TouchableOpacity
                        style={styles.countrySelector}
                        onPress={() => setCountryCodeModalVisible(true)}
                    >
                        <Text style={styles.countrySelectorText}>
                            {selectedCountry.flag} {selectedCountry.code}
                        </Text>
                    </TouchableOpacity>
                    <TextInput
                        style={styles.phoneInput}
                        placeholder="Téléphone"
                        value={credentials.phoneNumber}
                        onChangeText={(val) =>
                            handleCredentialChange("phoneNumber", val)
                        }
                        keyboardType="phone-pad"
                    />
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="Mot de passe"
                    value={credentials.password}
                    onChangeText={(val) =>
                        handleCredentialChange("password", val)
                    }
                    secureTextEntry
                />
            </View>

            {/* Country Code Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={countryCodeModalVisible}
                onRequestClose={() => setCountryCodeModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choisir un pays</Text>
                            <TouchableOpacity
                                onPress={() => setCountryCodeModalVisible(false)}
                            >
                                <Text style={styles.closeButton}>Fermer</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={countryOptions}
                            renderItem={renderCountryItem}
                            keyExtractor={(item) => item.code}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );

    const renderSportsStep = () => (
        <>
            <Text style={styles.title}>Quels sports t'intéressent ?</Text>
            <Text style={styles.subtitle}>Sélectionne 1 ou plusieurs</Text>
            <View style={styles.optionsContainer}>
                {sportsOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.optionButton,
                            selections.sports.includes(option.id) &&
                            styles.optionButtonSelected,
                        ]}
                        onPress={() => toggleSelection("sports", option.id)}
                    >
                        <Text style={styles.optionIcon}>{option.icon}</Text>
                        <Text
                            style={[
                                styles.optionLabel,
                                selections.sports.includes(option.id) &&
                                styles.optionLabelSelected,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.optionButton}>
                    <Text style={styles.optionLabel}>Ajouter</Text>
                </TouchableOpacity>
            </View>
        </>
    );

    const renderAmbianceStep = () => (
        <>
            <Text style={styles.title}>Quelle ambiance préfères-tu</Text>
            <Text style={styles.subtitle}>Sélectionne 1 ou plusieurs</Text>
            <View style={styles.optionsContainer}>
                {ambianceOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.optionButton,
                            selections.ambiance.includes(option.id) &&
                            styles.optionButtonSelected,
                        ]}
                        onPress={() => toggleSelection("ambiance", option.id)}
                    >
                        <Text style={styles.optionIcon}>{option.icon}</Text>
                        <Text
                            style={[
                                styles.optionLabel,
                                selections.ambiance.includes(option.id) &&
                                styles.optionLabelSelected,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    const renderFoodStep = () => (
        <>
            <Text style={styles.title}>Plutôt bar ou fast-food ?</Text>
            <View style={styles.optionsContainer}>
                {foodOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.optionButton,
                            selections.foodTypes.includes(option.id) &&
                            styles.optionButtonSelected,
                        ]}
                        onPress={() => toggleSelection("foodTypes", option.id)}
                    >
                        <Text style={styles.optionIcon}>{option.icon}</Text>
                        <Text
                            style={[
                                styles.optionLabel,
                                selections.foodTypes.includes(option.id) &&
                                styles.optionLabelSelected,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    const renderBudgetStep = () => (
        <>
            <Text style={styles.title}>Ton budget habituel ?</Text>
            <View style={styles.optionsContainer}>
                {budgetOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.optionButton,
                            selections.budget === option.id &&
                            styles.optionButtonSelected,
                        ]}
                        onPress={() => selectBudget(option.id)}
                    >
                        <Text
                            style={[
                                styles.optionLabel,
                                selections.budget === option.id &&
                                styles.optionLabelSelected,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    const isStepValid = () => {
        switch (currentStep) {
            case "credentials":
                return (
                    credentials.email.includes("@") &&
                    credentials.password.length >= 6 &&
                    credentials.firstName.length > 0 &&
                    credentials.lastName.length > 0 &&
                    credentials.phoneNumber.length > 0
                );
            case "sports":
                return selections.sports.length > 0;
            case "ambiance":
                return selections.ambiance.length > 0;
            case "food":
                return selections.foodTypes.length > 0;
            case "budget":
                return selections.budget !== "";
            default:
                return false;
        }
    };

    return (
        <ImageBackground
            source={images.background}
            style={styles.container}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.logoContainer}>
                    <Image
                        source={images.logo}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {currentStep === "credentials" && renderCredentialsStep()}
                    {currentStep === "sports" && renderSportsStep()}
                    {currentStep === "ambiance" && renderAmbianceStep()}
                    {currentStep === "food" && renderFoodStep()}
                    {currentStep === "budget" && renderBudgetStep()}
                </ScrollView>

                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        !isStepValid() && styles.continueButtonDisabled,
                    ]}
                    onPress={handleContinue}
                    disabled={!isStepValid()}
                    activeOpacity={0.8}
                >
                    <Text style={styles.continueButtonText}>Continuer</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    safeArea: {
        flex: 1,
    },
    logoContainer: {
        alignItems: "center",
        paddingTop: theme.spacing.md,
    },
    logoImage: {
        width: 100,
        height: 100,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.xxl,
    },
    title: {
        fontSize: theme.fonts.sizes.xl,
        fontWeight: "bold",
        color: theme.colors.secondary,
        textAlign: "center",
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.fonts.sizes.md,
        color: theme.colors.secondary,
        textAlign: "center",
        marginBottom: theme.spacing.xl,
        opacity: 0.8,
    },
    optionsContainer: {
        alignItems: "center",
        gap: theme.spacing.md,
    },
    optionButton: {
        backgroundColor: theme.colors.secondary,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.full,
        minWidth: 250,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.sm,
    },
    optionButtonSelected: {
        backgroundColor: theme.colors.text,
    },
    optionIcon: {
        fontSize: 20,
    },
    optionLabel: {
        fontSize: theme.fonts.sizes.lg,
        fontWeight: "600",
        color: theme.colors.primary,
    },
    optionLabelSelected: {
        color: theme.colors.secondary,
    },
    continueButton: {
        backgroundColor: theme.colors.text,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.full,
        marginHorizontal: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
    },
    continueButtonDisabled: {
        opacity: 0.5,
    },
    continueButtonText: {
        color: theme.colors.primary,
        fontSize: theme.fonts.sizes.lg,
        fontWeight: "bold",
        textAlign: "center",
    },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 16,
        color: theme.colors.text,
        fontSize: theme.fonts.sizes.md,
        width: "100%",
    },
    phoneInputContainer: {
        flexDirection: "row",
        width: "100%",
        gap: theme.spacing.sm,
    },
    countrySelector: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        justifyContent: "center",
        alignItems: "center",
        minWidth: 80,
    },
    countrySelectorText: {
        color: theme.colors.text,
        fontSize: theme.fonts.sizes.md,
        fontWeight: "bold",
    },
    phoneInput: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: 16,
        color: theme.colors.text,
        fontSize: theme.fonts.sizes.md,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        padding: theme.spacing.lg,
        height: "50%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing.lg,
    },
    modalTitle: {
        fontSize: theme.fonts.sizes.lg,
        fontWeight: "bold",
        color: theme.colors.secondary,
    },
    closeButton: {
        color: theme.colors.primary,
        fontSize: theme.fonts.sizes.md,
    },
    countryItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.surface,
    },
    countryFlag: {
        fontSize: 24,
        marginRight: theme.spacing.md,
    },
    countryName: {
        flex: 1,
        fontSize: theme.fonts.sizes.md,
        color: theme.colors.text,
    },
    countryCode: {
        fontSize: theme.fonts.sizes.md,
        color: theme.colors.secondary,
        fontWeight: "bold",
    },
});

export default OnboardingScreen;
