import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../styles/theme";

interface GalleryModalProps {
    visible: boolean;
    onClose: () => void;
    onPhotoSelected: (photoUri: string) => void;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
});

export default function GalleryModal({ visible, onClose, onPhotoSelected }: GalleryModalProps) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            pickImage();
        }
    }, [visible]);

    const pickImage = async () => {
        try {
            setLoading(true);
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                console.log("Gallery permission denied");
                setLoading(false);
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                onPhotoSelected(result.assets[0].uri);
            }
            onClose();
        } catch (error) {
            console.error("Error picking image:", error);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible && loading} transparent animationType="fade">
            <View style={styles.permissionContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={[styles.permissionText, { marginTop: spacing.md }]}>
                    Opening gallery...
                </Text>
            </View>
        </Modal>
    );
}
