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
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import * as Yup from "yup";

import Screen from "../../components/Screen";
import {
  ErrorMessage,
  Form,
  FormField,
  SubmitButton,
} from "../../components/forms";
import authApi from "../../api/auth";
import useAuth from '../../auth/useAuth';
import useTheme from "../../hooks/useTheme";
import ActivityIndicator from "../../components/ActivityIndicator";
import colors from "../../config/colors";
import { useTranslation } from "react-i18next";

const { width, height } = Dimensions.get("window");

const validationSchema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(4).label("Password"),
});

function LoginScreen({ navigation }) {
  const auth = useAuth();
  const { t } = useTranslation();
  const { colors: themeColors, isDark } = useTheme();
  const [loginFailed, setLoginFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const handleSubmit = async ({ email, password }) => {
    Keyboard.dismiss();
    setLoading(true);
    const result = await authApi.login(email, password);
    setLoading(false);

    if (!result.ok) {
      setLoginFailed(true);
      Alert.alert(t("auth_screens.login_failed_title"), t("auth.invalid_credentials"));
      return;
    }
    auth.logIn(result.data.token, result.data.user);
    setLoginFailed(false);
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const handleSocialLogin = (platform) => {
    Alert.alert(t("auth_screens.coming_soon"), t("auth_screens.social_login_soon", { platform }));
  };

  return (
    <>
      <ActivityIndicator visible={loading} />
      <Screen style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerContainer}>
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
                  initialValues={{ email: "", password: "" }}
                  onSubmit={handleSubmit}
                  validationSchema={validationSchema}
                >
                  <ErrorMessage
                    error={t("auth.invalid_credentials")}
                    visible={loginFailed}
                  />
                  
                  {/* Email Field */}
                  <View style={styles.inputGroup}>
                    <FormField
                      autoCapitalize="none"
                      autoCorrect={false}
                      icon="email"
                      keyboardType="email-address"
                      name="email"
                      placeholder={t("auth_screens.enter_email")}
                      showErrorOnSubmitOnly
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
                        placeholder={t("auth_screens.enter_password")}
                        showErrorOnSubmitOnly
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
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
                    <Text style={styles.forgotPassword}>{t("auth.forgot_password")}</Text>
                  </TouchableOpacity>

                  {/* Submit Button */}
                  <SubmitButton title={t("auth_screens.sign_in")} />
                </Form>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                  <Text style={styles.registerText}>{t("auth.new_user")} </Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.registerLink}>{t("common.signup")}</Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>{t("auth_screens.or_continue_with")}</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Media Login */}
                <View style={styles.socialButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: "#DB4437" }]}
                    onPress={() => handleSocialLogin("Google")}
                    activeOpacity={0.9}
                  >
                    <MaterialCommunityIcons name="google" size={24} color="#FFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: "#4267B2" }]}
                    onPress={() => handleSocialLogin("Facebook")}
                    activeOpacity={0.9}
                  >
                    <MaterialCommunityIcons name="facebook" size={24} color="#FFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: "#000000" }]}
                    onPress={() => handleSocialLogin("Apple")}
                    activeOpacity={0.9}
                  >
                    <MaterialCommunityIcons name="apple" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
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
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
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
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  formWrapper: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 15,
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  forgotPassword: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
    fontSize: 14,
    fontWeight: "600",
  },
});

export default LoginScreen;