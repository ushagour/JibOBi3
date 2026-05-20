import React from "react";
import { Animated, View, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import colors from "../../../config/colors";
import Text from "../../Text";

export default function AnimatedHeader({ title, onBack, onShare, styles: s }) {
  return (
    <Animated.View style={[s.animatedHeader]}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={s.headerGradient}
      >
        <BlurView intensity={80} tint="dark" style={s.headerBlur}>
          <View style={s.headerContent}>
            <TouchableOpacity onPress={onBack} style={s.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={s.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            <TouchableOpacity onPress={onShare} style={s.headerButton}>
              <Feather name="share-2" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
}
