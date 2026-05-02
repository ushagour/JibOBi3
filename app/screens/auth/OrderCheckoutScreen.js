import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { CommonActions } from "@react-navigation/native";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import AppTextInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import colors from "../../config/colors";
import ordersApi from "../../api/orders";
import routes from "../../navigation/routes";
import useAuth from "../../auth/useAuth";

function parsePrice(value) {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
}

function OrderCheckoutScreen({ route, navigation }) {
  const { user } = useAuth();
  const listing = route?.params?.listing;

  const unitPrice = useMemo(() => parsePrice(listing?.price), [listing?.price]);

  const [quantity, setQuantity] = useState("1");
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const qtyValue = Math.max(1, parseInt(quantity, 10) || 1);
  const total = unitPrice * qtyValue;

  const handlePlaceOrder = async () => {
    if (!user?.userId) {
      Alert.alert("Sign in required", "Please sign in to place an order.");
      return;
    }

    if (!listing?.id) {
      Alert.alert("Error", "Listing not found.");
      return;
    }

    if (!shippingAddress.trim()) {
      Alert.alert("Missing address", "Please enter a shipping address.");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("Missing phone", "Please enter a phone number.");
      return;
    }

    setLoading(true);
    try {
      const response = await ordersApi.createOrder({
        listing_id: listing.id,
        buyer_id: user.userId,
        quantity: qtyValue,
        total_price: total,
        payment_method: "cash_on_delivery",
        payment_status: "pending",
        shipping_address: shippingAddress.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
      });

      if (!response.ok) {
        Alert.alert("Order failed", "Could not place order. Please try again.");
        return;
      }

      Alert.alert("Order placed", "Your order has been created successfully.", [
        {
          text: "View Orders",
          onPress: () => {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: "AccountHome" },
                  { name: routes.ORDERS },
                ],
              })
            );
          },
        },
      ]);
    } catch (error) {
      if (__DEV__) console.error("Create order failed:", error);
      Alert.alert("Order failed", "Could not place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.screen} paddingSize="lg">
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.subtitle}>Complete the details to place your order.</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {listing?.title || "Listing"}
        </Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Unit price</Text>
          <Text style={styles.summaryValue}>{unitPrice.toFixed(2)} MAD</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toFixed(2)} MAD</Text>
        </View>
      </View>

      <AppTextInput
        label="Quantity"
        placeholder="1"
        keyboardType="number-pad"
        value={quantity}
        onChangeText={setQuantity}
      />

      <AppTextInput
        label="Shipping Address"
        placeholder="City, street, apartment..."
        value={shippingAddress}
        onChangeText={setShippingAddress}
      />

      <AppTextInput
        label="Phone"
        placeholder="06XXXXXXXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <AppTextInput
        label="Notes (optional)"
        placeholder="Any delivery notes"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <AppButton
        title={loading ? "Placing..." : "Place Order"}
        onPress={handlePlaceOrder}
        loading={loading}
        variant="primary"
        size="md"
      />

      <AppButton
        title="Back to Listing"
        onPress={() => navigation.goBack()}
        variant="outline"
        size="md"
      />
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
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    padding: 14,
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
});

export default OrderCheckoutScreen;
