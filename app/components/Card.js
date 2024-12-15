import React from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Image } from "expo-image";
import Text from "./Text";
import colors from "../config/colors";

function Card({ 
  title, 
  subTitle, 
  imageUrl, 
  onPress, 
  thumbnailUrl, 
  ownerName, 
  createdAt 
}) {

  
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.card}>
        <Image
          style={styles.image}
          tint="light"
          preview={{ uri: thumbnailUrl }}
          source={imageUrl} // Use source instead of uri
        />
        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subTitle} numberOfLines={2}>
            {subTitle}
          </Text>

          {/* New Information */}
          <View style={styles.extraInfo}>
            <Text style={styles.owner} numberOfLines={1}>
              Owner: {ownerName || "Unknown"}
            </Text>
            <Text style={styles.date} numberOfLines={1}>
              Created at: {createdAt || "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    backgroundColor: colors.white,
    marginBottom: 20,
    overflow: "hidden",
  },
  detailsContainer: {
    padding: 20,
  },
  image: {
    width: "100%",
    height: 200,
  },
  subTitle: {
    color: colors.secondary,
    fontWeight: "bold",
  },
  title: {
    marginBottom: 7,
    fontSize: 18,
    fontWeight: "600",
  },
  extraInfo: {
    marginTop: 10,
  },
  owner: {
    fontSize: 14,
    color: colors.primary,
  },
  date: {
    textAlign: "right",
    fontSize: 14,
    color: colors.medium,
  },
});

export default Card;
