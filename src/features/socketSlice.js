// src/features/socketSlice.js
import { createSlice } from '@reduxjs/toolkit';

const socketSlice = createSlice({
    name: 'socket',
    initialState: {
        socket: null,
        isConnected: false,
        connectionError: null,
    },
    reducers: {
        setSocket: (state, action) => {
            state.socket = action.payload;
            state.isConnected = action.payload?.connected || false;
        },
        clearSocket: (state) => {
            state.socket = null;
            state.isConnected = false;
            state.connectionError = null;
        },
        setConnectionStatus: (state, action) => {
            state.isConnected = action.payload;
        },
        setConnectionError: (state, action) => {
            state.connectionError = action.payload;
        },
    },
});

export const { setSocket, clearSocket, setConnectionStatus, setConnectionError } = socketSlice.actions;
export default socketSlice.reducer;
