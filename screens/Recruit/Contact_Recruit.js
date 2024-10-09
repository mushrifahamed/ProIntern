import React from "react";
import { View, Text, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler"; // Ensure you're importing from the correct library
import colors from "../../assets/colors"; // Adjust the path based on your project structure
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

const Contact_Recruit = () => {
  const navigation = useNavigation(); // Use useNavigation hook to get the navigation object

  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber) => {
    Linking.openURL(`https://wa.me/${phoneNumber}`);
  };

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()} // Use the goBack function to navigate back
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.primary}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      <Text style={styles.sectionTitle}>Get in Touch</Text>
      <Text style={styles.sectionSubtitle}>Feel free to ask us anything</Text>

      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => handleCall("0765271411")}
      >
        <Ionicons name="call" size={24} color={colors.primary} />
        <Text style={styles.contactText}>076 527 1411</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => handleWhatsApp("0765271411")}
      >
        <Ionicons name="logo-whatsapp" size={24} color={colors.primary} />
        <Text style={styles.contactText}>076 527 1411</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.contactItem}
        onPress={() => handleEmail("pro.intern@gmail.com")}
      >
        <Ionicons name="mail" size={24} color={colors.primary} />
        <Text style={styles.contactText}>pro.intern@gmail.com</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    marginTop: 20,
  },
  backIcon: {
    zIndex: 100, // Ensure the icon is on top
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    fontFamily: "Poppins-Regular", // Set font to Poppins
    color: colors.primary,
    textAlign: "center", // Center text
    flexGrow: 1, // Allow header text to take up available space
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    fontFamily: "Poppins-Regular", // Set font to Poppins
    color: colors.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    fontFamily: "Poppins-Regular", // Set font to Poppins
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    padding: 10,
    margin: 10,
    marginBottom: 20,
    width: "90%",
  },
  contactText: {
    fontSize: 16,
    color: colors.black,
    fontFamily: "Poppins-Regular", // Set font to Poppins
  },
});

export default Contact_Recruit;
