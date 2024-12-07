import React, { useState } from "react";
import { StyleSheet } from "react-native";
import * as Yup from "yup";

import Screen from "../../components/Screen";
import usersApi from "../../api/users";
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
import authStorage from "../../auth/storage";

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(4).label("Password"),
});

function RegisterScreen() {
  const registerApi = useApi(usersApi.register);

  const loginApi = useApi(authApi.login);
  const [user, setUser] = useState();
  const auth = useAuth();
  const [error, setError] = useState();
const handleSubmit = async (userInfo) => {
  setError(null); // Reset any previous error
  // console.log("Registering user:", userInfo);

  try {
    // Send the request to the registration API
    const response = await registerApi.request(userInfo);

    // Check if the response is undefined
    if (!response) {
      setError("No response from the server. Please try again later.");
      // console.log("Error: No response from the server.");
      return;
    }

    // Log the entire response for debugging purposes
    // console.log("API Response:", response);

    // Check if the response is successful
    if (!response.ok) {
      const errorMessage = response.data?.error || "An unexpected error occurred.";
      setError(errorMessage);
      // console.log("Error:", errorMessage);
      return;
    }

    // Destructure the expected data fields
    const { token, user } = response.data;

    // Confirm token and user data are present
    if (token && user) {
      authStorage.storeToken(token);
      setUser(user);
      console.log("User registered and signed in successfully.");


        const { data: authToken } = await loginApi.request(
              user.email,
              user.password
            );
            auth.logIn(authToken);



    } else {
      setError("Invalid user data received.");
      console.log("Error: Missing token or user data.");
    }
  } catch (error) {
    setError("An error occurred during registration.");
    console.error("Registration Error:", error);
  }
};

  

  return (
    <>
      <ActivityIndicator visible={registerApi.loading || loginApi.loading} />
      <Screen style={styles.container}>
        <Form
          initialValues={{ name: "", email: "", password: "" }}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          <ErrorMessage error={error} visible={error} />
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
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});

export default RegisterScreen;
