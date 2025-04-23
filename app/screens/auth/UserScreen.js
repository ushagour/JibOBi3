import React, { useState } from "react";
import {
  StyleSheet,
  View,
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
import ImageInput from "../../components/ImageInput";
import ActivityIndicator from "../../components/ActivityIndicator";
import useAuth from "../../auth/useAuth";
import authApi from "../../api/auth";
import UploadScreen from "../outhers/UploadScreen";


const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
});

const changePasswordValidationSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(5, "Password must be at least 5 characters"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your new password"),
});

function UserScreen({ navigation }) {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth(); // Access user and setUser from the auth context
  const [avatar, setAvatar] = useState(user.avatar); // State to handle avatar upload
  const [progress, setProgress] = useState(0);
    const [uploadVisible, setUploadVisible] = useState(false);
  

  const handleSubmit = async (userInfo) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setUploadVisible(true);

    try {
      // Prepare the form data for the API
      const formData = new FormData();

      formData.append("name", userInfo.name);
      formData.append("email", userInfo.email);
      formData.append("user_id", user.userId); // Include user ID in the form data

      console.log("FormData:", formData); // Debug log
      

      // If the avatar is updated, append it to the form data
     if (avatar && avatar !== user.avatar) {
      const uriParts = avatar.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("avatar", {
        uri: avatar,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      });
    }
    
      const response = await usersApi.updateUserInfo(user.userId,formData,(progress) => setProgress(progress)
    ); // Send updated user info to the API


      if (!response.ok) {
        setError(response.data?.error || "An error occurred while updating your profile.");
        return;
      }

      // Update the user in the auth context
      updateUser((prevUser) => ({
        ...prevUser,
        name: response.data.name,
        email: response.data.email,
        avatar: response.data.avatar,
      }));

      Alert.alert("Success", "Your profile has been updated successfully.");
    } catch (err) {
      console.error("Error during request:", err);
      Alert.alert("Error", "Network error, please try again.");
    } finally {
      setUploadVisible(false);
      setLoading(false);
      setAvatar(user.avatar); // Reset avatar state to the original value
    }
  };

  const handleChangePassword = async (userInfo) => {
    try {
      console.log("Change Password Data:", userInfo); // Debug log
      setLoading(true);
      
      const response = await authApi.ChangePassword(user.email,userInfo.currentPassword,userInfo.newPassword,(progress) => setProgress(progress));
      if (!response.ok) {
        console.error("Failed to change password:", response);
        setLoading(false);
        setError(response.data?.error || "An error occurred while updating your password.");
        return;
      }
      setLoading(false);
      Alert.alert("Success", "Your password has been updated successfully.");
    } catch (err) {
      setLoading(false);
      console.error("Error during request:", err);
      Alert.alert("Error", "Network error, please try again.");
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
          <UploadScreen
        visible={uploadVisible}
        progress={progress}
        onDone={() => setUploadVisible(false)}
      />
            <Form
           initialValues={{
            name: user.name,
            email: user.email,
            avatar: user.avatar
          }}
              onSubmit={handleSubmit}
              validationSchema={validationSchema}
            >
              <ErrorMessage error={error} visible={!!error} />

              {/* Avatar Input */}
              <View style={styles.imageWrapper}>
                <ImageInput
                  imageUri={avatar}
                  onChangeImage={(uri) => setAvatar(uri)}
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

              {/* Submit Button */}
              <SubmitButton title="Update Profile" />
            </Form>



            {/* Change Password Button */}
            <Form
              initialValues={{
                currentPassword: "",
                newPassword: "",
              }}
              onSubmit={handleChangePassword}
              validationSchema={changePasswordValidationSchema}
            >
              <ErrorMessage error={error} visible={!!error} />

              {/* Current Password Field */}
              <FormField
  autoCapitalize="none"
  autoCorrect={false}
  icon="lock"
  name="currentPassword"
  placeholder="Current Password"
  secureTextEntry
  textContentType="password"
  
/>

<FormField
  autoCapitalize="none"
  autoCorrect={false}
  icon="lock"
  name="newPassword"
  placeholder="New Password"
  secureTextEntry
  textContentType="newPassword"
/>

<FormField
  autoCapitalize="none"
  autoCorrect={false}
  icon="lock"
  name="confirmNewPassword"
  placeholder="Confirm New Password"
  secureTextEntry
  textContentType="password"
/>

<SubmitButton title="Change Password" color={"secondary"} />
</Form>


            {/* Delete Account Button */}
            <AppButton
              title="Delete Account"
              onPress={() => handleDelete(user)}
              color="danger"
            />
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
