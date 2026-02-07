import { FlatList, Text, TextInput, Button, View, StyleSheet, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../../src/store/hooks";
import {
    fetchMessages,
    fetchDirectMessages,
    addMessage
} from "../../../src/store/messages/messages.slice";
import { messageService } from "../../../src/services/message.service";
import { createSocket } from "../../../src/sockets/socket";
import { colors, spacing, fontSize, fontWeights, borderRadius } from "../../../src/styles/theme";

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
        maxWidth: "85%",
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

export default function Chat() {
    const params = useLocalSearchParams<{ id: string | string[] }>();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    // Detect if it's a direct message or channel chat
    // Direct messages come from /chat/user/:id route
    const isDirectMessage = params.id?.toString().includes("user");

    const dispatch = useAppDispatch();
    const messages = useAppSelector((s) => s.messages?.list || []);
    const currentUser = useAppSelector((s) => s.auth.user);
    const [text, setText] = useState("");
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        if (!id) return;

        // Fetch appropriate messages
        if (isDirectMessage) {
            dispatch(fetchDirectMessages(id));
        } else {
            dispatch(fetchMessages(id));
        }

        let active = true;
        let localSocket: any = null;

        createSocket().then((s) => {
            if (!active) {
                s.disconnect();
                return;
            }
            localSocket = s;

            if (isDirectMessage) {
                console.log("✅ Socket: joining direct room with userId:", id);
                s.emit("join:direct", { userId: id });
            } else {
                console.log("✅ Socket: joining channel room with channelId:", id);
                s.emit("join:channel", { channelId: id });
            }

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
    }, [id, isDirectMessage]);

    const send = async () => {
        if (!text.trim() || !id) return;

        try {
            let res;
            if (isDirectMessage) {
                console.log("📤 Sending direct message");
                res = await messageService.sendDirectMessage(id, text.trim());
            } else {
                console.log("📤 Sending channel message");
                res = await messageService.sendChannelMessage(id, text.trim());
            }

            console.log("✅ Message sent:", res.data);
            dispatch(addMessage(res.data));

            if (socket) {
                console.log("📡 Emitting message via socket");
                if (isDirectMessage) {
                    socket.emit("message:send-direct", { userId: id, message: res.data });
                } else {
                    socket.emit("message:send", { channelId: id, message: res.data });
                }
            }

            setText("");
        } catch (err) {
            console.error("❌ Failed to send message:", err);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(i) => String(i.id)}
                renderItem={({ item }) => {
                    const isOwn = currentUser?.id === item.senderId;
                    return (
                        <View style={styles.messageItem}>
                            <View style={isOwn ? styles.messageOwn : styles.messageOther}>
                                <Text style={isOwn ? styles.messageTextOwn : styles.messageTextOther}>
                                    {item.content}
                                </Text>
                            </View>
                        </View>
                    );
                }}
                contentContainerStyle={styles.messagesContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No messages yet</Text>
                    </View>
                }
                inverted
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
