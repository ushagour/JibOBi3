import { useContext } from "react";
import { jwtDecode } from "jwt-decode";
import AuthContext from "./context";
import authStorage from "./storage";

const useAuth = () => {
  const { user, setUser } = useContext(AuthContext);

  const logIn = (authToken) => {
    try {
      const user = jwtDecode(authToken);
      authStorage.storeToken(authToken);
      setUser(user);
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  };

  const signUp = (authToken, user) => {
    try {
      authStorage.storeToken(authToken);
      setUser(user);
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  };

  const logOut = () => {
    setUser(null);
    authStorage.removeToken();
  };

  const isLoggedIn = () => !!user;

  const isOwner = (owner) => user?.userId === owner;

  return {
    user,
    logIn,
    signUp,
    logOut,
    isOwner,
    isLoggedIn,
    updateUser: (user) => setUser(user),
  };
};

export default useAuth;
