import React, { useState } from 'react';
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
} from 'react-native';
import { TextInput, Button, Switch, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import AxiosClient from '../../apis/clients';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { showImagePickerOptions, uploadImageToServer } from '../../utils/imageUpload';
import theme from '../../theme';
import { useAppStrings } from '../../hooks/useAppStrings';

const AddCategoryScreen = () => {
    const navigation = useNavigation();
    const user = useSelector((state) => state?.userInfo?.user);
    const { getString } = useAppStrings();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isPopular, setIsPopular] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleImageSelect = (selectedImage) => {
        if (selectedImage) {
            setImageFile(selectedImage);
            setImagePreview(selectedImage.uri);
        }
    };

    const handleImagePicker = () => {
        showImagePickerOptions(handleImageSelect);
    };

    const validateAndSubmit = async () => {
        if (!name.trim()) {
            return Alert.alert('Validation Error', 'Category name is required.');
        }
        
        if (!imageFile) {
            return Alert.alert('Validation Error', 'Please select a category image.');
        }

        setLoading(true);
        try {
            let finalImageUrl = '';
            
            // Upload image file
            if (imageFile) {
                setUploading(true);
                try {
                    finalImageUrl = await uploadImageToServer(imageFile);
                } catch (uploadError) {
                    console.error('Image upload error:', uploadError);
                    Alert.alert('Upload Error', uploadError.message || 'Failed to upload image. Please try again.');
                    setLoading(false);
                    setUploading(false);
                    return;
                } finally {
                    setUploading(false);
                }
            }

            const payload = {
                restaurant_id: Number(user.id),
                name: name.trim(),
                description: description.trim(),
                category_image: finalImageUrl,
                is_popular: isPopular
            };

            const response = await AxiosClient.post('menu/add-food-category-by-restro', payload);
            if (response.data?.status === true) {
                Alert.alert('Success', 'Category added successfully!', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Error', response.data?.message || 'Failed to add category');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to add category');
        } finally {
            setLoading(false);
        }
    };

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
                    <Text style={styles.headerTitle}>Add Category</Text>
                    <View style={styles.headerRight} />
                </View>

                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Category Name */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Category Name *</Text>
                        <TextInput
                            mode="outlined"
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g., Appetizers, Main Course"
                            style={styles.input}
                            outlineColor={theme.color.other.border}
                            activeOutlineColor={theme.color.primary.main}
                            contentStyle={styles.inputContent}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            mode="outlined"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Describe this category..."
                            multiline
                            numberOfLines={4}
                            style={styles.input}
                            outlineColor={theme.color.other.border}
                            activeOutlineColor={theme.color.primary.main}
                            contentStyle={styles.inputContent}
                        />
                    </View>

                    {/* Image Upload Section */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Category Image *</Text>
                        {imagePreview ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => {
                                        setImagePreview(null);
                                        setImageFile(null);
                                    }}
                                >
                                    <Icon name="close-circle" size={28} color={theme.color.primary.white} />
                                </TouchableOpacity>
                                <View style={styles.imageOverlay}>
                                    <TouchableOpacity
                                        style={styles.changeImageButton}
                                        onPress={handleImagePicker}
                                    >
                                        <Icon name="camera" size={20} color={theme.color.primary.white} />
                                        <Text style={styles.changeImageText}>Change Image</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.imagePickerButton}
                                onPress={handleImagePicker}
                            >
                                <View style={styles.imagePickerIconContainer}>
                                    <Icon name="camera-outline" size={48} color={theme.color.primary.main} />
                                </View>
                                <Text style={styles.imagePickerText}>Tap to Select Image</Text>
                                <Text style={styles.imagePickerSubtext}>Camera or Gallery</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Popular Toggle */}
                    <View style={styles.section}>
                        <View style={styles.switchContainer}>
                            <View style={styles.switchLabelContainer}>
                                <Icon name="star-outline" size={20} color={theme.color.system.warningBright} />
                                <Text style={styles.switchLabel}>Mark as Popular Category</Text>
                            </View>
                            <Switch
                                value={isPopular}
                                onValueChange={setIsPopular}
                                trackColor={{ false: theme.color.other.border, true: theme.color.accent.main }}
                                thumbColor={theme.color.primary.white}
                            />
                        </View>
                        <Text style={styles.switchHint}>
                            Popular categories will be highlighted in the menu
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            onPress={validateAndSubmit}
                            loading={loading || uploading}
                            disabled={loading || uploading || !name.trim() || !imageFile}
                            style={styles.submitButton}
                            contentStyle={styles.submitButtonContent}
                            labelStyle={styles.submitButtonLabel}
                        >
                            {uploading ? 'Uploading Image...' : loading ? 'Adding Category...' : 'Add Category'}
                        </Button>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddCategoryScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.color.secondary.light,
    },
    keyboardView: {
        flex: 1,
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
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.color.text.primary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.color.primary.white,
    },
    inputContent: {
        backgroundColor: theme.color.primary.white,
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
    imagePreview: {
        width: '100%',
        height: 250,
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
        gap: 8,
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        color: theme.color.text.primary,
        fontWeight: '500',
    },
    switchHint: {
        fontSize: 12,
        color: theme.color.text.tertiary,
        marginTop: 8,
        paddingHorizontal: 4,
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
