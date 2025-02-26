import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Dimensions 
} from "react-native";
import { ListItem } from "../../components/lists";

import colors from "../../config/colors";
import ContactSellerForm from "../../components/ContactSellerForm";
import Text from "../../components/Text";
import { Image } from "expo-image";
import routes from "../../navigation/routes";
import Swiper from 'react-native-swiper';
import ImageSlider from "../../components/lists/ImageSlider";

/*
tips 
ScrollView: Enables scrolling when the content is taller than the screen.
KeyboardAvoidingView: Prevents the keyboard from overlapping the form.
TouchableWithoutFeedback: Dismisses the keyboard when tapping outside the input fields.
*/
function ListingDetailsScreen({ route, navigation }) {
  const listing = route.params;



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView  contentContainerStyle={styles.contentContainer}>
          <TouchableOpacity
           delayLongPress={500}
           onLongPress={() => navigation.navigate(routes.IMAGE_DETAILS, { imageUrl: listing.imageUrl })}
          >
            {
            listing.images.length > 1 ? (
              <ImageSlider images={listing.images}  style={styles.image}/>
            ) : (
              <Image
                style={styles.image}
                preview={{ uri: listing.images.thumbnailUrl }}
                tint="light"
                source={listing.images.url}
              />
            )
            }
     
          </TouchableOpacity>

          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>${listing.price}</Text>
            <Text style={styles.description}>{listing.description}</Text>

            <ContactSellerForm listing={listing} />
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
  },
  image: {
    width: "100%",
    height: 200,
  },
  price: {
    color: colors.secondary,
    fontWeight: "bold",
    fontSize: 20,
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
  },
  description: {
    fontSize: 16,
    color: colors.medium,
    marginVertical: 10,
  },
  arrow: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default ListingDetailsScreen;
