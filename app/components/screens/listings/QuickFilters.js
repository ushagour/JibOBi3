import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import colors from '../../../config/colors';
import useTheme from '../../../hooks/useTheme';

const QuickFilters = ({ activeFilter, onFilterPress }) => {
  const { colors: themeColors } = useTheme();
  
  const filters = [
    { icon: "📍", label: "Nearby", value: "nearby" },
    { icon: "⭐", label: "Top Rated", value: "topRated" },
    { icon: "🆕", label: "Newest", value: "newest" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.chip,
                { backgroundColor: isActive ? colors.primary : themeColors.surface },
              ]}
              onPress={() => onFilterPress(filter.value)}
            >
              <Text style={styles.emoji}>{filter.icon}</Text>
              <Text
                style={[
                  styles.label,
                  { color: isActive ? "#FFF" : colors.textPrimary },
                ]}
              >
                {filter.label}
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
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 10,
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

export default QuickFilters;