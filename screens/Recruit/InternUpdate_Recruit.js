import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebase'; // Import Firebase configuration
import { SelectList } from 'react-native-dropdown-select-list'; // Import SelectList

const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Storage

// List of districts in Sri Lanka
const districts = [
  { key: '1', value: 'Ampara' },
  { key: '2', value: 'Anuradhapura' },
  { key: '3', value: 'Badulla' },
  { key: '4', value: 'Batticaloa' },
  { key: '5', value: 'Colombo' },
  { key: '6', value: 'Galle' },
  { key: '7', value: 'Gampaha' },
  { key: '8', value: 'Hambantota' },
  { key: '9', value: 'Jaffna' },
  { key: '10', value: 'Kalutara' },
  { key: '11', value: 'Kandy' },
  { key: '12', value: 'Kegalle' },
  { key: '13', value: 'Kilinochchi' },
  { key: '14', value: 'Kurunegala' },
  { key: '15', value: 'Mannar' },
  { key: '16', value: 'Matale' },
  { key: '17', value: 'Matara' },
  { key: '18', value: 'Monaragala' },
  { key: '19', value: 'Mullaitivu' },
  { key: '20', value: 'Nuwara Eliya' },
  { key: '21', value: 'Polonnaruwa' },
  { key: '22', value: 'Puttalam' },
  { key: '23', value: 'Ratnapura' },
  { key: '24', value: 'Trincomalee' },
  { key: '25', value: 'Vavuniya' }
];

// List of job types and categories
const categories = [
  { key: '1', value: 'Software Development' },
  { key: '2', value: 'Data Science and Analytics' },
  { key: '3', value: 'Information Technology' },
  { key: '4', value: 'Engineering' },
  { key: '5', value: 'Architecture and Design' },
  { key: '6', value: 'Finance and Accounting' },
  { key: '7', value: 'Marketing and Sales' },
  { key: '8', value: 'Human Resources' },
  { key: '9', value: 'Research and Development' },
  { key: '10', value: 'Media and Communications' },
];

const jobTypes = [
  { key: '1', value: 'Onsite' },
  { key: '2', value: 'Hybrid' },
  { key: '3', value: 'Remote' },
];

const InternUpdate_Recruit = ({ route, navigation }) => {
  const { internId } = route.params; // Get the intern ID from route params
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedJobType, setSelectedJobType] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [qualifications, setQualifications] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  const scrollViewRef = useRef(); // Ref for ScrollView

  // Fetch the existing internship data
  useEffect(() => {
    const fetchInternData = async () => {
      try {
        const docRef = doc(db, 'internships', internId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setJobTitle(data.jobTitle);
          setCompanyName(data.companyName);
          setSelectedJobType(jobTypes.find(type => type.value === data.jobType)?.key);
          setSelectedLocation(districts.find(dist => dist.value === data.location)?.key);
          setSelectedCategory(categories.find(cat => cat.value === data.category)?.key);
          setQualifications(data.qualifications);
          setSalary(data.salary);
          setDescription(data.description);
          setImageUrl(data.logo); // Store the logo URL
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching internship data:', error);
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
      Alert.alert('Image selection was cancelled or failed.');
    }
  };

  const handleUploadLogo = async () => {
    if (!logo) return imageUrl; // Return existing logo URL if no new logo

    try {
      const response = await fetch(logo);
      const blob = await response.blob();
      const storageRef = ref(storage, `logos/${Date.now()}_${currentUser.uid}.jpg`);

      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      Alert.alert('Error uploading logo. Please try again.');
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      const logoUrl = await handleUploadLogo();

      if (logoUrl || imageUrl) { // Use the new logo URL or keep the existing one
        // Find the values for the selected keys
        const jobTypeValue = jobTypes.find(type => type.key === selectedJobType)?.value;
        const locationValue = districts.find(dist => dist.key === selectedLocation)?.value;
        const categoryValue = categories.find(cat => cat.key === selectedCategory)?.value;

        await updateDoc(doc(db, 'internships', internId), {
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

        Alert.alert('Internship details updated!');
        navigation.goBack(); // Navigate back after updating
      } else {
        Alert.alert('Logo upload failed. Please try again.');
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Alert.alert('Error submitting form. Please try again.');
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
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Update Internship Recruitment</Text>

        <TextInput
          style={styles.input}
          placeholder="Job Title"
          value={jobTitle}
          onChangeText={setJobTitle}
          onFocus={handleFocus} // Scroll to this field
        />

        <TextInput
          style={styles.input}
          placeholder="Company Name"
          value={companyName}
          onChangeText={setCompanyName}
          onFocus={handleFocus} // Scroll to this field
        />

        <SelectList
          setSelected={setSelectedJobType}
          data={jobTypes}
          save="key"
          placeholder="Select Job Type"
          onFocus={handleFocus} // Scroll to this field
        />

        <SelectList
          setSelected={setSelectedLocation}
          data={districts}
          save="key"
          placeholder="Select Location"
          onFocus={handleFocus} // Scroll to this field
        />

        <SelectList
          setSelected={setSelectedCategory}
          data={categories}
          save="key"
          placeholder="Select Category"
          onFocus={handleFocus} // Scroll to this field
        />

        <TextInput
          style={styles.input}
          placeholder="Qualifications"
          value={qualifications}
          onChangeText={setQualifications}
          onFocus={handleFocus} // Scroll to this field
        />

        <TextInput
          style={styles.input}
          placeholder="Salary"
          keyboardType="numeric"
          value={salary}
          onChangeText={setSalary}
          onFocus={handleFocus} // Scroll to this field
        />

        <TextInput
          style={styles.input}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          onFocus={handleFocus} // Scroll to this field
          multiline={true}
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
          <Text style={styles.imagePickerText}>{logo ? 'Change Logo' : 'Upload Logo'}</Text>
          {logo && <Image source={{ uri: logo }} style={styles.logo} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Update Internship</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollView: {
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  imagePickerText: {
    fontSize: 16,
    marginRight: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InternUpdate_Recruit;
