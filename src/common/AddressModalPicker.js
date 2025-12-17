import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Alert,
    Pressable,
} from 'react-native';

// Check if react-native-paper is available, otherwise use fallback components
let Button, IconButton;
try {
    const paper = require('react-native-paper');
    Button = paper.Button;
    IconButton = paper.IconButton;
} catch (e) {
    // Fallback components if react-native-paper is not installed
    Button = ({ children, onPress, mode, style, ...props }) => (
        <Pressable
            onPress={onPress}
            style={[
                styles.fallbackButton,
                mode === 'contained' && styles.fallbackButtonContained,
                style,
            ]}
            {...props}>
            <Text style={styles.fallbackButtonText}>{children}</Text>
        </Pressable>
    );
    IconButton = ({ icon, onPress, size = 24, ...props }) => (
        <Pressable onPress={onPress} style={styles.fallbackIconButton} {...props}>
            <Text style={styles.fallbackIconText}>✏️</Text>
        </Pressable>
    );
}

const AddressModal = ({ visible, onClose, onSelect }) => {

    const dummyAddresses = [
        { id: '1', label: 'Home', details: '123 Main St, Springfield', editable: true },
        { id: '2', label: 'Office', details: '456 Corporate Ave, Metropolis', editable: true },
        { id: '3', label: 'Gym', details: '789 Workout Rd, Gotham', editable: false },
    ];

    const [addresses, setAddresses] = useState(dummyAddresses);
    const [editId, setEditId] = useState(null);
    const [newAddress, setNewAddress] = useState({ label: '', details: '' });

    const handleEdit = (id, field, value) => {
        setAddresses((prev) =>
            prev.map((addr) => (addr.id === id ? { ...addr, [field]: value } : addr))
        );
    };

    const handleAdd = () => {
        if (!newAddress.label || !newAddress.details) {
            return Alert.alert('Error', 'Please fill all fields');
        }
        const newId = (addresses.length + 1).toString();
        setAddresses([
            ...addresses,
            { id: newId, ...newAddress, editable: true },
        ]);
        setNewAddress({ label: '', details: '' });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Select Delivery Address</Text>

                    <FlatList
                        data={addresses}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.addressItem}>
                                {editId === item.id ? (
                                    <>
                                        <TextInput
                                            style={styles.input}
                                            value={item.label}
                                            onChangeText={(text) => handleEdit(item.id, 'label', text)}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            value={item.details}
                                            onChangeText={(text) => handleEdit(item.id, 'details', text)}
                                        />
                                        <View style={styles.inlineBtns}>
                                            <Button onPress={() => setEditId(null)}>Save</Button>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity onPress={() => onSelect(item)}>
                                            <Text style={styles.label}>{item.label}</Text>
                                            <Text style={styles.details}>{item.details}</Text>
                                        </TouchableOpacity>
                                        {item.editable && (
                                            <IconButton
                                                icon="pencil"
                                                size={18}
                                                onPress={() => setEditId(item.id)}
                                            />
                                        )}
                                    </>
                                )}
                            </View>
                        )}
                        ListFooterComponent={
                            <>
                                <Text style={styles.subtitle}>Add New Address</Text>
                                <TextInput
                                    placeholder="Label (e.g. Home)"
                                    style={styles.input}
                                    value={newAddress.label}
                                    onChangeText={(text) => setNewAddress({ ...newAddress, label: text })}
                                />
                                <TextInput
                                    placeholder="Full Address"
                                    style={styles.input}
                                    value={newAddress.details}
                                    onChangeText={(text) => setNewAddress({ ...newAddress, details: text })}
                                />
                                <Button mode="contained" onPress={handleAdd} style={styles.addBtn}>
                                    Add Address
                                </Button>
                            </>
                        }
                    />

                    <Button onPress={onClose} mode="contained" style={styles.closeBtn}>
                        Close
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

export default AddressModal;


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },
    subtitle: {
        marginTop: 20,
        fontWeight: '600',
    },
    addressItem: {
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontWeight: '600',
    },
    details: {
        color: '#666',
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 6,
        borderRadius: 6,
        marginBottom: 8,
    },
    addBtn: {
        marginTop: 10,
        backgroundColor: '#f06262',
    },
    closeBtn: {
        color: '#fff',
        marginTop: 10,
        backgroundColor: '#000000',
    },
    inlineBtns: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    fallbackButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackButtonContained: {
        backgroundColor: '#000099',
    },
    fallbackButtonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '500',
    },
    fallbackIconButton: {
        padding: 8,
        borderRadius: 4,
    },
    fallbackIconText: {
        fontSize: 18,
    },
});
