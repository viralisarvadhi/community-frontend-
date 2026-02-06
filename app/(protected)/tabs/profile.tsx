import { View, Text, StyleSheet, Pressable, ScrollView, Image, Linking, Alert } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../../../src/styles/theme";
import { useAppDispatch, useAppSelector } from "../../../src/store/hooks";
import { logout } from "../../../src/store/auth/auth.slice";
import { authService } from "../../../src/services/auth.service";
import { useEffect, useState } from "react";
import CameraModal from "../../../src/components/CameraModal";
import ContactsModal from "../../../src/components/ContactsModal";
import GalleryModal from "../../../src/components/GalleryModal";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingVertical: spacing.md,
    },
    headerContainer: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        paddingTop: spacing.xl,
    },
    headerTitle: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeights.bold,
        color: colors.surface,
        marginBottom: spacing.md,
    },
    profileCard: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        marginVertical: spacing.lg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    profileField: {
        marginBottom: spacing.md,
    },
    fieldLabel: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        fontWeight: fontWeights.semibold,
        marginBottom: spacing.xs,
    },
    fieldValue: {
        fontSize: fontSize.base,
        color: colors.text.primary,
    },
    featureCard: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.secondary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    featureTitle: {
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    featureDescription: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.md,
    },
    photoPreview: {
        width: "100%",
        height: 200,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.md,
        backgroundColor: colors.border,
    },
    contactInfo: {
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
    },
    contactText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    button: {
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.md,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
    },
    logoutButton: {
        backgroundColor: colors.danger,
    },
    buttonText: {
        color: colors.surface,
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
    },
    buttonRow: {
        flexDirection: "row",
        gap: spacing.md,
        marginHorizontal: spacing.md,
    },
    buttonFlex: {
        flex: 1,
    },
});

