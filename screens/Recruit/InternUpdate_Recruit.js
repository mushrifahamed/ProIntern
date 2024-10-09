import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase"; // Import Firebase configuration
import { SelectList } from "react-native-dropdown-select-list"; // Import SelectList
import colors from "../../assets/colors";

const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Storage

// List of districts in Sri Lanka
const districts = [
  { key: "1", value: "Ampara" },
  { key: "2", value: "Anuradhapura" },
  { key: "3", value: "Badulla" },
  { key: "4", value: "Batticaloa" },
  { key: "5", value: "Colombo" },
  { key: "6", value: "Galle" },
  { key: "7", value: "Gampaha" },
  { key: "8", value: "Hambantota" },
  { key: "9", value: "Jaffna" },
  { key: "10", value: "Kalutara" },
  { key: "11", value: "Kandy" },
  { key: "12", value: "Kegalle" },
  { key: "13", value: "Kilinochchi" },
  { key: "14", value: "Kurunegala" },
  { key: "15", value: "Mannar" },
  { key: "16", value: "Matale" },
  { key: "17", value: "Matara" },
  { key: "18", value: "Monaragala" },
  { key: "19", value: "Mullaitivu" },
  { key: "20", value: "Nuwara Eliya" },
  { key: "21", value: "Polonnaruwa" },
  { key: "22", value: "Puttalam" },
  { key: "23", value: "Ratnapura" },
  { key: "24", value: "Trincomalee" },
  { key: "25", value: "Vavuniya" },
];

// List of job types and categories
const categories = [
  { key: "1", value: "Software Development" },
  { key: "2", value: "Data Science and Analytics" },
  { key: "3", value: "Information Technology" },
  { key: "4", value: "Engineering" },
  { key: "5", value: "Architecture and Design" },
  { key: "6", value: "Finance and Accounting" },
  { key: "7", value: "Marketing and Sales" },
  { key: "8", value: "Human Resources" },
  { key: "9", value: "Research and Development" },
  { key: "10", value: "Media and Communications" },
];

const jobTypes = [
  { key: "1", value: "Onsite" },
  { key: "2", value: "Hybrid" },
  { key: "3", value: "Remote" },
];

