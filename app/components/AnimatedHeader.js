import React, { useRef } from "react";
import { Animated, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useTheme from "../hooks/useTheme";
import colors from "../config/colors";



function AnimatedHeader({
  title,
  subtitle,
  rightAction,
  showBackButton = false,
  onBackPress,
  scrollY,
  gradientColors = [colors?.primaryLight, colors?.primary],
}) {
  const insets = useSafeAreaInsets();
  const { colors: themeColors, isDark } = useTheme();
  const topPadding =
    Platform.OS === "android"
      ? (StatusBar.currentHeight || 0) + 8
      : insets.top > 0
      ? insets.top + 8
      : 12;

  // Use scroll-based animations if scrollY is provided
  const animatedOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 100, 150],
        outputRange: [1, 0.5, 0],
        extrapolate: "clamp",
      })
    : useRef(new Animated.Value(1)).current;

  const animatedTranslateY = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, -100],
        extrapolate: "clamp",
      })
    : useRef(new Animated.Value(0)).current;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: animatedOpacity, transform: [{ translateY: animatedTranslateY }] },
      ]}
    >
      <LinearGradient
        colors={isDark ? ['#1a1a2e', '#16213e'] : [themeColors?.primaryDark , themeColors?.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <BlurView   intensity={20} tint="light"  style={[styles.headerBlur, { paddingTop: topPadding }]}>
          <View style={styles.row}>
            <View style={styles.leftSide}>
              {showBackButton ? (
                <TouchableOpacity onPress={onBackPress} activeOpacity={0.8} style={styles.headerButton}>
                  <MaterialCommunityIcons name="chevron-left" size={24} color={colors.white} />
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
        </BlurView>
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: Platform.OS === "ios" ? "hidden" : "visible",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 20,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  gradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerBlur: {
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSide: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    marginRight: 12,
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
    fontSize: 18,
    fontWeight: "600",
  },
  rightSide: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AnimatedHeader;