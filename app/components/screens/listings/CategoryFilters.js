import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../../config/colors';
import useTheme from '../../../hooks/useTheme';


const CategoryFilters = ({ categories, selectedCategory, onSelectCategory }) => {
  const { colors: themeColors } = useTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((item) => {
          const isSelected = selectedCategory === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.chip,
                { backgroundColor: isSelected ? colors.primary : themeColors.surface },
              ]}
              onPress={() => onSelectCategory(item.id)}
            >
              <Text style={styles.emoji}>{item.icon}</Text>
              <Text
                style={[
                  styles.label,
                  { color: isSelected ? "#FFF" : colors.textPrimary },
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default CategoryFilters;