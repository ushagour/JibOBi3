import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated, PanResponder } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AIPopup from './AIPopup';
import colors from '../../config/colors';

export default function FloatingAIButton({ user }) {
  const [visible, setVisible] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(null);

  useEffect(() => {
    const userId = user?.id || user?.userId;
    // console.log('🤖 [FLOATING BUTTON] Initialized with user:', {
    //   userId,
    //   userName: user?.name,
    //   hasUser: !!userId,
    // });
  }, [user]);

  useEffect(() => {
    // Setup pan responder for swipe gestures
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Allow vertical movement visual feedback
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Swipe down or swipe left to hide
        if (gestureState.dy > 80 || gestureState.dx < -80) {
          // Hide animation
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => setIsHidden(true));
        } else {
          // Reset to original position
          Animated.spring(translateY, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    });

    // Enter animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!user?.userId && !user?.id) {
    return null;
  }

  // Show button after popup closes if it was hidden
  const handlePopupClose = () => {
    setVisible(false);
    if (isHidden) {
      // Re-show button with animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start(() => setIsHidden(false));
    }
  };

  if (isHidden && !visible) {
    return null;
  }
  
  return (
    <>
      {/* Floating Button */}
      <Animated.View
        {...(panResponder.current?.panHandlers || {})}
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY },
            ],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            console.log('👆 [FLOATING BUTTON] Clicked - Opening modal');
            setVisible(true);
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="robot" size={28} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Modal - Rendered separately to ensure it appears on top */}
      {visible && (
        <AIPopup 
          visible={visible}
          onClose={handlePopupClose}
          user={user}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 92,
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    opacity: 0.88,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});