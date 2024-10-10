import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, getDoc } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';
import { app } from '../../firebase';
import NavBar_Intern from '../../components/NavBar_Intern';
import colors from "../../assets/colors";

const db = getFirestore(app);
const auth = getAuth(app);

const Applications_Intern = () => {
  const [applications, setApplications] = useState([]); // Fetched applications
  const [loading, setLoading] = useState(true); // Loader
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  // Fetch the applications and user details
  useEffect(() => {
    const fetchApplicationsAndProfile = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          setLoading(true);

          // Fetch user profile from Interns collection
          const userDoc = await getDoc(doc(db, 'Interns', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              pic: userData.profilePicture || 'https://default-avatar-url.com/default-avatar.jpg', // Fallback for profile picture
            });
          }

          // Fetch applications of the logged-in user
          const applicationsQuery = query(collection(db, 'applications'), where('internId', '==', currentUser.uid));
          const applicationsSnapshot = await getDocs(applicationsQuery);

          const applicationsData = await Promise.all(applicationsSnapshot.docs.map(async (doc) => {
            const application = doc.data();
            // Fetch internship details by matching internshipId with internships collection
            const internshipDoc = await getDoc(doc(db, 'internships', application.internshipId));
            if (internshipDoc.exists()) {
              const internshipData = internshipDoc.data();
              return {
                id: doc.id,
                ...application,
                jobTitle: internshipData.jobTitle,
                jobType: internshipData.jobType,
                salary: internshipData.salary,
                logo: internshipData.logo, // Assuming logo is stored in the internships collection
              };
            }
            return null; // If internship not found, skip the entry
          }));

          setApplications(applicationsData.filter(Boolean)); // Filter out null entries

        } catch (error) {
          console.error('Error fetching applications or user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchApplicationsAndProfile();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.logo }} style={styles.itemLogo} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.jobTitle}</Text>
        <Text style={styles.itemType}>{item.jobType}</Text>
        <Text style={styles.itemSalary}>Rs. {item.salary}</Text>
        <Text style={styles.itemDate}>Applied On: {new Date(item.appliedOn.seconds * 1000).toDateString()}</Text>
      </View>
    </View>
  );

  const filteredApplications = applications.filter((application) =>
    application.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    application.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <Feather name="arrow-left" size={24} color="white" style={styles.backIcon} onPress={() => navigation.goBack()} />
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
          placeholder="Search applications..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="options" size={24} color="white" style={styles.filterIcon} />
      </View>

      {/* Applications List */}
      <Text style={styles.applicationsText}>My Applications</Text>
      <FlatList
        data={filteredApplications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't applied for any internships yet.</Text>}
        contentContainerStyle={styles.listContainer}
      />

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backIcon: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
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
  applicationsText: {
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
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  itemSalary: {
    fontSize: 14,
    color: '#000',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  itemDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontFamily: 'Poppins-Regular',
  },
  listContainer: {
    paddingBottom: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Applications_Intern;
