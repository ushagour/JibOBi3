import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../config/colors';

const OrderItem = ({ order, onPress, onReport, onReview }) => {
  // Safely extract data with fallbacks
  const listing = order?.Listing;
  const seller = order?.Listing?.owner;
  const title = listing?.title || 'Unknown Item';
  const quantity = order?.quantity || 1;
  const totalPrice = order?.total_price || order?.total || 0;
  const orderDate = order?.order_date || order?.createdAt || new Date().toISOString();
  const normalizedStatus = String(order?.normalizedStatus ?? order?.status ?? order?.orderStatus ?? "").trim().toLowerCase();
  const imageUrl = listing?.images?.[0]?.url || listing?.Images?.[0]?.file_name || null;
  const [imageModalVisible, setImageModalVisible] = useState(false);
  

  return (
    <View>
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <TouchableOpacity onPress={() => imageUrl && setImageModalVisible(true)} activeOpacity={0.8}>
          <View style={[styles.iconContainer, styles.imageWrap]}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
            ) : (
              <MaterialCommunityIcons name="package-variant" size={32} color={colors.primary} />
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.detailsContainer}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.date}>
            {new Date(orderDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${parseFloat(totalPrice).toFixed(2)}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.medium} />
      </TouchableOpacity>
      {onReview && order && normalizedStatus === "completed" && !order.hasReviewed && (
        <TouchableOpacity style={styles.reviewButtonRow} onPress={() => onReview(order)}>
          <MaterialCommunityIcons name="star-outline" size={16} color={colors.primary} />
          <Text style={styles.reportButtonText}>Leave Review</Text>
        </TouchableOpacity>
      )}

      {/* Image modal */}
      <Modal visible={imageModalVisible} transparent animationType="fade" onRequestClose={() => setImageModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setImageModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <Image source={{ uri: imageUrl }} style={styles.fullImage} />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>

    
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  imageWrap: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '92%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 12,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: colors.medium,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  quantity: {
    fontSize: 13,
    color: colors.medium,
    fontWeight: '500',
  },
  reportButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  reviewButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export default OrderItem;
