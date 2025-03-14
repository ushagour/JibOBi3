import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet,RefreshControl } from "react-native";
import dayjs from "dayjs";
import Card from "../../components/Card";
import colors from "../../config/colors";
import routes from "../../navigation/routes";
import Screen from "../../components/Screen";
import listingsApi from "../../api/listings";
import AppText from "../../components/Text";
import  AppButton  from "../../components/Button";
import  ActivityIndicator  from "../../components/ActivityIndicator";
import useApi  from "../../hooks/useApi";

function ListingsScreen({ navigation }) {
      /* we distructure the data from the useApi hook and 
      we call the listingsApi.getListings function */
  const{data:listings, error, loading, request: fetchListings} = useApi(listingsApi.getListings)
  const [refreshing, setRefreshing] = useState(false);

  
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await   fetchListings();  // Assuming `refetch` is your API call function
    setRefreshing(false);
  };

  
  useEffect(() => {
    
    fetchListings();
  
}, []); 


  return (
<>
    <ActivityIndicator visible={loading} />

    <Screen style={styles.screen}>



    
    
      {error && <>
        <AppText>Couldn't retrieve the listings</AppText>
        <AppButton title="Retry" onPress={fetchListings} />
      </>
      }

      
      <FlatList
        data={listings}
        keyExtractor={(listing) => listing.id.toString()}
        renderItem={({ item }) => (
          <Card
            title={item.title}
            subTitle={ item.price}
            imageUrl={item.imageUrl}
            onPress={() => navigation.navigate(routes.LISTING_DETAILS, item.id)}
            thumbnailUrl={item.thumbnailUrl}
            ownerName={item.ownerName}
            status={item.status}
            coordinates={{ latitude: item.latitude, longitude: item.longitude }}
            createdAt={dayjs(item.createdAt).format('MMMM D, YYYY h:s')} // Format the createdAt date
            images={item.images} // Pass all images to the Card component
 
            />
          
        )}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
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
});

export default ListingsScreen;
