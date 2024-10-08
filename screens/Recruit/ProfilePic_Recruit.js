import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { storage } from "../../firebase.js"; // Import your Firebase Storage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Storage functions
import { db } from "../../firebase.js"; // Ensure you have initialized Firestore
import Ionicons from "@expo/vector-icons/Ionicons";
import colors from "../../assets/colors"; // Import colors

export default function ProfilePic_Recruit() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params; // Get userId from params
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the user's profile picture from Firestore
    const fetchProfilePic = async () => {
      const userDoc = await getDoc(doc(db, "recruiters", userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfilePic(data.pic || ""); // Set to empty if pic not found
      }
      setLoading(false);
    };
    fetchProfilePic();
  }, [userId]);

  const handleImagePicker = async () => {
    // Request permission to access the media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Check if permission was granted
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access the camera roll is required!");
      return;
    }

    // Launch the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // 1:1 aspect ratio for circular images
      quality: 1,
    });

    // Check if the image selection was successful
    if (!result.cancelled && result.assets && result.assets.length > 0) {
      setProfilePic(result.assets[0].uri); // Set the profile picture to the selected image
      console.log("Selected image URI:", result.assets[0].uri); // Log the selected image URI
    } else {
      Alert.alert("Image selection was cancelled or failed."); // Alert if image selection fails
    }
  };

  const handleContinue = async () => {
    if (!profilePic) {
      Alert.alert("Please select an image or skip.");
      return;
    }

    // Upload the selected image to Firebase Storage
    const response = await fetch(profilePic);
    const blob = await response.blob();
    const storageRef = ref(storage, `profile/${userId}`); // Reference to the storage path
    await uploadBytes(storageRef, blob);

    // Get the download URL and update Firestore
    const downloadURL = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "recruiters", userId), {
      pic: downloadURL,
    });

    // Navigate to login
    navigation.navigate("LoginRecruit", { fromProfilePic: true });
  };

  const handleSkip = () => {
    // Set placeholder image URL if skipped
    const placeholderPic = `https://avatar.iran.liara.run/username?username=placeholder&background=bad8fe&color=023E8A`;
    updateDoc(doc(db, "recruiters", userId), {
      pic: placeholderPic,
    })
      .then(() => {
        navigation.navigate("LoginRecruit", { fromProfilePic: true });
      })
      .catch((error) => {
        Alert.alert("Error updating document: ", error.message);
      });
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
      <Text style={styles.title}>Upload Profile Picture</Text>
      <TouchableOpacity
        onPress={handleImagePicker}
        style={styles.imageContainer}
      >
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image Selected</Text>
          </View>
        )}
        <TouchableOpacity onPress={handleImagePicker} style={styles.editIcon}>
          <Ionicons name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleContinue} style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.primary, // Set background color
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#fff", // Title text color
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    position: "relative", // Position relative to place edit icon inside
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 75,
    backgroundColor: "#f0f0f0",
  },
  placeholderText: {
    color: "#aaa",
  },
  editIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#1976d2",
    borderRadius: 50,
    padding: 5,
  },
  button: {
    backgroundColor: colors.white, // White background for buttons
    borderRadius: 10,
    marginTop: 100,
    padding: 15,
    width: "80%",
    marginBottom: 10, // Add margin between buttons
  },
  buttonText: {
    textAlign: "center",
    color: colors.primary, // Primary color text for button
    fontFamily: "Poppins-Regular",
    fontSize: 18,
  },
  skipButton: {
    marginTop: 20,
    backgroundColor: colors.white, // White background for skip button
    borderRadius: 10,
    padding: 15,
    width: "80%",
  },
  skipText: {
    textAlign: "center",
    color: colors.primary, // Primary color text for skip button
    fontFamily: "Poppins-Regular",
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary, // Set loading background color
  },
});
