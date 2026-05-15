import React, { useState, useEffect } from "react";
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
} from "react-native";
import * as Yup from "yup";
import Button from "../../components/Button";
import { useFormikContext } from "formik";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../../components/Text";
import Screen from "../../components/Screen";
import routes from "../../navigation/routes";
import colors from "../../config/colors";
import useTheme from "../../hooks/useTheme";


import {
  Form,
  FormField,
  FormPicker as Picker,
} from "../../components/forms";
import FormImagePicker from "../../components/forms/FormImagePicker";
import CategoryPickerItem from "../../components/CategoryPickerItem";

import UploadScreen from "../outhers/UploadScreen";
import useLocation from "../../hooks/useLocation";
import categoriesAPI from "../../api/categories";
import listingsAPI from "../../api/listings";
import useAuth from "../../auth/useAuth";

function AdditionalDetailsFields() {
  return (
    <View style={styles.sectionCard}>
      <Text variant="overline" color="textSecondary" style={styles.sectionLabel}>
        Additional Details
      </Text>
      <Text variant="bodySmall" color="textSecondary" style={styles.sectionHint}>
        Use these fields for extra attributes that fit your listing.
      </Text>
      <FormField maxLength={50} name="carModel" placeholder="Extra detail 1" />
      <FormField maxLength={50} name="carColor" placeholder="Extra detail 2" />
      <FormField maxLength={50} name="carSize" placeholder="Extra detail 3" />
      <FormField keyboardType="numeric" maxLength={4} name="carYear" placeholder="Extra detail 4" />
    </View>
  );
}

function FraudDetectionResult({ result, onPublish, isLoading }) {
  if (!result) return null;

    const { colors: themeColors } = useTheme();
  
  const getRiskColor = (score) => {
    if (score >= 70) return "#EF4444"; // BLOCKED - Red
    if (score >= 40) return "#FFA500"; // UNDER REVIEW - Orange
    return "#22C55E"; // SAFE - Green
  };

  const getRiskStatus = (score) => {
    if (score >= 70) return { status: "BLOCKED", label: "High Risk" };
    if (score >= 40) return { status: "UNDER REVIEW", label: "Needs Review" };
    return { status: "SAFE", label: "Safe to Publish" };
  };

  const riskData = getRiskStatus(result.fraudScore);
  const riskColor = getRiskColor(result.fraudScore);

  return (
    <View style={[styles.detectionCard, { borderColor: riskColor, backgroundColor: themeColors.surface }]}>
      <View style={styles.detectionHeader}>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: riskColor }]}>
            <Text style={[styles.scoreText, { color: riskColor }]}>
              {Math.round(result.fraudScore)}%
            </Text>
          </View>
          <View>
            <Text style={[styles.statusBadge, { color: riskColor }]}>
              {riskData.status}
            </Text>
            <Text style={styles.statusLabel}>{riskData.label}</Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="shield-check"
          size={32}
          color={riskColor}
          style={{ opacity: 0.7 }}
        />
      </View>

      {/* Analysis Details */}
      <View style={styles.analysisDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name={result.priceAnomaly ? "alert-circle" : "check-circle"}
            size={18}
            color={result.priceAnomaly ? "#FFA500" : "#22C55E"}
          />
          <View style={styles.detailText}>
            <Text style={styles.detailTitle}>Price Analysis</Text>
            <Text style={styles.detailDesc}>
              {result.priceAnomaly ? "Price seems unusual" : "Price is normal"}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name={result.riskyKeywords?.length > 0 ? "alert-circle" : "check-circle"}
            size={18}
            color={result.riskyKeywords?.length > 0 ? "#FFA500" : "#22C55E"}
          />
          <View style={styles.detailText}>
            <Text style={styles.detailTitle}>Text Analysis</Text>
            <Text style={styles.detailDesc}>
              {result.riskyKeywords?.length > 0
                ? `Found ${result.riskyKeywords.length} risky keywords`
                : "No suspicious keywords"}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name={result.sellerRisk ? "alert-circle" : "check-circle"}
            size={18}
            color={result.sellerRisk ? "#FFA500" : "#22C55E"}
          />
          <View style={styles.detailText}>
            <Text style={styles.detailTitle}>Seller Behavior</Text>
            <Text style={styles.detailDesc}>
              {result.sellerRisk ? "Unusual activity detected" : "Normal seller activity"}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name={result.duplicateCheck ? "alert-circle" : "check-circle"}
            size={18}
            color={result.duplicateCheck ? "#FFA500" : "#22C55E"}
          />
          <View style={styles.detailText}>
            <Text style={styles.detailTitle}>Duplicate Check</Text>
            <Text style={styles.detailDesc}>
              {result.duplicateCheck ? "Similar listing found" : "No duplicates found"}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      {riskData.status !== "BLOCKED" && (
        <Button
          title={isLoading ? "Publishing..." : "Publish Listing"}
          onPress={onPublish}
          variant="primary"
          size="md"
          loading={isLoading}
          style={styles.publishBtn}
        />
      )}
      {riskData.status === "BLOCKED" && (
        <View style={styles.blockedWarning}>
          <MaterialCommunityIcons name="alert" size={18} color="#EF4444" />
          <Text style={styles.blockedText}>This listing cannot be published due to high fraud risk.</Text>
        </View>
      )}
    </View>
  );
}

