import React, { useState, useEffect } from "react";
import { StyleSheet,
   Alert,
   TouchableWithoutFeedback,
   KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
 } from "react-native";
import * as Yup from "yup";
import Button from "../../components/Button";


import {
  Form,
  FormField,
  FormPicker as Picker,
  SubmitButton,

} from "../../components/forms";
import Screen from "../../components/Screen";
import FormImagePicker from "../../components/forms/FormImagePicker";
import CategoryPickerItem from "../../components/CategoryPickerItem";

import UploadScreen from "../outhers/UploadScreen";
import useLocation from "../../hooks/useLocation";
import categoriesAPI from "../../api/categories";
import listingsAPI from "../../api/listings";
import useAuth from "../../auth/useAuth";
import { object } from "joi";

const validationSchema = Yup.object().shape({
  title: Yup.string().required().min(1).label("Title"),
  price: Yup.number().required().min(1).max(100000).label("Price"),
  description: Yup.string().label("Description"),
  category: Yup.number().required().nullable().label("Category"),
  images: Yup.array().min(1, "Please select at least one image."),
});

function ListingAddScreen({ navigation }) {
  const { location } = useLocation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState();
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

      Alert.alert("Success", "Listing added successfully.");
      resetForm();
      navigation.goBack();
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
        <FormImagePicker name="images" />
        <FormField maxLength={255} name="title" placeholder="Title" />
        <FormField
          keyboardType="numeric"
          maxLength={8}
          name="price"
          placeholder="Price"
          width={120}
        />
      <Picker
          items={categories}
          name="category"
          numberOfColumns={3}
          PickerItemComponent={CategoryPickerItem}
          placeholder="Category"
          width="50%"

        />
        <FormField
          maxLength={255}
          multiline
          name="description"
          numberOfLines={3}
          placeholder="Description"
        />
        <SubmitButton title="SAVE" />
        <Button title="Back" onPress={()=>{navigation.goBack()}} color="secondary"/>
      </Form>
  </ScrollView>  
    </TouchableWithoutFeedback>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
    contentContainer: {
      flexGrow: 1,
    },
    container: {
      paddingTop: 50,
    padding: 20,
  },
});

export default ListingAddScreen;
