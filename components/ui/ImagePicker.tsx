import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    Dimensions
} from 'react-native';
import * as imagepick from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface ImagePickerProps {
    selectedImage?: string;
    onImageSelect: (imageUri: string) => void;
    suggestedImages?: string[];
}

const { width } = Dimensions.get('window');

export const ImagePicker: React.FC<ImagePickerProps> = ({
    selectedImage,
    onImageSelect,
    suggestedImages = [],
}) => {
    const [loading, setLoading] = useState(false);

    // Request permissions
    const requestPermissions = async () => {
        const { status } = await imagepick.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant camera roll permissions to select images.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    // Pick image from gallery
    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        setLoading(true);
        try {
            const result = await imagepick.launchImageLibraryAsync({
                mediaTypes: imagepick.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                onImageSelect(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Take photo with camera
    const takePhoto = async () => {
        const { status } = await imagepick.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant camera permissions to take photos.',
                [{ text: 'OK' }]
            );
            return;
        }

        setLoading(true);
        try {
            const result = await imagepick.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                onImageSelect(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show image picker options
    const showImagePickerOptions = () => {
        Alert.alert(
            'Select Image',
            'Choose how you want to add an image',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Camera', onPress: takePhoto },
                { text: 'Gallery', onPress: pickImage },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Selected Image Display */}
            <View style={styles.selectedImageContainer}>
                {selectedImage ? (
                    <View style={styles.imageWrapper}>
                        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                        <TouchableOpacity
                            style={styles.changeButton}
                            onPress={showImagePickerOptions}
                        >
                            <Ionicons name="camera" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.placeholderContainer}
                        onPress={showImagePickerOptions}
                    >
                        <Ionicons name="camera" size={40} color="#007AFF" />
                        <Text style={styles.placeholderText}>Add Profile Picture</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Suggested Images */}
            {suggestedImages.length > 0 && (
                <View style={styles.suggestedContainer}>
                    <Text style={styles.suggestedTitle}>Suggested Images</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.suggestedScroll}
                    >
                        {suggestedImages.map((imageUri, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.suggestedImageContainer}
                                onPress={() => onImageSelect(imageUri)}
                            >
                                <Image source={{ uri: imageUri }} style={styles.suggestedImage} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    selectedImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imageWrapper: {
        position: 'relative',
    },
    selectedImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: '#007AFF',
    },
    changeButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#007AFF',
        borderRadius: 20,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    placeholderContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
    },
    placeholderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginTop: 8,
        textAlign: 'center',
    },
    placeholderSubtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    suggestedContainer: {
        marginTop: 10,
    },
    suggestedTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    suggestedScroll: {
        paddingHorizontal: 20,
    },
    suggestedImageContainer: {
        marginRight: 15,
    },
    suggestedImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#ddd',
    },
});