import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../config/colors';
import Constants from "expo-constants";

const MessageBox = ({ message, type, onClose }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.danger;
      case 'warning':
        return colors.warning;
      default:
        return colors.info;
    }
  };

  return (



    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
    <Text style={styles.text}>{message}</Text>

  </View>


    );
};

const styles = StyleSheet.create({

  container: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    position: "absolute",
    top: Constants.statusBarHeight,
    width: "100%",
    zIndex: 1,
  },
  text: {
    color: colors.white,
    fontSize: 16,},
  closeButton: {
    marginLeft: 10,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MessageBox;



