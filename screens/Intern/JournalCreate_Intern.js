import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { db, storage, auth } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';

const JournalCreate_Intern = ({ route, navigation }) => {
  const { date } = route.params;
  const [journalTitle, setJournalTitle] = useState('');
  const [journalContent, setJournalContent] = useState('');
  const [image, setImage] = useState(null);
  const [imageFileName, setImageFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previousContent, setPreviousContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const formattedDate = format(new Date(date), 'yyyy-MM-dd');

  const [userId, setUserId] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  const loadJournalEntry = useCallback(async (currentUserId) => {
    if (!currentUserId) return;

    const journalRef = doc(db, 'journalInternships', `${currentUserId}_${date}`);
    try {
      const journalDoc = await getDoc(journalRef);

      if (journalDoc.exists()) {
        const data = journalDoc.data();
        setJournalTitle(data.title || '');
        setJournalContent(data.content || '');
        setImageFileName(data.imageUrl ? data.imageUrl.split('/').pop() : '');
        setImage(data.imageUrl || null);
        setIsEditing(false);
      } else {
        setJournalTitle('');
        setJournalContent('');
        setImage(null);
        setImageFileName('');
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error loading journal entry:", error);
      Alert.alert("Error", "Failed to load journal entry. Please try again.");
    }
  }, [date]);

  useEffect(() => {
    const currentUserId = auth.currentUser ? auth.currentUser.uid : null;
    setUserId(currentUserId);

    if (currentUserId) {
      loadJournalEntry(currentUserId);
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [date, fadeAnim, loadJournalEntry]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        setImageFileName(result.assets[0].uri.split('/').pop());
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!journalTitle || !journalContent) {
      Alert.alert('Error', 'Please fill in the title and content.');
      return;
    }
  
    setUploading(true);
    let imageUrl = null;
  
    try {
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const imageRef = ref(storage, `images/${imageFileName}`);
        await uploadBytes(imageRef, blob);
        imageUrl = await getDownloadURL(imageRef);
      }
  
      const journalRef = doc(db, 'journalInternships', `${userId}_${date}`);
      await setDoc(journalRef, {
        userId: userId,
        title: journalTitle,
        content: journalContent,
        date: formattedDate,
        imageUrl: imageUrl || '',
      });
  
      Alert.alert('Success', 'Journal saved successfully!');
      setUploading(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving journal entry: ", error);
      Alert.alert('Error', "Failed to save journal entry. Please try again.");
      setUploading(false);
    }
  };
  
  const handleContentChange = (text) => {
    setPreviousContent(journalContent);
    setJournalContent(text);
  };

  const handleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      Alert.alert('Edit Mode', 'You can now make changes to your journal entry.');
    }
  };

  const handleUndo = () => {
    setJournalContent(previousContent);
    Alert.alert('Undo', 'Changes have been undone.');
  };

  const handleViewImage = () => {
    if (image) {
      setModalVisible(true);
    } else {
      Alert.alert("No Image", "No image has been uploaded yet.");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const journalRef = doc(db, 'journalInternships', `${userId}_${date}`);
              await deleteDoc(journalRef);
              Alert.alert('Success', 'Journal entry deleted successfully!');
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting journal entry: ", error);
              Alert.alert('Error', "Failed to delete journal entry. Please try again.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={[styles.scrollView, { opacity: fadeAnim }]}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Journal Title</Text>
            <TextInput
              placeholder="Enter title here..."
              style={styles.titleInput}
              value={journalTitle}
              onChangeText={setJournalTitle}
              editable={isEditing}
            />

            <Text style={styles.label}>Journal Content</Text>
            <TextInput
              placeholder="Write your thoughts and experiences here..."
              style={styles.contentInput}
              multiline
              numberOfLines={8}
              value={journalContent}
              onChangeText={handleContentChange}
              textAlignVertical="top"
              editable={isEditing}
            />

            <Text style={styles.label}>Journal Image</Text>
            <View style={styles.imageContainer}>
              <TouchableOpacity onPress={pickImage} style={styles.imageIconContainer}>
                {image ? (
                  <TouchableOpacity onPress={handleViewImage}>
                    <Image source={{ uri: image }} style={styles.imageThumbnail} />
                  </TouchableOpacity>
                ) : (
                  <Icon name="image" size={36} color="#023E8A" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleEdit} style={[styles.actionButton, styles.editButton]}>
                <Icon name="edit-2" size={20} color="#fff" />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUndo} style={[styles.actionButton, styles.undoButton]}>
                <Icon name="rotate-ccw" size={20} color="#fff" />
                <Text style={styles.buttonText}>Undo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={[styles.actionButton, styles.deleteButton]}>
                <Icon name="trash-2" size={20} color="#fff" />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, uploading && styles.disabledButton]} 
            onPress={handleSave} 
            disabled={uploading}
          >
            <Text style={styles.saveButtonText}>{uploading ? 'Saving...' : 'Save Journal'}</Text>
          </TouchableOpacity>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Image source={{ uri: image }} style={styles.modalImage} resizeMode="contain" />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Icon name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    color: '#023E8A',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold', // Poppins SemiBold
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#023E8A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    color: '#023E8A',
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold', // Poppins SemiBold
  },
  titleInput: {
    borderColor: '#023E8A',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular', // Poppins Regular
  },
  contentInput: {
    borderColor: '#023E8A',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular', // Poppins Regular
    minHeight: 150,
    textAlignVertical: 'top',
  },
  imageContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  imageIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#023E8A',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#f8f9fa',
    height: 90,
    width: 90,
  },
  imageThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginHorizontal: -4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#023E8A',
  },
  undoButton: {
    backgroundColor: '#023E8A',
  },
  deleteButton: {
    backgroundColor: '#e63946',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'Poppins-SemiBold', // Poppins SemiBold
  },
  saveButton: {
    backgroundColor: '#023E8A',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold', // Poppins SemiBold
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalImage: {
    width: '90%',
    height: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
});


export default JournalCreate_Intern;