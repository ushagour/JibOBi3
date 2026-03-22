import React from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Image } from "expo-image";
import AppText from "./Text";
import theme from "../config/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import Spacer from "./Spacer";

function Card({
  title,
  subTitle,
  imageUrl,
  onPress,
  thumbnailUrl,
  ownerName,
  createdAt,
  status,
  coordinates,
}) 



{
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[styles.card, theme.shadows.md]}>
        {/* Image with Status Overlay */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            tint="light"
            preview={{ uri: thumbnailUrl }}
            source={imageUrl}
          />
          {status === "Sold Out" && (
            <View style={styles.statusBadge}>
              <AppText
                variant="overline"
                color="white"
              >
                {status}
              </AppText>
            </View>
          )}
        </View>

        {/* Details Container */}
        <View style={styles.detailsContainer}>
          {/* Title and Price */}
          <AppText
            variant="h4"
            color="textPrimary"
            numberOfLines={1}
            style={styles.title}
          >
            {title}
          
          </AppText>

          <AppText
            variant="bodyLarge"
            color="secondary"
            style={styles.price}
          >
            ${typeof subTitle === 'number' ? subTitle.toLocaleString() : subTitle}
          </AppText>

          <Spacer size="md" />

          {/* Extra Information */}
          <View style={styles.infoContainer}>
            {/* Date */}
            {createdAt && (
              <View style={styles.infoRow}>
                <MaterialIcons
                  name="date-range"
                  size={14}
                  color={theme.colors.textTertiary}
                />
                <AppText
                  variant="caption"
                  color="textTertiary"
                  style={styles.infoText}
                >
                  {createdAt}
                </AppText>
              </View>
            )}

            {/* Owner */}
            {ownerName && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="person"
                  size={14}
                  color={theme.colors.primary}
                />
                <AppText
                  variant="caption"
                  color="primary"
                  numberOfLines={1}
                  style={styles.infoText}
                >
                  {ownerName}
                </AppText>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing["3xl"],
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    backgroundColor: theme.colors.lightGray,
  },
  image: {
    width: "100%",
    height: 200,
  },
  statusBadge: {
    position: "absolute",
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: "rgba(255, 82, 82, 0.9)",
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  detailsContainer: {
    padding: theme.spacing.lg,
  },
  title: {
    fontWeight: "600",
  },
  price: {
    fontWeight: "700",
    marginTop: theme.spacing.sm,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: theme.spacing.xs,
  },
});

export default Card;