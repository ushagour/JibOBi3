import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, View, Alert, Text } from "react-native";

import Screen from "../../components/Screen";
import {
  ListItem,
  ListItemDeleteAction,
  ListItemSeparator,
} from "../../components/lists";
import colors from "../../config/colors";
import MyNotificationApi from "../../api/my_Notifications";
import userApi from "../../api/users";
import routes from "../../navigation/routes";


function MyNotificationScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadMessages();
 

  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await MyNotificationApi.get_my_Notifications();
      
      if (response.ok) {
        setMessages(response.data);
        // console.log("Messages:", response.data);
        
        setError(false);
      } else {
        setError(true);
        // console.error("Failed to fetch messages:", response.problem);
      }
    } catch (error) {
      setError(true);
      // console.error("Error during request:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (message) => {
    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to delete this Notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const response = await MyNotificationApi.delete_notification(message);
            console.log("response", response);
            
            if (response.ok) {
              setMessages(messages.filter((item) => item.id !== message.id));
              Alert.alert("Success", "notification deleted successfully.");
            } else {
              Alert.alert("Error", "Failed to delete notification.");
              // console.error("Failed to delete listing:", response.problem);
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
          <Text style={{ color: colors.primary }}> Something went wrong, please try again.</Text>
        </View>
      )}
            {messages.length === 0 &&  (
        <View style={{ alignItems: "center", padding: 10 }}>
          <Text style={{ color: "red" }}>There is no messages for you for the moment.</Text>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(message) => message.id.toString()}
        renderItem={({ item }) => (
          <ListItem
              title={`From: ${item.fromUser.name}`} // Display sender ID
        

              subTitle={item.content} // Display message content
              image={{uri: item.fromUser.avatar}}
              //  onPress={() => navigation.navigate(routes.LISTING_DETAILS })}//todo : navigate to message details

            renderRightActions={() => (
              <ListItemDeleteAction onPress={() => handleDelete(item)} />
            )}
          />
        )}
        ItemSeparatorComponent={ListItemSeparator}
        refreshing={refreshing}
        onRefresh={() => {
          loadMessages();
    
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({});

export default MyNotificationScreen;
