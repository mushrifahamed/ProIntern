import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { storage, db } from '../../firebase'; // Firebase imports
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Firestore imports
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage

export default function ProfilePicture_Intern() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params; // Get the userId passed from the register screen
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing profile picture (from Firestore or default)
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const userDoc = doc(db, 'Interns', userId);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setProfilePic(docSnap.data().profilePicture);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        setLoading(false);
      }
    };

    fetchProfilePicture();
  }, [userId]);

  // Handle uploading a new profile picture
  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission to access the camera roll is required!');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!pickerResult.canceled) {
        setProfilePic(pickerResult.assets[0].uri); // Ensure to use assets from the result
      }
    } catch (error) {
      console.error('Error during image selection:', error);
    }
  };

  const handleContinue = async () => {
    if (profilePic) {
      try {
        // Upload new profile picture
        const response = await fetch(profilePic);
        const blob = await response.blob();
        const storageRef = ref(storage, `intern profile pictures/${userId}.jpg`);
        await uploadBytes(storageRef, blob);

        // Get the download URL and update Firestore
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(doc(db, 'Interns', userId), { profilePicture: downloadURL });

        // Navigate to Preferences_Intern screen after saving profile picture
        navigation.replace('Preferences_Intern', { userId });
      } catch (error) {
        console.error('Error during profile picture upload:', error);
      }
    } else {
      // If no picture is uploaded, directly navigate to Preferences_Intern screen
      navigation.replace('Preferences_Intern', { userId });
    }
  };

  const handleSkip = () => {
    // Directly navigate to Preferences_Intern screen on skip
    navigation.replace('Preferences_Intern', { userId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Profile Picture</Text>
      <TouchableOpacity onPress={handleImagePicker}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <View style={styles.placeholder}>
            <Text>No Image Selected</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSkip}>
        <Text style={styles.buttonText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#034694', // Blue background
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff', // White text
    fontSize: 24,
    marginBottom: 30,
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fff', // White background for the profile image
    marginBottom: 20,
  },
  placeholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // Placeholder color
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff', // White button background
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%', // Adjust width for a larger button
  },
  buttonText: {
    color: '#034694', // Blue text for buttons
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
