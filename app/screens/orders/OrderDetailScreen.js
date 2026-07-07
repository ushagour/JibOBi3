import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { MaterialCommunityIcons, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import AppButton from "../../components/Button";
import Avatar from "../../components/Avatar";
import AddReviewForm from "../../components/AddReviewForm";
import colors from "../../config/colors";
import useTheme from "../../hooks/useTheme";
import ordersApi from "../../api/orders";
import useAuth from "../../auth/useAuth";
import routes from "../../navigation/routes";

const OrderDetailScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { order: initialOrder } = route.params || {};
  const { user } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("behavior");
  const [selectedSeller, setSelectedSeller] = useState(null);

  const reportReasons = [
    { id: "behavior", label: t('orders_detail.reason_inappropriate'), icon: "block-helper" },
    { id: "scam", label: t('orders_detail.reason_scam'), icon: "security" },
    { id: "quality", label: t('orders_detail.reason_quality'), icon: "alert-circle" },
    { id: "nodelivery", label: t('orders_detail.reason_delivery'), icon: "package-x" },
    { id: "other", label: t('orders_detail.reason_other'), icon: "help" },
  ];

  useEffect(() => {
    if (initialOrder?.id) {
      fetchOrderDetail();
    } else if (initialOrder) {
      // If order data is passed but without id, use it directly (freshly created order)
      setOrder(initialOrder);
    }
  }, [initialOrder?.id, initialOrder]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await ordersApi.getOrderById(initialOrder.id);
      if (response.ok && response.data) {
        setOrder(response.data);
      } else {
        if (__DEV__) console.error("Failed to fetch order:", response);
        Alert.alert(t('common.error'), t('orders_detail.order_details_error'));
      }
    } catch (error) {
      if (__DEV__) console.error("Failed to fetch order detail:", error);
      Alert.alert(t('common.error'), t('orders_detail.order_details_error'));
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

  const handleReportPress = () => {
    const seller = order?.Listing?.User || order?.Listing?.owner || null;
    setSelectedSeller(seller);
    setSelectedReportReason("behavior");
    setReportModalVisible(true);
  };

  const handleCloseOrder = () => {
    // Only seller can close the order
    if (!seller || user?.id !== seller?.id) {
      Alert.alert(t('orders_detail.permission_denied'), t('orders_detail.seller_only_close'));
      return;
    }

    if (!order || !order.id) return;

    Alert.alert(
      t('orders_detail.confirm_close'),
      t('orders_detail.close_confirmation'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('orders_detail.yes_close_order'),
          onPress: async () => {
            setLoading(true);
            try {
              const resp = await ordersApi.updateOrderStatus(order.id, "completed");
              if (resp && resp.ok) {
                // try to update local order state from response or fallback
                setOrder((prev) => ({ ...(prev || {}), status: "completed" , ...(resp.data || {}) }));
                Alert.alert(t('orders_detail.order_closed'), t('orders_detail.order_closed_success'));
              } else {
                Alert.alert(t('orders_detail.failed'), t('orders_detail.close_failed'));
              }
            } catch (err) {
              if (__DEV__) console.error("Close order failed:", err);
              Alert.alert(t('common.error'), t('orders_detail.something_went_wrong'));
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const submitReport = async () => {
    if (!order?.id) {
      Alert.alert(t('common.error'), t('orders_detail.order_id_missing'));
      return;
    }

    const reason = reportReasons.find((item) => item.id === selectedReportReason);

    setReportSubmitting(true);
    try {
      const response = await ordersApi.reportOrder(order.id, reason?.label || selectedReportReason);

      if (response?.ok) {
        setOrder((prev) => ({
          ...(prev || {}),
          hasReported: true,
          reportReason: reason?.label || selectedReportReason,
          ...(response?.data?.order || {}),
        }));

        setReportModalVisible(false);
        Alert.alert(
          t('orders_detail.report_submitted'),
          t('orders_detail.report_success_message').replace('{reason}', reason?.label || selectedSeller?.name || t('common.user'))
        );
      } else {
        const statusCode = response?.error?.response?.status;
        if (statusCode === 409) {
          setOrder((prev) => ({ ...(prev || {}), hasReported: true }));
          setReportModalVisible(false);
          Alert.alert(t('orders_detail.already_reported'), t('orders_detail.already_reported_message'));
        } else {
          Alert.alert(t('common.error'), t('orders_detail.report_failed'));
        }
      }
    } catch (error) {
      if (__DEV__) console.error("Failed to report order:", error);
      Alert.alert(t('common.error'), t('orders_detail.report_failed'));
    } finally {
      setReportSubmitting(false);
      setSelectedSeller(null);
      setSelectedReportReason("behavior");
    }
  };

  const closeReportModal = () => {
    setReportModalVisible(false);
    setSelectedSeller(null);
    setSelectedReportReason("behavior");
  };

  if (!order) {
    return (
      <Screen style={styles.screen}>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="package-outline"
            size={64}
            color={colors.medium}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>{t('orders_detail.order_not_found')}</Text>
          <Text style={styles.emptyText}>
            {t('orders_detail.order_details_error')}
          </Text>
          <AppButton
            title={t('orders_detail.back_to_orders')}
            onPress={() => navigation.navigate(routes.ORDERS)}
            variant="primary"
            style={{ marginTop: 16 }}
          />
        </View>
      </Screen>
    );
  }

  const listing = order?.Listing;
  const buyer = order?.User;
  const seller = listing?.User || listing?.owner;
  const orderStatus = String(order?.normalizedStatus ?? order?.status ?? order?.orderStatus ?? "")
    .trim()
    .toLowerCase();
  const listingStatus = String(listing?.status ?? listing?.normalizedStatus ?? "")
    .trim()
    .toLowerCase();
  const isCompletedOrder = orderStatus === "completed";
  const isCancelledOrder = orderStatus === "cancelled";
  const isSoldListing = listingStatus === "selled" || listingStatus === "sold out" || listingStatus === "sold";
  const isSoldOrder = orderStatus === "completed" || orderStatus === "selled" || orderStatus === "sold out" || orderStatus === "sold";
  const isSold = isSoldListing || isSoldOrder;
  const createdAt = dayjs(order?.createdAt).format("MMM D, YYYY [at] h:mm A");
  const listingImages = (
    listing?.images || listing?.Images || []
  )
    .map((image) => image?.url || image?.file_name || null)
    .filter(Boolean);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const currentImageUrl = listingImages[currentImageIndex] || null;
  const canReportIssue = order && !isCancelledOrder && !order?.hasReported;
  const canCloseOrder = user && seller && user.id === seller.id && isCompletedOrder && !isCancelledOrder;


  const getStatusColor = (status) => {
    switch (String(status ?? "").trim().toLowerCase()) {
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
          <Text style={styles.orderId}>{t('orders_detail.order_id', { id: order?.id })}</Text>
          <View style={styles.headerStatusWrap}>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(orderStatus) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(orderStatus) },
                ]}
              >
                {(order?.status || orderStatus || "unknown").toUpperCase()}
              </Text>
            </View>

            {isSoldListing && (
              <View style={styles.soldListingBadge}>
                <MaterialCommunityIcons name="check-decagram" size={14} color={colors.white} />
                <Text style={styles.soldListingBadgeText}>{t('orders_detail.sold_listing')}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Date */}
        <Text style={styles.dateText}>{createdAt}</Text>

        {/* Buyer + Seller Information */}
        <View style={styles.section}>
          <View style={styles.dualInfoHeader}>
            <Text style={styles.sectionTitle}>{t('orders_detail.people')}</Text>
          </View>

          <View style={[styles.dualInfoRow, { backgroundColor: themeColors.surface }]}>
            <View style={styles.personCard}>
              <Text style={styles.personLabel}>{t('orders_detail.buyer')}</Text>
              <View style={styles.personRow}>
                <Avatar
                  name={buyer?.name}
                  avatar={buyer?.avatar}
                  size={30}
                  bgColor={colors.primary}
                />
                <View style={styles.personInfo}>
                  <Text style={styles.personName} numberOfLines={1}>{buyer?.name || t('orders_detail.n_a')}</Text>
                  <Text style={styles.personMeta} numberOfLines={1}>{buyer?.email || t('orders_detail.n_a')}</Text>
                </View>
              </View>
            </View>

            <View style={styles.peopleDivider} />

            <View style={styles.personCard}>
              <Text style={styles.personLabel}>{t('orders_detail.seller')}</Text>
              <View style={styles.personRow}>
                <Avatar
                  name={seller?.name}
                  avatar={seller?.avatar}
                  size={30}
                  bgColor={colors.primary}
                />
                <View style={styles.personInfo}>
                  <Text style={styles.personName} numberOfLines={1}>{seller?.name || t('orders_detail.n_a')}</Text>
                  <Text style={styles.personMeta} numberOfLines={1}>{seller?.email || t('orders_detail.n_a')}</Text>
                  {seller?.phone && <Text style={styles.personMeta} numberOfLines={1}>{seller.phone}</Text>}
                </View>
                {seller?.id && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Conversation", { otherUserId: seller.id, otherUserName: seller.name })}
                    style={styles.messageButton}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="message-text-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Item Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orders_detail.item_details')}</Text>
          <View style={[styles.itemCard, { backgroundColor: themeColors.surface }]}>
            {currentImageUrl ? (
              <View style={styles.imageCarouselWrap}>
                <View style={styles.imageFrame}>
                  <Image
                    source={{ uri: currentImageUrl }}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />

                  {listingImages.length > 1 && (
                    <>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setCurrentImageIndex((index) => (index - 1 + listingImages.length) % listingImages.length)}
                        style={[styles.carouselArrow, styles.carouselArrowLeft]}
                      >
                        <MaterialCommunityIcons name="chevron-left" size={30} color={colors.white} />
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setCurrentImageIndex((index) => (index + 1) % listingImages.length)}
                        style={[styles.carouselArrow, styles.carouselArrowRight]}
                      >
                        <MaterialCommunityIcons name="chevron-right" size={30} color={colors.white} />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {listingImages.length > 1 && (
                  <View style={styles.imageDotsRow}>
                    {listingImages.map((_, index) => (
                      <TouchableOpacity
                        key={`image-dot-${index}`}
                        onPress={() => setCurrentImageIndex(index)}
                        style={[
                          styles.imageDot,
                          index === currentImageIndex && styles.imageDotActive,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View
                style={[
                  {
                    width: "100%",
                    height: 260,
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

            <Text style={styles.itemTitle}>{listing?.title || t('orders_detail.n_a')}</Text>
            <Text style={styles.itemDescription} numberOfLines={3}>
              {listing?.description || t('orders_detail.no_description')}
            </Text>

            <View style={styles.itemPriceRow}>
              <View>
                <Text style={styles.itemLabel}>{t('orders_detail.unit_price')}</Text>
                  <Text style={styles.itemPrice}>
                    {listing?.price ? `${listing.price.toFixed(2)} DH` : t('orders_detail.n_a')}
                  </Text>
              </View>
              <View>
                <Text style={styles.itemLabel}>{t('orders_detail.quantity')}</Text>
                <Text style={styles.itemPrice}>{order?.quantity || 1}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orders_detail.shipping_info')}</Text>
          <View style={[styles.infoCard, { backgroundColor: themeColors.surface }]}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={colors.primary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('orders_detail.address')}</Text>
                <Text style={styles.infoValue}>
                  {order?.shipping_address || t('orders_detail.n_a')}
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
                <Text style={styles.infoLabel}>{t('orders_detail.phone')}</Text>
                <Text style={styles.infoValue}>{order?.phone || t('orders_detail.n_a')}</Text>
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
                  <Text style={styles.infoLabel}>{t('orders_detail.notes')}</Text>
                  <Text style={styles.infoValue}>{order.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orders_detail.payment_details')}</Text>
          <View style={[styles.priceCard, { backgroundColor: themeColors.surface }]}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('orders_detail.unit_price')}</Text>
                <Text style={styles.priceValue}>
                  {listing?.price ? `${listing.price.toFixed(2)} DH` : t('orders_detail.n_a')}
                </Text>
            </View>

            <View style={[styles.priceRow, styles.borderTop]}>
              <Text style={styles.priceLabel}>{t('orders_detail.quantity')}</Text>
              <Text style={styles.priceValue}>{order?.quantity || 1}</Text>
            </View>

            <View style={[styles.priceRow, styles.borderTop]}>
              <Text style={styles.priceLabelBold}>{t('orders_detail.total')}</Text>
              <Text style={styles.priceTotalValue}>
                  {order?.total_price ? `${order.total_price.toFixed(2)} DH` : t('orders_detail.n_a')}
              </Text>
            </View>

            <View style={[styles.priceRow, styles.borderTop]}>
              <Text style={styles.priceLabel}>{t('orders_detail.payment_method')}</Text>
              <Text style={styles.priceValue}>
                {order?.payment_method === "cash_on_delivery"
                  ? t('orders_detail.cash_on_delivery')
                  : order?.payment_method || t('orders_detail.n_a')}
              </Text>
            </View>

            <View style={[styles.priceRow, styles.borderTop]}>
              <Text style={styles.priceLabel}>{t('orders_detail.payment_status')}</Text>
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

        {/* Action Buttons row: Back + Report + Close */}

       



        <View style={styles.actionChipsRow}>
          {canReportIssue && (
            <TouchableOpacity style={styles.reportButtonRow} onPress={handleReportPress} activeOpacity={0.8}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={styles.reportButtonText}>{t('orders_detail.report_issue')}</Text>
            </TouchableOpacity>
          )}

          {canCloseOrder && (
            <TouchableOpacity style={styles.closeButtonRow} onPress={handleCloseOrder} activeOpacity={0.8}>
              <MaterialCommunityIcons name="close-circle-outline" size={16} color={colors.success} />
              <Text style={styles.closeButtonText}>{t('orders_detail.close_order')}</Text>
            </TouchableOpacity>
          )}
        </View>




        <View style={styles.actionsRow}>

          
          <View style={styles.actionsLeft}>
            <AppButton
              title={t('orders_detail.back_to_orders')}
              onPress={() => navigation.goBack()}
              variant="outline"
              size="md"
            />
          </View>

          <View style={styles.actionsRight}>
            {order && isCompletedOrder && !order.hasReviewed && (
              <AppButton
                title={t('orders_detail.leave_review')}
                onPress={openReviewModal}
                variant="primary"
                size="md"
                style={styles.inlineButton}
              />
            )}
          </View>
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

          <KeyboardAvoidingView
            style={styles.reviewModalKeyboardWrap}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
          >
            <View style={[styles.reviewModalCard, { backgroundColor: themeColors.surface }]}>
              <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{t('orders_detail.leave_review_title')}</Text>
                <TouchableOpacity onPress={closeReviewModal}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.reviewModalScroll}
                contentContainerStyle={styles.reviewModalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {order?.Listing && (
                  <AddReviewForm
                    listing={order.Listing}
                    targetLabel="seller"
                    targetName={seller?.name || "Seller"}
                    onSuccess={handleReviewCreated}
                  />
                )}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>


          {/* Report Modal */}
          <Modal visible={reportModalVisible} transparent animationType="fade" onRequestClose={closeReportModal}>
            <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeReportModal}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          
              <Animated.View style={[styles.reportModalCard, { backgroundColor: themeColors.surface }] }>
                <LinearGradient colors={[colors.error, colors.error]} style={styles.reportModalHeader}>
              <Text style={[styles.modalTitle, { color: '#FFF', fontSize: 18, fontWeight: '700' }]}>{t('orders_detail.report_seller')}</Text>
              <TouchableOpacity onPress={closeReportModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
                </LinearGradient>
            
                <ScrollView showsVerticalScrollIndicator={false} style={styles.reportModalContent}>
              <Text style={[styles.modalSubtitle, { marginBottom: 14, fontSize: 13, marginTop: 2 }]}>
                {t('orders_detail.report_reason_hint')}
              </Text>
              <Text style={styles.reportSellerName}>
                {t('orders_detail.seller_name_label', { name: selectedSeller?.name || seller?.name || t('orders_detail.unknown_seller') })}
              </Text>
              
              <FlatList
                data={reportReasons}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={styles.reportReasonList}
                renderItem={({ item }) => {
                  const selected = item.id === selectedReportReason;
                  return (
                    <TouchableOpacity
                      style={[styles.reportReasonItem, selected && styles.reportReasonItemSelected]}
                      onPress={() => setSelectedReportReason(item.id)}
                    >
                      <MaterialCommunityIcons 
                        name={item.icon} 
                        size={22} 
                        color={selected ? colors.error : colors.textSecondary} 
                      />
                      <View style={styles.reportReasonTextWrap}>
                        <Text style={[styles.reportReasonLabel, selected && { color: colors.error }]}>
                          {item.label}
                        </Text>
                      </View>
                      <MaterialIcons
                        name={selected ? "radio-button-checked" : "radio-button-unchecked"}
                        size={22}
                        color={selected ? colors.error : colors.textMuted}
                      />
                    </TouchableOpacity>
                  );
                }}
              />
            </ScrollView>
            
            <View style={styles.reportModalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeReportModal}>
                <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={submitReport} disabled={reportSubmitting}>
                <LinearGradient colors={[colors.error, colors.error]} style={styles.submitButtonGradient}>
                  <Text style={styles.submitButtonText}>{reportSubmitting ? t('orders_detail.submitting') : t('orders_detail.submit_report')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
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
  headerStatusWrap: {
    alignItems: "flex-end",
    gap: 8,
  },
  soldListingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  soldListingBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
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
  dualInfoHeader: {
    marginBottom: 8,
  },
  dualInfoRow: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    overflow: "hidden",
  },
  personCard: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  peopleDivider: {
    width: 1,
    backgroundColor: colors.lightGray,
  },
  personLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.medium,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  personInfo: {
    flex: 1,
    minWidth: 0,
  },
  personName: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  personMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  messageButton: {
    marginLeft: 6,
    padding: 6,
    borderRadius: 999,
    backgroundColor: colors.light,
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
  imageCarouselWrap: {
    marginBottom: 12,
  },
  imageFrame: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    backgroundColor: colors.white,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.lightGray,
    position: "relative",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  carouselArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  carouselArrowLeft: {
    left: 10,
  },
  carouselArrowRight: {
    right: 10,
  },
  imageDotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightGray,
  },
  imageDotActive: {
    backgroundColor: colors.primary,
    width: 20,
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
  actionChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  actionsRow: {
    marginBottom: 20,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  actionsLeft: {
    width: '100%',
  },
  actionsRight: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  inlineButton: {
    marginLeft: 0,
  },
  reportButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  reportButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  closeButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  closeButtonText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
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
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  reviewModalKeyboardWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  reviewModalScroll: {
    maxHeight: 420,
  },
  reviewModalScrollContent: {
    paddingBottom: 12,
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
  /* Report modal styles */
  reportModalCard: {
    width: '88%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  reportModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: colors.error,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  reportSellerName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 16,
    paddingHorizontal: 18,
    marginTop: 12,
  },
  reportModalContent: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxHeight: 'auto',
  },
  reportReasonList: {
    paddingVertical: 6,
  },
  reportReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.light,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reportReasonItemSelected: {
    backgroundColor: `${colors.error}15`,
    borderColor: colors.error,
    borderWidth: 2,
  },
  reportReasonTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  reportReasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  reportModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.light,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.textTertiary,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
});

export default OrderDetailScreen;
