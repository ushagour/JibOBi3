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
  onPress 
}) => {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: imageUri }} style={styles.productImage} />
      <View style={styles.productContent}>
        <Text style={styles.productTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        
        <Text style={styles.price}>{price} MAD</Text>
        
        <View style={styles.row}>
     
          <Text style={styles.dateText}>{createdAt}</Text>
        </View>
        {seller && (
          <Text style={styles.seller}>Seller: {seller}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    width: '48%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  productImage: { width: '100%', height: 110 },
  productContent: { padding: 10 },
  productTitle: { fontWeight: 'bold', fontSize: 14, color: COLORS.text },
  description: { fontSize: 11, color: '#555', marginVertical: 4 },
  price: { color: COLORS.teal, fontWeight: '700', fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  ratingContainer: { flexDirection: 'row' },
  dateText: { fontSize: 9, color: COLORS.lightGray ,marginBottom: 8},
  seller: { fontSize: 10, color: COLORS.lightGray, marginTop: 4 },
});
export default Product;