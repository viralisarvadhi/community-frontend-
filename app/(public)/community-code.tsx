import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../../src/styles/theme";
import { authService } from "../../src/services/auth.service";
import { useAppDispatch } from "../../src/store/hooks";
import { setAuth } from "../../src/store/auth/auth.slice";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
    },
    header: {
        marginVertical: spacing.xl,
    },
    title: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeights.bold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.text.secondary,
        lineHeight: 22,
    },
    hint: {
        fontSize: fontSize.sm,
        color: colors.text.light,
        fontStyle: "italic",
        marginTop: spacing.sm,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginVertical: spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeights.semibold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    input: {
        fontSize: fontSize.base,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        color: colors.text.primary,
        fontFamily: "Courier New",
        letterSpacing: 2,
        textAlign: "center",
    },
    button: {
        marginTop: spacing.xl,
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
    buttonDisabled: {
        backgroundColor: colors.text.light,
    },
    buttonText: {
        color: colors.surface,
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: spacing.xl,
        gap: spacing.sm,
    },
    footerText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    footerLink: {
        fontSize: fontSize.sm,
        color: colors.primary,
        fontWeight: fontWeights.semibold,
    },
    errorText: {
        color: colors.danger,
        fontSize: fontSize.sm,
        marginTop: spacing.sm,
    },
});

export default function CommunityCodeScreen() {
    const [communityCode, setCommunityCode] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleContinue = async () => {
        if (!communityCode.trim()) {
            setError("Please enter a community code");
            return;
        }
        if (!email.trim()) {
            setError("Please enter your email");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await SecureStore.deleteItemAsync("token");

            console.log("Attempting login with community code:", communityCode);

            const response = await authService.communityCommunityLogin(communityCode, email);

            console.log("Login response:", response.data);

            const raw = response.data;
            const token = raw?.token || raw?.accessToken || raw?.jwt || raw?.data?.token;
            const user = raw?.user || raw?.data?.user;

            if (!token) {
                setError("Login failed: missing token from server");
                return;
            }

            console.log("=== AUTH DEBUG ===");
            console.log("Token from response:", token ? "YES (length: " + token.length + ")" : "NO");
            console.log("User from response:", user);
            console.log("About to dispatch setAuth...");

            // Store auth state
            dispatch(setAuth({ token, user: user ?? null }));

            console.log("setAuth dispatched");
            console.log("==================");

            // Navigate to main app
            router.replace("/(protected)/tabs/channels");
        } catch (err: any) {
            console.error("Login error:", err);
            console.error("Error response:", err.response?.data);

            let errorMessage = "Invalid community code";

            if (err.response?.data?.message) {
                if (err.response.data.message.includes("not found")) {
                    errorMessage = "User not found. Please sign up first or check your email.";
                } else if (err.response.data.error?.includes("does not exist")) {
                    errorMessage = "Server configuration error. Please contact support.";
                } else {
                    errorMessage = err.response.data.message;
                }
            } else if (!err.response) {
                errorMessage = "Network error - Cannot connect to server";
            }

            setError(errorMessage);
            setCommunityCode("");
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = () => {
        router.push("/(public)/community-signup");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Join Sarvadhi</Text>
                <Text style={styles.subtitle}>Enter the Sarvadhi community code to join</Text>
                <Text style={styles.hint}>Internal community access only</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="your.email@example.com"
                    placeholderTextColor={colors.text.light}
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text.toLowerCase());
                        setError("");
                    }}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Community Code</Text>
                <TextInput
                    style={styles.input}
                    placeholder="XXXXXXXX"
                    placeholderTextColor={colors.text.light}
                    value={communityCode}
                    onChangeText={(text) => {
                        setCommunityCode(text.toUpperCase());
                        setError("");
                    }}
                    editable={!loading}
                    maxLength={12}
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <Pressable
                style={[
                    styles.button,
                    loading || !communityCode.trim()
                        ? styles.buttonDisabled
                        : styles.buttonPrimary,
                ]}
                onPress={handleContinue}
                disabled={loading || !communityCode.trim()}
            >
                {loading ? (
                    <>
                        <ActivityIndicator size="small" color={colors.surface} />
                        <Text style={styles.buttonText}>Continuing...</Text>
                    </>
                ) : (
                    <Text style={styles.buttonText}>Continue</Text>
                )}
            </Pressable>

            <View style={styles.footer}>
                <Text style={styles.footerText}>New to Sarvadhi?</Text>
                <Pressable onPress={handleSignup} disabled={loading}>
                    <Text style={styles.footerLink}>Join here</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}