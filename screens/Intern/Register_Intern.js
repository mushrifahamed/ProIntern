import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "../../firebase"; // Ensure storage is initialized
import { doc, setDoc } from "firebase/firestore"; // For Firestore document creation
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage
import { useNavigation } from "@react-navigation/native";

export default function Register_Intern() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState(""); // Removed country code, kept only mobileNumber field
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (
      fullName === "" ||
      email === "" ||
      password === "" ||
      confirmPassword === "" ||
      mobileNumber === ""
    ) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Generate a profile picture URL based on the user's name
      const profilePicUrl = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
        fullName
      )}&background=bad8fe&color=023E8A`;

      // Upload the generated profile picture to Firebase Storage
      const response = await fetch(profilePicUrl);
      const blob = await response.blob();
      const storageRef = ref(storage, `intern profile pictures/${userId}.jpg`);
      await uploadBytes(storageRef, blob);

      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(storageRef);

      // Create a Firestore document in the "Interns" collection
      await setDoc(doc(db, "Interns", userId), {
        fullName: fullName,
        email: email,
        profilePicture: downloadURL, // Store the Firebase Storage URL
        mobileNumber: mobileNumber, // Store mobile number without country code
      });

      // Navigate to the ProfilePicture_Intern screen
      navigation.navigate("ProfilePicture_Intern", { userId });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Your Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {/* Mobile number input without country code */}
      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        value={mobileNumber}
        onChangeText={setMobileNumber}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login_Intern")}>
        <Text style={styles.linkText}>Already User?</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("RoleSelect")}>
        <Text style={styles.linkText}>Change Role</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#034694",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Poppins-SemiBold",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    marginLeft: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    marginLeft: 70,
    marginRight: 70,
  },
  buttonText: {
    color: "#034694",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
  },
  linkText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    paddingBottom: 10,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
});
