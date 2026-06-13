import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform, Dimensions } from "react-native";
import { useFormikContext } from "formik";
import useTheme from "../../hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../config/colors";

const { width: screenWidth } = Dimensions.get("window");
const ITEM_WIDTH = (screenWidth - 64) / 3; // 3 columns with padding

function CategoriesGridSelector({ categories }) {
  const { values, setFieldValue } = useFormikContext();
  const { colors: themeColors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleSelect = (categoryId) => {
    setFieldValue("category", categoryId);
    // Optional haptic feedback
    if (Platform.OS !== 'web' && Platform.OS === 'ios') {
      try {
        const Haptics = require('expo-haptics');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Haptics not available
      }
    }
  };

  const selectedCategory = categories.find(c => c.id === values.category);

  return (
    <View style={[styles.gridContainer, { backgroundColor: themeColors.surface }]}>
      {/* Header */}
      <View style={styles.gridHeader}>
        <View style={styles.gridHeaderLeft}>
          <MaterialCommunityIcons name="view-grid" size={18} color={colors.primary} />
          <Text style={styles.gridTitle}>Select Category</Text>
        </View>
        {selectedCategory && (
          <View style={styles.selectedChip}>
            <Text style={styles.selectedChipText}>{selectedCategory.name}</Text>
            <MaterialCommunityIcons name="check" size={12} color="#FFF" />
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialCommunityIcons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Grid - 3 Columns */}
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => {
          const isSelected = values.category === item.id;
          return (
            <TouchableOpacity
              style={[
                styles.gridCard,
                { backgroundColor: themeColors.background },
                isSelected && styles.gridCardSelected,
              ]}
              onPress={() => handleSelect(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.gridIconContainer, isSelected && styles.gridIconContainerSelected]}>
                <Text style={styles.gridIcon}>{item.icon || "📦"}</Text>
              </View>
              <Text 
                style={[
                  styles.gridCardTitle,
                  isSelected && styles.gridCardTitleSelected
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {isSelected && (
                <View style={styles.gridCheckmark}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptySearch}>
            <MaterialCommunityIcons name="emoticon-sad" size={40} color={colors.textSecondary} />
            <Text style={styles.emptySearchText}>No categories found</Text>
          </View>
        }
      />
    </View>
  );
}

export default CategoriesGridSelector;

const styles = StyleSheet.create({
  gridContainer: {
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  gridHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
    gap: 3,
  },
  selectedChipText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    height: 38,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: colors.textPrimary,
    paddingVertical: 8,
  },
  gridContent: {
    paddingBottom: 4,
  },
  gridCard: {
    width: ITEM_WIDTH,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 8,
    marginHorizontal: 4,
    position: "relative",
  },
  gridCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}05`,
  },
  gridIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  gridIconContainerSelected: {
    backgroundColor: `${colors.primary}20`,
  },
  gridIcon: {
    fontSize: 20,
  },
  gridCardTitle: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textPrimary,
    textAlign: "center",
    maxWidth: "100%",
  },
  gridCardTitleSelected: {
    color: colors.primary,
  },
  gridCheckmark: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  emptySearch: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptySearchText: {
    marginTop: 8,
    fontSize: 12,
    color: colors.textSecondary,
  },
});