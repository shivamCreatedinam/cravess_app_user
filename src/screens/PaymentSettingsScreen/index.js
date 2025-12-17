import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, Platform, NativeModules } from 'react-native';
// import YouTube from 'react-native-youtube-iframe';
import axios from 'axios';

const API_KEY = 'AIzaSyBbTJSBQ-sEjpbITakhSoD0DaCNC9nmZBo';

const { PipModule } = NativeModules;

export default function RestaurantProfileDetailsScreen() {

    const playerRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [videos, setVideos] = useState([]);
    const [selectedVideoId, setSelectedVideoId] = useState(null);

    const searchYouTubeVideos = async () => {
        try {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/search`,
                {
                    params: {
                        part: 'snippet',
                        maxResults: 10,
                        q: searchQuery,
                        key: API_KEY,
                    },
                }
            );
            setVideos(response.data.items);
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    // Toggle Picture-in-Picture for supported devices
    const handlePictureInPicture = () => {
        if (Platform.OS === "android") {
            if (PipModule) {
                PipModule.enterPictureInPictureMode();
            } else {
                console.error('PipModule is not available');
            }
        } else if (Platform.OS === "ios") {
            Alert.alert(
                "Picture-in-Picture Mode",
                "PiP is handled natively on iOS when the app is minimized during playback."
            );
        } else {
            Alert.alert("Unsupported Platform", "PiP is not supported on this platform.");
        }
    };

    const renderVideoItem = ({ item }) => (
        <TouchableOpacity
            style={styles.videoItem}
            onPress={() => setSelectedVideoId(item.id.videoId)}
        >
            <Text style={styles.videoTitle}>{item.snippet.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {selectedVideoId ? (
                <View style={styles.playerContainer}>
                    {/* <YouTube
                        ref={playerRef}
                        height={300}
                        width={Dimensions.get('screen').width}
                        play={true}
                        videoId={selectedVideoId}
                        onChangeState={(state) => console.log('State:', state)}
                        forceAndroidAutoplay // Required for Android autoplay
                        controls
                        paused={false} // Auto-play video
                        audioOnly={false} // Ensure audio continues in background
                        playInBackground={true} // Allow audio to play in the background
                        playWhenInactive={true} // Allow audio to play when screen is locked
                        resizeMode="contain"
                        onError={(error) => console.log('Video Error:', error)}
                        webViewProps={{
                            allowsInlineMediaPlayback: true, // For inline playback
                            mediaPlaybackRequiresUserAction: false,
                            javaScriptEnabled: true,
                        }}
                    /> */}
                    <View style={styles.controls}>
                        <Button title="Back to Search" onPress={() => setSelectedVideoId(null)} />
                        <Button title="Enable PiP" onPress={handlePictureInPicture} />
                    </View>
                </View>
            ) : (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search YouTube videos"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Button title="Search" onPress={searchYouTubeVideos} />
                    <FlatList
                        data={videos}
                        keyExtractor={(item) => item.id.videoId}
                        renderItem={renderVideoItem}
                        style={styles.videoList}
                    />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    searchContainer: {
        flex: 1,
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 8,
    },
    videoList: {
        marginTop: 10,
    },
    videoItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    videoTitle: {
        fontSize: 16,
        color: '#333',
    },
    playerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    controls: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
});