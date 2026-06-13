import React from "react";
import { Animated, View, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import colors from "../../../config/colors";
import Text from "../../Text";

export default function AnimatedHeader({ title, onBack, onShare, scrollY, styles: s }) {
  const headerTranslateY = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 180],
        outputRange: [0, -10],
        extrapolate: "clamp",
      })
    : 0;

  const headerScale = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 180],
        outputRange: [1, 0.98],
        extrapolate: "clamp",
      })
    : 1;

  const titleOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 90],
        outputRange: [1, 0.82],
        extrapolate: "clamp",
      })
    : 1;

  const headerShadowOpacity = scrollY
    ? scrollY.interpolate({
        inputRange: [0, 120],
        outputRange: [0.05, 0.18],
        extrapolate: "clamp",
      })
    : 0.1;

  return (
    <Animated.View
      style={[
        s.animatedHeader,
        {
          transform: [{ translateY: headerTranslateY }, { scale: headerScale }],
          shadowOpacity: headerShadowOpacity,
        },
      ]}
    >
      <LinearGradient
        colors={[colors.primaryLight, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.headerGradient}
      >
        <BlurView intensity={80} tint="dark" style={s.headerBlur}>
          <View style={s.headerContent}>
            <TouchableOpacity onPress={onBack} style={s.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Animated.View style={{ flex: 1, opacity: titleOpacity }}>
              <Text style={s.headerTitle} numberOfLines={1}>
                {title}
              </Text>
            </Animated.View>
            <TouchableOpacity onPress={onShare} style={s.headerButton}>
              <Feather name="share-2" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
}
