import React, { useState } from "react";
import { TouchableOpacity, Image, View, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from '@expo/vector-icons';

function ImageInput({ imageUri, onChangeImage, onDeleteImage }) {
  const handlePress = async () => {
    if (!imageUri) {
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!result.granted) {
        alert("You need to enable permission to access the library.");
        return;
      }

      pickImage();
    } else {
      Alert.alert("Delete", "Are you sure you want to delete this image?", [
        { 
          text: "Yes", 
          onPress: async () => {
            try {
              // Call the delete image function if provided
              if (onDeleteImage) {
                await onDeleteImage();
              }
              // Clear the local imagex
              onChangeImage(null);
            } catch (error) {
              console.error("Error deleting avatar:", error);
              Alert.alert("Error", "Failed to delete avatar");
            }
          }
        },
        { text: "No" },
      ]);
    }
  };

  const pickImage = async () => {
    try {
      console.log("📷 Opening image picker...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const { uri, type } = result.assets[0];
        console.log("📸 Image picked - URI:", uri, "Type:", type);

        if (type === 'image') {
          console.log("✅ Image valid, calling onChangeImage");
          onChangeImage(result.assets[0].uri);  // Pass the URI to the parent component
        } else {
          console.error('❌ Unsupported file type');
        }
      } else {
        console.log("ℹ️ Image picker cancelled");
      }
    } catch (error) {
      console.log("❌ Error picking an image", error);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.container}>
        {!imageUri ? (
          <MaterialCommunityIcons name="camera" size={40} color="gray" />
        ) : (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#f8f4f4",
    borderRadius: 15,
    height: 100,
    justifyContent: "center",
    overflow: "hidden",
    width: 100,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default ImageInput;
