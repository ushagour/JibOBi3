import React from "react";
import Constants from "expo-constants";
import { StyleSheet, SafeAreaView, View, ScrollView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import theme from "../config/theme";

/**
 * Screen component that handles safe area and consistent padding
 * @param {ReactNode} children - Screen content
 * @param {boolean} scrollable - Make screen scrollable (default: true)
 *                               Set to false if using FlatList, SectionList, or other VirtualizedList
 * @param {string} backgroundColor - Custom background color
 * @param {string} paddingSize - Padding size: 'none', 'sm', 'md', 'lg' (default: 'md')
 */
function AppScreen({
  children,
  scrollable = true,
  backgroundColor = theme.colors.background,
  paddingSize = "md",
  style,
}) {
  const padding = theme.spacing[paddingSize] || theme.spacing.md;

  const containerStyle = [
    styles.container,
    {
      backgroundColor,
      paddingHorizontal: padding,
      paddingVertical: padding,
    },
    style,
  ];

  const content = (
    <View style={containerStyle}>{children}</View>
  );

  if (scrollable) {
    return (
      <GestureHandlerRootView style={[styles.screen, { backgroundColor }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          // scrollEnabled={true}
        >
          {content}
        </ScrollView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={[styles.screen, { backgroundColor }]}>
      {content}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
  },
  container: {
    flex: 1,
  },
});

export default AppScreen;
