import React, { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Screen from "../../components/Screen";
import colors from "../../config/colors";
import messagesApi from "../../api/messages";
import useAuth from "../../auth/useAuth";

function MessagesScreen({ navigation }) {
  const { user } = useAuth();
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
        setMessages(response.data || []);
        setError(false);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
      console.error("Error during request:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  const currentUserName = user?.name;

  const isSentByCurrentUser = (message) => {
    if (!currentUserName) return false;
    return (
      (message.fromUser || "").toLowerCase() === currentUserName.toLowerCase()
    );
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = (messageId) => {
    Alert.alert(
      "Delete Confirmation",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            const response = await messagesApi.deleteMessage(messageId);

            if (response.ok) {
              setMessages((prevMessages) =>
                prevMessages.filter((item) => item.id !== messageId)
              );
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

  const renderBubble = ({ item }) => {
    const isMine = isSentByCurrentUser(item);

    return (
      <View
        style={[
          styles.messageRow,
          isMine ? styles.messageRowMine : styles.messageRowOther,
        ]}
      >
        {!isMine && (
          <Image
            source={{ uri: item.avatar || undefined }}
            style={styles.avatar}
            defaultSource={require("../../assets/icon.png")}
          />
        )}

        <Pressable
          style={styles.messageMetaWrapper}
          onLongPress={() => handleDelete(item.id)}
          delayLongPress={350}
        >
          <View
            style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}
          >
            {!isMine && <Text style={styles.senderName}>{item.fromUser}</Text>}
            <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
              {item.content}
            </Text>
            {!!item.listing?.title && (
              <Text style={[styles.listingText, isMine && styles.listingTextMine]}>
                Re: {item.listing.title}
              </Text>
            )}
            <Text style={[styles.timeText, isMine && styles.timeTextMine]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </Pressable>

        {isMine && <View style={styles.mineSpacer} />}
      </View>
    );
  };

  return (
    <Screen scrollable={false}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Your latest conversations</Text>
      </View>

      {error && !loading && (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>
            Something went wrong, please try again.
          </Text>
        </View>
      )}

      {messages.length === 0 && !loading && (
        <View style={styles.stateContainer}>
          <Text style={styles.emptyText}>
            You have no notifications at the moment
          </Text>
        </View>
      )}

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      <FlatList
        data={sortedMessages}
        keyExtractor={(message) => message.id.toString()}
        renderItem={renderBubble}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadMessages}
            tintColor={colors.primary}
          />
        }
        onEndReachedThreshold={0.2}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray || "#ECECEC",
    backgroundColor: colors.surface || "#FFFFFF",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary || colors.dark,
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textSecondary || "#6B7280",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageRowOther: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
    backgroundColor: colors.lightGray || "#E5E7EB",
  },
  mineSpacer: {
    width: 42,
  },
  messageMetaWrapper: {
    maxWidth: "78%",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: colors.surface || "#FFFFFF",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: colors.lightGray || "#E5E7EB",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 3,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: colors.textPrimary || colors.dark,
  },
  messageTextMine: {
    color: colors.white,
  },
  listingText: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textSecondary || "#6B7280",
  },
  listingTextMine: {
    color: "#D6F2F3",
  },
  timeText: {
    marginTop: 6,
    fontSize: 11,
    color: colors.textTertiary || "#9CA3AF",
    textAlign: "right",
  },
  timeTextMine: {
    color: "#D6F2F3",
  },
  stateContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
  },
  emptyText: {
    color: colors.textSecondary || "#6B7280",
    fontSize: 14,
  },
  loaderContainer: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    zIndex: 2,
  },
});

export default MessagesScreen;
