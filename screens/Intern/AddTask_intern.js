import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase'; // Adjust the import based on your file structure
import { collection, addDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp
import { getAuth } from 'firebase/auth'; // Import getAuth to access user info

export default function AddTask({ navigation }) {
  const [task, setTask] = useState({
    title: '',
    type: '',
    priority: '',
    dueDate: null, // Initialize as null
    reminder: false,
    description: '',
    userId: '', // Initialize userId
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateTimeMode, setDateTimeMode] = useState('date');

  // Get current user ID
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (currentUser) {
    task.userId = currentUser.uid; // Set userId to task state
  }

  const handleAddTask = async () => {
    // Check required fields, excluding reminder
    if (!task.title || !task.type || !task.priority || !task.dueDate) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      // Create a new date object from task.dueDate string
      const dueDateTimestamp = new Date(task.dueDate);
      const taskData = {
        ...task,
        dueDate: Timestamp.fromDate(dueDateTimestamp), // Store as Firestore Timestamp
      };
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      Alert.alert('Success', 'Task added successfully!');
      navigation.navigate('ListTask', { selectedDate: dueDateTimestamp.toISOString().split('T')[0] }); // Pass formatted date
    } catch (e) {
      Alert.alert('Error', 'Could not add task. Please try again.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      setShowTimePicker(false);
      return;
    }

    const currentDate = selectedDate || new Date();

    if (dateTimeMode === 'date') {
      const formattedDate = currentDate.toISOString().split('T')[0]; // Get date string
      setTask((prevTask) => ({
        ...prevTask,
        dueDate: formattedDate,
      }));
      setShowDatePicker(false);
      setShowTimePicker(true);
      setDateTimeMode('time');
    } else {
      const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
      const formattedDateTime = `${task.dueDate} ${formattedTime}`; // Combine date and time
      setTask((prevTask) => ({
        ...prevTask,
        dueDate: formattedDateTime,
      }));
      setShowTimePicker(false);
      setDateTimeMode('date');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Task</Text>

      <Text style={styles.label}>Task Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task title"
        onChangeText={(text) => setTask({ ...task, title: text })}
        value={task.title}
      />

      <Text style={styles.label}>Task Type</Text>
      <View style={styles.dropdown}>
        <Picker
          selectedValue={task.type}
          onValueChange={(itemValue) => setTask({ ...task, type: itemValue })}
          style={styles.picker}
        >
          <Picker.Item label="Choose type" value="" />
          <Picker.Item label="Academic Task" value="Academic Task" />
          <Picker.Item label="Internship Task" value="Internship Task" />
        </Picker>
      </View>

      <Text style={styles.label}>Priority</Text>
      <View style={styles.dropdown}>
        <Picker
          selectedValue={task.priority}
          onValueChange={(itemValue) => setTask({ ...task, priority: itemValue })}
          style={styles.picker}
        >
          <Picker.Item label="Choose priority" value="" />
          <Picker.Item label="High" value="High" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="Low" value="Low" />
        </Picker>
      </View>

      <Text style={styles.label}>Due Date & Time</Text>
      <View style={styles.dateInputContainer}>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD HH:mm"
          value={task.dueDate || ''} // Display an empty string if dueDate is null
          editable={false}
        />
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.calendarIcon}>
          <Ionicons name="calendar-outline" size={24} color="#1C274C" />
        </TouchableOpacity>
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={task.dueDate ? new Date(task.dueDate) : new Date()}
          mode={dateTimeMode}
          display="default"
          onChange={handleDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={task.dueDate ? new Date(task.dueDate) : new Date()}
          mode="time"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <Text style={styles.label}>Reminders</Text>
      <Switch
        value={task.reminder}
        onValueChange={(value) => setTask({ ...task, reminder: value })}
        thumbColor={task.reminder ? '#1C274C' : '#ddd'}
        trackColor={{ false: '#ddd', true: '#AFCBFF' }}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Enter task description"
        multiline
        onChangeText={(text) => setTask({ ...task, description: text })}
        value={task.description}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
          <Text style={styles.buttonText}>Add Task</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addButton, styles.cancelButton]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9', // Light background color for better contrast
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C274C',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff', // White background for input fields
  },
  dropdown: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: {
    height: 45,
    color: '#333',
  },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#034694',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff5c5c',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  calendarIcon: {
    marginLeft: 10,
  },
});
