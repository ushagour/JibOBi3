import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import AppText from "../../components/Text";
import Avatar from "../../components/Avatar";
import colors from "../../config/colors";
import notificationsApi from "../../api/notifications";
import useAuth from "../../auth/useAuth";

function ConversationScreen({ route, navigation }) {
  const { otherUserId, otherUserName } = route.params || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const flatRef = useRef();

  useEffect(() => {
    if (!otherUserId) return;
    navigation.setOptions({ title: otherUserName || "Conversation" });
    loadConversation();
  }, [otherUserId]);

  const loadConversation = async () => {
    setLoading(true);
    try {
      const resp = await notificationsApi.getConversation(otherUserId);
      if (!resp.ok || !resp.data) {
        Alert.alert("Error", "Could not load conversation.");
        return;
      }
      setMessages(resp.data.data || resp.data);
      setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 200);
    } catch (error) {
      if (__DEV__) console.error(error);
      Alert.alert("Error", "Could not load conversation.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      const payload = {
        userId: otherUserId,
        actorId: user?.userId,
        type: "message",
        title: `Message from ${user?.firstName || user?.name || 'User'}`,
        content: text.trim(),
      };

      // Optimistic append
      const temp = {
        id: `temp-${Date.now()}`,
        user_id: otherUserId,
        actor_id: user?.userId,
        type: 'message',
        title: payload.title,
        content: payload.content,
        createdAt: new Date().toISOString(),
        actor: { id: user?.userId, name: user?.firstName || user?.name },
      };
      setMessages((m) => [...m, temp]);
      setText("");
      flatRef.current?.scrollToEnd?.({ animated: true });

      const resp = await notificationsApi.createForUser(payload);
      if (!resp.ok) {
        Alert.alert("Failed", "Could not send message");
        // remove temp
        setMessages((m) => m.filter((x) => x.id !== temp.id));
        return;
      }

      // replace temp with server message
      const created = resp.data;
      setMessages((m) => m.map((x) => (x.id === temp.id ? created : x)));
    } catch (error) {
      if (__DEV__) console.error(error);
      Alert.alert("Error", "Failed to send message");
    }
  };

  const renderItem = ({ item }) => {
    const isSender = String(item.actor?.id || item.actor_id) === String(user?.userId);
    return (
      <View style={[styles.row, isSender ? styles.rowRight : styles.rowLeft]}>
        {!isSender && <Avatar size={36} name={item.actor?.name} avatar={item.actor?.avatar} />}
        <View style={[styles.bubble, isSender ? styles.bubbleRight : styles.bubbleLeft]}>
          <AppText style={styles.messageText}>{item.content}</AppText>
          <AppText style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString()}</AppText>
        </View>
        {isSender && <Avatar size={36} name={item.actor?.name} avatar={item.actor?.avatar} />}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList
        ref={flatRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.container}
      />

      <View style={styles.composer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={`Message ${otherUserName || ''}`}
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <AppText style={styles.sendText}>Send</AppText>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 90,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
    gap: 8,
  },
  rowLeft: {
    justifyContent: 'flex-start',
  },
  rowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
  },
  bubbleLeft: {
    backgroundColor: '#f1f3f5',
  },
  bubbleRight: {
    backgroundColor: colors.primary,
  },
  messageText: {
    color: '#000',
  },
  timeText: {
    fontSize: 10,
    color: '#666',
    marginTop: 6,
    textAlign: 'right',
  },
  composer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default ConversationScreen;
