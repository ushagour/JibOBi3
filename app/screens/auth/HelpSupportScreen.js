import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Alert, Linking, ScrollView, Modal, TouchableWithoutFeedback } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import colors from "../../config/colors";
import useTheme from "../../hooks/useTheme";
import AppButton from "../../components/Button";

const FAQs = [
  {
    id: 1,
    question: "How do I create a listing?",
    answer: "Tap the '+' button at the bottom of the app, fill in the listing details, add photos, and submit. Your listing will be reviewed before going live.",
  },
  {
    id: 2,
    question: "How do I place an order?",
    answer: "Browse listings, tap on an item you like, click 'Order Now', fill in your shipping address and preferences, then confirm your order.",
  },
  {
    id: 3,
    question: "How does payment work?",
    answer: "We use Cash on Delivery (COD) for all transactions. Pay the seller directly when you receive your item.",
  },
  {
    id: 4,
    question: "Can I cancel my order?",
    answer: "You can cancel orders within 24 hours of placement. Go to Orders, select your order, and tap 'Cancel'.",
  },
  {
    id: 5,
    question: "How do I contact a seller?",
    answer: "Go to the listing details and tap 'Contact Seller' to reach them via phone, email, or WhatsApp.",
  },
  {
    id: 6,
    question: "How do I report a listing?",
    answer: "If you find inappropriate content, tap the 'Report' button on the listing details to submit a report.",
  },
];

const SUPPORT_EMAIL = "support@jibobi.com";
const SUPPORT_PHONE = "+1234567890";

