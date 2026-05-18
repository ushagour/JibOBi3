import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLayoutEffect } from "react";
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
import Product from "../../components/cards/Product";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import listingsApi from "../../api/listings";
import favoritesApi from "../../api/favorites";
import categoriesApi from "../../api/categories";
import ActivityIndicator from "../../components/ActivityIndicator";
import useApi from "../../hooks/useApi";
import ErrorStateScreen from "../../components/ErrorStateScreen";
import useAuth from "../../auth/useAuth";
import { Alert } from "react-native";
import useLocation from "../../hooks/useLocation";
import colors from "../../config/colors";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Use shared theme colors

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

// Animated Product Card Component with Entrance Animation
const AnimatedProductCard = ({ item, index, onPress, onLikePress, isLiked, navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        mass: 0.8,
        stiffness: 100,
        useNativeDriver: true,
        delay: index * 50,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        delay: index * 50,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        damping: 15,
        mass: 0.8,
        stiffness: 120,
        useNativeDriver: true,
        delay: index * 50,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
        opacity: opacityAnim,
      }}
    >
      <Product
        title={item.title}
        imageUri={item.imageUri || item.imageUrl}
        onPress={onPress}
        onLikePress={onLikePress}
        isLiked={isLiked}
        price={item.price}
        seller={item.owner?.name}
        description={item.description}
        createdAt={dayjs(item.createdAt).format("MMM D")}
        containerStyle={styles.productListCard}
      />
    </Animated.View>
  );
};

// Stats Widget Component
const StatsWidget = ({ listings }) => {
  const stats = useMemo(() => {
    const total = listings?.length || 0;
    const available = listings?.filter(item => isAvailableStatus(item?.status)).length || 0;
    const categories = new Set(listings?.map(item => item?.Category?.name).filter(Boolean)).size;
    return { total, available, categories };
  }, [listings]);

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryLight || colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statsWidget}
    >
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="package-variant" size={24} color="#FFF" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="check-circle" size={24} color="#FFF" />
          <Text style={styles.statNumber}>{stats.available}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="tag-multiple" size={24} color="#FFF" />
          <Text style={styles.statNumber}>{stats.categories}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

// Trending Categories Widget
const TrendingCategories = ({ categories, selectedCategory, onSelectCategory, onSeeAll }) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.trendingSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trending Categories</Text>
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      <Animated.FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories.slice(0, 8)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.categoriesContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * 80,
            index * 80,
            (index + 1) * 80,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1.1, 0.9],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: "clamp",
          });

          return (
            <Animated.View style={{ transform: [{ scale }], opacity }}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === item.id && styles.categoryChipActive,
                ]}
                onPress={() => onSelectCategory(item.id)}
              >
                <Text style={styles.categoryEmoji}>{item.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    selectedCategory === item.id && styles.categoryNameActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </View>
  );
};

