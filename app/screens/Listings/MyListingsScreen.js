import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";

import Product from "../../components/cards/Product";
import colors from "../../config/colors";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import listingsApi from "../../api/listings";
import ActivityIndicator from "../../components/ActivityIndicator";
import useApi from "../../hooks/useApi";
import useAuth from "../../auth/useAuth";
import AppText from "../../components/Text";
import Button from "../../components/Button";

function MyListingsScreen({ navigation }) {
  const { user } = useAuth();
  const {
    data: listings,
    error,
    loading,
    request: loadListings,
  } = useApi(listingsApi.getMyListings);

  useEffect(() => {
    if (user?.userId) {
      loadListings(user.userId);
    }
    
    
  }, [user]);

  return (
    <>
      <ActivityIndicator visible={loading} />
      <View style={styles.screen}>
        {error && (
          <View style={styles.errorContainer}>
            <AppText>Couldn't retrieve the listings.</AppText>
            <Button title="Retry" onPress={() => loadListings(user.userId)} />
          </View>
        )}

        <FlatList
          data={listings}
          keyExtractor={(listing) => listing.id.toString()}
          renderItem={({ item }) => (
            <Product
              title={item.title}
              price={item.price}
              imageUri={item.images[0].url}
              onPress={() => navigation.navigate(routes.LISTING_DETAILS, item)}
              thumbnailUrl={item.images[0].thumbnailUrl}
            />
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 20,
    backgroundColor: colors.light,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  }
});

export default MyListingsScreen;
