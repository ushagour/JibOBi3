import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import colors from "../../config/colors";
import useAuth from "../../auth/useAuth";
import ordersApi from "../../api/orders";

function getStatusMeta(status) {
  if (status === "completed") return { label: "Completed", color: colors.success, icon: "check-circle-outline" };
  if (status === "cancelled") return { label: "Cancelled", color: colors.danger, icon: "close-circle-outline" };
  return { label: "Pending", color: colors.warning, icon: "clock-outline" };
}

function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
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
    <Screen style={styles.screen} paddingSize="lg">
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
          const statusMeta = getStatusMeta(item.status);
          const listingTitle = item.Listing?.title || item.listing?.title || "Order";
          const totalPrice = item.total_price ?? item.total_amount;

          return (
            <View style={styles.card}>
              <View style={styles.cardTopRow}>
                <Text style={styles.orderTitle} numberOfLines={1}>{listingTitle}</Text>
                <View style={styles.statusPill}>
                  <MaterialCommunityIcons name={statusMeta.icon} size={12} color={statusMeta.color} />
                  <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Total: {totalPrice != null ? `$${totalPrice}` : "N/A"}</Text>
                <Text style={styles.metaText}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</Text>
              </View>

              {item.shipping_address ? <Text style={styles.addressText} numberOfLines={2}>{item.shipping_address}</Text> : null}
            </View>
          );
        }}
      />
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
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  orderTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.lightGray,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  addressText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.medium,
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
});

export default OrdersScreen;