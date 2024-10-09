import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const LaunchScreen = ({ navigation }) => {
  // Automatically navigate to the Login screen after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Onboarding1"); // Replace LaunchScreen with Login_Intern
    }, 3000); // 3-second delay

    return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/ProIntern.png")} // Make sure this path is correct
        style={styles.logo}
      />
      <Text style={styles.title}>ProIntern</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // White background
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150, // Adjust the width as necessary
    height: 150, // Adjust the height as necessary
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000", // Black text color
  },
});

export default LaunchScreen;
