import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../../config/colors';
import dayjs from 'dayjs';

const ProductCard = ({ 
  item, 
  onPress, 
  onLikePress, 
  isLiked, 
  isClosed 
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.imageUri || item.imageUrl }}
          style={styles.image}
          defaultSource={require('../../../assets/placeholder.png')}
        />
        {isClosed && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldText}>SOLD</Text>
          </View>
        )}
        {onLikePress && (
          <TouchableOpacity
            style={styles.likeButton}
            onPress={(e) => {
              e.stopPropagation();
              onLikePress();
            }}
          >
            <Text style={[styles.likeIcon, isLiked && styles.likeIconActive]}>
              {isLiked ? "❤️" : "🤍"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.price}>{item.price} DH</Text>
        <View style={styles.meta}>
          <Text style={styles.seller} numberOfLines={1}>
            {item.owner?.name || "Seller"}
          </Text>
          <Text style={styles.date}>
            {dayjs(item.createdAt).format("MMM D")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    margin: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 130,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  soldBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  soldText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
  },
  likeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  likeIcon: {
    fontSize: 14,
  },
  likeIconActive: {
    color: '#FF3B30',
  },
  content: {
    padding: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A2E',
    lineHeight: 16,
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seller: {
    fontSize: 9,
    color: '#888',
    flex: 1,
  },
  date: {
    fontSize: 9,
    color: '#AAA',
  },
});

export default ProductCard;