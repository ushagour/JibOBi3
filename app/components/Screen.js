import React from "react";
import Constants from "expo-constants";
import { StyleSheet, SafeAreaView, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function Screen({ children, style }) {
  return (
    <GestureHandlerRootView  style={[styles.screen, style]}>
          <View style={[styles.view, style]}>{children}</View>

    </GestureHandlerRootView>
  
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
  },
  view: {
    flex: 1,
  },
});

export default Screen;
