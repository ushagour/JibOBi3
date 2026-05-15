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
import useTheme from "../../hooks/useTheme";
import AwesomeAlert from "react-native-awesome-alerts";

import usersApi from "../../api/users";
import UploadScreen from "../outhers/UploadScreen";

const validationSchema = Yup.object().shape({
  name: Yup.string().required().label("Name"),
  email: Yup.string().required().email().label("Email"),
  phone: Yup.string().label("Phone"),
  address: Yup.string().label("Address"),
});

function UserScreen({ navigation }) {
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user: authUser, updateUser, logOut } = useAuth(); // Access user and setUser from the auth context
  const { colors: themeColors, isDark } = useTheme();
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
    console.log("📝 handleSubmit called with:", userInfo);
    console.log("📸 Current avatar state:", avatar);
    console.log("👤 authUser.avatar:", authUser.avatar);

    setLoading(true);
    setError(null);
    setProgress(0);
    setUploadVisible(true);

    try {
      // Prepare the form data for the API
      const formData = new FormData();

      formData.append("name", userInfo.name);
      formData.append("email", userInfo.email);
      formData.append("phone", userInfo.phone);
      formData.append("address", userInfo.address);

      // If the avatar is updated, append it to the form data
      if (avatar && avatar !== authUser.avatar) {
        console.log("🖼️ New avatar detected, preparing upload...");
        const uriParts = avatar.split(".");
        const fileType = uriParts[uriParts.length - 1];

        // Use "avatar" as the field name to match your backend multer config
        formData.append("avatar", {
          uri: avatar,
          name: `avatar_${authUser.userId}.${fileType}`,
          type: `image/${fileType}`,
        });
        console.log("✅ Avatar appended to FormData");
      } else {
        console.log("ℹ️ No new avatar or avatar unchanged");
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

      console.log("✅ Avatar update response:", response.data);
      console.log("📸 New avatar URI:", response.data.avatar);
      console.log("✅ Verified status:", response.data.is_verified);

      // Update the user in the auth context
      updateUser((prevUser) => {
        const updatedUser = {
          ...prevUser,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
          avatar: response.data.avatar,
          is_verified: response.data.is_verified,
        };
        console.log("🔄 Updating auth context with:", updatedUser);
        return updatedUser;
      });

      setUser((prev) => {
        const updatedUser = {
          ...prev,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
          avatar: response.data.avatar,
          is_verified: response.data.is_verified,
        };
        console.log("🔄 Updating local user state with:", updatedUser);
        return updatedUser;
      });
      setAvatar(response.data.avatar);
      console.log("✅ Avatar state updated to:", response.data.avatar);

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
            <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
            <Form
              initialValues={{
                name: user?.name || authUser?.name || "",
                email: user?.email || authUser?.email || "",
                phone: user?.phone || "",
                address: user?.address || "",
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

              {/* Phone Field */}
              <FormField
                autoCapitalize="none"
                autoCorrect={false}
                icon="phone"
                keyboardType="phone-pad"
                name="phone"
                placeholder="Phone Number"
                textContentType="telephoneNumber"
              />

              {/* Address Field */}
              <FormField
                autoCapitalize="none"
                autoCorrect={true}
                icon="map-marker"
                name="address"
                placeholder="Address"
                textContentType="streetAddress"
              />

              {/* Submit Button */}
              <SubmitButton title="Update Profile" />
            </Form>
            </View>

            {/* Account Information Section */}
            <AppText variant="overline" color="textTertiary" style={styles.sectionTitle}>
              Account Information
            </AppText>
            <View style={[styles.sectionCard, { backgroundColor: themeColors.surface }]}>
              {/* Role */}
              <View style={styles.infoRow}>
                <AppText variant="body2" color="textTertiary" style={styles.infoLabel}>
                  Role
                </AppText>
                <AppText variant="body1" color="textPrimary" style={styles.infoValue}>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : authUser?.role || "Customer"}
                </AppText>
              </View>

              {/* Account Status */}
              <View style={styles.infoRow}>
                <AppText variant="body2" color="textTertiary" style={styles.infoLabel}>
                  Status
                </AppText>
                <AppText 
                  variant="body1" 
                  color={user?.status === "active" ? "success" : user?.status === "inactive" ? "warning" : "danger"}
                  style={styles.infoValue}
                >
                  {user?.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : "Active"}
                </AppText>
              </View>

              {/* Verification Status */}
              <View style={styles.infoRow}>
                <AppText variant="body2" color="textTertiary" style={styles.infoLabel}>
                  Email Verified
                </AppText>
                <AppText 
                  variant="body1" 
                  color={user?.is_email_verified ? "success" : "warning"}
                  style={styles.infoValue}
                >
                  {user?.is_email_verified ? "✓ Verified" : "✗ Not Verified"}
                </AppText>
              </View>

              {/* Phone Verification */}
              <View style={styles.infoRow}>
                <AppText variant="body2" color="textTertiary" style={styles.infoLabel}>
                  Phone Verified
                </AppText>
                <AppText 
                  variant="body1" 
                  color={user?.is_phone_verified ? "success" : "warning"}
                  style={styles.infoValue}
                >
                  {user?.is_phone_verified ? "✓ Verified" : "✗ Not Verified"}
                </AppText>
              </View>

              {/* Overall Verification */}
              <View style={styles.infoRow}>
                <AppText variant="body2" color="textTertiary" style={styles.infoLabel}>
                  Account Verified
                </AppText>
                <AppText 
                  variant="body1" 
                  color={user?.is_verified ? "success" : "warning"}
                  style={styles.infoValue}
                >
                  {user?.is_verified ? "✓ Verified" : "✗ Not Verified"}
                </AppText>
              </View>

              {/* Quick Responder Badge */}
              {user?.is_quick_responder && (
                <View style={styles.infoRow}>
                  <AppText variant="body2" color="textTertiary" style={styles.infoLabel}>
                    Quick Responder
                  </AppText>
                  <AppText variant="body1" color="success" style={styles.infoValue}>
                    ⭐ Enabled
                  </AppText>
                </View>
              )}
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  infoLabel: {
    fontWeight: "600",
    flex: 1,
  },
  infoValue: {
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
});

export default UserScreen;
