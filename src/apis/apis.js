import axiosInstance from './clients';

const GOOGLE_MAPS_APIKEY_V2 = "AIzaSyD9zoEIQ7IjlkSKF4XZ_RY2HXKeHgpDL0o";

export const getCurrentAddress = async (latitude, longitude) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY_V2}`
        );

        const data = await response.json();
        if (!data?.results || data.results.length === 0) {
            throw new Error('No address found for this location.');
        }

        const formattedAddress = data.results[0].formatted_address;
        let city = '';
        let state = '';
        let country = '';
        let postalCode = '';

        const addressComponents = data.results[0].address_components;

        addressComponents.forEach(component => {
            if (component.types.includes('locality')) {
                city = component.long_name;
            } else if (component.types.includes('administrative_area_level_1')) {
                state = component.long_name;
            } else if (component.types.includes('country')) {
                country = component.long_name;
            } else if (component.types.includes('postal_code')) {
                postalCode = component.long_name;
            }
        });

        return {
            fullAddress: formattedAddress,
            city,
            state,
            country,
            postalCode,
        };
    } catch (error) {
        console.error('Error getting address:', error);
        return null;
    }
};

// API Functions - Add your API endpoints here
// Example structure:
export const authAPI = {
    // login: (credentials) => axiosInstance.post('/auth/login', credentials),
    // register: (userData) => axiosInstance.post('/auth/register', userData),
    // logout: () => axiosInstance.post('/auth/logout'),
};

export const userAPI = {
    // getUserProfile: () => axiosInstance.get('/user/profile'),
    // updateUserProfile: (data) => axiosInstance.put('/user/profile', data),
};

export const restaurantAPI = {
    // getRestaurants: (params) => axiosInstance.get('/restaurants', { params }),
    // getRestaurantById: (id) => axiosInstance.get(`/restaurants/${id}`),
    // getMenu: (restaurantId) => axiosInstance.get(`/restaurants/${restaurantId}/menu`),
};

export const orderAPI = {
    // createOrder: (orderData) => axiosInstance.post('/orders', orderData),
    // getOrders: () => axiosInstance.get('/orders'),
    // getOrderById: (id) => axiosInstance.get(`/orders/${id}`),
    // cancelOrder: (id) => axiosInstance.post(`/orders/${id}/cancel`),
};

// Export all APIs
export default {
    auth: authAPI,
    user: userAPI,
    restaurant: restaurantAPI,
    order: orderAPI,
    getCurrentAddress,
};