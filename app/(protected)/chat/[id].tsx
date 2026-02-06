import { FlatList, Text, TextInput, Button, View, StyleSheet, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../../src/store/hooks";
import {
    fetchMessages,
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
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
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
    const messages = useAppSelector((s) => s.messages.list);
    const [text, setText] = useState("");
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        if (!id) return;

        // Fetch appropriate messages
        if (isDirectMessage) {
            dispatch(fetchMessages(`user_${id}`));
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
                s.emit("join:direct", { userId: id });
            } else {
                s.emit("join:channel", { channelId: id });
            }

            s.on("message:new", (msg) => dispatch(addMessage(msg)));
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
                res = await messageService.sendDirectMessage(id, text.trim());
                if (socket) {
                    socket.emit("message:send-direct", { userId: id, message: res.data });
                }
            } else {
                res = await messageService.sendChannelMessage(id, text.trim());
                if (socket) {
                    socket.emit("message:send", { channelId: id, message: res.data });
                }
            }
            dispatch(addMessage(res.data));
            setText("");
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                    <View style={styles.messageItem}>
                        <View style={styles.messageOther}>
                            <Text style={styles.messageTextOther}>{item.content}</Text>
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.messagesContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No messages yet</Text>
                    </View>
                }
                inverted
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
