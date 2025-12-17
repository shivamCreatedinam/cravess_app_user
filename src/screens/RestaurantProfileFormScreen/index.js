import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { TextInput, Button, Switch, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AxiosClient from '../../apis/clients';
import { showImagePickerOptions, uploadImageToServer } from '../../utils/imageUpload';
import theme from '../../theme';
import { useAppStrings } from '../../hooks/useAppStrings';

const RestaurantProfileFormScreen = ({ route }) => {
    const navigation = useNavigation();
    const user = useSelector((state) => state?.userInfo?.user);
    // Get params from route prop (React Navigation passes this automatically)
    const { mode, profileId, userId: paramUserId } = route?.params || {};
    // Use userId from params, or fallback to user from Redux
    const userId = paramUserId || user?.id;
    const { getString } = useAppStrings();

    const [form, setForm] = useState({
        restaurant_name: '',
        description: '',
        open_time: '',
        close_time: '',
        banner_image: '',
        logo_image: '',
        address: '',
        latitude: '',
        longitude: '',
    });
    const [bannerFile, setBannerFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [errors, setErrors] = useState({});

    // Check if profile exists and fetch data
    useEffect(() => {
        if (mode === 'edit' && profileId) {
            fetchProfileData();
        } else if (mode === 'create' && userId) {
            // Check if profile already exists when in create mode
            checkExistingProfile();
        }
    }, [profileId, mode, userId]);

    const checkExistingProfile = async () => {
        if (!userId) return;
        
        try {
            const response = await AxiosClient.get(`menu/getProfileByRestaurantId/${userId}`);
            const data = response.data?.data;
            
            if (data) {
                // Profile exists, automatically load it in edit mode
                setForm({
                    restaurant_name: data.restaurant_name || '',
                    description: data.description || '',
                    open_time: data.open_time || '',
                    close_time: data.close_time || '',
                    banner_image: data.banner_image || '',
                    logo_image: data.logo_image || '',
                    address: data.address || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                });
                setIsOpen(data.is_open !== false);
                if (data.banner_image) setBannerPreview(data.banner_image);
                if (data.logo_image) setLogoPreview(data.logo_image);
                // Update route params to edit mode
                if (route?.params) {
                    route.params.mode = 'edit';
                    route.params.profileId = userId;
                }
            }
        } catch (error) {
            // Profile doesn't exist, continue with create mode
            console.log('No existing profile found, proceeding with create mode');
        }
    };

    const fetchProfileData = async () => {
        try {
            setFetching(true);
            const response = await AxiosClient.get(`menu/getProfileByRestaurantId/${profileId}`);
            const data = response.data?.data;
            
            if (data) {
                setForm({
                    restaurant_name: data.restaurant_name || '',
                    description: data.description || '',
                    open_time: data.open_time || '',
                    close_time: data.close_time || '',
                    banner_image: data.banner_image || '',
                    logo_image: data.logo_image || '',
                    address: data.address || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                });
                setIsOpen(data.is_open !== false);
                if (data.banner_image) setBannerPreview(data.banner_image);
                if (data.logo_image) setLogoPreview(data.logo_image);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            const errorMessage = err.response?.data?.message || 'Failed to fetch profile data';
            Alert.alert('Error', errorMessage);
        } finally {
            setFetching(false);
        }
    };

    const handleImageSelect = (imageType) => (selectedImage) => {
        if (selectedImage) {
            if (imageType === 'banner') {
                setBannerFile(selectedImage);
                setBannerPreview(selectedImage.uri);
                setErrors(prev => ({ ...prev, banner_image: '' }));
            } else {
                setLogoFile(selectedImage);
                setLogoPreview(selectedImage.uri);
                setErrors(prev => ({ ...prev, logo_image: '' }));
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!form.restaurant_name.trim()) {
            newErrors.restaurant_name = 'Restaurant name is required';
        }

        if (!form.address.trim()) {
            newErrors.address = 'Address is required';
        }

        // Time validation
        if (form.open_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(form.open_time)) {
            newErrors.open_time = 'Please enter time in HH:MM format (e.g., 10:00)';
        }

        if (form.close_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(form.close_time)) {
            newErrors.close_time = 'Please enter time in HH:MM format (e.g., 22:00)';
        }

        // Coordinate validation
        if (form.latitude && (isNaN(form.latitude) || parseFloat(form.latitude) < -90 || parseFloat(form.latitude) > 90)) {
            newErrors.latitude = 'Latitude must be between -90 and 90';
        }

        if (form.longitude && (isNaN(form.longitude) || parseFloat(form.longitude) < -180 || parseFloat(form.longitude) > 180)) {
            newErrors.longitude = 'Longitude must be between -180 and 180';
        }

        // Image validation (optional but recommended)
        if (mode === 'create' && !bannerPreview && !form.banner_image) {
            newErrors.banner_image = 'Banner image is recommended';
        }

        if (mode === 'create' && !logoPreview && !form.logo_image) {
            newErrors.logo_image = 'Logo image is recommended';
        }

        setErrors(newErrors);
        return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
    };

    const handleSubmit = async () => {
        // Clear previous errors
        setErrors({});

        // Validate form
        const validation = validateForm();
        if (!validation.isValid) {
            const errorMessages = Object.values(validation.errors);
            const firstError = errorMessages.length > 0 ? errorMessages[0] : 'Please fill all required fields correctly';
            Alert.alert('Validation Error', firstError);
            return;
        }

        // Determine actual mode - use edit if profileId exists or if we detected existing profile
        const actualMode = (mode === 'edit' || profileId || route?.params?.mode === 'edit') ? 'edit' : 'create';
        const actualProfileId = profileId || userId;
        
        const endpoint = actualMode === 'edit'
            ? `menu/update-restaurant-profile/${actualProfileId}`
            : `menu/create-restaurant-profile`;

        try {
            setLoading(true);
            let bannerImageUrl = form.banner_image;
            let logoImageUrl = form.logo_image;

            // Upload banner image if selected
            if (bannerFile) {
                setUploading(true);
                try {
                    bannerImageUrl = await uploadImageToServer(bannerFile);
                } catch (uploadError) {
                    console.error('Banner upload error:', uploadError);
                    Alert.alert('Upload Error', uploadError.message || 'Failed to upload banner image');
                    setLoading(false);
                    setUploading(false);
                    return;
                } finally {
                    setUploading(false);
                }
            }

            // Upload logo image if selected
            if (logoFile) {
                setUploading(true);
                try {
                    logoImageUrl = await uploadImageToServer(logoFile);
                } catch (uploadError) {
                    console.error('Logo upload error:', uploadError);
                    Alert.alert('Upload Error', uploadError.message || 'Failed to upload logo image');
                    setLoading(false);
                    setUploading(false);
                    return;
                } finally {
                    setUploading(false);
                }
            }

            // Validate required fields before submitting
            if (!userId) {
                Alert.alert('Error', 'User ID is missing. Please login again.');
                setLoading(false);
                return;
            }

            if (!form.restaurant_name.trim()) {
                Alert.alert('Error', 'Restaurant name is required.');
                setLoading(false);
                return;
            }

            // Prepare payload - ensure user_id and restaurant_name are always present
            const payload = {
                user_id: Number(userId) || userId, // Ensure it's a number if API expects it
                restaurant_name: form.restaurant_name.trim(),
                description: form.description.trim() || '',
                open_time: form.open_time.trim() || '',
                close_time: form.close_time.trim() || '',
                banner_image: bannerImageUrl || '',
                logo_image: logoImageUrl || '',
                address: form.address.trim() || '',
                latitude: form.latitude ? parseFloat(form.latitude) : '',
                longitude: form.longitude ? parseFloat(form.longitude) : '',
                is_open: isOpen,
            };

            // Log payload for debugging
            console.log('Submitting profile payload:', payload);

            // Submit form
            const response = await AxiosClient({
                url: endpoint,
                method: actualMode === 'edit' ? 'PUT' : 'POST',
                data: payload,
            });

            if (response.data?.success === true || response.data?.status === true) {
                Alert.alert(
                    'Success',
                    response.data?.message || `${mode === 'edit' ? 'Profile updated' : 'Profile created'} successfully!`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack(),
                        },
                    ]
                );
            } else {
                const errorMsg = response.data?.message || 'Failed to save profile';
                Alert.alert('Error', errorMsg);
            }
        } catch (err) {
            console.error('Error submitting form:', err);
            const errorMsg = err.response?.data?.message || err.message || 'An unexpected error occurred';
            
            // Handle "Profile already exists" error
            if (errorMsg.toLowerCase().includes('profile already exists') || 
                errorMsg.toLowerCase().includes('already exists')) {
                // Automatically fetch and load existing profile, then retry in edit mode
                try {
                    const profileResponse = await AxiosClient.get(`menu/getProfileByRestaurantId/${userId}`);
                    const profileData = profileResponse.data?.data;
                    
                    if (profileData) {
                        // Load existing profile data
                        setForm({
                            restaurant_name: profileData.restaurant_name || form.restaurant_name.trim() || '',
                            description: profileData.description || form.description.trim() || '',
                            open_time: profileData.open_time || form.open_time.trim() || '',
                            close_time: profileData.close_time || form.close_time.trim() || '',
                            banner_image: bannerImageUrl || profileData.banner_image || '',
                            logo_image: logoImageUrl || profileData.logo_image || '',
                            address: profileData.address || form.address.trim() || '',
                            latitude: profileData.latitude?.toString() || form.latitude || '',
                            longitude: profileData.longitude?.toString() || form.longitude || '',
                        });
                        setIsOpen(profileData.is_open !== false);
                        if (bannerImageUrl || profileData.banner_image) {
                            setBannerPreview(bannerImageUrl || profileData.banner_image);
                        }
                        if (logoImageUrl || profileData.logo_image) {
                            setLogoPreview(logoImageUrl || profileData.logo_image);
                        }
                        
                        // Update mode to edit
                        if (route?.params) {
                            route.params.mode = 'edit';
                            route.params.profileId = userId;
                        }
                        
                        // Retry submission in edit mode automatically
                        Alert.alert(
                            'Profile Already Exists',
                            'A profile already exists. Your changes will be saved as an update.',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        // Retry with updated data in edit mode
                                        setTimeout(() => {
                                            handleSubmit();
                                        }, 300);
                                    },
                                },
                            ]
                        );
                    } else {
                        Alert.alert('Error', 'Profile exists but could not be loaded. Please try again.');
                    }
                } catch (fetchError) {
                    console.error('Error fetching existing profile:', fetchError);
                    Alert.alert('Error', 'Failed to load existing profile. Please try again.');
                }
            } else {
                Alert.alert('Error', errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const updateFormField = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
        // Clear error when user starts typing
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    if (fetching) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.color.primary.main} />
                    <Text style={styles.loadingText}>Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.color.primary.white} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Icon name="arrow-back" size={24} color={theme.color.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {mode === 'edit' ? 'Edit Profile' : 'Create Profile'}
                    </Text>
                    <View style={styles.headerRight} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Restaurant Name */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Restaurant Name *</Text>
                        <TextInput
                            mode="outlined"
                            value={form.restaurant_name}
                            onChangeText={(text) => updateFormField('restaurant_name', text)}
                            placeholder="Enter restaurant name"
                            style={styles.input}
                            outlineColor={errors.restaurant_name ? theme.color.system.error : theme.color.other.border}
                            activeOutlineColor={theme.color.primary.main}
                            contentStyle={styles.inputContent}
                            error={!!errors.restaurant_name}
                        />
                        {errors.restaurant_name && (
                            <Text style={styles.errorText}>{errors.restaurant_name}</Text>
                        )}
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            mode="outlined"
                            value={form.description}
                            onChangeText={(text) => updateFormField('description', text)}
                            placeholder="Describe your restaurant..."
                            multiline
                            numberOfLines={4}
                            style={styles.input}
                            outlineColor={theme.color.other.border}
                            activeOutlineColor={theme.color.primary.main}
                            contentStyle={styles.inputContent}
                        />
                    </View>

                    {/* Operating Hours */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Operating Hours</Text>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Open Time</Text>
                                <TextInput
                                    mode="outlined"
                                    value={form.open_time}
                                    onChangeText={(text) => updateFormField('open_time', text)}
                                    placeholder="10:00"
                                    style={styles.input}
                                    outlineColor={errors.open_time ? theme.color.system.error : theme.color.other.border}
                                    activeOutlineColor={theme.color.primary.main}
                                    contentStyle={styles.inputContent}
                                    error={!!errors.open_time}
                                />
                                {errors.open_time && (
                                    <Text style={styles.errorText}>{errors.open_time}</Text>
                                )}
                            </View>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Close Time</Text>
                                <TextInput
                                    mode="outlined"
                                    value={form.close_time}
                                    onChangeText={(text) => updateFormField('close_time', text)}
                                    placeholder="22:00"
                                    style={styles.input}
                                    outlineColor={errors.close_time ? theme.color.system.error : theme.color.other.border}
                                    activeOutlineColor={theme.color.primary.main}
                                    contentStyle={styles.inputContent}
                                    error={!!errors.close_time}
                                />
                                {errors.close_time && (
                                    <Text style={styles.errorText}>{errors.close_time}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Address */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Address *</Text>
                        <TextInput
                            mode="outlined"
                            value={form.address}
                            onChangeText={(text) => updateFormField('address', text)}
                            placeholder="Enter restaurant address"
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                            outlineColor={errors.address ? theme.color.system.error : theme.color.other.border}
                            activeOutlineColor={theme.color.primary.main}
                            contentStyle={styles.inputContent}
                            error={!!errors.address}
                        />
                        {errors.address && (
                            <Text style={styles.errorText}>{errors.address}</Text>
                        )}
                    </View>

                    {/* Location Coordinates */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Location Coordinates</Text>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Latitude</Text>
                                <TextInput
                                    mode="outlined"
                                    value={form.latitude}
                                    onChangeText={(text) => updateFormField('latitude', text)}
                                    placeholder="28.6139"
                                    keyboardType="numeric"
                                    style={styles.input}
                                    outlineColor={errors.latitude ? theme.color.system.error : theme.color.other.border}
                                    activeOutlineColor={theme.color.primary.main}
                                    contentStyle={styles.inputContent}
                                    error={!!errors.latitude}
                                />
                                {errors.latitude && (
                                    <Text style={styles.errorText}>{errors.latitude}</Text>
                                )}
                            </View>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Longitude</Text>
                                <TextInput
                                    mode="outlined"
                                    value={form.longitude}
                                    onChangeText={(text) => updateFormField('longitude', text)}
                                    placeholder="77.2090"
                                    keyboardType="numeric"
                                    style={styles.input}
                                    outlineColor={errors.longitude ? theme.color.system.error : theme.color.other.border}
                                    activeOutlineColor={theme.color.primary.main}
                                    contentStyle={styles.inputContent}
                                    error={!!errors.longitude}
                                />
                                {errors.longitude && (
                                    <Text style={styles.errorText}>{errors.longitude}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Banner Image Upload */}
                    <View style={styles.section}>
                        <Text style={styles.label}>
                            Banner Image {mode === 'create' && <Text style={styles.optionalText}>(Recommended)</Text>}
                        </Text>
                        {bannerPreview ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: bannerPreview }} style={styles.bannerPreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => {
                                        setBannerPreview(null);
                                        setBannerFile(null);
                                        setForm(prev => ({ ...prev, banner_image: '' }));
                                    }}
                                >
                                    <Icon name="close-circle" size={28} color={theme.color.primary.white} />
                                </TouchableOpacity>
                                <View style={styles.imageOverlay}>
                                    <TouchableOpacity
                                        style={styles.changeImageButton}
                                        onPress={() => showImagePickerOptions(handleImageSelect('banner'))}
                                    >
                                        <Icon name="camera" size={20} color={theme.color.primary.white} />
                                        <Text style={styles.changeImageText}>Change Banner</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.imagePickerButton}
                                onPress={() => showImagePickerOptions(handleImageSelect('banner'))}
                            >
                                <View style={styles.imagePickerIconContainer}>
                                    <Icon name="image-outline" size={48} color={theme.color.primary.main} />
                                </View>
                                <Text style={styles.imagePickerText}>Tap to Select Banner Image</Text>
                                <Text style={styles.imagePickerSubtext}>Camera or Gallery</Text>
                            </TouchableOpacity>
                        )}
                        {errors.banner_image && (
                            <Text style={styles.errorText}>{errors.banner_image}</Text>
                        )}
                    </View>

                    {/* Logo Image Upload */}
                    <View style={styles.section}>
                        <Text style={styles.label}>
                            Logo Image {mode === 'create' && <Text style={styles.optionalText}>(Recommended)</Text>}
                        </Text>
                        {logoPreview ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: logoPreview }} style={styles.logoPreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => {
                                        setLogoPreview(null);
                                        setLogoFile(null);
                                        setForm(prev => ({ ...prev, logo_image: '' }));
                                    }}
                                >
                                    <Icon name="close-circle" size={28} color={theme.color.primary.white} />
                                </TouchableOpacity>
                                <View style={styles.imageOverlay}>
                                    <TouchableOpacity
                                        style={styles.changeImageButton}
                                        onPress={() => showImagePickerOptions(handleImageSelect('logo'))}
                                    >
                                        <Icon name="camera" size={20} color={theme.color.primary.white} />
                                        <Text style={styles.changeImageText}>Change Logo</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.imagePickerButton}
                                onPress={() => showImagePickerOptions(handleImageSelect('logo'))}
                            >
                                <View style={styles.imagePickerIconContainer}>
                                    <Icon name="image-outline" size={48} color={theme.color.primary.main} />
                                </View>
                                <Text style={styles.imagePickerText}>Tap to Select Logo Image</Text>
                                <Text style={styles.imagePickerSubtext}>Camera or Gallery</Text>
                            </TouchableOpacity>
                        )}
                        {errors.logo_image && (
                            <Text style={styles.errorText}>{errors.logo_image}</Text>
                        )}
                    </View>

                    {/* Restaurant Status */}
                    <View style={styles.section}>
                        <View style={styles.switchContainer}>
                            <View style={styles.switchLabelContainer}>
                                <Icon name="restaurant-outline" size={20} color={theme.color.primary.main} />
                                <View>
                                    <Text style={styles.switchLabel}>Restaurant Status</Text>
                                    <Text style={styles.switchHint}>
                                        {isOpen ? 'Currently accepting orders' : 'Currently closed'}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={isOpen}
                                onValueChange={setIsOpen}
                                trackColor={{ false: theme.color.other.border, true: theme.color.accent.main }}
                                thumbColor={theme.color.primary.white}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            onPress={handleSubmit}
                            loading={loading || uploading}
                            disabled={loading || uploading}
                            style={styles.submitButton}
                            contentStyle={styles.submitButtonContent}
                            labelStyle={styles.submitButtonLabel}
                        >
                            {uploading
                                ? 'Uploading Images...'
                                : loading
                                ? mode === 'edit'
                                    ? 'Updating...'
                                    : 'Creating...'
                                : mode === 'edit'
                                ? 'Update Profile'
                                : 'Create Profile'}
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RestaurantProfileFormScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.secondary.light,
    },
    keyboardView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.color.secondary.light,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: theme.color.text.secondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.color.primary.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.color.other.border,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.color.text.primary,
        flex: 1,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.color.text.primary,
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.color.text.primary,
        marginBottom: 8,
    },
    optionalText: {
        fontSize: 14,
        fontWeight: '400',
        color: theme.color.text.tertiary,
    },
    input: {
        backgroundColor: theme.color.primary.white,
    },
    inputContent: {
        backgroundColor: theme.color.primary.white,
    },
    errorText: {
        fontSize: 12,
        color: theme.color.system.error,
        marginTop: 4,
        marginLeft: 4,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    imagePickerButton: {
        borderWidth: 2,
        borderColor: theme.color.primary.main,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.color.primary.white,
    },
    imagePickerIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.color.secondary.light,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    imagePickerText: {
        fontSize: 16,
        color: theme.color.primary.main,
        fontWeight: '600',
        marginTop: 8,
    },
    imagePickerSubtext: {
        fontSize: 12,
        color: theme.color.text.tertiary,
        marginTop: 4,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: theme.color.primary.white,
    },
    bannerPreview: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    logoPreview: {
        width: 150,
        height: 150,
        borderRadius: 75,
        alignSelf: 'center',
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: theme.color.system.error,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 12,
    },
    changeImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    changeImageText: {
        color: theme.color.primary.white,
        fontSize: 14,
        fontWeight: '600',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.color.primary.white,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.color.other.border,
    },
    switchLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        color: theme.color.text.primary,
        fontWeight: '600',
    },
    switchHint: {
        fontSize: 12,
        color: theme.color.text.tertiary,
        marginTop: 2,
    },
    buttonContainer: {
        marginTop: 8,
    },
    submitButton: {
        borderRadius: 12,
        backgroundColor: theme.color.primary.main,
    },
    submitButtonContent: {
        paddingVertical: 8,
    },
    submitButtonLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.color.primary.white,
    },
});
