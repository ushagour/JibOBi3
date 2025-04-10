import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, View, Alert, Text } from "react-native";

import Screen from "../../components/Screen";
import {
  ListItem,
  ListItemDeleteAction,
  ListItemSeparator,
} from "../../components/lists";
import colors from "../../config/colors";
import messagesApi from "../../api/messages";
import userApi from "../../api/users";
import routes from "../../navigation/routes";


function MessagesScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadMessages();
 

  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getAll();
      
      
      if (response.ok) {
        setMessages(response.data);
        
        setError(false);
      } 
    } catch (error) {
      setError(true);
      console.error("Error during request:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (message) => {
    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to delete this message :" + message.content,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {

            const response = await messagesApi.deleteMessage(message.id);
          
            if (response.ok) {
              setMessages(messages.filter((item) => item.id !== message.id));
              Alert.alert("Success", "notification deleted successfully.");
            } else {
              Alert.alert("Error", "Failed to delete notification.");
              console.error("Failed to delete listing:", response.problem);
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
        
           {messages.length == 0 && !loading && (
             <View style={{ alignItems: "center", padding: 10 }}>
               <Text style={{ color: "red" }}>You have no notifications at the moment</Text>
             </View>
           )}
      <FlatList
        data={messages}
        keyExtractor={(message) => message.id.toString()}
        renderItem={({ item }) => (
          <ListItem
              title={`From: ${item.fromUser}`} // Display sender ID
              subTitle={item.content} // Display message content
              image={{uri: item.avatar}}
              // onPress={() => navigation.navigate(routes.LISTING_DETAILS, item.listing_id)}
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

export default MessagesScreen;
