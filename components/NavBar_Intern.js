import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import HomeIcon from "../assets/icons/HomeIcon"; // Adjust the path based on where you saved HomeIcon.js
import ApplicationsIcon from "../assets/icons/ApplicationsIcon"; // Adjust the path for ApplicationsIcon
import TasksIcon from "../assets/icons/TasksIcon"; // Adjust the path for TasksIcon
import JournalIcon from "../assets/icons/JournalIcon"; // Adjust the path for JournalIcon
import colors from "../assets/colors"; // Assuming colors.js defines the color palette

const CustomNavBar = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState("Home_Intern");
  const isFocused = useIsFocused(); // This will return true when the screen is focused

  useEffect(() => {
    if (isFocused) {
      const currentRoute = navigation.getState().routes[navigation.getState().index].name;
      setSelectedTab(currentRoute); // Update the selected tab to match the current screen
    }
  }, [isFocused, navigation]);

  const handleNavigation = (screen) => {
    setSelectedTab(screen); // Update selected tab
    navigation.navigate(screen);
  };

  return (
    <View style={styles.customNavBar}>
      {/* Home Icon */}
      <TouchableOpacity
        onPress={() => handleNavigation("Home_Intern")}
        style={[
          styles.navItem,
          selectedTab === "Home_Intern" && styles.selectedTab,
        ]}
      >
        <HomeIcon size={28} />
        <Text
          style={[
            styles.customNavItem,
            selectedTab === "Home_Intern" && styles.selectedText,
          ]}
        >
          Home
        </Text>
      </TouchableOpacity>

      {/* Applications Icon */}
      <TouchableOpacity
        onPress={() => handleNavigation("Applications")}
        style={[
          styles.navItem,
          selectedTab === "Applications" && styles.selectedTab,
        ]}
      >
        <ApplicationsIcon size={28} />
        <Text
          style={[
            styles.customNavItem,
            selectedTab === "Applications" && styles.selectedText,
          ]}
        >
          Applications
        </Text>
      </TouchableOpacity>

      {/* Tasks Icon */}
      <TouchableOpacity
        onPress={() => handleNavigation("Tasks")}
        style={[
          styles.navItem,
          selectedTab === "Tasks" && styles.selectedTab,
        ]}
      >
        <TasksIcon size={28} />
        <Text
          style={[
            styles.customNavItem,
            selectedTab === "Tasks" && styles.selectedText,
          ]}
        >
          Tasks
        </Text>
      </TouchableOpacity>

      {/* Journal Icon */}
      <TouchableOpacity
        onPress={() => handleNavigation("Journal")}
        style={[
          styles.navItem,
          selectedTab === "Journal" && styles.selectedTab,
        ]}
      >
        <JournalIcon size={28} />
        <Text
          style={[
            styles.customNavItem,
            selectedTab === "Journal" && styles.selectedText,
          ]}
        >
          Journal
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    bottom: 0, // This ensures the navigation bar stays at the bottom
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
    color: "#1976d2",
    fontSize: 14,
  },
  selectedText: {
    color: colors.primary, // Change text color for selected tab
  },
  selectedTab: {
    backgroundColor: "#cbe1fe", // Highlight color for selected tab
    borderRadius: 10, // Add some corner radius
    paddingHorizontal: 6, // Add some horizontal padding
    paddingVertical: 2, // Add some vertical padding for better touch area
  },
});

export default CustomNavBar;
