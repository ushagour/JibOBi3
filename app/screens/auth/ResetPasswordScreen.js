import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import ActivityIndicator from "../../components/ActivityIndicator";
import Screen from "../../components/Screen";
import authApi from "../../api/auth";
import colors from "../../config/colors";
import { AuthFlowCard, AuthTextField } from "../../components/auth";

const getErrorMessage = (response, fallbackMessage) => {
  return response?.data?.error || response?.error?.response?.data?.error || fallbackMessage;
};

function ResetPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState(route?.params?.email || "");
  const [token, setToken] = useState(route?.params?.token || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim() || !token.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Missing information", "Please complete all fields before resetting password.");
      return;
    }

    if (newPassword.trim().length < 5) {
      Alert.alert("Weak password", "Password must be at least 5 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password mismatch", "New password and confirm password must match.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await authApi.resetPassword(email.trim(), token.trim().toUpperCase(), newPassword);
      if (!response.ok) {
        Alert.alert("Reset failed", getErrorMessage(response, "Unable to reset password."));
        return;
      }

      Alert.alert("Password updated", "Your password has been reset successfully.", [
        {
          text: "Back to Login",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Unable to reset password right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ActivityIndicator visible={loading} />
      <Screen style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <AuthFlowCard
                icon="shield-key"
                title="Reset Password"
                subtitle="Enter your email, reset token and a new password to secure your account."
              >
                <AuthTextField
                  label="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <AuthTextField
                  label="Reset token"
                  value={token}
                  onChangeText={setToken}
                  placeholder="Paste token"
                  autoCapitalize="characters"
                />

                <AuthTextField
                  label="New password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry
                  autoCapitalize="none"
                />

                <AuthTextField
                  label="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry
                  autoCapitalize="none"
                />

                <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword}>
                  <Text style={styles.primaryButtonText}>Reset Password</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.linkButton}>
                  <Text style={styles.linkButtonText}>Back to Login</Text>
                </TouchableOpacity>
              </AuthFlowCard>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  linkButton: {
    marginTop: 16,
    alignItems: "center",
  },
  linkButtonText: {
    color: colors.primary,
    fontWeight: "700",
  },
});

export default ResetPasswordScreen;
