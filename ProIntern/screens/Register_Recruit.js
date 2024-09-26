import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from "react-native";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebase.js";
import { useNavigation } from '@react-navigation/native';  // Import the useNavigation hook

export default function Register_Recruit() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation();  // Initialize navigation

    const auth = getAuth(app);

    function signUp() {
        if (email === "" || password === "") {
            setError("Email and password are required.");
            return;
        }
        createUserWithEmailAndPassword(auth, email, password)
            .then((res) => {
                console.log(res);
                setError("");
                navigation.navigate('LoginRecruit');  // Navigate to the Login screen on success
            })
            .catch((err) => {
                setError(err.message);
            });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Register</Text>

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

            <TouchableOpacity style={styles.button_container} onPress={signUp}>
                <Text style={styles.button_text}>Sign Up</Text>
            </TouchableOpacity>

            {/* Already a user? Navigate to Login */}
            <TouchableOpacity onPress={() => navigation.navigate('LoginRecruit')}>
                <Text style={styles.linkText}>Already a user? Log in here</Text>
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
    linkText: {
        textAlign: "center",
        fontSize: 16,
        color: "#1976d2",
        marginTop: 15,
        textDecorationLine: 'underline',
    },
});
