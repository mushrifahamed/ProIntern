import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import colors from "../../assets/colors"; // Adjust the path based on your project structure
import Ionicons from '@expo/vector-icons/Ionicons';

const Settings_Intern = () => {
  const navigation = useNavigation(); // Initialize navigation

  const navigateToNotifications = () => {
    navigation.navigate("Notifications_Intern"); // Navigate to NotificationsIntern
  };

  const navigateToContactUs = () => {
    navigation.navigate("Contact_Intern"); // Navigate to ContactUsIntern (Make sure this screen is defined in your navigator)
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
          <Ionicons name="arrow-back" size={24} color="black" style={styles.backIcon} onPress={() => navigation.navigate('Home_Intern')} />
          <Text style={styles.headerText}>My Profile</Text>
        </View>

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
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    marginLeft: 10,
    fontFamily: "Poppins-SemiBold",
  },
  backIcon: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  buttonContainer: {
    marginHorizontal: 20, // Add horizontal margin
  },
  button: {
    backgroundColor: colors.primary, // Button background color
    padding: 15, // Padding inside the button
    marginTop: 20,
    borderRadius: 10, // Rounded corners
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    alignItems: "center", // Center text inside button
  },
  buttonText: {
    color: colors.white, // Text color for the button
    fontSize: 18, // Button text size
    fontFamily: "Poppins-Regular", // Set font to Poppins
  },
});

export default Settings_Intern;
