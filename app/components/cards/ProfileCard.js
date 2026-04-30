import React, { useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Or 'react-native-vector-icons/FontAwesome'

const COLORS = {
  teal: '#008080',
  gold: '#C5A059',
  bg: '#F5F5F5',
  text: '#333',
};

// --- Profile Card Component ---
export const ProfileCard = ({ name, rating, avatarUri, onPress }) => {
  const [imageError, setImageError] = useState(false);

  const showImage = !!avatarUri && !imageError;
  const initial = useMemo(() => (name ? name.charAt(0).toUpperCase() : "A"), [name]);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole="button"
        accessibilityLabel="Edit profile image"
      >
        {showImage ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatar}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.initial}>{initial}</Text>
          </View>
        )}
      </TouchableOpacity>
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
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
  initial: { fontSize: 20, fontWeight: '700', color: COLORS.teal },
  userName: { fontWeight: 'bold', fontSize: 16, color: COLORS.teal },
  ratingContainer: { flexDirection: 'row', marginVertical: 4 },
});