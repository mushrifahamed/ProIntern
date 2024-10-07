import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { auth } from "../../firebase.js"; // Import the initialized auth from firebase.js
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

export default function Login_Recruit() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation();

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
            <Text style={styles.text}>Login</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Enter email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button_container} onPress={login}>
                <Text style={styles.button_text}>Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    text: {
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 24,
        marginBottom: 20,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        fontSize: 18,
    },
    button_text: {
        textAlign: "center",
        fontSize: 18,
        color: "#fff",
    },
    button_container: {
        borderRadius: 5,
        padding: 15,
        backgroundColor: "#1976d2",
        justifyContent: "center",
    },
});
