import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebase'; // Ensure this path is correct

const db = getFirestore(app);

const Home_Recruit = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]); // Initialize data as an empty array
  const [loading, setLoading] = useState(true); // Add loading state
  const navigation = useNavigation();

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'internships'));
        const internships = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Fetched Internships:', internships); // Log the fetched internships
        setData(internships);
      } catch (error) {
        console.error("Error fetching internships:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchInternships(); // Call the fetch function
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Check if jobTitle exists before using toLowerCase
  const filteredData = data.filter((item) =>
    item.jobTitle && item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.jobTitle}</Text> {/* Display jobTitle in Text */}
      <Text style={styles.itemText}>Location: {item.location}</Text> {/* Add more information if needed */}
    </View>
  );

  if (loading) { // Show loading indicator while data is being fetched
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  console.log('Filtered Data:', filteredData); // Log filtered data to check what is being rendered

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search Recruitments"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* List of Recruitments */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No internships found.</Text>} // Handle empty state with Text
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('InternRecruit')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  item: {
    padding: 16,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16, // Increased font size for visibility
    color: '#000', // Ensure text is visible
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 50,
    padding: 15,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home_Recruit;
