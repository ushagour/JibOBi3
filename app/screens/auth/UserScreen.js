import React, { useState } from "react";
import { StyleSheet } from "react-native";
import * as Yup from "yup";

import Screen from "../../components/Screen";
import FormImagePicker from "../../components/forms/FormImagePicker";
import {
  ErrorMessage,
  Form,
  FormField,
  SubmitButton,
} from "../../components/forms";
import ActivityIndicator from "../../components/ActivityIndicator";

import useAuth from "../../auth/useAuth";//context to get user object
import usersApi from "../../api/users"; // to use user api functions

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  // oldPassword: Yup.string()
  //   .required()
  //   .min(4)
  //   .label("Old Password")
  //   .test("not-same-as-password", "Old password cannot be the same as the new password",
  //     ),
      conferm_password: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    // .required("Confirm Password is required"),
});

function UserScreen() {
  const [error, setError] = useState();
  const { user } = useAuth();
 
  const handleSubmit = async (userInfo) => {
    try {
      const response = await usersApi.Edit(userInfo);
      console.log(response);
      if (!response.ok) setError(response.data.error);
    } catch (err) {
      console.error("Error during request:", err);
      alert("Network error, please try again.");
    }
  };


  return (
    <>
      <ActivityIndicator visible={false} />
      <Screen style={styles.container}>
        <Form
               initialValues={{ name: user.name, 
                email: user.email,
                 password: "" ,
                 conferm_password:""}}
 
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          <ErrorMessage error={error} visible={error} />
          <FormImagePicker name="avatar" />
          <FormField
            autoCorrect={false}
            icon="account"
            name="name"
            placeholder="Name"
            style={({ touched, errors }) =>
              touched.name && errors.name
                ? [styles.input, styles.errorBorder]
                : touched.name
                ? [styles.input, styles.successBorder]
                : styles.input
            }
          />
          <FormField
            autoCapitalize="none"
            autoCorrect={false}
            icon="email"
            keyboardType="email-address"
            name="email"
            placeholder="Email"
            textContentType="emailAddress"
            style={({ touched, errors }) =>
              touched.email && errors.email
                ? [styles.input, styles.errorBorder]
                : touched.email
                ? [styles.input, styles.successBorder]
                : styles.input
            }
          />
      
          <FormField
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="OldPassword"
            placeholder="old Password"
            secureTextEntry
            textContentType="password"
          
          />
              <FormField
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="password"
            placeholder="New Password"
            secureTextEntry
            textContentType="password"
            style={({ touched, errors }) =>
              touched.password && errors.password
                ? [styles.input, styles.errorBorder]
                : touched.password
                ? [styles.input, styles.successBorder]
                : styles.input
            }
          />
          <FormField
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="conferm_password"
            placeholder="Confirm Password"
            secureTextEntry
            textContentType="password"
            style={({ touched, errors }) =>
              touched.conferm_password && errors.conferm_password
                ? [styles.input, styles.errorBorder]
                : touched.conferm_password
                ? [styles.input, styles.successBorder]
                : styles.input
            }
          />
          <SubmitButton title="Update" />
        </Form>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  errorBorder: {
    borderColor: "red",
  },
  successBorder: {
    borderColor: "green",
  },
});

export default UserScreen;
