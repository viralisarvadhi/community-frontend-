import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { tokenStore } from "../../services/token.store";

type User = {
    id: string;
    email: string;
    name: string;
};

type AuthState = {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
};

const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken(state, action: PayloadAction<string>) {
            const normalized = action.payload.replace(/^Bearer\s+/i, "").replace(/^["']|["']$/g, "").trim();
            state.token = normalized;
            tokenStore.setToken(normalized);
            // Save token to SecureStore
            SecureStore.setItemAsync("token", normalized).catch((err) => {
                console.error("Failed to save token to SecureStore:", err);
            });
        },
        setAuth(state, action: PayloadAction<{ token: string; user?: User | null }>) {
            const normalized = action.payload.token.replace(/^Bearer\s+/i, "").replace(/^["']|["']$/g, "").trim();
            state.token = normalized;
            state.user = action.payload.user ?? null;
            state.isAuthenticated = true;
            tokenStore.setToken(normalized);

            // Save token to SecureStore
            console.log("Saving token to SecureStore...");
            console.log("Token to save:", normalized.substring(0, 50) + "...");
            console.log("Token length:", normalized.length);

            SecureStore.setItemAsync("token", normalized)
                .then(() => {
                    console.log("✅ Token saved to SecureStore successfully");
                })
                .catch((err) => {
                    console.error("❌ Failed to save token to SecureStore:", err);
                });

            console.log("Auth set successfully with token:", normalized.substring(0, 20) + "...");
        },
        logout(state) {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
            tokenStore.clear();

            // Remove token from SecureStore
            SecureStore.deleteItemAsync("token").catch((err) => {
                console.error("Failed to delete token from SecureStore:", err);
            });
        },
    },
});

export const { setToken, setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