// Search Bar with Animation
const AnimatedSearchBar = ({ searchQuery, onSearchChange, isFocused, onFocus, onBlur }) => {
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(searchBarAnim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [isFocused]);

  const searchBarWidth = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenWidth - 16, screenWidth - 16],
  });

  return (
    <Animated.View style={[styles.searchWrapper, { width: searchBarWidth }]}>
      <View style={styles.searchBarContainer}>
        <Feather name="search" size={20} color={colors.textTertiary || colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.textTertiary || colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <Feather name="x" size={20} color={colors.textTertiary || colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

// Quick Filters Widget
const QuickFilters = ({ onFilterPress }) => {
  const filters = [
    { icon: "💰", label: "Under $50", value: "under50" },
    { icon: "⭐", label: "Top Rated", value: "topRated" },
    { icon: "📍", label: "Nearby", value: "nearby" },
  ];

  return (
    <View style={styles.quickFiltersSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filters.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickFilterChip}
            onPress={() => onFilterPress(filter.value)}
          >
            <Text style={styles.filterEmoji}>{filter.icon}</Text>
            <Text style={styles.filterLabel}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Featured Banner Widget
// const FeaturedBanner = () => {
//   return (
//     <LinearGradient
//       colors={["#FF6B6B", "#FF8E53"]}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 0 }}
//       style={styles.featuredBanner}
//     >
//       <View style={styles.bannerContent}>
//         <View>
//           <Text style={styles.bannerTitle}>Limited Time Offer</Text>
//           <Text style={styles.bannerSubtitle}>Up to 50% off on select items</Text>
//           <TouchableOpacity style={styles.bannerButton}>
//             <Text style={styles.bannerButtonText}>Shop Now →</Text>
//           </TouchableOpacity>
//         </View>
//         <MaterialCommunityIcons name="sale" size={60} color="#FFF" style={styles.bannerIcon} />
//       </View>
//     </LinearGradient>
//   );
// };

// Main Component
function ListingsScreen({ navigation, route }) {
  const { user, isLoggedIn } = useAuth();
  const { location, getLocationName } = useLocation();
  const { city, country } = getLocationName();
  const isGuest = !isLoggedIn();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const {
    data: listings,
    error,
    loading,
    request: fetchNearbyListings,
  } = useApi(listingsApi.nearbyListings);

  const {
    data: allListings,
    error: allListingsError,
    loading: allListingsLoading,
    request: fetchAllListings,
  } = useApi(listingsApi.getListings);

  const {
    data: categoryListings,
    error: categoryError,
    loading: categoryLoading,
    request: fetchListingsByCategory,
  } = useApi(listingsApi.getListingsByCategory);

  const { data: categoriesData, request: fetchCategories } = useApi(
    categoriesApi.getCategories
  );

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [showAllListings, setShowAllListings] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: user?.name || "Explorer",
      headerSubtitle: `Welcome back · ${city || country || "Nearby"}`,
      headerRight: () =>
        isGuest ? null : (
          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(routes.NOTIFICATIONS)}
          >
            <View style={styles.notificationBadge} />
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ),
    });
  }, [navigation, user?.name, city, country, isGuest]);

  const loadFavorites = async () => {
    try {
      const response = await favoritesApi.getFavorites();
      if (response.ok && Array.isArray(response.data?.data)) {
        setFavoriteIds(response.data.data);
      }
    } catch (error) {
      if (__DEV__) console.error("Error loading favorites:", error);
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

    return [{ id: "all", name: "All", icon: "🧭" }, ...derivedCategories];
  }, [categoriesData, listings]);

  const listingsSource = showAllListings
    ? allListings
    : isGuest
    ? listings
    : selectedCategory === "all"
    ? listings
    : categoryListings;

  const filteredListings = useMemo(() => {
    let query = searchQuery.trim().toLowerCase();
    let filtered = (listingsSource || []).filter((item) => {
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

    // Apply quick filters
    if (activeFilter === "under50") {
      filtered = filtered.filter(item => item.price < 50);
    } else if (activeFilter === "topRated") {
      filtered = filtered.filter(item => item.rating >= 4.5);
    } else if (activeFilter === "new") {
      filtered = filtered.filter(item => dayjs().diff(dayjs(item.createdAt), 'day') <= 7);
    }

    return filtered;
  }, [listingsSource, searchQuery, isGuest, selectedCategory, activeFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (showAllListings) {
        await fetchAllListings();
        return;
      }

      // Only refresh the listings list (nearby or by category).
      if (selectedCategory && selectedCategory !== "all" && !isGuest) {
        await fetchListingsByCategory(selectedCategory);
      } else {
        if (location?.latitude && location?.longitude) {
          await fetchNearbyListings(location.latitude, location.longitude);
        } else {
          await fetchNearbyListings();
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleSeeAll = async () => {
    setSelectedCategory("all");
    setShowAllListings(true);
    await fetchAllListings();
  };

  const handleSelectCategory = (categoryId) => {
    setShowAllListings(false);
    setSelectedCategory(categoryId);
  };

  useEffect(() => {
    if (location) {
      fetchNearbyListings(location.latitude, location.longitude);
    }
    fetchCategories();
    if (!isGuest) loadFavorites();
  }, [location]);

  useEffect(() => {
    if (isGuest || showAllListings) return;
    if (selectedCategory === "all") return;
    fetchListingsByCategory(selectedCategory);
  }, [selectedCategory, isGuest, showAllListings]);

  const activeError = showAllListings
    ? allListingsError
    : selectedCategory === "all"
    ? error
    : categoryError;
  const activeLoading = showAllListings ? allListingsLoading : loading || categoryLoading;

  const handleFavoritePress = async (listingId) => {
    if (isGuest) {
      Alert.alert("Login required", "Please login to use favorites.");
      return;
    }

    const isAlreadyFavorite = favoriteIds.includes(listingId);

    if (isAlreadyFavorite) {
      Alert.alert(
        "Remove from favorites?",
        "Do you want to remove this listing from your favorites?",
        [
          { text: "Keep it", style: "cancel" },
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
                setFavoriteIds((current) => current.filter((id) => id !== listingId));
                Alert.alert("Removed", "Listing removed from your favorites.");
              } catch (error) {
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
      Alert.alert("Oops", "Could not add favorite right now.");
    }
  };

  const handleFilterPress = (filter) => {
    setActiveFilter(activeFilter === filter ? null : filter);
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
    <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.emptyIconCircle}>
        <MaterialCommunityIcons name="package-variant-closed" size={40} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Products Found</Text>
      <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}> 
        Try adjusting your search or filters to find what you're looking for
      </Text>
    </View>
  );

  return (
    <Screen style={[styles.screen, { backgroundColor: colors.background }]} scrollable={false} paddingSize="md">
      <ActivityIndicator visible={activeLoading} />

      <FlatList
        data={filteredListings}
        keyExtractor={(listing) => listing.id.toString()}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <AnimatedSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isFocused={isSearchFocused}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <QuickFilters onFilterPress={handleFilterPress} activeFilter={activeFilter} />
            {/* <StatsWidget listings={listings} /> */}
            {/* <FeaturedBanner /> */}
            <TrendingCategories
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              onSeeAll={handleSeeAll}
            />
          </View>
        }
        ListEmptyComponent={renderListEmpty}
        refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
              />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsVerticalContainer}
        renderItem={({ item, index }) => (
          <AnimatedProductCard
            item={item}
            index={index}
            onPress={() => navigation.navigate(routes.LISTING_DETAILS, item.id)}
            onLikePress={!isGuest ? () => handleFavoritePress(item.id) : undefined}
            isLiked={favoriteIds.includes(item.id)}
            navigation={navigation}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowColor || colors.shadowColorStrong,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  notificationBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger || colors.error || "#FF5252",
    zIndex: 1,
  },
  listHeader: {
    paddingBottom: 12,
  },
  searchWrapper: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowColor || colors.shadowColorStrong,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 8,
  },
  quickFiltersSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowColor || colors.shadowColorStrong,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  statsWidget: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    paddingVertical: 20,
    overflow: "hidden",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.9,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#FFF",
    opacity: 0.2,
  },
  trendingSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  categoriesContainer: {
    paddingHorizontal: 8,
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
    marginRight: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowColor || colors.shadowColorStrong,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  categoryNameActive: {
    color: "#FFF",
  },
  emptyContainer: {
    marginHorizontal: 16,
    marginTop: 60,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowColor || colors.shadowColorStrong,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}10`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  productsVerticalContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  productListCard: {
    width: "100%",
    marginRight: 0,
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowColor || colors.shadowColorStrong,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default ListingsScreen;