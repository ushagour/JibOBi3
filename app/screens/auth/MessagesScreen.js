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


function MessagesScreen(props) {
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
      const response = await messagesApi.getMymessages();
      
      if (response.ok) {
        setMessages(response.data);
        console.log("Messages:", response.data);
        
        setError(false);
      } else {
        setError(true);
        console.error("Failed to fetch messages:", response.problem);
      }
    } catch (error) {
      setError(true);
      console.error("Error during request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (message) => {
    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const response = await messagesApi.getMymessages(message);
            // console.log("response", response);
            
            if (response.ok) {
              setMessages(messages.filter((item) => item.id !== message.id));
              Alert.alert("Success", "messages deleted successfully.");
            } else {
              Alert.alert("Error", "Failed to delete messages.");
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
            {messages.length === 0 && !loading && (
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
              // image={require("../../assets/user.png")}
              image={{uri: item.fromUser.avatar}}
            onPress={() => console.log("Message selected", item)}
            renderRightActions={() => (
              <ListItemDeleteAction onPress={() => handleDelete(item)} />
            )}
          />
        )}
        ItemSeparatorComponent={ListItemSeparator}
        refreshing={refreshing}
        onRefresh={() => {
          setMessages([
            {
              id: 2,
              title: "T2",
              description: "D2",
            },
          ]);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({});

export default MessagesScreen;
