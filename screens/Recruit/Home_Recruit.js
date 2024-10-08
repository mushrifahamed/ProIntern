import colors from "../../assets/colors";
import React, { useState, useEffect } from "react";
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
  query, // Import query
  where, // Import where
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase";
import { Swipeable } from "react-native-gesture-handler";
import SettingsIcon from "../../assets/icons/SettingsIcon";
import CustomNavBar from "../../components/CustomNavBar";

const db = getFirestore(app);
const auth = getAuth(app);

const Home_Recruit = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
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
                "https://your-default-url.com/default-pic.jpg", // Replace with a default URL if no profile picture is set
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
          // Get the current user from Firebase Auth
          const currentUser = auth.currentUser;

          if (currentUser) {
            // Fetch internships that match the current user's UID
            const querySnapshot = await getDocs(
              query(
                collection(db, "internships"),
                where("userId", "==", currentUser.uid) // Filter by userId
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

  const renderItem = ({ item }) => (
    <Swipeable
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
        onPress={() =>
          navigation.navigate("InternUpdateRecruit", { internId: item.id })
        }
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
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("Settings")}
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
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No internships found.</Text>
        }
      />

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("InternRecruit")}
        activeOpacity={0.7} // Optional: Change the opacity when pressed
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      <CustomNavBar currentScreen="HomeRecruit" />
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
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins-Regular", // Use Poppins font
    color: "#999",
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: "100%",
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
