import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../../config/colors";
import AnimatedInfoCard from "./AnimatedInfoCard";
import Text from "../../Text";

export default function SellerCard({ seller, onContact, styles: s = {} }) {
  const [isExpanded] = useState(false);

  return (
    <AnimatedInfoCard delay={200} styles={s}>
      <View style={s.sellerCard}>
        <View style={s.sellerHeader}>
          <View style={s.sellerAvatar}>
            <View style={[s.avatarGradient, { backgroundColor: colors.secondary }]}>
              <Text style={s.avatarText}>{seller?.name?.charAt(0) || "U"}</Text>
            </View>
          </View>
          <View style={s.sellerInfo}>
            <Text style={s.sellerName}>{seller?.name || "Unknown Seller"}</Text>
            <View style={s.sellerRating}>
              <MaterialCommunityIcons name="shield-check" size={14} color={colors.secondary} />
              <Text style={s.sellerBadge}>Verified Member</Text>
            </View>
          </View>
          {typeof onContact === "function" ? (
            <TouchableOpacity style={s.contactButton} onPress={onContact}>
              <LinearGradient colors={[colors.secondary, colors.secondaryDark]} style={s.contactButtonGradient}>
                <MaterialCommunityIcons name="chat-processing" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </AnimatedInfoCard>
  );
}
