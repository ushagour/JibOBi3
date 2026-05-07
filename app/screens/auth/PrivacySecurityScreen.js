import React, { useState } from "react";
import { StyleSheet, View, Alert, ScrollView, TextInput } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Yup from "yup";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import colors from "../../config/colors";
import AppButton from "../../components/Button";
import {
  ErrorMessage,
  Form,
  FormField,
  SubmitButton,
} from "../../components/forms";
import ActivityIndicator from "../../components/ActivityIndicator";
import AwesomeAlert from "react-native-awesome-alerts";
import useAuth from "../../auth/useAuth";
import authApi from "../../api/auth";
import usersApi from "../../api/users";

// Strong password validation function
const isStrongPassword = (password) => {
  if (!password || password.length < 8) return false;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

const getPasswordStrengthMessage = () => {
  return "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character (!@#$%^&* etc.)";
};

const changePasswordValidationSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .test("strong-password", getPasswordStrengthMessage(), (value) => {
      return isStrongPassword(value);
    }),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your new password"),
});

function PrivacySecurityScreen() {
  const { user, logOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletionStep, setDeletionStep] = useState(0); // 0: initial, 1: reason, 2: email confirm
  const [deletionReason, setDeletionReason] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
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

  const handleChangePassword = async (userInfo, { resetForm }) => {
    try {
      setLoading(true);
      setError(null);

      // Validate strong password before sending
      if (!isStrongPassword(userInfo.newPassword)) {
        setError(getPasswordStrengthMessage());
        return;
      }

      const response = await authApi.ChangePassword(
        user?.email,
        userInfo.currentPassword,
        userInfo.newPassword
      );
if (response.ok) {
  
  // Show success alert and reset form
  showSweetAlert({
    title: "✓ Password Updated",
    message: "Your password has been changed successfully. Please use your new password on next login.",
    type: "success",
    onConfirm: () => {
      resetForm();
    },
  });
}
    } catch (requestError) {
      console.error("Error changing password:", requestError);
      setError("Network error, please try again.");
      showSweetAlert({
        title: "Error",
        message: "Failed to update password. Please check your current password and try again.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    setDeletionStep(1);
    setDeletionReason("");
    setConfirmEmail("");
    showSweetAlert({
      title: "⚠️ Delete Account",
      message: "Deleting your account is permanent and cannot be undone. All your listings and data will be removed.",
      type: "warning",
      showCancel: true,
      onConfirm: () => {
        // Move to reason collection step
        setDeletionStep(2);
        closeSweetAlert();
      },
    });
  };

  const handleContinueDeletion = () => {
    if (!deletionReason.trim() || deletionReason.trim().length < 10) {
      Alert.alert("Required", "Please tell us why you're deleting your account (minimum 10 characters).");
      return;
    }

    // Move to email verification step
    setDeletionStep(3);
    showSweetAlert({
      title: "Verify Your Email",
      message: `To confirm account deletion, please enter your email: ${user?.email}`,
      type: "info",
      showCancel: true,
    });
  };

  const handleConfirmDeletion = async () => {
    if (!confirmEmail || confirmEmail !== user?.email) {
      Alert.alert("Verification Failed", "The email does not match. Please try again.");
      return;
    }

    try {
      setLoading(true);
      closeSweetAlert();

      const response = await usersApi.deleteUser(user?.userId, {
        email: user?.email,
        reason: deletionReason,
      });

      if (!response.ok) {
        showSweetAlert({
          title: "Error",
          message: response.data?.error || "Failed to delete account.",
          type: "danger",
        });
        return;
      }

      showSweetAlert({
        title: "✓ Account Deleted",
        message: "Your account has been permanently deleted. Thank you for using our service.",
        type: "success",
        onConfirm: () => {
          logOut();
        },
      });
    } catch (requestError) {
      console.error("Failed to delete account:", requestError);
      showSweetAlert({
        title: "Error",
        message: "Network error. Please try again.",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ActivityIndicator visible={loading} />

      <Screen style={styles.screen} paddingSize="lg">
        <Text style={styles.title}>Privacy & Security</Text>
        <Text style={styles.subtitle}>
          Manage your password, privacy preferences, and account safety.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name="shield-lock-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>Password & Login</Text>
              <Text style={styles.rowSubTitle}>Update your password below</Text>
            </View>
          </View>

          <Form
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmNewPassword: "",
            }}
            onSubmit={handleChangePassword}
            validationSchema={changePasswordValidationSchema}
          >
            <ErrorMessage error={error} visible={!!error} />

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

            <Text style={styles.passwordHint}>
              💡 Must contain: 8+ characters, uppercase, lowercase, number, and special character (!@#$%^&*)
            </Text>

            <FormField
              autoCapitalize="none"
              autoCorrect={false}
              icon="lock"
              name="confirmNewPassword"
              placeholder="Confirm New Password"
              secureTextEntry
              textContentType="password"
            />

            <SubmitButton title="Change Password" color="secondary" />
          </Form>
        </View>

        <View style={styles.cardSpacing}>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconWrapDanger}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.danger} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.rowTitle}>Danger Zone</Text>
                <Text style={styles.rowSubTitle}>Delete your account permanently</Text>
              </View>
            </View>

            {deletionStep === 0 ? (
              <AppButton
                title="Delete Account"
                onPress={handleDeleteAccount}
                variant="danger"
              />
            ) : deletionStep === 2 ? (
              <ScrollView style={styles.deletionForm}>
                <Text style={styles.deletionStepTitle}>Step 1 of 2: Tell us why</Text>
                <Text style={styles.deletionStepSubtitle}>
                  Your feedback helps us improve. Please share your reason for leaving.
                </Text>
                <TextInput
                  style={styles.reasonInput}
                  placeholder="Tell us why you're deleting your account..."
                  placeholderTextColor={colors.medium}
                  value={deletionReason}
                  onChangeText={setDeletionReason}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  editable={!loading}
                />
                <Text style={styles.charCount}>
                  {deletionReason.length}/500
                </Text>
                <View style={styles.deletionButtons}>
                  <AppButton
                    title="Cancel"
                    onPress={() => {
                      setDeletionStep(0);
                      setDeletionReason("");
                    }}
                    variant="outline"
                    size="sm"
                    compact
                    inline
                  />
                  <AppButton
                    title="Continue"
                    onPress={handleContinueDeletion}
                    variant="danger"
                    size="sm"
                    compact
                    inline
                    disabled={deletionReason.trim().length < 10}
                  />
                </View>
              </ScrollView>
            ) : deletionStep === 3 ? (
              <ScrollView style={styles.deletionForm}>
                <Text style={styles.deletionStepTitle}>Step 2 of 2: Verify email</Text>
                <Text style={styles.deletionStepSubtitle}>
                  Enter your email to confirm account deletion. This action cannot be undone.
                </Text>
                <Text style={styles.emailLabel}>Account email: {user?.email}</Text>
                <TextInput
                  style={styles.emailInput}
                  placeholder="Enter your email to confirm"
                  placeholderTextColor={colors.medium}
                  value={confirmEmail}
                  onChangeText={setConfirmEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
                {confirmEmail && confirmEmail !== user?.email && (
                  <Text style={styles.emailError}>Email does not match</Text>
                )}
                <View style={styles.deletionButtons}>
                  <AppButton
                    title="Cancel"
                    onPress={() => {
                      setDeletionStep(0);
                      setConfirmEmail("");
                      setDeletionReason("");
                    }}
                    variant="outline"
                    size="sm"
                    compact
                    inline
                  />
                  <AppButton
                    title="Delete Account"
                    onPress={handleConfirmDeletion}
                    variant="danger"
                    size="sm"
                    compact
                    inline
                    disabled={confirmEmail !== user?.email || loading}
                  />
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Screen>

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
  screen: {
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 14,
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cardSpacing: {
    marginTop: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lighterGray,
    marginBottom: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.infoLight,
    marginRight: 10,
  },
  iconWrapDanger: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dangerLight,
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  rowSubTitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  passwordHint: {
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  deletionForm: {
    marginTop: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  deletionStepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  deletionStepSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    textAlignVertical: "top",
    marginBottom: 4,
    backgroundColor: colors.lighterGray,
  },
  emailInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
    backgroundColor: colors.lighterGray,
  },
  emailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
    backgroundColor: colors.infoLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  emailError: {
    fontSize: 12,
    color: colors.danger,
    marginBottom: 8,
    fontWeight: "600",
  },
  charCount: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "right",
    marginBottom: 12,
  },
  deletionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
});

export default PrivacySecurityScreen;
