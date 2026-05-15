import React, { useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  teal: '#008080',
  gold: '#C5A059',
  bg: '#F5F5F5',
  text: '#333',
};

// --- Profile Card Component ---
export const ProfileCard = ({ name, quickResponder, avatarUri, onPress, isVerified = false }) => {
  const [imageError, setImageError] = useState(false);

  const showImage = !!avatarUri && !imageError;
  const initial = useMemo(() => (name ? name.charAt(0).toUpperCase() : "A"), [name]);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? "Edit profile" : undefined}
    >
      <View style={styles.avatarWrap}>
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

        {onPress ? (
          <View style={styles.editBadge}>
            <MaterialCommunityIcons name="pencil" size={12} color="#fff" />
          </View>
        ) : null}
      </View>
      <View style={styles.nameContainer}>
        <Text style={styles.userName}>{name}</Text>
        {isVerified && (
          <MaterialCommunityIcons
            name="check-decagram"
            size={18}
            color={COLORS.gold}
            style={styles.verifiedBadge}
          />
        )}
      </View>
      {onPress ? <Text style={styles.editHint}>Tap to edit profile</Text> : null}

{ quickResponder && ( 
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#EEF7FF",
            padding: 12,
            borderRadius: 14
          }}>
            <MaterialCommunityIcons
                name="flash"
                size={20}
                color="#007BFF"
            />

            <Text style={{
                marginLeft: 10,
                color: "#007BFF",
                flex: 1
            }}>
                {quickResponder}
            </Text>
          </View>
          )}
              </TouchableOpacity>
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
  avatarWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bg,
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  initial: { fontSize: 20, fontWeight: '700', color: COLORS.teal },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  userName: { fontWeight: 'bold', fontSize: 16, color: COLORS.teal },
  verifiedBadge: {
    marginLeft: 6,
    marginTop: 2,
  },
  editHint: {
    marginTop: 2,
    fontSize: 11,
    color: '#666',
  },
  ratingContainer: { flexDirection: 'row', marginVertical: 4 },
});