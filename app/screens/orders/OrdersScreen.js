import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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