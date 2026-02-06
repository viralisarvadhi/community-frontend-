import { io } from "socket.io-client";
import { ENV } from "../config/env";
import * as SecureStore from "expo-secure-store";

export const createSocket = async () => {
    const token = await SecureStore.getItemAsync("token");
    return io(ENV.SOCKET_URL, { auth: { token } });
};
