import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars'; // Importing the calendar component
import moment from 'moment'; // Importing moment.js for date manipulation

const JournalPage = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(''); // Date selection state
  const [modalVisible, setModalVisible] = useState(true); // Modal visibility for internship input
  const [startDate, setStartDate] = useState(''); // Start date of internship
  const [duration, setDuration] = useState(''); // Duration of internship in months
  const [endDate, setEndDate] = useState(''); // Calculated end date of internship
  const [calendarVisible, setCalendarVisible] = useState(false); // Toggle calendar visibility
  const [showWelcome, setShowWelcome] = useState(true); // State to control the visibility of the welcome title

  // Function to validate date format
  const isValidDate = (date) => {
    return moment(date, 'YYYY-MM-DD', true).isValid(); // Strict validation
  };

  // Handle the internship details submission
  const handleInternshipSubmit = () => {
    if (isValidDate(startDate) && duration) {
      const parsedDuration = parseInt(duration);
      
      if (isNaN(parsedDuration) || parsedDuration <= 0) {
        alert('Please enter a valid duration in months.');
        return;
      }

      const formattedStartDate = moment(startDate, 'YYYY-MM-DD'); // Parse the start date
      const calculatedEndDate = formattedStartDate.clone().add(parsedDuration, 'months'); // Calculate end date

      if (formattedStartDate.isValid() && calculatedEndDate.isValid()) {
        setEndDate(calculatedEndDate.format('YYYY-MM-DD')); // Save the end date
        setModalVisible(false); // Hide the modal after submission
        setCalendarVisible(true); // Show the calendar
        setShowWelcome(false); // Hide the welcome title
      } else {
        alert('Invalid date format. Please use YYYY-MM-DD format.');
      }
    } else {
      alert('Please enter both a valid start date and duration.');
    }
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString); // Update the selected date when a day is pressed
    console.log("Selected Date:", day.dateString); // Log selected date
  };

  const handleEditJournal = () => {
    if (selectedDate) {
      navigation.navigate('JournalCreate_Intern', { date: selectedDate });
    } else {
      alert("Please select a date to edit your journal entry."); // Simple alert if no date is selected
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Welcome Title */}
      {showWelcome && (
        <Text style={styles.title}>Welcome to Your Internship Journal</Text>
      )}

      {/* Calendar Selection */}
      {calendarVisible && (
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate]: { selected: true, marked: true, selectedColor: '#023E8A' },
          }}
          minDate={startDate || undefined} // Start date of the internship
          maxDate={endDate || undefined} // End date of the internship
          theme={{
            selectedDayBackgroundColor: '#023E8A',
            selectedDayTextColor: '#ffffff',
            dayTextColor: '#023E8A',
            monthTextColor: '#023E8A',
            arrowColor: '#023E8A',
          }}
          style={styles.calendar} // Styling for the calendar
        />
      )}

      {/* Edit Journal Button */}
      {calendarVisible && (
        <TouchableOpacity
          style={styles.editJournalButton}
          onPress={handleEditJournal}
        >
          <Text style={styles.editJournalButtonText}>Edit Journal</Text>
        </TouchableOpacity>
      )}

      {/* Modal for Internship Period Input */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Close modal on back button
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Enter Your Internship Details</Text>
            
            {/* Internship Start Date Input */}
            <TextInput
              placeholder="Enter Start Date (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              style={styles.input}
            />
            
            {/* Internship Duration Input */}
            <TextInput
              placeholder="Enter Duration in Months"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={styles.input}
            />
            
            {/* Submit Button */}
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleInternshipSubmit} // Handle submission of internship details
            >
              <Text style={styles.modalButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#023E8A',
    marginBottom: 10,
    marginTop: 120,
    textAlign: 'center',
  },
  calendar: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#f2f6ff',
    padding: 10,
    marginTop: 60, // Adjust this value to move the calendar downwards
  },
  editJournalButton: {
    backgroundColor: '#023E8A',
    paddingVertical: 12,
    paddingHorizontal: 112,
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 20,
    elevation: 4, // Adding elevation for a subtle shadow
  },
  editJournalButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    color: '#023E8A',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderColor: '#023E8A',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#023E8A',
  },
  modalButton: {
    backgroundColor: '#023E8A',
    paddingVertical: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default JournalPage;