export default function ProfileScreen() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const user = useAppSelector((state) => state.auth.user);
    const token = useAppSelector((state) => state.auth.token);
    const [resolvedUser, setResolvedUser] = useState(user);
    const [cameraModalVisible, setCameraModalVisible] = useState(false);
    const [contactsModalVisible, setContactsModalVisible] = useState(false);
    const [galleryModalVisible, setGalleryModalVisible] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [galleryPhotoUri, setGalleryPhotoUri] = useState<string | null>(null);
    const [selectedContact, setSelectedContact] = useState<{ name?: string; phoneNumber?: string; email?: string } | null>(null);

    useEffect(() => {
        setResolvedUser(user ?? null);
    }, [user]);

    const decodeTokenUser = (jwt?: string | null) => {
        if (!jwt) return null;
        const parts = jwt.split(".");
        if (parts.length < 2) return null;
        try {
            const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
            const json = globalThis.atob ? globalThis.atob(padded) : null;
            if (!json) return null;
            const payload = JSON.parse(json);
            return {
                id: payload.sub || payload.id || "token",
                name: payload.name || payload.fullName || payload.username || "",
                email: payload.email || "",
            };
        } catch {
            return null;
        }
    };

    useEffect(() => {
        if (resolvedUser) return;

        authService
            .getMe()
            .then((response) => {
                const data = response.data?.user ?? response.data;
                if (data?.name || data?.email) {
                    setResolvedUser(data);
                }
            })
            .catch(() => {
                const decoded = decodeTokenUser(token);
                if (decoded?.name || decoded?.email) {
                    setResolvedUser(decoded);
                }
            });
    }, [resolvedUser, token]);

    const handleLogout = () => {
        dispatch(logout());
        router.replace("/(public)/login");
    };

    const handlePhotoTaken = (uri: string) => {
        setPhotoUri(uri);
        console.log("Photo taken:", uri);
    };

    const handlePhotoSelected = (uri: string) => {
        setGalleryPhotoUri(uri);
        console.log("Photo selected from gallery:", uri);
    };

    const handleContactSelected = (contact: any) => {
        setSelectedContact(contact);
        setContactsModalVisible(false);
        console.log("Contact selected:", contact);

        // Automatically call the contact
        if (contact.phoneNumber) {
            Linking.openURL(`tel:${contact.phoneNumber}`);
        } else {
            Alert.alert("No Phone Number", "This contact doesn't have a phone number");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* User Info Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileField}>
                        <Text style={styles.fieldLabel}>Name</Text>
                        <Text style={styles.fieldValue}>{resolvedUser?.name || "-"}</Text>
                    </View>
                    <View style={styles.profileField}>
                        <Text style={styles.fieldLabel}>Email</Text>
                        <Text style={styles.fieldValue}>{resolvedUser?.email || "-"}</Text>
                    </View>
                    <View style={styles.profileField}>
                        <Text style={styles.fieldLabel}>Status</Text>
                        <Text style={styles.fieldValue}>{resolvedUser ? "Active" : "Guest"}</Text>
                    </View>
                </View>

                {/* Camera Feature */}
                <View style={styles.featureCard}>
                    <Text style={styles.featureTitle}>📷 Camera Access</Text>
                    <Text style={styles.featureDescription}>
                        Take a photo with your device camera and display it
                    </Text>
                    {photoUri && (
                        <>
                            <Image
                                source={{ uri: photoUri }}
                                style={styles.photoPreview}
                            />
                            <Text style={styles.contactText}>✅ Photo captured successfully</Text>
                        </>
                    )}
                    <Pressable
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={() => setCameraModalVisible(true)}
                    >
                        <Text style={styles.buttonText}>Access Camera</Text>
                    </Pressable>
                </View>

                {/* Gallery Feature */}
                <View style={styles.featureCard}>
                    <Text style={styles.featureTitle}>🖼️ Gallery Access</Text>
                    <Text style={styles.featureDescription}>
                        Pick a photo from your device gallery
                    </Text>
                    {galleryPhotoUri && (
                        <>
                            <Image
                                source={{ uri: galleryPhotoUri }}
                                style={styles.photoPreview}
                            />
                            <Text style={styles.contactText}>✅ Photo selected successfully</Text>
                        </>
                    )}
                    <Pressable
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={() => setGalleryModalVisible(true)}
                    >
                        <Text style={styles.buttonText}>Access Gallery</Text>
                    </Pressable>
                </View>

                {/* Contacts Feature */}
                <View style={styles.featureCard}>
                    <Text style={styles.featureTitle}>📇 Contacts Access</Text>
                    <Text style={styles.featureDescription}>
                        Access your device contacts and select one
                    </Text>
                    {selectedContact && (
                        <View style={styles.contactInfo}>
                            {selectedContact.name && (
                                <Text style={styles.contactText}>
                                    👤 Name: {selectedContact.name}
                                </Text>
                            )}
                            {selectedContact.phoneNumber && (
                                <Text style={styles.contactText}>
                                    📱 Phone: {selectedContact.phoneNumber}
                                </Text>
                            )}
                            {selectedContact.email && (
                                <Text style={styles.contactText}>
                                    📧 Email: {selectedContact.email}
                                </Text>
                            )}
                        </View>
                    )}
                    <Pressable
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={() => setContactsModalVisible(true)}
                    >
                        <Text style={styles.buttonText}>📞 Call Contact</Text>
                    </Pressable>
                </View>

                {/* Logout Button */}
                <View style={{ marginVertical: spacing.lg }}>
                    <Pressable style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Modals */}
            <CameraModal
                visible={cameraModalVisible}
                onClose={() => setCameraModalVisible(false)}
                onPhotoTaken={handlePhotoTaken}
            />
            <ContactsModal
                visible={contactsModalVisible}
                onClose={() => setContactsModalVisible(false)}
                onContactSelected={handleContactSelected}
            />
            <GalleryModal
                visible={galleryModalVisible}
                onClose={() => setGalleryModalVisible(false)}
                onPhotoSelected={handlePhotoSelected}
            />
        </View>
    );
}
