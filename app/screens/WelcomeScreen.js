import React from "react";
import { ImageBackground, StyleSheet, View, Image, Text } from "react-native";

import Button from "../components/Button";

function WelcomeScreen({navigation}) {
  return (
    <ImageBackground
      blurRadius={10}
      style={styles.background}
      source={require("../assets/chair.jpg")}
    >
      <View style={styles.logoContainer}>
        <Text style={styles.tagline}>Sell What You Don't Need !</Text>
        <Image style={styles.logo} source={require("../assets/logo-red.png")} />
      </View>
      <View style={styles.buttonsContainer}>
        <Button title="Login"  onPress={()=>{navigation.navigate("Login")}} />
        <Button title="Register" color="secondary"  onPress={()=>{navigation.navigate("Register")}} />
      </View>
      <View style={styles.splashContainer}>
        <Text style={styles.copyrightText}>Copyright © 2024 Jib w’Bie3</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  buttonsContainer: {
    padding: 40,
    width: "100%",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius:25

  },
  logoContainer: {
    position: "absolute",
    top: 70,
    alignItems: "center",

  },
  tagline: {
    fontSize: 25,
    fontWeight: "600",
    paddingVertical: 20,
  },
  splashContainer: {
    position: 'absolute',
    bottom: 20, // Adjust based on the layout
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default WelcomeScreen;
