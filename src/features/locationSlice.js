import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    value: null, // Changed from {} to null for consistency
}

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setLocation: (state, action) => {
            state.value = action.payload;
        },
        clearLocation: (state) => {
            state.value = null;
        },
    },
})

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer