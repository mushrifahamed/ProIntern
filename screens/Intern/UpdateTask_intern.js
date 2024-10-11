import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function EditTask({ route, navigation }) {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchTaskDetails();
  }, []);

  const fetchTaskDetails = async () => {
    try {
      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      if (taskDoc.exists()) {
        const taskData = taskDoc.data();
        setTask(taskData);
        setTitle(taskData.title);
        setType(taskData.type);
        setPriority(taskData.priority);
        setDueDate(taskData.dueDate ? taskData.dueDate.toDate().toISOString().split('T')[0] : ''); // Format to YYYY-MM-DD
        setDescription(taskData.description);
      } else {
        Alert.alert('Error', 'Task not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      Alert.alert('Error', 'Could not fetch task details');
    }
  };

  const handleUpdateTask = async () => {
    console.log("Due Date value:", dueDate);

    const parsedDueDate = new Date(dueDate);

    if (isNaN(parsedDueDate.getTime())) {
      Alert.alert('Error', 'Please enter a valid due date in the format YYYY-MM-DD.');
      return;
    }

    if (parsedDueDate.getFullYear() < 1970 || parsedDueDate.getFullYear() > 2038) {
      Alert.alert('Error', 'Date must be between 1970 and 2038.');
      return;
    }

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        title,
        type,
        priority,
        dueDate: parsedDueDate,
        description,
      });
      Alert.alert('Success', 'Task updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Could not update task');
    }
  };

  return task ? (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={28} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Edit Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Type"
        value={type}
        onChangeText={setType}
      />
      <TextInput
        style={styles.input}
        placeholder="Priority"
        value={priority}
        onChangeText={setPriority}
      />
      <TextInput
        style={styles.input}
        placeholder="Due Date (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TouchableOpacity style={styles.button} onPress={handleUpdateTask}>
        <Text style={styles.buttonText}>Update Task</Text>
      </TouchableOpacity>
    </View>
  ) : (
    <Text>Loading...</Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f9fc',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1C274C',
  },
  input: {
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#034694',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins-Regular',
    color: '#fff',
    fontWeight: 'bold',
  },
});
