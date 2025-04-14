import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import * as Yup from "yup";

import Screen from "../../components/Screen";
import {
  ErrorMessage,
  Form,
  FormField,
  SubmitButton,
} from "../../components/forms";
import AppButton from "../../components/Button";
import colors from "../../config/colors";
import ImageInput from "../../components/ImageInput";
import ActivityIndicator from "../../components/ActivityIndicator";
import useAuth from "../../auth/useAuth";
import usersApi from "../../api/users";

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  // oldPassword: Yup.string().min(4).label("Old Password"),
  // confirmPassword: Yup.string()
  //   .oneOf([Yup.ref("password"), null], "Passwords must match")
  //   .label("Confirm Password"),
});

function UserScreen({ navigation }) {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth(); // Access user and setUser from the auth context
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (userInfo) => {
    setLoading(true);
    setError(null);



  
      try {

            
    const UserData = {
      ...userInfo,
      user_id: user.userId, // Use the selected category ID
    };
        const response = await usersApi.updateUserInfo(UserData,(progress) => setProgress(progress)); // Send updated user info to the API
  
        
        if (!response.ok) {
          setError(response.data?.error || "An error occurred while updating your profile.");
          return;
        }
  
        // Update the user in the auth context
        // Assuming the response contains the updated user data
  
        // setUser(response.data);
  
        Alert.alert("Success", "Your profile has been updated successfully.");
  
        if (!response.ok) {
          Alert.alert("Error", response.data?.error || "Unable to update listing");
          return;
        }
        //TODO: need  to understand  this part
        // Update the user in the auth context
        updateUser((prevUser) => ({
          ...prevUser,
          name: response.data.name,
          email: response.data.email,
          avatar: response.data.avatar,
        }));
        // Optionally, navigate back to the previous screen or show a success message
        // For example, if you're using React Navigation:
        // navigation.navigate("Profile"); // Replace with your desired screen name
        // Or you can use navigation.goBack() to go back to the previous screen
        navigation.goBack();

        Alert.alert("Success", "Your profile has been updated successfully.");
      } catch (err) {
        console.error("Error during request:", err);
        Alert.alert("Error", "Network error, please try again.");
      } finally {
        setLoading(false);
      }
    };
  

  
     const handleDelete = () => {
        Alert.alert(
          "Delete Confirmation",
          `Are you sure you want to delete your account ?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              onPress: async () => {
                try {
                  const response = await usersApi.deleteUser(user.userId);
                  if (!response.ok) {
                    console.error("Failed to delete listing:", response);
                    return Alert.alert("Error", "Failed to delete listing.");
                  }
                  Alert.alert("Success", "user deleted successfully.");
                  logOut(); // Log out the user after deletion

                } catch (error) {
                  Alert.alert("Error", "Failed to delete listing.");
                  console.error("Failed to delete listing:", error);
                }
              },
              style: "destructive",
            },
          ],
          { cancelable: true }
        );
      };
  return (
    <>
      <ActivityIndicator visible={loading} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container}>
            <Form
              initialValues={{
                name: user.name,
                email: user.email,
                oldPassword: "",
                password: "",
                confirmPassword: "",
              }}
              onSubmit={handleSubmit}
              validationSchema={validationSchema}
            >
              <ErrorMessage error={error} visible={!!error} />

              {/* Avatar Input */}
              <View style={styles.imageWrapper}>
                <ImageInput
                  imageUri={user.avatar}
                  onChangeImage={(uri) => {
                    // Handle avatar change (you can send this to the API)
                    console.log("Avatar updated:", uri);
                  }}
                />
              </View>

              {/* Name Field */}
              <FormField
                autoCorrect={false}
                icon="account"
                name="name"
                placeholder="Name"
              />

              {/* Email Field */}
              <FormField
                autoCapitalize="none"
                autoCorrect={false}
                icon="email"
                keyboardType="email-address"
                name="email"
                placeholder="Email"
                textContentType="emailAddress"
              />

              {/* Old Password Field */}
              <FormField
                autoCapitalize="none"
                autoCorrect={true}
                icon="lock"
                name="oldPassword"
                placeholder="Old Password"
                secureTextEntry
                textContentType="password"
              />

              {/* New Password Field */}
              <FormField
                autoCapitalize="none"
                autoCorrect={false}
                icon="lock"
                name="password"
                placeholder="New Password"
                secureTextEntry
                textContentType="password"
              />

              {/* Confirm Password Field */}
              <FormField
                autoCapitalize="none"
                autoCorrect={false}
                icon="lock"
                name="confirmPassword"
                placeholder="Confirm Password"
                secureTextEntry
                textContentType="password"
              />

              {/* Submit Button */}
              <SubmitButton title="Update Profile" />

        

            </Form>

            {/* Delete Account Button */}
            <>
              <AppButton
                title="Delete"
                onPress={() => handleDelete(user)}
                color="danger"
                />
           </>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  imageWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
});

export default UserScreen;
