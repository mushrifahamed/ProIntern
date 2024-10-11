import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput, SafeAreaView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { db } from '../../firebase'; // Import Firebase
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebase'; // Ensure you import auth

const JournalPage = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [detailsSaved, setDetailsSaved] = useState(false);
  
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  console.log('Current User ID:', userId);
  
  useEffect(() => {
    const loadInternshipDetails = async () => {
      if (userId) {
        try {
          const internshipRef = doc(db, 'internshipjournal', userId);
          const internshipDoc = await getDoc(internshipRef);

          if (internshipDoc.exists()) {
            const data = internshipDoc.data();
            console.log('Loaded Data:', data);
            setStartDate(data.startDate);
            setDuration(data.duration.toString());
            
            const formattedStartDate = moment(data.startDate, 'YYYY-MM-DD');
            const calculatedEndDate = formattedStartDate.clone().add(data.duration, 'months');
            setEndDate(calculatedEndDate.format('YYYY-MM-DD'));

            setCalendarVisible(true);
            setShowWelcome(false);
            setDetailsSaved(true);
          } else {
            console.log('No internship data found. Showing modal.');
            setModalVisible(true);
          }
        } catch (error) {
          console.error("Error loading internship details:", error);
          alert("Failed to load internship details. Please try again.");
        }
      } else {
        console.log('User not logged in or ID is null.');
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
        setDetailsSaved(true);

        const internshipRef = doc(db, 'internshipjournal', userId);
        await setDoc(internshipRef, {
          userId: userId,
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {showWelcome && (
          <Text style={styles.title}>Welcome to Your Internship Journal</Text>
        )}
        {calendarVisible && (
          <View style={styles.calendarContainer}>
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
          </View>
        )}
        {calendarVisible && (
          <TouchableOpacity
            style={styles.editJournalButton}
            onPress={handleEditJournal}
          >
            <Text style={styles.editJournalButtonText}>Edit Journal</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontFamily: 'Poppins-SemiBold',
    color: '#023E8A',
    marginBottom: 20,
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: '#f2f6ff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 10,
  },
  editJournalButton: {
    backgroundColor: '#023E8A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editJournalButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    padding: 25,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalText: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#023E8A',
  },
  input: {
    height: 50,
    borderColor: '#023E8A',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: '#023E8A',
    padding: 11,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default JournalPage;