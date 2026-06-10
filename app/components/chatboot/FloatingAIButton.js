import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AIPopup from './AIPopup';
import colors from '../../config/colors';

export default function FloatingAIButton({ user }) {
  const [visible, setVisible] = useState(false);

  if (!user?.userId) {
    return null;
  }
  
  return (
    <>
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setVisible(true)}
      >
        <MaterialCommunityIcons name="robot" size={28} color={colors.white} />
      </TouchableOpacity>
      
      <AIPopup 
        visible={visible}
        onClose={() => setVisible(false)}
        user={user}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 92,
    right: 20,
    zIndex: 999,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    opacity: 0.88,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});