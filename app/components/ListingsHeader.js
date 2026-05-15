import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../config/colors";

function ListingsHeader({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  locationName,
}) {
  return (
    <View style={styles.fixedTopSection}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.medium} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search for products..."
          placeholderTextColor={colors.medium}
          style={styles.searchInput}
        />
      </View>

      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(category) => category.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item: category }) => {
          const isActive = selectedCategory === category.id;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.categoryItem, isActive && styles.categoryItemActive]}
              onPress={() => onSelectCategory(category.id)}
            >
              <View style={styles.categoryIconWrap}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
              </View>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        }}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      />

      <View style={styles.newestNearMeRow}>
        <Text style={styles.sectionTitle}>Newest Near Me</Text>
        {locationName && <Text style={styles.locationSpan}>{locationName}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedTopSection: {
    backgroundColor: colors.light,
    paddingTop: 4,
    paddingBottom: 2,
  },
  searchBar: {
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.dark,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.dark,
    marginHorizontal: 12,
    marginBottom: 4,
    marginTop: 4,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 4,
    gap: 3,
  },
  categoryItem: {
    alignItems: "center",
    width: 60,
  },
  categoryItemActive: {
    transform: [{ scale: 1.03 }],
  },
  categoryIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryLabel: {
    marginTop: 4,
    fontSize: 8,
    color: colors.medium,
    fontWeight: "600",
  },
  categoryLabelActive: {
    color: colors.primary,
  },
  newestNearMeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationSpan: {
    fontSize: 11,
    color: colors.medium,
    fontWeight: "500",
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
});

export default ListingsHeader;
