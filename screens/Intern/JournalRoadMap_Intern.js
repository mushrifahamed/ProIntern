import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const JournalRoadMap = () => {
  const [days, setDays] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [duration, setDuration] = useState(null);
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchJournalData = async () => {
      if (userId) {
        try {
          const journalRef = doc(db, 'internshipjournal', userId);
          const journalDoc = await getDoc(journalRef);

          if (journalDoc.exists()) {
            const { startDate, duration } = journalDoc.data();
            console.log("Fetched journal document data:", { startDate, duration }); // Log fetched data

            // Create a Date object directly from the ISO date string
            const validStartDate = new Date(startDate);
            
            // Check if the date is valid
            if (!isNaN(validStartDate.getTime())) {
              setStartDate(validStartDate);
              setDuration(duration);
            } else {
              console.error('Invalid startDate format:', startDate);
              Alert.alert('Error', 'Invalid start date format. Please check your data.');
            }
          } else {
            console.error("No document found for user ID:", userId);
            Alert.alert('Error', 'No journal data found for your account.');
          }
        } catch (error) {
          console.error('Error fetching journal data:', error);
          Alert.alert('Error', 'Could not fetch journal data. Please try again later.');
        }
      } else {
        console.warn('User is not authenticated, cannot fetch journal data.');
        Alert.alert('Error', 'You must be logged in to view your journal roadmap.');
      }
    };
    fetchJournalData();
  }, [userId]);

  useEffect(() => {
    const generateDays = async () => {
      if (startDate && duration) {
        const totalDays = duration * 30; // Assuming 30 days per month
        const completedEntries = await fetchJournalEntries(); // This should return [1, 2, 3]
        console.log("Completed Entries:", completedEntries); // Log completed entries
  
        const generatedDays = Array.from({ length: totalDays }, (_, i) => {
          const dayNumber = i + 1; // dayNumber will be 1, 2, 3... totalDays
          return {
            day: dayNumber,
            title: `Day ${dayNumber}`,
            completed: completedEntries.includes(dayNumber-1), // Check if day is completed
          };
        });
  
        console.log("Generated Days:", generatedDays); // Log generated days
        setDays(generatedDays);
      }
    };
  
    generateDays();
  }, [startDate, duration]);
  

  const fetchJournalEntries = async () => {
    if (!userId) return [];
    try {
      const entriesRef = collection(db, 'journalInternships');
      const q = query(entriesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
  
      const entries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const dateString = data.date;
        const date = new Date(dateString);
  
        if (!isNaN(date.getTime())) {
          const diffTime = Math.abs(date - startDate);
          const dayNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return dayNumber;
        } else {
          console.error('Invalid entry date:', dateString);
          return null;
        }
      }).filter(day => day !== null);
  
      return entries;
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return [];
    }
  };
  
  

  const handleDayPress = useCallback(async (day) => {
    if (!startDate) {
      console.error('Start date is not set, cannot navigate.');
      return;
    }
    const journalDate = new Date(startDate);
    journalDate.setDate(journalDate.getDate() + (day - 1));

    // Check if there's existing journal entry for that date
    const existingEntry = await checkExistingEntry(journalDate.toISOString());
    
    if (existingEntry) {
      // Navigate to JournalCreate_Intern with existing entry data
      console.log("Navigating to journal create with existing entry data:", existingEntry);
      navigation.navigate('JournalCreate_Intern', { date: journalDate.toISOString(), entry: existingEntry });
    } else {
      // Navigate to JournalCreate_Intern without existing entry data
      console.log("Navigating to journal create with date:", journalDate.toISOString());
      navigation.navigate('JournalCreate_Intern', { date: journalDate.toISOString() });
    }
  }, [startDate, navigation]);

  const checkExistingEntry = async (date) => {
    if (!userId) return null;
    try {
      const entriesRef = collection(db, 'journalInternships');
      const q = query(entriesRef, where('userId', '==', userId), where('date', '==', date));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const entryData = querySnapshot.docs[0].data(); 
        return entryData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error checking for existing entry:', error);
      return null;
    }
  };  

  const svgHeight = 200 * days.length;

  const generatePath = () => {
    let path = `M ${width * 0.1} 0`;
    days.forEach((_, index) => {
      const y = index * 200;
      const x1 = index % 2 === 0 ? width * 0.9 : width * 0.1;
      const x2 = index % 2 === 0 ? width * 0.1 : width * 0.9;
      path += ` C ${x1} ${y + 100}, ${x2} ${y + 100}, ${x2} ${y + 200}`;
    });
    return path;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a2a6c', '#4e54c8', '#8f94fb']}
        style={styles.gradient}
      >
        <Text style={styles.header}>My Journal Roadmap</Text>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.roadmapContainer}>
            <Svg height={svgHeight} width={width}>
              <Path
                d={generatePath()}
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="4"
                fill="none"
              />
            </Svg>
            {days.map((day, index) => {
              const isEven = index % 2 === 0;
              const x = isEven ? width * 0.1 : width * 0.9;
              const y = index * 200 + 100;
              return (
                <TouchableOpacity
                  key={day.day}
                  onPress={() => handleDayPress(day.day)}
                  activeOpacity={0.7}
                  style={[styles.touchableDay, { top: y - 40, left: isEven ? x + 20 : x - 200 }]}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                    style={styles.dayGradient}
                  >
                    <Text style={styles.dayNumber}>Day {day.day}</Text>

                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={day.completed ? "checkmark-circle" : "lock-closed"}
                        size={20}
                        color={day.completed ? "#4CAF50" : "#E91E63"}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingVertical: 20,
  },
  header: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
  },
  roadmapContainer: {
    width: width,
    alignItems: 'center',
    position: 'relative',
  },
  touchableDay: {
    position: 'absolute',
    alignItems: 'center',
  },
  dayGradient: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayTitle: {
    fontSize: 14,
    color: '#333',
  },
  iconContainer: {
    marginTop: 5,
  },
});

export default JournalRoadMap;
