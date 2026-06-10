import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, TouchableOpacity } from "react-native";

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
    data: activeListings,
    error,
    loading,
    request: loadActiveListings,
  } = useApi(listingsApi.getMyListings);
  const {
    data: archivedResponse,
    error: archivedError,
    loading: loadingArchived,
    request: loadArchivedListings,
  } = useApi(listingsApi.getArchivedListings);
  const {
    data: soldResponse,
    error: soldError,
    loading: loadingSold,
    request: loadSoldListings,
  } = useApi(listingsApi.getSoldListings);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (user?.userId) {
      loadActiveListings(user.userId);
      loadArchivedListings();
      loadSoldListings();
    }
    
    
  }, [user]);

  const archivedListings = Array.isArray(archivedResponse)
    ? archivedResponse
    : archivedResponse?.data || [];

  const soldListings = Array.isArray(soldResponse)
    ? soldResponse
    : soldResponse?.data || [];

  const displayedListings =
    activeTab === "active"
      ? activeListings
      : activeTab === "sold"
      ? soldListings
      : archivedListings;
  const hasError =
    activeTab === "active"
      ? error
      : activeTab === "sold"
      ? soldError
      : archivedError;
  const loadingCurrent =
    activeTab === "active"
      ? loading
      : activeTab === "sold"
      ? loadingSold
      : loadingArchived;

  const handleRetry = () => {
    if (!user?.userId) return;
    if (activeTab === "active") {
      loadActiveListings(user.userId);
      return;
    }
    if (activeTab === "sold") {
      loadSoldListings();
      return;
    }
    loadArchivedListings();
  };

  return (
    <>
      <ActivityIndicator visible={loadingCurrent} />
      <View style={styles.screen}>
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "active" && styles.tabButtonActive]}
            onPress={() => setActiveTab("active")}
          >
            <AppText style={[styles.tabText, activeTab === "active" && styles.tabTextActive]}>Active</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "sold" && styles.tabButtonActive]}
            onPress={() => setActiveTab("sold")}
          >
            <AppText style={[styles.tabText, activeTab === "sold" && styles.tabTextActive]}>Sold</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "archived" && styles.tabButtonActive]}
            onPress={() => setActiveTab("archived")}
          >
            <AppText style={[styles.tabText, activeTab === "archived" && styles.tabTextActive]}>Archived</AppText>
          </TouchableOpacity>
        </View>

        {hasError && (
          <View style={styles.errorContainer}>
            <AppText>Couldn't retrieve the listings.</AppText>
            <Button title="Retry" onPress={handleRetry} />
          </View>
        )}

        <FlatList
          data={displayedListings}
          ListEmptyComponent={
            !loadingCurrent ? (
              <View style={styles.emptyContainer}>
                <AppText>
                  {activeTab === "active"
                    ? "No active listings yet."
                    : activeTab === "sold"
                    ? "No sold listings yet."
                    : "No archived listings yet."}
                </AppText>
              </View>
            ) : null
          }
          keyExtractor={(listing) => listing.id.toString()}
          renderItem={({ item }) => (
            <Product
              title={item.title}
              price={item.price}
              imageUri={item.images?.[0]?.url}
              onPress={() => navigation.navigate(routes.LISTING_DETAILS, item)}
              thumbnailUrl={item.images?.[0]?.thumbnailUrl}
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
    flex: 1,
  },
  tabsRow: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  tabTextActive: {
    color: colors.white,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  }
});

export default MyListingsScreen;
