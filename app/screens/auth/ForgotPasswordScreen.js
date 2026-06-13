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

import Screen from "../../components/Screen";
import ActivityIndicator from "../../components/ActivityIndicator";
import authApi from "../../api/auth";
import colors from "../../config/colors";
import { AuthFlowCard, AuthTextField } from "../../components/auth";

const getErrorMessage = (response, fallbackMessage) => {
  return response?.data?.error || response?.error?.response?.data?.error || fallbackMessage;
};

function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  const requestResetToken = async () => {
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const response = await authApi.requestPasswordReset(email.trim());
      if (!response.ok) {
        Alert.alert("Request failed", getErrorMessage(response, "Unable to generate reset token."));
        return;
      }

      const nextToken = response?.data?.resetToken || "";
      setResetToken(nextToken);

      Alert.alert(
        "Reset token sent",
        nextToken
          ? `Your reset token is ${nextToken}`
          : "Check your inbox for your reset token.",
        [
          {
            text: "Continue",
            onPress: () =>
              navigation.navigate("ResetPassword", {
                email: email.trim(),
                token: nextToken,
              }),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Unable to request reset token right now.");
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
                icon="lock-reset"
                title="Forgot Password"
                subtitle="Request a reset token, then continue to create a new password."
              >
                <AuthTextField
                  label="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity style={styles.primaryButton} onPress={requestResetToken}>
                  <Text style={styles.primaryButtonText}>Send Reset Token</Text>
                </TouchableOpacity>

                {resetToken ? (
                  <View style={styles.tokenBox}>
                    <Text style={styles.tokenLabel}>Reset</Text>
                    <Text selectable style={styles.tokenValue}>
                      {resetToken}
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => navigation.navigate("ResetPassword", { email, token: resetToken })}
                >
                  <Text style={styles.secondaryButtonText}>I Have a Token</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.backLink}>
                  <Text style={styles.backLinkText}>Back to Login</Text>
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
    marginBottom: 14,
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
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: `${colors.primary}14`,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
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
  verifyLink: {
    marginTop: 12,
    alignItems: "center",
  },
  verifyLinkText: {
    color: colors.secondaryDark,
    fontWeight: "600",
  },
});

export default ForgotPasswordScreen;