import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { db } from '../../firebase'; // Adjust the import based on your file structure
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth'; // Import getAuth to access user info

export default function ListTask({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const auth = getAuth(); // Get the current user
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      fetchTasks(selectedDate, currentUser.uid);
    }
  }, [selectedDate, currentUser]);

  const fetchTasks = async (date, userId) => {
    try {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const taskQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId), // Filter by user ID
        where('dueDate', '>=', Timestamp.fromDate(startOfDay)),
        where('dueDate', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(taskQuery);
      const tasksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(tasksData.sort((a, b) => a.dueDate.toDate() - b.dueDate.toDate()));
    } catch (error) {
      console.error('Error fetching tasks: ', error);
      Alert.alert('Error', 'Could not fetch tasks. Please try again.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.taskContainer}>
      <Text style={styles.taskTitle}>{item.title}</Text>
      <Text style={styles.taskDetails}>
        Due Date: {item.dueDate ? item.dueDate.toDate().toLocaleString() : 'No Date'}
      </Text>
      <TouchableOpacity
        style={styles.taskButton}
        onPress={() => navigation.navigate('ViewTask', { taskId: item.id })}
      >
        <Text style={styles.taskButtonText}>Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Calendar Component */}
        <Calendar
          style={styles.calendar}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
          }}
          markedDates={{
            [selectedDate]: { selected: true, marked: true, selectedColor: '#034694' },
          }}
          theme={{
            backgroundColor: '#fff',
            calendarBackground: '#fff',
            textSectionTitleColor: '#1C274C',
            textMonthFontWeight: 'bold',
            selectedDayBackgroundColor: '#034694',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#034694',
            dayTextColor: '#1C274C',
            textDisabledColor: '#d9e1e8',
            dotColor: '#034694',
            arrowColor: '#034694',
          }}
        />
        <Text style={styles.title}>Tasks for {selectedDate}</Text>
        {tasks.length === 0 ? (
          <Text style={styles.emptyMessage}>No tasks for this date.</Text>
        ) : (
          <FlatList
            data={tasks}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        )}
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddTask')}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f9fc', // Light background color for better contrast
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#1C274C',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginVertical: 20,
  },
  list: {
    paddingBottom: 100,
  },
  taskContainer: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
    marginBottom: 15,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C274C',
  },
  taskDetails: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  taskButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#034694',
    borderRadius: 5,
    alignItems: 'center',
  },
  taskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#034694',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  backIcon: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#034694', // Primary color
    position: 'absolute', // Position it at the top left
    top: 40, // Adjust as needed
    left: 20, // Adjust as needed
    zIndex: 1, // Ensure it stays above other components
  },
  calendar: {
    marginTop: 60, // Adjust this value to move the calendar down
  },
});
