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
import colors from "../config/colors";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

function WelcomeScreen({ navigation }) {
  const auth = useAuth();
  const { t } = useTranslation();
  const { splashHidden } = useContext(SplashContext);

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
            colors={[colors.white, colors.white]}
            style={styles.logoGradient}
          >

            <Image style={styles.logo} source={require("../assets/logo-primary.png")} />
          </LinearGradient>
        </View>
        
        

      </Animated.View>

            <Animated.Text
        style={[
          styles.appName,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        Achetez · Vendez · En confiance
      </Animated.Text>

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
              colors={[colors.primary, colors.primaryDark]}
              style={styles.loginGradient}
            >
              <MaterialCommunityIcons name="login" size={20} color="#FFF" />
              <Text style={styles.loginButtonText}>{t("common.login")}</Text>
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
            <Text style={styles.registerButtonText}>{t("common.signup")}</Text>
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
            <Text style={styles.guestButtonText}>{t("welcome_screen.continue_as_guest")}</Text>
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
        <Text style={styles.copyrightText}>{t("welcome_screen.copyright")}</Text>
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

    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
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
    width: 260,
    height: 260,
    resizeMode: "contain",
  },

  
  appName: {
    fontSize: 22,
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
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
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