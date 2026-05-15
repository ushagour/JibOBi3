import React, { useState } from "react";
import { StyleSheet, Image, View, TouchableOpacity, Text } from "react-native";
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

const validationSchema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(4).label("Password"),
});

function LoginScreen({ navigation }) {

  const auth = useAuth();
  const { colors: themeColors, isDark } = useTheme();

  const [loginFailed, setLoginFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ email, password }) => {
    setLoading(true);
    const result = await authApi.login(email, password);
    setLoading(false);

    if (!result.ok) return setLoginFailed(true);
    auth.logIn(result.data.token, result.data.user); // Pass token and user data
    setLoginFailed(false);
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword"); // Navigate to Forgot Password screen
  };

  const handleSocialLogin = (platform) => {
    console.log(`Login with ${platform}`); // Placeholder for social login logic
  };

  return (
    <>
      <ActivityIndicator visible={loading} />
      <Screen style={styles.container}>
        <View style={[styles.logoContainer, { backgroundColor: themeColors.surface }]}>
          <Image style={[styles.logo, { backgroundColor: themeColors.lightGray }]} source={require("../../assets/logo-red.png")} />
        </View>

        <Form
          initialValues={{ email: "", password: "" }}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          <ErrorMessage
            error="Invalid email and/or password."
            visible={loginFailed}
          />
          <FormField
            autoCapitalize="none"
            
            autoCorrect={false}
            icon="email"
            keyboardType="email-address"
            name="email"
            placeholder="Email"
            showErrorOnSubmitOnly
            textContentType="emailAddress"
          />
          <FormField
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="password"
            placeholder="Password"
            showErrorOnSubmitOnly
            secureTextEntry
            textContentType="password"
          />
          <SubmitButton title="Login" />
        </Form>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

       {/* Navigate to Registrer Screen */}
       <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.loginLink}>Don't have an account? 
            <Text style={styles.loginLinkBold}> Register</Text></Text>
       </TouchableOpacity>
        {/* Social Media Login */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: "#DB4437" }]}
            onPress={() => handleSocialLogin("Google")}
          >
            <Text style={styles.socialButtonText}>Login with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: "#4267B2" }]}
            onPress={() => handleSocialLogin("Facebook")}
          >
            <Text style={styles.socialButtonText}>Login with Facebook</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  logoContainer: {
    alignSelf: "center",
    marginTop: 60,
    marginBottom: 30,
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  forgotPassword: {
    color: colors.black,
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  socialButtonsContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  socialButton: {
    width: "90%",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  socialButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginLink: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  loginLinkBold: {
    fontWeight: "bold",
    color: colors.secondary,
  },
});

export default LoginScreen;
