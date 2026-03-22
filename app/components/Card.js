import React from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Image } from "expo-image";
import AppText from "./Text";
import theme from "../config/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

function Card({
  title,
  subTitle,
  imageUrl,
  onPress,
  thumbnailUrl,
  ownerName,
  createdAt,
  status,
  categoryName,
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
          <View style={styles.headlineRow}>
            <AppText
              variant="h4"
              color="textPrimary"
              numberOfLines={1}
              style={styles.title}
            >
              {title}
            </AppText>

            <View style={styles.priceBadge}>
              <AppText
                variant="body"
                color="secondaryDark"
                style={styles.price}
              >
                ${typeof subTitle === "number" ? subTitle.toLocaleString() : subTitle}
              </AppText>
            </View>
          </View>

          <View style={styles.metaRow}>
            {!!categoryName && (
              <View style={styles.metaChip}>
                <AppText variant="caption" color="info" style={styles.metaChipText}>
                  {categoryName}
                </AppText>
              </View>
            )}

            {!!status && status !== "Sold Out" && (
              <View style={[styles.metaChip, styles.availableChip]}>
                <AppText variant="caption" color="success" style={styles.metaChipText}>
                  {status}
                </AppText>
              </View>
            )}
          </View>

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
                  numberOfLines={1}
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
  headlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing.md,
  },
  title: {
    fontWeight: "600",
    flex: 1,
  },
  priceBadge: {
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    alignSelf: "flex-start",
  },
  price: {
    fontWeight: "700",
  },
  metaRow: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  metaChip: {
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  availableChip: {
    backgroundColor: theme.colors.successLight,
  },
  metaChipText: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  infoRow: {
    flexDirection: "row",
  
  },
  infoText: {
    marginLeft: theme.spacing.xs,
    flexShrink: 1,
  },
});

export default Card;