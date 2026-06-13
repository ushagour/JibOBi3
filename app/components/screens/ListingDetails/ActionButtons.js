import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../../config/colors";
import useTheme from "../../../hooks/useTheme";
import AnimatedInfoCard from "./AnimatedInfoCard";
import Text from "../../Text";

export default function ActionButtons({ 
  onOrder, 
  onContact, 
  onEdit, 
  onClose, 
  onReopen,
  isOwner, 
  isAuthenticated, 
  isSold, 
  isClosed,
  styles: s = {} 
}) {
  const { colors: themeColors } = useTheme();

  // Don't show anything for guests
  if (!isAuthenticated) return null;

  // For Buyers (not owner)
  if (!isOwner) {
    // If listing is sold/closed, show message instead of order button
    if (isSold || isClosed) {
      return (
        <AnimatedInfoCard delay={300} styles={s}>
          <View style={s.actionButtonsContainer}>
            <View style={[s.soldOutContainer, { backgroundColor: themeColors.surface }]}>
              <MaterialCommunityIcons name="sale" size={24} color={colors.danger} />
              <Text style={s.soldOutText}>This item is no longer available</Text>
              {onContact && (
                <TouchableOpacity style={s.contactSellerButton} onPress={onContact}>
                  <Text style={s.contactSellerText}>Contact Seller</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </AnimatedInfoCard>
      );
    }

    // Active listing - show order and contact buttons
    return (
      <AnimatedInfoCard delay={300} styles={s}>
        <View style={s.actionButtonsContainer}>
          {/* Order Now Button */}
          <TouchableOpacity style={s.orderButton} onPress={onOrder}>
            <LinearGradient 
              colors={[colors.primaryDark, colors.primaryLight]} 
              style={s.orderButtonGradient}
            >
              <MaterialCommunityIcons name="shopping" size={22} color="#FFF" />
              <Text style={s.orderButtonText}>Order Now</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Contact Seller Button */}
          {onContact && (
            <TouchableOpacity style={s.messageButton} onPress={onContact}>
              <View style={s.messageButtonContent}>
              <MaterialCommunityIcons name="chat-outline" size={22} color={colors.primary} />
              <Text style={s.messageButtonText}>Message Seller</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </AnimatedInfoCard>
    );
  }

  // For Owners (isOwner = true)
  return (
    <AnimatedInfoCard delay={300} styles={s}>
      <View style={s.actionButtonsContainer}>
        {/* Edit Button - always shown for owners */}
        <TouchableOpacity style={s.editButton} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil" size={20} color={colors.primary} />
          <Text style={s.editButtonText}>Edit Listing</Text>
        </TouchableOpacity>

        {/* Close/Reopen Button based on listing status */}
        {!isSold && !isClosed ? (
          // Active listing - show Close button
          <TouchableOpacity 
            style={s.closeButton} 
            onPress={() => {
              Alert.alert(
                "Close Listing",
                "Are you sure you want to close this listing? It will no longer be visible to buyers.",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Yes, Close", 
                    style: "destructive",
                    onPress: onClose 
                  }
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color={colors.white} />
            <Text style={s.closeButtonText}>Close Listing</Text>
          </TouchableOpacity>
        ) : (
          // Closed/Sold listing - show Reopen button
          <TouchableOpacity 
            style={s.reopenButton} 
            onPress={() => {
              Alert.alert(
                "Reopen Listing",
                "Do you want to reopen this listing? It will become visible to buyers again.",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Yes, Reopen",
                    onPress: onReopen 
                  }
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={colors.success} />
            <Text style={s.reopenButtonText}>Reopen Listing</Text>
          </TouchableOpacity>
        )}

    
      </View>
    </AnimatedInfoCard>
  );
}