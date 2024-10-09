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
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from "@react-navigation/native";
import colors from "../../assets/colors";
import * as Font from "expo-font";

export default function Login_Recruit() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const route = useRoute(); // Get route to access params
  const fromProfilePic = route.params?.fromProfilePic || false; // Default to false if not passed

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
        "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
      });
    }
    loadFonts();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user && !fromProfilePic) {
          // Prevent auto login if navigated from ProfilePic
          navigation.navigate("HomeRecruit");
        }
      });
      return () => unsubscribe();
    }, [navigation, fromProfilePic]) // Add fromProfilePic as a dependency
  );

  function login() {
    if (email === "" || password === "") {
      setError("Email and password are required.");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then((res) => {
        console.log(res);
        setError(""); // Clear error on successful login
        navigation.navigate("HomeRecruit"); // Navigate to HomeRecruit screen
      })
      .catch((err) => {
        setError(err.message); // Display error from Firebase
      });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login to your Account</Text>

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

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button_container} onPress={login}>
        <Text style={styles.button_text}>Login</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Haven't registered yet?</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("RegisterRecruit")}
        >
          <Text style={styles.registerLink}>Register here</Text>
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
