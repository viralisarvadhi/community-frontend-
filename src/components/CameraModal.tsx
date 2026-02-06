import { View, Text, StyleSheet, Pressable, Modal, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../styles/theme";

interface CameraModalProps {
    visible: boolean;
    onClose: () => void;
    onPhotoTaken: (photoUri: string) => void;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    cameraContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: "row",
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        justifyContent: "space-around",
        alignItems: "center",
    },
    button: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: colors.text.primary,
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
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
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    permissionButtonText: {
        color: colors.surface,
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
    },
});

export default function CameraModal({ visible, onClose, onPhotoTaken }: CameraModalProps) {
    const cameraRef = useRef<CameraView>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);

    const takePicture = async () => {
        if (!cameraRef.current) return;

        try {
            setLoading(true);
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
            });

            if (photo?.uri) {
                onPhotoTaken(photo.uri);
                onClose();
            }
        } catch (error) {
            console.error("Error taking picture:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!permission) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>⏳ Loading camera...</Text>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </Modal>
        );
    }

    if (!permission.granted) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionText}>
                        📷 Camera access is required to take a photo
                    </Text>
                    <Pressable
                        style={styles.permissionButton}
                        onPress={requestPermission}
                    >
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
                <View style={styles.cameraContainer}>
                    <CameraView style={styles.camera} facing="front" ref={cameraRef} mode="picture" />
                    <View style={styles.buttonContainer}>
                        <Pressable style={styles.button} onPress={onClose} disabled={loading}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, { backgroundColor: colors.primary }]}
                            onPress={takePicture}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color={colors.surface} />
                            ) : (
                                <Text style={[styles.buttonText, { color: colors.surface }]}>
                                    📸 Take Photo
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
