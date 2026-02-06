import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { channelService } from "../../services/channel.service";

// In the Channels tab we only want channels that the current user is a member of.
// This uses GET /channels (getMyChannels). Explore tab uses /channels/all for all channels.
export const fetchChannels = createAsyncThunk(
    "channels/fetch",
    async () => (await channelService.getMyChannels()).data
);

const channelsSlice = createSlice({
    name: "channels",
    initialState: { list: [] as any[], lastUpdated: 0 },
    reducers: {
        addChannel(state, action) {
            const exists = state.list.some((c) => c.id === action.payload?.id);
            if (!exists) {
                state.list = [action.payload, ...state.list];
            }
        },
        touchChannels(state) {
            state.lastUpdated = Date.now();
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchChannels.fulfilled, (state, action) => {
            state.list = action.payload;
        });
    }
});

export const { addChannel, touchChannels } = channelsSlice.actions;
export default channelsSlice.reducer;
