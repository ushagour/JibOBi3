import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import dayjs from "dayjs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Product from "../../components/cards/Product";
import colors from "../../config/colors";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import listingsApi from "../../api/listings";
import favoritesApi from "../../api/favorites";
import categoriesApi from "../../api/categories";
import ActivityIndicator from "../../components/ActivityIndicator";
import useApi from "../../hooks/useApi";
import ErrorStateScreen from "../../components/ErrorStateScreen";
import Header from "../../components/Header";
import ListingsHeader from "../../components/ListingsHeader";
import useAuth from "../../auth/useAuth";
import { Alert } from "react-native";
import useLocation from "../../hooks/useLocation";
import { useLocale } from "@react-navigation/native";
import useTheme from "../../hooks/useTheme";


const CATEGORY_FALLBACK_ICONS = {
  Sneakers: "👟",
  Watches: "⌚",
  Electronics: "🎧",
  Fashion: "👕",
  Furniture: "🪑",
  cars: "🚗",
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


function ListingsScreen({ navigation, route }) {
  const { colors: themeColors } = useTheme();
  const { user, isLoggedIn } = useAuth();
  const { location,getLocationName } = useLocation();
  const { city, country } = getLocationName();
  const isGuest = !isLoggedIn();

  // Determine if we are viewing "My Listings"
  const isMyListings = route.params?.myListings;

  const {
    data: listings,
    error,
    loading,
    request: fetchNearbyListings,
  } = useApi(listingsApi.nearbyListings);

  const {
    data: myListingsData,
    error: myListingsError,
    loading: myListingsLoading,
    request: fetchMyListings,
  } = useApi(listingsApi.getMyListings);

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
    try {
      const requests = [fetchCategories()];

      if (location?.latitude && location?.longitude) {
        requests.push(fetchNearbyListings(location.latitude, location.longitude));
      } else {
        await getLocation();
      }

      if (!isGuest && selectedCategory !== "all") {
        requests.push(fetchListingsByCategory(selectedCategory));
      }

      if (!isGuest) {
        requests.push(loadFavorites());
      }

      await Promise.all(requests);
    } finally {
      setRefreshing(false);
    }
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
            ? fetchNearbyListings(location.latitude, location.longitude)
            : fetchListingsByCategory(selectedCategory)
        }
      />
    );
  }


  const renderListEmpty = () => (
    <View style={[styles.emptyContainer, { backgroundColor: themeColors.surface }]}>
      <MaterialCommunityIcons
        name="package-off"
        size={48}
        color={colors.medium}
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptyDescription}>
        Try adjusting your search or filters to find what you're looking for
      </Text>
    </View>
  );

  return (
    <Screen style={styles.screen} scrollable={false} paddingSize="md">
      <ActivityIndicator visible={activeLoading} />
      <Header />
      <FlatList
        data={filteredListings}
        keyExtractor={(listing) => listing.id.toString()}
        ListHeaderComponent={
          <ListingsHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            locationName={city && country ? `${city}, ${country}` : null}
            
          />
        }
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light,
  },
  headerBlock: {
    borderBottomColor: colors.lightGray,
  },
  greetingText: {
    color: colors.medium,
    fontWeight: "600",
  },
  userNameText: {
    color: colors.dark,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 1,
  },
  emptyContainer: {
    marginHorizontal: 12,
    marginTop: 40,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  productsVerticalContainer: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingBottom: 8,
    gap: 8,
  },
  productListCard: {
    width: "100%",
    marginRight: 0,
  },
});

export default ListingsScreen;
