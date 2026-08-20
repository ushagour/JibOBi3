import React, { useState } from "react";
import { TouchableOpacity, Image, View, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

function ImageInput({ imageUri, onChangeImage, onDeleteImage }) {
  const { t } = useTranslation();
  const handlePress = async () => {
    if (!imageUri) {
      const result = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!result.granted) {
        alert(t('profile_management.photo_permission'));
        return;
      }

      pickImage();
    } else {
      Alert.alert(t('common.delete'), t('image_input.delete_confirm'), [
        { 
          text: t('common.yes'), 
          onPress: async () => {
            try {
              // Call the delete image function if provided
              if (onDeleteImage) {
                await onDeleteImage();
              }
              // Clear the local image
              onChangeImage(null);
            } catch (error) {
              console.error("Error deleting avatar:", error);
              Alert.alert(t('common.error'), t('image_input.delete_avatar_failed'));
            }
          }
        },
        { text: t('common.no') },
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
