import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { app } from '../../firebase';
import NavBar from '../../components/CustomNavBar';
import { Swipeable } from 'react-native-gesture-handler';

const db = getFirestore(app);

const Home_Recruit = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const fetchInternships = async () => {
        setLoading(true);
        try {
          const querySnapshot = await getDocs(collection(db, 'internships'));
          const internships = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData(internships);
        } catch (error) {
          console.error("Error fetching internships:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchInternships();
    }, [])
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredData = data.filter((item) =>
    item.jobTitle && item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this internship?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
            await deleteDoc(doc(db, 'internships', id));
            setData(data.filter(item => item.id !== id)); // Update local state
          }, style: "destructive" }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)} // Handle delete confirmation
        >
          <Ionicons name="trash" size={30} color="white" />
        </TouchableOpacity>
      )}
    >
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('InternUpdateRecruit', { internId: item.id })}
      >
        <Text style={styles.itemText}>{item.jobTitle}</Text>
        <Text style={styles.itemText}>Location: {item.location}</Text>
      </TouchableOpacity>
    </Swipeable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Recruitments"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No internships found.</Text>}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('InternRecruit')}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <NavBar /> 
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0, // Remove padding to eliminate extra space
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
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 80,
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
