import React, { useEffect, useRef } from "react";
import { Animated, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "../config/colors";

function AnimatedHeader({
  title,
  subtitle,
  rightAction,
  showBackButton = false,
  onBackPress,
  gradientColors = [colors.primaryDark, colors.primaryLight],
  style,
}) {
  const insets = useSafeAreaInsets();
  const topPadding =
    Platform.OS === "android"
      ? (StatusBar.currentHeight || 0) + 8
      : insets.top > 0
      ? insets.top + 8
      : 12;
  const translateY = useRef(new Animated.Value(-10)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity, transform: [{ translateY }] },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { paddingTop: topPadding }]}
      >
        <View style={styles.row}>
          <View style={styles.leftSide}>
            {showBackButton ? (
              <TouchableOpacity
                onPress={onBackPress}
                activeOpacity={0.8}
                style={styles.backButton}
              >
                <MaterialCommunityIcons name="chevron-left" size={26} color={colors.white} />
              </TouchableOpacity>
            ) : null}

            <View style={styles.textWrap}>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              <Text numberOfLines={1} style={styles.title}>
                {title}
              </Text>
            </View>
          </View>

          {rightAction ? <View style={styles.rightSide}>{rightAction}</View> : null}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    width: "100%",
    marginTop: 0,
    marginBottom: 12,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.16,
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradient: {
    paddingHorizontal: Platform.OS === "ios" ? 18 : 16,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  leftSide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
  },
  rightSide: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AnimatedHeader;