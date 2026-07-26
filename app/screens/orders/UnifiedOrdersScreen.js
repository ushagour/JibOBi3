import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import colors from "../../config/colors";
import useAuth from "../../auth/useAuth";
import ordersApi from "../../api/orders";
import listingsApi from "../../api/listings";
import routes from "../../navigation/routes";

const { width } = Dimensions.get('window');

// Order Types
const ORDER_TYPES = {
  AS_BUYER: "as_buyer",
  AS_SELLER: "as_seller",
};

const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

function getStatusConfig(t) {
  return {
    pending: { label: t("orders_unified.status_pending"), color: "#FFC107", icon: "clock-outline", bg: "#FFF8E1" },
    processing: { label: t("orders_unified.status_processing"), color: "#2196F3", icon: "cog", bg: "#E3F2FD" },
    shipped: { label: t("orders_unified.status_shipped"), color: "#9C27B0", icon: "truck-delivery", bg: "#F3E5F5" },
    delivered: { label: t("orders_unified.status_delivered"), color: "#4CAF50", icon: "package-variant", bg: "#E8F5E9" },
    completed: { label: t("orders_unified.status_completed"), color: "#2ECC71", icon: "check-circle", bg: "#F0FFF4" },
    cancelled: { label: t("orders_unified.status_cancelled"), color: "#F44336", icon: "close-circle", bg: "#FFEBEE" },
  };
}