const validationSchema = Yup.object().shape({
  title: Yup.string().required().min(1).label("Title"),
  price: Yup.number().required().min(1).max(100000).label("Price"),
  description: Yup.string().label("Description"),
  category: Yup.number().required().nullable().label("Category"),
  carSize: Yup.string().label("Car Size"),
  carColor: Yup.string().label("Car Color"),
  carModel: Yup.string().label("Car Model"),
  carYear: Yup.number().label("Car Year"),
  images: Yup.array().min(1, "Please select at least one image."),
});

function FormActions({ navigation, onAnalyze, isAnalyzing, fraudDetectionResult }) {
  const { handleSubmit, errors, touched, values } = useFormikContext();


  const handleAnalyzePress = () => {
    console.log("🔘 Analyze button pressed");
    console.log("Form values:", values);
    console.log("Form errors:", errors);
    console.log("Touched fields:", touched);
    
    // Show any existing errors
    if (Object.keys(errors).length > 0) {
      console.log("❌ Form has validation errors:", errors);
      const errorMessages = Object.entries(errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join("\n");
      Alert.alert("Form Errors", errorMessages);
      return;
    }
    
    handleSubmit();
  };

  if (fraudDetectionResult) {
    return null; // Show publish button in FraudDetectionResult component instead
  }

  return (
    <View style={styles.actionsRow}>
      <Button
        title={isAnalyzing ? "Analyzing..." : "Analyze & Review"}
        onPress={handleAnalyzePress}
        variant="primary"
        size="md"
        fullWidth={false}
        loading={isAnalyzing}
      />
      <Button
        title="Cancel"
        onPress={() => navigation.goBack()}
        variant="outline"
        size="md"
        fullWidth={false}
      />
    </View>
  );
}

function ListingAddScreen({ navigation }) {
  const { location } = useLocation();
  const { colors: themeColors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const [fraudDetectionResult, setFraudDetectionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentListingData, setCurrentListingData] = useState(null);
  const formikRef = React.useRef();

  useEffect(() => {
    categoriesAPI
      .getCategories()
      .then((response) => {
        setCategories(response.data);
      })
      .catch(() => Alert.alert("Error", "Unable to fetch categories"));
  }, []);

  // Simulate fraud detection analysis
  const analyzeListing = async (listingData) => {
    console.log("🔍 analyzeListing called with:", { title: listingData.title, price: listingData.price, category: listingData.category, imagesCount: listingData.images?.length });
    
    try {
      // Validate required fields
      if (!listingData.title || !listingData.title.trim()) {
        console.log("❌ Missing title");
        Alert.alert("Missing Info", "Please enter a title.");
        return;
      }
      if (!listingData.price) {
        console.log("❌ Missing price");
        Alert.alert("Missing Info", "Please enter a price.");
        return;
      }
      if (!listingData.category) {
        console.log("❌ Missing category");
        Alert.alert("Missing Info", "Please select a category.");
        return;
      }
      if (!listingData.images || listingData.images.length === 0) {
        console.log("❌ Missing images");
        Alert.alert("Missing Info", "Please select at least one image.");
        return;
      }

      console.log("✅ All validations passed, starting analysis...");
      setIsAnalyzing(true);

      // Simulate API call to fraud detection engine
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock fraud detection logic
      const hasRiskyKeywords =
        /urgent|quick/.test(listingData.description?.toLowerCase() || "") ||
        /urgent|quick/.test(listingData.title?.toLowerCase() || "");

      const priceAnomaly = listingData.price > 50000 || listingData.price < 1;
      const sellerRisk = Math.random() > 0.85;
      const duplicateCheck = Math.random() > 0.9;

      const baseScore = 20;
      let fraudScore = baseScore;

      if (hasRiskyKeywords) fraudScore += 15;
      if (priceAnomaly) fraudScore += 20;
      if (sellerRisk) fraudScore += 15;
      if (duplicateCheck) fraudScore += 10;

      const result = {
        fraudScore: Math.min(fraudScore, 100),
        riskyKeywords: hasRiskyKeywords ? ["urgent", "quick"] : [],
        priceAnomaly,
        sellerRisk,
        duplicateCheck,
      };

      setFraudDetectionResult(result);
      setCurrentListingData(listingData);
      console.log("✅ Fraud detection complete. Score:", result.fraudScore, "Status:", result);
    } catch (error) {
      console.error("❌ Fraud detection error:", error);
      Alert.alert("Error", "Failed to analyze listing. Please try again.");
      if (__DEV__) console.error("Fraud detection error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublishAfterAnalysis = async () => {
    console.log("📤 Publish button pressed");
    console.log("Current listing data:", currentListingData);
    console.log("Location:", location);
    
    if (!currentListingData) {
      console.log("❌ No current listing data");
      return;
    }

    if (!location?.latitude || !location?.longitude) {
      console.log("❌ Location not available");
      Alert.alert("Location Required", "Please enable location services to publish.");
      return;
    }

    console.log("✅ Publishing with location:", location);
    setProgress(0);
    setUploadVisible(true);

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

      console.log("📨 API Response:", response);

      if (!response.ok) {
        console.log("❌ API error:", response.data?.error);
        Alert.alert("Error", response.data?.error || "Unable to post listing");
        return;
      }

      const createdListingId = response.data?.id;

      if (!createdListingId) {
        console.log("✅ Listing added (under review)");
        Alert.alert("Success", "Listing added successfully and is under review.");
        setFraudDetectionResult(null);
        navigation.goBack();
        return;
      }

      console.log("✅ Listing published with ID:", createdListingId);
      Alert.alert("Success", "Listing published successfully!");
      setFraudDetectionResult(null);
      navigation.navigate("Feed", {
        screen: routes.LISTING_DETAILS,
        params: createdListingId,
      });
    } catch (error) {
      console.error("❌ Publish error:", error);
      Alert.alert("Error", "An unexpected error occurred.");
      if (__DEV__) console.error("Publish error:", error);
    } finally {
      setUploadVisible(false);
    }
  };

  return (
    <Screen style={styles.screen} paddingSize="lg" scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.headerCard, { backgroundColor: themeColors.surface }]}>
              <View style={styles.headerTextWrap}>
                <Text variant="h3" style={styles.screenTitle}>Post Your Listing</Text>
                <Text variant="bodySmall" color="textSecondary" style={styles.screenSubtitle}>
                  Fill in the details below to publish your item.
                </Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <MaterialCommunityIcons name="account" size={14} color="#0B5563" />
                  <Text variant="caption" style={styles.metaPillText}>{user?.name || "Seller"}</Text>
                </View>
                <View style={styles.metaPill}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#0B5563" />
                  <Text variant="caption" style={styles.metaPillText}>
                    {location ? "Location ready" : "No location"}
                  </Text>
                </View>
              </View>
            </View>

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
                <Button
                  title="Back to Edit"
                  onPress={() => setFraudDetectionResult(null)}
                  variant="outline"
                  size="md"
                  style={styles.editBtn}
                />
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
                validationSchema={validationSchema}
              >
                <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
                  <Text variant="overline" color="textSecondary" style={styles.sectionLabel}>Images</Text>
                  <Text variant="bodySmall" color="textSecondary" style={styles.sectionHint}>
                    Add at least one image. The first image will be your cover.
                  </Text>
                  <FormImagePicker name="images" />
                </View>

                <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
                  <Text variant="overline" color="textSecondary" style={styles.sectionLabel}>Basic Details</Text>
                  <FormField maxLength={255} name="title" placeholder="Title" />
                  <View style={styles.splitRow}>
                    <View style={styles.priceInputWrap}>
                      <FormField
                        keyboardType="numeric"
                        maxLength={8}
                        name="price"
                        placeholder="Price"
                      />
                    </View>
                  </View>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
                  <Text variant="overline" color="textSecondary" style={styles.sectionLabel}>Category</Text>
                  <Picker
                    items={categories}
                    name="category"
                    numberOfColumns={3}
                    PickerItemComponent={CategoryPickerItem}
                    placeholder="Category"
                    width="100%"
                  />
                </View>

                <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
                  <Text variant="overline" color="textSecondary" style={styles.sectionLabel}>Description</Text>
                  <FormField
                    maxLength={255}
                    multiline
                    name="description"
                    numberOfLines={3}
                    placeholder="Description"
                  />
                </View>

                <AdditionalDetailsFields />

                <FormActions
                  navigation={navigation}
                  onAnalyze={() => formikRef.current?.handleSubmit()}
                  isAnalyzing={isAnalyzing}
                  fraudDetectionResult={fraudDetectionResult}
                />
              </Form>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#F7F4F0",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECE7DE",
  },
  headerTextWrap: {
    gap: 4,
  },
  screenTitle: {
    color: "#0C2D31",
    fontWeight: "800",
  },
  screenSubtitle: {
    marginTop: 4,
    marginBottom: 12,
  },
  heroCard: {
    backgroundColor: "#EAF5F5",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D3EAEB",
  },
  heroTitle: {
    color: "#0B5563",
  },
  heroSubtitle: {
    marginTop: 4,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D8ECEE",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaPillText: {
    marginLeft: 5,
    color: "#0B5563",
    fontWeight: "700",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECE7DE",
  },
  sectionLabel: {
    marginBottom: 2,
  },
  sectionHint: {
    marginBottom: 4,
  },
  splitRow: {
    flexDirection: "row",
  },
  priceInputWrap: {
    width: 140,
  },
  actionsRow: {
    marginTop: 8,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  // Fraud Detection Styles
  detectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderLeftWidth: 4,
  },
  detectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "800",
  },
  statusBadge: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: "#666",
  },
  analysisDetails: {
    borderTopWidth: 1,
    borderTopColor: "#ECE7DE",
    paddingTop: 14,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  detailText: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0C2D31",
    marginBottom: 2,
  },
  detailDesc: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
  },
  publishBtn: {
    marginBottom: 10,
  },
  editBtn: {
    marginBottom: 24,
  },
  blockedWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  blockedText: {
    flex: 1,
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "600",
    lineHeight: 16,
  },
});

export default ListingAddScreen;
