import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import colors from '../../../config/colors';
import useTheme from '../../../hooks/useTheme';


const SearchBar = ({ value, onChange, placeholder = "Search products..." }) => {
  const { colors: themeColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface }]}>
      <Feather name="search" size={18} color={colors.textSecondary} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChange}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChange("")}>
          <Feather name="x" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginHorizontal: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 8,
  },
});

export default SearchBar;