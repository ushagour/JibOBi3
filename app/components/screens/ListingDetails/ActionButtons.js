import React from "react";
import { View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../../config/colors";
import useTheme from "../../../hooks/useTheme";
import AnimatedInfoCard from "./AnimatedInfoCard";
import Text from "../../Text";

export default function ActionButtons({ onOrder, onContact, onEdit, isOwner, isAuthenticated, isSold, styles: s = {} }) {
  const { colors: themeColors } = useTheme();
  return (
    <AnimatedInfoCard delay={300} styles={s}>
      <View style={s.actionButtonsContainer}>
        {!isOwner && isAuthenticated && !isSold && (
          <TouchableOpacity style={s.orderButton} onPress={onOrder}>
            <LinearGradient colors={[colors.primaryDark, colors.primaryLight]} style={s.orderButtonGradient}>
              <MaterialCommunityIcons name="shopping" size={22} color="#FFF" />
              <Text style={s.orderButtonText}>Order Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {isOwner && (
          <TouchableOpacity style={[s.editButtonIcon, { backgroundColor: themeColors.surface }]} onPress={onEdit}>
            <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </AnimatedInfoCard>
  );
}
