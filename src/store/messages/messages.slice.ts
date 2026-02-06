import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { messageService } from "../../services/message.service";

export const fetchMessages = createAsyncThunk(
    "messages/fetch",
    async (channelId: string) =>
        (await messageService.getChannelMessages(channelId)).data
);

export const fetchDirectMessages = createAsyncThunk(
    "messages/fetchDirect",
    async (userId: string) =>
        (await messageService.getDirectMessages(userId)).data
);

const messagesSlice = createSlice({
    name: "messages",
    initialState: { list: [] as any[] },
    reducers: {
        addMessage(state, action) {
            state.list.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMessages.fulfilled, (state, action) => {
            state.list = action.payload;
        });
        builder.addCase(fetchDirectMessages.fulfilled, (state, action) => {
            state.list = action.payload;
        });
    }
});

export const { addMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
