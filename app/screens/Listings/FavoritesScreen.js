import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
// dayjs removed — not used in compact favorites list

import Screen from "../../components/Screen";
import favoritesApi from "../../api/favorites";
import routes from "../../navigation/routes";
import useAuth from "../../auth/useAuth";
import ActivityIndicator from "../../components/ActivityIndicator";
import colors from "../../config/colors";
import ErrorStateScreen from "../../components/ErrorStateScreen";
// compact list; no Product card used here

function FavoritesScreen({ navigation }) {
  const { user } = useAuth(); // Get the user from the auth context
  const [favorites, setFavorites] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDeletingListing, setIsDeletingListing] = useState(false);

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
    <Screen scrollable={false}>
      <ActivityIndicator visible={loading || isDeletingListing} />

      {favorites.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You have no favorites.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(favorite) => String(favorite.id)}
          renderItem={({ item }) => {
            const renderRightActions = () => (
              <RectButton style={styles.deleteAction} onPress={() => handleRemoveFavorite(item)}>
                <Text style={styles.deleteActionText}>Remove</Text>
              </RectButton>
            );

            return (
              <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => navigation.navigate(routes.LISTING_DETAILS, { listing: item })}
                >
                  <Image
                    source={item.imageUrl ? { uri: item.imageUrl } : require("../../assets/icon.png")}
                    style={styles.thumb}
                    resizeMode="cover"
                  />
                  <View style={styles.rowInfo}>
                    <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.price}>{item.price ? `$${item.price}` : ""}</Text>
                  </View>
                </TouchableOpacity>
              </Swipeable>
            );
          }}
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
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 14,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: -20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  actionButton: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  editButton: {
    backgroundColor: colors.infoLight,
    borderColor: colors.info,
  },
  deleteButton: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.danger,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "700",
  },
  editText: {
    color: colors.info,
  },
  deleteText: {
    color: colors.danger,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  rowInfo: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  price: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    borderRadius: 6,
  },
  deleteActionText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    color: "#666",
  },
});


export default FavoritesScreen;
