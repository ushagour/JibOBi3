import React, { useState, useEffect } from "react";
import { StyleSheet, Alert,KeyboardAvoidingView


, TouchableWithoutFeedback, Keyboard, Platform, ScrollView
 } from "react-native";
import * as Yup from "yup";
import { useFormikContext } from "formik";

import {
  Form,
  FormField,
  FormPicker as Picker,
  SubmitButton,
} from "../../components/forms";
import TopActionBar from "../../components/TopActionBar";
import UploadScreen from "../outhers/UploadScreen";

import FormImagePicker from "../../components/forms/FormImagePicker";
import categoriesAPI from "../../api/categories";
import listingsAPI from "../../api/listings";
import CategoryPickerItem from "../../components/CategoryPickerItem";
import routes from "../../navigation/routes";
import AppButton from "../../components/Button";
import colors from "../../config/colors";
import ActivityIndicator from "../../components/ActivityIndicator";

function CarDetailsFields({ categories }) {
  const { values, setFieldValue } = useFormikContext();
  const selectedCategory = categories.find((item) => item.id === values.category);
  const isCarsCategory = selectedCategory?.name?.toLowerCase() === "cars";
  

  useEffect(() => {
    if (isCarsCategory) return;

    setFieldValue("carSize", "");
    setFieldValue("carColor", "");
    setFieldValue("carModel", "");
    setFieldValue("carYear", "");
  }, [isCarsCategory, setFieldValue]);

  if (!isCarsCategory) return null;

  return (
    <View style={styles.sectionCard}>
      <FormField maxLength={50} name="carModel" placeholder="Car Model" />
      <FormField maxLength={50} name="carColor" placeholder="Car Color" />
      <FormField maxLength={50} name="carSize" placeholder="Car Size" />
      <FormField keyboardType="numeric" maxLength={4} name="carYear" placeholder="Car Year (e.g., 2023)" />
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

function ListingEditScreen({ route, navigation }) {
  const { listing } = route.params; // Pass listing data via route params
  const [categories, setCategories] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [isDeletingListing, setIsDeletingListing] = useState(false);

  useEffect(() => {
    // console.log("Listing data:", listing); // Debug log
    
    categoriesAPI
      .getCategories()
      .then((response) => {
        setCategories(response.data);
      })
      .catch(() => {
        console.log("Error fetching categories");
        Alert.alert("Error", "Unable to fetch categories");
      });
  }, []);

  const handleSubmit = async (updatedListing, { resetForm }) => {
    const listingData = {
      ...updatedListing,
      category_id: updatedListing.category, // Use the selected category ID
    };

    console.log("Final listing data to submit:", listingData);

    try {
      const response = await listingsAPI.updateListing(listingData, listing.id, (progress) =>
        setProgress(progress)
      );

      if (!response.ok) {
        Alert.alert("Error", response.data?.error || "Unable to update listing");
        return;
      }

      Alert.alert("Success", "Listing updated successfully.");
      resetForm();

      navigation.navigate(routes.LISTINGS);
    } catch (error) {
      console.log("Error updating listing:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setUploadVisible(false);
    }
  };


  
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
                  setIsDeletingListing(true);
                  if (__DEV__) console.log(`Attempting to delete listing with ID: ${listing.id}`);
                  const response = await listingsAPI.deleteListing(listing.id);
                  if (!response.ok) {
                    if (__DEV__) console.error("Failed to delete listing:", response);
                    return Alert.alert("Error", "Failed to delete listing.");
                  }
                  navigation.navigate(routes.LISTINGS);
                  Alert.alert("Success", "Listing deleted successfully.");
                } catch (error) {
                  Alert.alert("Error", "Failed to delete listing.");
                  if (__DEV__) console.error("Failed to delete listing:", error);
                } finally {
                  setIsDeletingListing(false);
                }
              },
              style: "destructive",
            },
          ],
          { cancelable: true }
        );
      };

          
  if (isDeletingListing) {
    return <ActivityIndicator visible={isDeletingListing} />;
  }

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
      <Form
        initialValues={{
          title: listing.title,
          price: listing.price.toString(),
          description: listing.description,
          category: listing.Category ? listing.Category.id : null,
          carSize: listing.carSize || "",
          carColor: listing.carColor || "",
          carModel: listing.carModel || "",
          carYear: listing.carYear ? listing.carYear.toString() : "",
          images: listing.images.map((image) => image.url),
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
            listing.Category ? listing.Category.name : "Category"
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
        <CarDetailsFields categories={categories} />
        <SubmitButton title="Save Changes" />


                    


      </Form>      
       <AppButton
                              title="Delete"
                              onPress={() => handleDelete(listing)}
                              variant="danger"
                              fullWidth={true}
                            />
          </ScrollView>  
     </TouchableWithoutFeedback>

     </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  topBar: {
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ECE7DE",
  },
});

export default ListingEditScreen;
