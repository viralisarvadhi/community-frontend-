import { apiClient } from "./api.client";

export const channelService = {
    getMyChannels: () => apiClient.get("/channels"),
    getAllChannels: () => apiClient.get("/channels/all"),
    getPublicChannels: () => apiClient.get("/channels/public"),
    getPrivateChannels: () => apiClient.get("/channels/private"),
    createChannel: (name: string, isPrivate = false) =>
        apiClient.post("/channels", {
            name,
            channelName: name,
            title: name,
            isPrivate,
            visibility: isPrivate ? "private" : "public",
        }),
    // Join a channel the user is not yet a member of – backend route: POST /channels/:id/join
    joinChannel: (id: string) => apiClient.post(`/channels/${id}/join`),
    leaveChannel: (id: string) => apiClient.post(`/channels/${id}/leave`),
    deleteChannel: (id: string) => apiClient.delete(`/channels/${id}`)
};
