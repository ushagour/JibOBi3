import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const COLORS = {
  teal: '#008080',
  gold: '#C5A059',
  bg: '#F5F5F5',
  text: '#333',
};

// --- Product Card Component ---
export const Product = ({ 
  title, 
  price, 
  seller, 
  imageUri, 
  description, 
  createdAt, 
  onPress,
  containerStyle,
}) => {
  return (
    <TouchableOpacity style={[styles.productCard, containerStyle]} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: imageUri }} style={styles.productImage} />
      <View style={styles.productContent}>
        <Text style={styles.productTitle} numberOfLines={1}>{title}</Text>
        {!!description && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}
        
        <Text style={styles.price}>{price} MAD</Text>
        
        {!!createdAt && (
          <View style={styles.row}>
            <Text style={styles.dateText}>{createdAt}</Text>
          </View>
        )}
        {seller && (
          <Text style={styles.seller}>Seller: {seller}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#EEF1F5',
    elevation: 4,
    shadowColor: '#0D1B2A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginBottom: 12,
  },
  productImage: { width: '100%', height: 132, backgroundColor: '#F3F5F8' },
  productContent: { paddingHorizontal: 12, paddingVertical: 11 },
  productTitle: {
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 18,
    color: '#1A2233',
  },
  description: {
    fontSize: 12,
    color: '#6B7688',
    marginTop: 4,
    marginBottom: 7,
    lineHeight: 16,
  },
  price: {
    color: '#0E8F7E',
    fontWeight: '800',
    fontSize: 14,
    backgroundColor: '#E9F8F5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingContainer: { flexDirection: 'row' },
  dateText: {
    fontSize: 10,
    color: '#7C8797',
    fontWeight: '600',
  },
  seller: {
    fontSize: 11,
    color: '#4A5668',
    marginTop: 6,
    fontWeight: '600',
  },
});
export default Product;