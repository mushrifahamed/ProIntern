import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { SelectList } from "react-native-dropdown-select-list"; // Import SelectList from the package
import colors from "../../assets/colors"; // Adjust the path based on your project structure
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the back button icon

const Notifications_Intern = ({ navigation }) => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(""); // Initial state for selected style

  const toggleSwitch = () =>
    setIsNotificationsEnabled((previousState) => !previousState);

  // Options for the dropdown
  const stylesOptions = [
    { key: "1", value: "Silent" },
    { key: "2", value: "Vibrate" },
    { key: "3", value: "Sound" },
  ];

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={30} color={colors.primary} />
      </TouchableOpacity>

      <Text style={styles.header}>Notification Settings</Text>

      <View style={styles.settingContainer}>
        <Text style={styles.settingLabel}>Enable Notifications</Text>
        <Switch
          trackColor={{ false: "#767577", true: colors.primary }}
          thumbColor={isNotificationsEnabled ? "white" : "#f4f3f4"}
          onValueChange={toggleSwitch}
          value={isNotificationsEnabled}
        />
      </View>

      <Text style={styles.settingLabel}>Notification Style</Text>
      <SelectList
        setSelected={setSelectedStyle}
        data={stylesOptions}
        save="value"
        search={false}
        defaultOption={{
          key: "1",
          value: "Silent",
        }}
        placeholder="Select a style"
        dropdownStyles={styles.dropdown}
        boxStyles={styles.selectBox}
        textStyles={styles.selectedText}
        inputStyles={styles.input}
        dropdownTextStyles={styles.dropdownText}
        fontFamily="Poppins-Regular"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: colors.white,
    padding: 20, // Add some padding around the content
  },
  backButton: {
    marginBottom: 20,
    backgroundColor: colors.white, // Space below the back button
  },
  header: {
    marginTop: 20,
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: colors.primary, // Set header text color to primary color
    fontFamily: "Poppins-SemiBold", // Set font to Poppins
  },
  settingContainer: {
    marginTop: 20,
    flexDirection: "row", // Align items in a row
    alignItems: "center", // Center items vertically
    justifyContent: "space-between", // Add space between label and switch
    marginVertical: 20, // Space between settings
    marginRight: 20,
  },
  settingLabel: {
    marginHorizontal: 20, // Space between settings
    fontSize: 18,
    color: colors.primary, // Set label text color to primary color
    fontFamily: "Poppins-Regular", // Set font to Poppins
  },
  dropdown: {
    backgroundColor: colors.white, // Background color of dropdown
    borderRadius: 10, // Rounded corners
  },
  selectBox: {
    marginHorizontal: 20, // Space between settings
    marginTop: 20,
    borderWidth: 1, // Border for the select box
    borderColor: colors.white, // Border color
    borderRadius: 10, // Rounded corners
    backgroundColor: colors.primary,
  },
  input: {
    color: colors.white, // Change the font color of the selected item
    fontSize: 16, // Font size for the selected item
  },
  dropdownText: {
    backgroundColor: colors.white,
    color: colors.primary, // Change the font color of the dropdown items
    fontFamily: "Poppins-Regular", // Set font for dropdown items
  },
});

export default Notifications_Intern;
