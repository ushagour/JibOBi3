import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View, Modal, TouchableWithoutFeedback, Animated, Platform, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import colors from "../../config/colors";
import useAuth from "../../auth/useAuth";
import ordersApi from "../../api/orders";
import routes from "../../navigation/routes";
import OrderItem from "../../components/orders/OrderItem";

function OrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("spam");
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const userId = user?.userId;
  const isLoggedIn = Boolean(userId);

  const reportReasons = [
    { id: "behavior", label: "Inappropriate seller behavior", icon: "block-helper" },
    { id: "scam", label: "Suspicious or scam transaction", icon: "security" },
    { id: "quality", label: "Poor quality or condition mismatch", icon: "alert-circle" },
    { id: "nodelivery", label: "Non-delivery or incomplete order", icon: "package-x" },
    { id: "other", label: "Other issue", icon: "help" },
  ];


  const loadOrders = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await ordersApi.getOrders();
      if (!response.ok || !response.data) {
        Alert.alert("Error", "Could not load orders.");
        return;
      }

      const userOrders = response.data.filter((order) => String(order.buyer_id) === String(userId));
      setOrders(userOrders);
      
    } catch (error) {
      if (__DEV__) console.error("Failed to load orders:", error);
      Alert.alert("Error", "Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [userId]);

  const handleReportSeller = (order, seller) => {
    setSelectedOrder(order);
    setSelectedSeller(seller);
    setSelectedReportReason("behavior");
    setReportModalVisible(true);
  };

  const submitReport = () => {
    const reason = reportReasons.find((item) => item.id === selectedReportReason);
    setReportModalVisible(false);
    Alert.alert(
      "Report submitted",
      `Thanks. We received your report for: ${reason?.label || "this seller"}. Our team will review it shortly.`
    );
    setSelectedSeller(null);
    setSelectedOrder(null);
    setSelectedReportReason("behavior");
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setSelectedSeller(null);
    setSelectedOrder(null);
    setSelectedReportReason("behavior");
  };

  const totalCount = orders.length;

  if (!isLoggedIn) {
    return (
      <Screen style={styles.screen} paddingSize="lg">
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cart-outline" size={34} color={colors.medium} />
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Sign in to view your purchases.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen  scrollable={false} style={styles.screen} paddingSize="lg">
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.subtitle}>You have {totalCount} orders</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={loadOrders}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="receipt-text-outline" size={34} color={colors.medium} />
            <Text style={styles.emptyText}>No orders yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <OrderItem
            order={item}
            onPress={() => navigation.navigate(routes.ORDER_DETAILS, { order: item })}
            onReport={handleReportSeller}
          />
        )}
      />

      {/* Report Modal */}
      <Modal visible={reportModalVisible} transparent animationType="fade" onRequestClose={closeReportModal}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeReportModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          
          <Animated.View style={styles.reportModalCard}>
            <LinearGradient colors={[colors.error, colors.error]} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Seller</Text>
              <TouchableOpacity onPress={closeReportModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.reportModalContent}>
              <Text style={styles.modalSubtitle}>Choose the reason that best matches the issue.</Text>
              
              <FlatList
                data={reportReasons}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.reportReasonList}
                renderItem={({ item }) => {
                  const selected = item.id === selectedReportReason;
                  return (
                    <TouchableOpacity
                      style={[styles.reportReasonItem, selected && styles.reportReasonItemSelected]}
                      onPress={() => setSelectedReportReason(item.id)}
                    >
                      <MaterialCommunityIcons 
                        name={item.icon} 
                        size={22} 
                        color={selected ? colors.error : colors.textSecondary} 
                      />
                      <View style={styles.reportReasonTextWrap}>
                        <Text style={[styles.reportReasonLabel, selected && { color: colors.error }]}>
                          {item.label}
                        </Text>
                      </View>
                      <MaterialIcons
                        name={selected ? "radio-button-checked" : "radio-button-unchecked"}
                        size={22}
                        color={selected ? colors.error : colors.textMuted}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            </ScrollView>
            
            <View style={styles.reportModalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeReportModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={submitReport}>
                <LinearGradient colors={[colors.error, colors.error]} style={styles.submitButtonGradient}>
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
  orderItemWrapper: {
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.medium,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  reportModalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.background || "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  reportModalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSecondary || "#666",
    marginBottom: 12,
  },
  reportReasonList: {
    paddingVertical: 8,
  },
  reportReasonItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border || "#DDD",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  reportReasonItemSelected: {
    borderColor: colors.error,
    backgroundColor: `${colors.error}15`,
  },
  reportReasonTextWrap: {
    flex: 1,
  },
  reportReasonLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary || "#000",
  },
  reportModalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border || "#DDD",
  },
  cancelButtonText: {
    color: colors.textSecondary || "#666",
    fontSize: 15,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  submitButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default OrdersScreen;