function HelpSupportScreen() {
  const { colors: themeColors, isDark } = useTheme();
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleEmailSupport = async () => {
    try {
      const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=Support Request&body=Hello, I need help with...`;
      const supported = await Linking.canOpenURL(emailUrl);
      if (supported) {
        await Linking.openURL(emailUrl);
        setContactModalVisible(false);
      } else {
        Alert.alert("Email not available", "No email app configured on this device.");
      }
    } catch (error) {
      if (__DEV__) console.error("Error opening email:", error);
      Alert.alert("Error", "Unable to open email app.");
    }
  };

  const handlePhoneSupport = async () => {
    try {
      const phoneUrl = `tel:${SUPPORT_PHONE}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
        setContactModalVisible(false);
      } else {
        Alert.alert("Call not available", "Your device cannot make phone calls.");
      }
    } catch (error) {
      if (__DEV__) console.error("Error opening dialer:", error);
      Alert.alert("Error", "Unable to open dialer.");
    }
  };

  const handleWhatsAppSupport = async () => {
    try {
      const phoneNumber = SUPPORT_PHONE.replace(/\D/g, "");
      const message = encodeURIComponent("Hello, I need help with Jibobi...");
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      const supported = await Linking.canOpenURL(whatsappUrl);
      if (supported) {
        await Linking.openURL(whatsappUrl);
        setContactModalVisible(false);
      } else {
        Alert.alert("WhatsApp unavailable", "WhatsApp is not installed or the link cannot be opened.");
      }
    } catch (error) {
      if (__DEV__) console.error("Error opening WhatsApp:", error);
      Alert.alert("Error", "Unable to open WhatsApp.");
    }
  };

  return (
    <Screen style={styles.screen} paddingSize="lg" scrollable={false}>
      <Text style={styles.subtitle}>Find answers, contact support, and get help with your account.</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* FAQs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chat-question-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          </View>

          <View style={[styles.faqContainer, { backgroundColor: themeColors.surface }]}>
            {FAQs.map((faq, index) => (
              <View key={faq.id}>
                <TouchableOpacity
                  style={[styles.faqItem, expandedFAQ === faq.id && styles.faqItemExpanded, { backgroundColor: themeColors.surface }]}
                  onPress={() => toggleFAQ(faq.id)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={styles.faqQuestionText} numberOfLines={expandedFAQ === faq.id ? undefined : 2}>
                      {faq.question}
                    </Text>
                  </View>
                  <MaterialIcons
                    name={expandedFAQ === faq.id ? "expand-less" : "expand-more"}
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                {expandedFAQ === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}

                {index < FAQs.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Contact Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="headset" size={20} color={colors.secondary} />
            <Text style={styles.sectionTitle}>Contact Support</Text>
          </View>

          <View style={[styles.contactCard, { backgroundColor: themeColors.surface }]}>
            <Text style={styles.contactDescription}>
              Have a question we didn't answer? Our support team is ready to help!
            </Text>

            <AppButton
              title="Get in Touch"
              onPress={() => setContactModalVisible(true)}
              variant="primary"
              size="md"
              icon={<MaterialCommunityIcons name="message-text" size={18} color={colors.white} />}
              style={styles.contactButton}
            />

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={18} color={colors.secondary} />
                <Text style={styles.infoText}>{SUPPORT_EMAIL}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="phone" size={18} color={colors.secondary} />
                <Text style={styles.infoText}>{SUPPORT_PHONE}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={colors.warning} />
            <Text style={styles.sectionTitle}>Quick Tips</Text>
          </View>

          <View style={styles.tipsContainer}>
            <View style={[styles.tip, { backgroundColor: themeColors.surface }]}>
              <View style={styles.tipIcon}>
                <MaterialIcons name="check-circle" size={20} color={colors.success} />
              </View>
              <Text style={styles.tipText}>Complete your profile to increase trust with buyers</Text>
            </View>
            <View style={[styles.tip, { backgroundColor: themeColors.surface }]}>
              <View style={styles.tipIcon}>
                <MaterialIcons name="check-circle" size={20} color={colors.success} />
              </View>
              <Text style={styles.tipText}>Upload clear photos for better listing visibility</Text>
            </View>
            <View style={[styles.tip, { backgroundColor: themeColors.surface }]}>
              <View style={styles.tipIcon}>
                <MaterialIcons name="check-circle" size={20} color={colors.success} />
              </View>
              <Text style={styles.tipText}>Respond quickly to buyer inquiries</Text>
            </View>
            <View style={[styles.tip, { backgroundColor: themeColors.surface }]}>
              <View style={styles.tipIcon}>
                <MaterialIcons name="check-circle" size={20} color={colors.success} />
              </View>
              <Text style={styles.tipText}>Leave reviews after purchases to help others</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Contact Modal */}
      <Modal
        visible={contactModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setContactModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setContactModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.contactModal}>
            <Text style={styles.modalTitle}>Contact Support</Text>
            <Text style={styles.modalSubtitle}>Choose how you want to reach us</Text>

            <View style={styles.contactOptions}>
              <AppButton
                title="Send Email"
                onPress={handleEmailSupport}
                variant="primary"
                size="sm"
                fullWidth={false}
                compact
                inline
                icon={<MaterialIcons name="email" size={18} color={colors.white} />}
              />
              <AppButton
                title="Call Now"
                onPress={handlePhoneSupport}
                variant="secondary"
                size="sm"
                fullWidth={false}
                compact
                inline
                icon={<MaterialCommunityIcons name="phone" size={18} color={colors.white} />}
              />
              <AppButton
                title="WhatsApp"
                onPress={handleWhatsAppSupport}
                variant="success"
                size="sm"
                fullWidth={false}
                compact
                inline
                icon={<MaterialCommunityIcons name="whatsapp" size={18} color={colors.white} />}
              />
            </View>

            <View style={styles.modalActions}>
              <AppButton
                title="Close"
                onPress={() => setContactModalVisible(false)}
                variant="outline"
                size="sm"
                fullWidth={false}
                compact
                inline
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
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
    marginBottom: 6,
  },
  subtitle: {
    marginBottom: 20,
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  faqContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: "hidden",
  },
  faqItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
  },
  faqItemExpanded: {
    backgroundColor: colors.infoLight,
  },
  faqQuestion: {
    flex: 1,
    marginRight: 12,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    lineHeight: 20,
  },
  faqAnswer: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.infoLight,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  faqAnswerText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
  },
  contactCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    padding: 16,
  },
  contactDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 20,
  },
  contactButton: {
    marginBottom: 16,
  },
  infoContainer: {
    gap: 10,
    marginTop: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  tipsContainer: {
    gap: 10,
  },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    gap: 10,
  },
  tipIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  contactModal: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  contactOptions: {
    marginVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
});

export default HelpSupportScreen;
