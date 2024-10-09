import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import { auth } from "../../firebase.js"; // Import the initialized auth from firebase.js
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { setDoc, doc } from "firebase/firestore"; // Import Firestore functions if you're using Firestore for user data
import { db } from "../../firebase.js"; // Ensure you have initialized Firestore
import colors from "../../assets/colors"; // Import colors

export default function Register_Recruit() {
  const [fullName, setFullName] = useState(""); // State for full name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
  const [errorMessages, setErrorMessages] = useState({}); // State for error messages
  const navigation = useNavigation();

  function validateEmail(email) {
    // Regular expression for validating email
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function signUp() {
    // Reset error messages
    setErrorMessages({});

    let errors = {};
    if (fullName.trim() === "") {
      errors.fullName = "Full name is required.";
    }
    if (email.trim() === "") {
      errors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      errors.email = "Invalid email format.";
    }
    if (password.trim() === "") {
      errors.password = "Password is required.";
    }
    if (confirmPassword.trim() === "") {
      errors.confirmPassword = "Confirm password is required.";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setErrorMessages(errors);
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (res) => {
        const userId = res.user.uid; // Get the user ID

        // Generate the profile picture URL based on the full name
        const pic = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(
          fullName
        )}&background=bad8fe&color=023E8A`;

        // Store the full name and profile picture URL in Firestore or your preferred database
        await setDoc(doc(db, "recruiters", userId), {
          fullName: fullName,
          email: email,
          pic: pic, // Store the generated profile picture URL
        });

        // Clear error messages
        setErrorMessages({});
        // Navigate to ProfilePic_Recruit with the user ID
        navigation.navigate("ProfilePicRecruit", { userId });
      })
      .catch((err) => {
        // Improved error handling
        if (err.code === "auth/email-already-in-use") {
          setErrorMessages((prev) => ({
            ...prev,
            email:
              "This email is already in use. Please use a different email.",
          }));
        } else if (err.code === "auth/weak-password") {
          setErrorMessages((prev) => ({
            ...prev,
            password: "Password should be at least 6 characters.",
          }));
        } else {
          setErrorMessages((prev) => ({
            ...prev,
            general: err.message,
          }));
        }
      });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create your Account</Text>

      {errorMessages.general && (
        <Text style={styles.errorText}>{errorMessages.general}</Text>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter full name"
          value={fullName}
          onChangeText={(text) => setFullName(text)}
        />
        {errorMessages.fullName && (
          <Text style={styles.errorText}>{errorMessages.fullName}</Text>
        )}
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errorMessages.email && (
          <Text style={styles.errorText}>{errorMessages.email}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
        />
        {errorMessages.password && (
          <Text style={styles.errorText}>{errorMessages.password}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
          secureTextEntry
        />
        {errorMessages.confirmPassword && (
          <Text style={styles.errorText}>{errorMessages.confirmPassword}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.button_container} onPress={signUp}>
        <Text style={styles.button_text}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Already a user?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("LoginRecruit")}>
          <Text style={styles.registerLink}>Log in here</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Intern?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("RoleSelect")}>
          <Text style={styles.registerLink}>Change Role</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.primary, // Use colors.primary for background
  },
  text: {
    textAlign: "center",
    fontSize: 24,
    marginBottom: 20,
    color: "#fff",
    fontFamily: "Poppins-SemiBold", // Use Poppins-SemiBold for title text
  },
  errorText: {
    color: "yellow",
    marginTop: 2,
    fontFamily: "Poppins-Regular", // Use Poppins-Regular for error text
  },
  inputGroup: {
    marginBottom: 5,
    marginVertical: 5,
    marginHorizontal: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#fff",
    fontFamily: "Poppins-Regular", // Use Poppins-Regular for labels
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: colors.white, // Use the same background color for inputs
    marginBottom: 10,
    fontSize: 18,
    borderRadius: 10,
    padding: 12,
    fontFamily: "Poppins-Regular", // Use Poppins-Regular for input text
  },
  button_text: {
    textAlign: "center",
    fontSize: 18,
    color: colors.primary, // Text color inside the button
    fontFamily: "Poppins-SemiBold", // Use Poppins-SemiBold for button text
  },
  button_container: {
    marginVertical: 15,
    marginHorizontal: 30,
    borderRadius: 5,
    padding: 15,
    backgroundColor: colors.white, // Use white for button background
    justifyContent: "center",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    fontFamily: "Poppins-Regular", // Use Poppins-Regular for small text
    color: "#fff",
    fontSize: 16,
  },
  registerLink: {
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
  },
});
