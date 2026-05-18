import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Pressable,
  Animated,
  Dimensions,
  TextInput as RNTextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import * as Yup from "yup";
import { useFormikContext } from "formik";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../../components/Text";
import AnimatedHeader from "../../components/AnimatedHeader";
import routes from "../../navigation/routes";
import colors from "../../config/colors";
import useTheme from "../../hooks/useTheme";

import {
  Form,
  FormField,
  FormPicker as Picker,
} from "../../components/forms";
import FormImagePicker from "../../components/forms/FormImagePicker";

import UploadScreen from "../outhers/UploadScreen";
import useLocation from "../../hooks/useLocation";
import categoriesAPI from "../../api/categories";
import listingsAPI from "../../api/listings";
import useAuth from "../../auth/useAuth";



// Additional Details Fields Component
function AdditionalDetailsFields() {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { colors: themeColors } = useTheme();

  return (
    <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
      <TouchableOpacity
        style={styles.advancedHeader}
        onPress={() => setShowAdvanced(!showAdvanced)}
      >
        <View style={styles.advancedHeaderLeft}>
          <MaterialCommunityIcons name="tune" size={20} color={colors.primary} />
          <Text style={styles.advancedHeaderTitle}>Additional Details</Text>
        </View>
        <MaterialCommunityIcons
          name={showAdvanced ? "chevron-up" : "chevron-down"}
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {showAdvanced && (
        <View style={styles.advancedContent}>
          <FormField maxLength={50} name="carModel" placeholder="Model / Brand" icon="car" />
          <FormField maxLength={50} name="carColor" placeholder="Color" icon="palette" />
          <FormField maxLength={50} name="carSize" placeholder="Size / Dimensions" icon="ruler" />
          <FormField
            keyboardType="numeric"
            maxLength={4}
            name="carYear"
            placeholder="Year"
            icon="calendar"
          />
        </View>
      )}
    </View>
  );
}

// Enhanced Fraud Detection Result Component
function FraudDetectionResult({ result, onPublish, isLoading }) {
  const { colors: themeColors } = useTheme();

  if (!result) return null;

  const getRiskColor = (score) => {
    if (score >= 70) return colors.danger;
    if (score >= 40) return colors.warning;
    return colors.success;
  };

  const getRiskStatus = (score) => {
    if (score >= 70) return { status: "BLOCKED", label: "High Risk - Cannot Publish", icon: "shield-off" };
    if (score >= 40) return { status: "UNDER REVIEW", label: "Needs Review - Proceed with Caution", icon: "shield-alert" };
    return { status: "SAFE", label: "Safe to Publish", icon: "shield-check" };
  };

  const riskData = getRiskStatus(result.fraudScore);
  const riskColor = getRiskColor(result.fraudScore);

  return (
    <View style={[styles.sectionCard, { backgroundColor: themeColors.surface, borderLeftWidth: 4, borderLeftColor: riskColor }]}>
        <View style={styles.detectionHeader}>
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: riskColor }]}>
              <Text style={[styles.scoreText, { color: riskColor }]}>
                {Math.round(result.fraudScore)}%
              </Text>
            </View>
            <View>
              <View style={[styles.statusBadge, { backgroundColor: riskColor + "20" }]}>
                <MaterialCommunityIcons name={riskData.icon} size={14} color={riskColor} />
                <Text style={[styles.statusBadgeText, { color: riskColor }]}>
                  {riskData.status}
                </Text>
              </View>
              <Text style={styles.statusLabel}>{riskData.label}</Text>
            </View>
          </View>
          <MaterialCommunityIcons
            name="robot"
            size={40}
            color={riskColor}
            style={{ opacity: 0.5 }}
          />
        </View>

        {/* Analysis Details */}
        <View style={styles.analysisDetails}>
          {[
            {
              key: "price",
              icon: "cash",
              title: "Price Analysis",
              value: result.priceAnomaly ? "Price seems unusual" : "Price is normal",
              isWarning: result.priceAnomaly,
            },
            {
              key: "keywords",
              icon: "text-box",
              title: "Text Analysis",
              value: result.riskyKeywords?.length > 0
                ? `Found ${result.riskyKeywords.length} risky keywords`
                : "No suspicious keywords",
              isWarning: result.riskyKeywords?.length > 0,
            },
            {
              key: "seller",
              icon: "account",
              title: "Seller Behavior",
              value: result.sellerRisk ? "Unusual activity detected" : "Normal seller activity",
              isWarning: result.sellerRisk,
            },
            {
              key: "duplicate",
              icon: "file-document",
              title: "Duplicate Check",
              value: result.duplicateCheck ? "Similar listing found" : "No duplicates found",
              isWarning: result.duplicateCheck,
            },
          ].map((item, index) => (
            <View key={item.key} style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: item.isWarning ? colors.danger + "15" : colors.success + "15" }]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={18}
                  color={item.isWarning ? colors.danger : colors.success}
                />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailTitle}>{item.title}</Text>
                <Text style={[styles.detailDesc, { color: item.isWarning ? colors.danger : colors.textSecondary }]}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Button */}
        {riskData.status !== "BLOCKED" && (
          <TouchableOpacity
            style={styles.publishButton}
            onPress={onPublish}
            disabled={isLoading}
          >
            <Text style={styles.publishButtonText}>
              {isLoading ? "Publishing..." : "Publish Listing"}
            </Text>
          </TouchableOpacity>
        )}

        {riskData.status === "BLOCKED" && (
          <View style={styles.blockedWarning}>
            <MaterialCommunityIcons name="alert-octagon" size={20} color={colors.danger} />
            <Text style={styles.blockedText}>
              This listing cannot be published due to high fraud risk.
            </Text>
          </View>
        )}
    </View>
  );
}

