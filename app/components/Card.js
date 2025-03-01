import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Image } from "expo-image";
import Text from "./Text";
import colors from "../config/colors";
import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // Import icons
import { getLocationName } from "../utility/geocode"; // Import the geocoding function

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
}) {


  const [locationName, setLocationName] = useState("Loading...");

  useEffect(() => {
    if (coordinates) {
      // Fetch the location object(data) 
      // containes the address details{in the card componnets we need just resiedential} from the coordinates 
      getLocationName(coordinates.latitude, coordinates.longitude).then((data) => {
        if (data.city) {
          setLocationName(data.city);
        } else {
          setLocationName("Unknown Location");
        }
      });
    }
  }, [coordinates]);

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.card}>
        {/* Image with Sold Out Overlay */}
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            tint="light"
            preview={{ uri: thumbnailUrl }}
            source={imageUrl}
          />
          {status === "Sold Out" && (
            <View style={styles.soldOutOverlay}>
              <Text style={styles.soldOutText}>{status}</Text>
            </View>
          )}
        </View>

        {/* Details Container */}
        <View style={styles.detailsContainer}>

          {/* Location */}
          {coordinates && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color="#333" />
                <Text style={styles.location} numberOfLines={2}>
                  {locationName}
                </Text>
              </View>
            )}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subTitle} numberOfLines={1}>
            {subTitle}
          </Text>

          {/* Extra Information */}
          <View style={styles.extraInfo}>
            {/* Owner */}
            <View style={styles.infoRow}>
              <Ionicons name="person" size={16} color={colors.primary} />
              <Text style={styles.owner} numberOfLines={1}>
                {ownerName || "Unknown"}
              </Text>
            </View>

          

        
                  {/* Date */}
                  <View style={styles.dateRow} >
                      <MaterialIcons name="date-range" size={16} color={colors.medium} />
                      <Text style={styles.date} numberOfLines={1}>
                        {createdAt || "N/A"}
                      </Text>
                    </View>

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
  },
  soldOutOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  soldOutText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    marginBottom: 7,
    fontSize: 27,
    fontWeight: "600",
    marginBottom: 7,
    color: colors.dark,
  },
  subTitle: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "bold",
    marginBottom: 10,
  },
  extraInfo: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "right",
    justifyContent: "flex-end",
  },
  owner: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 5,
  },
  date: {
    fontSize: 14,
    color: colors.medium,
    marginLeft: 5,
  },
  location: {
    fontSize: 14,
    color: "#333",
    marginLeft: 3,
  },
});

export default Card;