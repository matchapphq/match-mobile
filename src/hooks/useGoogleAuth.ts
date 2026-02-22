import { useMemo, useState } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { exchangeCodeAsync, ResponseType } from "expo-auth-session";
import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
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

const buildExpoProxyStartUrl = (
    projectNameForProxy: string,
    authUrl: string,
    returnUrl: string
) => {
    const queryString = new URLSearchParams({
        authUrl,
        returnUrl,
    }).toString();
    return `https://auth.expo.io/${projectNameForProxy}/start?${queryString}`;
};

export function useGoogleAuth() {
    const loginWithGoogle = useStore((state) => state.loginWithGoogle);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

    const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    const googleExpoClientId = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID;
    const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
    const explicitExpoProjectFullName = process.env.EXPO_PUBLIC_EXPO_PROJECT_FULL_NAME;

    const expoProjectFullName = useMemo(() => {
        if (!isExpoGo) return undefined;

        const fromEnv = explicitExpoProjectFullName?.trim();
        if (fromEnv) return fromEnv;

        const fromExpoConfig = Constants.expoConfig?.originalFullName?.trim();
        if (fromExpoConfig) return fromExpoConfig;

        const slug = Constants.expoConfig?.slug?.trim();
        if (slug) return `@anonymous/${slug}`;

        return undefined;
    }, [explicitExpoProjectFullName, isExpoGo]);

    const expoProxyRedirectUri = useMemo(() => {
        if (!isExpoGo || !expoProjectFullName) return undefined;
        return `https://auth.expo.io/${expoProjectFullName}`;
    }, [expoProjectFullName, isExpoGo]);

    const expoReturnUrl = useMemo(() => {
        if (!isExpoGo) return undefined;
        try {
            return AuthSession.getDefaultReturnUrl();
        } catch {
            return AuthSession.makeRedirectUri();
        }
    }, [isExpoGo]);

    const effectiveClientIds = useMemo(
        () => ({
            web: googleWebClientId || undefined,
            expo: googleExpoClientId || undefined,
            ios: googleIosClientId || undefined,
            android: googleAndroidClientId || undefined,
        }),
        [googleWebClientId, googleExpoClientId, googleIosClientId, googleAndroidClientId]
    );

    const platformClientId = useMemo(
        () => {
            if (isExpoGo) {
                return effectiveClientIds.expo;
            }

            return Platform.select({
                ios: effectiveClientIds.ios,
                android: effectiveClientIds.android,
                default: effectiveClientIds.web,
            });
        },
        [effectiveClientIds, isExpoGo]
    );

    const authRequestConfig = useMemo(
        () =>
            isExpoGo
                ? {
                      clientId: effectiveClientIds.expo,
                      redirectUri: expoProxyRedirectUri,
                      responseType: ResponseType.IdToken,
                      shouldAutoExchangeCode: false,
                      scopes: ["openid", "profile", "email"],
                  }
                : {
                      webClientId: effectiveClientIds.web,
                      iosClientId: effectiveClientIds.ios,
                      androidClientId: effectiveClientIds.android,
                      scopes: ["openid", "profile", "email"],
                  },
        [effectiveClientIds, expoProxyRedirectUri, isExpoGo]
    );

    const [request, , promptAsync] = Google.useAuthRequest(authRequestConfig);

    const isGoogleConfigured = Boolean(
        platformClientId &&
            (!isExpoGo || (expoProjectFullName && expoProxyRedirectUri && expoReturnUrl))
    );

    const signInWithGoogle = async (): Promise<GoogleAuthResult> => {
        if (!isGoogleConfigured) {
            const missingVarByPlatform = isExpoGo
                ? !effectiveClientIds.expo
                    ? "EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID"
                    : !expoProjectFullName
                      ? "EXPO_PUBLIC_EXPO_PROJECT_FULL_NAME (@owner/slug)"
                      : "Expo return URL"
                : Platform.select({
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
            const promptOptions =
                isExpoGo && request.url && expoReturnUrl && expoProjectFullName
                    ? {
                          url: buildExpoProxyStartUrl(
                              expoProjectFullName,
                              request.url,
                              expoReturnUrl
                          ),
                      }
                    : undefined;

            const result = await promptAsync(promptOptions);

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
            if (!isExpoGo && !idToken && response.params?.code && request && platformClientId) {
                try {
                    const extraParams: Record<string, string> = {};
                    if (request.codeVerifier) {
                        extraParams.code_verifier = request.codeVerifier;
                    }

                    const tokenResponse = await exchangeCodeAsync(
                        {
                            clientId: platformClientId,
                            code: response.params.code,
                            redirectUri: request.redirectUri,
                            extraParams,
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
