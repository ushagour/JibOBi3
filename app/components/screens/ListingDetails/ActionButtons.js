import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
              <Text style={s.soldOutText}>{t("listing_details_screen.item_not_available")}</Text>
              {onContact && (
                <TouchableOpacity style={s.contactSellerButton} onPress={onContact}>
                  <Text style={s.contactSellerText}>{t("listing_details_screen.contact")}</Text>
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
              <Text style={s.orderButtonText}>{t("listing_details_screen.order_now")}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Contact Seller Button */}
          {onContact && (
            <TouchableOpacity style={s.messageButton} onPress={onContact}>
              <View style={s.messageButtonContent}>
              <MaterialCommunityIcons name="chat-outline" size={22} color={colors.primary} />
              <Text style={s.messageButtonText}>{t("listing_details_screen.message_seller")}</Text>
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
          <Text style={s.editButtonText}>{t("listing_details_screen.edit_listing")}</Text>
        </TouchableOpacity>

        {/* Close/Reopen Button based on listing status */}
        {!isSold && !isClosed ? (
          // Active listing - show Close button
          <TouchableOpacity 
            style={s.closeButton} 
            onPress={() => {
              Alert.alert(
                t("listing_details_screen.close_listing_confirmation"),
                t("listing_details_screen.close_listing_message"),
                [
                  { text: t("common.cancel"), style: "cancel" },
                  { 
                    text: t("listing_details_screen.close_listing_confirm"), 
                    style: "destructive",
                    onPress: onClose 
                  }
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="close" size={20} color={colors.white} />
            <Text style={s.closeButtonText}>{t("listing_details_screen.close_listing")}</Text>
          </TouchableOpacity>
        ) : (
          // Closed/Sold listing - show Reopen button
          <TouchableOpacity 
            style={s.reopenButton} 
            onPress={() => {
              Alert.alert(
                t("listing_details_screen.reopen_listing_confirmation"),
                t("listing_details_screen.reopen_listing_message"),
                [
                  { text: t("common.cancel"), style: "cancel" },
                  { 
                    text: t("listing_details_screen.reopen_listing_confirm"),
                    onPress: onReopen 
                  }
                ]
              );
            }}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={colors.success} />
            <Text style={s.reopenButtonText}>{t("listing_details_screen.reopen_listing")}</Text>
          </TouchableOpacity>
        )}

    
      </View>
    </AnimatedInfoCard>
  );
}