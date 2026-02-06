import { apiClient } from "./api.client";

export const messageService = {
    getChannelMessages: (channelId: string) => {
        console.log("getChannelMessages called with:", channelId);
        return apiClient.get(`/messages?channelId=${channelId}`);
    },
    sendChannelMessage: (channelId: string, content: string) => {
        console.log("sendChannelMessage called with:", { channelId, content });
        return apiClient.post("/messages", { channelId, content });
    },
    getDirectMessages: (userId: string) => {
        console.log("getDirectMessages called with:", userId);
        return apiClient.get(`/messages/direct/${userId}`);
    },
    sendDirectMessage: (userId: string, content: string) => {
        console.log("sendDirectMessage called with:", { userId, content });
        return apiClient.post(`/messages/direct/${userId}`, { content });
    },
    deleteMessage: (messageId: string) =>
        apiClient.delete(`/messages/${messageId}`)
};
