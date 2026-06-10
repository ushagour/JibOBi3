import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Yup from "yup";

import Screen from "../../components/Screen";
import authApi from "../../api/auth";
import {
  ErrorMessage,
  Form,
  FormField,
  SubmitButton,
} from "../../components/forms";
import useApi from "../../hooks/useApi";
import ActivityIndicator from "../../components/ActivityIndicator";
import colors from "../../config/colors";
import routes from "../../navigation/routes";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const validationSchema = Yup.object().shape({
  name: Yup.string().required().min(2, "Name must be at least 2 characters").label("Name"),
  email: Yup.string().required().email("Please enter a valid email").label("Email"),
  password: Yup.string().required().min(6, "Password must be at least 6 characters").label("Password"),
});

function RegisterScreen({ navigation }) {
  const { t } = useTranslation();
  const registerApi = useApi(authApi.register);
  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 12,
        mass: 0.8,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo animation
    Animated.spring(logoAnim, {
      toValue: 1,
      damping: 10,
      mass: 0.8,
      stiffness: 120,
      useNativeDriver: true,
      delay: 200,
    }).start();

    // Form animation
    Animated.spring(formAnim, {
      toValue: 1,
      damping: 15,
      mass: 0.8,
      stiffness: 100,
      useNativeDriver: true,
      delay: 300,
    }).start();
  }, []);

  const handleSubmit = async (userInfo) => {
    Keyboard.dismiss();
    setError(null);

    if (!agreeTerms) {
      Alert.alert(
        t("orders_flow.terms_and_conditions"),
        t("auth_screens.accept_terms_required")
      );
      return;
    }

    try {
      const response = await registerApi.request(userInfo);

      if (!response) {
        setError(t("auth_screens.no_server_response"));
        return;
      }

      if (!response.ok) {
        const errorMessage = response.data?.error || t("errors.something_went_wrong");
        setError(errorMessage);
        Alert.alert(t("auth_screens.registration_failed"), errorMessage);
        return;
      }

      const { message, user, requiresEmailVerification } = response.data;

      if (!user) {
        setError(message || t("errors.something_went_wrong"));
        return;
      }

      if (requiresEmailVerification !== false) {
        Alert.alert(
          t("common.welcome"),
          "Your account was created. Please verify your email before logging in.",
          [
            {
              text: "Verify Email",
              onPress: () =>
                navigation.navigate("VerifyEmail", {
                  email: user?.email || userInfo.email,
                }),
            },
            {
              text: "Back to Login",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
        return;
      }

      setError(message || t("errors.something_went_wrong"));
    } catch (error) {
      setError(t("auth_screens.registration_error"));
      Alert.alert(t("common.error"), t("errors.network_error"));
    }
  };

  const handleSocialRegister = (platform) => {
    Alert.alert(t("auth_screens.coming_soon"), t("auth_screens.social_register_soon", { platform }));
  };

  return (
    <>
      <ActivityIndicator visible={registerApi.loading} />
      <Screen style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Animated Logo Section */}
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    opacity: logoAnim,
                    transform: [{ scale: logoAnim }],
                  },
                ]}
              >
                <Image style={styles.logo} source={require("../../assets/logo-primary.png")} />

                <Text style={styles.title}>{t("auth_screens.create_account")}</Text>
              </Animated.View>

              {/* Animated Form Section */}
              <Animated.View
                style={[
                  styles.formWrapper,
                  {
                    opacity: formAnim,
                    transform: [{ translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })}],
                  },
                ]}
              >
                <Form
                  initialValues={{ name: "", email: "", password: "" }}
                  onSubmit={handleSubmit}
                  validationSchema={validationSchema}
                >
                  <ErrorMessage error={error} visible={!!error} />
                  
                  {/* Name Field */}
                  <View style={styles.inputGroup}>
                    <FormField
                      autoCorrect={false}
                      icon="account"
                      name="name"
                      placeholder={t("auth_screens.enter_full_name")}
                      containerStyle={styles.formFieldContainer}
                    />
                  </View>

                  {/* Email Field */}
                  <View style={styles.inputGroup}>
                    <FormField
                      autoCapitalize="none"
                      autoCorrect={false}
                      icon="email"
                      keyboardType="email-address"
                      name="email"
                      placeholder={t("auth_screens.enter_email")}
                      textContentType="emailAddress"
                      containerStyle={styles.formFieldContainer}
                    />
                  </View>

                  {/* Password Field */}
                  <View style={styles.inputGroup}>
                    <View style={styles.passwordWrapper}>
                      <FormField
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="lock"
                        name="password"
                        placeholder={t("auth_screens.create_password")}
                        secureTextEntry={!showPassword}
                        textContentType="password"
                        containerStyle={styles.formFieldContainer}
                      />
                      <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.hintText}>
                      {t("auth_screens.password_min_length")}
                    </Text>
                  </View>

                  {/* Terms & Conditions */}
                  <TouchableOpacity
                    style={styles.termsContainer}
                    onPress={() => setAgreeTerms(!agreeTerms)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
                      {agreeTerms && <MaterialCommunityIcons name="check" size={12} color="#FFF" />}
                    </View>
                    <Text style={styles.termsText}>
                      {t("auth_screens.i_agree_to")} <Text style={styles.termsLink}>{t("auth_screens.terms_of_service")}</Text> {t("auth_screens.and")} {' '}
                      <Text style={styles.termsLink}>{t("auth_screens.privacy_policy")}</Text>
                    </Text>
                  </TouchableOpacity>

                  {/* Submit Button */}
                  <SubmitButton title={t("auth_screens.create_account")} />
                </Form>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t("auth_screens.or_sign_up_with")}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Media Registration */}
                <View style={styles.socialButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: "#DB4437" }]}
                    onPress={() => handleSocialRegister("Google")}
                    activeOpacity={0.9}
                  >
                    <MaterialCommunityIcons name="google" size={22} color="#FFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: "#4267B2" }]}
                    onPress={() => handleSocialRegister("Facebook")}
                    activeOpacity={0.9}
                  >
                    <MaterialCommunityIcons name="facebook" size={22} color="#FFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: "#000000" }]}
                    onPress={() => handleSocialRegister("Apple")}
                    activeOpacity={0.9}
                  >
                    <MaterialCommunityIcons name="apple" size={22} color="#FFF" />
                  </TouchableOpacity>
                </View>

                {/* Navigate to Login */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>{t("auth.already_have_account")} </Text>
                  <TouchableOpacity onPress={() => navigation.replace(routes.LOGIN)}>
                    <Text style={styles.loginLink}>{t("auth_screens.sign_in")}</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 60 : 40,
    marginBottom: 30,
  },
  logoGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...Platform.select({
 
      android: {
        elevation: 8,
      },
    }),
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  formWrapper: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  formFieldContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 16,
    zIndex: 10,
  },
  hintText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: 12,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  socialButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
});

export default RegisterScreen;