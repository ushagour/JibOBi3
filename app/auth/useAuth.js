import { useContext } from "react";
import { jwtDecode } from "jwt-decode";
import AuthContext from "./context";
import authStorage from "./storage";

const useAuth = () => {
  const { user, setUser } = useContext(AuthContext);

  const logIn = (authToken, userData) => {
    try {
      // Handle both string token and response object formats
      let token = authToken;
      if (typeof authToken === 'object' && authToken.token) {
        token = authToken.token;
      }
      
      // Use provided userData or decode from token
      const user = userData || jwtDecode(token);
      authStorage.storeToken(token);
      authStorage.storeUserProfile(user);
      setUser(user);
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  };

  const signUp = (authToken, user) => {
    try {
      if (authToken) {
        authStorage.storeToken(authToken);
      }
      if (user) {
        authStorage.storeUserProfile(user);
      }
      setUser(user);
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  };

  const logOut = () => {
    setUser(null);
    authStorage.removeToken();
  };

  const continueAsGuest = () => {
    setUser({
      isGuest: true,
      name: "Guest",
    });
  };

  const isLoggedIn = () => !!user?.userId;
  const isGuest = () => !!user?.isGuest;

  const isOwner = (owner) => user?.userId === owner;

  // Support both value and function form for updateUser
  const updateUser = (updater) => {
    if (typeof updater === 'function') {
      setUser((prevUser) => {
        const nextUser = updater(prevUser);
        authStorage.storeUserProfile(nextUser);
        return nextUser;
      });
    } else {
      authStorage.storeUserProfile(updater);
      setUser(updater);
    }
  };

  return {
    user,
    logIn,
    signUp,
    logOut,
    continueAsGuest,
    isOwner,
    isLoggedIn,
    isGuest,
    updateUser,
  };
};

export default useAuth;
