import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as DocumentPicker from 'expo-document-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { app } from '../../firebase'; // Make sure firebase is initialized
import { SelectList } from "react-native-dropdown-select-list";
import colors from '../../assets/colors';

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

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

const Apply_Intern = ({ route }) => {
  const { internshipId } = route.params; // Pass internshipId from the previous screen
  const [userData, setUserData] = useState({ fullName: '', email: '', mobileNumber: '', appliedInternships: [] });
  const [internshipData, setInternshipData] = useState(null); // Store internship details
  const [selectedCity, setSelectedCity] = useState(null); // Updated city state to handle the selection
  const [coverLetter, setCoverLetter] = useState('');
  const [cvUrl, setCvUrl] = useState(null);
  const [cvFileName, setCvFileName] = useState('Upload Document (.pdf only)');
  const navigation = useNavigation();

  useEffect(() => {
    // Fetch current user details and applied internships
    const fetchUserProfile = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'Interns', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData({
            fullName: userData.fullName || '',
            email: currentUser.email || '',
            mobileNumber: userData.mobileNumber || '', // Fetch mobileNumber from Firestore
            appliedInternships: userData.appliedInternships || [],
          });
          if (userData.cvUrl) {
            setCvFileName(`${userData.fullName}.pdf`);
            setCvUrl(userData.cvUrl);
          }
        }
      }
    };

    // Fetch internship details
    const fetchInternshipDetails = async () => {
      const internshipDoc = await getDoc(doc(db, 'internships', internshipId));
      if (internshipDoc.exists()) {
        setInternshipData(internshipDoc.data()); // Store the internship data (including logo)
      } else {
        Alert.alert('Error', 'Internship not found');
      }
    };

    fetchUserProfile();
    fetchInternshipDetails();
  }, [internshipId]);

  const handleCVUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!result.canceled && result.uri) {
      const currentUser = auth.currentUser;
      const storageRef = ref(storage, `interns/${currentUser.uid}/cv.pdf`);
      const response = await fetch(result.uri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setCvUrl(downloadURL);
      setCvFileName(result.name);

      // Update CV URL in Firestore
      await updateDoc(doc(db, 'Interns', currentUser.uid), { cvUrl: downloadURL });
      Alert.alert('CV uploaded successfully');
    } else {
      Alert.alert('No file selected');
    }
  };

  const handleDownloadCV = async () => {
    if (cvUrl) {
      try {
        Linking.openURL(cvUrl);
      } catch (error) {
        Alert.alert('Error', 'Unable to open CV.');
        console.error('Error opening CV:', error);
      }
    } else {
      Alert.alert('No CV available', 'You haven\'t uploaded a CV yet.');
    }
  };

  const handleApply = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !internshipId) return;

    // Check if the intern has already applied
    if (userData.appliedInternships.includes(internshipId)) {
      Alert.alert('Already Applied', 'You have already applied for this internship.');
      return;
    }

    try {
      // Step 1: Add application to 'applications' collection
      const applicationData = {
        internshipId,
        internId: currentUser.uid,
        jobTitle: internshipData?.jobTitle || '', // Fetch job title from internship data
        companyName: internshipData?.companyName || '', // Fetch company name from internship data
        logo: internshipData?.logo || '', // Include the logo URL
        recruiterId: internshipData?.userId || '', // Fetch userId from Intern data
        status: 'Applied',
        appliedOn: new Date(),
        coverLetter,
      };

      await addDoc(collection(db, 'applications'), applicationData);

      // Step 2: Update appliedInterns array in the internship document
      await updateDoc(doc(db, 'internships', internshipId), {
        appliedInterns: arrayUnion(currentUser.uid),
      });

      // Step 3: Update appliedInternships array in the intern's profile
      await updateDoc(doc(db, 'Interns', currentUser.uid), {
        appliedInternships: arrayUnion(internshipId),
      });

      Alert.alert('Application submitted successfully');
      navigation.navigate('Home_Intern'); // Navigate back to home
    } catch (error) {
      console.error('Error applying for internship:', error);
      Alert.alert('Error', 'Failed to apply for the internship');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Back Button and Title in Same Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home_Intern')}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Job Apply</Text>
        </View>

        {/* Full Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={userData.fullName} editable={false} />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Email</Text>
          <TextInput style={styles.input} value={userData.email} editable={false} />
        </View>

        {/* Mobile Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput style={styles.input} value={userData.mobileNumber} editable={false} />
        </View>

        {/* City - Use SelectList for District Selection */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>City</Text>
          <SelectList
            setSelected={setSelectedCity}
            data={districts}
            placeholder="Select City"
            search={true}
            boxStyles={styles.selectBox}
            arrowicon={<Ionicons name="chevron-down" size={12} color={"black"} />}
          />
        </View>

        {/* Cover Letter */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cover Letter</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={coverLetter}
            onChangeText={setCoverLetter}
            multiline
          />
        </View>

        {/* CV Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>CV</Text>
          <View style={styles.cvDisplay}>
            <TouchableOpacity onPress={handleDownloadCV}>
              <View style={styles.cvInner}>
                <Ionicons name="document" size={24} color={'#034694'} />
                <Text style={styles.cvText}>{cvFileName}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCVUpload}>
              <Ionicons name="document-outline" size={24} color={'#034694'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Apply Now Button */}
        <TouchableOpacity onPress={handleApply} style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    padding: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 20,
  },
  backButton: {
    paddingRight: 20,
  },
  title: {
    fontSize: 24,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 15,
    fontFamily: 'Poppins-Regular',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    fontFamily: 'Poppins-SemiBold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
    fontFamily: 'Poppins-Regular',
  },
  cvDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  cvInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cvText: {
    marginLeft: 10,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
  },
  applyButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default Apply_Intern;
