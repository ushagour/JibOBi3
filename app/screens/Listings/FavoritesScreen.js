import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import Screen from "../../components/Screen";
import favoritesApi from "../../api/favorites";
import routes from "../../navigation/routes";
import useAuth from "../../auth/useAuth";
import useTheme from "../../hooks/useTheme";
import ActivityIndicator from "../../components/ActivityIndicator";
import colors from "../../config/colors";
import ErrorStateScreen from "../../components/ErrorStateScreen";
import { useTranslation } from "react-i18next";

function FavoritesScreen({ navigation }) {
  const { user } = useAuth(); // Get the user from the auth context
  const { colors: themeColors, isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDeletingListing, setIsDeletingListing] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const response = await favoritesApi.getAllFavorites(); // Pass the user ID

      if (response.ok) {
        
        setFavorites(response.data);
        setError(false);
      } else {
        setError(true);
        if (__DEV__) console.error("Failed to fetch favorites:", response.problem);
        console.log(response);
        
      }
    } catch (error) {
      setError(true);
      if (__DEV__) console.error("Error during request:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleRemoveFavorite = (listing) => {
    Alert.alert(
      "Remove Favorite",
      `Are you sure you want to remove ${listing.title} from your favorites?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          onPress: async () => {
            try {
              setIsDeletingListing(true);
              if (__DEV__) console.log(`Attempting to remove favorite with listing ID: ${listing.id}`);
              const response = await favoritesApi.removeFavorite(listing.id);
              if (!response.ok) {
                if (__DEV__) console.error("Failed to remove favorite:", response);
                return Alert.alert("Error", "Failed to remove from favorites.");
              }
              setFavorites((currentFavorites) =>
                currentFavorites.filter((item) => item.id !== listing.id)
              );
              Alert.alert("Success", "Removed from favorites.");
            } catch (error) {
              Alert.alert("Error", "Failed to remove from favorites.");
              if (__DEV__) console.error("Failed to remove favorite:", error);
            } finally {
              setIsDeletingListing(false);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  if (error && !loading) {
    return (
      <ErrorStateScreen
        type="server"
        title="Could not load your listings"
        message="Please retry in a moment."
        onRetry={loadListings}
        onGoBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <Screen scrollable={false} paddingSize="md" backgroundColor={themeColors.background}>
      <ActivityIndicator visible={loading || isDeletingListing} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
          {favorites.length} {favorites.length === 1 ? t("common.item") : t("common.items")}
        </Text>
      </View>

      {/* Empty State */}
      {favorites.length === 0 && !loading ? (
        <View style={[styles.emptyContainer, { backgroundColor: themeColors.surface, borderColor: themeColors.lightGray }]}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={64}
            color={themeColors.lightGray}
          />
          <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>{t("common.no_favorites_yet")}</Text>
          <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
            {t("common.start_adding_favorites")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(favorite) => String(favorite.id)}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.favoriteCard, { backgroundColor: themeColors.surface }]}
              onPress={() => navigation.navigate(routes.LISTING_DETAILS, { listing: item })}
            >
              {/* Card Image */}
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
                {/* Heart Icon */}
                <Pressable
                  style={[styles.heartButton, { backgroundColor: themeColors.surface }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(item);
                  }}
                >
                  <MaterialCommunityIcons
                    name="heart"
                    size={22}
                    color={colors.danger}
                  />
                </Pressable>
              </View>

              {/* Card Content */}
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.cardPrice}>${item.price}</Text>
              </View>
            </Pressable>
          )}
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await loadListings();
            setRefreshing(false);
          }}
          contentContainerStyle={styles.listContent}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  favoriteCard: {
    width: "48%",
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
    backgroundColor: colors.lightGray,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});


export default FavoritesScreen;
