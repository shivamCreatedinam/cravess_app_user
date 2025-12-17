// components/RestaurantCard.js
import React from 'react';
import { StyleSheet, View, Dimensions, Image, Text } from 'react-native';

// Check if react-native-maps is available
let MapView, Marker;
try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
} catch (e) {
    // Fallback component if react-native-maps is not installed
    MapView = ({ children, style, ...props }) => (
        <View style={[style, { backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }]} {...props}>
            <Text style={{ color: '#666' }}>Map not available</Text>
            {children}
        </View>
    );
    Marker = ({ children, ...props }) => <View>{children}</View>;
}

// Check if react-native-paper is available
let Card, Title, Paragraph, Avatar;
try {
    const paper = require('react-native-paper');
    Card = paper.Card;
    Title = paper.Title;
    Paragraph = paper.Paragraph;
    Avatar = paper.Avatar;
} catch (e) {
    // Fallback components if react-native-paper is not installed
    Card = ({ children, style, ...props }) => <View style={[styles.fallbackCard, style]} {...props}>{children}</View>;
    Card.Title = ({ title, titleStyle, subtitle, subtitleStyle, left }) => (
        <View style={styles.fallbackCardTitle}>
            {left && left()}
            <View style={styles.fallbackCardTitleText}>
                <Text style={[styles.fallbackCardTitleTextMain, titleStyle]}>{title}</Text>
                {subtitle && <Text style={[styles.fallbackCardSubtitle, subtitleStyle]}>{subtitle}</Text>}
            </View>
        </View>
    );
    Card.Content = ({ children, ...props }) => <View style={styles.fallbackCardContent} {...props}>{children}</View>;
    Title = ({ children, ...props }) => <Text style={styles.fallbackTitle} {...props}>{children}</Text>;
    Paragraph = ({ children, ...props }) => <Text style={styles.fallbackParagraph} {...props}>{children}</Text>;
    Avatar = {
        Image: ({ source, size = 40, ...props }) => (
            <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} {...props} />
        ),
        Text: ({ label, size = 40, ...props }) => (
            <View style={[styles.fallbackAvatar, { width: size, height: size, borderRadius: size / 2 }]} {...props}>
                <Text style={{ fontSize: size * 0.4, color: '#fff' }}>{label}</Text>
            </View>
        ),
    };
}

const { width } = Dimensions.get('window');

const RestaurantCard = ({ restaurant, navigation }) => {
    const {
        restaurant_name,
        description,
        latitude,
        longitude,
        logo_image,
        average_rating,
        ratings_count,
        address,
        open_time,
        close_time,
    } = restaurant;

    const region = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
    };

    const grayscaleMapStyle = [
        {
            elementType: 'geometry',
            stylers: [{ color: '#f5f5f5' }],
        },
        {
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
        },
        {
            elementType: 'labels.text.fill',
            stylers: [{ color: '#616161' }],
        },
        {
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#f5f5f5' }],
        },
        {
            featureType: 'administrative.land_parcel',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#bdbdbd' }],
        },
        {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#eeeeee' }],
        },
        {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#757575' }],
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#e5e5e5' }],
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }],
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#ffffff' }],
        },
        {
            featureType: 'road.arterial',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#757575' }],
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#dadada' }],
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#616161' }],
        },
        {
            featureType: 'road.local',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }],
        },
        {
            featureType: 'transit.line',
            elementType: 'geometry',
            stylers: [{ color: '#e5e5e5' }],
        },
        {
            featureType: 'transit.station',
            elementType: 'geometry',
            stylers: [{ color: '#eeeeee' }],
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#c9c9c9' }],
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9e9e9e' }],
        },
    ];

    const handleCardClick = () => {
        console.log('Card clicked!');
    };

    return (
        <Card style={styles.card}>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    region={region}
                    pointerEvents="none" // disables user interactions
                    liteMode // optional, Android only, shows lightweight map
                    customMapStyle={grayscaleMapStyle} // <- Add this
                >
                    <Marker coordinate={region} anchor={{ x: 0.5, y: 0.5 }}>
                        <View style={styles.markerContainer}>
                            <View style={styles.markerPin} />
                        </View>
                    </Marker>
                </MapView>
            </View>

            <Card.Title
                title={restaurant_name}
                titleStyle={styles.title}
                left={() =>
                    logo_image ? (
                        <Avatar.Image size={40} source={{ uri: logo_image }} />
                    ) : (
                        <Avatar.Text size={40} label={restaurant_name[0]} />
                    )
                }
                subtitle={`⭐ ${average_rating} • ${ratings_count} ratings`}
                subtitleStyle={{ fontFamily: 'Poppins-Regular' }}
            />

            <Card.Content>
                <Paragraph style={{ fontFamily: 'Poppins-Regular' }} numberOfLines={2}>{description}</Paragraph>
                <Text style={styles.address}>{address}</Text>
                <Text style={styles.hours}>
                    Open: {open_time} - {close_time}
                </Text>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 10,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 4,
    },
    title: {
        fontFamily: 'Poppins-Bold',
    },
    mapContainer: {
        width: '100%',
        height: 180,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    address: {
        color: '#6b7280',
        marginTop: 4,
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
    },
    hours: {
        color: '#4b5563',
        marginTop: 2,
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
    },
    markerContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerPin: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#000099',
        borderWidth: 3,
        borderColor: '#fff',
    },
    fallbackCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        margin: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    fallbackCardTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    fallbackCardTitleText: {
        marginLeft: 12,
        flex: 1,
    },
    fallbackCardTitleTextMain: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Poppins-Bold',
    },
    fallbackCardSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        fontFamily: 'Poppins-Regular',
    },
    fallbackCardContent: {
        marginTop: 8,
    },
    fallbackTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    fallbackParagraph: {
        fontSize: 14,
        color: '#666',
        marginTop: 8,
    },
    fallbackAvatar: {
        backgroundColor: '#000099',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default RestaurantCard;
