import React from "react";
import { Alert, Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Yup from "yup";
import { useFormikContext } from "formik";

import colors from "../config/colors";
import Text from "./Text";
import reviewsApi from "../api/reviews";
import useAuth from "../auth/useAuth";
import { Form, FormField, SubmitButton } from "./forms";


function RatingSelector() {
  const { values, setFieldValue } = useFormikContext();
  const selectedRating = values.rating || 0;

  return (
    <View style={styles.ratingBlock}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((rating) => {
          const selected = rating <= selectedRating;

          return (
            <TouchableOpacity
              key={rating}
              onPress={() => setFieldValue("rating", rating)}
              activeOpacity={0.8}
              style={styles.starButton}
            >
              <MaterialIcons
                name={selected ? "star" : "star-border"}
                size={28}
                color={selected ? colors.warning : colors.mediumGray}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.ratingHint}>
        Tap a star to choose how you feel about the listing.
      </Text>
    </View>
  );
}

function AddReviewForm({ listing, onSuccess }) {
  const { user } = useAuth();

  const handleSubmit = async ({ rating, content }, { resetForm }) => {
    Keyboard.dismiss();

    const userId = user?.userId ?? user?.id;

    if (!userId) {
      Alert.alert("Error", "You need to be signed in to submit a review.");
      return;
    }

    const result = await reviewsApi.createReview({
      content,
      rating,
      userId,
      listingId: listing.id,
    });

    if (!result.ok) {
      Alert.alert("Error", "Could not submit your review.");
      return;
    }

    resetForm();
    Alert.alert("Success", "Your review has been posted.");

    if (onSuccess) {
      onSuccess(result.data);
    }
  };

  return (
    <Form
      initialValues={{ rating: 0, content: "" }}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
    >
      <RatingSelector />

      <FormField
        maxLength={500}
        multiline
        name="content"
        numberOfLines={4}
        placeholder="Write your review..."
      />

      <SubmitButton title="Submit Review" />
    </Form>
  );
}

const validationSchema = Yup.object().shape({
  rating: Yup.number().required().min(1, "Please choose a rating."),
  content: Yup.string().required().min(1).label("Review"),
});

const styles = StyleSheet.create({
  ratingBlock: {
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  starButton: {
    paddingRight: 8,
    paddingVertical: 4,
  },
  ratingHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

export default AddReviewForm;