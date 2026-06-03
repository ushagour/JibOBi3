import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');

const ImageSlider = (props) => {
  const { images } = props;
  const hasMultipleImages = Array.isArray(images) && images.length > 1;
  const sliderWidth = width - 24;
  const sliderHeight = 300;

  return (
    <Swiper
      style={styles.wrapper}
      showsButtons={hasMultipleImages}
      showsPagination={false}
      loop={true}
      autoplay={hasMultipleImages}
      autoplayTimeout={3}
      nextButton={<Text style={styles.arrow}>▶</Text>}
      prevButton={<Text style={styles.arrow}>◀</Text>}
    >
      {(images || []).map((image, index) => (
        <View key={index} style={styles.slide}>
          {/* Ensure the source prop is an object with a uri key */}
          <Image source={{ uri: image.url }} style={[styles.image, { width: sliderWidth, height: sliderHeight }]} resizeMode="cover" />
        </View>
      ))}
    </Swiper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 320,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    borderRadius: 14,
    marginHorizontal: 12,
    marginTop: 12,
  },
  arrow: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default ImageSlider;
