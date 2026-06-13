import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translation resources (inline)
const resources = {
  en: {
    translation: {
      common: {
        welcome: "Welcome",
        home: "Home",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
        login: "Login",
        signup: "Sign Up",
        email: "Email",
        password: "Password",
        confirm_password: "Confirm Password",
        submit: "Submit",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        search: "Search",
        no_results: "No results found",
        back: "Back",
        next: "Next",
        skip: "Skip",
        done: "Done"
      },
      navigation: {
        home: "Home",
        explore: "Explore",
        profile: "Profile",
        more: "More"
      },
      auth: {
        welcome_back: "Welcome Back",
        new_user: "New User?",
        already_have_account: "Already have an account?",
        forgot_password: "Forgot Password?",
        reset_password: "Reset Password",
        password_reset_sent: "Password reset link sent to your email",
        invalid_credentials: "Invalid email or password",
        email_already_exists: "Email already exists"
      },
      errors: {
        network_error: "Network error. Please check your connection.",
        something_went_wrong: "Something went wrong. Please try again.",
        validation_error: "Please check your input and try again"
      },
      language: {
        select: "Select Language",
        english: "English",
        french: "Français"
      }
      ,
      settings: {
        manage_preferences: "Manage your preferences and app behavior.",
        dark_mode: "Dark Mode",
        dark_mode_subtitle: "Switch to dark theme",
        language: "Language",
        language_subtitle: "Switch between English and French",
        notifications: "Notifications",
        notifications_subtitle: "Manage what alerts you receive",
        push_notifications: "Push Notifications",
        push_notifications_subtitle: "Enable all notifications",
        messages: "Messages",
        messages_subtitle: "Buyer/seller messages",
        reviews: "Reviews",
        reviews_subtitle: "New reviews on your listings",
        orders: "Orders",
        orders_subtitle: "New orders and updates",
        marketing: "Marketing",
        marketing_subtitle: "Promotions and updates"
      },
      dashboard: {
        title: "Dashboard",
        stats: "Statistics",
        recent_activity: "Recent activity",
      },
      notifications: {
        title: "Notifications",
        no_new: "No new notifications",
        mark_all_read: "Mark all as read"
      },
      listings: {
        create: "Create Listing",
        edit: "Edit Listing",
        price: "Price",
        category: "Category"
      },
      orders: {
        title: "Orders",
        status: "Status",
        total: "Total"
      },
      users: {
        name: "Name",
        role: "Role",
        manage: "Manage Users"
      },
      account: {
        profile: "Profile",
        settings: "Settings",
        billing: "Billing"
      },
      welcome_screen: {
        title: "Buy and Sell Easily",
        subtitle: "Discover great deals near you",
        continue_as_guest: "Continue as Guest",
        tagline: "Sell What You Don't Need!",
        active_listings: "{{count}}+ Active Listings",
        copyright: "© 2026 Jib w'Bie3. All rights reserved."
      },
      auth_screens: {
        create_account: "Create Account",
        sign_in: "Sign In",
        full_name: "Full Name",
        phone_number: "Phone Number",
        confirm: "Confirm",
        request_reset: "Request Reset",
        reset_token: "Reset Token",
        new_password: "New Password",
        resend: "Resend",
        sign_out: "Sign Out",
        guest_mode: "Guest Mode",
        exit_guest_mode: "Exit Guest Mode",
        login_failed_title: "Login Failed",
        coming_soon: "Coming Soon",
        social_login_soon: "{{platform}} login will be available soon!",
        social_register_soon: "{{platform}} registration will be available soon!",
        enter_email: "Enter your email",
        enter_password: "Enter your password",
        or_continue_with: "Or continue with",
        accept_terms_required: "Please agree to the Terms & Conditions to continue.",
        no_server_response: "No response from the server. Please try again later.",
        registration_failed: "Registration Failed",
        account_created: "Your account has been created successfully.",
        registration_error: "An error occurred during registration.",
        enter_full_name: "Enter your full name",
        create_password: "Create a password",
        password_min_length: "Password must be at least 6 characters",
        i_agree_to: "I agree to the",
        terms_of_service: "Terms of Service",
        and: "and",
        privacy_policy: "Privacy Policy",
        or_sign_up_with: "Or sign up with",
        email_required: "Email required",
        enter_email_address: "Please enter your email address.",
        request_failed: "Request failed",
        unable_generate_reset_token: "Unable to generate a reset token.",
        reset_token_generated: "Reset token generated",
        use_token_instruction: "Use the token shown on this screen to reset your password.",
        unable_request_reset_token: "Unable to request a reset token right now.",
        fill_all_fields_before_reset: "Fill in all fields before resetting your password.",
        new_password_mismatch: "The new password and confirmation do not match.",
        reset_failed: "Reset failed",
        unable_reset_password: "Unable to reset password.",
        password_updated: "Your password has been updated.",
        back_to_login: "Back to login",
        unable_reset_password_now: "Unable to reset password right now.",
        forgot_password_subtitle: "Request a reset token, then use it to set a new password.",
        email_address: "Email Address",
        send_reset_token: "Send Reset Token",
        paste_token: "Paste the token here",
        enter_new_password: "Enter a new password",
        confirm_new_password: "Confirm your new password"
      },
      account_screen: {
        my_account: "My Account",
        my_listings: "My Listings",
        favorites: "Favorites",
        messages: "Messages",
        notifications: "Notifications",
        help_support: "Help & Support",
        privacy_security: "Privacy & Security",
        shipping_addresses: "Shipping Addresses"
      },
      listing_form: {
        title: "Title",
        description: "Description",
        images: "Images",
        add_photos: "Add Photos",
        select_category: "Select Category",
        enter_price: "Enter price",
        publish: "Publish",
        update: "Update Listing",
        missing_title: "Please enter a title.",
        missing_price: "Please enter a price.",
        missing_category: "Please select a category.",
        missing_images: "Please select at least one image.",
        location_required: "Please enable location services to publish."
      },
      listing_details: {
        contact_seller: "Contact Seller",
        send_message: "Send Message",
        place_order: "Place Order",
        call_seller: "Call Seller",
        email_seller: "Email Seller",
        whatsapp_seller: "WhatsApp Seller",
        close_listing: "Close Listing",
        reopen_listing: "Reopen Listing",
        unavailable: "This item is unavailable",
        sold: "Sold",
        active: "Active",
        archived: "Archived"
      },
      orders_flow: {
        checkout: "Checkout",
        shipping_address: "Shipping Address",
        terms_and_conditions: "Terms and Conditions",
        place_order: "Place Order",
        order_placed: "Order placed",
        order_failed: "Order failed",
        status_pending: "Pending",
        status_confirmed: "Confirmed",
        status_shipped: "Shipped",
        status_delivered: "Delivered",
        status_cancelled: "Cancelled",
        close_order: "Close Order",
        report_order: "Report Order"
      },
      messages_flow: {
        inbox: "Inbox",
        conversation: "Conversation",
        type_message: "Type a message...",
        send: "Send",
        no_messages: "No messages yet",
        failed_to_send: "Failed to send message",
        failed_to_load: "Could not load conversation"
      },
      alerts: {
        sign_in_required: "Please sign in to continue.",
        not_allowed: "You are not allowed to do this action.",
        permission_denied: "Permission denied",
        missing_information: "Fill in all required fields.",
        password_mismatch: "Passwords do not match.",
        request_failed: "Request failed. Please try again.",
        no_phone: "Phone number is not available.",
        no_email: "Email address is not available.",
        app_unavailable: "This feature is unavailable on your device."
      },
      reviews_flow: {
        add_review: "Add Review",
        rating: "Rating",
        comment: "Comment",
        submit_review: "Submit Review",
        review_posted: "Your review has been posted.",
        delete_review: "Delete Review",
        confirm_delete_review: "Are you sure you want to delete this review?"
      }
    }
  },
  fr: {
    translation: {
      common: {
        welcome: "Bienvenue",
        home: "Accueil",
        profile: "Profil",
        settings: "Paramètres",
        logout: "Déconnexion",
        login: "Connexion",
        signup: "S'inscrire",
        email: "E-mail",
        password: "Mot de passe",
        confirm_password: "Confirmer le mot de passe",
        submit: "Soumettre",
        cancel: "Annuler",
        save: "Enregistrer",
        delete: "Supprimer",
        edit: "Modifier",
        loading: "Chargement...",
        error: "Erreur",
        success: "Succès",
        search: "Rechercher",
        no_results: "Aucun résultat trouvé",
        back: "Retour",
        next: "Suivant",
        skip: "Ignorer",
        done: "Terminé"
      },
      navigation: {
        home: "Accueil",
        explore: "Explorer",
        profile: "Profil",
        more: "Plus"
      },
      auth: {
        welcome_back: "Bienvenue",
        new_user: "Nouvel utilisateur?",
        already_have_account: "Vous avez déjà un compte?",
        forgot_password: "Mot de passe oublié?",
        reset_password: "Réinitialiser le mot de passe",
        password_reset_sent: "Lien de réinitialisation envoyé à votre e-mail",
        invalid_credentials: "E-mail ou mot de passe invalide",
        email_already_exists: "Cet e-mail existe déjà"
      },
      errors: {
        network_error: "Erreur réseau. Vérifiez votre connexion.",
        something_went_wrong: "Quelque chose s'est mal passé. Réessayez.",
        validation_error: "Veuillez vérifier votre saisie et réessayer"
      },
      language: {
        select: "Sélectionner la langue",
        english: "English",
        french: "Français"
      }
      ,
      settings: {
        manage_preferences: "Gérez vos préférences et le comportement de l'application.",
        dark_mode: "Mode sombre",
        dark_mode_subtitle: "Passer au thème sombre",
        language: "Langue",
        language_subtitle: "Basculer entre l'anglais et le français",
        notifications: "Notifications",
        notifications_subtitle: "Gérez les alertes que vous recevez",
        push_notifications: "Notifications push",
        push_notifications_subtitle: "Activer toutes les notifications",
        messages: "Messages",
        messages_subtitle: "Messages acheteur/vendeur",
        reviews: "Avis",
        reviews_subtitle: "Nouveaux avis sur vos annonces",
        orders: "Commandes",
        orders_subtitle: "Nouvelles commandes et mises à jour",
        marketing: "Marketing",
        marketing_subtitle: "Promotions et actualités"
      },
      dashboard: {
        title: "Tableau de bord",
        stats: "Statistiques",
        recent_activity: "Activité récente",
      },
      notifications: {
        title: "Notifications",
        no_new: "Pas de nouvelles notifications",
        mark_all_read: "Marquer toutes lues"
      },
      listings: {
        create: "Créer une annonce",
        edit: "Modifier l'annonce",
        price: "Prix",
        category: "Catégorie"
      },
      orders: {
        title: "Commandes",
        status: "Statut",
        total: "Total"
      },
      users: {
        name: "Nom",
        role: "Rôle",
        manage: "Gérer les utilisateurs"
      },
      account: {
        profile: "Profil",
        settings: "Paramètres",
        billing: "Facturation"
      },
      welcome_screen: {
        title: "Achetez et vendez facilement",
        subtitle: "Découvrez de bonnes affaires près de chez vous",
        continue_as_guest: "Continuer en mode invité",
        tagline: "Vendez ce dont vous n'avez pas besoin !",
        active_listings: "{{count}}+ annonces actives",
        copyright: "© 2026 Jib w'Bie3. Tous droits réservés."
      },
      auth_screens: {
        create_account: "Créer un compte",
        sign_in: "Se connecter",
        full_name: "Nom complet",
        phone_number: "Numéro de téléphone",
        confirm: "Confirmer",
        request_reset: "Demander la réinitialisation",
        reset_token: "Jeton de réinitialisation",
        new_password: "Nouveau mot de passe",
        resend: "Renvoyer",
        sign_out: "Se déconnecter",
        guest_mode: "Mode invité",
        exit_guest_mode: "Quitter le mode invité",
        login_failed_title: "Échec de connexion",
        coming_soon: "Bientôt disponible",
        social_login_soon: "La connexion {{platform}} sera bientôt disponible !",
        social_register_soon: "L'inscription {{platform}} sera bientôt disponible !",
        enter_email: "Entrez votre e-mail",
        enter_password: "Entrez votre mot de passe",
        or_continue_with: "Ou continuer avec",
        accept_terms_required: "Veuillez accepter les conditions générales pour continuer.",
        no_server_response: "Aucune réponse du serveur. Veuillez réessayer plus tard.",
        registration_failed: "Échec de l'inscription",
        account_created: "Votre compte a été créé avec succès.",
        registration_error: "Une erreur est survenue pendant l'inscription.",
        enter_full_name: "Entrez votre nom complet",
        create_password: "Créez un mot de passe",
        password_min_length: "Le mot de passe doit contenir au moins 6 caractères",
        i_agree_to: "J'accepte les",
        terms_of_service: "Conditions d'utilisation",
        and: "et la",
        privacy_policy: "Politique de confidentialité",
        or_sign_up_with: "Ou s'inscrire avec",
        email_required: "E-mail requis",
        enter_email_address: "Veuillez saisir votre adresse e-mail.",
        request_failed: "Échec de la requête",
        unable_generate_reset_token: "Impossible de générer un jeton de réinitialisation.",
        reset_token_generated: "Jeton de réinitialisation généré",
        use_token_instruction: "Utilisez le jeton affiché sur cet écran pour réinitialiser votre mot de passe.",
        unable_request_reset_token: "Impossible de demander un jeton de réinitialisation pour le moment.",
        fill_all_fields_before_reset: "Remplissez tous les champs avant de réinitialiser votre mot de passe.",
        new_password_mismatch: "Le nouveau mot de passe et la confirmation ne correspondent pas.",
        reset_failed: "Échec de la réinitialisation",
        unable_reset_password: "Impossible de réinitialiser le mot de passe.",
        password_updated: "Votre mot de passe a été mis à jour.",
        back_to_login: "Retour à la connexion",
        unable_reset_password_now: "Impossible de réinitialiser le mot de passe pour le moment.",
        forgot_password_subtitle: "Demandez un jeton de réinitialisation, puis utilisez-le pour définir un nouveau mot de passe.",
        email_address: "Adresse e-mail",
        send_reset_token: "Envoyer le jeton",
        paste_token: "Collez le jeton ici",
        enter_new_password: "Entrez un nouveau mot de passe",
        confirm_new_password: "Confirmez votre nouveau mot de passe"
      },
      account_screen: {
        my_account: "Mon compte",
        my_listings: "Mes annonces",
        favorites: "Favoris",
        messages: "Messages",
        notifications: "Notifications",
        help_support: "Aide et support",
        privacy_security: "Confidentialité et sécurité",
        shipping_addresses: "Adresses de livraison"
      },
      listing_form: {
        title: "Titre",
        description: "Description",
        images: "Images",
        add_photos: "Ajouter des photos",
        select_category: "Choisir une catégorie",
        enter_price: "Saisir le prix",
        publish: "Publier",
        update: "Mettre à jour l'annonce",
        missing_title: "Veuillez saisir un titre.",
        missing_price: "Veuillez saisir un prix.",
        missing_category: "Veuillez sélectionner une catégorie.",
        missing_images: "Veuillez sélectionner au moins une image.",
        location_required: "Veuillez activer la localisation pour publier."
      },
      listing_details: {
        contact_seller: "Contacter le vendeur",
        send_message: "Envoyer un message",
        place_order: "Passer commande",
        call_seller: "Appeler le vendeur",
        email_seller: "Envoyer un e-mail",
        whatsapp_seller: "WhatsApp vendeur",
        close_listing: "Clore l'annonce",
        reopen_listing: "Rouvrir l'annonce",
        unavailable: "Cet article n'est pas disponible",
        sold: "Vendu",
        active: "Actif",
        archived: "Archivé"
      },
      orders_flow: {
        checkout: "Paiement",
        shipping_address: "Adresse de livraison",
        terms_and_conditions: "Conditions générales",
        place_order: "Passer la commande",
        order_placed: "Commande passée",
        order_failed: "Échec de la commande",
        status_pending: "En attente",
        status_confirmed: "Confirmée",
        status_shipped: "Expédiée",
        status_delivered: "Livrée",
        status_cancelled: "Annulée",
        close_order: "Clore la commande",
        report_order: "Signaler la commande"
      },
      messages_flow: {
        inbox: "Boîte de réception",
        conversation: "Conversation",
        type_message: "Tapez un message...",
        send: "Envoyer",
        no_messages: "Aucun message pour le moment",
        failed_to_send: "Échec de l'envoi du message",
        failed_to_load: "Impossible de charger la conversation"
      },
      alerts: {
        sign_in_required: "Veuillez vous connecter pour continuer.",
        not_allowed: "Vous n'êtes pas autorisé à effectuer cette action.",
        permission_denied: "Permission refusée",
        missing_information: "Remplissez tous les champs requis.",
        password_mismatch: "Les mots de passe ne correspondent pas.",
        request_failed: "Échec de la requête. Veuillez réessayer.",
        no_phone: "Le numéro de téléphone n'est pas disponible.",
        no_email: "L'adresse e-mail n'est pas disponible.",
        app_unavailable: "Cette fonctionnalité n'est pas disponible sur votre appareil."
      },
      reviews_flow: {
        add_review: "Ajouter un avis",
        rating: "Note",
        comment: "Commentaire",
        submit_review: "Publier l'avis",
        review_posted: "Votre avis a été publié.",
        delete_review: "Supprimer l'avis",
        confirm_delete_review: "Voulez-vous vraiment supprimer cet avis ?"
      }
    }
  }
};

// Language detector for React Native
const languageDetector = {
  type: 'languageDetector',
  async: true,
  init: (reactI18nextOptions, detectionOrder, detectionOptions) => {},
  detect: async (callback) => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      callback('en');
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('en');
    }
  },
  cacheUserLanguage: async (lng) => {
    try {
      await AsyncStorage.setItem('appLanguage', lng);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Helper to change language and persist selection
export const setAppLanguage = async (lng) => {
  try {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem('appLanguage', lng);
  } catch (err) {
    console.error('Failed to set app language', err);
  }
};

export const getAppLanguage = async () => {
  try {
    const lng = await AsyncStorage.getItem('appLanguage');
    return lng || i18n.language || 'en';
  } catch (err) {
    return i18n.language || 'en';
  }
};

export default i18n;
