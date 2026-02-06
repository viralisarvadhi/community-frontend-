import { apiClient } from "./api.client";

export const userService = {
    // Fetch all users (non–soft-deleted) from the community backend
    // Backend route: GET /users (JWT protected)
    getCommunityUsers: () => apiClient.get("/users"),
};
