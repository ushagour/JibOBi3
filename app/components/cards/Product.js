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
  onLikePress,
  isLiked = false,
  isClosed = false,
  containerStyle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.productCard,
        isClosed && styles.closedCard,
        containerStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUri }} style={[styles.productImage, isClosed && styles.closedImage]} />
        {isClosed ? (
          <View style={styles.closedBadge}>
            <Text style={styles.closedBadgeText}>Closed</Text>
          </View>
        ) : null}
        {onLikePress ? (
          <TouchableOpacity
            style={styles.likeButton}
            onPress={(event) => {
              event?.stopPropagation?.();
              onLikePress?.();
            }}
            activeOpacity={0.85}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Text style={[styles.likeIcon, isLiked && styles.likeIconActive]}>{isLiked ? '♥' : '♡'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.productContent}>
        <View style={styles.titlePriceRow}>
          <Text style={styles.productTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.price}>{price} DH</Text>
        </View>
        {!!description && (
          <Text style={styles.description} numberOfLines={2}>{description}</Text>
        )}

        {(!!createdAt || !!seller) && (
          <View style={styles.metaRow}>
            {!!createdAt && <Text style={styles.dateText}>{createdAt}</Text>}
            {!!seller && <Text style={styles.seller}>Seller: {seller}</Text>}
          </View>
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
  closedCard: {
    opacity: 0.72,
  },
  imageWrapper: { position: 'relative' },
  productImage: { width: '100%', height: 132, backgroundColor: '#F3F5F8' },
  closedImage: {
    tintColor: 'rgba(0,0,0,0.08)',
  },
  closedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  closedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  likeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: '#E6EAF0',
  },
  likeIcon: {
    fontSize: 16,
    color: '#8391A5',
    lineHeight: 18,
  },
  likeIconActive: {
    color: '#E45066',
  },
  productContent: { paddingHorizontal: 12, paddingVertical: 11 },
  titlePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  productTitle: {
    fontWeight: '800',
    fontSize: 14,
    lineHeight: 18,
    color: '#1A2233',
    flex: 1,
    marginRight: 8,
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
    flexShrink: 0,
  },
  metaRow: {
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
    fontWeight: '600',
    marginLeft: 8,
    flexShrink: 1,
  },
});
export default Product;