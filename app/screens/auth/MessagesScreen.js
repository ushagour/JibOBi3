import React, { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

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

  const handleSelectReply = (message) => {
    const isMine = isSentByCurrentUser(message);
    const targetUserId = isMine ? message.receiverId : message.senderId;
    const targetUserName = isMine ? message.toUser : message.fromUser;
    const listingId = message.listing?.id || message.listingId;

    if (!targetUserId || !listingId) {
      Alert.alert(
        "Reply unavailable",
        "This message does not have enough details to send a reply."
      );
      return;
    }

    setReplyTo({
      messageId: message.id,
      targetUserId,
      targetUserName,
      listingId,
      listingTitle: message.listing?.title,
      preview: message.content,
    });
  };

  const handleSendReply = async () => {
    const content = replyText.trim();

    if (!replyTo) {
      Alert.alert("Select a message", "Tap any message bubble to reply.");
      return;
    }

    if (!content) return;

    try {
      setSending(true);
      const response = await messagesApi.send(
        content,
        replyTo.targetUserId,
        replyTo.listingId
      );

      if (!response?.ok) {
        Alert.alert("Error", "Failed to send reply.");
        return;
      }

      const createdMessage = response.data || {};

      setMessages((prev) => [
        ...prev,
        {
          id: createdMessage.id || Date.now(),
          senderId: user?.userId,
          receiverId: replyTo.targetUserId,
          fromUser: user?.name,
          toUser: replyTo.targetUserName,
          content,
          listingId: replyTo.listingId,
          listing: replyTo.listingTitle
            ? { id: replyTo.listingId, title: replyTo.listingTitle }
            : null,
          createdAt: createdMessage.createdAt || new Date().toISOString(),
          avatar: user?.avatar,
        },
      ]);

      setReplyText("");
      setReplyTo(null);
    } catch (sendError) {
      console.error("Error sending reply:", sendError);
      Alert.alert("Error", "Something went wrong while sending your reply.");
    } finally {
      setSending(false);
    }
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
          onPress={() => handleSelectReply(item)}
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.screenWrap}
      >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Tap a message to reply</Text>
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

      <View style={styles.composerContainer}>
        {replyTo && (
          <View style={styles.replyPreviewContainer}>
            <View style={styles.replyPreviewTextWrap}>
              <Text style={styles.replyingToText}>
                Replying to {replyTo.targetUserName}
              </Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>
                {replyTo.preview}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <MaterialCommunityIcons
                name="close-circle"
                size={22}
                color={colors.textSecondary || "#6B7280"}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={replyText}
            onChangeText={setReplyText}
            placeholder={replyTo ? "Write your reply..." : "Tap a message to reply"}
            placeholderTextColor={colors.textTertiary || "#9CA3AF"}
            multiline
            editable={!sending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!replyText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendReply}
            disabled={!replyText.trim() || sending}
          >
            <MaterialCommunityIcons
              name="send"
              size={18}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
  },
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
    paddingBottom: 8,
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
  composerContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray || "#E5E7EB",
    backgroundColor: colors.surface || "#FFFFFF",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  replyPreviewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.lighterGray || "#F3F4F6",
  },
  replyPreviewTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  replyingToText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
  },
  replyPreviewText: {
    fontSize: 12,
    color: colors.textSecondary || "#6B7280",
    marginTop: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: colors.lightGray || "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary || colors.dark,
    backgroundColor: colors.white,
  },
  sendButton: {
    marginLeft: 8,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default MessagesScreen;
