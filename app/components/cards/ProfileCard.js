import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Or 'react-native-vector-icons/FontAwesome'

const COLORS = {
  teal: '#008080',
  gold: '#C5A059',
  bg: '#F5F5F5',
  text: '#333',
};

// --- Profile Card Component ---
export const ProfileCard = ({ name, rating, avatarUri }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: avatarUri }} style={styles.avatar} />
      <Text style={styles.userName}>{name}</Text>
      <View style={styles.ratingContainer}>
        {[...Array(5)].map((_, i) => (
          <FontAwesome key={i} name={i < rating ? "star" : "star-o"} size={14} color={COLORS.gold} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8 },
  userName: { fontWeight: 'bold', fontSize: 16, color: COLORS.teal },
  ratingContainer: { flexDirection: 'row', marginVertical: 4 },
});