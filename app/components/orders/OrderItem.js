import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../config/colors';

const OrderItem = ({ order, onPress, onReport }) => {
  // Safely extract data with fallbacks
  const listing = order?.Listing;
  const seller = order?.Listing?.owner;
  const title = listing?.title || 'Unknown Item';
  const quantity = order?.quantity || 1;
  const totalPrice = order?.total_price || order?.total || 0;
  const orderDate = order?.order_date || order?.createdAt || new Date().toISOString();

  const handleReportPress = (e) => {
    e.stopPropagation();
    if (onReport) {
      onReport(order, seller);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="package-variant" size={32} color={colors.primary} />
        </View>
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
      {onReport && (
        <TouchableOpacity style={styles.reportButtonRow} onPress={handleReportPress}>
          <MaterialCommunityIcons name="flag-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.reportButtonText}>Report Seller</Text>
        </TouchableOpacity>
      )}
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
});

export default OrderItem;
