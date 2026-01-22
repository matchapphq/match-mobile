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

type ThemeOption = 'dark' | 'light' | 'system';

const ThemeSelectionScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('dark'); // Default to dark as per design

    const ThemeCard = ({
        type,
        label,
        isSelected,
        onPress,
    }: {
        type: ThemeOption;
        label: string;
        isSelected: boolean;
        onPress: () => void;
    }) => {
        return (
            <TouchableOpacity
                style={styles.cardContainer}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <View
                    style={[
                        styles.previewContainer,
                        isSelected && styles.previewContainerSelected,
                    ]}
                >
                    {/* Card Content based on type */}
                    {type === 'dark' && (
                        <View style={[styles.previewContent, { backgroundColor: '#18181b' }]}>
                            {/* Header pill */}
                            <View style={[styles.pill, { top: 16, width: '33%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />

                            {/* Main content box */}
                            <View style={[styles.contentBox, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.05)' }]}>
                                <View style={[styles.circle, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                                <View style={styles.linesContainer}>
                                    <View style={[styles.line, { width: '75%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                                    <View style={[styles.line, { width: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                                </View>
                            </View>
                        </View>
                    )}

                    {type === 'light' && (
                        <View style={[styles.previewContent, { backgroundColor: '#f1f5f9' }]}>
                            {/* Header pill */}
                            <View style={[styles.pill, { top: 16, width: '33%', backgroundColor: '#cbd5e1' }]} />

                            {/* Main content box */}
                            <View style={[styles.contentBox, { backgroundColor: '#ffffff', borderColor: '#e2e8f0', shadowOpacity: 0.05 }]}>
                                <View style={[styles.circle, { backgroundColor: '#e2e8f0' }]} />
                                <View style={styles.linesContainer}>
                                    <View style={[styles.line, { width: '75%', backgroundColor: '#e2e8f0' }]} />
                                    <View style={[styles.line, { width: '50%', backgroundColor: '#e2e8f0' }]} />
                                </View>
                            </View>
                        </View>
                    )}

                    {type === 'system' && (
                        <View style={styles.previewContent}>
                            {/* Split View */}
                            <View style={{ flexDirection: 'row', flex: 1 }}>
                                {/* Left Half (Light) */}
                                <View style={{ flex: 1, backgroundColor: '#f1f5f9', position: 'relative' }}>
                                    <View style={[styles.pill, { top: 16, left: 16, width: '66%', backgroundColor: '#cbd5e1' }]} />
                                    <View style={[styles.contentBox, {
                                        top: 48, left: 16, right: 0,
                                        borderTopRightRadius: 0, borderBottomRightRadius: 0,
                                        borderRightWidth: 0,
                                        backgroundColor: '#ffffff', borderColor: '#e2e8f0'
                                    }]}>
                                        <View style={[styles.circle, { backgroundColor: '#e2e8f0' }]} />
                                        <View style={styles.linesContainer}>
                                            <View style={[styles.line, { width: '100%', backgroundColor: '#e2e8f0' }]} />
                                        </View>
                                    </View>
                                </View>

                                {/* Right Half (Dark) */}
                                <View style={{ flex: 1, backgroundColor: '#18181b', position: 'relative' }}>
                                    <View style={[styles.pill, { top: 16, right: 16, width: '66%', alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                                    <View style={[styles.contentBox, {
                                        top: 48, right: 16, left: 0,
                                        borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
                                        borderLeftWidth: 0,
                                        backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.05)'
                                    }]}>
                                        <View style={styles.linesContainer}>
                                            <View style={[styles.line, { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                                            <View style={[styles.line, { width: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }]} />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Checkmark Badge */}
                    {isSelected && (
                        <View style={styles.checkBadge}>
                            <MaterialIcons name="check" size={16} color="white" style={{ fontWeight: 'bold' }} />
                        </View>
                    )}
                </View>

                <Text style={[styles.label, isSelected && styles.labelSelected]}>
                    {label}
                </Text>
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
                <Text style={styles.headerTitle}>Thème</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.description}>
                    Choisissez l'apparence de l'application.
                </Text>

                <View style={styles.grid}>
                    <ThemeCard
                        type="dark"
                        label="Sombre"
                        isSelected={selectedTheme === 'dark'}
                        onPress={() => setSelectedTheme('dark')}
                    />
                    <ThemeCard
                        type="light"
                        label="Clair"
                        isSelected={selectedTheme === 'light'}
                        onPress={() => setSelectedTheme('light')}
                    />
                    <ThemeCard
                        type="system"
                        label="Système"
                        isSelected={selectedTheme === 'system'}
                        onPress={() => setSelectedTheme('system')}
                    />
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
        backgroundColor: 'rgba(11, 11, 15, 0.9)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
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
        padding: 24,
    },
    description: {
        color: COLORS.subtext,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
    },
    grid: {
        gap: 24,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    cardContainer: {
        alignItems: 'center',
        width: '100%',
    },
    previewContainer: {
        width: '100%',
        aspectRatio: 2,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
        backgroundColor: '#1c1c21', // Fallback
    },
    previewContainerSelected: {
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    previewContent: {
        flex: 1,
        padding: 16,
        position: 'relative',
    },
    pill: {
        height: 16,
        borderRadius: 999,
        position: 'absolute',
        left: 16,
    },
    contentBox: {
        position: 'absolute',
        top: 48,
        left: 16,
        right: 16,
        height: 80,
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        flexDirection: 'row',
        gap: 12,
    },
    circle: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    linesContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 8,
    },
    line: {
        height: 8,
        borderRadius: 4,
    },
    checkBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: COLORS.primary,
        padding: 4,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    label: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '500',
        color: COLORS.subtext,
    },
    labelSelected: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default ThemeSelectionScreen;
