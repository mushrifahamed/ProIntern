import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native"; // for navigation
import { db, auth } from "../../firebase"; // Adjust this import based on your firebase.js path
import colors from "../../assets/colors"; // Adjust the path to your colors.js file
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore functions

export default function InterviewUpdate_Recruit() {
  const route = useRoute();
  const navigation = useNavigation(); // Initialize navigation
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [link, setLink] = useState(""); // Add link state
  const [interviewData, setInterviewData] = useState({});

  const interviewId = route.params.interviewId;

  useEffect(() => {
    const fetchInterviewData = async () => {
      const interviewRef = doc(db, "interviews", interviewId);
      const interviewDoc = await getDoc(interviewRef);
      if (interviewDoc.exists()) {
        const dateParts = interviewDoc.data().date.split("/");
        const timeParts = interviewDoc.data().time.split(":");
        const date = new Date(
          parseInt(dateParts[2]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[0]),
          parseInt(timeParts[0]),
          parseInt(timeParts[1])
        );
        const time = new Date(
          1970,
          0,
          1,
          parseInt(timeParts[0]),
          parseInt(timeParts[1])
        );
        setInterviewData(interviewDoc.data());
        setDate(date);
        setTime(time);
        setLink(interviewDoc.data().link);
      }
    };
    fetchInterviewData();
  }, [interviewId]);

  // Function to update an interview
  const handleUpdateInterview = async () => {
    if (!link) {
      Alert.alert("Error", "Please enter a valid interview link.");
      return;
    }

    try {
      // Update the interview document in Firestore
      const interviewRef = doc(db, "interviews", interviewId);
      await updateDoc(interviewRef, {
        date: date.toLocaleDateString(),
        time: time.toLocaleTimeString(),
        link,
      });

      // Notify the user and navigate back
      Alert.alert("Success", "Interview has been updated successfully.");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating interview:", error);
      Alert.alert("Error", "Failed to update the interview. Please try again.");
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()} // Go back navigation
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Interview Update</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setShowDatePicker(true)}
          >
            <TextInput
              style={styles.input}
              placeholder="dd/mm/yy"
              value={date.toLocaleDateString()}
              editable={false}
            />
            <Ionicons
              name="calendar"
              size={20}
              color={colors.textSecondary}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.inputWrapper}
            onPress={() => setShowTimePicker(true)}
          >
            <TextInput
              style={styles.input}
              placeholder="hh:mm pm/am"
              value={time.toLocaleTimeString()}
              editable={false}
            />
            <Ionicons
              name="time"
              size={20}
              color={colors.textSecondary}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}

        {/* Link Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Link</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="https://teams.microsoft.com/..."
            multiline
            value={link}
            onChangeText={setLink}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleUpdateInterview}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1, // Fill the screen height
    backgroundColor: colors.white,
  },
  header: {
    paddingTop: 40, // Adjust as needed for status bar spacing
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    padding: 10,
    position: "absolute",
    left: 16,
    top: 40, // Keep the back button to the left corner
  },
  headerText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 20,
    color: colors.textPrimary,
  },
  contentContainer: {
    marginTop: 100,
    flexGrow: 1,
    padding: 16,
    backgroundColor: colors.white,
  },
  inputContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  label: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    color: "black",
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 200,
    textAlignVertical: "top",
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  button: {
    marginHorizontal: 16,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 35,
  },
  buttonText: {
    fontFamily: "Poppins-SemiBold",
    color: colors.white,
    fontSize: 16,
  },
});
