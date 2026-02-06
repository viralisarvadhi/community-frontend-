import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../../../src/styles/theme";
import { userService } from "../../../src/services/user.service";
import { useAppSelector } from "../../../src/store/hooks";

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
        borderLeftColor: colors.primary,
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
    meLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeights.semibold,
        color: colors.primary,
        marginLeft: spacing.sm,
    },
});

export default function ChatsScreen() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const currentUser = useAppSelector((s) => s.auth.user);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await userService.getCommunityUsers();
            setUsers(response.data || []);
        } catch (err: any) {
            console.error("Failed to load users:", err?.response || err);
            const backendMessage = err?.response?.data?.message;
            setError(backendMessage || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadUsers();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Chats</Text>
            </View>
            {loading ? (
                <View style={styles.contentContainer}>
                    <Text style={styles.emptyText}>Loading users...</Text>
                </View>
            ) : error ? (
                <View style={styles.contentContainer}>
                    <Text style={styles.emptyText}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const isMe = item.id === currentUser?.id;
                        return (
                            <Pressable
                                onPress={() => router.push(`/chat/user/${item.id}`)}
                                style={({ pressed }) => [
                                    styles.channelItem,
                                    { opacity: pressed ? 0.7 : 1 },
                                ]}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.channelName}>{item.name || item.email}</Text>
                                    {isMe && <Text style={styles.meLabel}>(Me)</Text>}
                                </View>
                                <Text style={styles.channelCount}>{item.email}</Text>
                            </Pressable>
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
                        <View style={styles.contentContainer}>
                            <Text style={styles.emptyText}>No users found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
