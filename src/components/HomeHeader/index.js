import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { LoadingContext } from '../Loader/LoadingContext';
import { useTheme } from '../../theme';

// Check if @react-navigation/native is available
let useNavigation;
try {
  const navigation = require('@react-navigation/native');
  useNavigation = navigation.useNavigation;
} catch (e) {
  // Fallback if navigation is not available
  useNavigation = () => ({
    navigate: (screen, params) => {
      Alert.alert('Navigation', `Would navigate to ${screen}`, [{ text: 'OK' }]);
    },
  });
}

const HomeHeader = ({ onAddressPress }) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { loading } = useContext(LoadingContext);
  const authData = useSelector((state) => state?.userInfo?.user);
  const address = useSelector((state) => state.address.address) || 'Choose your address';
  const generateRandomTwoDigitNumber = () => Math.floor(Math.random() * 90) + 10;
  const handleProfilePress = () => navigation.navigate('ProfileScreen');

  // Try to load location icon, fallback to placeholder if not found
  let locationIconSource;
  try {
    locationIconSource = require('../../assets/location_icon.png');
  } catch (e) {
    // Fallback: use a simple icon or placeholder
    locationIconSource = null;
  }

  return (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="rgb(0, 0, 0)" />
      <View style={styles.profileContainer}>
        <TouchableOpacity
          style={styles.addressWrapper}
          onPress={onAddressPress}
        >
          {locationIconSource ? (
            <Image
              source={locationIconSource}
              style={styles.locationIcon}
            />
          ) : (
            <View style={[styles.locationIcon, styles.locationIconPlaceholder]}>
              <Text style={styles.locationIconText}>📍</Text>
            </View>
          )}
          <Text
            adjustsFontSizeToFit
            style={[styles.addressText, { fontFamily: theme.fontFamily.poppinsMedium }]}
            numberOfLines={2}
          >
            {address.substring(0, 80)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleProfilePress}>
          <Image
            source={{
              uri: authData?.profile_image ??
                `https://randomuser.me/api/portraits/men/${generateRandomTwoDigitNumber()}.jpg`,
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;


const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    marginRight: 30,
    marginLeft: 10,
    color: '#000000',
  },
  locationIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#f35353',
  },
  locationIconPlaceholder: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIconText: {
    fontSize: 18,
  },
  cartIcon: {
    width: 30,
    height: 30,
    marginRight: 20,
    resizeMode: 'contain',
  },
  cartCountContainer: {
    position: 'absolute',
    top: 0,
    right: 15,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 25,
    marginRight: 10,
  },
});
