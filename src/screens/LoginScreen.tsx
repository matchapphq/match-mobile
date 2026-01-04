import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme, images } from '../constants/theme';
import { useStore } from '../store/useStore';

const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { login, isLoading } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        const success = await login(email, password);
        if (!success) {
            // The store handles setting the error state, but we might want to show an alert too
            // or just rely on the UI to show the error if we subscribed to it.
            // For now, let's just assume the store might trigger a re-render if we used the error state,
            // but simplistic alert is fine here.
            Alert.alert('Erreur', 'Identifiants incorrects');
        }
        // If success, the store state 'isAuthenticated' changes, and AppNavigator should auto-switch screens.
    };

    const handleForgotPassword = () => {
        Alert.alert('Info', 'Fonctionnalité mot de passe oublié à venir');
    };

    return (
        <ImageBackground source={images.background} style={styles.backgroundContainer} resizeMode="cover">
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </TouchableOpacity>

                        <View style={styles.headerContainer}>
                            <Text style={styles.title}>Bon retour ! 👋</Text>
                            <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Mot de passe"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
                                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                <Text style={styles.loginButtonText}>{isLoading ? 'Connexion...' : 'Se connecter'}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    headerContainer: {
        marginBottom: theme.spacing.xxl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    subtitle: {
        fontSize: theme.fonts.sizes.md,
        color: theme.colors.textSecondary,
    },
    formContainer: {
        gap: theme.spacing.lg,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: Platform.OS === 'ios' ? 16 : 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputIcon: {
        marginRight: theme.spacing.md,
    },
    input: {
        flex: 1,
        color: theme.colors.text,
        fontSize: theme.fonts.sizes.md,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
    },
    forgotPasswordText: {
        color: theme.colors.secondary,
        fontSize: theme.fonts.sizes.sm,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.full,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: theme.colors.text,
        fontSize: theme.fonts.sizes.lg,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
