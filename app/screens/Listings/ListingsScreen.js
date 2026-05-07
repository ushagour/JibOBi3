import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
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
import favoritesApi from "../../api/favorites";
import categoriesApi from "../../api/categories";
import  ActivityIndicator  from "../../components/ActivityIndicator";
import useApi  from "../../hooks/useApi";
import ErrorStateScreen from "../../components/ErrorStateScreen";
import Header from "../../components/Header";
import useAuth from "../../auth/useAuth";
import { Alert } from "react-native";
import useLocation from "../../hooks/useLocation";
import { useLocale } from "@react-navigation/native";


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

const isAvailableStatus = (status) => {
  const normalized = String(status || "").toLowerCase().trim();

  if (!normalized) return true;
  if (
    normalized.includes("selled") ||
    normalized.includes("sold out") ||
    normalized === "sold"
  ) {
    return false;
  }

  return normalized.includes("available");
};


function ListingsScreen({ navigation }) {
  const { user, isLoggedIn } = useAuth();
  const { location } = useLocation();
  const isGuest = !isLoggedIn();
  const{data:listings, error, loading, request: fetchNearbyListings} = useApi(listingsApi.nearbyListings);

  const {
    data: categoryListings,
    error: categoryError,
    loading: categoryLoading,
    request: fetchListingsByCategory,
  } = useApi(listingsApi.getListingsByCategory);


  const {
    data: categoriesData,
    request: fetchCategories,
  } = useApi(categoriesApi.getCategories);

  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState([]);

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getFavorites();
      if (response.ok && Array.isArray(response.data?.data)) {
        setFavoriteIds(response.data.data);
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error loading favorites:", error);
      }
    }
  };

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

  const listingsSource = isGuest
    ? listings
    : selectedCategory === "all"
      ? listings
      : categoryListings;

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return (listingsSource || []).filter((item) => {
      if (!isAvailableStatus(item?.status)) return false;

      if (isGuest && selectedCategory !== "all") {
        const categoryId = String(item?.Category?.id ?? "");
        if (categoryId !== String(selectedCategory)) return false;
      }

      if (!query) return true;

      const title = item?.title?.toLowerCase() || "";
      const description = item?.description?.toLowerCase() || "";
      return title.includes(query) || description.includes(query);
    });
  }, [listingsSource, searchQuery, isGuest, selectedCategory]);

  
  
  const handleRefresh = async () => {
    setRefreshing(true);
    const requests = [fetchNearbyListings(location.latitude, location.longitude), fetchCategories()];

    if (!isGuest && selectedCategory !== "all") {
      requests.push(fetchListingsByCategory(selectedCategory));
    }

    if (!isGuest) {
      requests.push(loadFavorites());
    }

    await Promise.all(requests);
    setRefreshing(false);
  };

  
  useEffect(() => {
    if (location) {
      fetchNearbyListings(location.latitude, location.longitude).catch((error) => {
        if (__DEV__) console.error("Error fetching nearby listings:", error);
      });
    }
    fetchCategories();
    if (!isGuest) loadFavorites();
  }, [location]); 

  useEffect(() => {
    if (isGuest) return;
    if (selectedCategory === "all") return;
    fetchListingsByCategory(selectedCategory);
  }, [selectedCategory, isGuest]);

  const activeError = selectedCategory === "all" ? error : categoryError;
  const activeLoading = loading || categoryLoading;

  const handleFavoritePress = async (listingId) => {
    if (isGuest) {
      Alert.alert("Login required", "Please login to use favorites.");
      return;
    }

    const isAlreadyFavorite = favoriteIds.includes(listingId);

    if (isAlreadyFavorite) {
      Alert.alert(
        "Remove from favorites?",
        "This listing is already in your favorites. Do you want to remove it?",
        [
          {
            text: "Keep it",
            style: "cancel",
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                const response = await favoritesApi.removeFavorite(listingId);

                if (!response.ok) {
                  Alert.alert("Oops", "Could not remove favorite right now.");
                  return;
                }

                setFavoriteIds((current) =>
                  current.filter((id) => id !== listingId)
                );

                Alert.alert("Removed", "Listing removed from your favorites.");
              } catch (error) {
                if (__DEV__) {
                  console.error("Error removing favorite:", error);
                }
                Alert.alert("Oops", "Could not remove favorite right now.");
              }
            },
          },
        ]
      );
      return;
    }

    try {
      const response = await favoritesApi.addFavorite(listingId);

      if (!response.ok) {
        Alert.alert("Oops", "Could not add favorite right now.");
        return;
      }

      setFavoriteIds((current) =>
        current.includes(listingId) ? current : [...current, listingId]
      );
    } catch (error) {
      if (__DEV__) {
        console.error("Error adding favorite:", error);
      }
      Alert.alert("Oops", "Could not add favorite right now.");
    }
  };

  if (activeError && !activeLoading) {
    return (
      <ErrorStateScreen
        type="network"
        title="Unable to load listings"
        message="We could not fetch listings right now. Check your network and retry."
        onRetry={() =>
          selectedCategory === "all"
            ? fetchPopularListings()
            : fetchListingsByCategory(selectedCategory)
        }
      />
    );
  }


  // Render categories header
  const renderListHeader = () => (
    <View style={styles.fixedTopSection}>
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
        }}
        scrollEnabled={false}
        nestedScrollEnabled={false}
      />

      <Text style={styles.sectionTitle}>Newest Near Me</Text>
    </View>
  );

  const renderListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No products found.</Text>
    </View>
  );

  return (
    <>
      <ActivityIndicator visible={activeLoading} />
       
      <Screen style={styles.screen} scrollable={false} paddingSize="none">
        <Header />
        <FlatList
          data={filteredListings}
          keyExtractor={(listing) => listing.id.toString()}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={renderListEmpty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.productsVerticalContainer}
          renderItem={({ item }) => (
            <Product
              title={item.title}
              imageUri={item.imageUri || item.imageUrl}
              onPress={() => navigation.navigate(routes.LISTING_DETAILS, item.id)}
              onLikePress={!isGuest ? () => handleFavoritePress(item.id) : undefined}
              isLiked={favoriteIds.includes(item.id)}
              price={item.price}
              seller={item.owner?.name}
              description={item.description}
              createdAt={dayjs(item.createdAt).format("MMM D")}
              containerStyle={styles.productListCard}
            />
          )}
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light,
  },
  fixedTopSection: {
    backgroundColor: colors.light,
    paddingTop: 8,
    paddingBottom: 2,
  },
  headerBlock: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomColor: colors.lightGray,
  },
  greetingText: {
    color: colors.medium,
    fontSize: 12,
    fontWeight: "600",
  },
  userNameText: {
    color: colors.dark,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 1,
  },
  searchBar: {
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.lightGray,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    fontSize: 22,
    fontWeight: "800",
    color: colors.dark,
    marginHorizontal: 12,
    marginBottom: 6,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 6,
    gap: 4,
  },
  categoryItem: {
    alignItems: "center",
    width: 65,
  },
  categoryItemActive: {
    transform: [{ scale: 1.03 }],
  },
  categoryIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIcon: {
    fontSize: 25,
  },
  categoryLabel: {
    marginTop: 6,
    fontSize: 9,
    color: colors.medium,
    fontWeight: "600",
  },
  categoryLabelActive: {
    color: colors.primary,
  },
  emptyContainer: {
    marginHorizontal: 12,
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
  productsVerticalContainer: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 10,
  },
  productListCard: {
    width: "100%",
    marginRight: 0,
  },
});

export default ListingsScreen;
