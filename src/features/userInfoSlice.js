import { createSlice } from '@reduxjs/toolkit';

export const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState: {
        user: null, // stores user object
        status: 'idle',
        error: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.status = 'succeeded';
        },
        clearUser: (state) => {
            console.log('Clearing user...');
            state.user = null;
            state.status = 'idle';
            state.error = null;
        },
        setUserError: (state, action) => {
            state.error = action.payload;
            state.status = 'failed';
        },
    },
});

export const { setUser, clearUser, setUserError } = userInfoSlice.actions;

export default userInfoSlice.reducer;
