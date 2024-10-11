import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../../firebase'; // Ensure Firestore is imported
import { doc, updateDoc, getDoc } from 'firebase/firestore'; // Firestore imports

const { height } = Dimensions.get('window'); // Get device screen height

export default function ChangePreferences_Intern() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params; // Get userId passed from previous screen

  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  const preferenceOptions = [
    "Software Development",
    "Data Science and Analytics",
    "Information Technology",
    "Engineering",
    "Architecture and Design",
    "Finance and Accounting",
    "Marketing and Sales",
    "Human Resources",
    "Research and Development",
    "Media and Communications",
  ];

  // Fetch the existing preferences from Firestore
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const internDoc = await getDoc(doc(db, 'Interns', userId));
        if (internDoc.exists()) {
          const userData = internDoc.data();
          setPreferences(userData.preferences || []); // Set existing preferences
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };
    fetchPreferences();
  }, [userId]);

  // Toggle preference selection
  const togglePreference = (preference) => {
    setPreferences((prevPreferences) => {
      if (prevPreferences.includes(preference)) {
        return prevPreferences.filter((item) => item !== preference);
      } else {
        return [...prevPreferences, preference];
      }
    });
  };

  // Handle saving preferences and navigating back
  const handleSave = async () => {
    try {
      // Update preferences in Firestore
      await updateDoc(doc(db, 'Interns', userId), {
        preferences: preferences,
      });
      // Navigate back after saving
      navigation.goBack();
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Your Preferred Area of Work</Text>
      <ScrollView contentContainerStyle={styles.preferencesContainer}>
        {preferenceOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.preferenceTile}
            onPress={() => togglePreference(option)}
          >
            <View style={styles.checkbox}>
              {preferences.includes(option) && <View style={styles.checkedBox} />}
            </View>
            <Text style={styles.preferenceText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#034694', // Blue background
    padding: 20,
    paddingTop: height * 0.1, // Adjust padding to prevent overlap with status bar
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 30,
    justifyContent: 'space-between',
  },
  preferenceTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10, // Reduced padding for better text wrapping
    borderRadius: 20,
    marginBottom: 15,
    width: '45%', // Adjust width to make text wrap better
    justifyContent: 'flex-start',
  },
  checkbox: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#034694',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkedBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#034694', // Blue check for selected
  },
  preferenceText: {
    color: '#034694', // Blue text for non-selected options
    fontSize: 14,
    flexShrink: 1, // Allow text to wrap within available space
  },
  saveButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30, // Fixed bottom position for Save button
  },
  saveButtonText: {
    color: '#034694',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#034694', // Blue background during loading
  },
});
