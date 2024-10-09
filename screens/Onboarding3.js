import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation hook
import colors from "../assets/colors"; // Import your color palette (if any)

export default function Onboarding3() {
  const navigation = useNavigation(); // Access navigation

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://storage.googleapis.com/a1aa/image/cdHsId6j5HbXEBmHcTwb9wevKCKa6uNVuL3F9HuElYm9UXyJA.jpg",
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Track Your Progress</Text>
          <Text style={styles.subtitle}>
            Organize tasks and track progress with our task manager and journal.
          </Text>
          <View style={styles.navigation}>
            <TouchableOpacity onPress={() => navigation.navigate("RoleSelect")}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <View style={styles.indicators}>
              <View style={styles.indicator} />
              <View style={styles.indicator} />
              <View style={[styles.indicator, styles.activeIndicator]} />
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => navigation.navigate("RoleSelect")}
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
    textAlign: "center",
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
