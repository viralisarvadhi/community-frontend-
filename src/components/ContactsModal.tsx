import { View, Text, StyleSheet, Pressable, Modal, FlatList, ActivityIndicator } from "react-native";
import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../styles/theme";

interface Contact {
    id: string;
    name?: string;
    phoneNumber?: string;
    email?: string;
}

interface ContactsModalProps {
    visible: boolean;
    onClose: () => void;
    onContactSelected: (contact: Contact) => void;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.secondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        paddingTop: spacing.xl,
    },
    headerTitle: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeights.bold,
        color: colors.surface,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
    },
    permissionText: {
        fontSize: fontSize.lg,
        color: colors.text.primary,
        textAlign: "center",
        marginBottom: spacing.lg,
    },
    permissionButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.secondary,
        justifyContent: "center",
        alignItems: "center",
    },
    permissionButtonText: {
        color: colors.surface,
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
    },
    contactItem: {
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
    contactName: {
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    contactInfo: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    footerButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.border,
        marginHorizontal: spacing.md,
        marginVertical: spacing.md,
        justifyContent: "center",
        alignItems: "center",
    },
    footerButtonText: {
        color: colors.text.primary,
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
    },
});

export default function ContactsModal({ visible, onClose, onContactSelected }: ContactsModalProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        if (!visible) return;

        const loadContacts = async () => {
            try {
                setLoading(true);
                const { status } = await Contacts.requestPermissionsAsync();

                if (status === "granted") {
                    setHasPermission(true);
                    const { data } = await Contacts.getContactsAsync({
                        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
                    });

                    const formattedContacts: Contact[] = data
                        .filter((contact: any) => contact.name)
                        .map((contact: any) => ({
                            id: contact.id || Math.random().toString(),
                            name: contact.name,
                            phoneNumber: contact.phoneNumbers?.[0]?.number,
                            email: contact.emails?.[0]?.email,
                        }));

                    setContacts(formattedContacts);
                } else {
                    setHasPermission(false);
                }
            } catch (error) {
                console.error("Error loading contacts:", error);
                setHasPermission(false);
            } finally {
                setLoading(false);
            }
        };

        loadContacts();
    }, [visible]);

    const handleRequestPermission = async () => {
        try {
            setLoading(true);
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
                setHasPermission(true);
                // Reload contacts
                const { data } = await Contacts.getContactsAsync({
                    fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
                });

                const formattedContacts: Contact[] = data
                    .filter((contact: any) => contact.name)
                    .map((contact: any) => ({
                        id: contact.id || Math.random().toString(),
                        name: contact.name,
                        phoneNumber: contact.phoneNumbers?.[0]?.number,
                        email: contact.emails?.[0]?.email,
                    }));

                setContacts(formattedContacts);
            }
        } catch (error) {
            console.error("Error requesting permission:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.secondary} />
                    <Text style={[styles.permissionText, { marginTop: spacing.md }]}>
                        Loading contacts...
                    </Text>
                </View>
            </Modal>
        );
    }

    if (hasPermission === false) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>
                        📇 Contacts access is required to select a contact
                    </Text>
                    <Pressable style={styles.permissionButton} onPress={handleRequestPermission}>
                        <Text style={styles.permissionButtonText}>Grant Permission</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.permissionButton, { backgroundColor: colors.border, marginTop: spacing.md }]}
                        onPress={onClose}
                    >
                        <Text style={[styles.permissionButtonText, { color: colors.text.primary }]}>
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Select Contact</Text>
                </View>

                {contacts.length === 0 ? (
                    <View style={styles.permissionContainer}>
                        <Text style={styles.permissionText}>No contacts found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={contacts}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Pressable
                                style={styles.contactItem}
                                onPress={() => onContactSelected(item)}
                            >
                                <Text style={styles.contactName}>{item.name}</Text>
                                {item.phoneNumber && (
                                    <Text style={styles.contactInfo}>📱 {item.phoneNumber}</Text>
                                )}
                                {item.email && (
                                    <Text style={styles.contactInfo}>📧 {item.email}</Text>
                                )}
                            </Pressable>
                        )}
                        contentContainerStyle={{ paddingVertical: spacing.md }}
                    />
                )}

                <Pressable style={styles.footerButton} onPress={onClose}>
                    <Text style={styles.footerButtonText}>Cancel</Text>
                </Pressable>
            </View>
        </Modal>
    );
}
