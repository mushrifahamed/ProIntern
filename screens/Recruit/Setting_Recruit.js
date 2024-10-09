import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import colors from "../../assets/colors"; // Adjust the path based on your project structure
import CustomNavBar from "../../components/CustomNavBar"; // Adjust the path based on your project structure

const SettingsRecruit = () => {
  const navigation = useNavigation(); // Initialize navigation

  const navigateToNotifications = () => {
    navigation.navigate("NotificationsRecruit"); // Navigate to NotificationsRecruiter
  };

  const navigateToContactUs = () => {
    navigation.navigate("ContactRecruit"); // Navigate to ContactUs (Make sure this screen is defined in your navigator)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={navigateToNotifications}
        >
          <Text style={styles.buttonText}>Notification Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={navigateToContactUs}>
          <Text style={styles.buttonText}>Contact Us</Text>
        </TouchableOpacity>
      </View>

      <CustomNavBar currentScreen="SettingsRecruit" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start", // Keep content at the top
    backgroundColor: colors.white, // Set primary color as background
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 40,
    textAlign: "center",
    color: colors.primary, // Set header text color to white
    fontFamily: "Poppins-Regular", // Set font to Poppins
  },
  buttonContainer: {
    marginHorizontal: 20, // Add horizontal margin
  },
  button: {
    backgroundColor: colors.primary, // Button background color
    padding: 15, // Padding inside the button
    borderRadius: 10, // Rounded corners
    marginBottom: 20,
    alignItems: "center", // Center text inside button
  },
  buttonText: {
    color: colors.white, // Text color for the button
    fontSize: 18, // Button text size
    fontFamily: "Poppins-Regular", // Set font to Poppins
  },
});

export default SettingsRecruit;
