import React, { useState } from "react";
import { StyleSheet, Image } from "react-native";
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

const validationSchema = Yup.object().shape({
  email: Yup.string().required().email().label("Email"),
  password: Yup.string().required().min(4).label("Password"),
});

function LoginScreen(props) {
  const auth = useAuth();
  const [loginFailed, setLoginFailed] = useState(false);

  const handleSubmit = async ({ email, password }) => {
    const result = await authApi.login(email, password);

    // console.log(result);
    
    if (!result.ok) return setLoginFailed(true);
    auth.logIn(result.data);//we pass the token to the auth context via the logIn function(object->methde)
    setLoginFailed(false);
    
  };

  return (
    <Screen style={styles.container}>


      <Image style={styles.logo} source={require("../../assets/logo-red.png")} />

      <Form
        initialValues={{ email: "", password: "" }}
        onSubmit={handleSubmit}
        // validationSchema={validationSchema}
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
    </Screen>
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

export default LoginScreen;
