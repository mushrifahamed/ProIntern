import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  ScrollView,
  Easing,
  TouchableWithoutFeedback,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../../firebase'; // Ensure firebase.js is correctly set up and imported
import NavBar_Intern from '../../components/NavBar_Intern'; // Custom Navigation Bar
import colors from "../../assets/colors"; // Colors file

const db = getFirestore(app);
const auth = getAuth(app);

const Home_Intern = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState([]); // Fetched internships
  const [recommendations, setRecommendations] = useState([]); // Recommended internships
  const [loading, setLoading] = useState(true); // Unified loading state
  const [refreshing, setRefreshing] = useState(false); // Refresh state
  const [user, setUser] = useState(null); // For storing user info
  const [preferences, setPreferences] = useState([]); // User preferences
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  const modalTranslateY = useRef(new Animated.Value(300)).current;
  const menuTranslateX = useRef(new Animated.Value(-300)).current;
  
  const navigation = useNavigation();
  
  // Fetch user data and internships once the user logs in
  const fetchData = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        // Fetch user profile from Firestore
        const userProfileDoc = await getDoc(doc(db, 'Interns', currentUser.uid));
        if (userProfileDoc.exists()) {
          const userData = userProfileDoc.data();
          setUser({
            ...currentUser,
            name: userData.fullName || currentUser.displayName,
            email: userData.email || currentUser.email,
            pic: userData.profilePicture || 'https://default-avatar-url.com/default-avatar.jpg',
          });
          setPreferences(userData.preferences || []);
          
          // Fetch internships after user preferences are available
          const querySnapshot = await getDocs(collection(db, 'internships'));
          const internships = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setData(internships);

          // Filter internships based on user preferences
          const matchedInternships = internships.filter((internship) =>
            preferences.some((preference) => internship.category === preference)
          );
          setRecommendations(matchedInternships);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // End loading once data is fetched
      }
    }
  };

  // Trigger data fetching when the component mounts (fetch once)
  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, []);

  // Pull-to-refresh functionality
  const onRefresh = () => {
    setRefreshing(true); // Start refreshing state
    fetchData().finally(() => setRefreshing(false)); // Fetch data again and stop refreshing state
  };

  // Filter internships based on search query
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredData = data.filter((item) =>
    item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.jobType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show Modal with Animation
  const showModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalTranslateY, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  // Hide Modal with Animation
  const hideModal = () => {
    Animated.timing(modalTranslateY, {
      toValue: 300,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setSelectedInternship(null);
    });
  };

  const handleInternshipPress = (item) => {
    setSelectedInternship(item);
    showModal();
  };

  const handleApply = () => {
    if (selectedInternship) {
      navigation.navigate('Apply_Intern', { internshipId: selectedInternship.id });
      hideModal();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('Login_Intern');
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  // Toggle sliding menu
  const toggleMenu = () => {
    if (isMenuVisible) {
      Animated.timing(menuTranslateX, {
        toValue: -300,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(() => setIsMenuVisible(false));
    } else {
      setIsMenuVisible(true);
      Animated.timing(menuTranslateX, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  };

  // Handle tapping outside the menu to close
  const handleOutsideTap = () => {
    if (isMenuVisible) {
      toggleMenu();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleInternshipPress(item)}>
      <Image source={{ uri: item.logo }} style={styles.itemLogo} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.jobTitle}</Text>
        <Text style={styles.itemType}>{item.jobType}</Text>
        <Text style={styles.itemSalary}>Rs. {item.salary}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <Feather style={styles.menuIcon} name="menu" size={24} color="white" onPress={toggleMenu} />
        {user && (
          <TouchableOpacity onPress={() => navigation.navigate('Profile_Intern')}>
            <Image source={{ uri: user.pic }} style={styles.profilePic} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search internships..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <Ionicons name="options" size={24} color="white" style={styles.filterIcon} />
      </View>

      {/* Recommendations List */}
      <Text style={styles.recommendationsText}>Recommendations</Text>
      <FlatList
        data={searchQuery ? filteredData : recommendations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No internships found.</Text>}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modal for showing selected internship details */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={hideModal}>
          <View style={styles.dimmedBackground} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: modalTranslateY }] }]}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedInternship && (
              <>
                <Image source={{ uri: selectedInternship.logo }} style={styles.modalLogo} />
                <Text style={styles.modalCompany}>{selectedInternship.companyName}</Text>
                <Text style={styles.modalTitle}>{selectedInternship.jobTitle}</Text>

                <View style={styles.boxContainer}>
                  <Text style={styles.modalBoxText}>{selectedInternship.jobType}</Text>
                  <Text style={styles.modalBoxText}>{selectedInternship.location}</Text>
                  <Text style={styles.modalBoxText}>{selectedInternship.salary} LKR</Text>
                </View>

                <Text style={styles.modalCategory}>{selectedInternship.category}</Text>

                <Text style={styles.modalLabel}>Description:</Text>
                <Text style={styles.modalText}>{selectedInternship.description}</Text>

                <Text style={styles.modalLabel}>Qualifications:</Text>
                <Text style={styles.modalText}>{selectedInternship.qualifications}</Text>

                <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
                  <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* Sliding Menu */}
      {isMenuVisible && (
        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: menuTranslateX }] }]}>
          <View style={styles.menuHeader}>
            <Feather name="arrow-left" size={24} color="black" onPress={toggleMenu} />
          </View>
          <View style={styles.profileContainer}>
            <Image source={{ uri: user?.pic }} style={styles.menuProfilePic} />
            <Text style={styles.menuProfileName}>{user?.name}</Text>
            <Text style={styles.menuProfileEmail}>{user?.email}</Text>
          </View>
          <View style={styles.menuItemsContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Profile_Intern')}>
              <Feather name="user" size={24} color="black" />
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings_Intern')}>
              <Feather name="settings" size={24} color="black" />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Feather name="log-out" size={24} color="black" />
              <Text style={styles.menuItemText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Handle tapping outside the menu to close */}
      {isMenuVisible && <TouchableWithoutFeedback onPress={handleOutsideTap}><View style={styles.overlay} /></TouchableWithoutFeedback>}

      {/* Custom Navigation Bar */}
      <NavBar_Intern />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: StatusBar.currentHeight || 20,
  },
  menuIcon: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginRight: 10,
    fontFamily: 'Poppins-Regular',
  },
  filterIcon: {
    backgroundColor: '#034694',
    color: 'white',
    padding: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendationsText: {
    marginLeft: 20,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  itemLogo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Poppins-SemiBold',
  },
  itemType: {
    fontSize: 14,
    color: '#666',
    marginTop: 1,
    fontFamily: 'Poppins-Regular',
  },
  itemSalary: {
    fontSize: 14,
    color: '#000',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
  listContainer: {
    paddingBottom: 100,
  },
  dimmedBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 'auto',
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 20,
  },
  modalContent: {
    flexGrow: 1,
  },
  modalLogo: {
    borderRadius: 10,
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 10,
    color: '#333',
    alignSelf: 'center',
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
    width: '80%',
    alignSelf: 'center',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  modalCompany: {
    fontSize: 16,
    color: '#555',
    marginVertical: 5,
    textAlign: 'center',
  },
  modalCategory: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  boxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  modalBoxText: {
    fontSize: 14,
    color: colors.primary,
    backgroundColor: colors.lightBlue,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 300,
    backgroundColor: '#fff',
    zIndex: 10,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  menuHeader: {
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  menuProfilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  menuProfileName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  menuProfileEmail: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  menuItemsContainer: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 15.5,
    marginLeft: 20,
    color: '#333',
    fontFamily: 'Poppins-Regular'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default Home_Intern;