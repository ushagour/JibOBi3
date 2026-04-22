import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import colors from "../config/colors";
import Text from "./Text";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import useAuth from "../auth/useAuth";
import AppButton from "./Button";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function ReviewsSection({ reviews, onDeleteReview, isDeletingReview, listingOwnerId }) {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <AntDesign
            key={star}
            name={star <= rating ? "star" : "staro"}
            size={14}
            color={star <= rating ? colors.warning : colors.lightGray}
            style={styles.star}
          />
        ))}
        <Text style={styles.ratingText}>({rating}/5)</Text>
      </View>
    );
  };

  const handleDeleteReview = (reviewId) => {
    if (onDeleteReview) {
      onDeleteReview(reviewId);
    }
  };

  const renderReview = ({ item: review }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={styles.avatarWrapper}>
            {review.User?.avatar ? (
              <Text style={styles.avatar}>
                {review.User.avatar.substring(0, 1).toUpperCase()}
              </Text>
            ) : (
              <MaterialIcons name="person" size={20} color={colors.white} />
            )}
          </View>

          <View style={styles.reviewerDetails}>
            <Text style={styles.reviewerName}>{review.User?.name || "Anonymous"}</Text>
            <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
          </View>
        </View>

        {(user.userId === review.user_id || user.userId === listingOwnerId) && (
          <AppButton
            icon={<MaterialCommunityIcons name="trash-can" size={20} color={colors.white} />}
            onPress={() => handleDeleteReview(review.id)}
            variant="danger"
            size="sm"
            fullWidth={false}
          />
        )}
      </View>

      {renderStars(review.rating)}

      {review.comment && (
        <Text style={styles.reviewComment}>{review.comment}</Text>
      )}
    </View>
  );

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="rate-review" size={40} color={colors.lightGray} />
        <Text style={styles.emptyText}>No reviews yet</Text>
        <Text style={styles.emptySubtext}>Be the first to review this listing!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>
        Reviews ({reviews.length})
      </Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderReview}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  listContent: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderColor: colors.lightGray,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reviewerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatar: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  star: {
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default ReviewsSection;
