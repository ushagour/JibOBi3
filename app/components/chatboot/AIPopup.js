import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import assistantApi from '../../api/assistant';
import colors from '../../config/colors';

const AIPopup = ({ visible, onClose, user, onNavigate }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation when popup appears
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Welcome message if first time
      if (messages.length === 0) {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          text: `Hi ${user?.name || 'there'}! I can now answer using your real Jibobi account activity. Ask about your orders, unread messages, listings, wishlist, or notifications.`,
          timestamp: new Date(),
        }]);
      }
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages
        .concat(userMessage)
        .slice(-10)
        .map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.text,
        }));

      const response = await assistantApi.chat(conversationHistory, {
        userName: user?.name,
        userId: user?.id,
        currentScreen: 'Assistant',
        entryPoint: 'AIPopup',
      });
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.data.reply,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "I'm having trouble connecting. Please try again in a moment.",
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Orders', icon: 'cart-outline', prompt: 'Summarize my recent orders and tell me if any need attention.' },
    { label: 'Messages', icon: 'message-text-outline', prompt: 'Do I have unread messages or new conversations to reply to?' },
    { label: 'Listings', icon: 'view-grid-outline', prompt: 'Review my latest listings and tell me which ones may need action.' },
    { label: 'Notifications', icon: 'bell-outline', prompt: 'What are my latest notifications and which ones are still unread?' },
  ];

  const animatedStyle = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [600, 0],
        }),
      },
    ],
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <Animated.View style={[styles.container, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.aiIconContainer}>
                <MaterialCommunityIcons name="robot" size={24} color={colors.white} />
              </View>
              <View>
                <Text style={styles.title}>AI Assistant</Text>
                <Text style={styles.subtitle}>Powered by Gemini</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.quickActions}
          >
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionChip}
                onPress={() => setInputText(action.prompt)}
              >
                <MaterialCommunityIcons name={action.icon} size={16} color={colors.primary} />
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageRow,
                  message.role === 'user' ? styles.userRow : styles.assistantRow,
                ]}
              >
                {message.role === 'assistant' && (
                  <View style={styles.avatarContainer}>
                    <MaterialCommunityIcons name="robot-outline" size={28} color={colors.primary} />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                    message.isError && styles.errorBubble,
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    message.role === 'user' && styles.userText,
                  ]}>
                    {message.text}
                  </Text>
                  <Text style={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                {message.role === 'user' && (
                  <View style={styles.userAvatar}>
                    <MaterialCommunityIcons name="account" size={28} color={colors.white} />
                  </View>
                )}
              </View>
            ))}
            
            {isLoading && (
              <View style={[styles.messageRow, styles.assistantRow]}>
                <View style={styles.avatarContainer}>
                  <MaterialCommunityIcons name="robot-outline" size={28} color={colors.primary} />
                </View>
                <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.typingText}>AI is thinking...</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about your marketplace..."
              placeholderTextColor={colors.textTertiary}
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.disabledButton]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <MaterialCommunityIcons name="send" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardWrap: {
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
    maxHeight: 700,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  closeButton: {
    padding: 8,
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxHeight: 60,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.lighterGray,
    borderRadius: 20,
    marginRight: 10,
  },
  actionText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.infoLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.lighterGray,
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: colors.dangerLight,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  userText: {
    color: colors.white,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.lighterGray,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.lightGray,
  },
});

export default AIPopup;