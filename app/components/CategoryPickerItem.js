import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import Icon from "./Icon";
import Text from "./Text";
import getRandomColor from "../utility/RandomColor";// defrence between import and export
function CategoryPickerItem({ item, onPress }) {
const Rcolor = getRandomColor();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <Icon
          backgroundColor={Rcolor}
          name={item.icon}
          size={80}
        />
      </TouchableOpacity>
      <Text style={styles.label}>{item.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    alignItems: "center",
    width: "33%",
  },
  label: {
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },
});

export default CategoryPickerItem;
