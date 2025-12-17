import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    address: null, // can be string or object, depending on your use case
};

const addressSlice = createSlice({
    name: 'address',
    initialState,
    reducers: {
        setAddress: (state, action) => {
            state.address = action.payload;
        },
        clearAddress: (state) => {
            state.address = null;
        },
    },
});

export const { setAddress, clearAddress } = addressSlice.actions;

export default addressSlice.reducer;
