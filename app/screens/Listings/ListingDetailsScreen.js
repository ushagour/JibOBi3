import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
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
import Text from "../../components/Text";
import routes from "../../navigation/routes";
import ImageSlider from "../../components/lists/ImageSlider";
import { Linking } from "react-native"; // Import the Linking API
import AppButton from "../../components/Button";
import listingsApi from "../../api/listings"; // Import the API client
import reviewsApi from "../../api/reviews"; // Import the reviews API client
import useAuth from "../../auth/useAuth";

import ActivityIndicator from "../../components/ActivityIndicator";
import ErrorStateScreen from "../../components/ErrorStateScreen";
import AddReviewForm from "../../components/AddReviewForm";
import ReviewsSection from "../../components/ReviewsSection"; // Import the reviews component
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"; // Import icons
import { getLocationName } from "../../utility/geocode"; // Import the geocoding function
import { FontAwesome } from '@expo/vector-icons'; // Or 'react-native-vector-icons/FontAwesome'


function ListingDetailsScreen({ route, navigation }) {
  const routeParams = route.params;
  const id = routeParams?.listing?.id ?? routeParams?.id ?? routeParams;
  const { user, isOwner } = useAuth();
  const isAuthenticated = Boolean(user?.userId);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [isDeletingListing, setIsDeletingListing] = useState(false);
  const [locationName, setLocationName] = useState("Unknown location");
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("spam");
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const reportReasons = [
    { id: "spam", label: "Spam or misleading" },
    { id: "scam", label: "Suspicious or scam listing" },
    { id: "prohibited", label: "Prohibited item or service" },
    { id: "duplicate", label: "Duplicate or irrelevant listing" },
    { id: "other", label: "Other issue" },
  ];

  const isSoldStatus = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();
    return normalizedStatus.includes("selled") || normalizedStatus.includes("sold out") || normalizedStatus === "sold";
  };
  const displayStatus = isSoldStatus(listing?.status) ? "selled" : "still available";
  const isCarsCategory = listing?.Category?.name?.toLowerCase() === "cars";

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);

      const response = await reviewsApi.getReviewsByListing(id);
      if (response.ok && response.data) {
        setReviews(response.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      if (__DEV__) console.error("Error fetching reviews:", error.message);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchListing = async () => {
      try {
        const response = await listingsApi.getDetailListing(id);
        if (!response.ok || !response.data) {
          throw new Error("Failed to fetch listing details.");
        }

        const { latitude, longitude } = response.data;
        if (isMounted) {
          setListing(response.data);
          setLoading(false);
        }

        if (latitude != null && longitude != null) {
          getLocationName(latitude, longitude)
            .then((location) => {
              if (isMounted && location?.city) {
                setLocationName(location.city);
              }
            })
            .catch(() => {
              if (isMounted) {
                setLocationName("Unknown location");
              }
            });
        }

        if (isMounted) {
          setError(false);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchListing();
    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [id]);





  if (loading || isDeletingListing) {
    return <ActivityIndicator visible={loading || isDeletingListing} />;
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
                if (__DEV__) console.error("Failed to delete review:", error);
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
      if (__DEV__) console.error("Error opening GPS navigation app:", err);
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
        closeContactModal();
        return;
      }

      Alert.alert("WhatsApp unavailable", "WhatsApp is not installed or the link cannot be opened.");
    } catch (err) {
      if (__DEV__) console.error("Error opening WhatsApp:", err);
      Alert.alert("Error", "Unable to open WhatsApp.");
    }
  };

  const openReportModal = () => {
    setSelectedReportReason("spam");
    setReportModalVisible(true);
  };

  const openContactModal = () => {
    setContactModalVisible(true);
  };

  const closeContactModal = () => {
    setContactModalVisible(false);
  };

  const handleOrderNow = () => {
    if (!isAuthenticated) {
      Alert.alert("Sign in required", "Please sign in to place an order.");
      return;
    }

    if (isOwner(listing?.owner?.id)) {
      Alert.alert("Not allowed", "You cannot order your own listing.");
      return;
    }

    if (isSoldStatus(listing.status)) {
      Alert.alert("Unavailable", "This item is already sold.");
      return;
    }

    navigation.navigate(routes.ORDER_CHECKOUT, { listing });
  };

  const handleCallSeller = async () => {
    const rawPhone = listing?.owner?.phone;

    if (!rawPhone) {
      Alert.alert("Call unavailable", "The seller has not provided a phone number.");
      return;
    }

    const phoneNumber = String(rawPhone).replace(/\s+/g, "");
    const callUrl = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(callUrl);
      if (!supported) {
        Alert.alert("Call unavailable", "Your device cannot place phone calls.");
        return;
      }

      await Linking.openURL(callUrl);
      closeContactModal();
    } catch (err) {
      if (__DEV__) console.error("Error opening dialer:", err);
      Alert.alert("Error", "Unable to open the dialer.");
    }
  };

  const handleEmailSeller = async () => {
    const sellerEmail = listing?.owner?.email;

    if (!sellerEmail) {
      Alert.alert("Email unavailable", "The seller has not provided an email address.");
      return;
    }

    const subject = encodeURIComponent(`Inquiry about: ${listing?.title || "listing"}`);
    const body = encodeURIComponent("Hi, I am interested in your listing.");
    const emailUrl = `mailto:${sellerEmail}?subject=${subject}&body=${body}`;

    try {
      const supported = await Linking.canOpenURL(emailUrl);
      if (!supported) {
        Alert.alert("Email unavailable", "No email app is configured on this device.");
        return;
      }

      await Linking.openURL(emailUrl);
      closeContactModal();
    } catch (err) {
      if (__DEV__) console.error("Error opening email app:", err);
      Alert.alert("Error", "Unable to open your email app.");
    }
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
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            data={[]}
            renderItem={() => null}
            keyExtractor={() => "listing-details"}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <>
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
                    <FontAwesome key={i} name={i < listing.rating ? "star" : "star-o"} size={10} color={colors.warning} />
                  ))}
                </View>
              )}
              {!!listing.status && (
                <View
                  style={[
                    styles.stateBadge,
                    isSoldStatus(listing.status)
                      ? styles.stateBadgeSold
                      : styles.stateBadgeAvailable,
                  ]}
                >
                  <Text style={styles.stateText}>{displayStatus}</Text>
                </View>
              )}
            </View>

            <Text style={styles.title}>{listing.title}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>{listing.price}  MAD</Text>
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

              {isCarsCategory ? (
                <View style={styles.carDetailsCard}>
                  <View style={styles.carDetailsHeader}>
                    <MaterialCommunityIcons name="car-outline" size={16} color={colors.primary} />
                    <Text style={styles.infoLabel}>Car Details</Text>
                  </View>

                  <View style={styles.carDetailsGrid}>
                    <Text style={styles.carDetailText}>Model: {listing.carModel || "N/A"}</Text>
                    <Text style={styles.carDetailText}>Color: {listing.carColor || "N/A"}</Text>
                    <Text style={styles.carDetailText}>Size: {listing.carSize || "N/A"}</Text>
                    <Text style={styles.carDetailText}>Year: {listing.carYear || "N/A"}</Text>
                  </View>
                </View>
              ) : null}


           

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

        

       

            {isAuthenticated && user.userId !== listing?.owner?.id ? (
              <View style={styles.orderSection}>
                <Text style={styles.sectionLabel}>Order</Text>
                <AppButton
                  title="Order Now"
                  onPress={handleOrderNow}
                  variant="success"
                  size="md"
                />
              </View>
            ) : null}

            {isAuthenticated && user.userId !== listing?.owner?.id ? (
              <View style={styles.contactSection}>
                <Text style={styles.sectionLabel}>Contact Seller</Text>
                <AppButton
                  title="Contact Seller"
                  onPress={openContactModal}
                  variant="primary"
                  size="md"
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
                    compact
                    inline
                  />

                </View>
              )}

              {isAuthenticated && !isOwner(listing.owner.id) && (
                  <AppButton
                    title="Report"
                    onPress={openReportModal}
                    variant="danger"
                    size="md"
                    fullWidth={false}
                    compact
                  />
              )}
            </View>

            <Modal
              visible={contactModalVisible}
              transparent
              animationType="fade"
              onRequestClose={closeContactModal}
            >
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback onPress={closeContactModal}>
                  <View style={styles.modalBackdrop} />
                </TouchableWithoutFeedback>

                <View style={styles.contactModalCard}>
                  <Text style={styles.reportModalTitle}>Contact seller</Text>
                  <Text style={styles.reportModalSubtitle}>
                    Choose how you want to reach the seller.
                  </Text>

                  <View style={styles.contactActionList}>
                    <AppButton
                      title="Call"
                      onPress={handleCallSeller}
                      variant="secondary"
                      size="sm"
                      fullWidth={false}
                      compact
                      inline
                      icon={<MaterialIcons name="call" size={18} color={colors.white} />}
                    />
                    <AppButton
                      title="Email"
                      onPress={handleEmailSeller}
                      variant="primary"
                      size="sm"
                      fullWidth={false}
                      compact
                      inline
                      icon={<MaterialIcons name="email" size={18} color={colors.white} />}
                    />
                    {!!listing?.owner?.phone && (
                      <AppButton
                        title="WhatsApp"
                        onPress={openWhatsApp}
                        variant="success"
                        size="sm"
                        fullWidth={false}
                        compact
                        inline
                        icon={<MaterialCommunityIcons name="whatsapp" size={18} color={colors.white} />}
                      />
                    )}
                  </View>


                  <View style={styles.reportModalActions}>
                    <AppButton
                      title="Close"
                      onPress={closeContactModal}
                      variant="outline"
                      size="sm"
                      fullWidth={false}
                      compact
                      inline
                    />
                  </View>
                </View>
              </View>
            </Modal>

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
                      compact
                      inline
                    />
                    <AppButton
                      title="Submit report"
                      onPress={submitReport}
                      variant="danger"
                      size="sm"
                      fullWidth={false}
                      compact
                      inline
                    />
                  </View>
                </View>
              </View>
            </Modal>



          </View>
              </>
            }
          />
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
    alignItems: "left",
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
  carDetailsCard: {
    marginTop: 10,
    backgroundColor: colors.infoLight,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  carDetailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  carDetailsGrid: {
    gap: 4,
  },
  carDetailText: {
    fontSize: 13,
    color: colors.textPrimary,
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
  reviewSection: {
    marginTop: 10,
  },
  orderSection: {
    marginTop: 10,
  },
  actionSection: {
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "flex-start",
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
  contactModalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 20,
  },
  contactActionList: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
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
    flexWrap: "nowrap",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },

});

export default ListingDetailsScreen;
