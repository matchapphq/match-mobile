import { useEffect, useState } from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import { useStore } from "../store/useStore";

interface AppleAuthResult {
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

const makeAppleSupportCode = (
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
    return `APL-${stagePart}-${statusPart}-${tsPart}-${digest}`;
};

const withSupportCode = (message: string, supportCode: string) =>
    `${message}\nCode support: ${supportCode}`;

export function useAppleAuth() {
    const loginWithApple = useStore((state) => state.loginWithApple);
    const [isAppleLoading, setIsAppleLoading] = useState(false);
    const [isAppleAvailable, setIsAppleAvailable] = useState(Platform.OS === "ios");

    useEffect(() => {
        let mounted = true;

        if (Platform.OS !== "ios") {
            setIsAppleAvailable(false);
            return () => {
                mounted = false;
            };
        }

        AppleAuthentication.isAvailableAsync()
            .then((available) => {
                if (mounted) {
                    setIsAppleAvailable(available);
                }
            })
            .catch(() => {
                if (mounted) {
                    setIsAppleAvailable(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, []);

    const signInWithApple = async (): Promise<AppleAuthResult> => {
        if (!isAppleAvailable) {
            const supportCode = makeAppleSupportCode("CFG", "apple_unavailable");
            const platformHint = Platform.OS === "ios" ? "indisponible" : "iOS uniquement";
            return {
                success: false,
                supportCode,
                error: withSupportCode(
                    `Apple Sign-In non disponible (${platformHint}).`,
                    supportCode
                ),
            };
        }

        setIsAppleLoading(true);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (!credential.identityToken) {
                const supportCode = makeAppleSupportCode("TOKN", "missing_identity_token");
                return {
                    success: false,
                    supportCode,
                    error: withSupportCode(
                        "Aucun identity token Apple recu.",
                        supportCode
                    ),
                };
            }

            const loginResult = await loginWithApple({
                idToken: credential.identityToken,
                firstName: credential.fullName?.givenName || undefined,
                lastName: credential.fullName?.familyName || undefined,
            });

            if (!loginResult.success) {
                const supportCode = makeAppleSupportCode(
                    "SRV",
                    loginResult.reason,
                    loginResult.status
                );
                console.error("Apple backend login rejected", {
                    supportCode,
                    status: loginResult.status,
                    reason: loginResult.reason,
                });
                return {
                    success: false,
                    supportCode,
                    error: withSupportCode(
                        "Connexion Apple refusee.",
                        supportCode
                    ),
                };
            }

            return { success: true };
        } catch (error: any) {
            if (error?.code === "ERR_REQUEST_CANCELED") {
                return { success: false, error: "Connexion Apple annulee." };
            }

            const supportCode = makeAppleSupportCode("EXCP", getErrorMessage(error));
            console.error("Apple OAuth error:", error);
            return {
                success: false,
                supportCode,
                error: withSupportCode("Connexion Apple impossible.", supportCode),
            };
        } finally {
            setIsAppleLoading(false);
        }
    };

    return {
        signInWithApple,
        isAppleLoading,
        isAppleAvailable,
    };
}
