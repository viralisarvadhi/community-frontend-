import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/auth.slice";
import channelsReducer from "./channels/channels.slice";
import messagesReducer from "./messages/messages.slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        channels: channelsReducer,
        messages: messagesReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
