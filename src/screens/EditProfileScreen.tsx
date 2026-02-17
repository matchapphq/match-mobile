import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ImageBackground,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store/useStore";

const MAX_BIO = 150;
const AVATAR_PLACEHOLDER = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400";

const EditProfileScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const { user, colors, themeMode, updateUser } = useStore();
    const userData = useMemo(() => user?.user ?? user ?? null, [user]);
    const isLightTheme = themeMode === "light";

    const [avatar, setAvatar] = useState(userData?.avatar || AVATAR_PLACEHOLDER);
    const [firstName, setFirstName] = useState(userData?.first_name || "");
    const [lastName, setLastName] = useState(userData?.last_name || "");
    const [email, setEmail] = useState(userData?.email || "");
    const [bio, setBio] = useState(userData?.bio || "");
    const [phone, setPhone] = useState(userData?.phone || "");
    const [isSaving, setIsSaving] = useState(false);

    // Sync state with userData when it's loaded
    React.useEffect(() => {
        if (userData) {
            setAvatar(userData.avatar || AVATAR_PLACEHOLDER);
            setFirstName(userData.first_name || "");
            setLastName(userData.last_name || "");
            setEmail(userData.email || "");
            setBio(userData.bio || "");
            setPhone(userData.phone || "");
        }
    }, [userData]);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.85,
        });
        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert("Champs manquants", "Merci de renseigner prénom et nom.");
            return;
        }
        try {
            setIsSaving(true);
            await updateUser({
                avatar,
                first_name: firstName.trim(),
                last_name: lastName.trim(),
                email,
                bio,
                phone,
            } as any);
            Alert.alert("Profil mis à jour", "Tes informations ont bien été enregistrées.");
            navigation.goBack();
        } catch (error) {
            Alert.alert("Erreur", "Impossible d'enregistrer pour le moment.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}> 
            <StatusBar barStyle={themeMode === "light" ? "dark-content" : "light-content"} />
            <ScrollView
                contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.header, { paddingTop: insets.top + 8 }]}> 
                    <TouchableOpacity
                        style={[styles.headerButton, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialIcons name="arrow-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Modifier le profil</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <ImageBackground source={{ uri: avatar }} style={styles.avatar} imageStyle={styles.avatarImage} />
                        <TouchableOpacity
                            style={[styles.avatarBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}
                            activeOpacity={0.9}
                            onPress={handlePickImage}
                        >
                            <MaterialIcons name="photo-camera" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handlePickImage}>
                        <Text style={[styles.changePhotoText, { color: colors.primary }]}>Changer la photo de profil</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.formCard}>
                    <View style={styles.rowInputs}>
                        <InputField
                            label="Prénom"
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholder="Alex"
                            colors={colors}
                            containerStyle={styles.flexItem}
                        />
                        <InputField
                            label="Nom"
                            value={lastName}
                            onChangeText={setLastName}
                            placeholder="Martin"
                            colors={colors}
                            containerStyle={styles.flexItem}
                        />
                    </View>

                    <InputField
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="alex.martin@example.com"
                        colors={colors}
                        leftIcon="mail"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <InputField
                        label="Bio"
                        value={bio}
                        onChangeText={(text) => setBio(text.slice(0, MAX_BIO))}
                        placeholder="Fan de football et de rugby. Toujours prêt pour un match !"
                        colors={colors}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                        helperText={`${bio.length}/${MAX_BIO}`}
                    />

                    <InputField
                        label="Téléphone"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="+33 6 12 34 56 78"
                        colors={colors}
                        leftIcon="call"
                        keyboardType="phone-pad"
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: colors.primary }]}
                        activeOpacity={0.92}
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        <Text style={styles.submitText}>{isSaving ? "Enregistrement..." : "Valider"}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

type InputProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    colors: any;
    leftIcon?: keyof typeof MaterialIcons.glyphMap;
    helperText?: string;
    containerStyle?: any;
} & Omit<React.ComponentProps<typeof TextInput>, "style" | "placeholderTextColor">;

const InputField = ({ label, value, onChangeText, placeholder, leftIcon, colors, helperText, containerStyle = {}, ...rest }: InputProps) => {
    const isLight = colors.background === "#f8f7f5";
    const placeholderColor = isLight ? "rgba(15,23,42,0.45)" : "rgba(255,255,255,0.45)";
    return (
        <View style={[styles.inputBlock, containerStyle]}> 
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>{label}</Text>
            <View style={styles.inputWrapper}>
                {leftIcon && (
                    <MaterialIcons name={leftIcon} size={18} color={colors.textMuted} style={styles.leftIcon} />
                )}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderColor}
                    style={[
                        styles.input,
                        {
                            backgroundColor: colors.surfaceDark ?? colors.surface,
                            color: colors.text,
                            paddingLeft: leftIcon ? 46 : 20,
                        },
                    ]}
                    {...rest}
                />
            </View>
            {helperText ? <Text style={[styles.helperText, { color: colors.textMuted }]}>{helperText}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    headerButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 28,
    },
    avatarWrapper: {
        width: 128,
        height: 128,
    },
    avatar: {
        width: 128,
        height: 128,
    },
    avatarImage: {
        borderRadius: 64,
    },
    avatarBadge: {
        position: "absolute",
        bottom: -4,
        right: -4,
        width: 46,
        height: 46,
        borderRadius: 23,
        borderWidth: 4,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "rgba(0,0,0,0.45)",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
    },
    changePhotoText: {
        marginTop: 16,
        fontSize: 14,
        fontWeight: "600",
    },
    formCard: {
        gap: 18,
    },
    rowInputs: {
        flexDirection: "row",
        gap: 16,
    },
    flexItem: {
        flex: 1,
    },
    inputBlock: {
        width: "100%",
    },
    inputLabel: {
        fontSize: 12,
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 6,
        fontWeight: "600",
    },
    inputWrapper: {
        position: "relative",
    },
    leftIcon: {
        position: "absolute",
        left: 18,
        top: 20,
        opacity: 0.75,
    },
    input: {
        borderRadius: 24,
        paddingVertical: 16,
        paddingRight: 20,
        fontSize: 16,
        fontWeight: "600",
    },
    helperText: {
        fontSize: 11,
        textAlign: "right",
        marginTop: 6,
    },
    submitButton: {
        marginTop: 8,
        paddingVertical: 18,
        borderRadius: 32,
        alignItems: "center",
        shadowColor: "#f47b25",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
    },
    submitText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
    },
});

export default EditProfileScreen;
