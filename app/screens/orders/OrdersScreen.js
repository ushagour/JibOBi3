import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import colors from "../../config/colors";
import useAuth from "../../auth/useAuth";
import ordersApi from "../../api/orders";
import reviewsApi from "../../api/reviews";
import routes from "../../navigation/routes";
import OrderItem from "../../components/orders/OrderItem";

function OrdersScreen({ navigation }) {
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
      const normalizedOrders = userOrders.map((order) => ({
        ...order,
        normalizedStatus: String(order?.status ?? order?.orderStatus ?? "").trim().toLowerCase(),
      }));

      try {
        const listingIds = Array.from(
          new Set(normalizedOrders.map((o) => o.listing_id || (o.Listing && o.Listing.id)).filter(Boolean))
        );

        const reviewsResponses = await Promise.all(listingIds.map((id) => reviewsApi.getReviewsByListing(id)));

        const reviewedMap = {};
        for (let i = 0; i < listingIds.length; i++) {
          const id = listingIds[i];
          const res = reviewsResponses[i];
          reviewedMap[id] = !!(res && res.ok && Array.isArray(res.data) && res.data.some((r) => String(r.user_id || r.User?.id) === String(userId)));
        }

        setOrders(
          normalizedOrders.map((o) => ({
            ...o,
            hasReviewed: !!reviewedMap[o.listing_id || (o.Listing && o.Listing.id)],
          }))
        );
      } catch (err) {
        if (__DEV__) console.error("Failed to check reviews for orders", err);
        setOrders(normalizedOrders);
      }
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



  const handleCloseOrder = (order) => {
    Alert.alert(
      "Close order",
      "Mark this order as completed now that the item has been sold?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close",
          style: "default",
          onPress: async () => {
            try {
              const response = await ordersApi.updateOrderStatus(order.id, "completed");
              if (!response.ok) {
                Alert.alert("Error", "Could not close the order.");
                return;
              }

              setOrders((current) =>
                current.map((item) =>
                  String(item.id) === String(order.id)
                    ? { ...item, status: "completed", normalizedStatus: "completed" }
                    : item
                )
              );

              Alert.alert("Success", "Order closed successfully.");
            } catch (error) {
              if (__DEV__) console.error("Failed to close order:", error);
              Alert.alert("Error", "Could not close the order.");
            }
          },
        },
      ]
    );
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
          <Text style={styles.title}>My Orders</Text>
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
          />
        )}
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
});

export default OrdersScreen;