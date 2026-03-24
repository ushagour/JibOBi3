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
  Alert,
} from "react-native";
import colors from "../../config/colors";
import ContactSellerForm from "../../components/ContactSellerForm";
import Text from "../../components/Text";
import routes from "../../navigation/routes";
import ImageSlider from "../../components/lists/ImageSlider";
import { Linking } from "react-native"; // Import the Linking API
import AppButton from "../../components/Button";
import listingsApi from "../../api/listings"; // Import the API client
import {getReviewsByListing} from "../../api/reviews"; // Import the reviews API client
import useAuth from "../../auth/useAuth";

import ActivityIndicator from "../../components/ActivityIndicator";
import MessageBox from "../../components/MessageBox";
import ReviewsSection from "../../components/ReviewsSection"; // Import the reviews component
import { Ionicons, MaterialIcons } from "@expo/vector-icons"; // Import icons
import { getLocationName } from "../../utility/geocode"; // Import the geocoding function


function ListingDetailsScreen({ route, navigation }) {
  const id = route.params;
    const { user,isOwner } = useAuth();


  

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
 const [locationName, setLocationName] = useState("Loading...");


  useEffect(() => {
      
    const fetchListing = async () => {
      try {
        // console.log("Fetching listing with ID:", id);      
        const response = await listingsApi.getDetailListing(id);
        if (!response.ok || !response.data) {
          throw new Error("Failed to fetch listing details.");
        }
        if (response.ok) {
          setListing(response.data);
          // const { latitude, longitude } = response.data;
          
          
          const { latitude, longitude } = response.data;//first extract {coordiates } from the response 
          const location = await getLocationName(latitude, longitude); //then send them to the await function of getLocationName and the result is stored in location
          setLocationName(location.city); 
          
          setError(false);

        } 



      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await getReviewsByListing(id);
        if (response.ok && response.data) {
          console.log("Fetched reviews:", response.data); // Debug log
          setReviews(response.data);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchListing();
    fetchReviews();
    
  
  }, [id]);





  if (loading) {
    return <ActivityIndicator visible={loading} />;
  }

  if (error) {
    return <MessageBox message={`Couldn't retrieve the listings ${error}`}  type="error" onPress={(navigation) => navigation.goBack()}/>
  }


   const handleDelete = (listing) => {
      Alert.alert(
        "Delete Confirmation",
        `Are you sure you want to delete this ${listing.title}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              try {
                console.log(`Attempting to delete listing with ID: ${listing.id}`);
                const response = await listingsApi.deleteListing(listing.id);
                if (!response.ok) {
                  console.error("Failed to delete listing:", response);
                  return Alert.alert("Error", "Failed to delete listing.");
                }
                navigation.navigate(routes.LISTINGS);
                Alert.alert("Success", "Listing deleted successfully.");
              } catch (error) {
                Alert.alert("Error", "Failed to delete listing.");
                console.error("Failed to delete listing:", error);
              }
            },
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    };

    const handleDeleteReview = async (reviewId) => {
      Alert.alert(
        "Delete Review",
        "Are you sure you want to delete this review?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: async () => {
              try {
                setIsDeletingReview(true);
                const response = await reviewsApi.deleteReview(reviewId);
                if (!response.ok) {
                  Alert.alert("Error", "Failed to delete review.");
                  return;
                }
                // Remove the review from the list
                setReviews(reviews.filter(r => r.id !== reviewId));
                Alert.alert("Success", "Review deleted successfully.");
              } catch (error) {
                Alert.alert("Error", "Failed to delete review.");
                console.error("Failed to delete review:", error);
              } finally {
                setIsDeletingReview(false);
              }
            },
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    };
  

  // Open native maps app with a robust fallback URL.
  const openGpsNavigation = async (latitude, longitude) => {
    const nativeUrl = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });

    const webFallback = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    try {
      const canOpenNative = await Linking.canOpenURL(nativeUrl);
      if (canOpenNative) {
        await Linking.openURL(nativeUrl);
        return;
      }
      await Linking.openURL(webFallback);
    } catch (err) {
      console.error("Error opening GPS navigation app:", err);
    }
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
            <View style={styles.metaHeaderRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {listing.Category?.name || "Uncategorized"}
                </Text>
              </View>
              {!!listing.state && (
                <View
                  style={[
                    styles.stateBadge,
                    listing.state === "Sold Out"
                      ? styles.stateBadgeSold
                      : styles.stateBadgeAvailable,
                  ]}
                >
                  <Text style={styles.stateText}>{listing.state}</Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{listing.title}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>$ {listing.price}</Text>
            </View>

            <View style={styles.infoPanel}>
              <View style={styles.infoRow}>
                <Ionicons name="person" size={16} color={colors.primary} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {listing.owner?.name || "Unknown owner"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="location-on" size={16} color={colors.dark} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {locationName}
                </Text>
              </View>
            </View>

            <View style={styles.mapWrapper}>
              <View style={styles.mapHeaderRow}>
                <View style={styles.mapIconWrap}>
                  <MaterialIcons name="map" size={18} color={colors.primary} />
                </View>
                <View style={styles.mapHeaderTextWrap}>
                  <Text style={styles.mapTitle}>Location & Navigation</Text>
                  <Text style={styles.mapSubtitle} numberOfLines={1}>
                    {locationName}
                  </Text>
                </View>
              </View>

              <View style={styles.mapButtonWrap}>
                <AppButton
                  title="Open in Maps"
                  onPress={() => openGpsNavigation(listing.latitude, listing.longitude)}
                  variant="primary"
                  size="sm"
                  fullWidth={false}
                />
              </View>
            </View>

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>

            <ReviewsSection 
              reviews={reviews} 
              onDeleteReview={handleDeleteReview}
              isDeletingReview={isDeletingReview}
            />
        

             <Text style={styles.state}>
            {listing.status}
            
            {listing.state && listing.state !== "Sold Out" ? (
                <MaterialIcons name="check-circle" size={16} color={colors.success} />
              ) : (
                <MaterialIcons name="close" size={20} color={colors.danger} />
              ) }
            </Text> 

            {user.userId !== listing.owner.id ? (
              <View style={styles.contactSection}>
                <Text style={styles.sectionLabel}>Contact Seller</Text>
                <ContactSellerForm listing={listing} />
              </View>
            ) : null}

            <View style={styles.actionSection}>
              {isOwner(listing.owner.id) && (
                <View style={styles.actionButtonsRow}>
                  <AppButton
                    title="Edit"
                    onPress={() => navigation.navigate(routes.LISTING_EDIT, { listing })}
                    variant="secondary"
                    size="sm"
                    fullWidth={false}
                  />

                  <AppButton
                    title="Delete"
                    onPress={() => handleDelete(listing)}
                    variant="danger"
                    size="sm"
                    fullWidth={false}
                  />
                </View>
              )}

              {!isOwner(listing.owner.id) && (
                <View style={styles.actionButtonsRow}>
                  <AppButton
                    title="Report"
                    onPress={() => alert("Report", "This listing has been reported.")}
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                  />
                </View>
              )}
            </View>



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
    paddingBottom: 30,
  },
  image: {
    width: "100%",
    height: 200,
  },
  price: {
    color: colors.secondary,
    fontWeight: "bold",
    fontSize: 26,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginTop: 8,
  },
  arrow: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  metaHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: colors.infoLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  categoryText: {
    color: colors.info,
    fontSize: 12,
    fontWeight: "700",
  },
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  stateBadgeAvailable: {
    backgroundColor: colors.successLight,
  },
  stateBadgeSold: {
    backgroundColor: colors.dangerLight,
  },
  stateText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "700",
  },
  priceRow: {
    marginTop: 8,
    marginBottom: 12,
  },
  infoPanel: {
    backgroundColor: colors.lighterGray,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: 8,
    flex: 1,
  },
  descriptionSection: {
    marginBottom: 8,
  },
  mapWrapper: {
    marginBottom: 14,
    backgroundColor: colors.surface,
    borderColor: colors.lightGray,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  mapHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mapIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.infoLight,
    marginRight: 10,
  },
  mapHeaderTextWrap: {
    flex: 1,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  mapSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  mapButtonWrap: {
    marginTop: 10,
    alignItems: "flex-start",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  contactSection: {
    marginTop: 16,
  },
  actionSection: {
    marginTop: 6,
  },
  actionButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },

});

export default ListingDetailsScreen;