const InternUpdate_Recruit = ({ route, navigation }) => {
  const { internId } = route.params; // Get the intern ID from route params
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedJobType, setSelectedJobType] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [qualifications, setQualifications] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  const scrollViewRef = useRef(); // Ref for ScrollView

  // Fetch the existing internship data
  useEffect(() => {
    const fetchInternData = async () => {
      try {
        const docRef = doc(db, "internships", internId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setJobTitle(data.jobTitle);
          setCompanyName(data.companyName);
          const jobTypeKey =
            jobTypes.find((type) => type.value === data.jobType)?.key || null;
          setSelectedJobType(jobTypeKey);
          console.log("Selected Job Type:", jobTypeKey); // Log the selected job type

          const locationKey =
            districts.find((dist) => dist.value === data.location)?.key || null;
          setSelectedLocation(locationKey);
          console.log("Selected Location:", locationKey); // Log the selected location

          const categoryKey =
            categories.find((cat) => cat.value === data.category)?.key || null;
          setSelectedCategory(categoryKey);
          console.log("Selected Category:", categoryKey); // Log the selected category
          setQualifications(data.qualifications);
          setSalary(data.salary);
          setDescription(data.description);
          setImageUrl(data.logo); // Store the logo URL
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching internship data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInternData(); // Fetch data when the component mounts
  }, [internId]);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      setLogo(result.assets[0].uri);
    } else {
      Alert.alert("Image selection was cancelled or failed.");
    }
  };

  const handleUploadLogo = async () => {
    if (!logo) return imageUrl; // Return existing logo URL if no new logo

    try {
      const response = await fetch(logo);
      const blob = await response.blob();
      const storageRef = ref(
        storage,
        `logos/${Date.now()}_${currentUser.uid}.jpg`
      );

      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      Alert.alert("Error uploading logo. Please try again.");
      return null;
    }
  };

  const getLogoNameAndExtension = () => {
    if (!logo) return "";
    const parts = logo.split("/").pop().split(".");
    const extension = parts.length > 1 ? parts.pop() : "";
    const fileName = parts.join(".");
    return `${fileName}.${extension}`;
  };

  const handleSubmit = async () => {
    try {
      const logoUrl = await handleUploadLogo();

      if (logoUrl || imageUrl) {
        // Use the new logo URL or keep the existing one
        // Find the values for the selected keys
        const jobTypeValue = jobTypes.find(
          (type) => type.key === selectedJobType
        )?.value;
        const locationValue = districts.find(
          (dist) => dist.key === selectedLocation
        )?.value;
        const categoryValue = categories.find(
          (cat) => cat.key === selectedCategory
        )?.value;

        await updateDoc(doc(db, "internships", internId), {
          jobTitle,
          companyName,
          jobType: jobTypeValue, // Use the value here
          location: locationValue, // Use the value here
          category: categoryValue, // Use the value here
          qualifications,
          salary,
          description,
          logo: logoUrl || imageUrl, // Use new logo URL or keep the existing one
          userId: currentUser.uid,
        });

        Alert.alert("Internship details updated!");
        navigation.goBack(); // Navigate back after updating
      } else {
        Alert.alert("Logo upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert("Error submitting form. Please try again.");
    }
  };

  const handleFocus = (event) => {
    const target = event.target; // Get the focused element
    target.measureLayout(
      scrollViewRef.current,
      (x, y) => {
        scrollViewRef.current.scrollTo({ y: y, animated: true }); // Scroll to the focused input position
      },
      () => {} // Handle layout measurement failure
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={20}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Update Internship</Text>
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollView}>
        <View style={styles.centeredView}>
          <TextInput
            style={styles.input}
            placeholder="Job Title"
            value={jobTitle}
            onChangeText={setJobTitle}
            onFocus={handleFocus}
          />
          <TextInput
            style={styles.input}
            placeholder="Company Name"
            value={companyName}
            onChangeText={setCompanyName}
            onFocus={handleFocus}
          />
          <SelectList
            setSelected={(val) => {
              setSelectedJobType(val);
              console.log("Selected Job Type:", val); // Log the selected value
            }}
            data={jobTypes}
            placeholder="Select Job Type"
            search={true}
            boxStyles={styles.selectBox}
            arrowicon={
              <Ionicons name="chevron-down" size={12} color={"black"} />
            }
            defaultOption={{
              key: selectedJobType,
              value: jobTypes.find((type) => type.key === selectedJobType)
                ?.value,
            }} // Pass the default option
            onFocus={handleFocus}
          />

          <SelectList
            setSelected={(val) => {
              setSelectedCategory(val);
              console.log("Selected Category:", val); // Log the selected value
            }}
            data={categories}
            placeholder="Select Category"
            search={true}
            boxStyles={styles.selectBox}
            arrowicon={
              <Ionicons name="chevron-down" size={12} color={"black"} />
            }
            defaultOption={{
              key: selectedCategory,
              value: categories.find((cat) => cat.key === selectedCategory)
                ?.value,
            }} // Pass the default option
            onFocus={handleFocus}
          />

          <SelectList
            setSelected={(val) => {
              setSelectedLocation(val);
              console.log("Selected Location:", val); // Log the selected value
            }}
            data={districts}
            placeholder="Select Location"
            search={true}
            boxStyles={styles.selectBox}
            arrowicon={
              <Ionicons name="chevron-down" size={12} color={"black"} />
            }
            defaultOption={{
              key: selectedLocation,
              value: districts.find((dist) => dist.key === selectedLocation)
                ?.value,
            }} // Pass the default option
            onFocus={handleFocus}
          />

          <TextInput
            style={styles.input}
            placeholder="Qualifications"
            value={qualifications}
            onChangeText={setQualifications}
            multiline={true}
            numberOfLines={4}
            onFocus={handleFocus}
          />
          <TextInput
            style={styles.input}
            placeholder="Salary"
            value={salary}
            onChangeText={setSalary}
            onFocus={handleFocus}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            onFocus={handleFocus}
          />
          {logo && (
            <Text style={styles.logoText}>{getLogoNameAndExtension()}</Text>
          )}
          <TouchableOpacity style={styles.logoButton} onPress={handlePickImage}>
            <Text style={styles.logoButtonText}>Upload Company Logo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    color: "black",
    fontFamily: "Poppins-SemiBold",
  },
  scrollView: {
    paddingBottom: 20,
  },
  centeredView: {
    alignItems: "center", // Center align children
  },
  input: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginVertical: 15,
    fontFamily: "Poppins-Regular",
  },
  selectBox: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginVertical: 8,
    fontFamily: "Poppins-Regular",
  },
  logoButton: {
    backgroundColor: "gray",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 8,
    width: "60%",
  },
  logoButtonText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "Poppins-SemiBold",
  },
  logoText: {
    fontSize: 16,
    marginBottom: 6,
    color: colors.black,
    fontFamily: "Poppins-Regular",
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 8,
    width: "60%",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontFamily: "Poppins-SemiBold",
  },
});

export default InternUpdate_Recruit;
