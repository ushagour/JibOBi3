import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, ScrollView, TextInput, Switch, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Yup from "yup";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import colors from "../../config/colors";
import useTheme from "../../hooks/useTheme";
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

// Storage keys
const BIOMETRIC_ENABLED_KEY = "@biometric_enabled";

function PrivacySecurityScreen() {
  const { user, logOut } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [deletionStep, setDeletionStep] = useState(0);
  const [deletionReason, setDeletionReason] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  
  // Face ID / Biometric states
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);
  const [biometricLoading, setBiometricLoading] = useState(false);
  
  const [sweetAlert, setSweetAlert] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
    showCancel: false,
    onConfirm: null,
  });

  // Check biometric availability on mount
  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricPreference();
  }, []);

  // Check if device supports biometric authentication
  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (hasHardware && isEnrolled) {
        setIsBiometricAvailable(true);
        
        // Determine biometric type
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType("face-id");
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType("touch-id");
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.Iris)) {
          setBiometricType("iris");
        }
      } else {
        setIsBiometricAvailable(false);
      }
    } catch (error) {
      console.error("Biometric availability check failed:", error);
      setIsBiometricAvailable(false);
    }
  };

  // Load saved biometric preference
  const loadBiometricPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      setIsBiometricEnabled(saved === "true");
    } catch (error) {
      console.error("Failed to load biometric preference:", error);
    }
  };

  // Save biometric preference
  const saveBiometricPreference = async (enabled) => {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled.toString());
      setIsBiometricEnabled(enabled);
    } catch (error) {
      console.error("Failed to save biometric preference:", error);
    }
  };

  // Handle biometric authentication
  const authenticateWithBiometrics = async () => {
    if (!isBiometricAvailable) {
      showSweetAlert({
        title: "Not Available",
        message: "Biometric authentication is not available on this device or not set up.",
        type: "warning",
      });
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate to ${isBiometricEnabled ? 'disable' : 'enable'} biometric login`,
        fallbackLabel: "Use password instead",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        const newState = !isBiometricEnabled;
        await saveBiometricPreference(newState);
        
        showSweetAlert({
          title: newState ? "✓ Face ID Enabled" : "✓ Face ID Disabled",
          message: newState 
            ? "You can now log in using Face ID / biometric authentication."
            : "Biometric login has been disabled. You'll use your password to log in.",
          type: "success",
        });
        return true;
      } else {
        showSweetAlert({
          title: "Authentication Failed",
          message: "Could not verify your identity. Please try again.",
          type: "danger",
        });
        return false;
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      showSweetAlert({
        title: "Error",
        message: "Failed to authenticate. Please try again.",
        type: "danger",
      });
      return false;
    }
  };

  // Toggle biometric login
  const handleToggleBiometric = async () => {
    if (!isBiometricAvailable) {
      showSweetAlert({
        title: "Biometric Not Available",
        message: "Your device doesn't support Face ID / Touch ID or it's not set up. Please go to device settings to enable it.",
        type: "warning",
      });
      return;
    }

    setBiometricLoading(true);
    await authenticateWithBiometrics();
    setBiometricLoading(false);
  };

  // Get biometric icon and label
  const getBiometricInfo = () => {
    switch (biometricType) {
      case "face-id":
        return { icon: "face-recognition", label: "Face ID", description: "Use Face ID to quickly log in to your account" };
      case "touch-id":
        return { icon: "fingerprint", label: "Touch ID", description: "Use your fingerprint to quickly log in to your account" };
      case "iris":
        return { icon: "eye", label: "Iris Scan", description: "Use iris scan to quickly log in to your account" };
      default:
        return { icon: "shield-account", label: "Biometric", description: "Use biometric authentication to quickly log in" };
    }
  };

  const biometricInfo = getBiometricInfo();

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

      // Clear biometric preference on account deletion
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY);

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
      <ActivityIndicator visible={loading || biometricLoading} />

      <Screen style={styles.screen} paddingSize="lg">
        <Text style={styles.subtitle}>
          Manage your password, privacy preferences, and account safety.
        </Text>

        {/* Face ID / Biometric Section */}
        <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <View style={styles.row}>
            <View style={styles.iconWrapBiometric}>
              <MaterialCommunityIcons 
                name={biometricInfo.icon} 
                size={18} 
                color={colors.primary} 
              />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.rowTitle}>{biometricInfo.label} Login</Text>
              <Text style={styles.rowSubTitle}>{biometricInfo.description}</Text>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={handleToggleBiometric}
              disabled={!isBiometricAvailable || biometricLoading}
              trackColor={{ false: colors.lightGray, true: colors.primary + "80" }}
              thumbColor={isBiometricEnabled ? colors.primary : colors.white}
              ios_backgroundColor={colors.lightGray}
            />
          </View>
          
          {!isBiometricAvailable && (
            <View style={styles.biometricWarning}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={colors.warning} />
              <Text style={styles.biometricWarningText}>
                Face ID / Touch ID not available. Please set up biometric authentication in your device settings.
              </Text>
            </View>
          )}
          
          {isBiometricEnabled && (
            <View style={styles.biometricInfo}>
              <MaterialCommunityIcons name="information" size={14} color={colors.textSecondary} />
              <Text style={styles.biometricInfoText}>
                You can now log in using {biometricInfo.label} instead of your password.
              </Text>
            </View>
          )}
        </View>

        {/* Password Section */}
        <View style={[styles.card, styles.passwordCard, { backgroundColor: themeColors.surface }]}>
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

        {/* Danger Zone */}
        <View style={styles.cardSpacing}>
          <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
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
  passwordCard: {
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
  iconWrapBiometric: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight || `${colors.primary}20`,
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
  biometricWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.warning}15`,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },
  biometricWarningText: {
    flex: 1,
    fontSize: 12,
    color: colors.warning,
  },
  biometricInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${colors.primary}10`,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },
  biometricInfoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
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