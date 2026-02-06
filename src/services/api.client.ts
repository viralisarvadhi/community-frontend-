import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { ENV } from "../config/env";
import { tokenStore } from "./token.store";

export const apiClient = axios.create({
    baseURL: ENV.API_BASE_URL || "http://192.168.1.105:4000",
    timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
    try {
        const memoryToken = tokenStore.getToken();
        const storedToken = await SecureStore.getItemAsync("token");
        const authToken = memoryToken || storedToken;

        console.log("=== API REQUEST DEBUG ===");
        console.log("Attempting to get token from SecureStore...");
        console.log("Token retrieved:", authToken ? "YES (length: " + authToken.length + ")" : "NO");

        if (authToken) {
            console.log("Token preview:", authToken.substring(0, 50) + "...");
            config.headers.Authorization = `Bearer ${authToken}`;
            console.log("✅ Authorization header set");
        } else {
            console.warn("❌ WARNING: No token in SecureStore!");
            console.log("Auth state might not be persisted correctly");
        }

        console.log("Request URL:", config.url);
        console.log("Full URL:", `${config.baseURL}${config.url}`);
        console.log("Request Method:", config.method);
        if (config.data) {
            console.log("Request Body:", config.data);
        }
        console.log("========================");

        return config;
    } catch (err) {
        console.error("Error in request interceptor:", err);
        return config;
    }
});

apiClient.interceptors.response.use(
    (response) => {
        console.log("API Response:", {
            url: response.config.url,
            status: response.status,
            data: response.data,
        });
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized (401). Clearing stored token.");
            tokenStore.clear();
            SecureStore.deleteItemAsync("token").catch(() => undefined);
        }
        console.error("API Error:", {
            url: error.config?.url,
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
        });
        return Promise.reject(error);
    }
);
