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
import useAuth from "../../auth/useAuth";
import ActivityIndicator from "../../components/ActivityIndicator";
import colors from "../../config/colors";

const validationSchema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(4).label("Password"),
});

function LoginScreen({ navigation }) {
  const auth = useAuth();
  const [loginFailed, setLoginFailed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({ email, password }) => {
    setLoading(true);
    const result = await authApi.login(email, password);
    setLoading(false);

    if (!result.ok) return setLoginFailed(true);
    auth.logIn(result.data); // Pass the token to the auth context
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
        <Image style={styles.logo} source={require("../../assets/logo-red.png")} />

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
            textContentType="emailAddress"
          />
          <FormField
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="password"
            placeholder="Password"
            secureTextEntry
            textContentType="password"
          />
          <SubmitButton title="Login" />
        </Form>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
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
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginTop: 50,
    marginBottom: 20,
    borderRadius: 25,
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
  },
  socialButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginScreen;
