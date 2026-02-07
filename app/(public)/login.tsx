import {
    Pressable,
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
    colors,
    spacing,
    fontSize,
    fontWeights,
    borderRadius,
} from "../../src/styles/theme";
import { authService } from "../../src/services/auth.service";
import { useAppDispatch } from "../../src/store/hooks";
import { setAuth } from "../../src/store/auth/auth.slice";

// 🔥 ADD THESE
import { registerForPushNotifications } from "../../src/services/pushNotifications";
import { apiClient } from "../../src/services/api.client";

WebBrowser.maybeCompleteAuthSession();

const WEB_CLIENT_ID =
    process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ||
    "8570226117-fo2jkarddg9846igpsos820f7rn7l3e7.apps.googleusercontent.com";

const ENABLE_GOOGLE_AUTH =
    process.env.EXPO_PUBLIC_ENABLE_GOOGLE_AUTH === "true";
const ENABLE_COMMUNITY_AUTH =
    process.env.EXPO_PUBLIC_ENABLE_COMMUNITY_AUTH === "true";

const getRedirectUri = () => {
    if (Platform.OS === "android") {
        return "com.viralijoshi.sarvadhifrontend:/oauth2redirect";
    }
    return "https://auth.expo.io/@viralijoshi/sarvadhi-frontend";
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.lg,
    },
    brandContainer: {
        marginBottom: spacing.xl,
        alignItems: "center",
    },
    brandTitle: {
        fontSize: fontSize["3xl"],
        fontWeight: fontWeights.bold,
        color: colors.primary,
        marginBottom: spacing.sm,
    },
    brandSubtitle: {
        fontSize: fontSize.lg,
        color: colors.text.secondary,
        textAlign: "center",
    },
    loginCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    featureList: {
        marginVertical: spacing.lg,
    },
    feature: {
        flexDirection: "row",
        marginVertical: spacing.md,
        alignItems: "center",
    },
    featureDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
        marginRight: spacing.md,
    },
    featureText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        flex: 1,
    },
    buttonContainer: {
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    button: {
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: spacing.sm,
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
    },
    buttonDisabled: {
        backgroundColor: colors.text.light,
    },
    buttonText: {
        color: colors.surface,
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        paddingHorizontal: spacing.md,
        color: colors.text.secondary,
        fontSize: fontSize.sm,
    },
});

export default function Login() {
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        scopes: ["openid", "profile", "email"],
        redirectUri: getRedirectUri(),
    });

    useEffect(() => {
        console.log("📱 Response changed:", response?.type);
        if (response?.type === "success") {
            console.log("✅ Google OAuth response received");
            handleGoogleResponse(response);
        } else if (response?.type === "error") {
            console.error("❌ Google OAuth error:", response.error);
            setError("Google login failed");
            setGoogleLoading(false);
        }
    }, [response]);

    const handleGoogleResponse = async (response: any) => {
        try {
            setGoogleLoading(true);
            console.log("🔐 Processing Google login...");

            const { id_token } = response.params;

            const authResponse = await authService.googleLogin(id_token);
            const raw = authResponse.data;

            const token =
                raw?.token ||
                raw?.accessToken ||
                raw?.jwt ||
                raw?.data?.token;

            const user = raw?.user || raw?.data?.user;

            if (!token) {
                setError("Login failed: missing token from server");
                return;
            }

            console.log("✅ Auth token received from backend");

            // 1️⃣ Save auth in Redux
            dispatch(setAuth({ token, user: user ?? null }));

            // 2️⃣ Attach JWT to API client
            apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;

            // 🔥 3️⃣ REGISTER + SEND FCM TOKEN
            try {
                console.log("🚀 About to call registerForPushNotifications...");
                const fcmToken = await registerForPushNotifications();
                console.log("🔥 FCM TOKEN:", fcmToken);

                if (fcmToken) {
                    console.log("📤 Sending token to backend...");
                    await apiClient.post("/users/push-token", {
                        token: fcmToken,
                        platform: Platform.OS,
                    });
                    console.log("✅ Token sent to backend successfully");
                }
            } catch (e) {
                console.error("❌ Failed to sync push token:", e);
            }

            // 4️⃣ Enter app
            router.replace("/(protected)/tabs/channels");
        } catch (err: any) {
            console.error("❌ Google login failed:", err);
            setError("Google login failed");
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            console.log("🔵 handleGoogleLogin called - initiating OAuth flow");
            setGoogleLoading(true);
            setError("");

            await SecureStore.deleteItemAsync("token");
            console.log("🔵 Calling promptAsync...");
            await promptAsync();
            console.log("🔵 promptAsync completed, waiting for response...");
        } catch (err: any) {
            console.error("❌ Error initiating Google login:", err);
            setError("Failed to initiate Google login");
            setGoogleLoading(false);
        }
    };

    const handleCommunityLogin = () => {
        router.push("/(public)/community-code");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.brandContainer}>
                <Text style={styles.brandTitle}>Sarvadhi</Text>
                <Text style={styles.brandSubtitle}>
                    Connect, Collaborate, Communicate
                </Text>
            </View>

            <View style={styles.loginCard}>
                <Text
                    style={{
                        fontSize: fontSize.lg,
                        fontWeight: fontWeights.semibold,
                        color: colors.text.primary,
                        marginBottom: spacing.md,
                    }}
                >
                    Welcome
                </Text>

                <View style={styles.featureList}>
                    <View style={styles.feature}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>Real-time messaging</Text>
                    </View>
                    <View style={styles.feature}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>
                            Channel collaboration
                        </Text>
                    </View>
                    <View style={styles.feature}>
                        <View style={styles.featureDot} />
                        <Text style={styles.featureText}>
                            Instant notifications
                        </Text>
                    </View>
                </View>

                {error ? (
                    <Text
                        style={{
                            color: colors.danger,
                            fontSize: fontSize.sm,
                            marginBottom: spacing.md,
                        }}
                    >
                        {error}
                    </Text>
                ) : null}

                <View style={styles.buttonContainer}>
                    {ENABLE_GOOGLE_AUTH ? (
                        <Pressable
                            style={[
                                styles.button,
                                styles.buttonPrimary,
                                (googleLoading || !request) &&
                                styles.buttonDisabled,
                            ]}
                            onPress={handleGoogleLogin}
                            disabled={googleLoading || !request}
                        >
                            {googleLoading ? (
                                <>
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.surface}
                                    />
                                    <Text style={styles.buttonText}>
                                        Signing in...
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.buttonText}>
                                    Continue with Google
                                </Text>
                            )}
                        </Pressable>
                    ) : null}

                    {ENABLE_GOOGLE_AUTH && ENABLE_COMMUNITY_AUTH ? (
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.dividerLine} />
                        </View>
                    ) : null}

                    {ENABLE_COMMUNITY_AUTH ? (
                        <Pressable
                            style={[
                                styles.button,
                                styles.buttonSecondary,
                            ]}
                            onPress={handleCommunityLogin}
                            disabled={googleLoading}
                        >
                            <Text style={styles.buttonText}>
                                Continue with Community Code
                            </Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>
        </SafeAreaView>
    );
}
