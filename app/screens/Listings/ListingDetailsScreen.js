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
  Modal,
  FlatList,
} from "react-native";
import colors from "../../config/colors";
import ContactSellerForm from "../../components/ContactSellerForm";
import Text from "../../components/Text";
import Screen from "../../components/Screen";
import routes from "../../navigation/routes";
import ImageSlider from "../../components/lists/ImageSlider";
import { Linking } from "react-native"; // Import the Linking API
import AppButton from "../../components/Button";
import listingsApi from "../../api/listings"; // Import the API client
import reviewsApi from "../../api/reviews"; // Import the reviews API client
import useAuth from "../../auth/useAuth";

import ActivityIndicator from "../../components/ActivityIndicator";
import ErrorStateScreen from "../../components/ErrorStateScreen";
import ReviewsSection from "../../components/ReviewsSection"; // Import the reviews component
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"; // Import icons
import { getLocationName } from "../../utility/geocode"; // Import the geocoding function
import { FontAwesome } from '@expo/vector-icons'; // Or 'react-native-vector-icons/FontAwesome'


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
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("spam");

  const reportReasons = [
    { id: "spam", label: "Spam or misleading" },
    { id: "scam", label: "Suspicious or scam listing" },
    { id: "prohibited", label: "Prohibited item or service" },
    { id: "duplicate", label: "Duplicate or irrelevant listing" },
    { id: "other", label: "Other issue" },
  ];


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

        const response = await reviewsApi.getReviewsByListing(id);
        console.log(response);
        
        if (response.ok && response.data) {
          console.log("Fetched reviews:", response.data); // Debug log
          setReviews(response.data);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error.message);
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
    const normalizedError = String(error || "");
    const errorType = /404|not\s*found/i.test(normalizedError)
      ? "notFound"
      : "server";

    return (
      <ErrorStateScreen
        type={errorType}
        title={errorType === "notFound" ? "Listing not found" : "Unable to load details"}
        message="Please try again or go back to listings."
        details={normalizedError}
        onRetry={() => navigation.replace(routes.LISTING_DETAILS, id)}
        onGoBack={() => navigation.goBack()}
        backVariant="primary"
        backSize="lg"
      />
    );
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

  const openWhatsApp = async () => {
    const rawPhone = listing?.owner?.phone;

    if (!rawPhone) {
      Alert.alert("WhatsApp unavailable", "The seller has not provided a phone number.");
      return;
    }

    const phoneNumber = String(rawPhone).replace(/\D/g, "");
    const message = encodeURIComponent(`Hello ${listing.owner?.name || "seller"}, I am interested in your listing: ${listing.title}`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    try {
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
        return;
      }

      Alert.alert("WhatsApp unavailable", "WhatsApp is not installed or the link cannot be opened.");
    } catch (err) {
      console.error("Error opening WhatsApp:", err);
      Alert.alert("Error", "Unable to open WhatsApp.");
    }
  };

  const openReportModal = () => {
    setSelectedReportReason("spam");
    setReportModalVisible(true);
  };

  const submitReport = () => {
    const reason = reportReasons.find((item) => item.id === selectedReportReason);
    setReportModalVisible(false);
    Alert.alert(
      "Report submitted",
      `Thanks. We received your report for: ${reason?.label || "this listing"}.`
    );
  };

  return (
    <Screen scrollable={false} paddingSize="none">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.contentContainer}>
              <View style={styles.ownerInfoRow}>
                <Ionicons name="person" size={13} color={colors.secondary} />
                <Text style={styles.ownerNameText} numberOfLines={1}>
                  {listing.owner?.name || "Unknown owner"}
                </Text>
              </View>
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
              {listing.rating !== undefined && (
                <View style={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <FontAwesome key={i} name={i < listing.rating ? "star" : "star-o"} size={10} color={COLORS.gold} />
                  ))}
                </View>
              )}
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
             

              <View style={[styles.infoRow, styles.descriptionInfoRow]}>
                <MaterialIcons name="notes" size={16} color={colors.darkGray} />
                <View style={styles.descriptionInfoTextWrap}>
                  <Text style={styles.infoLabel}>Description</Text>
                  <Text style={styles.infoDescription} numberOfLines={4}>
                    {listing.description || "No description provided."}
                  </Text>
                </View>
              </View>


           

              <View style={styles.infoRow}>
                <MaterialIcons name="location-on" size={16} color={colors.dark} />
                <Text style={styles.infoText} numberOfLines={1}>
                  {locationName}
                </Text>
              </View>
            </View>

            <ReviewsSection 
              reviews={reviews} 
              onDeleteReview={handleDeleteReview}
              isDeletingReview={isDeletingReview}
              listingOwnerId={listing.owner?.id}
            />
        

       

            {user.userId !== listing.owner.id ? (
              <View style={styles.contactSection}>
                <Text style={styles.sectionLabel}>Contact Seller</Text>
                <ContactSellerForm listing={listing} />
                <AppButton
                  title="Contact via WhatsApp"
                  onPress={openWhatsApp}
                  variant="success"
                  size="md"
                  icon={<MaterialCommunityIcons name="whatsapp" size={18} color={colors.white} />}
                />
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
                  <AppButton
                    title="Report"
                    onPress={openReportModal}
                    variant="danger"
                    size="md"
                    fullWidth={false}
                  />
              )}
            </View>

            <Modal
              visible={reportModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setReportModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={() => setReportModalVisible(false)}>
                  <View style={styles.modalBackdrop} />
                </TouchableWithoutFeedback>

                <View style={styles.reportModalCard}>
                  <Text style={styles.reportModalTitle}>Report listing</Text>
                  <Text style={styles.reportModalSubtitle}>
                    Choose the reason that best matches the issue.
                  </Text>

                  <FlatList
                    data={reportReasons}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.reportReasonList}
                    renderItem={({ item }) => {
                      const selected = item.id === selectedReportReason;

                      return (
                        <TouchableOpacity
                          style={[
                            styles.reportReasonItem,
                            selected && styles.reportReasonItemSelected,
                          ]}
                          onPress={() => setSelectedReportReason(item.id)}
                          activeOpacity={0.85}
                        >
                          <View style={styles.reportReasonTextWrap}>
                            <Text style={styles.reportReasonLabel}>{item.label}</Text>
                            <Text style={styles.reportReasonHint}>
                              Mark this if it best describes the problem.
                            </Text>
                          </View>
                          <MaterialIcons
                            name={selected ? "radio-button-checked" : "radio-button-unchecked"}
                            size={22}
                            color={selected ? colors.danger : colors.mediumGray}
                          />
                        </TouchableOpacity>
                      );
                    }}
                  />

                  <View style={styles.reportModalActions}>
                    <AppButton
                      title="Cancel"
                      onPress={() => setReportModalVisible(false)}
                      variant="outline"
                      size="sm"
                      fullWidth={false}
                    />
                    <AppButton
                      title="Submit report"
                      onPress={submitReport}
                      variant="danger"
                      size="sm"
                      fullWidth={false}
                    />
                  </View>
                </View>
              </View>
            </Modal>



          </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    paddingTop: 0,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  image: {
    width: "100%",
    height: 176,
  },
  price: {
    color: colors.secondary,
    fontWeight: "bold",
    fontSize: 22,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 8,
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
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: colors.infoLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryText: {
    color: colors.info,
    fontSize: 11,
    fontWeight: "700",
  },
  stateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 10,
    fontWeight: "700",
  },
  priceRow: {
    marginTop: 6,
    marginBottom: 8,
  },
  infoPanel: {
    backgroundColor: colors.lighterGray,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  ownerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 8,
    right: 10,
    zIndex: 5,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ownerNameText: {
    fontSize: 11,
    color: colors.textPrimary,
    marginLeft: 4,
    maxWidth: 160,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  infoText: {
    fontSize: 13,
    color: colors.textPrimary,
    marginLeft: 6,
    flex: 1,
  },
  descriptionInfoRow: {
    alignItems: "flex-start",
  },
  descriptionInfoTextWrap: {
    flex: 1,
    marginLeft: 6,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoDescription: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    marginTop: 1,
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
    fontSize: 12,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  contactSection: {
    marginTop: 10,
  },
  actionSection: {
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  reportModalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 20,
  },
  reportModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  reportModalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  reportReasonList: {
    marginTop: 16,
  },
  reportReasonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: colors.lighterGray,
  },
  reportReasonItemSelected: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  reportReasonTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  reportReasonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  reportReasonHint: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },
  reportModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },

});

export default ListingDetailsScreen;
