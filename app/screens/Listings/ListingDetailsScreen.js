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
import routes from "../../navigation/routes";
import ImageSlider from "../../components/lists/ImageSlider";
import { Linking } from "react-native"; // Import the Linking API
import AppButton from "../../components/Button";
import listingsApi from "../../api/listings"; // Import the API client
import useAuth from "../../auth/useAuth";
import ActivityIndicator from "../../components/ActivityIndicator";
import MessageBox from "../../components/MessageBox";
import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // Import icons


function ListingDetailsScreen({ route, navigation }) {
  const id = route.params;
    const { user } = useAuth();
  

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
    return <ActivityIndicator visible={loading} />;
  }

  if (error) {
    return <MessageBox message={`Couldn't retrieve the listings ${error}`}  type="success" onPress={() => navigation.goBack()}/>
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
    
           <ImageSlider images={listing.images} style={styles.image} />

          </TouchableOpacity>

          <View style={styles.detailsContainer}>
          <Text style={styles.categories}>{listing.Category.name}</Text>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>$ {listing.price}</Text>
            <Text style={styles.description}>{listing.description}</Text>
          <View style={styles.ownerContainer} > 
             <Ionicons name="person" size={16} color={colors.primary} />
                      <Text style={styles.owner} numberOfLines={1}>
                        {listing.owner.name} 
                      </Text>
                    </View>
            <Text style={styles.location}>
              <MaterialIcons name="location-on" size={16} color={colors.primary} /> {listing.location}
            </Text>
            <Text style={styles.state}>
              <MaterialIcons name="check-circle" size={16} color={colors.success} /> {listing.status}
            </Text>

            {user.userId !== listing.owner.id ? (<ContactSellerForm listing={listing} />) : null}

            <AppButton
              title="Navigate to Location"
              onPress={() => openGpsNavigation(listing.latitude, listing.longitude)}
              color="warning"
            />
            <AppButton
              title="Edit"
              onPress={() => navigation.navigate(routes.LISTING_EDIT, { listing })}
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
  ownerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 10,
    },
    owner: {
      fontSize: 15,
      color: colors.primary,
      marginLeft: 5,
    },
    categories: {
      fontSize: 16,
      color: colors.success,
      marginVertical: 10,
    },
});

export default ListingDetailsScreen;
