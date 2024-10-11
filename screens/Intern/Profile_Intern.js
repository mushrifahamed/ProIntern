import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { getFirestore, getDoc, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import colors from "../../assets/colors";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";

const db = getFirestore();
const storage = getStorage();
const auth = getAuth();

const Profile_Intern = () => {
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
  });
  const [cvUrl, setCvUrl] = useState(null);
  const [cvFileName, setCvFileName] = useState("No CV uploaded");
  const [profilePic, setProfilePic] = useState(null);
  const navigation = useNavigation(); // Navigation hook

  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "Interns", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData({
              fullName: userData.fullName || "",
              email: currentUser.email,
              mobileNumber: userData.mobileNumber || "", // Retrieve mobile number
            });
            setCvUrl(userData.cvUrl || "");
            setProfilePic(
              userData.profilePicture ||
                "https://default-avatar-url.com/default-avatar.jpg"
            );
            if (userData.cvUrl) {
              setCvFileName(`${userData.fullName}.pdf`);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserProfile();
  }, []);

  const handleCVUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const document = result.assets[0]; // Access the first document
        const fileExtension = document.name.split(".").pop(); // Get the file extension

        const currentUser = auth.currentUser;
        const fileName = `${userData.fullName}.${fileExtension}`; // Full Name + extension
        const cvRef = ref(storage, `interns/${currentUser.uid}/${fileName}`);

        const response = await fetch(document.uri);
        const blob = await response.blob();

        await uploadBytes(cvRef, blob);

        const downloadURL = await getDownloadURL(cvRef);
        setCvUrl(downloadURL);
        setCvFileName(fileName);

        // Save the CV download URL to Firestore
        await updateDoc(doc(db, "Interns", currentUser.uid), {
          cvUrl: downloadURL,
        });
        Alert.alert("CV uploaded successfully");
      } else {
        console.log("Document picker was canceled or no document selected.");
      }
    } catch (error) {
      console.error("Error uploading CV:", error);
    }
  };

  const handleDownloadCV = async () => {
    if (cvUrl) {
      try {
        Linking.openURL(cvUrl);
        navigation.navigate("Home_Intern");
      } catch (error) {
        Alert.alert("Error", "Unable to open CV.");
        console.error("Error opening CV:", error);
      }
    } else {
      Alert.alert("No CV available", "You haven't uploaded a CV yet.");
    }
  };

  const handleSaveChanges = async () => {
    try {
      const currentUser = auth.currentUser;
      await updateDoc(doc(db, "Interns", currentUser.uid), {
        fullName: userData.fullName,
        mobileNumber: userData.mobileNumber, // Save mobile number
      });
      Alert.alert("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  const handleProfilePicUpload = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const currentUser = auth.currentUser;
        const fileName = `${userData.fullName}_profile.jpg`;
        const profilePicRef = ref(
          storage,
          `interns/${currentUser.uid}/${fileName}`
        );

        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();

        await uploadBytes(profilePicRef, blob);

        const downloadURL = await getDownloadURL(profilePicRef);
        setProfilePic(downloadURL); // Update state with the new profile picture URL

        await updateDoc(doc(db, "Interns", currentUser.uid), {
          profilePicture: downloadURL,
        });

        Alert.alert("Profile picture updated successfully");
      } else {
        console.log("Image picker was canceled or no image selected.");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      Alert.alert("Error uploading profile picture");
    }
  };

  const handleChangePreferences = () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      navigation.navigate("ChangePreferences_Intern", {
        userId: currentUser.uid,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="black"
            style={styles.backIcon}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerText}>My Profile</Text>
        </View>

        {/* Profile Picture */}
        <View style={styles.profileContainer}>
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
          <TouchableOpacity onPress={handleProfilePicUpload}>
            <Feather name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Full Name Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={userData.fullName}
            onChangeText={(text) =>
              setUserData({ ...userData, fullName: text })
            }
          />
        </View>

        {/* Email Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Email</Text>
          <TextInput
            style={styles.input}
            value={userData.email}
            editable={false}
          />
        </View>

        {/* Mobile Number Field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            value={userData.mobileNumber}
            onChangeText={(text) =>
              setUserData({ ...userData, mobileNumber: text })
            }
            keyboardType="phone-pad"
          />
        </View>

        {/* CV Section */}
        <View style={styles.cvContainer}>
          <Text style={styles.label}>CV</Text>
          <View style={styles.cvDisplay}>
            <TouchableOpacity onPress={handleDownloadCV}>
              <View style={styles.cvInner}>
                <Ionicons name="document" size={24} color={colors.primary} />
                <Text style={styles.cvText}>{cvFileName}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCVUpload}>
              <Feather name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Change Preferences */}
        <TouchableOpacity
          style={styles.preferences}
          onPress={handleChangePreferences}
        >
          <Text style={styles.preferenceText}>Change Preferences</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Save Changes Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    marginLeft: 10,
  },
  backIcon: {
    padding: 10,
  },
  profileContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    color: "#4B5563",
    marginBottom: 5,
    fontFamily: "Poppins-Regular",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    marginVertical: 5,
    fontFamily: "Poppins-Regular",
  },
  cvContainer: {
    marginBottom: 20,
  },
  cvDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    marginTop: 5,
    borderRadius: 10,
    padding: 10,
  },
  cvInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  cvText: {
    marginLeft: 10,
    color: "#6B7280",
    fontFamily: "Poppins-Regular",
  },
  preferences: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderColor: "#E5E7EB",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    marginBottom: 20,
  },
  preferenceText: {
    color: "#374151",
    fontFamily: "Poppins-Regular",
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
});

export default Profile_Intern;
