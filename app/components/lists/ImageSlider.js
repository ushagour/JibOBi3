import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';

const { width } = Dimensions.get('window');



const ImageSlider = (props) => {

  const { images } = props;
  
  return (     

    /* we added wrapper style to contain the Swiper component */
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
        {images.map((url, index) => (
          <View key={index} style={styles.slide}>
            <Image source={ url } style={styles.image} />
          </View>
        ))}
      </Swiper>
  );
};

const styles = StyleSheet.create({
 
  wrapper : {
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
