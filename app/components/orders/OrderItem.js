import React from "react";
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import Text from "../Text";
import colors from "../../config/colors";

const { width } = Dimensions.get('window');

// Status configurations with gradient colors
const STATUS_CONFIG = {
  pending: {
    name: "Pending",
    gradientColors: ["#FF6B6B", "#FF8E8E"],
    icon: "clock-outline",
    bgColor: "#FFF5F5",
    borderColor: "#FF6B6B",
    textColor: "#FF6B6B",
  },
  processing: {
    name: "Processing",
    gradientColors: ["#4A90E2", "#6CA3F5"],
    icon: "cog",
    bgColor: "#F0F7FF",
    borderColor: "#4A90E2",
    textColor: "#4A90E2",
  },
  shipped: {
    name: "Shipped",
    gradientColors: ["#9B59B6", "#B07CC9"],
    icon: "truck-delivery",
    bgColor: "#F8F0FF",
    borderColor: "#9B59B6",
    textColor: "#9B59B6",
  },
  delivered: {
    name: "Delivered",
    gradientColors: ["#27AE60", "#48C77A"],
    icon: "package-variant",
    bgColor: "#F0FFF4",
    borderColor: "#27AE60",
    textColor: "#27AE60",
  },
  completed: {
    name: "Completed",
    gradientColors: ["#2ECC71", "#5ED48A"],
    icon: "check-circle",
    bgColor: "#F0FFF4",
    borderColor: "#2ECC71",
    textColor: "#2ECC71",
  },
  cancelled: {
    name: "Cancelled",
    gradientColors: ["#E74C3C", "#EC7063"],
    icon: "close-circle",
    bgColor: "#FFF5F5",
    borderColor: "#E74C3C",
    textColor: "#E74C3C",
  },
  refunded: {
    name: "Refunded",
    gradientColors: ["#F39C12", "#F5B041"],
    icon: "cash-refund",
    bgColor: "#FFFBF0",
    borderColor: "#F39C12",
    textColor: "#F39C12",
  },
};

function OrderItem({ order, onPress, showActions = false, renderActions }) {
  const status = order.normalizedStatus || order.status || "pending";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  
  // Format price
  const price = order.total_price || order.price || 0;
  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : '0.00';
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress} 
      activeOpacity={0.95}
    >
      {/* Status Gradient Header */}
      <LinearGradient
        colors={config.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.statusHeader}
      >
        <View style={styles.statusHeaderContent}>
          <MaterialCommunityIcons name={config.icon} size={18} color="#FFF" />
          <Text style={styles.statusHeaderText}>{config.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>
              {order.order_number || `#${order.id}`}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Order Content */}
      <View style={[styles.content, { backgroundColor: config.bgColor }]}>
        <View style={styles.mainContent}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            {order.listing_image ? (
              <Image source={{ uri: order.listing_image }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="package-variant" size={32} color={config.textColor} />
              </View>
            )}
          </View>

          {/* Order Details */}
          <View style={styles.details}>
            <Text style={styles.productName} numberOfLines={2}>
              {order.listing_title || "Product"}
            </Text>
            
            <View style={styles.infoGrid}>
       
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="currency-usd" size={14} color={config.textColor} />
                <Text style={styles.infoLabel}>Total:</Text>
                <Text style={[styles.price, { color: config.textColor }]}>
                  ${formattedPrice}
                </Text>
              </View>

              {formatDate(order.created_at || order.createdAt) && (
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons name="calendar" size={14} color={config.textColor} />
                  <Text style={styles.infoLabel}>Date:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(order.created_at || order.createdAt)}
                  </Text>
                </View>
              )}
            </View>

            {/* Delivery Estimate (for shipped orders) */}
            {status === 'shipped' && order.tracking_number && (
              <View style={styles.trackingInfo}>
                <MaterialCommunityIcons name="map-marker-distance" size={14} color={config.textColor} />
                <Text style={styles.trackingText}>
                  Tracking: {order.tracking_number}
                </Text>
              </View>
            )}

            {/* Expected Delivery (for processing/shipped) */}
            {(status === 'processing' || status === 'shipped') && (
              <View style={styles.estimateContainer}>
                <Text style={styles.estimateText}>
                  Expected delivery: {getDeliveryEstimate()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {showActions && renderActions && (
          <View style={styles.actionsContainer}>
            {renderActions()}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  function getDeliveryEstimate() {
    const today = new Date();
    const estimate = new Date(today);
    estimate.setDate(today.getDate() + 5);
    return estimate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: "auto",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
  },
  content: {
    padding: 16,
  },
  mainContent: {
    flexDirection: "row",
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 10,
    lineHeight: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  infoLabel: {
    fontSize: 11,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2C3E50",
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
  },
  trackingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  trackingText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#7F8C8D",
  },
  estimateContainer: {
    marginTop: 8,
  },
  estimateText: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#7F8C8D",
  },
  actionsContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
});

export default OrderItem;