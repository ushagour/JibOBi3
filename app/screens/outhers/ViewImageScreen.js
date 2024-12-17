import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View, TouchableOpacity, GestureResponderEvent } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../config/colors";
import { PinchGestureHandler, State } from "react-native-gesture-handler";

function ViewImageScreen({ route, navigation }) {
  const { imageUrl } = route.params;
  const [scale, setScale] = useState(1);


  const handlePinch = (event) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      setScale(event.nativeEvent.scale);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeIcon}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons
          name="close"
          size={35}
          color={colors.white}
        />
      </TouchableOpacity>

  

      <PinchGestureHandler onGestureEvent={handlePinch}>
        <View style={styles.imageContainer}>
          {imageUrl && (
            <Image
              style={[styles.image, { transform: [{ scale }] }]}
              source={{ uri: imageUrl }}
              resizeMode="contain"
            />
          )}
        </View>
      </PinchGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  closeIcon: {
    position: "absolute",
    top: 40,
    right: 30,
    zIndex: 1,
  },
  container: {
    backgroundColor: colors.black,
    flex: 1,
  },

  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default ViewImageScreen;
