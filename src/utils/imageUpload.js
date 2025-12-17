import { Alert, Platform } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AxiosClient from '../apis/clients';

/**
 * Request camera permission
 */
const requestCameraPermission = async () => {
  try {
    const permission = Platform.OS === 'ios' 
      ? PERMISSIONS.IOS.CAMERA 
      : PERMISSIONS.ANDROID.CAMERA;
    
    const result = await request(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Request photo library permission
 */
const requestPhotoLibraryPermission = async () => {
  try {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.PHOTO_LIBRARY
      : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
    
    const result = await request(permission);
    return result === RESULTS.GRANTED;
  } catch (error) {
    console.error('Error requesting photo library permission:', error);
    return false;
  }
};

/**
 * Image picker options
 */
const imagePickerOptions = {
  mediaType: 'photo',
  quality: 0.8,
  maxWidth: 2000,
  maxHeight: 2000,
  allowsEditing: true,
  selectionLimit: 1,
};

/**
 * Pick image from gallery
 */
export const pickImageFromGallery = async () => {
  try {
    const hasPermission = await requestPhotoLibraryPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant photo library permission to select images. You can enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return null;
    }

    return new Promise((resolve) => {
      launchImageLibrary(imagePickerOptions, (response) => {
        if (response.didCancel) {
          resolve(null);
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to pick image');
          resolve(null);
        } else if (response.assets && response.assets[0]) {
          resolve(response.assets[0]);
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    Alert.alert('Error', 'Failed to pick image');
    return null;
  }
};

/**
 * Take photo with camera
 */
export const takePhotoWithCamera = async () => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please grant camera permission to take photos. You can enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return null;
    }

    return new Promise((resolve) => {
      launchCamera(imagePickerOptions, (response) => {
        if (response.didCancel) {
          resolve(null);
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Failed to take photo');
          resolve(null);
        } else if (response.assets && response.assets[0]) {
          resolve(response.assets[0]);
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo');
    return null;
  }
};

/**
 * Show image source options (Gallery or Camera) with better UI
 */
export const showImagePickerOptions = (onImageSelected) => {
  Alert.alert(
    'Select Image Source',
    'Choose how you want to add an image',
    [
      {
        text: '📷 Camera',
        onPress: async () => {
          const image = await takePhotoWithCamera();
          if (image) {
            onImageSelected(image);
          }
        },
      },
      {
        text: '🖼️ Gallery',
        onPress: async () => {
          const image = await pickImageFromGallery();
          if (image) {
            onImageSelected(image);
          }
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ],
    { cancelable: true }
  );
};

/**
 * Upload image to server using the correct endpoint
 * @param {Object} image - Image object from image picker
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<string>} - Returns the image URL on success
 */
export const uploadImageToServer = async (image, onProgress = null) => {
  try {
    if (!image || !image.uri) {
      throw new Error('Invalid image: No image URI provided');
    }

    // Create FormData
    const formData = new FormData();
    
    // Add image file - field name must be 'image' as per API
    formData.append('image', {
      uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || image.uri.split('/').pop() || `image_${Date.now()}.jpg`,
    });

    // Upload to server using AxiosClient (includes auth token automatically)
    const response = await AxiosClient.post('uploads/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    // Check response structure: { success: true, file: { url: "..." } }
    if (response.data?.success === true && response.data?.file?.url) {
      return response.data.file.url;
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to upload image';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;
      
      if (status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (status === 413) {
        errorMessage = 'Image file is too large. Please choose a smaller image.';
      } else if (status === 415) {
        errorMessage = 'Invalid image format. Please choose a valid image file.';
      } else if (message) {
        errorMessage = message;
      } else {
        errorMessage = `Upload failed (${status}). Please try again.`;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Pick and upload image in one function
 * Shows dialog, picks image, uploads it, and returns the URL
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<string|null>} - Returns the image URL on success, null if cancelled
 */
export const pickAndUploadImage = async (onProgress = null) => {
  return new Promise((resolve) => {
    showImagePickerOptions(async (selectedImage) => {
      if (!selectedImage) {
        resolve(null);
        return;
      }

      try {
        // Show uploading alert
        const uploadUrl = await uploadImageToServer(selectedImage, onProgress);
        resolve(uploadUrl);
      } catch (error) {
        Alert.alert('Upload Failed', error.message || 'Failed to upload image. Please try again.');
        resolve(null);
      }
    });
  });
};

/**
 * Upload image to server (legacy function for backward compatibility)
 * @deprecated Use uploadImageToServer instead
 */
export const uploadImageToServerLegacy = async (image, uploadEndpoint, additionalData = {}) => {
  try {
    if (!image || !image.uri) {
      throw new Error('Invalid image');
    }

    const formData = new FormData();
    
    formData.append('image', {
      uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
      type: image.type || 'image/jpeg',
      name: image.fileName || `image_${Date.now()}.jpg`,
    });

    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    const response = await fetch(uploadEndpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Convert image to base64 (for direct API submission if needed)
 */
export const imageToBase64 = (imageUri) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      const reader = new FileReader();
      reader.onloadend = function() {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.open('GET', imageUri);
    xhr.responseType = 'blob';
    xhr.send();
  });
};

export default {
  pickImageFromGallery,
  takePhotoWithCamera,
  showImagePickerOptions,
  uploadImageToServer,
  pickAndUploadImage,
  uploadImageToServerLegacy,
  imageToBase64,
};
