import React, { useState, useEffect } from 'react';
import {
    View, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image, TouchableOpacity
} from 'react-native';
import { TextInput, Button, Text, Appbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import AxiosClient from '../../apis/clients';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { showImagePickerOptions, uploadImageToServer } from '../../utils/imageUpload';
import theme from '../../theme';

const AddFoodItemScreen = () => {

    const navigation = useNavigation();
    const [categories, setCategories] = useState([]);
    const user = useSelector((state) => state?.userInfo?.user);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            // You can await here
            await AxiosClient.get(`menu/categories-by-restaurant/${user.id}`)
                .then(res => setCategories(res.data.data))
                .catch(() => Alert.alert("Error", "Failed to load categories"));
        }
        fetchData();
    }, []);

    const handleImageSelect = (selectedImage) => {
        if (selectedImage) {
            setImageFile(selectedImage);
            setImagePreview(selectedImage.uri);
            // If you have an upload endpoint, upload here and set the URL
            // For now, we'll use the URI directly or upload to your server
        }
    };

    const handleImagePicker = () => {
        showImagePickerOptions(handleImageSelect);
    };

    const handleSubmit = async () => {
        if (!selectedCategory || !name || !price) {
            return Alert.alert('Validation Error', 'Please fill all required fields.');
        }

        try {
            setLoading(true);
            
            let imageUrl = '';
            
            // If image file is selected, upload it first
            if (!imageFile) {
                Alert.alert('Error', 'Please select an image');
                setLoading(false);
                return;
            }
            
            if (imageFile) {
                setUploading(true);
                try {
                    imageUrl = await uploadImageToServer(imageFile);
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
                restaurant_id: user.id,
                category_id: selectedCategory,
                name,
                description: desc,
                price,
                image: imageUrl
            };
            
            const response = await AxiosClient.post(`menu/add-food-items-by-restro`, payload);
            
            if (response.data?.success === true) {
                Alert.alert('Success', response.data.message);
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to add food item');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to add food item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Add Food Item" />
            </Appbar.Header>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>
                    <TextInput
                        label="Food Name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />
                    <TextInput
                        label="Description"
                        value={desc}
                        onChangeText={setDesc}
                        multiline
                        style={styles.input}
                    />
                    <TextInput
                        label="Price"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    {/* Image Upload Section */}
                    <Text style={styles.label}>Food Image</Text>
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
                                <Icon name="close-circle" size={24} color={theme.color.system.error} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.imagePickerButton}
                            onPress={handleImagePicker}
                        >
                            <Icon name="camera-outline" size={32} color={theme.color.primary.main} />
                            <Text style={styles.imagePickerText}>Pick Image</Text>
                        </TouchableOpacity>
                    )}

                    <Text style={{ marginBottom: 6 }}>Select Category</Text>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            mode={selectedCategory === cat.id ? 'contained' : 'outlined'}
                            onPress={() => setSelectedCategory(cat.id)}
                            style={styles.categoryBtn}
                        >
                            {cat.name}
                        </Button>
                    ))}

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={loading || uploading}
                        disabled={loading || uploading}
                        style={styles.submitBtn}
                    >
                        {uploading ? 'Uploading Image...' : 'Add Food Item'}
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

export default AddFoodItemScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#f6f6f6',
    },
    categoryBtn: {
        marginVertical: 4,
    },
    submitBtn: {
        marginTop: 20,
        borderRadius: 10,
        paddingVertical: 6,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        color: theme.color.text.primary,
    },
    imagePickerButton: {
        borderWidth: 2,
        borderColor: theme.color.primary.main,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        backgroundColor: theme.color.secondary.light,
    },
    imagePickerText: {
        marginTop: 8,
        fontSize: 14,
        color: theme.color.primary.main,
        fontWeight: '500',
    },
    imagePreviewContainer: {
        position: 'relative',
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: theme.color.primary.white,
        borderRadius: 12,
        padding: 4,
    },
});
