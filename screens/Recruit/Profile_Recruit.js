import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase";
import colors from "../../assets/colors";
import CustomNavbar from "../../components/CustomNavBar";
import * as Font from "expo-font";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Profile_Recruit = () => {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const recruiterDoc = await getDoc(
            doc(db, "recruiters", currentUser.uid)
          );
          if (recruiterDoc.exists()) {
            const data = recruiterDoc.data();
            setFullName(data.fullName || "");
            setEmail(currentUser.email || "");
            setProfilePic(
              data.pic || "https://your-default-url.com/default-pic.jpg"
            );
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    } else {
      Alert.alert("Error", "Image selection was canceled");
    }
  };

  const handleSave = async () => {
    if (!fullName) {
      Alert.alert("Error", "Full Name cannot be empty");
      return;
    }

    const currentUser = auth.currentUser;
    if (currentUser) {
      let downloadURL = profilePic;

      if (imageUri) {
        try {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const storageRef = ref(storage, `profile/${currentUser.uid}`);
          await uploadBytes(storageRef, blob);
          downloadURL = await getDownloadURL(storageRef);
        } catch (error) {
          console.error("Error uploading image:", error);
          Alert.alert("Error", "Failed to upload image");
          return;
        }
      }

      try {
        await updateDoc(doc(db, "recruiters", currentUser.uid), {
          fullName,
          pic: downloadURL,
        });
        Alert.alert("Success", "Profile updated successfully");
      } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate("LoginRecruit");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to log out");
    }
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.topSection}>
          <View style={styles.imageheader}>
            <TouchableOpacity
              onPress={handleImagePick}
              style={styles.imageContainer}
            >
              <Image
                source={{ uri: imageUri || profilePic }}
                style={styles.profilePic}
              />
              <Ionicons
                name="pencil"
                size={24}
                color="gray"
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Full Name"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            editable={false}
            placeholder="Email"
          />
        </View>

        <View style={styles.bottomSection}>
          <TouchableOpacity onPress={handleSave} style={styles.button}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <View style={styles.logoutContent}>
              <Text style={styles.logoutButtonText}>Logout</Text>
              <MaterialIcons name="logout" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomNavbar currentScreen="ProfileRecruit" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFBFB",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  topSection: {
    flex: 1,
    padding: 50,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    alignItems: "center",
  },
  profilePic: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginBottom: 10,
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: colors.primary,
    color: "#fff",
    borderRadius: 12,
    padding: 5,
  },
  imageheader: {
    marginTop: 50,
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    marginBottom: 5,
    marginLeft: 5,
    fontSize: 18,
    fontFamily: "Poppins-Regular",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 5,
    fontSize: 18,
    fontFamily: "Poppins-Regular",
  },
  bottomSection: {
    padding: 20,
    marginBottom: 500,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  logoutButton: {
    backgroundColor: "#C92A35",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    marginTop: 20,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFBFB",
  },
});

export default Profile_Recruit;
