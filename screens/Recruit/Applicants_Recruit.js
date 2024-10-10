import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  StatusBar,
  Image,
  Modal,
  Animated,
  Easing,
  ScrollView,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
  query,
  where,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
import SettingsIcon from "../../assets/icons/SettingsIcon";
import CustomNavBar from "../../components/CustomNavBar";
import colors from "../../assets/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const db = getFirestore(app);
const auth = getAuth(app);

const Applicants_Recruit = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedIntern, setSelectedIntern] = useState(null); // Store selected intern data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const modalTranslateY = useRef(new Animated.Value(300)).current; // Modal animation
  const [hidden, setHidden] = useState(false);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interns, setInterns] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const changeStatusBarVisibility = () => setHidden(!hidden);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const recruiterDoc = await getDoc(
            doc(db, "recruiters", currentUser.uid)
          );
          if (recruiterDoc.exists()) {
            setUser({
              ...currentUser,
              pic:
                recruiterDoc.data().pic ||
                "https://your-default-url.com/default-pic.jpg",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUser();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchApplications = async () => {
        try {
          const recruiterId = auth.currentUser.uid;
          const querySnapshot = await getDocs(
            query(
              collection(db, "applications"),
              where("recruiterId", "==", recruiterId)
            )
          );
          const applications = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const combinedData = await Promise.all(
            applications.map(async (application) => {
              const internshipDoc = await getDoc(
                doc(db, "internships", application.internshipId)
              );
              const internDoc = await getDoc(
                doc(db, "Interns", application.internId)
              );

              console.log("Intern Data: ", internDoc.data());

              return {
                ...application,
                internship: { ...internshipDoc.data(), id: internshipDoc.id },
                intern: { ...internDoc.data(), id: internDoc.id },
              };
            })
          );

          setData(combinedData);
          console.log(combinedData);
        } catch (error) {
          console.error("Error fetching applications:", error);
        }
      };
      setLoading(false);

      fetchApplications();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const recruiterId = auth.currentUser.uid;
      const querySnapshot = await getDocs(
        query(
          collection(db, "applications"),
          where("recruiterId", "==", recruiterId)
        )
      );
      const applications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const combinedData = await Promise.all(
        applications.map(async (application) => {
          const internshipDoc = await getDoc(
            doc(db, "internships", application.internshipId)
          );
          const internDoc = await getDoc(
            doc(db, "Interns", application.internId)
          );

          console.log("Intern Data: ", internDoc.data());

          return {
            ...application,
            internship: { ...internshipDoc.data(), id: internshipDoc.id },
            intern: { ...internDoc.data(), id: internDoc.id },
          };
        })
      );

      setData(combinedData);
      console.log(combinedData);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Modal Animation - Show Modal
  const showModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalTranslateY, {
      toValue: 0,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  // Modal Animation - Hide Modal
  const hideModal = () => {
    Animated.timing(modalTranslateY, {
      toValue: 300,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setSelectedIntern(null); // Clear selected data
    });
  };

  const handleReviewPress = () => {
    navigation.navigate("ApplicationReviewRecruit", {
      applicationData: selectedIntern,
    });
    hideModal();
  };

  const handleInternPress = (item) => {
    setSelectedIntern(item);
    console.log("Selected Intern:", item);
    showModal(); // Show modal when intern is selected
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Applied":
        return {
          color: colors.status.applied.text,
          backgroundColor: colors.status.applied.background,
        };
      case "In Review":
        return {
          color: colors.status.inReview.text,
          backgroundColor: colors.status.inReview.background,
        };
      case "Accepted":
        return {
          color: colors.status.accepted.text,
          backgroundColor: colors.status.accepted.background,
        };
      case "Rejected":
        return {
          color: colors.status.rejected.text,
          backgroundColor: colors.status.rejected.background,
        };
      default:
        return {
          color: colors.status.applied.text,
          backgroundColor: colors.status.applied.background,
        };
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleInternPress(item)} // Open modal on press
    >
      <Image source={{ uri: item.intern.profilePicture }} style={styles.logo} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemText}>{item.intern.fullName}</Text>
        <Text style={styles.itemSubText}>{item.internship.jobTitle}</Text>
        <View style={[styles.itemStatusTextContainer]}>
          <Text style={[styles.itemStatusText, getStatusStyle(item.status)]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden={hidden} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("SettingsRecruit")}
        >
          <SettingsIcon size={24} color={colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ProfileButton}
          onPress={() => navigation.navigate("ProfileRecruit")}
        >
          {user && (
            <Image
              source={{ uri: user.pic }} // Display the profile picture
              style={styles.profileImage}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Interns"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 7.5 }}>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No interns found.</Text>
          }
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={true}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      </View>

      <CustomNavBar currentScreen="ApplicantsRecruit" />

      <Modal visible={isModalVisible} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={hideModal}>
          <View style={styles.dimmedBackground} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: modalTranslateY }] },
          ]}
        >
          <ScrollView
            contentContainerStyle={[styles.modalContent, { flexGrow: 1 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {selectedIntern && (
              <>
                <Image
                  source={{ uri: selectedIntern.internship.logo }}
                  style={styles.modalLogo}
                />
                <Text style={styles.modalCompany}>
                  {selectedIntern.intern.name}
                </Text>
                <Text style={styles.modalTitle}>
                  {selectedIntern.internship.jobTitle}
                </Text>
                <View style={styles.jobTypeSalaryContainer}>
                  <Text style={styles.modaljstext}>
                    {selectedIntern.internship.category}
                  </Text>
                  <Text style={styles.modaljstext}>
                    {selectedIntern.internship.location}
                  </Text>
                </View>
                <Text style={styles.modalText}>
                  {selectedIntern.internship.description}
                </Text>
                <Text style={styles.modalLabel}>Qualifications: </Text>
                <Text style={styles.modalText}>
                  {selectedIntern.internship.qualifications}
                </Text>
                <Text style={styles.modalLabel}>Salary: </Text>
                <Text style={styles.modalText}>
                  {selectedIntern.internship.salary}
                </Text>
                <Text style={styles.modalLabel}>Company: </Text>
                <Text style={styles.modalText}>
                  {selectedIntern.internship.companyName}
                </Text>

                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={handleReviewPress}
                >
                  <Entypo name="text-document" size={24} color="white" />
                  <Text style={styles.reviewButtonText}>
                    Application Review
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FBFBFB",
    paddingTop: StatusBar.currentHeight || 20,
  },
  header: {
    position: "absolute", // Position the header absolutely
    top: 50,
    left: 0,
    right: 0,
    zIndex: 1,
    flexDirection: "row", // Align items horizontally
    alignItems: "center", // Center vertically
    justifyContent: "space-between", // Space between settings button and profile picture
    paddingHorizontal: 20, // Add horizontal padding
  },
  dimmedBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
  },

  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "auto",
    maxHeight: "60%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 20, // Add elevation for Android shadow
  },

  modalContent: {
    flex: 1,
  },
  modalLogo: {
    borderRadius: 10,
    width: 100, // Adjust as necessary
    height: 100, // Adjust as necessary
    resizeMode: "contain", // Ensures the image scales properly
    alignSelf: "center", // Centers the image
    marginBottom: 10, // Adds space below the image
  },

  modalTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 10,
    color: "#333",
    alignSelf: "center",
  },
  reviewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  reviewButtonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
    fontFamily: "Poppins-SemiBold",
  },
  modalCompany: {
    fontSize: 16,
    color: "#555",
    marginVertical: 0,
    alignSelf: "center",
    fontFamily: "Poppins-Regular",
  },
  jobTypeSalaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Space between job type and salary
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 10, // Add some vertical margin
  },
  modaljstext: {
    fontSize: 16,
    color: colors.primary,
    marginVertical: 5,
    marginRight: 5,
    fontFamily: "Poppins-SemiBold",
    backgroundColor: colors.lightBlue,
    padding: 10,

    borderRadius: 10,
  },
  modalLabel: {
    ontSize: 16,
    color: "#555",
    marginVertical: 5,
    fontFamily: "Poppins-SemiBold",
    marginHorizontal: 20,
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
    fontFamily: "Poppins-Regular",
    marginHorizontal: 20,
  },
  settingsButton: {
    padding: 13,
    borderRadius: 10,
    marginStart: 5,
    backgroundColor: colors.primary,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center", // Keep items vertically centered
    paddingHorizontal: 10,
    marginTop: 100, // Move down below the header
    width: 380, // Maintain your desired width
    alignSelf: "center",
    marginBottom: 20,
  },

  searchBar: {
    flex: 1,
    height: 50,
    borderColor: "#FBFBFB",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
    paddingHorizontal: 20,
    marginEnd: 20,
    fontSize: 16,
    fontFamily: "Poppins-Regular", // Use Poppins font
  },
  searchButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  item: {
    width: "88%",
    flexDirection: "row",
    padding: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    marginHorizontal: 10,
    marginTop: 15,
    alignSelf: "center",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 16,
    borderRadius: 8,
    marginVertical: 20,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemText: {
    fontFamily: "Poppins-SemiBold", // Use Poppins font
    fontSize: 16,
    color: "#000",
  },
  itemSubText: {
    fontFamily: "Poppins-Regular", // Use Poppins font
    fontSize: 14,
    color: "#555",
  },
  itemStatusTextContainer: {
    flexDirection: "row",
    padding: 5,
    borderRadius: 10,
    marginTop: 5,
  },
  itemStatusText: {
    justifyContent: "space-around",
    fontFamily: "Poppins-Regular", // Use Poppins font
    fontSize: 14,
    color: "#9C6400",
    padding: 5,
    borderRadius: 10,
    backgroundColor: "#F7DC6F",
  },
  itemSubTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Space between job type and salary
    alignItems: "center",
  },
  salaryText: {
    fontFamily: "Poppins-Regular", // Use Poppins font
    fontSize: 14,
    color: "#555",
    flexShrink: 1, // Allow salary text to shrink if needed
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins-Regular", // Use Poppins font
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FBFBFB",
  },
  floatingButton: {
    position: "absolute",
    bottom: 120,
    right: 20,
    backgroundColor: colors.primary,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 100,
  },
});

export default Applicants_Recruit;
