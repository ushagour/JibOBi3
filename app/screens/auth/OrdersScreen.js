import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View, Modal, TouchableWithoutFeedback } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import colors from "../../config/colors";
import useAuth from "../../auth/useAuth";
import ordersApi from "../../api/orders";
import routes from "../../navigation/routes";
import { OrderCard } from "../../components/orders";
import AddReviewForm from "../../components/AddReviewForm";
import AppButton from "../../components/Button";

function OrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const userId = user?.userId;
  const isLoggedIn = Boolean(userId);


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

  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setReviewModalVisible(true);
  };

  const closeReviewModal = () => {
    setReviewModalVisible(false);
    setSelectedOrder(null);
  };

  const handleReviewCreated = () => {
    closeReviewModal();
    // Optional: Refresh orders if needed
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
          <Text style={styles.title}>Orders</Text>
          <Text style={styles.subtitle}>Track your recent purchases.</Text>
        </View>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>{totalCount}</Text>
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
        renderItem={({ item }) => {
          const listingId = item?.Listing?.id || item?.listing_id;

          return (
            <View style={styles.orderItemWrapper}>
              <OrderCard
                order={item}
                onPress={
                  listingId
                    ? () => navigation.navigate(routes.LISTING_DETAILS, { id: listingId })
                    : undefined
                }
              />
              <AppButton
                title="Leave Review"
                onPress={() => openReviewModal(item)}
                variant="secondary"
                size="sm"
                fullWidth={false}
                compact
              />
            </View>
          );
        }}
      />

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

          <View style={styles.reviewModalCard}>
            <Text style={styles.modalTitle}>Leave a Review</Text>
            <Text style={styles.modalSubtitle}>
              Share your rating and a quick note about this listing.
            </Text>

            {selectedOrder?.Listing && (
              <AddReviewForm 
                listing={selectedOrder.Listing} 
                onSuccess={handleReviewCreated}
              />
            )}

            <View style={styles.modalActions}>
              <AppButton
                title="Close"
                onPress={closeReviewModal}
                variant="outline"
                size="sm"
                fullWidth={false}
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
  badgeWrap: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginTop: 2,
  },
  badgeText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 18,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    gap: 10,
  },
  emptyText: {
    color: colors.medium,
    fontSize: 14,
  },
  orderItemWrapper: {
    marginBottom: 12,
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
  reviewModalCard: {
    width: "100%",
    maxWidth: 420,
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
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 16,
  },
});

export default OrdersScreen;