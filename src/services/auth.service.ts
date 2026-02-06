import { apiClient } from "./api.client";

export const authService = {
    // Google Authentication
    googleLogin: (idToken: string) => apiClient.post("/auth/google", { idToken }),

    // Community Authentication
    communityCommunityLogin: (communityCode: string, email: string) =>
        apiClient.post("/auth/community/login", { communityCode, email }),

    communitySignup: (name: string, email: string, communityCode: string) =>
        apiClient.post("/auth/community/signup", { name, email, communityCode }),

    // Fetch current user (if backend supports it)
    getMe: () => apiClient.get("/auth/me"),
};
