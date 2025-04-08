import React, { useState } from "react";
import { StyleSheet, Image, View, TouchableOpacity, Text } from "react-native";
import * as Yup from "yup";

import Screen from "../../components/Screen";
import authApi from "../../api/auth";
import useAuth from "../../auth/useAuth";
import {
  ErrorMessage,
  Form,
  FormField,
  SubmitButton,
} from "../../components/forms";
import useApi from "../../hooks/useApi";
import ActivityIndicator from "../../components/ActivityIndicator";
import colors from "../../config/colors";

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(4).label("Password"),
});

function RegisterScreen({ navigation }) {
  const registerApi = useApi(authApi.register);
  const auth = useAuth();
  const [error, setError] = useState();

  const handleSubmit = async (userInfo) => {
    setError(null); // Reset any previous error

    try {
      const response = await registerApi.request(userInfo);

      if (!response) {
        setError("No response from the server. Please try again later.");
        return;
      }

      if (!response.ok) {
        const errorMessage = response.data?.error || "An unexpected error occurred.";
        setError(errorMessage);
        return;
      }

      const { message, token, user } = response.data;

      if (token && user) {
        auth.signUp(token, user);
        console.log("Registration successful:", message);
      } else {
        setError(message || "An unexpected error occurred.");
        console.error("Token Error:", message);
      }
    } catch (error) {
      setError("An error occurred during registration.");
      console.error("Registration Error:", error);
    }
  };

  const handleSocialRegister = (platform) => {
    console.log(`Register with ${platform}`); // Placeholder for social registration logic
  };

  return (
    <>
      <ActivityIndicator visible={registerApi.loading} />
      <Screen style={styles.container}>
        <Image style={styles.logo} source={require("../../assets/logo-red.png")} />

        <Form
          initialValues={{ name: "", email: "", password: "" }}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          <ErrorMessage error={error} visible={!!error} />
          <FormField
            autoCorrect={false}
            icon="account"
            name="name"
            placeholder="Name"
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
          <SubmitButton title="Register" />
        </Form>

        {/* Social Media Registration */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: "#DB4437" }]}
            onPress={() => handleSocialRegister("Google")}
          >
            <Text style={styles.socialButtonText}>Register with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: "#4267B2" }]}
            onPress={() => handleSocialRegister("Facebook")}
          >
            <Text style={styles.socialButtonText}>Register with Facebook</Text>
          </TouchableOpacity>
        </View>

        {/* Navigate to Login */}
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginLink}>
            Already have an account? <Text style={styles.loginLinkBold}>Login</Text>
          </Text>
        </TouchableOpacity>
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
  loginLink: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: colors.medium,
  },
  loginLinkBold: {
    fontWeight: "bold",
    color: colors.primary,
  },
});

export default RegisterScreen;
