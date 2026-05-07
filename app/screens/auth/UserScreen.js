import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  RefreshControl,
} from "react-native";
import * as Yup from "yup";
import {
  ErrorMessage,
  Form,
  FormField,
  SubmitButton,
} from "../../components/forms";
import ImageInput from "../../components/ImageInput";
import ActivityIndicator from "../../components/ActivityIndicator";
import useAuth from "../../auth/useAuth";
import AppText from "../../components/Text";
import colors from "../../config/colors";
import AwesomeAlert from "react-native-awesome-alerts";

import usersApi from "../../api/users";
import UploadScreen from "../outhers/UploadScreen";

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
});

function UserScreen({ navigation }) {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user: authUser, updateUser, logOut } = useAuth(); // Access user and setUser from the auth context
  const [avatar, setAvatar] = useState(authUser.avatar); // State to handle avatar upload
  const [progress, setProgress] = useState(0);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [user, setUser] = useState(null); // Full user data from API
  const [sweetAlert, setSweetAlert] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
    showCancel: false,
    onConfirm: null,
  });

  const closeSweetAlert = () => {
    setSweetAlert((prev) => ({
      ...prev,
      show: false,
      onConfirm: null,
      showCancel: false,
    }));
  };

  const showSweetAlert = ({
    title,
    message,
    type = "info",
    showCancel = false,
    onConfirm = null,
  }) => {
    setSweetAlert({
      show: true,
      title,
      message,
      type,
      showCancel,
      onConfirm,
    });
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUserInfo(authUser.userId);
      if (response.ok) {
        setUser(response.data);
        
      }      
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  };

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

      // If the avatar is updated, append it to the form data
      if (avatar && avatar !== authUser.avatar) {
        const uriParts = avatar.split(".");
        const fileType = uriParts[uriParts.length - 1];

        // Use "avatar" as the field name to match your backend multer config
        formData.append("avatar", {
          uri: avatar,
          name: `avatar_${authUser.userId}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await usersApi.updateUserInfo(
        authUser.userId,
        formData,
        (progress) => setProgress(progress)
      );

      if (!response.ok) {
        setError(
          response.data?.error ||
            "An error occurred while updating your profile."
        );
        return;
      }

      // Update the user in the auth context
      updateUser((prevUser) => ({
        ...prevUser,
        name: response.data.name,
        email: response.data.email,
        avatar: response.data.avatar,
      }));
      setUser((prev) => ({
        ...prev,
        name: response.data.name,
        email: response.data.email,
        avatar: response.data.avatar,
      }));

      showSweetAlert({
        title: "Success",
        message: "Your profile has been updated successfully.",
        type: "success",
      });
    } catch (err) {
      console.error("Error during request:", err);
      showSweetAlert({
        title: "Error",
        message: "Network error, please try again.",
        type: "danger",
      });
    } finally {
      setUploadVisible(false);
      setLoading(false);
      setAvatar((prev) => prev ?? authUser.avatar); // Keep picked avatar if backend returned same URI
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await usersApi.deleteUserAvatar(authUser.userId);

      updateUser((prevUser) => ({
        ...prevUser,
        avatar: null,
      }));
      setAvatar(null);
      showSweetAlert({
        title: "Success",
        message: "Avatar deleted successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting avatar:", error.message);
      showSweetAlert({
        title: "Error",
        message: "Failed to delete avatar.",
        type: "danger",
      });
    }
  };

  // Use `user` (from API) instead of `authUser` (from context)
  return (
    <>
      <ActivityIndicator visible={loading} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <UploadScreen
              visible={uploadVisible}
              progress={progress}
              onDone={() => setUploadVisible(false)}
            />

            <AppText variant="h2" color="textPrimary" style={styles.screenTitle}>
              Edit Profile
            </AppText>

            <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
              Profile Details
            </AppText>
            <View style={styles.sectionCard}>
            <Form
              initialValues={{
                name: user?.name || authUser?.name || "",
                email: user?.email || authUser?.email || "",
                avatar: user?.avatar || authUser?.avatar || null,
              }}
              key={`profile-${user?.id || authUser?.userId || "user"}-${user?.email || authUser?.email || ""}`}
              onSubmit={handleSubmit}
              validationSchema={validationSchema}
            >
              <ErrorMessage error={error} visible={!!error} />

              {/* Avatar Input */}
              <View style={styles.imageWrapper}>
                <ImageInput
                  imageUri={avatar}
                  onChangeImage={(uri) => setAvatar(uri)}
                  onDeleteImage={avatar ? handleDeleteAvatar : null}
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
            </View>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <AwesomeAlert
        show={sweetAlert.show}
        showProgress={false}
        title={sweetAlert.title}
        message={sweetAlert.message}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={sweetAlert.showCancel}
        showConfirmButton={true}
        cancelText="Cancel"
        confirmText={sweetAlert.showCancel ? "Confirm" : "OK"}
        confirmButtonColor={
          sweetAlert.type === "danger"
            ? colors.danger
            : sweetAlert.type === "warning"
            ? colors.warning
            : colors.primary
        }
        cancelButtonColor={colors.mediumGray}
        onCancelPressed={closeSweetAlert}
        onConfirmPressed={async () => {
          const callback = sweetAlert.onConfirm;
          closeSweetAlert();
          if (callback) await callback();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 30,
    backgroundColor: colors.background,
  },
  screenTitle: {
    marginBottom: 10,
  },
  sectionTitle: {
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },
});

export default UserScreen;
