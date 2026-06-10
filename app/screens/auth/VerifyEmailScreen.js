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

function VerifyEmailScreen({ navigation, route }) {
  const [email, setEmail] = useState(route?.params?.email || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);

  const handleRequestCode = async () => {
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address first.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await authApi.requestEmailVerification(email.trim());
      if (!response.ok) {
        Alert.alert("Request failed", getErrorMessage(response, "Unable to request verification code."));
        return;
      }

      setCodeRequested(true);
      const previewCode = response?.data?.verificationCode;
      Alert.alert(
        "Verification code sent",
        previewCode
          ? `Your verification code is ${previewCode}`
          : "Check your inbox for a verification code."
      );
    } catch (error) {
      Alert.alert("Error", "Unable to request verification code right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!email.trim() || !verificationCode.trim()) {
      Alert.alert("Missing information", "Please enter both email and verification code.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await authApi.verifyEmail(email.trim(), verificationCode.trim().toUpperCase());
      if (!response.ok) {
        Alert.alert("Verification failed", getErrorMessage(response, "Unable to verify email."));
        return;
      }

      Alert.alert("Email verified", "Your email has been verified successfully.", [
        {
          text: "Continue",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Unable to verify email right now. Please try again.");
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
                icon="email-check-outline"
                title="Verify Email"
                subtitle="Use the verification code sent to your email to activate your account."
              >
                <AuthTextField
                  label="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity style={styles.secondaryButton} onPress={handleRequestCode}>
                  <Text style={styles.secondaryButtonText}>
                    {codeRequested ? "Resend Verification Code" : "Send Verification Code"}
                  </Text>
                </TouchableOpacity>

                <AuthTextField
                  label="Verification code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="Enter verification code"
                  autoCapitalize="characters"
                />

                <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyEmail}>
                  <Text style={styles.primaryButtonText}>Verify Email</Text>
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
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: `${colors.primary}14`,
    marginBottom: 14,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
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

export default VerifyEmailScreen;
