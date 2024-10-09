import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { db } from '../../firebase'; // Import Firebase
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebase'; // Ensure you import auth

const JournalPage = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // Initially set to false
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [detailsSaved, setDetailsSaved] = useState(false); // New state variable to track if details are saved
  
  const userId = auth.currentUser ? auth.currentUser.uid : null; // Get current user ID

  console.log('Current User ID:', userId); // Log the current user ID
  
  // Load existing internship details when the component mounts
  useEffect(() => {
    const loadInternshipDetails = async () => {
      if (userId) {
        try {
          const internshipRef = doc(db, 'internshipjournal', userId);
          const internshipDoc = await getDoc(internshipRef);

          if (internshipDoc.exists()) {
            const data = internshipDoc.data();
            console.log('Loaded Data:', data); // Log the loaded data
            setStartDate(data.startDate);
            setDuration(data.duration.toString()); // Ensure duration is a string for TextInput
            
            const formattedStartDate = moment(data.startDate, 'YYYY-MM-DD');
            const calculatedEndDate = formattedStartDate.clone().add(data.duration, 'months');
            setEndDate(calculatedEndDate.format('YYYY-MM-DD'));

            // Show calendar and hide modal
            setCalendarVisible(true);
            setShowWelcome(false);
            setDetailsSaved(true);
          } else {
            console.log('No internship data found. Showing modal.'); // Log when no data is found
            setModalVisible(true);
          }
        } catch (error) {
          console.error("Error loading internship details:", error);
          alert("Failed to load internship details. Please try again.");
        }
      } else {
        console.log('User not logged in or ID is null.'); // Log if user is not logged in
      }
    };

    loadInternshipDetails();
  }, [userId]);
  
  const isValidDate = (date) => moment(date, 'YYYY-MM-DD', true).isValid();

  const handleInternshipSubmit = async () => {
    if (isValidDate(startDate) && duration) {
      const parsedDuration = parseInt(duration);

      if (isNaN(parsedDuration) || parsedDuration <= 0) {
        alert('Please enter a valid duration in months.');
        return;
      }

      const formattedStartDate = moment(startDate, 'YYYY-MM-DD');
      const calculatedEndDate = formattedStartDate.clone().add(parsedDuration, 'months');

      if (formattedStartDate.isValid() && calculatedEndDate.isValid()) {
        setEndDate(calculatedEndDate.format('YYYY-MM-DD'));
        setModalVisible(false);
        setCalendarVisible(true);
        setShowWelcome(false);
        setDetailsSaved(true); // Mark details as saved

        // Save internship details to Firestore
        const internshipRef = doc(db, 'internshipjournal', userId);
        await setDoc(internshipRef, {
          userId: userId, // Add user ID here
          startDate: formattedStartDate.format('YYYY-MM-DD'),
          duration: parsedDuration,
          endDate: calculatedEndDate.format('YYYY-MM-DD'),
        });
      } else {
        alert('Invalid date format. Please use YYYY-MM-DD format.');
      }
    } else {
      alert('Please enter both a valid start date and duration.');
    }
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    console.log("Selected Date:", day.dateString);
  };

  const handleEditJournal = () => {
    if (selectedDate) {
      navigation.navigate('JournalCreate_Intern', { date: selectedDate });
    } else {
      alert("Please select a date to edit your journal entry.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {showWelcome && (
        <Text style={styles.title}>Welcome to Your Internship Journal</Text>
      )}
      {calendarVisible && (
        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            [selectedDate]: { selected: true, marked: true, selectedColor: '#023E8A' },
          }}
          minDate={startDate || undefined}
          maxDate={endDate || undefined}
          theme={{
            selectedDayBackgroundColor: '#023E8A',
            selectedDayTextColor: '#ffffff',
            dayTextColor: '#023E8A',
            monthTextColor: '#023E8A',
            arrowColor: '#023E8A',
          }}
          style={styles.calendar}
        />
      )}
      {calendarVisible && (
        <TouchableOpacity
          style={styles.editJournalButton}
          onPress={handleEditJournal}
        >
          <Text style={styles.editJournalButtonText}>Edit Journal</Text>
        </TouchableOpacity>
      )}
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Enter Your Internship Details</Text>
            <TextInput
              placeholder="Enter Start Date (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              style={styles.input}
            />
            <TextInput
              placeholder="Enter Duration in Months"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={styles.input}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleInternshipSubmit}
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
    marginTop: 60,
  },
  editJournalButton: {
    backgroundColor: '#023E8A',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  editJournalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: '#023E8A',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  modalButton: {
    backgroundColor: '#023E8A',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default JournalPage;
