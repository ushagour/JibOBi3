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
    interpolation: {
      escapeValue: false,
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
