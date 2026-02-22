import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { useStore } from '../store/useStore';
import { usePostHog } from 'posthog-react-native';

type LanguageOption = {
    code: string;
    label: string;
    flag?: string; // Optional if we want to add flags later, though design just uses radio
};

const SUGGESTED_LANGUAGES: LanguageOption[] = [
    { code: 'fr', label: 'Français (France)' },
    { code: 'en-us', label: 'English (US)' },
    { code: 'en-uk', label: 'English (UK)' },
    { code: 'es', label: 'Español' },
];

const OTHER_LANGUAGES: LanguageOption[] = [
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'pt', label: 'Português' },
];

const LanguageSelectionScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const posthog = usePostHog();
    const { colors, computedTheme: themeMode } = useStore();
    const [selectedLang, setSelectedLang] = useState('fr'); // Default to French as per design

    const RadioButton = ({ selected }: { selected: boolean }) => (
        <View
            style={[
                styles.radioCircle,
                { borderColor: selected ? colors.primary : colors.subtext },
                selected && { backgroundColor: colors.primary },
            ]}
        >
            {selected && <View style={styles.radioInnerCircle} />}
        </View>
    );

    const LanguageItem = ({ item, isLast }: { item: LanguageOption; isLast?: boolean }) => {
        const isSelected = selectedLang === item.code;
        return (
            <TouchableOpacity
                style={[styles.languageItem, !isLast && styles.languageItemBorder]}
                onPress={() => {
                    posthog?.capture('language_changed', { language: item.code });
                    setSelectedLang(item.code);
                }}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.languageLabel,
                        { color: isSelected ? colors.text : colors.textMuted },
                        isSelected && { fontWeight: '600' },
                    ]}
                >
                    {item.label}
                </Text>
                <RadioButton selected={isSelected} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={themeMode === 'light' ? "dark-content" : "light-content"} />

            {/* Header */}
            <View style={[styles.header, {
                paddingTop: insets.top + 8,
                backgroundColor: themeMode === 'light' ? 'rgba(248,247,245,0.95)' : 'rgba(11, 11, 15, 0.9)',
                borderBottomColor: colors.border
            }]}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.surfaceGlass }]}
                    activeOpacity={0.7}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Langue</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Suggested Languages */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.subtext }]}>LANGUES SUGGÉRÉES</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {SUGGESTED_LANGUAGES.map((lang, index) => (
                            <View key={lang.code}>
                                <LanguageItem
                                    item={lang}
                                    isLast={index === SUGGESTED_LANGUAGES.length - 1}
                                />
                                {index !== SUGGESTED_LANGUAGES.length - 1 && (
                                    <View style={{ height: 1, backgroundColor: colors.divider }} />
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Other Languages */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.subtext }]}>AUTRES LANGUES</Text>
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        {OTHER_LANGUAGES.map((lang, index) => (
                            <View key={lang.code}>
                                <LanguageItem
                                    item={lang}
                                    isLast={index === OTHER_LANGUAGES.length - 1}
                                />
                                {index !== OTHER_LANGUAGES.length - 1 && (
                                    <View style={{ height: 1, backgroundColor: colors.divider }} />
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(11, 11, 15, 0.9)', // Slight transparency if needed, or just solid
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: COLORS.subtext, // Using subtext for that grey/muted look
        marginBottom: 8,
        marginLeft: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'transparent',
    },
    languageItemBorder: {
        borderBottomWidth: 1,
    },
    languageLabel: {
        fontSize: 16,
        fontWeight: '400',
    },
    languageLabelSelected: {
        fontWeight: '600',
        color: COLORS.text,
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.subtext, // Unchecked color
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },
    radioInnerCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.white,
    },
});

export default LanguageSelectionScreen;
