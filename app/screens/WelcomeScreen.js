import {React, useEffect, useState} from "react";
import { ImageBackground, StyleSheet, View, Image, Text } from "react-native";


import Button from "../components/Button";
import useAuth from "../auth/useAuth";

function WelcomeScreen({navigation}) {
  const auth = useAuth();


  const [loading, setLoading] = useState(true); // State to manage loading state


  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true); // Set loading to true before fetching data
      const response = await listingsApi.getTotalListings();
      if (!response.ok) {
        console.log("Error fetching listings:", response.problem);
        setLoading(false);
      } else {
        console.log("Fetched listings:", response.data.totalListings); // Log the fetched data
        setTotal(response.data.totalListings); // Set the listings data in state
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchListings();
  }, []);


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
        <Button title="Login" variant="primary"  onPress={()=>{navigation.navigate("Login")}} />
        <Button title="Register" variant="secondary"  onPress={()=>{navigation.navigate("Register")}} />
        <Button
          title="Continue as Guest"
          variant="outline"
          onPress={() => auth.continueAsGuest()}
        />
      </View>
      <View style={styles.splashContainer}>
        <Text style={styles.copyrightText}>Copyright © 2024 Jib w’Bie3 </Text>
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
    width: 200,
    height: 200,
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
