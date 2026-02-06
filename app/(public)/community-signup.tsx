import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
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
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    header: {
        marginBottom: spacing.xl,
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
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginVertical: spacing.md,
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
        marginBottom: spacing.md,
    },
    button: {
        marginTop: spacing.lg,
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
    buttonSecondary: {
        backgroundColor: colors.border,
        marginTop: spacing.md,
    },
    buttonText: {
        color: colors.surface,
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
    },
    buttonSecondaryText: {
        color: colors.text.primary,
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
    },
    errorText: {
        color: colors.danger,
        fontSize: fontSize.sm,
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
    infoBox: {
        backgroundColor: colors.background,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        marginVertical: spacing.md,
    },
    infoText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        lineHeight: 20,
    },
});

export default function CommunitySignupScreen() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        communityCode: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
    const dispatch = useAppDispatch();

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.communityCode.trim()) {
            newErrors.communityCode = "Community code is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            setErrors({});

            await SecureStore.deleteItemAsync("token");

            console.log("Attempting signup with:", {
                name: formData.name,
                email: formData.email,
                communityCode: formData.communityCode,
            });

            const response = await authService.communitySignup(
                formData.name,
                formData.email,
                formData.communityCode
            );

            console.log("Signup response:", response.data);

            const raw = response.data;
            const token = raw?.token || raw?.accessToken || raw?.jwt || raw?.data?.token;
            const responseUser = raw?.user || raw?.data?.user;

            if (!token) {
                setErrors({ submit: "Signup failed: missing token from server" });
                return;
            }

            console.log("=== AUTH DEBUG ===");
            console.log("Token from response:", token ? "YES (length: " + token.length + ")" : "NO");
            const fallbackUser = responseUser ?? {
                id: "local",
                name: formData.name,
                email: formData.email,
            };

            console.log("User from response:", responseUser);
            console.log("User used for state:", fallbackUser);
            console.log("About to dispatch setAuth...");

            // Store auth state
            dispatch(setAuth({ token, user: fallbackUser }));

            console.log("setAuth dispatched");
            console.log("==================");

            // Navigate to main app
            router.replace("/(protected)/tabs/channels");
        } catch (err: any) {
            console.error("Signup error - Full error:", JSON.stringify(err, null, 2));
            console.error("Error message:", err?.message);
            console.error("Error code:", err?.code);
            console.error("Error response:", err?.response);
            console.error("Error request:", err?.request);

            let errorMessage = "Signup failed";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network')) {
                errorMessage = "Network error - Cannot connect to server at 192.168.1.105:4000";
            } else if (err.message) {
                errorMessage = `Error: ${err.message}`;
            } else if (!err.response) {
                errorMessage = "Network error - Cannot connect to server";
            }

            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join the Sarvadhi community</Text>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        📝 Fill in your details and enter your community code to join
                    </Text>
                </View>

                {errors.submit ? (
                    <View style={styles.card}>
                        <Text style={styles.errorText}>{errors.submit}</Text>
                    </View>
                ) : null}

                <View style={styles.card}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Your name"
                        placeholderTextColor={colors.text.light}
                        value={formData.name}
                        onChangeText={(text) => {
                            setFormData({ ...formData, name: text });
                            if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        editable={!loading}
                    />
                    {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="your.email@example.com"
                        placeholderTextColor={colors.text.light}
                        value={formData.email}
                        onChangeText={(text) => {
                            setFormData({ ...formData, email: text.toLowerCase() });
                            if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        keyboardType="email-address"
                        editable={!loading}
                    />
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                    <Text style={styles.label}>Community Code</Text>
                    <TextInput
                        style={[styles.input, { fontFamily: "Courier New", letterSpacing: 2 }]}
                        placeholder="XXXXXXXX"
                        placeholderTextColor={colors.text.light}
                        value={formData.communityCode}
                        onChangeText={(text) => {
                            setFormData({ ...formData, communityCode: text.toUpperCase() });
                            if (errors.communityCode) setErrors({ ...errors, communityCode: "" });
                        }}
                        editable={!loading}
                        maxLength={12}
                    />
                    {errors.communityCode ? (
                        <Text style={styles.errorText}>{errors.communityCode}</Text>
                    ) : null}
                </View>

                <Pressable
                    style={[
                        styles.button,
                        styles.buttonPrimary,
                        loading && styles.buttonDisabled,
                    ]}
                    onPress={handleSignup}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator size="small" color={colors.surface} />
                            <Text style={styles.buttonText}>Joining...</Text>
                        </>
                    ) : (
                        <Text style={styles.buttonText}>Join Community</Text>
                    )}
                </Pressable>

                <Pressable
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={handleBack}
                    disabled={loading}
                >
                    <Text style={styles.buttonSecondaryText}>Back</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}