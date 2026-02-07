import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { messageService } from "../../services/message.service";

export const fetchMessages = createAsyncThunk(
    "messages/fetch",
    async (channelId: string) => {
        console.log("Fetching messages for channel:", channelId);
        const response = await messageService.getChannelMessages(channelId);
        console.log("Fetched messages:", response.data);
        return response.data;
    }
);

export const fetchDirectMessages = createAsyncThunk(
    "messages/fetchDirect",
    async (userId: string) => {
        console.log("Fetching direct messages for user:", userId);
        const response = await messageService.getDirectMessages(userId);
        console.log("Fetched direct messages:", response.data);
        return response.data;
    }
);

type MessagesState = {
    list: any[];
    loading: boolean;
    error: string | null;
};

const initialState: MessagesState = {
    list: [],
    loading: false,
    error: null,
};

const messagesSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        addMessage(state, action: PayloadAction<any>) {
            console.log("Adding message to Redux:", action.payload);
            state.list.push(action.payload);
        },
        setMessages(state, action: PayloadAction<any[]>) {
            console.log("Setting messages in Redux:", action.payload);
            state.list = action.payload;
        },
        clearMessages(state) {
            state.list = [];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMessages.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            state.loading = false;
            console.log("Redux: Storing fetched channel messages:", action.payload);
            state.list = action.payload;
        });
        builder.addCase(fetchMessages.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Failed to fetch messages";
            console.error("Failed to fetch messages:", state.error);
        });

        builder.addCase(fetchDirectMessages.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchDirectMessages.fulfilled, (state, action) => {
            state.loading = false;
            console.log("Redux: Storing fetched direct messages:", action.payload);
            state.list = action.payload;
        });
        builder.addCase(fetchDirectMessages.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message || "Failed to fetch direct messages";
            console.error("Failed to fetch direct messages:", state.error);
        });
    }
});

export const { addMessage, setMessages, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
