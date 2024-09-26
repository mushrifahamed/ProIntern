import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../firebase'; // Import Firebase configuration

const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app); // Initialize Storage

const Intern_Recruit = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('');
  const [location, setLocation] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const auth = getAuth(app);
  const currentUser = auth.currentUser; // Get the logged-in user

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
  
    console.log('Image Picker Result:', result); // Log the result
  
    if (!result.cancelled && result.assets && result.assets.length > 0) {
      setLogo(result.assets[0].uri); // Access the URI from the first asset
      console.log('Picked Image URI:', result.assets[0].uri); // Log the picked image URI
    } else {
      alert('Image selection was cancelled or failed.');
    }
  };
  
  const handleUploadLogo = async () => {
    if (!logo) return null;
  
    try {
      const response = await fetch(logo);
      const blob = await response.blob();
      const storageRef = ref(storage, `logos/${Date.now()}_${currentUser.uid}.jpg`);
  
      await uploadBytes(storageRef, blob); // Upload the blob
      const downloadUrl = await getDownloadURL(storageRef); // Get the download URL
      setImageUrl(downloadUrl); // Store the download URL in state
      return downloadUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert('Error uploading logo. Please try again.');
      return null;
    }
  };
  

  const handleSubmit = async () => {
    try {
      const logoUrl = await handleUploadLogo(); // Upload logo and get URL

      // Proceed only if the logo was successfully uploaded
      if (logoUrl) {
        // Save form data in Firestore
        await addDoc(collection(db, 'internships'), {
          jobTitle,
          jobType,
          location,
          qualifications,
          salary,
          description,
          logo: logoUrl,
          userId: currentUser.uid, // Store logged-in user's ID
        });

        alert('Internship details submitted!');
        // Reset form fields after submission
        setJobTitle('');
        setJobType('');
        setLocation('');
        setQualifications('');
        setSalary('');
        setDescription('');
        setLogo(null);
      } else {
        alert('Logo upload failed. Please try again.');
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert('Error submitting form. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Internship Recruitment</Text>

      <TextInput
        style={styles.input}
        placeholder="Job Title"
        value={jobTitle}
        onChangeText={setJobTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Job Type"
        value={jobType}
        onChangeText={setJobType}
      />

      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={styles.textArea}
        placeholder="Qualifications"
        value={qualifications}
        onChangeText={setQualifications}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Salary"
        value={salary}
        onChangeText={setSalary}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.textArea}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        <Ionicons name="image" size={24} color="black" />
        <Text>Pick Logo</Text>
      </TouchableOpacity>
      {logo && <Image source={{ uri: logo }} style={styles.logoPreview} />}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Ionicons name="checkmark" size={24} color="white" />
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    height: 100,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPreview: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4caf50', // Green color for submit
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Intern_Recruit;
