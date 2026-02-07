import { FlatList, Text, TextInput, View, StyleSheet, Pressable, Alert } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../../../src/store/hooks";
import {
    fetchDirectMessages,
    addMessage
} from "../../../../src/store/messages/messages.slice";
import { messageService } from "../../../../src/services/message.service";
import { userService } from "../../../../src/services/user.service";
import { createSocket } from "../../../../src/sockets/socket";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../../../../src/styles/theme";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    messagesContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        paddingBottom: spacing.lg,
    },
    messageItem: {
        marginVertical: spacing.xs,
        maxWidth: "75%",
    },
    messageRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: spacing.sm,
    },
    messageRowOwn: {
        flexDirection: "row-reverse",
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.xs,
    },
    avatarOwn: {
        backgroundColor: colors.secondary,
    },
    avatarText: {
        color: colors.surface,
        fontSize: fontSize.sm,
        fontWeight: fontWeights.bold,
    },
    messageOwn: {
        alignSelf: "flex-end",
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        borderBottomRightRadius: borderRadius.sm,
    },
    messageOther: {
        alignSelf: "flex-start",
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        borderBottomLeftRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    messageTextOwn: {
        color: colors.surface,
        fontSize: fontSize.base,
    },
    messageTextOther: {
        color: colors.text.primary,
        fontSize: fontSize.base,
    },
    timestamp: {
        fontSize: fontSize.xs,
        color: colors.text.secondary,
        marginTop: spacing.xs,
        alignSelf: "flex-end",
    },
    timestampOwn: {
        color: "rgba(255, 255, 255, 0.7)",
    },
    dateSeparator: {
        alignSelf: "center",
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        marginVertical: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dateSeparatorText: {
        fontSize: fontSize.sm,
        color: colors.text.secondary,
        fontWeight: fontWeights.medium,
    },
    inputContainer: {
        flexDirection: "row",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: "center",
        gap: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: fontSize.base,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        color: colors.text.primary,
        maxHeight: 100,
    },
    sendButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonText: {
        color: colors.surface,
        fontWeight: fontWeights.semibold,
        fontSize: fontSize.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: fontSize.lg,
        color: colors.text.secondary,
    },
});

