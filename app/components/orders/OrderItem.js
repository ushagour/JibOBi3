import React, { useState } from 'react';
import { 
  Alert, 
  StyleSheet, 
  View, 
  Modal, 
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Linking 
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../config/colors';
import ordersApi from '../../api/orders';
import useAuth from '../../auth/useAuth';
import Text from '../../components/Text';

const { width, height } = Dimensions.get('window');

const OrderItem = ({ order, loadOrders }) => {
  const { user } = useAuth();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  // Extract data
  const listing = order?.Listing;
  const seller = listing?.owner;
  const title = listing?.title || 'Unknown Item';
  const description = listing?.description || 'No description';
  const totalPrice = order?.total_price || 0;
  const orderDate = order?.createdAt || new Date().toISOString();
  const imageUrl = listing?.images?.[0]?.url || null;
  const isClosed = order?.is_closed === true;
  const isCompleted = order?.status === 'completed';
  const isSeller = user?.userId === seller?.id;
  const paymentStatus = order?.payment_status || 'pending';
  const shippingAddress = order?.shipping_address || 'Not provided';
  const phone = order?.phone || seller?.phone || 'Not provided';
  const notes = order?.notes || 'No notes';

  // Close order function
  const handleCloseOrder = () => {
    Alert.alert(
      "Close Order",
      "Has this order been completed successfully?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Close Order",
          onPress: async () => {
            setClosing(true);
            try {
              const response = await ordersApi.closeOrder(order.id);
              if (response.ok) {
                Alert.alert("Success", "Order closed successfully!");
                loadOrders();
                setDetailsModalVisible(false);
              } else {
                Alert.alert("Error", "Failed to close order");
              }
            } catch (error) {
              Alert.alert("Error", "Something went wrong");
            } finally {
              setClosing(false);
            }
          }
        }
      ]
    );
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'paid': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'failed': return '#EF4444';
      case 'refunded': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  return (
    <View>
      {/* Order Card */}
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => setDetailsModalVisible(true)}
        activeOpacity={0.7}
      >
        {/* Image */}
        <TouchableOpacity onPress={() => imageUrl && setImageModalVisible(true)}>
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} />
            ) : (
              <MaterialCommunityIcons name="package-variant" size={40} color={colors.primary} />
            )}
          </View>
        </TouchableOpacity>

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.date}>
            {new Date(orderDate).toLocaleDateString()}
          </Text>
          <Text style={styles.price}>${parseFloat(totalPrice).toFixed(2)}</Text>
          
          {/* Status Badge */}
          <View style={[
            styles.statusBadge, 
            { backgroundColor: isClosed ? '#E5E7EB' : (isCompleted ? '#D1FAE5' : '#FEF3C7') }
          ]}>
            <Text style={[
              styles.statusText,
              { color: isClosed ? '#6B7280' : (isCompleted ? '#10B981' : '#F59E0B') }
            ]}>
              {isClosed ? 'CLOSED' : (isCompleted ? 'COMPLETED' : order?.status?.toUpperCase())}
            </Text>
          </View>
        </View>

        {/* Arrow Icon */}
        <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Order Details Modal */}
      <Modal 
        visible={detailsModalVisible} 
        transparent 
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product Image */}
              {imageUrl && (
                <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                  <Image source={{ uri: imageUrl }} style={styles.modalImage} />
                </TouchableOpacity>
              )}

              {/* Product Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Product Details</Text>
                <Text style={styles.productTitle}>{title}</Text>
                {description !== 'No description' && (
                  <Text style={styles.description}>{description}</Text>
                )}
              </View>

              {/* Order Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Order Information</Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Order ID:</Text>
                  <Text style={styles.infoValue}>#{order.id}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Order Date:</Text>
                  <Text style={styles.infoValue}>{formatDate(orderDate)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Amount:</Text>
                  <Text style={[styles.infoValue, styles.priceValue]}>${parseFloat(totalPrice).toFixed(2)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Order Status:</Text>
                  <View style={[styles.statusBadgeSmall, { backgroundColor: getStatusColor(order?.status) + '20' }]}>
                    <Text style={[styles.statusTextSmall, { color: getStatusColor(order?.status) }]}>
                      {order?.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment Status:</Text>
                  <View style={[styles.statusBadgeSmall, { backgroundColor: getPaymentStatusColor(paymentStatus) + '20' }]}>
                    <Text style={[styles.statusTextSmall, { color: getPaymentStatusColor(paymentStatus) }]}>
                      {paymentStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Seller/Buyer Info */}
              <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>
                  {isSeller ? 'Buyer Information' : 'Seller Information'}
                </Text>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Name:</Text>
                  <Text style={styles.infoValue}>{isSeller ? order?.user?.name : seller?.name}</Text>
                </View>
                
                {phone && phone !== 'Not provided' && (
                  <TouchableOpacity 
                    style={styles.infoRow} 
                    onPress={() => Linking.openURL(`tel:${phone}`)}
                  >
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <Text style={[styles.infoValue, styles.linkText]}>{phone}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Shipping Info */}
              {shippingAddress !== 'Not provided' && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Shipping Information</Text>
                  <Text style={styles.addressText}>{shippingAddress}</Text>
                </View>
              )}

              {/* Notes */}
              {notes !== 'No notes' && (
                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Order Notes</Text>
                  <Text style={styles.notesText}>{notes}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {isCompleted && !isClosed && (
                  <TouchableOpacity 
                    style={styles.closeOrderButton} 
                    onPress={handleCloseOrder}
                    disabled={closing}
                  >
                    <MaterialCommunityIcons name="check-circle" size={20} color="#FFF" />
                    <Text style={styles.closeOrderButtonText}>
                      {closing ? "Closing..." : "Close Order"}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {!isSeller && seller?.phone && (
                  <TouchableOpacity 
                    style={styles.contactButton} 
                    onPress={() => Linking.openURL(`tel:${seller?.phone}`)}
                  >
                    <MaterialCommunityIcons name="phone" size={20} color={colors.primary} />
                    <Text style={styles.contactButtonText}>Contact Seller</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal visible={imageModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setImageModalVisible(false)}>
          <View style={styles.imageModalOverlay}>
            <Image source={{ uri: imageUrl }} style={styles.fullImage} />
            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setImageModalVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Card Styles
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 80,
    height: 80,
    resizeMode: 'cover',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.85,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusTextSmall: {
    fontSize: 11,
    fontWeight: '700',
  },
  addressText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  linkText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  actionButtons: {
    padding: 16,
    gap: 10,
  },
  closeOrderButton: {
    backgroundColor: colors.success || '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  closeOrderButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contactButton: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Image Modal Styles
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width * 0.9,
    height: height * 0.6,
    resizeMode: 'contain',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 8,
  },
});

export default OrderItem;