import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation hook
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import colors from "../assets/colors"; // Import your color palette (if any)

export default function Onboarding1() {
  const navigation = useNavigation(); // Access navigation

  useEffect(() => {
    const checkUserRole = async () => {
      const role = await AsyncStorage.getItem("userRole");
      if (role) {
        // Navigate to the appropriate screen based on the saved role
        navigation.navigate(
          role === "Recruiter" ? "LoginRecruit" : "Login_Intern"
        ); // Adjust the navigation routes accordingly
      }
    };

    checkUserRole();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://firebasestorage.googleapis.com/v0/b/prointern3.appspot.com/o/onboarding%2Fo1.jpg?alt=media&token=1438d6fa-4caa-43ed-8d53-857fe0ccd1b0",
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Find Your Dream Internship</Text>
          <Text style={styles.subtitle}>
            Search and apply for internships that match your skills and
            interests.
          </Text>
          <View style={styles.navigation}>
            <TouchableOpacity onPress={() => navigation.navigate("RoleSelect")}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <View style={styles.indicators}>
              <View style={[styles.indicator, styles.activeIndicator]} />
              <View style={styles.indicator} />
              <View style={styles.indicator} />
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => navigation.navigate("Onboarding2")}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "flex-end", // Align content at the bottom
  },
  overlay: {
    backgroundColor: colors.primary, // Semi-transparent background
    padding: 20,
    paddingBottom: 40,
    paddingTop: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "white",
    marginBottom: 10,
    fontFamily: "Poppins-SemiBold", // Adjust to your font
  },
  subtitle: {
    fontSize: 14,
    color: colors.white,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  skipText: {
    color: "white",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    paddingHorizontal: 20,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: "white",
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.5,
  },
  activeIndicator: {
    opacity: 1,
  },
  nextButton: {
    backgroundColor: "white",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  nextButtonText: {
    color: colors.primary || "#00008B",
    fontSize: 14,
    fontWeight: "bold",
  },
});
