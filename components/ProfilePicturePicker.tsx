import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfilePicturePickerProps {
  profilePicture: string;
  onProfilePictureChange: (url: string) => void;
}

export const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({
  profilePicture,
  onProfilePictureChange,
}) => {
  const defaultAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Profile Picture:</Text>
      <View style={styles.avatarGrid}>
        {defaultAvatars.map((avatar, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.avatarOption,
              profilePicture === avatar && styles.selectedAvatar,
            ]}
            onPress={() => onProfilePictureChange(avatar)}
          >
            <ExpoImage source={{ uri: avatar }} style={styles.avatar} />
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.hint}>Or enter a custom URL above</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  avatarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  avatarOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  selectedAvatar: {
    borderColor: '#007AFF',
    borderWidth: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
