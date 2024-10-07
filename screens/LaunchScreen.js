import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const LaunchScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/ProIntern.png')} // Adjust the path as necessary
        style={styles.logo}
      />
      <Text style={styles.title}>Pro Intern</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // White background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150, // Adjust the width as necessary
    height: 150, // Adjust the height as necessary
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000', // Adjust text color as needed
  },
});

export default LaunchScreen;
