import { View, Text, StyleSheet, Pressable, Modal, TextInput, ActivityIndicator, Alert } from "react-native";
import { useRef, useState } from "react";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../styles/theme";
import { channelService } from "../services/channel.service";

interface CreateChannelModalProps {
    visible: boolean;
    onClose: () => void;
    onChannelCreated: (channel?: any) => void;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        paddingTop: spacing.xl,
    },
    title: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeights.bold,
        color: colors.text.primary,
        marginBottom: spacing.lg,
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
        marginBottom: spacing.lg,
    },
    buttonRow: {
        flexDirection: "row",
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    button: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.border,
    },
    buttonText: {
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
        color: colors.surface,
    },
    buttonSecondaryText: {
        color: colors.text.primary,
    },
});

export default function CreateChannelModal({ visible, onClose, onChannelCreated }: CreateChannelModalProps) {
    const [channelName, setChannelName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreateChannel = async () => {
        const trimmedName = channelName.trim();
        if (!trimmedName) {
            Alert.alert("Error", "Channel name is required");
            return;
        }

        try {
            setLoading(true);
            const response = await channelService.createChannel(trimmedName, false);
            const created = response.data?.channel ?? response.data;
            Alert.alert("Success", `Channel "${trimmedName}" created successfully`);
            setChannelName("");
            onChannelCreated(created);
            onClose();
        } catch (error: any) {
            console.error("Error creating channel:", error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to create channel";
            Alert.alert("Error", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.container}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Create Channel</Text>

                    <Text style={styles.label}>Channel Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., general, announcements, random..."
                        placeholderTextColor={colors.text.light}
                        value={channelName}
                        onChangeText={setChannelName}
                        editable={!loading}
                        autoCapitalize="none"
                    />
                    <View style={styles.buttonRow}>
                        <Pressable
                            style={[styles.button, styles.buttonSecondary]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonPrimary]}
                            onPress={handleCreateChannel}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={colors.surface} />
                            ) : (
                                <Text style={styles.buttonText}>Create</Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
