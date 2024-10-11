import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ImageBackground, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, MapPin, Book, ChevronRight } from 'lucide-react-native';

const JournalHome_Intern = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1000&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(2, 62, 138, 0.9)', 'rgba(2, 62, 138, 0.7)']}
          style={styles.gradient}
        >
          {/* Header section */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.menuButton}>
              <Menu color="#ffffff" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Internship Journal</Text>
          </View>

          {/* Content Section */}
          <View style={styles.contentContainer}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.subText}>Continue your internship journey</Text>

            {/* Buttons Section */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('JournalRoadMap_Intern')}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIconContainer}>
                    <MapPin color="#023E8A" size={24} />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonText}>View Roadmap</Text>
                    <Text style={styles.buttonSubText}>Track your progress</Text>
                  </View>
                  <ChevronRight color="#023E8A" size={24} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('JournalPage_Intern')}
              >
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIconContainer}>
                    <Book color="#023E8A" size={24} />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonText}>View Journal</Text>
                    <Text style={styles.buttonSubText}>Read your entries</Text>
                  </View>
                  <ChevronRight color="#023E8A" size={24} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footerText}>Reflect, Learn, Grow</Text>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#023E8A',
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  menuButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold', // Poppins SemiBold
    marginLeft: 15,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    color: '#ffffff',
    fontSize: 32,
    fontFamily: 'Poppins-SemiBold', // Poppins SemiBold
    textAlign: 'center',
    marginBottom: 10,
  },
  subText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Poppins-Regular', // Poppins Regular
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    marginVertical: 10,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  buttonIconContainer: {
    backgroundColor: 'rgba(2, 62, 138, 0.1)',
    borderRadius: 8,
    padding: 8,
  },
  buttonTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  buttonText: {
    color: '#023E8A',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold', // Poppins SemiBold
  },
  buttonSubText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Poppins-Regular', // Poppins Regular
  },
  footerText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular', // Poppins Regular
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default JournalHome_Intern;