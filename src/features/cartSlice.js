import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    items: [],
    totalAmount: 0,
    itemCount: 0,
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.items.find(i => i.id === action.payload.id);
            const price = action.payload.price_per_unit || action.payload.price || 0;
            
            if (existingItem) {
                existingItem.quantity += 1;
                existingItem.subtotal = existingItem.quantity * (existingItem.price_per_unit || existingItem.price || 0);
            } else {
                state.items.push({
                    ...action.payload,
                    quantity: action.payload.quantity || 1,
                    price_per_unit: price,
                    price: price, // Keep both for compatibility
                    subtotal: (action.payload.quantity || 1) * price,
                });
            }
            state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
            state.totalAmount = state.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        },
        incrementQuantity: (state, action) => {
            const item = state.items.find(i => i.id === action.payload);
            if (item) {
                item.quantity += 1;
                const price = item.price_per_unit || item.price || 0;
                item.subtotal = item.quantity * price;
                state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
                state.totalAmount = state.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
            }
        },
        decrementQuantity: (state, action) => {
            const item = state.items.find(i => i.id === action.payload);
            if (item && item.quantity > 1) {
                item.quantity -= 1;
                const price = item.price_per_unit || item.price || 0;
                item.subtotal = item.quantity * price;
                state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
                state.totalAmount = state.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
            }
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(i => i.id !== action.payload);
            state.itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
            state.totalAmount = state.items.reduce((sum, item) => sum + item.subtotal, 0);
        },
        clearCart: (state) => {
            state.items = [];
            state.totalAmount = 0;
            state.itemCount = 0;
        },
        setCart: (state, action) => {
            state.items = action.payload.items || [];
            state.totalAmount = action.payload.totalAmount || 0;
            state.itemCount = action.payload.itemCount || 0;
        },
        // Legacy counter actions (keeping for backward compatibility if needed)
        increment: (state) => {
            state.itemCount += 1;
        },
        decrement: (state) => {
            if (state.itemCount > 0) {
                state.itemCount -= 1;
            }
        },
        incrementByAmount: (state, action) => {
            state.itemCount = action.payload;
        },
        decrementByAmount: (state, action) => {
            state.itemCount = action.payload;
        },
    }
})

export const { 
    addToCart, 
    incrementQuantity, 
    decrementQuantity, 
    removeFromCart, 
    clearCart, 
    setCart,
    increment, 
    decrement, 
    incrementByAmount, 
    decrementByAmount 
} = cartSlice.actions;
export default cartSlice.reducer