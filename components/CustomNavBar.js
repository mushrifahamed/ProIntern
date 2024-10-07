import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const CustomNavBar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.customNavBar}>
      <TouchableOpacity onPress={() => navigation.navigate('HomeRecruit')} style={styles.navItem}>
        <Ionicons name="home-outline" size={24} color="#1976d2" />
        <Text style={styles.customNavItem}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.navItem}>
        <Ionicons name="person-outline" size={24} color="#1976d2" />
        <Text style={styles.customNavItem}>Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Applicants')} style={styles.navItem}>
        <Ionicons name="list-outline" size={24} color="#1976d2" />
        <Text style={styles.customNavItem}>Applicants</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.navItem}>
        <Ionicons name="settings-outline" size={24} color="#1976d2" />
        <Text style={styles.customNavItem}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  customNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingVertical: 10, // Add vertical padding for better spacing
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'absolute', // Ensure it stays at the bottom
    bottom: 0, // Align it at the bottom
    left: 0,
    right: 0,
    elevation: 5, // Add shadow effect
  },
  navItem: {
    alignItems: 'center',
  },
  customNavItem: {
    color: '#1976d2',
    fontSize: 16,
  },
});

export default CustomNavBar;
