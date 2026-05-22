import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import ActivityIndicator from "../../components/ActivityIndicator";
import authApi from "../../api/auth";
import colors from "../../config/colors";

function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenRequested, setTokenRequested] = useState(false);

  const requestResetToken = async () => {
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.requestPasswordReset(email.trim());
      if (!response.ok) {
        Alert.alert("Request failed", response.data?.error || "Unable to generate a reset token.");
        return;
      }

      setResetToken(response.data?.resetToken || "");
      setTokenRequested(true);
      Alert.alert(
        "Reset token generated",
        "Use the token shown on this screen to reset your password."
      );
    } catch (error) {
      Alert.alert("Error", "Unable to request a reset token right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim() || !resetToken.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert("Missing information", "Fill in all fields before resetting your password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Password mismatch", "The new password and confirmation do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.resetPassword(email.trim(), resetToken.trim(), newPassword);
      if (!response.ok) {
        Alert.alert("Reset failed", response.data?.error || "Unable to reset password.");
        return;
      }

      Alert.alert("Success", "Your password has been updated.", [
        { text: "Back to login", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (error) {
      Alert.alert("Error", "Unable to reset password right now.");
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
              <View style={styles.card}>
                <LinearGradient colors={[colors.primaryDark, colors.primaryLight]} style={styles.iconWrap}>
                  <MaterialCommunityIcons name="lock-reset" size={34} color="#FFF" />
                </LinearGradient>

                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>
                  Request a reset token, then use it to set a new password.
                </Text>

                <View style={styles.field}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>

                <TouchableOpacity style={styles.primaryButton} onPress={requestResetToken}>
                  <LinearGradient colors={[colors.primaryDark, colors.primaryLight]} style={styles.buttonGradient}>
                    <Text style={styles.primaryButtonText}>Send Reset Token</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {tokenRequested ? (
                  <View style={styles.tokenBox}>
                    <Text style={styles.tokenLabel}>Reset Token</Text>
                    <Text selectable style={styles.tokenValue}>
                      {resetToken}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.field}>
                  <Text style={styles.label}>Reset Token</Text>
                  <TextInput
                    value={resetToken}
                    onChangeText={setResetToken}
                    placeholder="Paste the token here"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="characters"
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter a new password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your new password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>

                <TouchableOpacity style={styles.secondaryButton} onPress={handleResetPassword}>
                  <Text style={styles.secondaryButtonText}>Reset Password</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.backLink}>
                  <Text style={styles.backLinkText}>Back to login</Text>
                </TouchableOpacity>
              </View>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.background,
    color: colors.textPrimary,
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  tokenBox: {
    backgroundColor: `${colors.primary}12`,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  tokenValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: 1.5,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  secondaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backLink: {
    marginTop: 18,
    alignItems: "center",
  },
  backLinkText: {
    color: colors.primary,
    fontWeight: "700",
  },
});

export default ForgotPasswordScreen;