import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import HomeIcon from "../assets/icons/HomeIcon"; // Adjust the path based on where you saved HomeIcon.js
import colors from "../assets/colors";
import UserIcon from "../assets/icons/UserIcon";
import ListIcon from "../assets/icons/ListIcon"; // Import ListIcon
import SettingsIcon from "../assets/icons/SettingsIcon";

const CustomNavBar = ({ currentScreen }) => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState(
    currentScreen || "HomeRecruit"
  );

  const handleNavigation = (screen) => {
    setSelectedTab(screen); // Update selected tab
    navigation.navigate(screen);
  };

  useEffect(() => {
    setSelectedTab(currentScreen); // Update selected tab when currentScreen changes
  }, [currentScreen]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.customNavBar}>
        <TouchableOpacity
          onPress={() => handleNavigation("HomeRecruit")}
          style={[
            styles.navItem,
            selectedTab === "HomeRecruit" && styles.selectedTab,
          ]}
        >
          <HomeIcon size={30} />
          <Text
            style={[
              styles.customNavItem,
              selectedTab === "HomeRecruit" && styles.selectedText,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleNavigation("ApplicantsRecruit")}
          style={[
            styles.navItem,
            selectedTab === "ApplicantsRecruit" && styles.selectedTab,
          ]}
        >
          <ListIcon
            color={
              selectedTab === "ApplicantsRecruit"
                ? colors.primary
                : colors.primary
            }
            size={30}
          />
          <Text
            style={[
              styles.customNavItem,
              selectedTab === "ApplicantsRecruit" && styles.selectedText,
            ]}
          >
            Applicants
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleNavigation("ProfileRecruit")}
          style={[
            styles.navItem,
            selectedTab === "ProfileRecruit" && styles.selectedTab,
          ]}
        >
          <UserIcon size={30} />
          <Text
            style={[
              styles.customNavItem,
              selectedTab === "ProfileRecruit" && styles.selectedText,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleNavigation("SettingsRecruit")}
          style={[
            styles.navItem,
            selectedTab === "SettingsRecruit" && styles.selectedTab,
          ]}
        >
          <SettingsIcon
            color={
              selectedTab === "SettingsRecruit"
                ? colors.primary
                : colors.primary
            }
            size={30}
          />
          <Text
            style={[
              styles.customNavItem,
              selectedTab === "SettingsRecruit" && styles.selectedText,
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end", // Ensure nav bar stays at the bottom
  },
  customNavBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFF",
    paddingVertical: 10, // Add vertical padding for better spacing
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: "absolute", // Ensure it stays at the bottom

    left: 0,
    right: 0,
    // Shadow for iOS
    shadowColor: "#000", // Shadow color
    shadowOffset: { width: 0, height: -10 }, // Shadow offset (x,y)
    shadowOpacity: 0.5, // Shadow opacity
    shadowRadius: 10, // Shadow blur radius
    // Elevation for Android
    elevation: 20,
  },
  navItem: {
    alignItems: "center",
  },
  customNavItem: {
    fontFamily: "Poppins-Regular",
    color: colors.primary,
    fontSize: 14,
  },
  selectedText: {
    // Styles for selected text
    color: colors.primary, // Change text color to white for better contrast
  },
  selectedTab: {
    backgroundColor: "#cbe1fe", // Highlight color for selected tab
    borderRadius: 10, // Add some corner radius
    paddingHorizontal: 6, // Add some horizontal padding
    paddingVertical: 2, // Add some vertical padding for better touch area
  },
  iconContainer: {
    borderWidth: 0, // Adjust the thickness for a stroke-like effect
    borderRadius: 12, // Adjust radius for rounded corners
    padding: 4, // Padding around the icon
  },
});

export default CustomNavBar;
