import React, { useEffect, useState, useRef } from "react";
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
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Share,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../config/colors";
import useTheme from "../../hooks/useTheme";
import Text from "../../components/Text";
import routes from "../../navigation/routes";
import ImageSlider from "../../components/lists/ImageSlider";
import { Linking } from "react-native";
import AppButton from "../../components/Button";
import listingsApi from "../../api/listings";
import reviewsApi from "../../api/reviews";
import notificationsApi from "../../api/notifications";
import useAuth from "../../auth/useAuth";
import ActivityIndicator from "../../components/ActivityIndicator";
import ErrorStateScreen from "../../components/ErrorStateScreen";
import AddReviewForm from "../../components/AddReviewForm";
import ReviewsSection from "../../components/ReviewsSection";
import { Ionicons, MaterialIcons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import useLocation from "../../hooks/useLocation";
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

// Premium Color Palette
const palette = {
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  primaryLight: "#818CF8",
  secondary: "#10B981",
  accent: "#F59E0B",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  textPrimary: "#1E293B",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
  shadow: "#000000",
  gradientStart: "#6366F1",
  gradientEnd: "#8B5CF6",
};

// Animated Header Component
const AnimatedHeader = ({ scrollY, title, onBack, onShare }) => {
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150, 200],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [-100, 0],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [150, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.animatedHeader,
        {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
    >
      <LinearGradient
        colors={[palette.gradientStart, palette.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <BlurView intensity={80} tint="dark" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Animated.Text style={[styles.headerTitle, { opacity: titleOpacity }]} numberOfLines={1}>
              {title}
            </Animated.Text>
            <TouchableOpacity onPress={onShare} style={styles.headerButton}>
              <Feather name="share-2" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
};

// Info Card Component with Animation
const AnimatedInfoCard = ({ children, delay = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        mass: 0.8,
        stiffness: 120,
        useNativeDriver: true,
        delay,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        delay,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.animatedInfoCard,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

// Seller Card Component
const SellerCard = ({ seller, onContact }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <AnimatedInfoCard delay={200}>
      <View style={styles.sellerCard}>
        <View style={styles.sellerHeader}>
          <View style={styles.sellerAvatar}>
            <LinearGradient
              colors={[palette.gradientStart, palette.gradientEnd]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {seller?.name?.charAt(0) || "U"}
              </Text>
            </LinearGradient>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{seller?.name || "Unknown Seller"}</Text>
            <View style={styles.sellerRating}>
              <MaterialCommunityIcons name="shield-check" size={14} color={palette.secondary} />
              <Text style={styles.sellerBadge}>Verified Member</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.contactButton} onPress={onContact}>
            <LinearGradient
              colors={[palette.gradientStart, palette.gradientEnd]}
              style={styles.contactButtonGradient}
            >
              <MaterialCommunityIcons name="chat-processing" size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {isExpanded && (
          <Animated.View style={styles.sellerExpanded}>
            <View style={styles.sellerStats}>
              <View style={styles.sellerStat}>
                <Text style={styles.sellerStatNumber}>124</Text>
                <Text style={styles.sellerStatLabel}>Products</Text>
              </View>
              <View style={styles.sellerStat}>
                <Text style={styles.sellerStatNumber}>98%</Text>
                <Text style={styles.sellerStatLabel}>Positive</Text>
              </View>
              <View style={styles.sellerStat}>
                <Text style={styles.sellerStatNumber}>2.3k</Text>
                <Text style={styles.sellerStatLabel}>Followers</Text>
              </View>
            </View>
          </Animated.View>
        )}
        
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.expandButton}>
          <MaterialCommunityIcons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={palette.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </AnimatedInfoCard>
  );
};

// Action Buttons Component
const ActionButtons = ({ onOrder, onContact, isOwner, isAuthenticated, isSold }) => {
  return (
    <AnimatedInfoCard delay={300}>
      <View style={styles.actionButtonsContainer}>
        {!isOwner && isAuthenticated && !isSold && (
          <TouchableOpacity style={styles.orderButton} onPress={onOrder}>
            <LinearGradient
              colors={[palette.gradientStart, palette.gradientEnd]}
              style={styles.orderButtonGradient}
            >
              <MaterialCommunityIcons name="shopping-cart" size={22} color="#FFF" />
              <Text style={styles.orderButtonText}>Order Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        {!isOwner && isAuthenticated && (
          <TouchableOpacity style={styles.messageButton} onPress={onContact}>
            <View style={styles.messageButtonContent}>
              <MaterialCommunityIcons name="chat-outline" size={22} color={palette.primary} />
              <Text style={styles.messageButtonText}>Message Seller</Text>
            </View>
          </TouchableOpacity>
        )}
        
        {isOwner && (
          <TouchableOpacity style={styles.editButton} onPress={onOrder}>
            <MaterialCommunityIcons name="pencil" size={22} color={palette.primary} />
            <Text style={styles.editButtonText}>Edit Listing</Text>
          </TouchableOpacity>
        )}
      </View>
    </AnimatedInfoCard>
  );
};

// Main Component
function ListingDetailsScreen({ route, navigation }) {
  const routeParams = route.params;
  const id = routeParams?.listing?.id ?? routeParams?.id ?? routeParams;
  const { user, isOwner } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const { getLocationName } = useLocation();
  const isAuthenticated = Boolean(user?.userId);
  const scrollY = useRef(new Animated.Value(0)).current;

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [locationName, setLocationName] = useState("Unknown location");
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("spam");
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [quickMessage, setQuickMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const reportReasons = [
    { id: "spam", label: "Spam or misleading", icon: "spam" },
    { id: "scam", label: "Suspicious or scam listing", icon: "security" },
    { id: "prohibited", label: "Prohibited item or service", icon: "block" },
    { id: "duplicate", label: "Duplicate or irrelevant listing", icon: "copy" },
    { id: "other", label: "Other issue", icon: "help" },
  ];

  const isSoldStatus = (status) => {
    const normalizedStatus = String(status || "").toLowerCase();
    return normalizedStatus.includes("selled") || normalizedStatus.includes("sold out") || normalizedStatus === "sold";
  };
  
  const displayStatus = isSoldStatus(listing?.status) ? "Sold Out" : "Available";
  const isCarsCategory = listing?.Category?.name?.toLowerCase() === "cars";
  const isSold = isSoldStatus(listing?.status);

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this item: ${listing?.title}\nPrice: ${listing?.price} MAD`,
        title: listing?.title,
      });
    } catch (error) {
      if (__DEV__) console.error("Error sharing:", error);
    }
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
              setReviews(reviews.filter(r => r.id !== reviewId));
              Alert.alert("Success", "Review deleted successfully.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete review.");
            } finally {
              setIsDeletingReview(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

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
    setQuickMessage("");
  };

  const handleSendQuickMessage = async () => {
    if (!isAuthenticated) {
      Alert.alert("Sign in required", "Please sign in to send a message.");
      return;
    }

    if (!quickMessage.trim()) {
      Alert.alert("Empty message", "Please enter a message before sending.");
      return;
    }

    if (!listing?.owner?.id) {
      Alert.alert("Error", "Seller information not available.");
      return;
    }

    setSendingMessage(true);
    try {
      const response = await notificationsApi.createNotification({
        type: "message",
        title: `New message about "${listing.title}" from ${user?.firstName || "a buyer"}`,
        content: quickMessage.trim(),
        listingId: listing.id,
      });

      if (!response.ok) {
        Alert.alert("Failed", "Could not send message. Please try again.");
        return;
      }

      Alert.alert(
        "Message sent",
        "Your message has been sent to the seller. They will be notified."
      );
      setQuickMessage("");
      closeContactModal();
    } catch (error) {
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
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

  if (loading || isDeletingReview) {
    return <ActivityIndicator visible={loading || isDeletingReview} />;
  }
  
  if (error) {
    const normalizedError = String(error || "");
    const errorType = /404|not\s*found/i.test(normalizedError) ? "notFound" : "server";
    return (
      <ErrorStateScreen
        type={errorType}
        title={errorType === "notFound" ? "Listing not found" : "Unable to load details"}
        message="Please try again or go back to listings."
        onRetry={() => navigation.replace(routes.LISTING_DETAILS, id)}
        onGoBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <AnimatedHeader scrollY={scrollY} title={listing?.title} onBack={() => navigation.goBack()} onShare={handleShare} />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.FlatList
            data={[]}
            renderItem={() => null}
            keyExtractor={() => "listing-details"}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            ListHeaderComponent={
              <>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                  <ImageSlider images={listing.images} style={styles.image} />
                  <View style={styles.statusBadge}>
                    <LinearGradient
                      colors={isSold ? [palette.error, palette.error] : [palette.success, palette.success]}
                      style={styles.statusGradient}
                    >
                      <Text style={styles.statusText}>{displayStatus}</Text>
                    </LinearGradient>
                  </View>
                </View>

                <View style={styles.detailsContainer}>
                  {/* Category & Rating */}
                  <AnimatedInfoCard delay={0}>
                    <View style={styles.metaHeaderRow}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{listing.Category?.name || "Uncategorized"}</Text>
                      </View>
                      {listing.rating !== undefined && (
                        <View style={styles.ratingContainer}>
                          {[...Array(5)].map((_, i) => (
                            <FontAwesome 
                              key={i} 
                              name={i < listing.rating ? "star" : "star-o"} 
                              size={12} 
                              color={palette.warning} 
                            />
                          ))}
                          <Text style={styles.ratingText}> ({listing.reviewCount || 0})</Text>
                        </View>
                      )}
                    </View>
                  </AnimatedInfoCard>

                  {/* Title */}
                  <AnimatedInfoCard delay={50}>
                    <Text style={styles.title}>{listing.title}</Text>
                  </AnimatedInfoCard>

                  {/* Price */}
                  <AnimatedInfoCard delay={100}>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>{listing.price} MAD</Text>
                      {!isSold && (
                        <View style={styles.availableBadge}>
                          <MaterialCommunityIcons name="check-circle" size={14} color={palette.success} />
                          <Text style={styles.availableText}>In Stock</Text>
                        </View>
                      )}
                    </View>
                  </AnimatedInfoCard>

                  {/* Seller Card */}
                  <SellerCard seller={listing.owner} onContact={openContactModal} />

                  {/* Description */}
                  <AnimatedInfoCard delay={250}>
                    <View style={styles.sectionCard}>
                      <View style={styles.sectionHeader}>
                        <MaterialIcons name="notes" size={20} color={palette.primary} />
                        <Text style={styles.sectionTitle}>Description</Text>
                      </View>
                      <Text style={styles.description}>{listing.description || "No description provided."}</Text>
                    </View>
                  </AnimatedInfoCard>

                  {/* Car Details */}
                  {isCarsCategory && listing && (
                    <AnimatedInfoCard delay={300}>
                      <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                          <MaterialCommunityIcons name="car-outline" size={20} color={palette.primary} />
                          <Text style={styles.sectionTitle}>Vehicle Details</Text>
                        </View>
                        <View style={styles.carDetailsGrid}>
                          <View style={styles.carDetailItem}>
                            <Text style={styles.carDetailLabel}>Model</Text>
                            <Text style={styles.carDetailValue}>{listing.carModel || "N/A"}</Text>
                          </View>
                          <View style={styles.carDetailItem}>
                            <Text style={styles.carDetailLabel}>Color</Text>
                            <Text style={styles.carDetailValue}>{listing.carColor || "N/A"}</Text>
                          </View>
                          <View style={styles.carDetailItem}>
                            <Text style={styles.carDetailLabel}>Year</Text>
                            <Text style={styles.carDetailValue}>{listing.carYear || "N/A"}</Text>
                          </View>
                        </View>
                      </View>
                    </AnimatedInfoCard>
                  )}

                  {/* Location */}
                  <AnimatedInfoCard delay={350}>
                    <View style={styles.sectionCard}>
                      <View style={styles.sectionHeader}>
                        <MaterialIcons name="location-on" size={20} color={palette.primary} />
                        <Text style={styles.sectionTitle}>Location</Text>
                      </View>
                      <Text style={styles.locationText}>{locationName}</Text>
                    </View>
                  </AnimatedInfoCard>

                  {/* Action Buttons */}
                  <ActionButtons
                    onOrder={handleOrderNow}
                    onContact={openContactModal}
                    isOwner={isOwner(listing?.owner?.id)}
                    isAuthenticated={isAuthenticated}
                    isSold={isSold}
                  />

                  {/* Report Button */}
                  {isAuthenticated && !isOwner(listing?.owner?.id) && (
                    <AnimatedInfoCard delay={400}>
                      <TouchableOpacity style={styles.reportButton} onPress={openReportModal}>
                        <MaterialCommunityIcons name="flag-outline" size={18} color={palette.textSecondary} />
                        <Text style={styles.reportButtonText}>Report this listing</Text>
                      </TouchableOpacity>
                    </AnimatedInfoCard>
                  )}

                  {/* Reviews Section */}
                  <AnimatedInfoCard delay={450}>
                    <ReviewsSection 
                      reviews={reviews} 
                      onDeleteReview={handleDeleteReview}
                      isDeletingReview={isDeletingReview}
                      listingOwnerId={listing?.owner?.id}
                    />
                  </AnimatedInfoCard>
                </View>
              </>
            }
          />
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Contact Modal */}
      <Modal visible={contactModalVisible} transparent animationType="fade" onRequestClose={closeContactModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeContactModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          
          <Animated.View style={styles.contactModalCard}>
            <LinearGradient colors={[palette.gradientStart, palette.gradientEnd]} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contact Seller</Text>
              <TouchableOpacity onPress={closeContactModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.contactMethods}>
                <TouchableOpacity style={styles.contactMethod} onPress={handleCallSeller}>
                  <View style={[styles.contactIcon, { backgroundColor: `${palette.info}15` }]}>
                    <MaterialIcons name="call" size={24} color={palette.info} />
                  </View>
                  <Text style={styles.contactMethodLabel}>Call</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.contactMethod} onPress={handleEmailSeller}>
                  <View style={[styles.contactIcon, { backgroundColor: `${palette.primary}15` }]}>
                    <MaterialIcons name="email" size={24} color={palette.primary} />
                  </View>
                  <Text style={styles.contactMethodLabel}>Email</Text>
                </TouchableOpacity>
                
                {!!listing?.owner?.phone && (
                  <TouchableOpacity style={styles.contactMethod} onPress={openWhatsApp}>
                    <View style={[styles.contactIcon, { backgroundColor: `${palette.success}15` }]}>
                      <MaterialCommunityIcons name="whatsapp" size={24} color={palette.success} />
                    </View>
                    <Text style={styles.contactMethodLabel}>WhatsApp</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.quickMessageSection}>
                <Text style={styles.quickMessageLabel}>Send a quick message</Text>
                <TextInput
                  style={[styles.quickMessageInput, { backgroundColor: palette.background, borderColor: palette.border }]}
                  placeholder="Ask the seller anything about this listing..."
                  placeholderTextColor={palette.textMuted}
                  value={quickMessage}
                  onChangeText={setQuickMessage}
                  multiline
                  maxLength={500}
                  editable={!sendingMessage}
                />
                <Text style={styles.charCount}>{quickMessage.length}/500</Text>
                <TouchableOpacity
                  style={[styles.sendButton, (!quickMessage.trim() || sendingMessage) && styles.sendButtonDisabled]}
                  onPress={handleSendQuickMessage}
                  disabled={!quickMessage.trim() || sendingMessage}
                >
                  <LinearGradient
                    colors={[palette.gradientStart, palette.gradientEnd]}
                    style={styles.sendButtonGradient}
                  >
                    <Text style={styles.sendButtonText}>
                      {sendingMessage ? "Sending..." : "Send Message"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal visible={reportModalVisible} transparent animationType="fade" onRequestClose={() => setReportModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setReportModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          
          <Animated.View style={styles.reportModalCard}>
            <LinearGradient colors={[palette.error, palette.error]} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Listing</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
            
            <Text style={styles.modalSubtitle}>Choose the reason that best matches the issue.</Text>
            
            <FlatList
              data={reportReasons}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.reportReasonList}
              renderItem={({ item }) => {
                const selected = item.id === selectedReportReason;
                return (
                  <TouchableOpacity
                    style={[styles.reportReasonItem, selected && styles.reportReasonItemSelected]}
                    onPress={() => setSelectedReportReason(item.id)}
                  >
                    <MaterialCommunityIcons 
                      name={item.icon} 
                      size={22} 
                      color={selected ? palette.error : palette.textSecondary} 
                    />
                    <View style={styles.reportReasonTextWrap}>
                      <Text style={[styles.reportReasonLabel, selected && { color: palette.error }]}>
                        {item.label}
                      </Text>
                    </View>
                    <MaterialIcons
                      name={selected ? "radio-button-checked" : "radio-button-unchecked"}
                      size={22}
                      color={selected ? palette.error : palette.textMuted}
                    />
                  </TouchableOpacity>
                );
              }}
            />
            
            <View style={styles.reportModalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setReportModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={submitReport}>
                <LinearGradient colors={[palette.error, palette.error]} style={styles.submitButtonGradient}>
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: "hidden",
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerBlur: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 12,
  },
  contentContainer: {
    flexGrow: 1,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 400,
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  statusGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  animatedInfoCard: {
    marginBottom: 16,
  },
  metaHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: `${palette.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: palette.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 11,
    color: palette.textSecondary,
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 8,
    lineHeight: 32,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.primary,
  },
  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: `${palette.success}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableText: {
    fontSize: 12,
    color: palette.success,
    fontWeight: "600",
  },
  sellerCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: palette.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginRight: 12,
  },
  avatarGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 4,
  },
  sellerRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sellerBadge: {
    fontSize: 11,
    color: palette.secondary,
    fontWeight: "500",
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  contactButtonGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  expandButton: {
    alignItems: "center",
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  sellerExpanded: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  sellerStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sellerStat: {
    alignItems: "center",
  },
  sellerStatNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  sellerStatLabel: {
    fontSize: 11,
    color: palette.textSecondary,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: palette.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.textSecondary,
  },
  carDetailsGrid: {
    gap: 12,
  },
  carDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  carDetailLabel: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  carDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: palette.textPrimary,
  },
  locationText: {
    fontSize: 14,
    color: palette.textSecondary,
  },
  actionButtonsContainer: {
    gap: 12,
  },
  orderButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  orderButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  orderButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  messageButton: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border,
  },
  messageButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  messageButtonText: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: palette.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: palette.border,
  },
  editButtonText: {
    color: palette.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  reportButtonText: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  contactModalCard: {
    width: "100%",
    maxWidth: 420,
    maxHeight: height * 0.8,
    backgroundColor: palette.surface,
    borderRadius: 20,
    overflow: "hidden",
  },
  reportModalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: palette.surface,
    borderRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: palette.textSecondary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  contactMethods: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contactMethod: {
    alignItems: "center",
    gap: 8,
  },
  contactIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  contactMethodLabel: {
    fontSize: 13,
    color: palette.textSecondary,
    fontWeight: "500",
  },
  quickMessageSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickMessageLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 12,
  },
  quickMessageInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: palette.textPrimary,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 11,
    color: palette.textMuted,
    marginTop: 8,
    marginBottom: 16,
    textAlign: "right",
  },
  sendButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  reportReasonList: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  reportReasonItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  reportReasonItemSelected: {
    borderColor: palette.error,
    backgroundColor: `${palette.error}10`,
  },
  reportReasonTextWrap: {
    flex: 1,
  },
  reportReasonLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: palette.textPrimary,
  },
  reportModalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cancelButtonText: {
    color: palette.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  submitButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default ListingDetailsScreen;