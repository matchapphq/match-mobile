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
    const [selectedLang, setSelectedLang] = useState('fr'); // Default to French as per design

    const RadioButton = ({ selected }: { selected: boolean }) => (
        <View
            style={[
                styles.radioCircle,
                selected && styles.radioCircleSelected,
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
                onPress={() => setSelectedLang(item.code)}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.languageLabel,
                        isSelected && styles.languageLabelSelected,
                    ]}
                >
                    {item.label}
                </Text>
                <RadioButton selected={isSelected} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Langue</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Suggested Languages */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>LANGUES SUGGÉRÉES</Text>
                    <View style={styles.card}>
                        {SUGGESTED_LANGUAGES.map((lang, index) => (
                            <LanguageItem
                                key={lang.code}
                                item={lang}
                                isLast={index === SUGGESTED_LANGUAGES.length - 1}
                            />
                        ))}
                    </View>
                </View>

                {/* Other Languages */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>AUTRES LANGUES</Text>
                    <View style={styles.card}>
                        {OTHER_LANGUAGES.map((lang, index) => (
                            <LanguageItem
                                key={lang.code}
                                item={lang}
                                isLast={index === OTHER_LANGUAGES.length - 1}
                            />
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
        backgroundColor: 'rgba(255,255,255,0.08)', // Matches Profile header button
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
        backgroundColor: '#1c1c21', // Matches bg-white dark:bg-[#1c1c21]
        borderRadius: 24,
        overflow: 'hidden',
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
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    languageLabel: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
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
