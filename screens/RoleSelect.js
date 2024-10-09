import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Using Ionicons for icons
import Fontisto from "@expo/vector-icons/Fontisto";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import colors from "../assets/colors"; // Importing colors from your colors.js file

export default function RoleSelect({ navigation }) {
  const handleRoleSelection = async (role) => {
    // Save the selected role to AsyncStorage
    await AsyncStorage.setItem("userRole", role);
    // Navigate to the respective registration screen
    navigation.navigate(role === "Recruiter" ? "LoginRecruit" : "Login_Intern");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>

      <View style={styles.roleContainer}>
        <Text style={styles.roleText}>If you are an Industrial Expert</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRoleSelection("Recruiter")}
        >
          <Text style={styles.buttonText}>Recruiter</Text>
          <Fontisto
            name="person"
            size={24}
            color={colors.primary}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.roleContainer}>
        <Text style={styles.roleText}>If you are a student</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleRoleSelection("Intern")}
        >
          <Text style={styles.buttonText}>Intern</Text>
          <Ionicons
            name="school"
            size={24}
            color={colors.primary}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary || "#1E3A8A", // Background color from colors.js
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: "Poppins-SemiBold",
    color: colors.white || "#FFFFFF",
    marginBottom: 40,
  },
  roleContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  roleText: {
    fontSize: 18,
    fontFamily: "Poppins-Regular",
    color: colors.white || "#FFFFFF",
    marginBottom: 10,
    marginTop: 10,
  },
  button: {
    backgroundColor: colors.white || "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    width: 200,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    color: colors.primary || "#1E3A8A",
    fontFamily: "Poppins-SemiBold",
  },
  icon: {
    marginLeft: 10,
  },
});
