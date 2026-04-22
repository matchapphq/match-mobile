import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Linking,
    Switch,
    Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useStore } from '../../store/useStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = 440;

type AnalyticsConsentModalProps = {
    visible: boolean;
    onConfirm: (consent: boolean) => void;
};

const AnalyticsConsentModal: React.FC<AnalyticsConsentModalProps> = ({
    visible,
    onConfirm,
}) => {
    const { colors } = useStore();
    const [modalVisible, setModalVisible] = useState(false);
    const [consentEnabled, setConsentEnabled] = useState(true);
    const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            slideAnim.setValue(MODAL_HEIGHT);
            backdropAnim.setValue(0);
            setModalVisible(true);

            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(backdropAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        damping: 25,
                        stiffness: 200,
                        mass: 0.8,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, 10);
        } else if (modalVisible) {
            Animated.parallel([
                Animated.timing(backdropAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: MODAL_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setModalVisible(false);
            });
        }
    }, [visible]);

    const openPrivacyPolicy = () => {
        Linking.openURL('https://matchapp.fr/privacy');
    };

    if (!modalVisible) return null;

    return (
        <Modal visible={modalVisible} transparent animationType="none">
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFillObject,
                        {
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            opacity: backdropAnim,
                        },
                    ]}
                />
                
                <Animated.View
                    style={[
                        styles.sheetContainer,
                        {
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={[styles.sheet, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={[styles.handle, { backgroundColor: colors.border }]} />

                        <View style={styles.header}>
                            <View style={[styles.iconContainer, { backgroundColor: colors.accent10 }]}>
                                <MaterialIcons name="security" size={32} color={colors.accent} />
                            </View>
                            <Text style={[styles.title, { color: colors.text }]}>Optimisons votre expérience</Text>
                            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                                En continuant, vous nous aidez à améliorer Match. Nous utilisons des données anonymes pour corriger les bugs et créer les fonctionnalités que vous aimez.
                            </Text>
                        </View>

                        <View style={styles.content}>
                            <View style={[styles.toggleRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleLabel, { color: colors.text }]}>Activer l'analyse produit</Text>
                                    <Text style={[styles.toggleSublabel, { color: colors.textMuted }]}>Partager anonymement mon usage</Text>
                                </View>
                                <Switch
                                    value={consentEnabled}
                                    onValueChange={setConsentEnabled}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : (consentEnabled ? colors.accent : '#f4f3f4')}
                                />
                            </View>
                            
                            <TouchableOpacity onPress={openPrivacyPolicy} style={styles.linkContainer}>
                                <Text style={[styles.link, { color: colors.accent }]}>Politique de confidentialité</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.confirmButton, { backgroundColor: colors.primary }]}
                                onPress={() => onConfirm(consentEnabled)}
                                activeOpacity={0.9}
                            >
                                <Text style={styles.confirmButtonText}>Continuer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        width: '100%',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        paddingBottom: 48,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    handle: {
        alignSelf: 'center',
        width: 48,
        height: 4,
        borderRadius: 2,
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    content: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    toggleTextContainer: {
        flex: 1,
        marginRight: 12,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    toggleSublabel: {
        fontSize: 12,
        marginTop: 2,
    },
    linkContainer: {
        alignSelf: 'center',
    },
    link: {
        fontSize: 13,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    actions: {
        paddingHorizontal: 24,
        marginTop: 4,
    },
    confirmButton: {
        height: 54,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    confirmButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0b0b0f',
    },
});

export default AnalyticsConsentModal;
