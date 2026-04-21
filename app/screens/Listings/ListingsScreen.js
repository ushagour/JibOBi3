import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet,RefreshControl } from "react-native";
import dayjs from "dayjs";
import Product from "../../components/cards/Product";
import colors from "../../config/colors";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import listingsApi from "../../api/listings";
import  ActivityIndicator  from "../../components/ActivityIndicator";
import useApi  from "../../hooks/useApi";
import ErrorStateScreen from "../../components/ErrorStateScreen";

function ListingsScreen({ navigation }) {
      /* we distructure the data from the useApi hook and 
      we call the listingsApi.getListings function */
  const{data:listings, error, loading, request: fetchListings} = useApi(listingsApi.getListings)
  const [refreshing, setRefreshing] = useState(false);

  
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await   fetchListings();   // Assuming `refetch` is your API call function
    setRefreshing(false);
  };

  
  useEffect(() => {
    
    fetchListings();
  
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
        <FlatList
          data={listings}
          numColumns={2}
          keyExtractor={(listing) => listing.id.toString()}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
             <Product
               title={item.title}
               imageUri={item.thumbnailUrl}
               onPress={() => navigation.navigate(routes.LISTING_DETAILS, item.id)}
               price={item.price}
               seller={item.owner?.name}
               categoryName={item.Category?.name}
               status={item.status}
               createdAt={dayjs(item.createdAt).format("MMM D, YYYY h:mm A")}
             />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 7,
    backgroundColor: colors.light,
  },
  listContent: {
    paddingBottom: 12,
  },
  row: {
    justifyContent: "space-between",
  },
});

export default ListingsScreen;
