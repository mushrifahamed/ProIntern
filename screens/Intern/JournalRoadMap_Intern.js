import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../firebase';
import { doc, getDoc, collection, query, where, setDoc, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // 'YYYY-MM-DD'
};

const JournalRoadMap = () => {
  const [days, setDays] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [duration, setDuration] = useState(null);
  const [completedEntries, setCompletedEntries] = useState({});
  const [loading, setLoading] = useState(true);
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
            const validStartDate = new Date(startDate);

            if (!isNaN(validStartDate.getTime())) {
              setStartDate(validStartDate);
              setDuration(duration);
            } else {
              Alert.alert('Error', 'Invalid start date format. Please check your data.');
            }
          } else {
            Alert.alert('Error', 'No journal data found for your account.');
          }
        } catch (error) {
          Alert.alert('Error', 'Could not fetch journal data. Please try again later.');
        } finally {
          setLoading(false);
        }
      } else {
        Alert.alert('Error', 'You must be logged in to view your journal roadmap.');
        setLoading(false);
      }
    };

    fetchJournalData();
  }, [userId]);

  useEffect(() => {
    const generateDays = async () => {
      if (startDate && duration) {
        const totalDays = duration * 30; // Assuming 30 days per month
        const fetchedEntries = await fetchJournalEntries();
        setCompletedEntries(fetchedEntries);

        const generatedDays = Array.from({ length: totalDays }, (_, i) => {
          const dayNumber = i + 1;
          return {
            day: dayNumber,
            title: `Day ${dayNumber}`,
            completed: Object.keys(fetchedEntries).includes(formatDate(new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000)))),
          };
        });

        setDays(generatedDays);
      }
    };

    generateDays();
  }, [startDate, duration]);

  const fetchJournalEntries = async () => {
    if (!userId) return {};
    try {
      const entriesRef = collection(db, 'journalInternships');
      const q = query(entriesRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const entries = querySnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        const date = formatDate(new Date(data.date));
        acc[date] = data;
        return acc;
      }, {});

      return entries;
    } catch (error) {
      return {};
    }
  };

  const handleDayPress = useCallback(
    async (day) => {
      if (!startDate) return;

      const journalDate = new Date(startDate);
      journalDate.setDate(journalDate.getDate() + (day - 1));
      const formattedDate = formatDate(journalDate);

      const existingEntry = completedEntries[formattedDate];

      navigation.navigate('JournalCreate_Intern', { date: formattedDate, entry: existingEntry || null });
    },
    [startDate, completedEntries, navigation]
  );

  const handleCreateEntry = async (date) => {
    const entryData = {
      userId: userId,
      date: date,
    };

    try {
      await setDoc(doc(collection(db, 'journalInternships'), `${userId}_${date}`), entryData);

      setCompletedEntries(prevEntries => ({
        ...prevEntries,
        [date]: entryData
      }));

      navigation.navigate('JournalCreate_Intern', { date });
    } catch (error) {
      Alert.alert('Error', 'Could not create the journal entry. Please try again later.');
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    const fetchedEntries = await fetchJournalEntries();
    setCompletedEntries(fetchedEntries);
    setLoading(false);
  };

  const svgHeight = 200 * days.length + 100; // Add extra space for the end indicator

  const generatePath = () => {
    let path = `M ${width * 0.1} 0`;
    days.forEach((_, index) => {
      const y = index * 200;
      const x1 = index % 2 === 0 ? width * 0.9 : width * 0.1;
      const x2 = index % 2 === 0 ? width * 0.1 : width * 0.9;
      path += ` C ${x1} ${y + 100}, ${x2} ${y + 100}, ${x2} ${y + 200}`;
    });
    // Add a final curve to the center for the end indicator
    const finalY = days.length * 200;
    path += ` C ${width * 0.5} ${finalY + 50}, ${width * 0.5} ${finalY + 50}, ${width * 0.5} ${finalY + 100}`;
    return path;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a2a6c', '#4e54c8', '#8f94fb']} style={styles.gradient}>
        <Text style={styles.header}>My Journal Roadmap</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.roadmapContainer}>
              <Svg height={svgHeight} width={width}>
                <Path d={generatePath()} stroke="rgba(255,255,255,0.8)" strokeWidth="4" fill="none" />
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
                          name={day.completed ? 'checkmark-circle' : 'lock-closed'}
                          size={20}
                          color={day.completed ? '#4CAF50' : '#E91E63'}
                        />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
              {/* End indicator */}
              <View style={[styles.endIndicator, { top: svgHeight - 50 }]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']}
                  style={styles.endGradient}
                >
                  <Ionicons name="flag" size={30} color="#4CAF50" />
                  <Text style={styles.endText}>Journey Complete!</Text>
                </LinearGradient>
              </View>
              {/* Refresh button - Moved below the end indicator */}
              <TouchableOpacity onPress={handleRefresh} style={[styles.refreshButton, { top: svgHeight + 20 }]}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
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
    fontFamily: 'Poppins-Regular',
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
  iconContainer: {
    marginTop: 5,
  },
  refreshButton: {
    position: 'absolute',
    padding: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  endIndicator: {
    position: 'absolute',
    left: width / 2 - 75, // Center the indicator
    alignItems: 'center',
  },
  endGradient: {
    borderRadius: 10,
    alignItems: 'center',
    width: 150,
  },
  endText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default JournalRoadMap;