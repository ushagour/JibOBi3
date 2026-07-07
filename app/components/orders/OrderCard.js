import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import Text from "../Text";
import colors from "../../config/colors";
import OrderStatusPill from "./OrderStatusPill";

function formatCurrency(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "N/A";
  return `${amount.toFixed(2)} DH`;
}

function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

function OrderCard({ order, onPress }) {
  const { t } = useTranslation();
  const title = order?.Listing?.title || order?.listing?.title || t("orders_unified.product_fallback");
  const totalPrice = order?.total_price ?? order?.total_amount;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.pressed : null]}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <OrderStatusPill status={order?.status} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{t("order_item.qty")} {order?.quantity || 1}</Text>
        <Text style={styles.metaText}>{t("order_item.total_label")} {formatCurrency(totalPrice)}</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText} numberOfLines={1}>
          {t("orders_checkout.phone")}: {order?.phone || "-"}
        </Text>
        <Text style={styles.metaText}>{formatDate(order?.createdAt)}</Text>
      </View>

      {order?.shipping_address ? (
        <Text style={styles.address} numberOfLines={2}>
          {t("orders_checkout.shipping_address")}: {order.shipping_address}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  pressed: {
    opacity: 0.88,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  address: {
    marginTop: 8,
    fontSize: 12,
    color: colors.mediumGray,
  },
});

export default OrderCard;
