import React, { useState, useEffect } from "react";
import { StyleSheet, Alert } from "react-native";
import * as Yup from "yup";

import {
  Form,
  FormField,
  FormPicker as Picker,
  SubmitButton,
} from "../../components/forms";
import Screen from "../../components/Screen";
import UploadScreen from "../outhers/UploadScreen";

import FormImagePicker from "../../components/forms/FormImagePicker";
import categoriesAPI from "../../api/categories";
import listingsAPI from "../../api/listings";
import CategoryPickerItem from "../../components/CategoryPickerItem";

const validationSchema = Yup.object().shape({
  title: Yup.string().required().min(1).label("Title"),
  price: Yup.number().required().min(1).max(10000).label("Price"),
  description: Yup.string().label("Description"),
  category: Yup.object().required().nullable().label("Category"),
  images: Yup.array().min(1, "Please select at least one image."),
});

function ListingEditScreen({ route, navigation }) {
  const { listing } = route.params; // Pass listing data via route params
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // State for selected category
  const [progress, setProgress] = useState(0);
  const [uploadVisible, setUploadVisible] = useState(false);

  useEffect(() => {
    categoriesAPI
      .getCategories()
      .then((response) => {
        setCategories(response.data);

        // Preselect the category based on the listing's category ID
        const currentCategory = response.data.find((c) => c.id === listing.Category.id);
        setSelectedCategory(currentCategory);

        
        
      })
      .catch(() => {
        console.log("Error fetching categories");
        Alert.alert("Error", "Unable to fetch categories");
      });
  }, []);

  const handleSubmit = async (updatedListing, { resetForm }) => {
    setProgress(0);
    setUploadVisible(true);
    try {
      const response = await listingsAPI.updateListing(updatedListing, listing.id, (progress) =>
        setProgress(progress)
      );

      if (!response.ok) {
        Alert.alert("Error", response.data?.error || "Unable to update listing");
        return;
      }

      Alert.alert("Success", "Listing updated successfully.");
      resetForm();
      navigation.goBack();
    } catch (error) {
      console.log("Error updating listing:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setUploadVisible(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <UploadScreen
        visible={uploadVisible}
        progress={progress}
        onDone={() => setUploadVisible(false)}
      />
      <Form
        initialValues={{
          title: listing.title,
          price: listing.price.toString(),
          description: listing.description,
          category: selectedCategory, // Dynamically computed selected category
          images: listing.images.map((image) => image.url), // Map image URLs
        }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        <FormImagePicker name="images" />
        <FormField maxLength={255} name="title" placeholder="Title" />
        <FormField
          keyboardType="numeric"
          maxLength={8}
          name="price"
          width={120}
        />
        <Picker
          items={categories}
          name="category"
          placeholder={
            selectedCategory ? selectedCategory.name : "Category"
          }
          numberOfColumns={3}
          PickerItemComponent={CategoryPickerItem}
          width="50%"
        

        />
        <FormField
          maxLength={255}
          multiline
          name="description"
          numberOfLines={3}
        />
        <SubmitButton title="Save Changes" />
      </Form>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});

export default ListingEditScreen;
