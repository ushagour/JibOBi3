import { useContext } from "react";
import {jwtDecode} from 'jwt-decode';


import AuthContext from "./context";
import authStorage from "./storage";

export default useAuth = () => {
  const { user, setUser } = useContext(AuthContext);

  const logIn = (authToken) => {
    try {
      // console.log("Logging in with token:", authToken);
      
      // Decode the token to extract user info
      const user = jwtDecode(authToken); // Decode the JWT token
      // console.log("Decoded user:", user);
  
      // Store the token for future use
      authStorage.storeToken(authToken);
      setUser(user); // Assuming setUser is a state function that stores user info
  
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  };


  const signUp = (authToken,user) => {
    try {
      console.log("Logging in with token:", authToken);
      
      authStorage.storeToken(authToken);
      setUser(user); // Assuming setUser is a state function that stores user info
  
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  }
  const logOut = () => {
    setUser(null);
    authStorage.removeToken();
  };
  const isLoggedIn = () => {
    return !!user;


  };

  const isOwner = (owner) => {

  
    
    return user?.userId === owner;
  };

  return { user, logIn,signUp,  logOut,isOwner, isLoggedIn };
};
