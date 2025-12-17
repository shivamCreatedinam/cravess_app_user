import React, { createContext, useState } from 'react';
import GlobalLoader from './GlobalLoader';

// Create a context for loading
export const LoadingContext = createContext({
    loading: false,
    showLoader: () => {},
    hideLoader: () => {},
});

// Create a provider component
export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    // Show the loader
    const showLoader = () => setLoading(true);

    // Hide the loader
    const hideLoader = () => setLoading(false);

    return (
        <LoadingContext.Provider value={{ loading, showLoader, hideLoader }}>
            {children}
            {loading && <GlobalLoader />}
        </LoadingContext.Provider>
    );
};