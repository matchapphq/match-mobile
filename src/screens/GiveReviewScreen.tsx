import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useStore } from "../store/useStore";
import { apiService } from "../services/api";
import { hapticFeedback } from "../utils/haptics";

const TAGS = [
    "Bonne ambiance",
    "Service rapide",
    "Écrans géants",
    "Prix corrects",
    "Large choix",
    "Propre",
];

const GiveReviewScreen = ({ navigation, route }: { navigation: any, route: any }) => {
    const { colors, computedTheme } = useStore();
    const { venue } = route.params;
    
    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isDark = computedTheme === "dark";

    const toggleTag = (tag: string) => {
        hapticFeedback.light();
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter((t) => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handlePublish = async () => {
        if (rating === 0) {
            Alert.alert("Erreur", "Veuillez donner une note globale.");
            return;
        }

        if (content.trim().length < 10) {
            Alert.alert("Erreur", "Veuillez écrire un commentaire d'au moins 10 caractères.");
            return;
        }

        setIsSubmitting(true);
        try {
            await apiService.createReview(venue.id, {
                rating,
                content,
                tags: selectedTags,
            });
            hapticFeedback.success();
            Alert.alert("Succès", "Merci pour votre avis !", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Error submitting review:", error);
            Alert.alert("Erreur", "Impossible de publier votre avis. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => {
                        hapticFeedback.medium();
                        setRating(i);
                    }}
                    activeOpacity={0.7}
                >
                    <MaterialIcons
                        name={i <= rating ? "star" : "star-border"}
                        size={48}
                        color={i <= rating ? colors.primary : colors.textMuted}
                        style={i <= rating ? styles.activeStar : {}}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Donner mon avis</Text>
                <View style={styles.spacer} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Venue Info */}
                    <View style={styles.venueSection}>
                        <View style={[styles.venueAvatarContainer, { borderColor: colors.primary + "4D" }]}>
                            <Image
                                source={{ uri: venue.image || venue.logo_url }}
                                style={styles.venueAvatar}
                            />
                        </View>
                        <View style={styles.venueInfo}>
                            <Text style={[styles.venueName, { color: colors.text }]}>{venue.name}</Text>
                            <View style={styles.venueDetails}>
                                <Text style={[styles.venueLocation, { color: colors.textMuted }]}>{venue.city || "Paris"}</Text>
                                <View style={[styles.dot, { backgroundColor: colors.textMuted + "4D" }]} />
                                <View style={styles.ratingRow}>
                                    <MaterialIcons name="star" size={14} color={colors.primary} />
                                    <Text style={[styles.ratingText, { color: colors.text }]}>
                                        {parseFloat(venue.rating || venue.average_rating || "4.8").toFixed(1)}
                                    </Text>
                                    <Text style={[styles.reviewsCount, { color: colors.textMuted }]}>
                                        ({venue.total_reviews || "1,247"})
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Global Rating */}
                    <View style={styles.ratingSection}>
                        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>NOTE GLOBALE</Text>
                        <View style={styles.starsContainer}>{renderStars()}</View>
                    </View>

                    {/* Tags Section */}
                    <View style={styles.tagsSection}>
                        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginBottom: 12 }]}>QU'AS-TU AIMÉ ?</Text>
                        <View style={styles.tagsGrid}>
                            {TAGS.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <TouchableOpacity
                                        key={tag}
                                        onPress={() => toggleTag(tag)}
                                        style={[
                                            styles.tag,
                                            {
                                                backgroundColor: isSelected ? colors.primary : colors.surface,
                                                borderColor: isSelected ? colors.primary : colors.border,
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.tagText,
                                                { color: isSelected ? "#FFFFFF" : colors.text },
                                            ]}
                                        >
                                            {tag}
                                        </Text>
                                        {isSelected && (
                                            <MaterialIcons name="check" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Review Form */}
                    <View style={styles.formSection}>
                        <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <TextInput
                                style={[styles.textArea, { color: colors.text }]}
                                placeholder="Raconte-nous ton expérience..."
                                placeholderTextColor={colors.textMuted}
                                multiline
                                textAlignVertical="top"
                                value={content}
                                onChangeText={setContent}
                                maxLength={500}
                            />
                            <Text style={[styles.charCount, { color: colors.textMuted }]}>
                                {content.length}/500
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.photoPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="add-a-photo" size={20} color={colors.textMuted} />
                            <MaterialIcons name="image" size={20} color={colors.textMuted} />
                            <Text style={[styles.photoPillText, { color: colors.text }]}>Ajouter des photos</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Actions */}
                    <View style={styles.footerActions}>
                        <TouchableOpacity
                            style={[
                                styles.publishButton,
                                {
                                    backgroundColor: colors.primary,
                                    shadowColor: colors.primary,
                                },
                                isSubmitting && { opacity: 0.7 }
                            ]}
                            onPress={handlePublish}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.publishButtonText}>Publier l'avis</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.laterButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={[styles.laterButtonText, { color: colors.textMuted }]}>Plus tard</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    spacer: {
        width: 40,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    venueSection: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 24,
    },
    venueAvatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        padding: 4,
        marginRight: 16,
    },
    venueAvatar: {
        width: "100%",
        height: "100%",
        borderRadius: 40,
    },
    venueInfo: {
        flex: 1,
    },
    venueName: {
        fontSize: 20,
        fontWeight: "bold",
    },
    venueDetails: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    venueLocation: {
        fontSize: 14,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginHorizontal: 8,
    },
    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontWeight: "500",
    },
    reviewsCount: {
        fontSize: 14,
    },
    ratingSection: {
        alignItems: "center",
        paddingVertical: 32,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    starsContainer: {
        flexDirection: "row",
        gap: 8,
        marginTop: 16,
    },
    activeStar: {
        shadowColor: "#f47b25",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    tagsSection: {
        paddingTop: 16,
    },
    tagsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 14,
        fontWeight: "500",
    },
    formSection: {
        marginTop: 32,
        gap: 16,
    },
    inputContainer: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        minHeight: 180,
    },
    textArea: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    charCount: {
        alignSelf: "flex-end",
        fontSize: 12,
        fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
        marginTop: 8,
    },
    photoPill: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 999,
        borderWidth: 1,
        gap: 10,
    },
    photoPillText: {
        fontSize: 14,
        fontWeight: "500",
        marginLeft: 4,
    },
    footerActions: {
        marginTop: 48,
        gap: 16,
    },
    publishButton: {
        height: 64,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    publishButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    laterButton: {
        paddingVertical: 12,
        alignItems: "center",
    },
    laterButtonText: {
        fontSize: 14,
        fontWeight: "500",
    },
});

export default GiveReviewScreen;
