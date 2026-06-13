import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Text,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import AppText from "../../components/Text";
import Avatar from "../../components/Avatar";
import theme from "../../config/theme";
import messagesApi from "../../api/messages";
import useAuth from "../../auth/useAuth";

const { width, height } = Dimensions.get("window");

const palette = {
  background: theme.colors.background,
  surface: theme.colors.surface,
  primary: theme.colors.primary,
  primaryDark: theme.colors.primaryDark,
  primaryLight: theme.colors.primaryLight,
  secondary: theme.colors.secondary,
  accent: theme.colors.accent,
  textPrimary: theme.colors.textPrimary,
  textSecondary: theme.colors.textSecondary,
  textMuted: theme.colors.textTertiary,
  border: theme.colors.lightGray,
  shadow: theme.colors.shadowColor,
  gradientStart: theme.colors.primaryDark,
  gradientEnd: theme.colors.primaryLight,
};

// Animated Message Component
const AnimatedMessage = ({ item, isSender, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(isSender ? 50 : -50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 12,
        mass: 0.8,
        stiffness: 100,
        useNativeDriver: true,
        delay: index * 50,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        delay: index * 50,
      }),
      Animated.spring(translateXAnim, {
        toValue: 0,
        damping: 15,
        mass: 0.8,
        stiffness: 120,
        useNativeDriver: true,
        delay: index * 50,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.row,
        isSender ? styles.rowRight : styles.rowLeft,
        {
          transform: [{ scale: scaleAnim }, { translateX: translateXAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      {!isSender && (
        <Avatar 
          size={36} 
          name={item.sender?.name || item.actor?.name} 
          avatar={item.sender?.avatar || item.actor?.avatar} 
          style={styles.messageAvatar}
        />
      )}
      <LinearGradient
        colors={isSender ? [palette.gradientStart, palette.gradientEnd] : [palette.surface, palette.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.bubble,
          isSender ? styles.bubbleRight : styles.bubbleLeft,
        ]}
      >
        <AppText style={[styles.messageText, isSender && styles.messageTextRight]}>
          {item.content}
        </AppText>
        <View style={styles.messageFooter}>
          <AppText style={[styles.timeText, isSender && styles.timeTextRight]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </AppText>
          {isSender && (
            <MaterialCommunityIcons 
              name="check-all" 
              size={14} 
              color={item.is_read ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)"} 
              style={styles.readReceipt}
            />
          )}
        </View>
      </LinearGradient>
      {isSender && (
        <Avatar 
          size={36} 
          name={item.sender?.name || item.actor?.name} 
          avatar={item.sender?.avatar || item.actor?.avatar} 
          style={styles.messageAvatar}
        />
      )}
    </Animated.View>
  );
};

// Contact Card Component with Animation
const AnimatedContactCard = ({ item, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        mass: 0.8,
        stiffness: 120,
        useNativeDriver: true,
        delay: index * 50,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        delay: index * 50,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity style={styles.contactCard} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.contactLeft}>
          <Avatar size={52} name={item.name} avatar={item.avatar} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.contactPreview} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
        </View>
        <View style={styles.contactRight}>
          <Text style={styles.contactTime}>
            {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Custom Header Component
const CustomHeader = ({ title, onBack, onSearch, searchQuery, setSearchQuery }) => {
  const [showSearch, setShowSearch] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(searchAnim, {
      toValue: showSearch ? 1 : 0,
      damping: 15,
      mass: 0.8,
      stiffness: 100,
      useNativeDriver: false,
    }).start();
  }, [showSearch]);

  const searchWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - 100],
  });

  return (
    <LinearGradient
      colors={[palette.primaryDark, palette.primaryDark]}
      style={styles.headerGradient}
    >
      <BlurView intensity={20} tint="light" style={styles.headerBlur}>
        <View style={styles.headerContainer}>
          {!showSearch ? (
            <>
              <TouchableOpacity onPress={onBack} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setShowSearch(true)} style={styles.headerButton}>
                <Feather name="search" size={22} color="#FFF" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Animated.View style={[styles.searchContainer, { width: searchWidth }]}>
                <Feather name="search" size={20} color={palette.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search conversations..."
                  placeholderTextColor={palette.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
              </Animated.View>
              <TouchableOpacity onPress={() => {
                setShowSearch(false);
                setSearchQuery("");
              }} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </BlurView>
    </LinearGradient>
  );
};

function ConversationScreen({ route, navigation }) {
  const { otherUserId, otherUserName } = route.params || {};
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const flatRef = useRef();
  const inputRef = useRef();
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (otherUserId) {
      navigation.setOptions({ headerShown: false });
      loadConversation();
    } else {
      navigation.setOptions({ headerShown: false });
      loadContacts();
    }
  }, [otherUserId]);

  const markConversationAsRead = async (conversationMessages) => {
    const unreadIncomingMessages = (conversationMessages || []).filter(
      (message) =>
        String(message.recipient_id) === String(user?.userId) && !message.is_read
    );

    if (!unreadIncomingMessages.length) return;

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        unreadIncomingMessages.some((unreadMessage) => unreadMessage.id === message.id)
          ? {
              ...message,
              is_read: true,
              read_at: new Date().toISOString(),
            }
          : message
      )
    );

    await Promise.allSettled(
      unreadIncomingMessages.map((message) => messagesApi.markAsRead(message.id))
    );
  };

  const loadConversation = async () => {
    setLoading(true);
    try {
      const resp = await messagesApi.getConversation(otherUserId);
      if (!resp.ok || !resp.data) {
        Alert.alert("Error", "Could not load conversation.");
        return;
      }
      const conversationMessages = resp.data.data || resp.data;
      setMessages(conversationMessages);
      markConversationAsRead(conversationMessages);
      setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 200);
    } catch (error) {
      if (__DEV__) console.error(error);
      Alert.alert("Error", "Could not load conversation.");
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      const resp = await messagesApi.getThreads();
      const contactsArr = (resp && resp.data && (resp.data.data || resp.data)) || [];

      setContacts(
        contactsArr.map((contact) => ({
          ...contact,
          avatar: contact.avatar,
        }))
      );
    } catch (err) {
      if (__DEV__) console.error(err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      content: text.trim(),
      createdAt: new Date().toISOString(),
      sender_id: user?.userId,
      recipient_id: otherUserId,
      is_read: false,
      read_at: null,
      sender: { id: user?.userId, name: user?.firstName || user?.name, avatar: user?.avatar },
    };
    
    setMessages((m) => [...m, tempMessage]);
    setText("");
    setTimeout(() => flatRef.current?.scrollToEnd?.({ animated: true }), 100);

    try {
      const resp = await messagesApi.createMessage({
        recipientId: otherUserId,
        content: text.trim(),
      });
      if (!resp.ok) {
        setMessages((m) => m.filter((x) => x.id !== tempId));
        Alert.alert("Failed", "Could not send message");
        return;
      }

      const created = resp.data?.data || resp.data;
      setMessages((m) => m.map((x) => (x.id === tempId ? created : x)));
    } catch (error) {
      setMessages((m) => m.filter((x) => x.id !== tempId));
      Alert.alert("Error", "Failed to send message");
    }
  };

  const renderMessage = ({ item, index }) => {
    const isSender = String(item.sender?.id || item.sender_id || item.actor?.id || item.actor_id) === String(user?.userId);
    return <AnimatedMessage item={item} isSender={isSender} index={index} />;
  };

  const renderContact = ({ item, index }) => {
    return (
      <AnimatedContactCard
        item={item}
        index={index}
        onPress={() => navigation.navigate('Conversation', { 
          otherUserId: item.id, 
          otherUserName: item.name 
        })}
      />
    );
  };

  // Empty State Component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={["rgba(0, 77, 79, 0.08)", "rgba(26, 159, 161, 0.08)"]}
        style={styles.emptyIconCircle}
      >
        <MaterialCommunityIcons name="chat-outline" size={50} color={palette.primary} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>No messages yet</Text>
      <Text style={styles.emptyText}>
        Start a conversation by messaging a seller about their listing
      </Text>
    </View>
  );

  // If no otherUserId, show contacts list
  if (!otherUserId) {
    const filteredContacts = contacts.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      (c.lastMessage || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
      <View style={[styles.screen, { backgroundColor: palette.background }]}>
        <CustomHeader
          title="Messages"
          onBack={() => navigation.goBack()}
          onSearch={() => {}}
          searchQuery={search}
          setSearchQuery={setSearch}
        />
        
        <FlatList
          data={filteredContacts}
          renderItem={renderContact}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contactsContainer}
          showsVerticalScrollIndicator={false}
          onRefresh={loadContacts}
          refreshing={loading}
          ListEmptyComponent={!loading && EmptyState}
        />
      </View>
    );
  }

  // Conversation view
  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <CustomHeader
        title={otherUserName || "Conversation"}
        onBack={() => navigation.goBack()}
        onSearch={() => {}}
        searchQuery=""
        setSearchQuery={() => {}}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.messagesContainer}
          onRefresh={loadConversation}
          refreshing={loading}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading && (
            <View style={styles.emptyMessages}>
              <MaterialCommunityIcons name="message-text-outline" size={50} color={palette.textMuted} />
              <Text style={styles.emptyMessagesText}>No messages yet</Text>
              <Text style={styles.emptyMessagesSubtext}>Send a message to start the conversation</Text>
            </View>
          )}
        />

        <View style={styles.composerContainer}>
          <View style={styles.composer}>
            <TouchableOpacity style={styles.attachButton}>
              <MaterialCommunityIcons name="attachment" size={24} color={palette.primary} />
            </TouchableOpacity>
            
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder={`Message ${otherUserName || 'seller'}`}
              placeholderTextColor={palette.textMuted}
              style={styles.input}
              multiline
              maxLength={500}
            />
            
            <TouchableOpacity 
              onPress={sendMessage} 
              style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
              disabled={!text.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[palette.gradientStart, palette.gradientEnd]}
                style={styles.sendGradient}
              >
                <MaterialCommunityIcons name="send" size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  headerBlur: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 12,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    color: palette.textPrimary,
  },
  cancelText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  contactsContainer: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: palette.surface,
    padding: 14,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: palette.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 4,
  },
  contactPreview: {
    fontSize: 13,
    color: palette.textSecondary,
  },
  contactRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  contactTime: {
    fontSize: 11,
    color: palette.textMuted,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.primary,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
    gap: 8,
  },
  rowLeft: {
    justifyContent: "flex-start",
  },
  rowRight: {
    justifyContent: "flex-end",
  },
  messageAvatar: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: palette.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  bubbleLeft: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: palette.border,
  },
  bubbleRight: {
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: palette.textPrimary,
    lineHeight: 20,
  },
  messageTextRight: {
    color: "#FFF",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
    color: palette.textMuted,
  },
  timeTextRight: {
    color: "rgba(255,255,255,0.7)",
  },
  readReceipt: {
    marginLeft: 2,
  },
  composerContainer: {
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${palette.primary}10`,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: palette.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.textPrimary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: palette.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  emptyMessages: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyMessagesText: {
    fontSize: 18,
    fontWeight: "600",
    color: palette.textSecondary,
    marginTop: 16,
  },
  emptyMessagesSubtext: {
    fontSize: 14,
    color: palette.textMuted,
    marginTop: 8,
    textAlign: "center",
  },
});

export default ConversationScreen;