import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from "react-native";
import { auth } from "../../firebase.js";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import colors from "../../assets/colors";
import * as Font from "expo-font";

export default function ForgotPass_Recruit() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
      });
    }
    loadFonts();
  }, []);

  function sendCode() {
    if (email === "") {
      setError("Email is required.");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setError(""); // Clear error on successful send
        alert("Password reset email sent to your email address.");
        navigation.navigate("LoginRecruit");
      })
      .catch((err) => {
        setError(err.message); // Display error from Firebase
      });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Forgot Password</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
      </View>

      <TouchableOpacity style={styles.button_container} onPress={sendCode}>
        <Text style={styles.button_text}>Send Link</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Already know your password?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("LoginRecruit")}>
          <Text style={styles.registerLink}>Go back to login</Text>
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
    fontFamily: "Poppins-SemiBold", // Use Poppins-SemiBold for heading
    textAlign: "center",
    fontSize: 24,
    marginBottom: 20,
    color: "#fff",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Poppins-Regular",
  },
  inputGroup: {
    marginBottom: 15,
    marginVertical: 15,
    marginHorizontal: 30,
  },
  label: {
    fontFamily: "Poppins-Regular", // Use Poppins-Regular for label
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    fontFamily: "Poppins-Regular", // Use Poppins-Regular for input
  },
  button_text: {
    textAlign: "center",
    fontSize: 18,
    color: colors.primary,
    fontFamily: "Poppins-SemiBold", // Use Poppins-SemiBold for button text
  },
  button_container: {
    borderRadius: 10,
    padding: 10,
    marginVertical: 15,
    marginTop: 25,
    backgroundColor: colors.white,
    justifyContent: "center",
    marginHorizontal: 30,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },
  registerLink: {
    fontFamily: "Poppins-SemiBold",
    color: "#fff",
    marginLeft: 5,
  },
});