// Categories ListBox Component
function CategoriesListBox({ categories }) {
  const { values, setFieldValue } = useFormikContext();
  const { colors: themeColors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const animationValue = useRef(new Animated.Value(1)).current;

  const selectedCategory = categories.find(c => c.id === values.category);

  const toggleExpand = () => {
    Animated.timing(animationValue, {
      toValue: isExpanded ? 0.3 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (categoryId) => {
    setFieldValue("category", categoryId);
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
    setIsExpanded(false);
  };

  const heightInterpolation = animationValue.interpolate({
    inputRange: [0.3, 1],
    outputRange: [0, 300],
  });

  const opacityInterpolation = animationValue.interpolate({
    inputRange: [0.3, 0.8, 1],
    outputRange: [0, 0.5, 1],
  });

  return (
    <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
      {/* Header */}
      <TouchableOpacity
        style={styles.categoryListHeaderToggle}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.categoryListHeaderContent}>
          <MaterialCommunityIcons name="tag" size={18} color={colors.primary} />
          <Text style={styles.categoryListLabel}>Category</Text>
          {selectedCategory && (
            <View style={styles.selectedCategoryBadge}>
              <Text style={styles.selectedCategoryText}>{selectedCategory.name}</Text>
              <MaterialCommunityIcons name="check-circle" size={14} color={colors.primary} />
            </View>
          )}
        </View>
        <Animated.View
          style={{
            transform: [
              {
                rotate: animationValue.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          }}
        >
          <MaterialCommunityIcons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.textSecondary}
          />
        </Animated.View>
      </TouchableOpacity>

      {/* List Items */}
      <Animated.View
        style={[
          styles.categoryListAnimatedContainer,
          {
            maxHeight: heightInterpolation,
            opacity: opacityInterpolation,
          },
        ]}
      >
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.categoryListContainer}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.categoryListBoxItem,
                values.category === item.id && styles.categoryListBoxItemSelected,
                index !== categories.length - 1 && styles.categoryListBoxItemBorder,
              ]}
              onPress={() => handleSelect(item.id)}
              activeOpacity={0.6}
            >
              <Animated.View
                style={{
                  opacity: values.category === item.id ? animationValue : 1,
                }}
              >
                <Text style={[
                  styles.categoryListBoxItemText,
                  values.category === item.id && styles.categoryListBoxItemTextSelected,
                ]}>
                  {item.name}
                </Text>
              </Animated.View>
              {values.category === item.id && (
                <Animated.View
                  style={{
                    transform: [
                      {
                        scale: animationValue.interpolate({
                          inputRange: [0.8, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                  }}
                >
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.primary} />
                </Animated.View>
              )}
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </View>
  );
}

// Description Section Component
function DescriptionSection() {
  const { values } = useFormikContext();
  const { colors: themeColors } = useTheme();
  const descriptionLength = values.description?.length || 0;
  const maxLength = 500;
  const percentage = (descriptionLength / maxLength) * 100;

  return (
    <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
      {/* Header */}
      <View style={styles.descriptionHeader}>
        <View style={styles.descriptionHeaderLeft}>
          <MaterialCommunityIcons name="text-box" size={18} color={colors.primary} />
          <Text style={styles.descriptionLabel}>Description</Text>
        </View>
        <Text style={[
          styles.charCounter,
          descriptionLength > maxLength * 0.9 && styles.charCounterWarning,
        ]}>
          {descriptionLength}/{maxLength}
        </Text>
      </View>

      {/* Text Area */}
      <FormField
        maxLength={500}
        multiline
        name="description"
        numberOfLines={5}
        placeholder="Describe your item in detail... What condition is it in? Any special features?"
        icon="text"
        textAlignVertical="top"
        style={styles.textArea}
      />

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[
          styles.progressBar,
          {
            width: `${percentage}%`,
            backgroundColor: descriptionLength > maxLength * 0.9 ? colors.warning : colors.primary,
          },
        ]} />
      </View>

      {/* Hint */}
      <Text style={styles.descriptionHint}>
        {descriptionLength === 0 ? "Add details to attract buyers" : `${maxLength - descriptionLength} characters left`}
      </Text>
    </View>
  );
}

// Enhanced Form Actions Component
function FormActions({ navigation, onAnalyze, isAnalyzing, fraudDetectionResult }) {
  const { handleSubmit, errors, touched, values } = useFormikContext();
  const [showErrors, setShowErrors] = useState(false);

  const handleAnalyzePress = () => {
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => `• ${field}: ${error}`)
        .join("\n");
      Alert.alert("Please Fix Errors", errorMessages);
      return;
    }
    onAnalyze();
  };

  if (fraudDetectionResult) return null;

  return (
    <View style={styles.actionsCard}>
      <TouchableOpacity
        style={styles.analyzeButton}
        onPress={handleAnalyzePress}
        disabled={isAnalyzing}
      >
        <Text style={styles.analyzeButtonText}>
          {isAnalyzing ? "Analyzing..." : "Analyze & Review"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

// Main Component
function ListingAddScreen({ navigation }) {
  const { location } = useLocation();
  const { colors: themeColors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notification, setNotification] = useState(null);
  const { user } = useAuth();
  const [fraudDetectionResult, setFraudDetectionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentListingData, setCurrentListingData] = useState(null);
  const formikRef = useRef();
  const notificationTimeout = useRef(null);

  useEffect(() => {
    categoriesAPI
      .getCategories()
      .then((response) => {
        setCategories(response.data);
      })
      .catch(() => Alert.alert("Error", "Unable to fetch categories"));
  }, []);

  const analyzeListing = async (listingData) => {
    try {
      if (!listingData.title?.trim()) {
        Alert.alert("Missing Info", "Please enter a title.");
        return;
      }
      if (!listingData.price) {
        Alert.alert("Missing Info", "Please enter a price.");
        return;
      }
      if (!listingData.category) {
        Alert.alert("Missing Info", "Please select a category.");
        return;
      }
      if (!listingData.images?.length) {
        Alert.alert("Missing Info", "Please select at least one image.");
        return;
      }

      setIsAnalyzing(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const hasRiskyKeywords =
        /urgent|quick|scam|fake|counterfeit/i.test(listingData.description?.toLowerCase() || "") ||
        /urgent|quick|scam|fake|counterfeit/i.test(listingData.title?.toLowerCase() || "");

      const priceAnomaly = listingData.price > 50000 || listingData.price < 5;
      const sellerRisk = Math.random() > 0.85;
      const duplicateCheck = Math.random() > 0.9;

      let fraudScore = 20;
      if (hasRiskyKeywords) fraudScore += 15;
      if (priceAnomaly) fraudScore += 20;
      if (sellerRisk) fraudScore += 15;
      if (duplicateCheck) fraudScore += 10;

      const result = {
        fraudScore: Math.min(fraudScore, 100),
        riskyKeywords: hasRiskyKeywords ? ["urgent", "quick", "scam"] : [],
        priceAnomaly,
        sellerRisk,
        duplicateCheck,
      };

      setFraudDetectionResult(result);
      setCurrentListingData(listingData);
      showNotification("Listing analyzed successfully", "success");
    } catch (error) {
      showNotification("Failed to analyze listing", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    };
  }, []);

  const handlePublishAfterAnalysis = async () => {
    if (!currentListingData) return;

    if (!location?.latitude || !location?.longitude) {
      Alert.alert("Location Required", "Please enable location services to publish.");
      return;
    }

    setProgress(0);
    setUploadVisible(true);
    setIsPublishing(true);

    try {
      const response = await listingsAPI.addListing(
        {
          ...currentListingData,
          location,
          user_id: user.userId,
          fraud_score: fraudDetectionResult.fraudScore,
          fraud_status:
            fraudDetectionResult.fraudScore >= 70
              ? "blocked"
              : fraudDetectionResult.fraudScore >= 40
              ? "under_review"
              : "safe",
        },
        (progress) => setProgress(progress)
      );

      if (!response.ok) {
        showNotification(response.data?.error || "Unable to post listing", "error");
        return;
      }

      const createdListingId = response.data?.id;

      if (!createdListingId) {
        showNotification("Listing added and is under review", "success");
        setFraudDetectionResult(null);
        setTimeout(() => navigation.goBack(), 2000);
        return;
      }

      showNotification("Listing published successfully!", "success");
      setFraudDetectionResult(null);
      navigation.navigate("Feed", {
        screen: routes.LISTING_DETAILS,
        params: createdListingId,
      });
    } catch (error) {
      showNotification("An unexpected error occurred", "error");
    } finally {
      setUploadVisible(false);
      setIsPublishing(false);
    }
  };

  return (
    <>
      <AnimatedHeader 
        title="Add Listing"
        subtitle="Create a new product listing"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        gradientColors={[colors.primary, colors.primaryDark]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <UploadScreen
              visible={uploadVisible}
              progress={progress}
              onDone={() => setUploadVisible(false)}
            />

            {fraudDetectionResult ? (
              <>
                <FraudDetectionResult
                  result={fraudDetectionResult}
                  onPublish={handlePublishAfterAnalysis}
                  isLoading={isPublishing}
                />
                <TouchableOpacity
                  style={styles.backToEditButton}
                  onPress={() => setFraudDetectionResult(null)}
                >
                  <MaterialCommunityIcons name="arrow-left" size={20} color={colors.primary} />
                  <Text style={styles.backToEditText}>Back to Edit</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Form
                innerRef={formikRef}
                initialValues={{
                  title: "",
                  price: "",
                  description: "",
                  category: null,
                  carSize: "",
                  carColor: "",
                  carModel: "",
                  carYear: "",
                  images: [],
                }}
                onSubmit={(values) => analyzeListing(values)}
                validationSchema={Yup.object().shape({
                  title: Yup.string().required().min(1).label("Title"),
                  price: Yup.number().required().min(1).max(100000).label("Price"),
                  description: Yup.string().label("Description"),
                  category: Yup.number().required().nullable().label("Category"),
                  images: Yup.array().min(1, "Please select at least one image."),
                })}
              >
                {/* Images Section */}
                <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
                  <Text style={styles.sectionHint}>
                    Add at least one image. The first image will be your cover.
                  </Text>
                  <FormImagePicker name="images" />
                </View>

                {/* Basic Details Section */}
                <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
                  <FormField
                    maxLength={255}
                    name="title"
                    placeholder="What are you selling?"
                    icon="format-title"
                  />
                  <FormField
                    keyboardType="numeric"
                    maxLength={8}
                    name="price"
                    placeholder="Price (MAD)"
                    icon="cash"
                  />
                </View>

                {/* Category Section */}
                <CategoriesListBox categories={categories} />

                {/* Description Section */}
                <DescriptionSection />

                {/* Additional Details */}
                <AdditionalDetailsFields />

                {/* Form Actions */}
                <FormActions
                  navigation={navigation}
                  onAnalyze={() => formikRef.current?.handleSubmit()}
                  isAnalyzing={isAnalyzing}
                  fraudDetectionResult={fraudDetectionResult}
                />
              </Form>
            )}
          </Animated.ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Notification */}
      {notification && (
        <Animated.View
          style={[
            styles.notificationContainer,
            {
              backgroundColor: notification.type === "success" ? colors.success : colors.danger,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={notification.type === "success" ? "check-circle" : "alert-circle"}
            size={20}
            color="#FFF"
          />
          <Text style={styles.notificationText}>{notification.message}</Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 17,
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  descriptionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  charCounter: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    backgroundColor: colors.background + "40",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  charCounterWarning: {
    color: colors.warning,
    backgroundColor: colors.warning + "15",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    padding: 10,
    // borderWidth: 1,
    borderColor: colors.border + "30",
    borderRadius: 10,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    backgroundColor: colors.background + "40",
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: colors.border + "20",
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  descriptionHint: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  charCount: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: "right",
    marginTop: 8,
  },
  advancedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  advancedHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  advancedHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  advancedContent: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border + "25",
  },
  actionsCard: {
    marginBottom: 60,
    paddingHorizontal: 16,
    gap: 12,
  },
  analyzeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  analyzeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },

  detectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "25",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "800",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  analysisDetails: {
    marginTop: 12,
    gap: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  detailText: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  detailDesc: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  publishButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  publishButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  backToEditButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  backToEditText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  blockedWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.danger + "15",
    borderRadius: 12,
    padding: 14,
  },
  blockedText: {
    flex: 1,
    fontSize: 13,
    color: colors.danger,
    fontWeight: "500",
    lineHeight: 18,
  },
  categoryListLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  categoryListHeaderToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.background + "40",
    marginBottom: 8,
  },
  categoryListHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  selectedCategoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.primary + "15",
    marginLeft: "auto",
  },
  selectedCategoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
  },
  categoryListAnimatedContainer: {
    overflow: "hidden",
  },
  categoryListContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  categoryListBoxItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.surface,
  },
  categoryListBoxItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "20",
  },
  categoryListBoxItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  categoryListBoxItemTextSelected: {
    fontWeight: "700",
    color: colors.primary,
  },
  categoryListBoxItemSelected: {
    backgroundColor: colors.primary + "08",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  categoryButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "25",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  categoryList: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  categoryListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
  },
  categoryListItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border + "25",
  },
  categoryListItemContent: {
    flex: 1,
  },
  categoryListItemText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  categoryListItemTextSelected: {
    fontWeight: "700",
    color: colors.primary,
  },
  categoryListItemSelected: {
    backgroundColor: colors.primary + "10",
  },
  categoryGrid: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 12,
  },
  categoryGridItem: {
    flex: 1 / 3,
    marginHorizontal: 4,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryGridItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  notificationContainer: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  notificationText: {
    flex: 1,
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default ListingAddScreen;