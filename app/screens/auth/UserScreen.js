import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Image,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Platform,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

import {
  ErrorMessage,
  Form,
  FormField,
  SubmitButton,
} from "../../components/forms";
import ActivityIndicator from "../../components/ActivityIndicator";
import useAuth from "../../auth/useAuth";
import AppText from "../../components/Text";
import colors from "../../config/colors";
import useTheme from "../../hooks/useTheme";
import AwesomeAlert from "react-native-awesome-alerts";
import routes from "../../navigation/routes";

import usersApi from "../../api/users";
import UploadScreen from "../outhers/UploadScreen";

const { width } = Dimensions.get('window');

const validationSchema = (t) => Yup.object().shape({
  name: Yup.string().required().label(t('user_screen.name')),
  email: Yup.string().required().email().label(t('user_screen.email')),
  phone: Yup.string().label(t('user_screen.phone')),
  address: Yup.string().label(t('user_screen.address')),
});

function EditProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user: authUser, updateUser, logOut } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const [avatar, setAvatar] = useState(authUser?.avatar);
  const [progress, setProgress] = useState(0);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [user, setUser] = useState(null);
  
  // Animation values - FIXED: removed .start() from creation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  const [sweetAlert, setSweetAlert] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
    showCancel: false,
    onConfirm: null,
  });

  // Animate on mount - FIXED: properly start animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeSweetAlert = () => {
    setSweetAlert((prev) => ({
      ...prev,
      show: false,
      onConfirm: null,
      showCancel: false,
    }));
  };

  const showSweetAlert = ({
    title,
    message,
    type = "info",
    showCancel = false,
    onConfirm = null,
  }) => {
    setSweetAlert({
      show: true,
      title,
      message,
      type,
      showCancel,
      onConfirm,
    });
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) setLoading(true);
      const response = await usersApi.getUserInfo(authUser?.userId);
      if (response.ok) {
        setUser(response.data);
        return response.data;
      }      
      return null;
    } catch (error) {
      console.error("Error loading user profile:", error);
      return null;
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserProfile({ showLoader: false });
    setRefreshing(false);
  };

  const pickAvatarImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(t('user_screen.permission_required'), t('user_screen.photo_permission_message'));
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
      });

      if (!pickerResult.canceled && pickerResult.assets?.length) {
        setAvatar(pickerResult.assets[0].uri);
      }
    } catch (pickerError) {
      console.error("Error picking avatar image:", pickerError);
      Alert.alert(t('common.error'), t('user_screen.select_image_error'));
    }
  };

  const handleAvatarAction = () => {
    Alert.alert(t('user_screen.profile_photo'), t('user_screen.update_photo_prompt'), [
      {
        text: t('user_screen.choose_gallery'),
        onPress: () => pickAvatarImage(),
      },
      ...(avatar
        ? [
            {
              text: t('user_screen.remove_photo'),
              style: "destructive",
              onPress: () => handleDeleteAvatar(),
            },
          ]
        : []),
      {
        text: t('common.cancel'),
        style: "cancel",
      },
    ]);
  };

  const handleSubmit = async (userInfo) => {
    setLoading(true);
    setError(null);
    setProgress(0);
    setUploadVisible(true);

    try {
      const formData = new FormData();
      formData.append("name", userInfo.name);
      formData.append("email", userInfo.email);
      formData.append("phone", userInfo.phone);
      formData.append("address", userInfo.address);

      if (avatar && avatar !== authUser?.avatar) {
        const uriParts = avatar.split(".");
        const fileType = uriParts[uriParts.length - 1];
        formData.append("avatar", {
          uri: avatar,
          name: `avatar_${authUser?.userId}.${fileType}`,
          type: `image/${fileType}`,
        });
      }

      const response = await usersApi.updateUserInfo(
        authUser?.userId,
        formData,
        (progress) => setProgress(progress)
      );

      if (!response.ok) {
        setError(
          response.data?.error ||
            "An error occurred while updating your profile."
        );
        return;
      }

      const latestProfile = await loadUserProfile({ showLoader: false });
      const syncedProfile = latestProfile || response.data;

      updateUser((prevUser) => ({
        ...prevUser,
        name: syncedProfile.name,
        email: syncedProfile.email,
        phone: syncedProfile.phone,
        address: syncedProfile.address,
        avatar: syncedProfile.avatar,
        is_verified: syncedProfile.is_verified,
        is_email_verified: syncedProfile.is_email_verified,
      }));

      setUser((prev) => ({
        ...prev,
        ...syncedProfile,
      }));
      setAvatar(syncedProfile.avatar || null);

      showSweetAlert({
        title: t('user_screen.success_title'),
        message: t('user_screen.profile_updated'),
        type: "success",
      });
    } catch (err) {
      console.error("Error during request:", err);
      showSweetAlert({
        title: t('user_screen.error_title'),
        message: t('user_screen.network_error'),
        type: "danger",
      });
    } finally {
      setUploadVisible(false);
      setLoading(false);
      setAvatar((prev) => (prev === undefined ? authUser?.avatar : prev));
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await usersApi.deleteUserAvatar(authUser?.userId);
      updateUser((prevUser) => ({ ...prevUser, avatar: null }));
      setAvatar(null);
      showSweetAlert({
        title: t('common.success'),
        message: t('user_screen.avatar_deleted'),
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting avatar:", error.message);
      showSweetAlert({
        title: t('common.error'),
        message: t('user_screen.delete_avatar_failed'),
        type: "danger",
      });
    }
  };

  // Stats cards data
  const statsData = [
    { label: t('user_screen.listings'), value: user?.listings_count || 0, icon: "format-list-bulleted", color: "#4CAF50" },
    { label: t('user_screen.sales'), value: user?.sales_count || 0, icon: "cash-multiple", color: "#2196F3" },
    { label: t('user_screen.member_since'), value: user?.member_since || "2024", icon: "calendar", color: "#9C27B0" },
  ];

  return (
    <>
      <ActivityIndicator visible={loading} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[styles.container, { backgroundColor: themeColors?.background || colors.background }]}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            <UploadScreen
              visible={uploadVisible}
              progress={progress}
              onDone={() => setUploadVisible(false)}
            />

            {/* Header with Gradient */}
            <LinearGradient
              colors={isDark ? ['#1a1a2e', '#16213e'] : [themeColors?.primary , themeColors?.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <Animated.View style={[
                styles.headerContent,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>{t('user_screen.edit_profile')}</AppText>
                <View style={{ width: 40 }} />
              </Animated.View>
            </LinearGradient>

            {/* Avatar Section - Modern Design */}
            <Animated.View style={[
              styles.avatarSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}>
              <TouchableOpacity
                style={styles.avatarContainer}
                activeOpacity={0.85}
                onPress={handleAvatarAction}
              >
                {avatar !== null ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                ) : (
                  <LinearGradient
                    colors={[themeColors?.secondary, themeColors?.secondary]}
                    style={styles.avatarPlaceholder}
                  >
                    <MaterialCommunityIcons name="account" size={60} color="#FFF" />
                  </LinearGradient>
                )}
                <LinearGradient
                  colors={[themeColors?.primary, themeColors?.secondary]}
                  style={styles.avatarEditBadge}
                >
                  <MaterialCommunityIcons name="camera" size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
              
              <AppText style={styles.userName}>
                {user?.name || authUser?.name || t('common.user')}
              </AppText>
              <View style={styles.verificationBadge}>
                <MaterialCommunityIcons 
                  name={user?.is_verified ? "check-circle" : "clock-outline"} 
                  size={16} 
                  color={user?.is_verified ? "#4CAF50" : "#FFC107"} 
                />
                <AppText style={styles.verificationText}>
                  {user?.is_verified ? t('user_screen.verified_account') : t('user_screen.pending_verification')}
                </AppText>
              </View>
            </Animated.View>

            {/* Stats Cards */}
            <Animated.View style={[
              styles.statsContainer,
              { opacity: fadeAnim }
            ]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {statsData.map((stat, index) => (
                  <View key={`stat-${stat.label || index}`} style={[styles.statCard, { backgroundColor: themeColors?.surface || colors.white }]}>
                    <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                      <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color} />
                    </View>
                    <AppText style={styles.statValue}>{stat.value}</AppText>
                    <AppText style={styles.statLabel}>{stat.label}</AppText>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>

            {/* Edit Form Section */}
            <Animated.View style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}>
              <View style={[styles.sectionCard, { backgroundColor: themeColors?.surface || colors.white }]}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="account-edit" size={24} color={themeColors?.primary || colors.primary} />
                  <AppText style={styles.sectionTitle}>{t('user_screen.personal_information')}</AppText>
                </View>
                
                <Form
                  initialValues={{
                    name: user?.name || authUser?.name || "",
                    email: user?.email || authUser?.email || "",
                    phone: user?.phone || "",
                    address: user?.address || "",
                  }}
                  key={`profile-${user?.id || authUser?.userId || "user"}`}
                  onSubmit={handleSubmit}
                  validationSchema={validationSchema(t)}
                >
                  <ErrorMessage error={error} visible={!!error} />

                  <FormField
                    autoCorrect={false}
                    icon="account"
                    name="name"
                    placeholder={t('user_screen.full_name')}
                  />

                  <FormField
                    autoCapitalize="none"
                    autoCorrect={false}
                    icon="email"
                    keyboardType="email-address"
                    name="email"
                    placeholder={t('user_screen.email_address')}
                    textContentType="emailAddress"
                  />

                  <FormField
                    autoCapitalize="none"
                    autoCorrect={false}
                    icon="phone"
                    keyboardType="phone-pad"
                    name="phone"
                    placeholder={t('user_screen.phone_number')}
                    textContentType="telephoneNumber"
                  />

                  <FormField
                    autoCapitalize="none"
                    autoCorrect={true}
                    icon="map-marker"
                    name="address"
                    placeholder={t('user_screen.address')}
                    textContentType="streetAddress"
                  />

                  <SubmitButton title={t('user_screen.save_changes')} />
                </Form>
              </View>
            </Animated.View>

            {/* Account Information Section */}
            <Animated.View style={[
              styles.accountSection,
              { opacity: fadeAnim }
            ]}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="security" size={22} color={themeColors?.primary || colors.primary} />
                <AppText style={styles.sectionTitle}>{t('user_screen.account_security')}</AppText>
              </View>
              
              <View style={[styles.sectionCard, { backgroundColor: themeColors?.surface || colors.white }]}>
                <TouchableOpacity
                  style={styles.accountRow}
                  onPress={() => navigation.navigate(routes.PRIVACY)}
                >
                  <View style={styles.rowLeft}>
                    <MaterialCommunityIcons name="shield-account" size={22} color={colors.primary} />
                    <AppText style={styles.rowLabel}>{t('user_screen.security_settings')}</AppText>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={colors.medium} />
                </TouchableOpacity>

                {!user?.is_email_verified ? (
                  <TouchableOpacity
                    style={styles.accountRow}
                    onPress={() =>
                      navigation.navigate(routes.VERIFY_EMAIL, {
                        email: user?.email || authUser?.email || "",
                      })
                    }
                  >
                    <View style={styles.rowLeft}>
                      <MaterialCommunityIcons name="email-check-outline" size={22} color={colors.primary} />
                      <AppText style={styles.rowLabel}>{t('user_screen.verify_email')}</AppText>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={22} color={colors.medium} />
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity style={styles.accountRow} onPress={() => navigation.navigate(routes.HELP)}>
                  <View style={styles.rowLeft}>
                    <MaterialCommunityIcons name="eye" size={22} color={colors.primary} />
                    <AppText style={styles.rowLabel}>{t('user_screen.privacy_support')}</AppText>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={colors.medium} />
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Danger Zone - Logout */}
            <Animated.View style={[
              styles.dangerSection,
              { opacity: fadeAnim }
            ]}>
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={() => {
                  Alert.alert(
                    t('user_screen.logout'),
                    t('user_screen.logout_confirm'),
                    [
                      { text: t('common.cancel'), style: "cancel" },
                      { text: t('user_screen.logout'), onPress: () => logOut(), style: "destructive" }
                    ]
                  );
                }}
              >
                <MaterialCommunityIcons name="logout" size={22} color={colors.danger} />
                <AppText style={styles.logoutText}>{t('user_screen.logout')}</AppText>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <AwesomeAlert
        show={sweetAlert.show}
        showProgress={false}
        title={sweetAlert.title}
        message={sweetAlert.message}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showCancelButton={sweetAlert.showCancel}
        showConfirmButton={true}
        cancelText="Cancel"
        confirmText={sweetAlert.showCancel ? "Confirm" : "OK"}
        confirmButtonColor={
          sweetAlert.type === "danger"
            ? colors.danger
            : sweetAlert.type === "warning"
            ? colors.warning
            : colors.primary
        }
        cancelButtonColor={colors.mediumGray}
        onCancelPressed={closeSweetAlert}
        onConfirmPressed={async () => {
          const callback = sweetAlert.onConfirm;
          closeSweetAlert();
          if (callback) await callback();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  headerGradient: {
    height: 200,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: -60,
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
    color: "#000",
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 20,
  },
  verificationText: {
    fontSize: 12,
    color: "#666",
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: 100,
    padding: 12,
    borderRadius: 16,
    marginRight: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  formSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  accountSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dangerSection: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  sectionCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  accountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: {
    fontSize: 15,
    color: "#000",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFE5E5",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.danger,
  },
});

export default EditProfileScreen;