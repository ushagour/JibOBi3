import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, View, Alert, Text, TouchableOpacity } from "react-native";
import dayjs from "dayjs";

import Screen from "../../components/Screen";
import listingsApi from "../../api/listings";
import routes from "../../navigation/routes";
import useAuth from "../../auth/useAuth";
import ActivityIndicator from "../../components/ActivityIndicator";
import colors from "../../config/colors";
import ErrorStateScreen from "../../components/ErrorStateScreen";
import Product from "../../components/cards/Product";

function FavoritesScreen({ navigation }) {
  const { user } = useAuth(); // Get the user from the auth context
  const [listings, setListings] = useState([]);
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
      const response = await listingsApi.getMyListings(user.userId); // Pass the user ID
      
      if (response.ok) {
        setListings(response.data);
        setError(false);
      } else {
        setError(true);
        if (__DEV__) console.error("Failed to fetch listings:", response.problem);
      }
    } catch (error) {
      setError(true);
      if (__DEV__) console.error("Error during request:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (listing) => {
    Alert.alert(
      "Delete Confirmation",
      `Are you sure you want to delete this ${listing.title}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setIsDeletingListing(true);
              if (__DEV__) console.log(`Attempting to delete listing with ID: ${listing.id}`);
              const response = await listingsApi.deleteListing(listing.id);
              if (!response.ok) {
                if (__DEV__) console.error("Failed to delete listing:", response);
                return Alert.alert("Error", "Failed to delete listing.");
              }
              setListings((currentListings) =>
                currentListings.filter((item) => item.id !== listing.id)
              );
              Alert.alert("Success", "Listing deleted successfully.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete listing.");
              if (__DEV__) console.error("Failed to delete listing:", error);
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

      {listings.length === 0 && !loading && (
        <View style={{ alignItems: "center", padding: 10 }}>
          <Text style={{ color: "red" }}>You have no listings.</Text>
        </View>
      )}

      <FlatList
        data={listings}
        keyExtractor={(listing) => listing.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Product 
              title={item.title}
              price={item.price}
              imageUri={item.imageUrl}
              rating={item.rating}
              onPress={() => navigation.navigate(routes.LISTING_DETAILS, { listing: item })}
              createdAt={dayjs(item.createdAt).format("MMM D, YYYY")}
            />

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => navigation.navigate(routes.LISTING_EDIT, { listing: item })}
              >
                <Text style={[styles.actionText, styles.editText]}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item)}
              >
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await loadListings();
          setRefreshing(false);
        }}
        contentContainerStyle={styles.listContent}
      />
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
});


export default FavoritesScreen;
