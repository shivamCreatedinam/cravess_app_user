import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  Platform,
  Share,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AxiosClient from '../../apis/clients';
import theme from '../../theme';
import { useAppStrings } from '../../hooks/useAppStrings';

// Conditionally import ViewShot and CameraRoll
let ViewShot;
let CameraRoll;
try {
  ViewShot = require('react-native-view-shot').default;
  CameraRoll = require('@react-native-camera-roll/camera-roll').CameraRoll;
} catch (error) {
  console.warn('ViewShot or CameraRoll not available:', error);
}

const { width } = Dimensions.get('window');
const QR_SIZE = width * 0.7;

const RestaurantBarcodeScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state) => state?.userInfo?.user);
  const { getString } = useAppStrings();
  const viewShotRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState({});
  
  // Fetch restaurant profile for logo
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const response = await AxiosClient.get(`menu/getProfileByRestaurantId/${user.id}`);
          if (response.data?.data) {
            setRestaurantInfo(response.data.data);
          }
        } catch (error) {
          console.log('Error fetching restaurant profile:', error);
        }
      }
    };
    fetchProfile();
  }, [user?.id]);

  // Generate unique restaurant identifier
  const restaurantId = user?.id || '0';
  const restaurantCode = `REST-${restaurantId}`;
  
  // Generate QR code data - can include restaurant ID, name, or URL
  const qrData = JSON.stringify({
    type: 'restaurant',
    id: restaurantId,
    code: restaurantCode,
    name: user?.full_name || 'Restaurant',
  });

  const handleDownload = async () => {
    if (!ViewShot || !CameraRoll) {
      Alert.alert(
        'Feature Unavailable',
        'Download feature requires native modules to be linked. Please rebuild the app after installation.',
        [
          { text: 'OK', style: 'default' },
          { text: 'Share Instead', onPress: handleShare },
        ]
      );
      return;
    }

    if (!viewShotRef.current) {
      Alert.alert('Error', 'Unable to capture QR code');
      return;
    }

    try {
      setSaving(true);
      const uri = await viewShotRef.current.capture();
      
      // Request permission for saving to gallery
      let permission;
      if (Platform.OS === 'android') {
        permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
      } else if (Platform.OS === 'ios') {
        permission = PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY;
      }

      if (permission) {
        const result = await request(permission);
        
        if (result !== RESULTS.GRANTED) {
          Alert.alert(
            'Permission Required',
            'Storage permission is required to save the QR code to your gallery.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Share Instead', onPress: handleShare },
            ]
          );
          setSaving(false);
          return;
        }
      }

      // Save to gallery using CameraRoll
      await CameraRoll.save(uri, { type: 'photo', album: 'Cravess Restaurant' });
      Alert.alert('Success', 'QR code saved to gallery!');
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert(
        'Error',
        'Failed to save QR code. You can use Share instead.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share', onPress: handleShare },
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!ViewShot) {
      // Fallback: Share text if ViewShot is not available
      try {
        const result = await Share.share({
          message: `Restaurant QR Code\n\nRestaurant: ${user?.full_name || 'Restaurant'}\nRestaurant Code: ${restaurantCode}\n\nScan the QR code in the app to view menu and place orders.`,
          title: 'Restaurant QR Code',
        });
      } catch (error) {
        console.error('Error sharing:', error);
        Alert.alert('Error', 'Failed to share. Please try again.');
      }
      return;
    }

    if (!viewShotRef.current) {
      Alert.alert('Error', 'Unable to capture QR code');
      return;
    }

    try {
      setSaving(true);
      const uri = await viewShotRef.current.capture();
      
      const result = await Share.share({
        message: `Scan this QR code to view ${user?.full_name || 'Restaurant'} on Cravess!\n\nRestaurant Code: ${restaurantCode}`,
        url: Platform.OS === 'ios' ? uri : `file://${uri}`,
        title: 'Restaurant QR Code',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Shared', 'QR code shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
      Alert.alert('Error', 'Failed to share QR code. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.color.primary.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.color.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurant QR Code</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Info Section */}
        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Icon name="qr-code-outline" size={48} color={theme.color.primary.main} />
          </View>
          <Text style={styles.infoTitle}>Your Restaurant QR Code</Text>
          <Text style={styles.infoSubtitle}>
            Share this QR code with customers to let them easily find and order from your restaurant
          </Text>
        </View>
        <ScrollView>
        {/* QR Code Card */}
        {ViewShot ? (
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1.0 }}
            style={styles.qrContainer}
          >
            <View style={styles.qrCard}>
            {/* Restaurant Logo/Name Section */}
            <View style={styles.qrHeader}>
              <Icon name="restaurant" size={32} color={theme.color.primary.main} />
              <Text style={styles.qrRestaurantName}>
                {user?.full_name || 'Restaurant Name'}
              </Text>
              <Text style={styles.qrCodeText}>Code: {restaurantCode}</Text>
            </View>

            {/* QR Code */}
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={qrData}
                size={QR_SIZE}
                color={theme.color.text.primary}
                backgroundColor={theme.color.primary.white}
                logo={restaurantInfo?.logo_image ? { uri: restaurantInfo.logo_image } : undefined}
                logoSize={60}
                logoBackgroundColor={theme.color.primary.white}
                logoMargin={4}
                logoBorderRadius={30}
              />
            </View>

            {/* Footer */}
            <View style={styles.qrFooter}>
              <Text style={styles.qrFooterText}>Scan to view restaurant</Text>
              <Text style={styles.qrFooterSubtext}>Cravess Restaurant App</Text>
            </View>
          </View>
        </ViewShot>
        ) : (
          <View style={styles.qrContainer}>
            <View style={styles.qrCard}>
              {/* Restaurant Logo/Name Section */}
              <View style={styles.qrHeader}>
                <Icon name="restaurant" size={32} color={theme.color.primary.main} />
                <Text style={styles.qrRestaurantName}>
                  {user?.full_name || 'Restaurant Name'}
                </Text>
                <Text style={styles.qrCodeText}>Code: {restaurantCode}</Text>
              </View>

              {/* QR Code */}
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={qrData}
                  size={QR_SIZE}
                  color={theme.color.text.primary}
                  backgroundColor={theme.color.primary.white}
                  logo={restaurantInfo?.logo_image ? { uri: restaurantInfo.logo_image } : undefined}
                  logoSize={60}
                  logoBackgroundColor={theme.color.primary.white}
                  logoMargin={4}
                  logoBorderRadius={30}
                />
              </View>

              {/* Footer */}
              <View style={styles.qrFooter}>
                <Text style={styles.qrFooterText}>Scan to view restaurant</Text>
                <Text style={styles.qrFooterSubtext}>Cravess Restaurant App</Text>
              </View>
            </View>
          </View>
        )}

        {/* Restaurant Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Icon name="barcode-outline" size={20} color={theme.color.text.secondary} />
            <Text style={styles.detailLabel}>Restaurant ID:</Text>
            <Text style={styles.detailValue}>{restaurantCode}</Text>
          </View>
          {user?.email && (
            <View style={styles.detailRow}>
              <Icon name="mail-outline" size={20} color={theme.color.text.secondary} />
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{user.email}</Text>
            </View>
          )}
          {user?.mobile && (
            <View style={styles.detailRow}>
              <Icon name="call-outline" size={20} color={theme.color.text.secondary} />
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{user.mobile}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={handleDownload}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.color.primary.white} />
            ) : (
              <>
                <Icon name="download-outline" size={24} color={theme.color.primary.white} />
                <Text style={styles.actionButtonText}>Download</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={theme.color.primary.white} />
            ) : (
              <>
                <Icon name="share-outline" size={24} color={theme.color.primary.white} />
                <Text style={styles.actionButtonText}>Share</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to use:</Text>
          <View style={styles.instructionItem}>
            <Icon name="checkmark-circle" size={20} color={theme.color.system.success} />
            <Text style={styles.instructionText}>
              Display this QR code at your restaurant entrance or tables
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="checkmark-circle" size={20} color={theme.color.system.success} />
            <Text style={styles.instructionText}>
              Customers can scan it to view your menu and place orders
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Icon name="checkmark-circle" size={20} color={theme.color.system.success} />
            <Text style={styles.instructionText}>
              Share the QR code digitally through social media or messages
            </Text>
          </View>
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default RestaurantBarcodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.color.secondary.light,
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
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: theme.color.primary.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: theme.color.other.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.color.primary.main}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 14,
    color: theme.color.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrCard: {
    backgroundColor: theme.color.primary.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: QR_SIZE + 80,
    shadowColor: theme.color.other.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  qrHeader: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  qrRestaurantName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  qrCodeText: {
    fontSize: 14,
    color: theme.color.text.secondary,
    fontWeight: '600',
    letterSpacing: 1,
  },
  qrCodeWrapper: {
    backgroundColor: theme.color.primary.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.color.other.border,
  },
  qrFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrFooterText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color.text.primary,
    marginBottom: 4,
  },
  qrFooterSubtext: {
    fontSize: 12,
    color: theme.color.text.tertiary,
  },
  detailsCard: {
    backgroundColor: theme.color.primary.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: theme.color.other.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.color.text.secondary,
    marginLeft: 12,
    marginRight: 8,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.color.text.primary,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: theme.color.primary.main,
  },
  shareButton: {
    backgroundColor: theme.color.accent.main,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.color.primary.white,
  },
  instructionsCard: {
    backgroundColor: theme.color.primary.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: theme.color.other.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.color.text.primary,
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: theme.color.text.secondary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

