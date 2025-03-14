import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, View, Alert, Text } from "react-native";

import Screen from "../../components/Screen";
import { ListItem, ListItemDeleteAction, ListItemSeparator,ListItemEditAction } from "../../components/lists";
import listingsApi from "../../api/listings";
import routes from "../../navigation/routes";
import useAuth from "../../auth/useAuth"; // Import the useAuth hook

function MyListingsScreen({ navigation }) {
  const { user } = useAuth(); // Get the user from the auth context
  const [listings, setListings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
        console.error("Failed to fetch listings:", response.problem);
      }
    } catch (error) {
      setError(true);
      console.error("Error during request:", error);
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
              console.log(`Attempting to delete listing with ID: ${listing.id}`);
              const response = await listingsApi.deleteListing(listing.id);
              if (!response.ok) {
                console.error("Failed to delete listing:", response);
                return Alert.alert("Error", "Failed to delete listing.");
              }
              setListings(listings.filter((item) => item.id !== listing.id));
              Alert.alert("Success", "Listing deleted successfully.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete listing.");
              console.error("Failed to delete listing:", error);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Screen>
      {error && !loading && (
        <View style={{ alignItems: "center", padding: 10 }}>
          <Text style={{ color: "red" }}>Couldn't retrieve listings. Please try again later.</Text>
        </View>
      )
      }
      {listings.length === 0 && !loading && (
        <View style={{ alignItems: "center", padding: 10 }}>
          <Text style={{ color: "red" }}>You have no listings.</Text>
        </View>
      )}

      <FlatList
        data={listings}
        keyExtractor={(listing) => listing.id.toString()}
        renderItem={({ item }) => (
          <ListItem
            title={item.title}
            image={{ uri: item.imageUrl }}
            onPress={() => navigation.navigate(routes.LISTING_DETAILS, {id:item.listing})}
            renderRightActions={() => (
              <View style={styles.actionsContainer}>
              <ListItemDeleteAction onPress={() => handleDelete(item)} />
              <ListItemEditAction onPress={() => navigation.navigate(routes.LISTING_EDIT, {listing: item
            })} />
            </View>

            
            )}
          />
        )}
        ItemSeparatorComponent={ListItemSeparator}
        refreshing={refreshing}
        onRefresh={loadListings}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
  },
});


export default MyListingsScreen;
