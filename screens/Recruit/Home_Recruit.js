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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
import { Swipeable } from "react-native-gesture-handler";
import SettingsIcon from "../../assets/icons/SettingsIcon";
import CustomNavBar from "../../components/CustomNavBar";
import colors from "../../assets/colors";
import { LinearGradient } from "expo-linear-gradient";

const db = getFirestore(app);
const auth = getAuth(app);

const Home_Recruit = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedInternship, setSelectedInternship] = useState(null); // Store selected internship data
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility state
  const modalTranslateY = useRef(new Animated.Value(300)).current; // Modal animation
  const [hidden, setHidden] = useState(false);
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
      const fetchInternships = async () => {
        setLoading(true);
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const querySnapshot = await getDocs(
              query(
                collection(db, "internships"),
                where("userId", "==", currentUser.uid)
              )
            );
            const internships = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setData(internships);
          } else {
            console.error("No current user found.");
          }
        } catch (error) {
          console.error("Error fetching internships:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchInternships();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const querySnapshot = await getDocs(
          query(
            collection(db, "internships"),
            where("userId", "==", currentUser.uid)
          )
        );
        const internships = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(internships);
      } else {
        console.error("No current user found.");
      }
    } catch (error) {
      console.error("Error fetching internships:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredData = data.filter(
    (item) =>
      item.jobTitle &&
      item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this internship?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            await deleteDoc(doc(db, "internships", id));
            setData(data.filter((item) => item.id !== id)); // Update local state
          },
          style: "destructive",
        },
      ]
    );
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
      setSelectedInternship(null); // Clear selected data
    });
  };

  const handleInternshipPress = (item) => {
    setSelectedInternship(item);
    console.log("Selected Internship:", item);
    showModal(); // Show modal when internship is selected
  };

  const RenderItem = React.memo(({ item, navigation }) => (
    <Swipeable
      renderLeftActions={() => (
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() =>
            navigation.navigate("InternUpdateRecruit", { internId: item.id })
          }
        >
          <Ionicons name="create" size={30} color="white" />
        </TouchableOpacity>
      )}
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash" size={30} color="white" />
        </TouchableOpacity>
      )}
    >
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleInternshipPress(item)} // Open modal on press
      >
        <Image source={{ uri: item.logo }} style={styles.logo} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemText}>{item.jobTitle}</Text>
          <View style={styles.itemSubTextContainer}>
            <Text style={styles.itemSubText}>Type: {item.jobType}</Text>
            <Text style={styles.salaryText}>Salary: {item.salary}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  ));

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
          placeholder="Search Recruitments"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        style={styles.listitems}
        renderItem={({ item }) => (
          <RenderItem item={item} navigation={navigation} />
        )}
        contentContainerStyle={{ paddingBottom: 20 }} // Optional for spacing
        ListEmptyComponent={
          <Text style={styles.emptyText}>No internships found.</Text>
        }
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("InternRecruit")}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <CustomNavBar currentScreen="HomeRecruit" />

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
            {selectedInternship && (
              <>
                <Image
                  source={{ uri: selectedInternship.logo }}
                  style={styles.modalLogo}
                />
                <Text style={styles.modalCompany}>
                  {selectedInternship.companyName}
                </Text>
                <Text style={styles.modalTitle}>
                  {selectedInternship.jobTitle}
                </Text>
                <View style={styles.jobTypeSalaryContainer}>
                  <Text style={styles.modaljstext}>
                    {selectedInternship.jobType}
                  </Text>
                  <Text style={styles.modaljstext}>
                    {selectedInternship.location}
                  </Text>
                  <Text style={styles.modaljstext}>
                    {selectedInternship.salary} LKR
                  </Text>
                </View>
                <Text style={styles.modalText}>
                  {selectedInternship.category}
                </Text>
                <Text style={styles.modalLabel}>Description: </Text>
                <Text style={styles.modalText}>
                  {selectedInternship.description}
                </Text>
                <Text style={styles.modalLabel}>Qualifications: </Text>
                <Text style={styles.modalText}>
                  {selectedInternship.qualifications}
                </Text>

                <TouchableOpacity
                  onPress={hideModal}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
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

  closeButton: {
    backgroundColor: colors.lightred, // Red close button background
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
  updateButton: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: 50,
    height: "70%",
    marginLeft: 10,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
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
    elevation: 6,
    marginHorizontal: 10,
    marginTop: 15,
    alignSelf: "center",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 16,
    borderRadius: 8,
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
  listitems: {
    marginTop: 20,
    marginBottom: 80,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins-Regular", // Use Poppins font
    color: "#999",
  },
  deleteButton: {
    backgroundColor: colors.lightred,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    width: 50,
    height: "70%",
    marginRight: 10,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
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

export default Home_Recruit;
