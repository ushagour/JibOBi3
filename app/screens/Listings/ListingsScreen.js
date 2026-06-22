import React, { useEffect, useMemo, useState,useLayoutEffect } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Animated,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import dayjs from "dayjs";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import ProductCard from "../../components/cards/ProductCard";
import SearchBar from "../../components/screens/listings/SearchBar";
import CategoryFilters from "../../components/screens/listings/CategoryFilters";
import QuickFilters from "../../components/screens/listings/QuickFilters";
import Screen from "../../components/Screen";
import listingsApi from "../../api/listings";
import favoritesApi from "../../api/favorites";
import categoriesApi from "../../api/categories";
import ActivityIndicator from "../../components/ActivityIndicator";
import useApi from "../../hooks/useApi";
import ErrorStateScreen from "../../components/ErrorStateScreen";
import useAuth from "../../auth/useAuth";
import useTheme from "../../hooks/useTheme";
import { Alert } from "react-native";
import useLocation from "../../hooks/useLocation";
import colors from "../../config/colors";
import routes from "../../navigation/routes";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2;

const CATEGORY_FALLBACK_ICONS = {
  Sneakers: "👟",
  Watches: "⌚",
  Electronics: "🎧",
  Fashion: "👕",
  Furniture: "🪑",
  Cars: "🚗",
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

const isClosedListing = (item) => {
  const normalizedStatus = String(item?.status || "").toLowerCase().trim();
  return Boolean(item?.archived) || !normalizedStatus.includes("available");
};

function ListingsScreen({ navigation }) {
  const { user, isLoggedIn } = useAuth();
  const { location } = useLocation();
  const { colors: themeColors } = useTheme();
  const isGuest = !isLoggedIn();

  // API hooks
  const {
    data: listingsData,
    error: listingsError,
    loading: listingsLoading,
    request: fetchListings,
  } = useApi(listingsApi.getListings);

  const {
    data: nearbyData,
    error: nearbyError,
    loading: nearbyLoading,
    request: fetchNearby,
  } = useApi(listingsApi.nearbyListings);

  const {
    data: categoryData,
    error: categoryError,
    loading: categoryLoading,
    request: fetchByCategory,
  } = useApi(listingsApi.getListingsByCategory);

  const { data: categoriesData, request: fetchCategories } = useApi(
    categoriesApi.getCategories
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getFavorites();
      if (response.ok && Array.isArray(response.data?.data)) {
        setFavoriteIds(response.data.data);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const categories = useMemo(() => {
    const apiCategories = (categoriesData || []).map((category) => ({
      id: String(category.id),
      name: category.name,
      icon: resolveCategoryIcon(category),
    }));
    return [{ id: "all", name: "All", icon: "🧭" }, ...apiCategories];
  }, [categoriesData]);

  const getCurrentListings = () => {
    if (activeFilter === "nearby") return nearbyData || [];
    if (selectedCategory !== "all") return categoryData || [];
    return listingsData || [];
  };

  const currentListings = getCurrentListings();

  const filteredListings = useMemo(() => {
    let filtered = [...currentListings];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    if (activeFilter === "topRated") {
      filtered = filtered.filter((item) => (item.rating || 0) >= 4.5);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateB - dateA;
    });

    return filtered;
  }, [currentListings, searchQuery, activeFilter]);

  useEffect(() => {
    const loadData = async () => {
      if (activeFilter === "nearby" && location) {
        await fetchNearby(location.latitude, location.longitude);
      } else if (selectedCategory !== "all") {
        await fetchByCategory(selectedCategory);
      } else {
        await fetchListings();
      }
    };
    loadData();
  }, [selectedCategory, activeFilter, location]);

  useEffect(() => {
    fetchCategories();
    if (!isGuest) loadFavorites();
    fetchListings();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeFilter === "nearby" && location) {
      await fetchNearby(location.latitude, location.longitude);
    } else if (selectedCategory !== "all") {
      await fetchByCategory(selectedCategory);
    } else {
      await fetchListings();
    }
    setRefreshing(false);
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setActiveFilter(null);
  };

  const handleFilterPress = (filter) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
  };

  const handleFavoritePress = async (listingId) => {
    if (isGuest) {
      Alert.alert("Login required", "Please login to use favorites.");
      return;
    }

    const isAlreadyFavorite = favoriteIds.includes(listingId);

    if (isAlreadyFavorite) {
      Alert.alert(
        "Remove from favorites?",
        "Do you want to remove this listing?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              const response = await favoritesApi.removeFavorite(listingId);
              if (response.ok) {
                setFavoriteIds((current) => current.filter((id) => id !== listingId));
              }
            },
          },
        ]
      );
    } else {
      const response = await favoritesApi.addFavorite(listingId);
      if (response.ok) {
        setFavoriteIds((current) => [...current, listingId]);
      }
    }
  };

  const isLoading = listingsLoading || nearbyLoading || categoryLoading;
  const hasError = listingsError || nearbyError || categoryError;

  if (hasError && !isLoading) {
    return (
      <ErrorStateScreen
        type="network"
        title="Unable to load listings"
        message="Check your network and retry."
        onRetry={handleRefresh}
      />
    );
  }

  const renderListEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="package-variant-closed" size={50} color={colors.medium} />
    </View>
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: user?.name || "Explorer",
      headerSubtitle: `Welcome back · `,
      headerRight: () =>
        isGuest ? null : (
          <TouchableOpacity
            style={[styles.notificationButton, { backgroundColor: themeColors.surface }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(routes.NOTIFICATIONS)}
          >
            <View style={styles.notificationBadge} />
            <Ionicons name="notifications-outline" size={22} color={themeColors.text} />
          </TouchableOpacity>
        ),
    });
  }, [navigation, user?.name, isGuest, themeColors]);

  return (
    <Screen style={[styles.screen, { backgroundColor: themeColors.background }]} scrollable={false} paddingSize="xs">
      <ActivityIndicator visible={isLoading} />      

      {/* Search Bar - Fixed at top */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Category Filters */}
      <CategoryFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Quick Filters */}
      <QuickFilters activeFilter={activeFilter} onFilterPress={handleFilterPress} />

      {/* Products Grid */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard
              item={item}
              onPress={() => navigation.navigate(routes.LISTING_DETAILS, { id: item.id })}
              onLikePress={() => handleFavoritePress(item.id)}
              isLiked={favoriteIds.includes(item.id)}
              isClosed={isClosedListing(item)}
            />
          </View>
        )}
        ListEmptyComponent={renderListEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal:14,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  notificationButton: {
    marginRight: 12,
    padding: 6,
    borderRadius: 20,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },


});

export default ListingsScreen;