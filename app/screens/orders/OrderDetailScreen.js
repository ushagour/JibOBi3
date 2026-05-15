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
} from "react-native";
import dayjs from "dayjs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

  if (!order) {
    return (
      <Screen style={styles.screen}>
        <Text>Order not found</Text>
      </Screen>
    );
  }

  const listing = order?.Listing;
  const buyer = order?.User;
  const createdAt = dayjs(order?.createdAt).format("MMM D, YYYY [at] h:mm A");
  const imageUrl = listing?.images?.[0]?.url;


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
          <AppButton
            title="Leave Review"
            onPress={openReviewModal}
            variant="primary"
            size="md"
          />
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
});

export default OrderDetailScreen;
