import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import dayjs from "dayjs";
import { Ionicons } from "@expo/vector-icons";
import Product from "../../components/cards/Product";
import colors from "../../config/colors";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import listingsApi from "../../api/listings";
import categoriesApi from "../../api/categories";
import  ActivityIndicator  from "../../components/ActivityIndicator";
import useApi  from "../../hooks/useApi";
import ErrorStateScreen from "../../components/ErrorStateScreen";
import useAuth from "../../auth/useAuth";

const CATEGORY_FALLBACK_ICONS = {
  Sneakers: "👟",
  Watches: "⌚",
  Electronics: "🎧",
  Fashion: "👕",
  Furniture: "🪑",
  Other: "📦",
};

const isEmojiIcon = (value) => {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  return !trimmed.includes("fa ") && trimmed.length <= 3;
};

const resolveCategoryIcon = (category) => {
  if (isEmojiIcon(category?.icon)) return category.icon;
  return CATEGORY_FALLBACK_ICONS[category?.name] || "🛍️";
};

function ListingsScreen({ navigation }) {
  const { user } = useAuth();
      /* we distructure the data from the useApi hook and 
      we call the listingsApi.getListings function */
  const{data:listings, error, loading, request: fetchListings} = useApi(listingsApi.getListings)
  const {
    data: categoriesData,
    request: fetchCategories,
  } = useApi(categoriesApi.getCategories);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    const apiCategories = (categoriesData || []).map((category) => ({
      id: String(category.id),
      name: category.name,
      icon: resolveCategoryIcon(category),
    }));

    if (apiCategories.length > 0) {
      return [{ id: "all", name: "All", icon: "🧭" }, ...apiCategories];
    }

    const derivedCategories = Array.from(
      new Map(
        (listings || [])
          .map((item) => item?.Category)
          .filter(Boolean)
          .map((category) => [
            String(category.id ?? category.name),
            {
              id: String(category.id ?? category.name),
              name: category.name,
              icon: resolveCategoryIcon(category),
            },
          ])
      ).values()
    );

    return [
      { id: "all", name: "All", icon: "🧭" },
      ...derivedCategories,
    ];
  }, [categoriesData, listings]);

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (listings || []).filter((item) => {
      const itemCategoryId = String(item?.Category?.id ?? item?.Category?.name ?? "");
      const inCategory =
        selectedCategory === "all" || itemCategoryId === selectedCategory;

      if (!inCategory) return false;
      if (!query) return true;

      const title = item?.title?.toLowerCase() || "";
      const description = item?.description?.toLowerCase() || "";
      return title.includes(query) || description.includes(query);
    });
  }, [listings, searchQuery, selectedCategory]);

  
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchListings(), fetchCategories()]);
    setRefreshing(false);
  };

  
  useEffect(() => {
    fetchListings();
    fetchCategories();
}, []); 

  if (error && !loading) {
    return (
      <ErrorStateScreen
        type="network"
        title="Unable to load listings"
        message="We could not fetch listings right now. Check your network and retry."
        onRetry={fetchListings}
      />
    );
  }


  return (
    <>
      <ActivityIndicator visible={loading} />

      <Screen style={styles.screen} scrollable={false}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerBlock}>
            <Text style={styles.greetingText}>Good Morning,</Text>
            <Text style={styles.userNameText}>{user?.name || "User"} 👋</Text>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.medium} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for products..."
              placeholderTextColor={colors.medium}
              style={styles.searchInput}
            />
          </View>

          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  activeOpacity={0.8}
                  style={[styles.categoryItem, isActive && styles.categoryItemActive]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <View style={styles.categoryIconWrap}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </View>
                  <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionTitle}>Popular Products</Text>
          {filteredListings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={filteredListings}
              keyExtractor={(listing) => listing.id.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsHorisontalContainer}
              renderItem={({ item }) => (
                <Product
                  title={item.title}
                  imageUri={item.imageUri || item.imageUrl}
                  onPress={() => navigation.navigate(routes.LISTING_DETAILS, item.id)}
                  price={item.price}
                  seller={item.owner?.name}
                  description={item.description}
                  createdAt={dayjs(item.createdAt).format("MMM D")}
                  containerStyle={styles.popularProductCard}
                />
              )}
            />
          )}
  

        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  headerBlock: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  greetingText: {
    color: colors.medium,
    fontSize: 14,
    fontWeight: "600",
  },
  userNameText: {
    color: colors.dark,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 2,
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.dark,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.dark,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 10,
  },
  categoryItem: {
    alignItems: "center",
    width: 78,
  },
  categoryItemActive: {
    transform: [{ scale: 1.03 }],
  },
  categoryIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.medium,
    fontWeight: "600",
  },
  categoryLabelActive: {
    color: colors.primary,
  },
  productsContainer: {
    paddingLeft: 16,

    paddingRight: 8,
  },
  productCard: {
    width: '100%',
  },
  emptyContainer: {
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    padding: 12,
  },
  emptyText: {
    color: colors.medium,
    fontSize: 16,
  },
  productsHorisontalContainer: {
    paddingLeft: 16,
    paddingRight: 14,
  },
  popularProductCard: {
    width: 248,
    marginRight: 12,
  },
});

export default ListingsScreen;
