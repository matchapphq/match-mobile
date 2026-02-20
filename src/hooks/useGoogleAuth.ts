import { useMemo, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { exchangeCodeAsync } from "expo-auth-session";
import { Platform } from "react-native";
import { useStore } from "../store/useStore";

WebBrowser.maybeCompleteAuthSession();

interface GoogleAuthResult {
    success: boolean;
    error?: string;
    supportCode?: string;
}

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === "string") {
        return error;
    }

    try {
        return JSON.stringify(error);
    } catch {
        return "unknown_error";
    }
};

const hashSupportPayload = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash.toString(36).toUpperCase().padStart(6, "0").slice(-6);
};

const makeGoogleSupportCode = (
    stage: string,
    reason?: string,
    status?: number
) => {
    const stagePart = stage.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 4) || "UNKN";
    const statusPart = typeof status === "number" ? String(status).padStart(3, "0") : "000";
    const tsPart = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, "")
        .slice(2, 14);
    const digest = hashSupportPayload(`${stagePart}|${statusPart}|${reason || ""}|${tsPart}`);
    return `GGL-${stagePart}-${statusPart}-${tsPart}-${digest}`;
};

const withSupportCode = (message: string, supportCode: string) =>
    `${message}\nCode support: ${supportCode}`;

export function useGoogleAuth() {
    const loginWithGoogle = useStore((state) => state.loginWithGoogle);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

    const effectiveClientIds = useMemo(
        () => ({
            web: googleWebClientId || undefined,
            ios: googleIosClientId || undefined,
            android: googleAndroidClientId || undefined,
        }),
        [googleWebClientId, googleIosClientId, googleAndroidClientId]
    );

    const platformClientId = useMemo(
        () =>
            Platform.select({
                ios: effectiveClientIds.ios,
                android: effectiveClientIds.android,
                default: effectiveClientIds.web,
            }),
        [effectiveClientIds]
    );

    const [request, , promptAsync] = Google.useAuthRequest({
        webClientId: effectiveClientIds.web,
        iosClientId: effectiveClientIds.ios,
        androidClientId: effectiveClientIds.android,
        scopes: ["openid", "profile", "email"],
    });

    const isGoogleConfigured = Boolean(platformClientId);

    const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
        if (!isGoogleConfigured) {
            const missingVarByPlatform = Platform.select({
                ios: "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID",
                android: "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID",
                default: "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
            });
            const supportCode = makeGoogleSupportCode(
                "CFG",
                missingVarByPlatform
            );
            return {
                success: false,
                supportCode,
                error: withSupportCode(
                    `Google OAuth non configuré (${missingVarByPlatform}).`,
                    supportCode
                ),
            };
        }

        if (!request) {
            const supportCode = makeGoogleSupportCode("RDY", "request_not_ready");
            return {
                success: false,
                supportCode,
                error: withSupportCode("Google OAuth pas encore prêt.", supportCode),
            };
        }

        setIsGoogleLoading(true);
        try {
            const result = await promptAsync();

            if (result.type !== "success") {
                return { success: false, error: "Connexion Google annulée." };
            }

            const response = result as {
                authentication?: { idToken?: string | null };
                params?: Record<string, string | undefined>;
            };
            let idToken = response.authentication?.idToken || response.params?.id_token;
            let exchangeFailureReason: string | undefined;

            // Native Google flow frequently returns an auth code first.
            // Exchange it explicitly to obtain the id_token required by our backend.
            if (!idToken && response.params?.code && request && platformClientId) {
                try {
                    const tokenResponse = await exchangeCodeAsync(
                        {
                            clientId: platformClientId,
                            code: response.params.code,
                            redirectUri: request.redirectUri,
                            extraParams: {
                                code_verifier: request.codeVerifier || "",
                            },
                        },
                        Google.discovery
                    );
                    idToken = tokenResponse.idToken;
                } catch (exchangeError) {
                    exchangeFailureReason = getErrorMessage(exchangeError);
                    console.error("Google OAuth code exchange error:", exchangeError);
                }
            }

            if (!idToken) {
                const supportCode = makeGoogleSupportCode(
                    "TOKN",
                    exchangeFailureReason || "missing_id_token"
                );
                return {
                    success: false,
                    supportCode,
                    error: withSupportCode(
                        "Aucun id_token Google recu (echange OAuth incomplet).",
                        supportCode
                    ),
                };
            }

            const loginResult = await loginWithGoogle(idToken);
            if (!loginResult.success) {
                const supportCode = makeGoogleSupportCode(
                    "SRV",
                    loginResult.reason,
                    loginResult.status
                );
                console.error("Google backend login rejected", {
                    supportCode,
                    status: loginResult.status,
                    reason: loginResult.reason,
                });
                return {
                    success: false,
                    supportCode,
                    error: withSupportCode(
                        "Connexion Google refusee.",
                        supportCode
                    ),
                };
            }

            return { success: true };
        } catch (error) {
            const supportCode = makeGoogleSupportCode("EXCP", getErrorMessage(error));
            console.error("Google OAuth error:", error);
            return {
                success: false,
                supportCode,
                error: withSupportCode("Connexion Google impossible.", supportCode),
            };
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return {
        signInWithGoogle,
        isGoogleLoading,
        isGoogleConfigured,
    };
}
