import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import locationSlice from './src/features/locationSlice';
import userReducer from './src/features/userSlice';
import cartSlice from './src/features/cartSlice';
import addressReducer from './src/features/addressSlice';
import userInfoReducer from './src/features/userInfoSlice';
import socketReducer from './src/features/socketSlice';

const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['user', 'cart', 'address', 'userInfo', 'location'], // Only persist these slices
};

const rootReducer = combineReducers({
    location: locationSlice,
    user: userReducer,
    cart: cartSlice,
    address: addressReducer,
    userInfo: userInfoReducer,
    socket: socketReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

const persistor = persistStore(store);

export { store, persistor };

// TypeScript types (if using TypeScript)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

