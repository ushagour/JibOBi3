import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import colors from "../../config/colors";
import ContactSellerForm from "../../components/ContactSellerForm";
import Text from "../../components/Text";
import { Image } from "expo-image";
import routes from "../../navigation/routes";
import Swiper from 'react-native-swiper';
import ImageSlider from "../../components/lists/ImageSlider";
import { Linking } from "react-native"; // Import the Linking API
import AppButton from "../../components/Button";
import listingsApi from "../../api/listings"; // Import the API client

function ListingDetailsScreen({ route, navigation }) {
  const id = route.params;
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        // console.log("Fetching listing with ID:", id);      
        const response = await listingsApi.getDetailListing(id);
        
        if (response.ok) {
          setListing(response.data);
          setError(false);

        } 
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error loading listing.{error}</Text>;
  }

  const openGpsNavigation = (latitude, longitude) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`
    });
    Linking.openURL(url).catch(err => console.error("Error opening GPS navigation app:", err));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <TouchableOpacity
            delayLongPress={500}
            onLongPress={() => navigation.navigate(routes.IMAGE_DETAILS, { imageUrl: listing.imageUrl })}
          >
            {
              listing.images.length > 1 ? (
                <ImageSlider images={listing.images} style={styles.image} />
              ) : (
                <Image
                  style={styles.image}
                  preview={{ uri: listing.images.thumbnailUrl }}
                  tint="light"
                  source={listing.images.url}
                />
              )
            }
          </TouchableOpacity>

          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>{listing.price}</Text>
            <Text style={styles.description}>{listing.description}</Text>

            <ContactSellerForm listing={listing} />
            <AppButton
              title="Navigate to Location"
              onPress={() => openGpsNavigation(listing.latitude, listing.longitude)}
              color="secondary"
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  detailsContainer: {
    padding: 20,
  },
  image: {
    width: "100%",
    height: 200,
  },
  price: {
    color: colors.secondary,
    fontWeight: "bold",
    fontSize: 20,
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    color: colors.medium,
    marginVertical: 10,
  },
  arrow: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    color: colors.medium,
    marginVertical: 10,
  },
});

export default ListingDetailsScreen;
