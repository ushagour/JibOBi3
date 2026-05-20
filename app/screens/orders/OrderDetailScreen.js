import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Animated,
} from "react-native";
import dayjs from "dayjs";
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import AppButton from "../../components/Button";
import Avatar from "../../components/Avatar";
import AddReviewForm from "../../components/AddReviewForm";
import colors from "../../config/colors";
import useTheme from "../../hooks/useTheme";
import ordersApi from "../../api/orders";
import useAuth from "../../auth/useAuth";

const OrderDetailScreen = ({ route, navigation }) => {
  const { order: initialOrder } = route.params || {};
  const { user } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("behavior");
  const [selectedSeller, setSelectedSeller] = useState(null);

  const reportReasons = [
    { id: "behavior", label: "Inappropriate seller behavior", icon: "block-helper" },
    { id: "scam", label: "Suspicious or scam transaction", icon: "security" },
    { id: "quality", label: "Poor quality or condition mismatch", icon: "alert-circle" },
    { id: "nodelivery", label: "Non-delivery or incomplete order", icon: "package-x" },
    { id: "other", label: "Other issue", icon: "help" },
  ];

  useEffect(() => {
    if (initialOrder?.id) {
      fetchOrderDetail();
    }
  }, [initialOrder?.id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await ordersApi.getOrderById(initialOrder.id);
      if (response.ok && response.data) {
        setOrder(response.data);
      }
    } catch (error) {
      if (__DEV__) console.error("Failed to fetch order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = () => {
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
  };

  const handleReviewCreated = () => {
    closeReviewModal();
  };

  const handleReportPress = () => {
    const seller = order?.Listing?.User || order?.Listing?.owner || null;
    setSelectedSeller(seller);
    setSelectedReportReason("behavior");
    setReportModalVisible(true);
  };

  const submitReport = () => {
    const reason = reportReasons.find((item) => item.id === selectedReportReason);
    setReportModalVisible(false);
    Alert.alert(
      "Report submitted",
      `Thanks. We received your report for: ${reason?.label || selectedSeller?.name || "this seller"}. Our team will review it shortly.`
    );
    setSelectedSeller(null);
    setSelectedReportReason("behavior");
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setSelectedSeller(null);
    setSelectedReportReason("behavior");
  };

  if (!order) {
    return (
      <Screen style={styles.screen}>
        <Text>Order not found</Text>
      </Screen>
    );
  }

  const listing = order?.Listing;
  const buyer = order?.User;
  const seller = listing?.User || listing?.owner;
  const createdAt = dayjs(order?.createdAt).format("MMM D, YYYY [at] h:mm A");
  const imageUrl = listing?.images?.[0]?.url || listing?.Images?.[0]?.file_name || null;


  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return colors.success || "#27AE60";
      case "pending":
        return colors.warning || "#F39C12";
      case "cancelled":
        return colors.danger;
      default:
        return colors.medium;
    }
  };

  return (
    <Screen style={styles.screen} scrollable={false} paddingSize="lg">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Order ID */}
        <View style={styles.headerSection}>
          <Text style={styles.orderId}>Order #{order?.id}</Text>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(order?.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(order?.status) },
              ]}
            >
              {order?.status?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Order Date */}
        <Text style={styles.dateText}>{createdAt}</Text>

        {/* Buyer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buyer Information</Text>
          <View style={[styles.infoCard, { backgroundColor: themeColors.surface }]}>
            <View style={styles.userRow}>
              <Avatar
                name={buyer?.name}
                avatar={buyer?.avatar}
                size={40}
                bgColor={colors.primary}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{buyer?.name || "N/A"}</Text>
                <Text style={styles.userEmail}>{buyer?.email || "N/A"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Item Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          <View style={[styles.itemCard, { backgroundColor: themeColors.surface }]}>
            {imageUrl ? (
              <View
                style={{
                  width: "100%",
                  height: 150,
                  borderRadius: 10,
                  marginBottom: 12,
                  backgroundColor: colors.lightGray,
                  overflow: "hidden",
                }}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            ) : (
              <View
                style={[
                  {
                    width: "100%",
                    height: 150,
                    borderRadius: 10,
                    marginBottom: 12,
                    backgroundColor: colors.lightGray,
                  },
                  styles.placeholderImage,
                ]}
              >
                <MaterialCommunityIcons
                  name="image-off"
                  size={40}
                  color={colors.medium}
                />
              </View>
            )}

            <Text style={styles.itemTitle}>{listing?.title || "N/A"}</Text>
            <Text style={styles.itemDescription} numberOfLines={3}>
              {listing?.description || "No description"}
            </Text>

            <View style={styles.itemPriceRow}>
              <View>
                <Text style={styles.itemLabel}>Unit Price</Text>
                <Text style={styles.itemPrice}>
                  {listing?.price ? `${listing.price.toFixed(2)} MAD` : "N/A"}
                </Text>
              </View>
              <View>
                <Text style={styles.itemLabel}>Quantity</Text>
                <Text style={styles.itemPrice}>{order?.quantity || 1}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>
          <View style={[styles.infoCard, { backgroundColor: themeColors.surface }]}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={colors.primary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>
                  {order?.shipping_address || "N/A"}
                </Text>
              </View>
            </View>

            <View style={[styles.infoRow, styles.borderTop]}>
              <MaterialCommunityIcons
                name="phone"
                size={20}
                color={colors.primary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{order?.phone || "N/A"}</Text>
              </View>
            </View>

            {order?.notes && (
              <View style={[styles.infoRow, styles.borderTop]}>
                <MaterialCommunityIcons
                  name="note-text"
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Notes</Text>
                  <Text style={styles.infoValue}>{order.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={[styles.priceCard, { backgroundColor: themeColors.surface }]}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Unit Price</Text>
              <Text style={styles.priceValue}>
                {listing?.price ? `${listing.price.toFixed(2)} MAD` : "N/A"}
              </Text>
            </View>

            <View style={[styles.priceRow, styles.borderTop]}>
              <Text style={styles.priceLabel}>Quantity</Text>
              <Text style={styles.priceValue}>{order?.quantity || 1}</Text>
            </View>

            <View style={[styles.priceRow, styles.borderTop]}>
              <Text style={styles.priceLabelBold}>Total</Text>
              <Text style={styles.priceTotalValue}>
                {order?.total_price ? `${order.total_price.toFixed(2)} MAD` : "N/A"}
              </Text>
            </View>

            <View style={[styles.priceRow, styles.borderTop]}>
              <Text style={styles.priceLabel}>Payment Method</Text>
              <Text style={styles.priceValue}>
                {order?.payment_method === "cash_on_delivery"
                  ? "Cash on Delivery"
                  : order?.payment_method || "N/A"}
              </Text>
            </View>

            <View style={[styles.priceRow, styles.borderTop]}>
              <Text style={styles.priceLabel}>Payment Status</Text>
              <Text
                style={[
                  styles.priceValue,
                  {
                    color:
                      order?.payment_status === "paid"
                        ? colors.success || "#27AE60"
                        : colors.warning || "#F39C12",
                  },
                ]}
              >
                {order?.payment_status?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {order && order.status === "completed" && !order.hasReviewed && (

          <AppButton
            title="Leave Review"
            onPress={openReviewModal}
            variant="primary"
            size="md"
          />
        )}
        </View>

        <View style={styles.actionsSection}>
          {order.status === "completed" && (
          <AppButton
            title="Report Seller"
            onPress={handleReportPress}
            variant="outline"
            size="md"
          />
          )}
        </View>

        <View style={styles.actionsSection}>
          <AppButton
            title="Back to Orders"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="md"
          />
        </View>
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeReviewModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeReviewModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={[styles.reviewModalCard, { backgroundColor: themeColors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Leave a Review</Text>
              <TouchableOpacity onPress={closeReviewModal}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Share your rating and a quick note about this listing.
            </Text>

            {order?.Listing && (
              <AddReviewForm
                listing={order.Listing}
                onSuccess={handleReviewCreated}
              />
            )}
          </View>
        </View>
      </Modal>


          {/* Report Modal */}
          <Modal visible={reportModalVisible} transparent animationType="fade" onRequestClose={closeReportModal}>
            <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeReportModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          
              <Animated.View style={[styles.reportModalCard, { backgroundColor: themeColors.surface }] }>
                <LinearGradient colors={[colors.error, colors.error]} style={styles.reportModalHeader}>
              <Text style={styles.modalTitle}>Report Seller</Text>
              <TouchableOpacity onPress={closeReportModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
                </LinearGradient>
            
                <ScrollView showsVerticalScrollIndicator={false} style={styles.reportModalContent}>
              <Text style={styles.modalSubtitle}>
                Choose the reason that best matches the issue.
              </Text>
              <Text style={styles.reportSellerName}>
                Seller: {selectedSeller?.name || seller?.name || "Unknown seller"}
              </Text>
              
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
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.light,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
    color: colors.medium,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: "hidden",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    padding: 14,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  itemPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  itemLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  infoRow: {
    flexDirection: "row",
    padding: 14,
    gap: 12,
    alignItems: "flex-start",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  priceCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: "hidden",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 14,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  priceLabelBold: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  priceValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  priceTotalValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "700",
  },
  actionsSection: {
    marginBottom: 20,
    gap: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  reviewModalCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.medium,
    marginBottom: 20,
  },
  /* Report modal styles */
  reportModalCard: {
    width: '90%',
    borderRadius: 14,
    overflow: 'hidden',
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  reportModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.error,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  reportSellerName: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  reportModalContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 300,
  },
  reportReasonList: {
    paddingVertical: 6,
  },
  reportReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  reportReasonItemSelected: {
    backgroundColor: `${colors.error}20`,
  },
  reportReasonTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  reportReasonLabel: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  reportModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border || '#DDD',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: colors.textSecondary || '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default OrderDetailScreen;
