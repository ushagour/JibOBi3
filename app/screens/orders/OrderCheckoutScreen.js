import React, { useMemo, useState, useRef } from "react";
import { Alert, StyleSheet, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// import MapView, { Marker } from "react-native-maps";//todo it woeks on  developemt build 

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import AppTextInput from "../../components/TextInput";
import AppButton from "../../components/Button";
import colors from "../../config/colors";
import useTheme from "../../hooks/useTheme";
import ordersApi from "../../api/orders";
import routes from "../../navigation/routes";
import useAuth from "../../auth/useAuth";
import listings from "../../api/listings";

function parsePrice(value) {
  const numeric = Number(value);
  return Number.isNaN(numeric) ? 0 : numeric;
}

function OrderCheckoutScreen({ route, navigation }) {
  const { user } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const listing = route?.params?.listing;
  const location = listing?.location;
  
  // Ref to prevent duplicate submissions
  const submissionInProgressRef = useRef(false);

  const unitPrice = useMemo(() => parsePrice(listing?.price), [listing?.price]);

  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = unitPrice * quantity;

  const handlePlaceOrder = async () => {
    // Prevent duplicate submissions
    if (submissionInProgressRef.current || loading) {
      if (__DEV__) console.warn("Order submission already in progress");
      return;
    }

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

    if (!agreeToTerms) {
      Alert.alert("Terms required", "Please agree to the terms and conditions.");
      return;
    }

    // Mark submission as in progress
    submissionInProgressRef.current = true;
    setLoading(true);

    try {
      const response = await ordersApi.createOrder({
        listing_id: listing.id,
        buyer_id: user.userId,
        quantity: quantity,
        total_price: total,
        payment_method: "cash_on_delivery",
        payment_status: "pending",
        shipping_address: shippingAddress.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
      });

      if (!response.ok) {
        Alert.alert("Order failed", "Could not Confirm Request. Please try again.");
        // Allow retry
        submissionInProgressRef.current = false;
        return;
      }

      // Get the created order data
      const createdOrderRaw = response.data;

      // Normalize order object to ensure `id` exists (server may return different key names)
      const createdOrder = {
        ...createdOrderRaw,
        id:
          createdOrderRaw?.id ||
          createdOrderRaw?.order_id ||
          createdOrderRaw?.orderId ||
          createdOrderRaw?.order?.id ||
          null,
      };

      if (__DEV__) console.log("Created order response:", createdOrderRaw, createdOrder);

      Alert.alert("Order placed", "Your order has been created successfully.", [
        {
          text: "View Order Details",
          onPress: () => {
            // Navigate to order details screen with the created order
            // Pass the order with all available data for the details screen to use
            const orderToPass = {
              ...createdOrderRaw,
              id: createdOrder.id,
            };
            
            if (__DEV__) console.log("Navigating to order details with:", orderToPass);
            
            navigation.navigate(routes.ORDER_DETAILS, {
              order: orderToPass,
            });
          },
        },
        {
          text: "OK",
          onPress: () => {
            // Navigate to orders list
            navigation.navigate(routes.ORDERS);
          },
        },
      ]);
    } catch (error) {
      if (__DEV__) console.error("Create order failed:", error);
      Alert.alert("Order failed", "Could not Confirm Request. Please try again.");
      // Allow retry on error
      submissionInProgressRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.screen} paddingSize="lg">
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.subtitle}>Complete the details to place your order.</Text>

      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
          />
        </MapView>
       )} 

      <View style={[styles.summaryCard, { backgroundColor: themeColors.surface }]}>
        <Text style={styles.listingTitle} numberOfLines={2}>
          {listing?.title || "Listing"}
        </Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Unit price</Text>
          <Text style={styles.summaryValue}>{unitPrice.toFixed(2)} DH</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Quantity</Text>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              style={[styles.quantityBtn, loading && styles.disabledBtn]}
              disabled={loading}
            >
              <Ionicons name="remove" size={18} color={loading ? colors.medium : colors.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={[styles.quantityBtn, loading && styles.disabledBtn]}
              disabled={loading}
            >
              <Ionicons name="add" size={18} color={loading ? colors.medium : colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total</Text>
          <Text style={styles.totalValue}>{total.toFixed(2)} DH</Text>
        </View>
      </View>

      <View style={[styles.userInfoCard, { backgroundColor: themeColors.surface }]}>
        <Text style={styles.sectionLabel}>Your Information</Text>
        <View style={styles.userInfoRow}>
          <Text style={styles.userInfoLabel}>Name</Text>
          <Text style={styles.userInfoValue}>{user?.firstName || ""} {user?.lastName || ""}</Text>
        </View>
        <View style={styles.userInfoRow}>
          <Text style={styles.userInfoLabel}>Email</Text>
          <Text style={styles.userInfoValue}>{user?.email || "N/A"}</Text>
        </View>
      </View>

      <AppTextInput
        label="Shipping Address"
        placeholder="City, street, apartment..."
        value={shippingAddress}
        onChangeText={setShippingAddress}
        disabled={loading}
      />

      <AppTextInput
        label="Phone"
        placeholder="06XXXXXXXX"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        disabled={loading}
      />

      <AppTextInput
        label="Notes (optional)"
        placeholder="Any delivery notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        disabled={loading}
      />

      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => !loading && setAgreeToTerms(!agreeToTerms)}
        activeOpacity={0.7}
        disabled={loading}
      >
        <View style={styles.checkboxWrapper}>
          <Ionicons
            name={agreeToTerms ? "checkbox" : "square-outline"}
            size={24}
            color={agreeToTerms ? colors.primary : colors.medium}
          />
        </View>
        <Text style={styles.termsText}>
          I agree to the terms and conditions
        </Text>
      </TouchableOpacity>

      <AppButton
        title={loading ? "Placing..." : "Confirm Request"}
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
  map: {
    height: 150,
    borderRadius: 14,
    marginBottom: 12,
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
  userInfoCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.lightGray,
    padding: 14,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  userInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userInfoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  userInfoValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  checkboxWrapper: {
    marginRight: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    minWidth: 20,
    textAlign: "center",
  },
  disabledBtn: {
    opacity: 0.5,
  },
});

export default OrderCheckoutScreen;
