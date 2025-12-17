import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
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

// Check if react-native-vector-icons is available
let Icon;
try {
  Icon = require('react-native-vector-icons/Ionicons').default;
} catch (e) {
  // Fallback icon component
  Icon = ({ name, size, color, ...props }) => (
    <Text style={{ fontSize: size, color }} {...props}>⚫</Text>
  );
}

const UserCard = ({ user }) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const generateRandomTwoDigitNumber = () => {
        return Math.floor(Math.random() * 90) + 10; // Generates a number between 10 and 99
    };

    // Try to load assets, fallback to null if not found
    let approvedIconSource, rightArrowSource;
    try {
        approvedIconSource = require('../../assets/approved.png');
    } catch (e) {
        approvedIconSource = null;
    }
    try {
        rightArrowSource = require('../../assets/right-arrow.png');
    } catch (e) {
        rightArrowSource = null;
    }

    return (
        <View style={styles.card}>
            {/* Profile Image or Placeholder */}
            <View style={styles.avatarWrapper}>
                {approvedIconSource && (
                    <View style={{ position: 'absolute', top: -10, right: 0, zIndex: 999 }}>
                        <Image style={{ height: 25, width: 25, resizeMode: 'contain' }} source={approvedIconSource} />
                    </View>
                )}
                {user?.profile_image ? (
                    <Image source={{ uri: user.profile_image }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Image style={styles.avatar} source={{
                            uri: `https://randomuser.me/api/portraits/men/${generateRandomTwoDigitNumber()}.jpg`,
                        }} />
                    </View>
                )}
            </View>

            {/* Name and Email */}
            <View style={styles.info}>
                <Text style={styles.name}>{user?.full_name} {user?.id}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <Text style={styles.phone}>📱 {user?.phone_number}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.status}>Status: {user?.is_active ? 'Active' : 'Inactive'}</Text>
                    <TouchableOpacity onPress={() => {
                        navigation.navigate('RestaurantProfileFormScreen', {
                            mode: 'edit',
                            profileId: user?.id,
                            userId: user?.id
                        });
                    }} style={{ flexDirection: 'row', alignItems: 'center', }}>
                        <Text style={{ 
                            fontSize: 12, 
                            color: '#f35353', 
                            fontFamily: theme.fontFamily.poppinsSemiBold, 
                            marginRight: 5, 
                            fontWeight: 'bold' 
                        }}>
                            Edit Profile
                        </Text>
                        {rightArrowSource ? (
                            <Image style={{ height: 10, width: 10, resizeMode: 'contain', tintColor: '#f35353' }} source={rightArrowSource} />
                        ) : (
                            <Text style={{ color: '#f35353', fontSize: 10 }}>→</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 16,
        padding: 16,
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        alignItems: 'center',
    },
    avatarWrapper: {
        marginRight: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#324748',
    },
    email: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    phone: {
        fontSize: 14,
        color: '#444',
        marginTop: 4,
    },
    status: {
        marginTop: 6,
        fontSize: 13,
        color: '#888',
        fontStyle: 'italic',
        flex: 1
    },
});

export default UserCard;
