import React, { useState } from "react";
import { StyleSheet,Image } from "react-native";
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
import authStorage from "../../auth/storage";

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(4).label("Password"),
});

function RegisterScreen() {
  const registerApi = useApi(authApi.register);

  const loginApi = useApi(authApi.login);
  const [user, setUser] = useState();
  const auth = useAuth();
  const [error, setError] = useState();
  const handleSubmit = async (userInfo) => {
    setError(null); // Reset any previous error
  
    try {
      // Send the request to the registration API
      const response = await registerApi.request(userInfo);
  
      // Check if the response is undefined
      if (!response) {
        setError("No response from the server. Please try again later.");
        return;
      }
  
      // Log the entire response for debugging purposes
  
      // Check if the response is successful
      if (!response.ok) {
        const errorMessage = response.data?.error || "An unexpected error occurred.";
        setError(errorMessage);
        return;
      }
  
      // Destructure the expected data fields //todo refactor this to use the auth context
      
      const { token, user } = response.data;
    
      if (token && user) {
        auth.signUp(token, user);//we pass the token to the auth context via the logIn function(object->methde)
        console.log("User registered and signed in successfully.");
      } else {
        setError("Invalid user data received.");
        console.error("token Error:", error);
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
      <Image style={styles.logo} source={require("../../assets/logo-red.png")} />

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
  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginTop: 50,
    marginBottom: 20,
    borderRadius:25
  },
});

export default RegisterScreen;
