import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');

const ImageSlider = (props) => {
  const { images } = props;

  return (
    <Swiper
      style={styles.wrapper}
      showsButtons={true}
      showsPagination={false}
      loop={true}
      autoplay={true}
      autoplayTimeout={3}
      nextButton={<Text style={styles.arrow}>▶</Text>}
      prevButton={<Text style={styles.arrow}>◀</Text>}
    >
      {images.map((image, index) => (
        <View key={index} style={styles.slide}>
          {/* Ensure the source prop is an object with a uri key */}
          <Image source={{ uri: image.url }} style={styles.image} />
        </View>
      ))}
    </Swiper>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 200,
  },
  image: {
    width: width - 40,
    height: 200,
    borderRadius: 10,
    margin: 20,
  },
  arrow: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default ImageSlider;
