import React, { useState, useEffect, useContext } from 'react';
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
  RefreshControl,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, limit, startAfter } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';
import { app } from '../../firebase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import NavBar_Intern from '../../components/NavBar_Intern';
import colors from "../../assets/colors";  // Importing the colors from the colors.js file

const db = getFirestore(app);
const auth = getAuth(app);

// Context to store user profile globally
const UserProfileContext = React.createContext();

const Applications_Intern = () => {
  const [applications, setApplications] = useState([]); // Fetched applications
  const [loading, setLoading] = useState(true); // Loader
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [cvDownloading, setCvDownloading] = useState(false);
  const [lastVisible, setLastVisible] = useState(null); // For pagination
  const [isFetchingMore, setIsFetchingMore] = useState(false); // For loading more applications
  const navigation = useNavigation();

  const user = useContext(UserProfileContext);

  // Fetch the applications
  const fetchApplications = async (initialLoad = true) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        setLoading(initialLoad);
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('internId', '==', currentUser.uid),
          limit(10), // Load only 10 applications at a time for pagination
          initialLoad && lastVisible ? startAfter(lastVisible) : undefined // Start after last fetched document
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);

        const fetchedApplications = await Promise.all(applicationsSnapshot.docs.map(async (docSnap) => {
          const application = docSnap.data();
          return {
            id: docSnap.id,
            ...application,
            jobTitle: application.jobTitle,
            jobType: application.jobType,
            logo: application.logo,
            status: application.status,
            cvUrl: application.cvUrl // Assuming CV URL is stored in the application collection
          };
        }));

        // Update pagination state
        setLastVisible(applicationsSnapshot.docs[applicationsSnapshot.docs.length - 1]);

        if (initialLoad) {
          setApplications([...applications, ...fetchedApplications]); // Append new applications
        } else {
          setApplications(fetchedApplications); // For refreshing, reset the list
        }

      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications(false); // Pass false to refresh the list
    setRefreshing(false);
  };

  // Load more applications when user scrolls
  const loadMoreApplications = async () => {
    if (!isFetchingMore) {
      setIsFetchingMore(true);
      await fetchApplications();
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Accepted':
        return {
          backgroundColor: colors.status.accepted.background,
          color: colors.status.accepted.text,
        };
      case 'In Review':
        return {
          backgroundColor: colors.status.inReview.background,
          color: colors.status.inReview.text,
        };
      case 'Rejected':
        return {
          backgroundColor: colors.status.rejected.background,
          color: colors.status.rejected.text,
        };
      case 'Applied':
      default:
        return {
          backgroundColor: colors.status.applied.background,
          color: colors.status.applied.text,
        };
    }
  };

  const openModal = (application) => {
    setSelectedApplication(application);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedApplication(null);
  };

  const downloadCV = async (cvUrl) => {
    setCvDownloading(true);
    try {
      const downloadUri = FileSystem.documentDirectory + 'cv.pdf';
      const downloadResumable = FileSystem.createDownloadResumable(cvUrl, downloadUri);
      const { uri } = await downloadResumable.downloadAsync();
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to download the CV.');
    } finally {
      setCvDownloading(false);
    }
  };

  const renderApplicationDetailsModal = () => {
    if (!selectedApplication) return null;

    const statusOrder = ['Applied', 'In Review', 'Accepted'];

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalHeader}>
          <Feather name="arrow-left" size={24} color="white" onPress={closeModal} />
          <Image source={{ uri: selectedApplication.logo }} style={styles.modalLogo} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          {statusOrder.map((status, index) => (
            <View key={index} style={styles.statusStep}>
              <View
                style={[
                  styles.statusCircle,
                  { backgroundColor: statusOrder.indexOf(selectedApplication.status) >= index ? '#0077B6' : '#ccc' },
                ]}
              />
              <Text style={styles.statusLabel}>{status}</Text>
            </View>
          ))}
        </View>
        <View style={styles.progressBarLineContainer}>
          <View style={[styles.progressBarLine, { backgroundColor: '#0077B6', flex: 1 }]} />
          <View style={[styles.progressBarLine, { backgroundColor: '#ccc', flex: 1 }]} />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Job Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.jobTitle}>{selectedApplication.jobTitle}</Text>
            <Text style={styles.jobType}>{selectedApplication.jobType}</Text>
          </View>

          {/* CV Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>CV</Text>
            <View style={styles.cvRow}>
              <Image
                source={{ uri: 'https://image-url-for-pdf-icon.com' }}
                style={styles.cvIcon}
              />
              <Text style={styles.cvName}>CV.pdf</Text>
              <TouchableOpacity onPress={() => downloadCV(selectedApplication.cvUrl)}>
                {cvDownloading ? <ActivityIndicator /> : <Feather name="download" size={24} color="#0077B6" />}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Modal>
    );
  };

  const renderItem = ({ item }) => {
    const statusStyles = getStatusStyles(item.status);

    return (
      <TouchableOpacity onPress={() => openModal(item)} style={styles.itemContainer}>
        <Image source={{ uri: item.logo }} style={styles.itemLogo} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.jobTitle}</Text>
          <Text style={styles.itemType}>{item.jobType}</Text>
          <Text style={styles.itemDate}>Applied On: {new Date(item.appliedOn.seconds * 1000).toDateString()}</Text>
        </View>
        <View style={[styles.statusContainer, { backgroundColor: statusStyles.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusStyles.color }]}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && applications.length === 0) {
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
        data={applications.filter((application) =>
          application.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          application.companyName.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't applied for any internships yet.</Text>}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMoreApplications} // Load more when reaching end of list
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? <ActivityIndicator size="small" color={colors.primary} /> : null
        }
      />

      {/* Render Application Details Modal */}
      {renderApplicationDetailsModal()}

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
  itemDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  statusContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
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
  // Modal styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#0077B6',
  },
  modalLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  modalContent: {
    padding: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statusStep: {
    alignItems: 'center',
    flex: 1,
  },
  statusCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
  },
  statusLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
  },
  progressBarLineContainer: {
    flexDirection: 'row',
    marginHorizontal: 30,
    marginTop: 5,
  },
  progressBarLine: {
    height: 4,
    borderRadius: 2,
  },
  detailsSection: {
    marginVertical: 20,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  jobType: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cvRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvIcon: {
    width: 40,
    height: 40,
  },
  cvName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default Applications_Intern;
