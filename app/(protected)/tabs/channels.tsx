import { FlatList, Text, Pressable, View, StyleSheet, Alert, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { addChannel, fetchChannels, touchChannels } from "../../../src/store/channels/channels.slice";
import { useAppDispatch, useAppSelector } from "../../../src/store/hooks";
import { useRouter } from "expo-router";
import { commonStyles } from "../../../src/styles/common";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../../../src/styles/theme";
import CreateChannelModal from "../../../src/components/CreateChannelModal";
import { channelService } from "../../../src/services/channel.service";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
    },
    channelItem: {
        backgroundColor: colors.surface,
        marginHorizontal: spacing.md,
        marginVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    channelInfo: {
        flex: 1,
        paddingRight: spacing.md,
    },
    deleteButton: {
        backgroundColor: colors.danger,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    deleteButtonText: {
        color: colors.surface,
        fontSize: fontSize.sm,
        fontWeight: fontWeights.semibold,
    },
    leaveButton: {
        backgroundColor: colors.secondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    leaveButtonText: {
        color: colors.surface,
        fontSize: fontSize.sm,
        fontWeight: fontWeights.semibold,
    },
    channelName: {
        fontSize: fontSize.base,
        fontWeight: fontWeights.semibold,
        color: colors.text.primary,
        marginBottom: spacing.xs,
    },
    channelCount: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.md,
    },
    emptyText: {
        fontSize: fontSize.lg,
        color: colors.text.secondary,
    },
    headerTop: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        paddingTop: spacing.xl,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    createButton: {
        backgroundColor: colors.secondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    createButtonText: {
        color: colors.surface,
        fontSize: fontSize.sm,
        fontWeight: fontWeights.semibold,
    },
});

export default function Channels() {
    const dispatch = useAppDispatch();
    const channels = useAppSelector((s) => s.channels.list);
    const currentUser = useAppSelector((s) => s.auth.user);
    const router = useRouter();
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(fetchChannels());
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchChannels());
        setRefreshing(false);
    };

    const handleChannelCreated = (channel?: any) => {
        if (channel) {
            dispatch(addChannel(channel));
        }
        dispatch(fetchChannels());
        dispatch(touchChannels());
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Channels</Text>
                <Pressable
                    style={styles.createButton}
                    onPress={() => setCreateModalVisible(true)}
                >
                    <Text style={styles.createButtonText}>+ Create</Text>
                </Pressable>
            </View>
            <FlatList
                data={channels}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => {
                    // Check if user is the creator - compare with multiple possible field names
                    const isCreator =
                        item.createdBy === currentUser?.id ||
                        item.ownerId === currentUser?.id ||
                        item.creator?.id === currentUser?.id ||
                        item.owner?.id === currentUser?.id ||
                        item.userId === currentUser?.id;

                    // Debug log to see what fields are available
                    if (!isCreator) {
                        console.log("Channel item fields:", Object.keys(item), "Current user:", currentUser?.id);
                    }

                    return (
                        <View style={styles.channelItem}>
                            <Pressable
                                onPress={() => router.push(`/chat/${item.id}`)}
                                style={({ pressed }) => [
                                    styles.channelInfo,
                                    { opacity: pressed ? 0.7 : 1 },
                                ]}
                            >
                                <Text style={styles.channelName}># {item.name}</Text>
                                <Text style={styles.channelCount}>Tap to open</Text>
                            </Pressable>
                            <Pressable
                                style={styles.leaveButton}
                                onPress={() => {
                                    Alert.alert(
                                        "Leave channel",
                                        `Leave "${item.name}"?`,
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            {
                                                text: "Leave",
                                                style: "destructive",
                                                onPress: async () => {
                                                    try {
                                                        await channelService.leaveChannel(item.id);
                                                        dispatch(fetchChannels());
                                                        dispatch(touchChannels());
                                                        Alert.alert("Success", "Left channel");
                                                    } catch (err: any) {
                                                        console.error("Leave error:", err);
                                                        const message =
                                                            err?.response?.data?.message ||
                                                            err?.response?.data?.error ||
                                                            err?.message ||
                                                            "Failed to leave channel";
                                                        Alert.alert("Error", message);
                                                    }
                                                },
                                            },
                                        ]
                                    );
                                }}
                            >
                                <Text style={styles.leaveButtonText}>Leave</Text>
                            </Pressable>
                        </View>
                    );
                }}
                contentContainerStyle={{ paddingVertical: spacing.md }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No channels available</Text>
                    </View>
                }
            />
            <CreateChannelModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
                onChannelCreated={handleChannelCreated}
            />
        </View>
    );
}
