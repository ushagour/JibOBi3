import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../config/colors';
import Text from '../../components/Text';

const { width, height } = Dimensions.get('window');

const OrderItem = ({ order, onPress }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Extract data
  const listing = order?.Listing;
  const title = listing?.title || 'Unknown Item';
  const totalPrice = order?.total_price || 0;
  const orderDate = order?.createdAt || new Date().toISOString();
  const imageUrl = listing?.images?.[0]?.url || null;
  const isClosed = order?.is_closed === true;
  const isCompleted = order?.status === 'completed';

  return (
    <View>
      {/* Order Card */}
      <TouchableOpacity 
        style={styles.card} 
        onPress={onPress}
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