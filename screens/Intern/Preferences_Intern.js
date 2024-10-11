import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../../firebase"; // Ensure Firestore is imported
import { doc, updateDoc } from "firebase/firestore"; // Firestore imports

const { height } = Dimensions.get("window"); // Get device screen height

export default function PreferencesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params; // Get userId passed from previous screen

  const [preferences, setPreferences] = useState([]);

  const preferenceOptions = [
    "Software Development",
    "Data Science and Analytics",
    "Information Technology",
    "Engineering",
    "Architecture and Design",
    "Finance and Accounting",
    "Marketing and Sales",
    "Human Resources",
    "Research and Development",
    "Media and Communications",
  ];

  // Toggle preference selection
  const togglePreference = (preference) => {
    setPreferences((prevPreferences) => {
      if (prevPreferences.includes(preference)) {
        return prevPreferences.filter((item) => item !== preference);
      } else {
        return [...prevPreferences, preference];
      }
    });
  };

  // Handle saving preferences and navigating to login
  const handleNext = async () => {
    try {
      // Save the preferences in Firestore under the Interns collection for this user
      await updateDoc(doc(db, "Interns", userId), {
        preferences: preferences,
      });
      // Navigate to login screen after saving
      navigation.replace("Login_Intern");
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What is your Interested Area of Work?</Text>
      <ScrollView contentContainerStyle={styles.preferencesContainer}>
        {preferenceOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.preferenceTile}
            onPress={() => togglePreference(option)}
          >
            <View style={styles.checkbox}>
              {preferences.includes(option) && (
                <View style={styles.checkedBox} />
              )}
            </View>
            <Text style={styles.preferenceText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next ➔</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#034694", // Blue background
    padding: 20,
    paddingTop: height * 0.1, // Adjust padding to prevent overlap with status bar
  },
  title: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  preferencesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 30,
    justifyContent: "space-between",
  },
  preferenceTile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10, // Reduced padding for better text wrapping
    borderRadius: 20,
    marginBottom: 15,
    width: "45%", // Adjust width to make text wrap better
    justifyContent: "flex-start",
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#034694",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkedBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#034694", // Blue check for selected
  },
  preferenceText: {
    color: "#034694", // Blue text for non-selected options
    fontSize: 14,
    flexShrink: 1, // Allow text to wrap within available space
  },
  nextButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30, // Fixed bottom position for Next button
  },
  nextButtonText: {
    color: "#034694",
    fontSize: 16,
  },
});
