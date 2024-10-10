import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export default function ViewTask({ route, navigation }) {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, []);

  const fetchTaskDetails = async () => {
    try {
      const taskDoc = await getDoc(doc(db, 'tasks', taskId));
      if (taskDoc.exists()) {
        setTask(taskDoc.data());
        setIsCompleted(taskDoc.data().completed || false);
      } else {
        Alert.alert('Error', 'Task not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      Alert.alert('Error', 'Could not fetch task details');
    }
  };

  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted);
  };

  const handleDeleteTask = async () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'tasks', taskId));
              Alert.alert('Success', 'Task deleted successfully');
              navigation.goBack(); // Navigate back after deletion
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Could not delete task');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return task ? (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={28} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>{task.title}</Text>
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Task Type</Text>
          <Text style={styles.value}>{task.type || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Priority</Text>
          <Text style={styles.value}>{task.priority || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.value}>
            {task.dueDate ? task.dueDate.toDate().toLocaleString() : 'No Date'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{task.description || 'No Description'}</Text>
        </View>
      </View>
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Mark as Completed</Text>
        <Switch value={isCompleted} onValueChange={handleToggleComplete} />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('UpdateTask', { taskId, task })}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTask}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <Text>Loading...</Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f7f9fc', // Softer background for improved readability
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    color: '#1C274C',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C274C',
  },
  value: {
    fontSize: 16,
    color: '#4f4f4f',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  switchLabel: {
    fontSize: 16,
    color: '#4f4f4f',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  editButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#034694',
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 10,
  },
  deleteButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#ff5c5c',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
