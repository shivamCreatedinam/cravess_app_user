import React, { useEffect, useState } from 'react';
import { useNavigationContainerRef } from '@react-navigation/native';
// import analytics from '@react-native-firebase/analytics';
// import database from '@react-native-firebase/database';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Tts from 'react-native-tts';

const DetailsScreen = () => {

    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const navigationRef = useNavigationContainerRef();
    const userId = "";
    var filter = {
        androidParams: {
            KEY_PARAM_PAN: -1,
            KEY_PARAM_VOLUME: 0.5,
            KEY_PARAM_STREAM: 'STREAM_MUSIC',
        },
    }

    const logScreenToDatabase = (screenName, userId) => {
        // database().ref(`/screen-analytics/${userId}`).push({
        //     screen: screenName,
        //     timestamp: new Date().toISOString(),
        // });
        // console.log(`database updated all the sceens.`)
    }

    useEffect(() => {
        const unsubscribe = navigationRef.addListener('state', () => {
            const currentRouteName = navigationRef.getCurrentRoute()?.name;
            if (currentRouteName) {
                // analytics().logScreenView({
                //     screen_name: currentRouteName,
                //     screen_class: currentRouteName,
                // });
                logScreenToDatabase(currentRouteName, userId);
            }
        });
        return () => unsubscribe();
    }, [navigationRef]);


    useEffect(() => {
        // Get available voices when the component mounts
        Tts.voices()
            .then((availableVoices) => {
                console.log('Available Voices:', availableVoices);
                setVoices(availableVoices);
            })
            .catch((error) => console.error('Error fetching voices:', error));
    }, []);


    const testFirebaseWrite = () => {
        database()
            .ref('/test-data')
            .set({
                name: 'Test User',
                timestamp: new Date().toISOString(),
            })
            .then(() => console.log('Data successfully saved to Firebase!'))
            .catch((error) => console.error('Firebase write error:', error));
    };

    useEffect(() => {
        testFirebaseWrite();
    }, []);


    const textToSpeech = () => {
        // Tts.voices().then((availableVoices) => console.log(availableVoices));
        Tts.speak('Handling Device and Engine Differences', filter);
    }

    const setDefaultVoice = (id) => {
        // Tts.setDefaultVoice(id);
        Tts.setDefaultLanguage(id);
    }

    return <>
        <TouchableOpacity onPress={() => textToSpeech()}>
            <Text>Text to speech</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Select a Voice
        </Text>
        <FlatList
            data={voices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={{
                        padding: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: '#ccc',
                    }}
                    onPress={() => setDefaultVoice(item.language)}
                >
                    <Text style={{ fontSize: 16 }}>
                        {item.name} ({item.language}) - {item.gender || 'Unknown'}
                    </Text>
                </TouchableOpacity>
            )}
        />
    </>
};

export default DetailsScreen;
