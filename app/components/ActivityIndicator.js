import React from "react";
import LottieView from "lottie-react-native";
import { View, StyleSheet } from "react-native";

function ActivityIndicator({ visible = false }) {
  if (!visible) return null;

  return (
    //overlay is the background 
    <View style={styles.overlay}>   
      <LottieView
        autoPlay
        loop
        style={styles.loop}

        source={require("../assets/animations/loader.json")}
      />
    </View>
  );
}

export default ActivityIndicator;
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "white",
    height: "100%",
    opacity: 0.7,
    width: "100%",
    zIndex: 1,
  },
  loop: {
    width: 200, 
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    
  }
});