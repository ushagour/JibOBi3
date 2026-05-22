import React, { useEffect, useRef, useState, useContext } from "react";
import {
  ImageBackground,
  StyleSheet,
  View,
  Image,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import useAuth from "../auth/useAuth";
import SplashContext from "../context/SplashContext";
import listingsApi from "../api/listings";
import colors from "../config/colors";

const { width, height } = Dimensions.get("window");

function WelcomeScreen({ navigation }) {
  const auth = useAuth();
  const { splashHidden } = useContext(SplashContext);
  const [totalListings, setTotalListings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const button1Anim = useRef(new Animated.Value(0)).current;
  const button2Anim = useRef(new Animated.Value(0)).current;
  const button3Anim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations for logo and title
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 12,
        mass: 0.8,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 10,
        mass: 0.8,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered button animations
    Animated.spring(button1Anim, {
      toValue: 1,
      damping: 15,
      mass: 0.8,
      stiffness: 100,
      useNativeDriver: true,
      delay: 300,
    }).start();

    Animated.spring(button2Anim, {
      toValue: 1,
      damping: 15,
      mass: 0.8,
      stiffness: 100,
      useNativeDriver: true,
      delay: 400,
    }).start();

    Animated.spring(button3Anim, {
      toValue: 1,
      damping: 15,
      mass: 0.8,
      stiffness: 100,
      useNativeDriver: true,
      delay: 500,
    }).start();

    Animated.spring(statsAnim, {
      toValue: 1,
      damping: 12,
      mass: 0.8,
      stiffness: 100,
      useNativeDriver: true,
      delay: 200,
    }).start();

    // Fetch total listings
    const fetchListings = async () => {
      setLoading(true);
      const response = await listingsApi.getTotalListings();
      if (!response.ok) {
        console.log("Error fetching listings:", response.problem);
        setLoading(false);
      } else {
        setTotalListings(response.data.totalListings);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <ImageBackground
      blurRadius={8}
      style={styles.background}
      source={require("../assets/chair.jpg")}
    >
      {/* Dark Overlay for better text readability */}
      <View style={styles.overlay} />

      {/* Animated Logo and Title Section */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            style={styles.logoGradient}
          >
            <Image style={styles.logo} source={require("../assets/logo-red.png")} />
          </LinearGradient>
        </View>
        
        {splashHidden && <Text style={styles.appName}>Jib w'Bie3</Text>}
        <Text style={styles.tagline}>Sell What You Don't Need!</Text>
        
        {/* Animated Stats Badge */}
        <Animated.View
          style={[
            styles.statsBadge,
            {
              transform: [{ scale: statsAnim }],
              opacity: statsAnim,
            },
          ]}
        >
          <MaterialCommunityIcons name="storefront" size={16} color={colors.primary} />
          <Text style={styles.statsText}>
            {loading ? "Loading..." : `${totalListings.toLocaleString()}+ Active Listings`}
          </Text>
        </Animated.View>
      </Animated.View>

      {/* Animated Buttons Section */}
      <View style={styles.buttonsContainer}>
        <Animated.View
          style={{
            transform: [{ translateY: button1Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            })}],
            opacity: button1Anim,
          }}
        >
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[colors.secondary, colors.secondaryDark]}
              style={styles.loginGradient}
            >
              <MaterialCommunityIcons name="login" size={20} color="#FFF" />
              <Text style={styles.loginButtonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY: button2Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            })}],
            opacity: button2Anim,
          }}
        >
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color={colors.primary} />
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={{
            transform: [{ translateY: button3Anim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            })}],
            opacity: button3Anim,
          }}
        >
          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => auth.continueAsGuest()}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="account-arrow-right" size={18} color="#FFF" />
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Copyright Footer */}
      <Animated.View
        style={[
          styles.footer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.copyrightText}>© 2026 Jib w'Bie3. All rights reserved.</Text>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  logoContainer: {
    position: "absolute",
    top: height * 0.12,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  logoGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  appName: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statsText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  buttonsContainer: {
    padding: 24,
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  loginButton: {
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  loginGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  registerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  guestButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
    width: "100%",
  },
  copyrightText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
  },
});

export default WelcomeScreen;