export default function DirectChat() {
    const { id } = useLocalSearchParams<{ id: string | string[] }>();
    const userId = Array.isArray(id) ? id[0] : id;

    const dispatch = useAppDispatch();
    const messages = useAppSelector((s) => s.messages?.list || []);
    const currentUser = useAppSelector((s) => s.auth.user);
    const [text, setText] = useState("");
    const [socket, setSocket] = useState<any>(null);
    const [otherUser, setOtherUser] = useState<any>(null);
    const [myUserId, setMyUserId] = useState<any>(null);

    // Determine my user ID from messages - the one that's NOT the userId parameter
    const inferMyUserId = () => {
        if (currentUser?.id) return currentUser.id;
        if (myUserId) return myUserId;

        // Find the senderId that doesn't match the other user's ID
        const senderIds = messages.map((m: any) => String(m.senderId));
        const uniqueSenders = [...new Set(senderIds)];

        // The sender that's not the userId param is me
        const me = uniqueSenders.find(id => id !== String(userId));
        return me || null;
    };

    const detectedMyId = inferMyUserId();

    // Log current user to debug
    console.log("Current user from Redux:", currentUser);
    console.log("Detected my ID:", detectedMyId, "Other user ID:", userId);

    // Helper function to get initials from name
    const getInitials = (name: string) => {
        if (!name || name === "User" || name === "Other") return "?";
        const parts = name.trim().split(" ");
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getMessageDate = (message: any) => {
        const raw =
            message?.createdAt ||
            message?.timestamp ||
            message?.created_at ||
            message?.time ||
            message?.date;

        if (!raw) return null;
        const date = new Date(raw);
        if (Number.isNaN(date.getTime())) return null;
        return date;
    };

    const formatTime = (date: Date | null) => {
        if (!date) return "";
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "";
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dateOnly = date.toDateString();
        if (dateOnly === today.toDateString()) return "Today";
        if (dateOnly === yesterday.toDateString()) return "Yesterday";

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const shouldShowDateSeparator = (currentMsg: any, previousMsg: any) => {
        if (!previousMsg) return true;
        const currentDate = getMessageDate(currentMsg);
        const previousDate = getMessageDate(previousMsg);
        if (!currentDate || !previousDate) return false;
        return currentDate.toDateString() !== previousDate.toDateString();
    };

    useEffect(() => {
        if (!userId) {
            console.log("No userId provided");
            return;
        }

        // Fetch other user's information
        const fetchOtherUser = async () => {
            try {
                const response = await userService.getCommunityUsers();
                const users = response.data || [];
                const user = users.find((u: any) =>
                    u.id === userId || u.id === String(userId) || String(u.id) === String(userId)
                );
                if (user) {
                    setOtherUser(user);
                }
            } catch (err) {
                console.error("Failed to fetch other user:", err);
            }
        };

        fetchOtherUser();
        console.log("Fetching direct messages for userId:", userId);
        dispatch(fetchDirectMessages(userId));

        let active = true;
        let localSocket: any = null;

        createSocket().then((s) => {
            if (!active) {
                s.disconnect();
                return;
            }
            localSocket = s;

            console.log("✅ Socket connected, joining direct room with userId:", userId);
            s.emit("join:direct", { userId });

            s.on("message:new", (msg) => {
                console.log("📩 RECEIVED message:new:", msg);
                dispatch(addMessage(msg));
            });

            s.on("connect", () => console.log("✅ Socket connected"));
            s.on("disconnect", () => console.log("❌ Socket disconnected"));
            s.on("error", (error) => console.log("❌ Socket error:", error));

            setSocket(s);
        });

        return () => {
            active = false;
            if (localSocket) {
                localSocket.disconnect();
            }
        };
    }, [userId]);

    const send = async () => {
        if (!text.trim() || !userId) {
            console.log("Cannot send: text or userId missing", { text: text.trim(), userId });
            return;
        }

        try {
            console.log("📤 Sending direct message to userId:", userId, "content:", text);
            const res = await messageService.sendDirectMessage(userId, text.trim());
            console.log("✅ Message sent successfully:", res.data);

            // Add message to Redux immediately
            dispatch(addMessage(res.data));

            // Broadcast via socket
            if (socket) {
                console.log("📡 Emitting message via socket");
                socket.emit("message:send-direct", { userId, message: res.data });
            }

            setText("");
        } catch (err: any) {
            console.error("❌ Error sending message:", err?.response?.data || err?.message);
            Alert.alert("Error", err?.response?.data?.message || "Failed to send message");
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(i) => String(i.id)}
                renderItem={({ item, index }) => {
                    // Use detected ID
                    const isMine = String(item.senderId) === String(detectedMyId);

                    // Debug log to see what data we have
                    console.log("Message:", {
                        senderId: item.senderId,
                        detectedMyId,
                        isMine,
                        content: item.content.substring(0, 20)
                    });

                    const senderName = isMine
                        ? (currentUser?.name || currentUser?.email || "Me")
                        : (otherUser?.name || otherUser?.email || item.sender?.name || item.sender?.email || "Other");

                    const messageDate = getMessageDate(item);
                    const previousMessage = index < messages.length - 1 ? messages[index + 1] : null;
                    const showDateSeparator = shouldShowDateSeparator(item, previousMessage);

                    return (
                        <>
                            {showDateSeparator && (
                                <View style={styles.dateSeparator}>
                                    <Text style={styles.dateSeparatorText}>{formatDate(messageDate)}</Text>
                                </View>
                            )}
                            <View style={[styles.messageItem, isMine && { alignSelf: "flex-end" }]}>
                                <View style={[styles.messageRow, isMine && styles.messageRowOwn]}>
                                    {/* Avatar with initials */}
                                    <View style={[styles.avatar, isMine && styles.avatarOwn]}>
                                        <Text style={styles.avatarText}>{getInitials(senderName)}</Text>
                                    </View>

                                    {/* Message bubble */}
                                    <View style={isMine ? styles.messageOwn : styles.messageOther}>
                                        <Text style={isMine ? styles.messageTextOwn : styles.messageTextOther}>
                                            {item.content}
                                        </Text>
                                        {!!messageDate && (
                                            <Text style={[styles.timestamp, isMine && styles.timestampOwn]}>
                                                {formatTime(messageDate)}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </>
                    );
                }}
                contentContainerStyle={styles.messagesContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No messages yet</Text>
                    </View>
                }

                nestedScrollEnabled={false}
                scrollEnabled={true}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={setText}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.text.secondary}
                    multiline
                />
                <Pressable
                    style={({ pressed }) => [
                        styles.sendButton,
                        { opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={send}
                    disabled={!text.trim()}
                >
                    <Text style={styles.sendButtonText}>Send</Text>
                </Pressable>
            </View>
        </View>
    );
}
