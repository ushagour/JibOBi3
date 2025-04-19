import React, { useState, useEffect } from "react";
import { FlatList, StyleSheet, View, Alert, Text, Button } from "react-native";
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
import CustomCheckbox from "../../components/CustomCheckbox"; // Import CustomCheckbox

function MessagesScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectAll, setSelectAll] = useState(false); // State for "Select All" checkbox

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getAll();

      if (response.ok) {
        setMessages(response.data.map((msg) => ({ ...msg, selected: false }))); // Add `selected` property
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
      "Are you sure you want to delete this message: " + message.content,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const response = await messagesApi.deleteMessage(message.id);

            if (response.ok) {
              setMessages(messages.filter((item) => item.id !== message.id));
              Alert.alert("Success", "Message deleted successfully.");
            } else {
              Alert.alert("Error", "Failed to delete message.");
              console.error("Failed to delete message:", response.problem);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAll = async () => {
    Alert.alert(
      "Delete All Confirmation",
      "Are you sure you want to delete all selected messages?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          onPress: async () => {
            const selectedMessages = messages.filter((msg) => msg.selected);

            try {
              for (const message of selectedMessages) {
                await messagesApi.deleteMessage(message.id);
              }

              setMessages(messages.filter((msg) => !msg.selected));
              Alert.alert("Success", "Selected messages deleted successfully.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete some messages.");
              console.error("Error deleting messages:", error);
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setMessages(messages.map((msg) => ({ ...msg, selected: !selectAll })));
  };

  const toggleSelectMessage = (id) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, selected: !msg.selected } : msg
      )
    );
  };

  return (
    <Screen>
            {/* Select All Checkbox */}
            <View style={styles.selectAllContainer}>
  <CustomCheckbox
    isChecked={selectAll}
    onPress={toggleSelectAll}
    size={24}
    color={colors.primary} // Customize checkbox colors
  />
  <Text style={styles.selectAllText}>Select All</Text>
  <View style={styles.deleteAllButton}>
    {selectAll && (
    <Button
    title="Delete All"
    onPress={handleDeleteAll}
    color={colors.danger}
    disabled={!messages.some((msg) => msg.selected)} // Disable if no messages are selected
  />    )}

    
  </View>
</View>
      {error && !loading && (
        <View style={{ alignItems: "center", padding: 10 }}>
          <Text style={{ color: colors.primary }}>
            Something went wrong, please try again.
          </Text>
        </View>
      )}

      {messages.length === 0 && !loading && (
        <View style={{ alignItems: "center", padding: 10 }}>
          <Text style={{ color: "red" }}>
            You have no notifications at the moment
          </Text>
        </View>
      )}


      <FlatList
        data={messages}
        keyExtractor={(message) => message.id.toString()}
        renderItem={({ item }) => (
          <ListItem
            title={`From: ${item.fromUser}`} // Display sender ID
            subTitle={item.content} // Display message content
            image={{ uri: item.avatar }}
            renderRightActions={() => (
              <ListItemDeleteAction onPress={() => handleDelete(item)} />
            )}
            onPress={() => toggleSelectMessage(item.id)} // Toggle selection on press
            style={{
              backgroundColor: item.selected ? colors.light : "white", // Highlight selected messages
            }}
          />
        )}
        ItemSeparatorComponent={ListItemSeparator}
        refreshing={refreshing}
        onRefresh={loadMessages}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  selectAllText: {
    marginLeft: 10, // Space between the checkbox and the text
    fontSize: 16,
  },
  deleteAllButton: {
    marginLeft: "auto", // Push the button to the right
    backgroundColor: colors.danger,
  },
});

export default MessagesScreen;
