import { View, Text, StyleSheet, FlatList, Pressable, Alert, RefreshControl } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../../../src/styles/theme";
import { channelService } from "../../../src/services/channel.service";
import { useAppDispatch, useAppSelector } from "../../../src/store/hooks";
import { fetchChannels } from "../../../src/store/channels/channels.slice";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
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
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: fontSize.lg,
        color: colors.text.secondary,
        textAlign: "center",
    },
    channelItem: {
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
});

export default function ExploreScreen() {
    const [allChannels, setAllChannels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const channelsUpdatedAt = useAppSelector((s) => s.channels.lastUpdated);

    const loadChannels = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const allRes = await channelService.getAllChannels();
            setAllChannels(allRes.data || []);
        } catch (err) {
            setError("Failed to load channels");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChannels();
    }, [loadChannels, channelsUpdatedAt]);

    useFocusEffect(
        useCallback(() => {
            loadChannels();
        }, [loadChannels])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadChannels();
        setRefreshing(false);
    };

    const data = allChannels;

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Explore</Text>
            </View>

            {loading ? (
                <View style={styles.contentContainer}>
                    <Text style={styles.emptyText}>Loading channels...</Text>
                </View>
            ) : error ? (
                <View style={styles.contentContainer}>
                    <Text style={styles.emptyText}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => {
                                Alert.alert(
                                    "Join channel",
                                    `Do you want to join "#${item.name || item.title}"?`,
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                            text: "Join",
                                            style: "default",
                                            onPress: async () => {
                                                try {
                                                    await channelService.joinChannel(item.id);
                                                    // Refresh my channels so it appears in Channels tab
                                                    dispatch(fetchChannels());
                                                    router.push(`/chat/${item.id}`);
                                                } catch (err: any) {
                                                    console.error("Failed to join channel:", err);
                                                    const message =
                                                        err?.response?.data?.message ||
                                                        err?.response?.data?.error ||
                                                        err?.message ||
                                                        "Failed to join channel";
                                                    Alert.alert("Error", message);
                                                }
                                            },
                                        },
                                    ]
                                );
                            }}
                            style={({ pressed }) => [
                                styles.channelItem,
                                { opacity: pressed ? 0.7 : 1 },
                            ]}
                        >
                            <Text style={styles.channelName}># {item.name || item.title}</Text>
                            <Text style={styles.channelCount}>Channel</Text>
                        </Pressable>
                    )}
                    contentContainerStyle={{ paddingVertical: spacing.md }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.secondary}
                            colors={[colors.secondary]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.contentContainer}>
                            <Text style={styles.emptyText}>No channels found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
