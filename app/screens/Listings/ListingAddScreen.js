import React, { useState, useEffect } from "react";
import { StyleSheet,
   Alert,
   TouchableWithoutFeedback,
   KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  View
 } from "react-native";
import * as Yup from "yup";
import Button from "../../components/Button";
import { useFormikContext } from "formik";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Text from "../../components/Text";


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

const validationSchema = Yup.object().shape({
  title: Yup.string().required().min(1).label("Title"),
  price: Yup.number().required().min(1).max(100000).label("Price"),
  description: Yup.string().label("Description"),
  category: Yup.number().required().nullable().label("Category"),
  images: Yup.array().min(1, "Please select at least one image."),
});

function FormActions({ navigation }) {
  const { handleSubmit, isSubmitting } = useFormikContext();

  return (
    <View style={styles.actionsRow}>
      <Button
        title="Post Listing"
        onPress={handleSubmit}
        variant="primary"
        size="md"
        fullWidth={false}
        loading={isSubmitting}
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
  const [categories, setCategories] = useState([]);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    categoriesAPI
      .getCategories()
      .then((response) => {
        // console.log("Categories fetched:", response.data); // Debug log
        setCategories(response.data);
      })
      .catch(() => Alert.alert("Error", "Unable to fetch categories"));
  }, []);

  const handleSubmit = async (listing, { resetForm }) => {
    setProgress(0);
    setUploadVisible(true);
 
    try {
      const response = await listingsAPI.addListing(
        { ...listing, location, user_id: user.userId },
        (progress) => setProgress(progress)
      );

      if (!response.ok) {
        Alert.alert("Error", response.data?.error || "Unable to post listing");
        return;
      }

      const createdListingId = response.data?.id;

      if (!createdListingId) {
        Alert.alert("Success", "Listing added successfully.");
        navigation.goBack();
        return;
      }

      resetForm();
      navigation.navigate("Feed", {
        screen: routes.LISTING_DETAILS,
        params: createdListingId,
      });
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setUploadVisible(false);
    }
  };

  return (
       <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView  contentContainerStyle={styles.container}>

      
      <UploadScreen
        visible={uploadVisible}
        progress={progress}
        onDone={() => setUploadVisible(false)}
      />

      <View style={styles.heroCard}>
        <Text variant="h4" style={styles.heroTitle}>Create New Listing</Text>
        <Text variant="bodySmall" color="textSecondary" style={styles.heroSubtitle}>
          Add clear photos, accurate pricing, and a short description to get better responses.
        </Text>
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

      <Form
        initialValues={{
          title: "",
          price: "",
          description: "",
          category: null,
          images: [],
        }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        <View style={styles.sectionCard}>
          <Text variant="overline" color="textSecondary" style={styles.sectionLabel}>Images</Text>
          <Text variant="bodySmall" color="textSecondary" style={styles.sectionHint}>
            Add at least one image. The first image will be your cover.
          </Text>
        <FormImagePicker name="images" />
        </View>

        <View style={styles.sectionCard}>
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

        <View style={styles.sectionCard}>
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

        <View style={styles.sectionCard}>
          <Text variant="overline" color="textSecondary" style={styles.sectionLabel}>Description</Text>
        <FormField
          maxLength={255}
          multiline
          name="description"
          numberOfLines={3}
          placeholder="Description"
        />
        </View>

        <FormActions navigation={navigation} />
      </Form>
  </ScrollView>  
    </TouchableWithoutFeedback>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    container: {
    flexGrow: 1,
    backgroundColor: "#F7F4F0",
    paddingTop: 28,
    padding: 20,
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
});

export default ListingAddScreen;
