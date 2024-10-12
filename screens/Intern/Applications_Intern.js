import React, { useState, useEffect, useContext } from "react";
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
  Alert,
  Linking,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
import * as FileSystem from "expo-file-system";
import NavBar_Intern from "../../components/NavBar_Intern";
import colors from "../../assets/colors"; // Importing the colors from the colors.js file

const db = getFirestore(app);
const auth = getAuth(app);

// Context to store user profile globally
const UserProfileContext = React.createContext();

const Applications_Intern = () => {
  const [applications, setApplications] = useState([]); // Fetched applications
  const [loading, setLoading] = useState(true); // Loader
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [cvDownloading, setCvDownloading] = useState(false);
  const [showMore, setShowMore] = useState(false); // State for "Show more" functionality
  const [internDetails, setInternDetails] = useState(null); // Intern details including profile pic and CV
  const navigation = useNavigation();

  const user = useContext(UserProfileContext);

  // Fetch the applications and intern details
  const fetchApplications = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        setLoading(true);

        // Fetch intern details (profile pic, CV) from Interns collection
        const internDocRef = doc(db, "Interns", currentUser.uid);
        const internDoc = await getDoc(internDocRef);

        if (internDoc.exists()) {
          console.log("Fetched intern details: ", internDoc.data());
          setInternDetails(internDoc.data());
        } else {
          console.log("No such intern document!");
        }

        // Fetch applications related to the current user
        const applicationsQuery = query(
          collection(db, "applications"),
          where("internId", "==", currentUser.uid)
        );

        const applicationsSnapshot = await getDocs(applicationsQuery);
        const fetchedApplications = applicationsSnapshot.docs.map(
          (docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })
        );

        console.log("Fetched applications: ", fetchedApplications); // Debugging log

        setApplications(fetchedApplications);
      } catch (error) {
        console.error("Error fetching applications or intern details:", error);
      } finally {
        setLoading(false); // Stop loading after data is fetched
      }
    }
  };

  // Only fetch data when component mounts (fetch once)
  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications(); // Re-fetch data on refresh
    setRefreshing(false);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Accepted":
        return {
          backgroundColor: colors.status.accepted.background,
          color: colors.status.accepted.text,
        };
      case "In Review":
        return {
          backgroundColor: colors.status.inReview.background,
          color: colors.status.inReview.text,
        };
      case "Interview":
        return {
          backgroundColor: colors.status.interview.background,
          color: colors.status.interview.text,
        };
      case "Applied":
      default:
        return {
          backgroundColor: colors.status.applied.background,
          color: colors.status.applied.text,
        };
    }
  };

  const fetchInterviewDetails = async (interviewId) => {
    try {
      const interviewDocRef = doc(db, "interviews", interviewId);
      const interviewDoc = await getDoc(interviewDocRef);

      if (interviewDoc.exists()) {
        const interviewData = interviewDoc.data();
        console.log("Fetched interview details: ", interviewData);

        return interviewData;
      } else {
        console.log("No such interview document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching interview details: ", error);
      return null;
    }
  };

  const openModal = async (application) => {
    console.log("Opening modal for application: ", application); // Debugging log for modal

    // Fetch internship description using internshipId from the 'internships' collection
    try {
      const internshipDocRef = doc(db, "internships", application.internshipId);
      const internshipDoc = await getDoc(internshipDocRef);

      if (internshipDoc.exists()) {
        const internshipData = internshipDoc.data();
        console.log("Fetched internship details: ", internshipData);

        // Fetch interview details if status is 'In Review'
        if (application.status === "In Review") {
          const interviewDetails = await fetchInterviewDetails(
            application.interviewId
          );
          if (interviewDetails) {
            application = {
              ...application,
              interviewLink: interviewDetails.link,
              interviewDate: interviewDetails.date,
              interviewTime: interviewDetails.time,
            };
          }
        }

        // Set application data including internship details
        setSelectedApplication({
          ...application,
          internshipDescription: internshipData.description,
        });
      } else {
        console.log("No such internship document!");
        setSelectedApplication(application); // If no internship description, just use the original application data
      }

      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching internship details: ", error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedApplication(null);
  };

  const downloadCV = async (cvUrl) => {
    console.log("Downloading CV from URL: ", cvUrl); // Debugging log for CV download
    setCvDownloading(true);
    Linking.openURL(cvUrl);
    try {
      const downloadUri = FileSystem.documentDirectory + "cv.pdf";
      const downloadResumable = FileSystem.createDownloadResumable(
        cvUrl,
        downloadUri
      );
      const { uri } = await downloadResumable.downloadAsync();
      console.log("CV downloaded to: ", uri); // Log the downloaded file's location
    } catch (error) {
      Alert.alert("Error", "Failed to download the CV.");
    } finally {
      setCvDownloading(false);
    }
  };

  // Render the details modal, including the dynamic status bar, company information, and profile picture
  const renderApplicationDetailsModal = () => {
    if (!selectedApplication) return null;

    const statusOrder = ["Applied", "In Review", "Accepted"]; // Define the order for the status

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalHeader}>
          <Feather
            name="arrow-left"
            size={24}
            color="#FFFFFF"
            style={styles.backIcon}
            onPress={closeModal}
          />
        </View>

        {/* Dynamic Status Bar */}
        <View style={styles.progressBarContainer}>
          {statusOrder.map((status, index) => (
            <View key={index} style={styles.statusStep}>
              <View
                style={[
                  styles.statusCircle,
                  {
                    backgroundColor:
                      statusOrder.indexOf(selectedApplication.status) >= index
                        ? "#0077B6"
                        : "#ccc",
                  },
                ]}
              />
              <Text style={styles.statusLabel}>{status}</Text>
            </View>
          ))}
        </View>

        <View style={styles.progressBarLineContainer}>
          {statusOrder.map((status, index) => (
            <View
              key={index}
              style={[
                styles.progressBarLine,
                {
                  backgroundColor:
                    statusOrder.indexOf(selectedApplication.status) > index
                      ? "#0077B6"
                      : "#ccc",
                },
              ]}
            />
          ))}
        </View>

        {/* Company Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: selectedApplication.logo }}
            style={styles.modalLogo}
          />
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Job Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.jobTitle}>{selectedApplication.jobTitle}</Text>
            <Text style={styles.jobType}>{selectedApplication.jobType}</Text>

            {/* Description Section */}
            <Text style={styles.jobDescription}>
              {showMore
                ? selectedApplication.internshipDescription ||
                  "No description available." // Fallback to "No description available"
                : (
                    selectedApplication.internshipDescription ||
                    "No description available"
                  ).slice(0, 200) + "..."}
            </Text>
            <Text
              style={styles.showMoreText}
              onPress={() => setShowMore(!showMore)}
            >
              {showMore ? "Show less" : "Show more"}
            </Text>

            {/* Interview Details Section */}
            {selectedApplication.status === "In Review" && (
              <View style={styles.detailsSection}>
                <Text style={styles.sectionTitle}>Interview Details</Text>
                <Text style={styles.jobDescription}>
                  Date: {selectedApplication.interviewDate}
                </Text>
                <Text style={styles.jobDescription}>
                  Time: {selectedApplication.interviewTime}
                </Text>
                <Text style={styles.jobDescription}>
                  Link:{" "}
                  <Text
                    style={styles.interviewLink}
                    onPress={() =>
                      Linking.openURL(selectedApplication.interviewLink)
                    }
                  >
                    {selectedApplication.interviewLink}
                  </Text>
                </Text>
              </View>
            )}
          </View>

          {/* CV Section */}
          {internDetails?.cvUrl ? (
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>CV</Text>
              <View style={styles.cvRow}>
                <Image
                  source={{ uri: "https://example.com/pdf-icon.png" }} // Replace with actual PDF icon URL
                  style={styles.cvIcon}
                />
                <Text style={styles.cvName}>CV.pdf</Text>
                <TouchableOpacity
                  onPress={() => downloadCV(internDetails.cvUrl)}
                >
                  {cvDownloading ? (
                    <ActivityIndicator />
                  ) : (
                    <Feather name="download" size={24} color="#0077B6" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={styles.noCvText}>No CV uploaded.</Text>
          )}
        </ScrollView>
      </Modal>
    );
  };

  const renderItem = ({ item }) => {
    const statusStyles = getStatusStyles(item.status);

    console.log("Rendering application item: ", item); // Debugging log for item rendering

    return (
      <TouchableOpacity
        onPress={() => openModal(item)}
        style={styles.itemContainer}
      >
        <Image source={{ uri: item.logo }} style={styles.itemLogo} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.jobTitle}</Text>
          <Text style={styles.itemType}>{item.jobType}</Text>
          <Text style={styles.itemDate}>
            Applied On: {new Date(item.appliedOn.seconds * 1000).toDateString()}
          </Text>
        </View>
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: statusStyles.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusStyles.color }]}>
            {item.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
        <Feather
          name="arrow-left"
          size={24}
          color="white"
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        />
        {internDetails?.pic && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile_Intern")}
          >
            <Image
              source={{ uri: internDetails.pic }}
              style={styles.profilePic}
            />
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
        <Ionicons
          name="options"
          size={24}
          color="white"
          style={styles.filterIcon}
        />
      </View>

      {/* Applications List */}
      <Text style={styles.applicationsText}>My Applications</Text>
      <FlatList
        data={applications.filter(
          (application) =>
            application.jobTitle
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            application.companyName
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            You haven't applied for any internships yet.
          </Text>
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
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
    backgroundColor: "#f8f8f8",
    paddingTop: StatusBar.currentHeight || 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    borderColor: "#ccc",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginRight: 10,
    fontFamily: "Poppins-Regular",
  },
  filterIcon: {
    backgroundColor: "#034694",
    color: "white",
    padding: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applicationsText: {
    marginLeft: 20,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    fontFamily: "Poppins-SemiBold",
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
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
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins-SemiBold",
  },
  itemType: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
  itemDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
  statusContainer: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Poppins-Regular",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
    fontFamily: "Poppins-Regular",
  },
  listContainer: {
    paddingBottom: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal styles
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
  },
  modalLogo: {
    width: 100, // Increased size for better visibility
    height: 100, // Increased size for better visibility
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 20, // Added margin for better spacing
  },
  modalContent: {
    padding: 20,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  statusStep: {
    alignItems: "center",
    flex: 1,
  },
  statusCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ccc",
  },
  statusLabel: {
    marginTop: 5,
    fontSize: 12,
    color: "#333",
  },
  progressBarLineContainer: {
    flexDirection: "row",
    marginHorizontal: 30,
    marginTop: 5,
  },
  progressBarLine: {
    height: 4,
    flex: 1,
    backgroundColor: "#ccc",
    borderRadius: 2,
  },
  detailsSection: {
    marginVertical: 20,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  jobType: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  jobDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  cvRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cvIcon: {
    width: 40,
    height: 40,
  },
  cvName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
  },
  showMoreText: {
    fontSize: 14,
    color: "#0077B6",
    marginTop: 10,
    fontWeight: "bold",
  },
  noCvText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginVertical: 10,
  },
  interviewLink: {
    color: "#0077B6",
    textDecorationLine: "underline",
  },
});

export default Applications_Intern;