function UnifiedOrdersScreen({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(ORDER_TYPES.AS_BUYER);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    asBuyer: { total: 0, pending: 0, shipped: 0, delivered: 0 },
    asSeller: { total: 0, pending: 0, shipped: 0, delivered: 0 },
  });

  const STATUS_CONFIG = getStatusConfig(t);
  const userId = user?.userId;

  // Load all orders
  const loadAllOrders = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Get all orders from API
      const response = await ordersApi.getOrders();
      
      if (!response.ok || !Array.isArray(response.data)) {
        const errorMsg = response?.data?.error || t("orders_errors.load_error");
        Alert.alert(t("common.error"), errorMsg);
        return;
      }

      const allOrders = response.data;

      // Separate orders by role
      const ordersAsBuyer = allOrders.filter(
        (order) => String(order.buyer_id) === String(userId)
      );


      console.log("Orders as Buyer:", ordersAsBuyer);
      // For seller orders, check if the user is the listing owner (seller_id comes from Listing.user_id)
      const ordersAsSeller = allOrders.filter(
        (order) => {
          const sellerId = order.Listing?.user_id || order.listing?.user_id;
          return String(sellerId) === String(userId);
        }
      );

      // Normalize and enhance orders
      const normalizedBuyerOrders = ordersAsBuyer.map(order => {
        const seller = order.Listing?.User || order.listing?.user;
        return {
          ...order,
          type: ORDER_TYPES.AS_BUYER,
          normalizedStatus: String(order?.status || "").toLowerCase(),
          roleIcon: "cart-outline",
          roleLabel: t("orders_unified.you_purchased"),
          roleColor: "#4CAF50",
          otherParty: seller?.name || t("common.unknown"),
          otherPartyId: seller?.id,
        };
      });

      const normalizedSellerOrders = ordersAsSeller.map(order => {
        const buyer = order.User || order.user;
        return {
          ...order,
          type: ORDER_TYPES.AS_SELLER,
          normalizedStatus: String(order?.status || "").toLowerCase(),
          roleIcon: "storefront-outline",
          roleLabel: t("orders_unified.someone_bought"),
          roleColor: "#2196F3",
          otherParty: buyer?.name || t("common.unknown"),
          otherPartyId: order.buyer_id,
        };
      });


      console.log("Normalized Seller Orders:", normalizedSellerOrders);
      setBuyerOrders(normalizedBuyerOrders);
      setSellerOrders(normalizedSellerOrders);

      // Calculate stats
      calculateStats(normalizedBuyerOrders, normalizedSellerOrders);

    } catch (error) {
      console.error("Failed to load orders:", error);
      Alert.alert(t("common.error"), t("orders_errors.load_error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, t]);

  const calculateStats = (buyer, seller) => {
    setStats({
      asBuyer: {
        total: buyer.length,
        pending: buyer.filter(o => o.normalizedStatus === ORDER_STATUS.PENDING).length,
        shipped: buyer.filter(o => o.normalizedStatus === ORDER_STATUS.SHIPPED).length,
        delivered: buyer.filter(o => o.normalizedStatus === ORDER_STATUS.DELIVERED).length,
      },
      asSeller: {
        total: seller.length,
        pending: seller.filter(o => o.normalizedStatus === ORDER_STATUS.PENDING).length,
        shipped: seller.filter(o => o.normalizedStatus === ORDER_STATUS.SHIPPED).length,
        delivered: seller.filter(o => o.normalizedStatus === ORDER_STATUS.DELIVERED).length,
      },
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAllOrders();
  };

  useEffect(() => {
    loadAllOrders();
  }, [userId]);

  // Handle order actions
  const handleUpdateStatus = async (order, newStatus) => {
    try {
      const response = await ordersApi.updateOrderStatus(order.id, newStatus);
      if (response.ok) {
        loadAllOrders(); // Reload all orders
        Alert.alert(t("common.success"), t("orders_unified.update_success", { status: newStatus }));
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("orders_errors.update_error"));
    }
  };

  const handleContactParty = (order) => {
    navigation.navigate(routes.CONVERSATION, {
      userId: order.otherPartyId,
      userName: order.otherParty,
      orderId: order.id,
    });
  };
  


  const handleDeleteOrder = (order) => {
    Alert.alert(
      t("orders_unified.delete_confirm_title"),
      t("orders_unified.delete_confirm_message"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const response = await ordersApi.deleteOrder(order.id);
              if (response.ok) {
                loadAllOrders();
                Alert.alert(t("common.success"), t("orders_unified.delete_success"));
              }
            } catch (error) {
              Alert.alert(t("common.error"), t("orders_errors.delete_error"));
            }
          },
        },
      ]
    );
  };  
      


  const handleCancelOrder = (order) => {
    Alert.alert(
      t("orders_unified.cancel_confirm_title"),
      t("orders_unified.cancel_confirm_message"),
      [
        { 
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("orders_unified.cancel"),
          style: "destructive",
          onPress: async () => {
            try {
              const response = await ordersApi.cancelOrder(order.id);
              if (response.ok) {
                loadAllOrders();
                Alert.alert(t("common.success"), t("orders_unified.cancel_success"));
              }
            } catch (error) {
              Alert.alert(t("common.error"), t("orders_unified.cancel_failed"));
            }
          },
        },
      ]
    );
  };








  // Render Tab Header
  const renderTabHeader = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === ORDER_TYPES.AS_BUYER && styles.activeTab]}
        onPress={() => setActiveTab(ORDER_TYPES.AS_BUYER)}
      >
        <MaterialCommunityIcons
          name="cart-outline"
          size={22}
          color={activeTab === ORDER_TYPES.AS_BUYER ? colors.primary : colors.medium}
        />
        <View>
          <Text style={[styles.tabLabel, activeTab === ORDER_TYPES.AS_BUYER && styles.activeTabLabel]}>
        {t("orders_unified.my_purchases")}
          </Text>
          <Text style={styles.tabCount}>{t("orders_unified.orders_count", { count: stats.asBuyer.total })}</Text>
        </View>
        {stats.asBuyer.pending > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{stats.asBuyer.pending}</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === ORDER_TYPES.AS_SELLER && styles.activeTab]}
        onPress={() => setActiveTab(ORDER_TYPES.AS_SELLER)}
      >
        <MaterialCommunityIcons
          name="storefront-outline"
          size={22}
          color={activeTab === ORDER_TYPES.AS_SELLER ? colors.primary : colors.medium}
        />
        <View>
          <Text style={[styles.tabLabel, activeTab === ORDER_TYPES.AS_SELLER && styles.activeTabLabel]}>
            {t("orders_unified.sales")}
          </Text>
          <Text style={styles.tabCount}>{t("orders_unified.orders_count", { count: stats.asSeller.total })}</Text>
        </View>
        {stats.asSeller.pending > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{stats.asSeller.pending}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render role badge
  const renderRoleBadge = (order) => (
    <View style={[styles.roleBadge, { backgroundColor: `${order.roleColor}15` }]}>
      <MaterialCommunityIcons name={order.roleIcon} size={14} color={order.roleColor} />
      <Text style={[styles.roleText, { color: order.roleColor }]}>
        {order.roleLabel} from {order.otherParty}
      </Text>
    </View>
  );

  // Render order card
  const renderOrderCard = ({ item }) => {
    const statusConfig = STATUS_CONFIG[item.normalizedStatus] || STATUS_CONFIG.pending;

    
    
    return (
      <TouchableOpacity
        style={[styles.orderCard, { backgroundColor: statusConfig.bg }]}
        onPress={() => navigation.navigate(routes.ORDER_DETAILS, { order: item })}
        activeOpacity={0.95}
      >
        {/* Status Header */}
        <LinearGradient
          colors={[statusConfig.color, `${statusConfig.color}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardHeader}
        >
          <View style={styles.statusContainer}>
            <MaterialCommunityIcons name={statusConfig.icon} size={16} color="#FFF" />
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </View>
          <Text style={styles.orderId}>#{item.order_number || item.id}</Text>
        </LinearGradient>

        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Role Badge */}
          {/* {renderRoleBadge(item)} */}

          {/* Product Info */}
          <View style={styles.productSection}>
            <View style={styles.imageContainer}>
              {item.Listing.imageUrl ? (
                <Image source={{ uri: item.Listing.imageUrl }} style={styles.productImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="package-variant" size={24} color={statusConfig.color} />
                </View>
              )}
            </View>

            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.Listing.title || "Product"}
              </Text>
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="format-list-bulleted" size={12} color="#666" />
                  <Text style={styles.detailLabel}>Qty:</Text>
                  <Text style={styles.detailValue}>{item.quantity || 1}</Text>
                </View>
                
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="currency-usd" size={12} color="#666" />
                  <Text style={styles.detailLabel}>Total:</Text>
                  <Text style={[styles.price, { color: statusConfig.color }]}>
                    {(item.total_price || item.price || 0).toFixed(2)} DH
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
       

            {item.type === ORDER_TYPES.AS_BUYER && item.normalizedStatus === ORDER_STATUS.SHIPPED && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.trackBtn]}
                onPress={() => navigation.navigate(routes.TRACK_ORDER, { order: item })}
              >
                <MaterialCommunityIcons name="map-marker-distance" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>{t("orders_unified.track")}</Text>
              </TouchableOpacity>
            )}

            {item.type === ORDER_TYPES.AS_SELLER && item.normalizedStatus === ORDER_STATUS.PENDING && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.processBtn]}
                onPress={() => handleUpdateStatus(item, ORDER_STATUS.PROCESSING)}
              >
                <MaterialCommunityIcons name="cog" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>{t("orders_unified.process")}</Text>
              </TouchableOpacity>
            )}

            {item.type === ORDER_TYPES.AS_SELLER && item.normalizedStatus === ORDER_STATUS.PROCESSING && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.shipBtn]}
                onPress={() => handleUpdateStatus(item, ORDER_STATUS.SHIPPED)}
              >
                <MaterialCommunityIcons name="truck" size={16} color="#FFF" />
                <Text style={styles.actionBtnText}>{t("orders_unified.mark_shipped")}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionBtn, styles.messageBtn]}
              onPress={() => handleContactParty(item)}
            >
              <MaterialCommunityIcons name="chat" size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>{t("orders_unified.message")}</Text>
            </TouchableOpacity>


            {item.type === ORDER_TYPES.AS_BUYER && item.normalizedStatus === ORDER_STATUS.CANCELLED && (
              

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => handleDeleteOrder(item)}
            >
              <MaterialCommunityIcons name="delete" size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>{t("orders_unified.delete")}</Text>
            </TouchableOpacity>
            )}

            {item.type === ORDER_TYPES.AS_BUYER && item.normalizedStatus === ORDER_STATUS.PENDING && (
              

            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => handleCancelOrder(item)}
            >
              <MaterialCommunityIcons name="cancel" size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>{t("orders_unified.cancel")}</Text>
            </TouchableOpacity>
            )}


          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const currentOrders = activeTab === ORDER_TYPES.AS_BUYER ? buyerOrders : sellerOrders;

  return (
    <Screen  scrollable={false} style={styles.screen} paddingSize="lg">
      {/* Header */}


      {/* Tabs */}
      {renderTabHeader()}

      {/* Orders List */}
      <FlatList
        data={currentOrders}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        renderItem={renderOrderCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name={activeTab === ORDER_TYPES.AS_BUYER ? "cart-outline" : "storefront-outline"}
                size={60}
                color={colors.medium}
              />
              <Text style={styles.emptyTitle}>
                {activeTab === ORDER_TYPES.AS_BUYER ? t("orders_unified.no_purchases_yet") : t("orders_unified.no_sales_yet")}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === ORDER_TYPES.AS_BUYER
                  ? t("orders_unified.start_shopping_to_see_orders")
                  : t("orders_unified.orders_will_appear_here")}
              </Text>
              {activeTab === ORDER_TYPES.AS_BUYER && (
                <TouchableOpacity
                  style={styles.shopButton}
                  onPress={() => navigation.navigate(routes.HOME)}
                >
                  <Text style={styles.shopButtonText}>{t("orders_unified.start_shopping")}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{t("orders_unified.loading_orders")}...</Text>
            </View>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  subtitle: {
    fontSize: 13,
    color: "#7F8C8D",
    marginTop: 4,
  },
  filterIcon: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  activeTab: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
  },
  activeTabLabel: {
    color: colors.primary,
  },
  tabCount: {
    fontSize: 11,
    color: "#7F8C8D",
    marginTop: 2,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#F44336",
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFF",
  },
  listContent: {
    paddingBottom: 20,
  },
  orderCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  orderId: {
    fontSize: 10,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
  },
  cardContent: {
    padding: 14,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "500",
  },
  productSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: "hidden",
  },
  productImage: {
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
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
  },
  detailsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: "#7F8C8D",
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2C3E50",
  },
  price: {
    fontSize: 13,
    fontWeight: "700",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  cancelBtn: {
    backgroundColor: "#F44336",
  },
  trackBtn: {
    backgroundColor: "#2196F3",
  },
  processBtn: {
    backgroundColor: "#FF9800",
  },
  shipBtn: {
    backgroundColor: "#9C27B0",
  },
  messageBtn: {
    backgroundColor: "#607D8B",
  },
  deleteBtn: {
    backgroundColor: "#F44336",
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#7F8C8D",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  shopButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  shopButtonText: {
    color: "#FFF",
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#7F8C8D",
  },
});

export default UnifiedOrdersScreen;